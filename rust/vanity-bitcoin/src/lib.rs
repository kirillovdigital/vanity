use bech32::{hrp, segwit};
use k256::{
    AffinePoint, ProjectivePoint, PublicKey, Scalar, SecretKey,
    elliptic_curve::{ops::Reduce, sec1::ToEncodedPoint},
    schnorr::SigningKey as SchnorrSigningKey,
};
use ripemd::Ripemd160;
use sha2::{Digest, Sha256};
use vanity_common::{Candidate, SearchBatchResult, random_secret, run_batch, to_js_value};
use wasm_bindgen::prelude::*;

#[derive(Clone, Copy)]
enum BitcoinAddressType {
    Taproot,
    Segwit,
}

impl BitcoinAddressType {
    fn parse(value: &str) -> Result<Self, String> {
        match value {
            "taproot" => Ok(Self::Taproot),
            "segwit" => Ok(Self::Segwit),
            _ => Err(format!("Unsupported bitcoin address type: {value}")),
        }
    }
}

fn tagged_hash(tag: &str, payload: &[u8]) -> [u8; 32] {
    let tag_hash = Sha256::digest(tag.as_bytes());
    let mut hasher = Sha256::new();

    hasher.update(tag_hash);
    hasher.update(tag_hash);
    hasher.update(payload);

    hasher.finalize().into()
}

fn base58check(payload: &[u8]) -> String {
    let checksum = Sha256::digest(Sha256::digest(payload));
    let mut output = Vec::with_capacity(payload.len() + 4);

    output.extend_from_slice(payload);
    output.extend_from_slice(&checksum[..4]);

    bs58::encode(output).into_string()
}

fn wif_from_secret(secret_bytes: &[u8; 32]) -> String {
    let mut payload = Vec::with_capacity(34);
    payload.push(0x80);
    payload.extend_from_slice(secret_bytes);
    payload.push(0x01);

    base58check(&payload)
}

fn hash160(bytes: &[u8]) -> [u8; 20] {
    let sha = Sha256::digest(bytes);
    let ripemd = Ripemd160::digest(sha);
    ripemd.into()
}

fn segwit_address(secret_key: &SecretKey) -> Result<String, String> {
    let compressed_key = secret_key.public_key().to_encoded_point(true);
    let witness_program = hash160(compressed_key.as_bytes());

    segwit::encode_v0(hrp::BC, &witness_program).map_err(|error| error.to_string())
}

fn taproot_output_key(secret_key: &SecretKey) -> Result<[u8; 32], String> {
    let signing_key = SchnorrSigningKey::from(secret_key);
    let internal_key = signing_key.verifying_key();
    let tweak_hash = tagged_hash("TapTweak", &internal_key.to_bytes());
    let tweak = <Scalar as Reduce<k256::U256>>::reduce_bytes(&tweak_hash.into());
    let internal_point = ProjectivePoint::from(*internal_key.as_affine());
    let output_point = if tweak.is_zero().into() {
        internal_point
    } else {
        internal_point + (ProjectivePoint::GENERATOR * tweak)
    };
    let output_public_key = PublicKey::from_affine(AffinePoint::from(output_point))
        .map_err(|error| error.to_string())?;
    let compressed = output_public_key.to_encoded_point(true);
    let bytes = compressed.as_bytes();
    let mut x_only = [0_u8; 32];

    x_only.copy_from_slice(&bytes[1..33]);

    Ok(x_only)
}

fn taproot_address(secret_key: &SecretKey) -> Result<String, String> {
    let output_key = taproot_output_key(secret_key)?;
    segwit::encode_v1(hrp::BC, &output_key).map_err(|error| error.to_string())
}

fn candidate_from_secret(
    secret_bytes: [u8; 32],
    address_type: BitcoinAddressType,
) -> Result<Candidate, String> {
    let secret_key = SecretKey::from_slice(&secret_bytes).map_err(|error| error.to_string())?;
    let address = match address_type {
        BitcoinAddressType::Segwit => segwit_address(&secret_key)?,
        BitcoinAddressType::Taproot => taproot_address(&secret_key)?,
    };

    Ok(Candidate {
        address,
        secret: wif_from_secret(&secret_bytes),
    })
}

fn random_candidate(address_type: BitcoinAddressType) -> Result<Candidate, String> {
    loop {
        let secret = random_secret()?;

        if let Ok(candidate) = candidate_from_secret(secret, address_type) {
            return Ok(candidate);
        }
    }
}

fn search(
    prefix: &str,
    suffix: &str,
    batch_size: u32,
    address_type: BitcoinAddressType,
) -> Result<SearchBatchResult, String> {
    run_batch(batch_size, || random_candidate(address_type), |address| {
        let body = address
            .strip_prefix("bc1p")
            .or_else(|| address.strip_prefix("bc1q"))
            .unwrap_or(address);

        body.starts_with(prefix) && body.ends_with(suffix)
    })
}

#[wasm_bindgen]
pub fn search_bitcoin_batch(
    prefix: &str,
    suffix: &str,
    batch_size: u32,
    address_type: &str,
) -> Result<JsValue, JsValue> {
    let address_type = BitcoinAddressType::parse(address_type)
        .map_err(|error| JsValue::from_str(&error))?;
    let result = search(prefix, suffix, batch_size, address_type)
        .map_err(|error| JsValue::from_str(&error))?;

    to_js_value(&result)
}

#[cfg(test)]
mod tests {
    use super::{BitcoinAddressType, candidate_from_secret};

    #[test]
    fn derives_known_segwit_address() {
        let candidate =
            candidate_from_secret([1_u8; 32], BitcoinAddressType::Segwit).expect("valid secret");

        assert_eq!(candidate.address, "bc1q0xcqpzrky6eff2g52qdye53xkk9jxkvrh6yhyw");
        assert_eq!(candidate.secret, "KwFfNUhSDaASSAwtG7ssQM1uVX8RgX5GHWnnLfhfiQDigjioWXHH");
    }

    #[test]
    fn derives_known_taproot_address() {
        let candidate =
            candidate_from_secret([1_u8; 32], BitcoinAddressType::Taproot).expect("valid secret");

        assert_eq!(
            candidate.address,
            "bc1p33wm0auhr9kkahzd6l0kqj85af4cswn276hsxg6zpz85xe2r0y8syx4e5t"
        );
    }
}
