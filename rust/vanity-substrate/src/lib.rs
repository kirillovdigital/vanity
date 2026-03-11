use blake2::{Blake2b512, Digest};
use schnorrkel::{ExpansionMode, MiniSecretKey};
use vanity_common::{Candidate, SearchBatchResult, encode_hex, random_secret, run_batch, to_js_value};
use wasm_bindgen::prelude::*;

const SS58_PREFIX: &[u8] = b"SS58PRE";

fn ss58_encode(public_key: &[u8; 32], format: u16) -> String {
    let mut payload = Vec::with_capacity(35);

    if format < 64 {
        payload.push(format as u8);
    } else {
        payload.push((((format & 0b0000_0000_1111_1100) >> 2) as u8) | 0b0100_0000);
        payload.push(((format >> 8) as u8) | (((format & 0b0000_0000_0000_0011) as u8) << 6));
    }

    payload.extend_from_slice(public_key);

    let mut hasher = Blake2b512::new();
    hasher.update(SS58_PREFIX);
    hasher.update(&payload);
    let checksum = hasher.finalize();

    payload.extend_from_slice(&checksum[..2]);

    bs58::encode(payload).into_string()
}

fn candidate_from_secret(secret_seed: [u8; 32]) -> Result<Candidate, String> {
    let mini_secret = MiniSecretKey::from_bytes(&secret_seed).map_err(|error| error.to_string())?;
    let keypair = mini_secret.expand_to_keypair(ExpansionMode::Ed25519);
    let public_key = keypair.public.to_bytes();

    Ok(Candidate {
        address: ss58_encode(&public_key, 0),
        secret: encode_hex(&secret_seed),
    })
}

fn random_candidate() -> Result<Candidate, String> {
    candidate_from_secret(random_secret()?)
}

fn search(prefix: &str, suffix: &str, batch_size: u32) -> Result<SearchBatchResult, String> {
    run_batch(batch_size, random_candidate, |address| {
        address.starts_with(prefix) && address.ends_with(suffix)
    })
}

#[wasm_bindgen]
pub fn search_substrate_batch(
    prefix: &str,
    suffix: &str,
    batch_size: u32,
) -> Result<JsValue, JsValue> {
    let result = search(prefix, suffix, batch_size).map_err(|error| JsValue::from_str(&error))?;

    to_js_value(&result)
}

#[cfg(test)]
mod tests {
    use super::candidate_from_secret;

    #[test]
    fn derives_known_address() {
        let candidate = candidate_from_secret([1_u8; 32]).expect("valid seed");

        assert_eq!(candidate.address, "1ZGzHnrAgt3eKQvtZXgDPE9aduT4UWJH4fUL9HHdfWk6nx3");
        assert_eq!(candidate.secret, "01".repeat(32));
    }
}
