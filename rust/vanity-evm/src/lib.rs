use k256::{SecretKey, elliptic_curve::sec1::ToEncodedPoint};
use tiny_keccak::{Hasher, Keccak};
use vanity_common::{Candidate, SearchBatchResult, encode_hex, random_secret, run_batch, to_js_value};
use wasm_bindgen::prelude::*;

fn keccak256(bytes: &[u8]) -> [u8; 32] {
    let mut output = [0_u8; 32];
    let mut hasher = Keccak::v256();
    hasher.update(bytes);
    hasher.finalize(&mut output);
    output
}

fn checksum_address(raw_address: &[u8]) -> String {
    let lower = encode_hex(raw_address);
    let hash = keccak256(lower.as_bytes());
    let mut output = String::with_capacity(42);

    output.push_str("0x");

    for (index, character) in lower.chars().enumerate() {
        if character.is_ascii_digit() {
            output.push(character);
            continue;
        }

        let nibble = if index % 2 == 0 {
            hash[index / 2] >> 4
        } else {
            hash[index / 2] & 0x0f
        };

        if nibble >= 8 {
            output.push(character.to_ascii_uppercase());
        } else {
            output.push(character);
        }
    }

    output
}

fn candidate_from_secret(secret_bytes: [u8; 32]) -> Result<Candidate, String> {
    let secret_key = SecretKey::from_slice(&secret_bytes).map_err(|error| error.to_string())?;
    let encoded_point = secret_key.public_key().to_encoded_point(false);
    let hash = keccak256(&encoded_point.as_bytes()[1..]);
    let address = checksum_address(&hash[12..]);

    Ok(Candidate {
        address,
        secret: format!("0x{}", encode_hex(&secret_bytes)),
    })
}

fn random_candidate() -> Result<Candidate, String> {
    loop {
        let secret = random_secret()?;

        if let Ok(candidate) = candidate_from_secret(secret) {
            return Ok(candidate);
        }
    }
}

fn matches_evm(address: &str, prefix: &str, suffix: &str, checksum_mode: bool) -> bool {
    let body = address.strip_prefix("0x").unwrap_or(address);
    let lowercase = body.to_ascii_lowercase();

    if checksum_mode {
        lowercase.starts_with(&prefix.to_ascii_lowercase())
            && lowercase.ends_with(&suffix.to_ascii_lowercase())
            && body.starts_with(prefix)
            && body.ends_with(suffix)
    } else {
        lowercase.starts_with(prefix) && lowercase.ends_with(suffix)
    }
}

fn search(prefix: &str, suffix: &str, batch_size: u32, checksum_mode: bool) -> Result<SearchBatchResult, String> {
    run_batch(batch_size, random_candidate, |address| {
        matches_evm(address, prefix, suffix, checksum_mode)
    })
}

#[wasm_bindgen]
pub fn search_evm_batch(
    prefix: &str,
    suffix: &str,
    batch_size: u32,
    checksum_mode: bool,
) -> Result<JsValue, JsValue> {
    let result = search(prefix, suffix, batch_size, checksum_mode)
        .map_err(|error| JsValue::from_str(&error))?;

    to_js_value(&result)
}

#[cfg(test)]
mod tests {
    use super::candidate_from_secret;

    #[test]
    fn derives_known_address() {
        let candidate = candidate_from_secret([1_u8; 32]).expect("valid secret");

        assert_eq!(candidate.address, "0x1a642f0E3c3aF545E7AcBD38b07251B3990914F1");
        assert_eq!(
            candidate.secret,
            format!("0x{}", "01".repeat(32))
        );
    }
}
