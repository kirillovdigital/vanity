use getrandom::getrandom;
use serde::Serialize;
use wasm_bindgen::JsValue;

pub const SECRET_SIZE: usize = 32;

#[derive(Debug, Clone)]
pub struct Candidate {
    pub address: String,
    pub secret: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SearchBatchResult {
    pub found: bool,
    pub attempts: u32,
    pub address: Option<String>,
    pub secret: Option<String>,
}

impl SearchBatchResult {
    pub fn found(attempts: u32, candidate: Candidate) -> Self {
        Self {
            found: true,
            attempts,
            address: Some(candidate.address),
            secret: Some(candidate.secret),
        }
    }

    pub fn pending(attempts: u32) -> Self {
        Self {
            found: false,
            attempts,
            address: None,
            secret: None,
        }
    }
}

pub fn encode_hex(bytes: &[u8]) -> String {
    const TABLE: &[u8; 16] = b"0123456789abcdef";
    let mut output = String::with_capacity(bytes.len() * 2);

    for byte in bytes {
        output.push(TABLE[(byte >> 4) as usize] as char);
        output.push(TABLE[(byte & 0x0f) as usize] as char);
    }

    output
}

pub fn random_secret() -> Result<[u8; SECRET_SIZE], String> {
    let mut secret = [0_u8; SECRET_SIZE];
    getrandom(&mut secret).map_err(|error| error.to_string())?;
    Ok(secret)
}

pub fn run_batch<G, M>(
    batch_size: u32,
    mut generate: G,
    mut matches: M,
) -> Result<SearchBatchResult, String>
where
    G: FnMut() -> Result<Candidate, String>,
    M: FnMut(&str) -> bool,
{
    let capped_batch = batch_size.max(1);

    for attempts in 1..=capped_batch {
        let candidate = generate()?;

        if matches(candidate.address.as_str()) {
            return Ok(SearchBatchResult::found(attempts, candidate));
        }
    }

    Ok(SearchBatchResult::pending(capped_batch))
}

pub fn to_js_value(result: &SearchBatchResult) -> Result<JsValue, JsValue> {
    serde_wasm_bindgen::to_value(result).map_err(|error| JsValue::from_str(&error.to_string()))
}
