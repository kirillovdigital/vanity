use ed25519_dalek::SigningKey;
use ton_contracts::wallet::{KeyPair, Wallet, v4r2::V4R2};
use vanity_common::{Candidate, SearchBatchResult, encode_hex, random_secret, run_batch, to_js_value};
use wasm_bindgen::prelude::*;

fn candidate_from_secret(secret_seed: [u8; 32]) -> Result<Candidate, String> {
    let signing_key = SigningKey::from_bytes(&secret_seed);
    let verifying_key = signing_key.verifying_key().to_bytes();
    let keypair = KeyPair::new(signing_key.to_keypair_bytes(), verifying_key);
    let wallet = Wallet::<V4R2>::derive_default(keypair).map_err(|error| error.to_string())?;

    Ok(Candidate {
        address: wallet.address().to_string(),
        secret: encode_hex(&secret_seed),
    })
}

fn random_candidate() -> Result<Candidate, String> {
    candidate_from_secret(random_secret()?)
}

fn search(prefix: &str, suffix: &str, batch_size: u32) -> Result<SearchBatchResult, String> {
    run_batch(batch_size, random_candidate, |address| {
        let body = address.strip_prefix("EQ").unwrap_or(address);

        body.starts_with(prefix) && body.ends_with(suffix)
    })
}

#[wasm_bindgen]
pub fn search_ton_batch(
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

        assert_eq!(candidate.address, "EQDvr_S6wiD4iy6Y6x2c_8yjv-O2bs4xp9bFiQ0w39evpduQ");
        assert_eq!(candidate.secret, "01".repeat(32));
    }
}
