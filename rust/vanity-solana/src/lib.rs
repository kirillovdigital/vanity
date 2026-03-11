use bs58::encode;
use ed25519_dalek::SigningKey;
use vanity_common::{Candidate, SearchBatchResult, random_secret, run_batch, to_js_value};
use wasm_bindgen::prelude::*;

fn candidate_from_secret(secret_seed: [u8; 32]) -> Candidate {
    let signing_key = SigningKey::from_bytes(&secret_seed);
    let public_key = signing_key.verifying_key().to_bytes();
    let mut secret = [0_u8; 64];

    secret[..32].copy_from_slice(&secret_seed);
    secret[32..].copy_from_slice(&public_key);

    Candidate {
        address: encode(public_key).into_string(),
        secret: encode(secret).into_string(),
    }
}

fn random_candidate() -> Result<Candidate, String> {
    Ok(candidate_from_secret(random_secret()?))
}

fn search(prefix: &str, suffix: &str, batch_size: u32) -> Result<SearchBatchResult, String> {
    run_batch(batch_size, random_candidate, |address| {
        address.starts_with(prefix) && address.ends_with(suffix)
    })
}

#[wasm_bindgen]
pub fn search_solana_batch(
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
        let candidate = candidate_from_secret([1_u8; 32]);

        assert_eq!(candidate.address, "AKnL4NNf3DGWZJS6cPknBuEGnVsV4A4m5tgebLHaRSZ9");
        assert_eq!(
            candidate.secret,
            "2AXDGYSE4f2sz7tvMMzyHvUfcoJmxudvdhBcmiUSo6iuCXagjUCKEQF21awZnUGxmwD4m9vGXuC3qieHXJQHAcT"
        );
    }
}
