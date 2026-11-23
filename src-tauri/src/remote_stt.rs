//! Optional remote speech-to-text over an OpenAI-compatible API
//! (`POST {base_url}/audio/transcriptions`, multipart `file` + `model`, JSON `{"text": ...}`).
//!
//! Off by default. When it is on and a base URL is set, the recorded utterance (16 kHz mono)
//! is sent as a PCM16 WAV; on any error the caller falls back to the local model, so dictation
//! keeps working when the server is unreachable.

use crate::audio_toolkit::constants::WHISPER_SAMPLE_RATE;
use crate::settings::AppSettings;
use anyhow::{anyhow, Result};
use std::time::Duration;

const DEFAULT_MODEL: &str = "whisper-1";

/// True when remote transcription is switched on and has somewhere to go.
pub fn is_configured(settings: &AppSettings) -> bool {
    settings.remote_stt_enabled && !settings.remote_stt_base_url.trim().is_empty()
}

/// `https://host/v1` (with or without a trailing slash) -> `https://host/v1/audio/transcriptions`.
pub fn transcriptions_url(base_url: &str) -> String {
    format!(
        "{}/audio/transcriptions",
        base_url.trim().trim_end_matches('/')
    )
}

/// `https://host/v1` -> `https://host/v1/models` (used to warm the connection while recording).
pub fn models_url(base_url: &str) -> String {
    format!("{}/models", base_url.trim().trim_end_matches('/'))
}

/// Mono f32 samples in [-1, 1] -> a 16-bit PCM WAV file.
pub fn encode_wav_pcm16(samples: &[f32], sample_rate: u32) -> Vec<u8> {
    let data_len = (samples.len() * 2) as u32;
    let mut out = Vec::with_capacity(44 + data_len as usize);
    out.extend_from_slice(b"RIFF");
    out.extend_from_slice(&(36 + data_len).to_le_bytes());
    out.extend_from_slice(b"WAVE");
    out.extend_from_slice(b"fmt ");
    out.extend_from_slice(&16u32.to_le_bytes()); // fmt chunk size
    out.extend_from_slice(&1u16.to_le_bytes()); // PCM
    out.extend_from_slice(&1u16.to_le_bytes()); // mono
    out.extend_from_slice(&sample_rate.to_le_bytes());
    out.extend_from_slice(&(sample_rate * 2).to_le_bytes()); // byte rate
    out.extend_from_slice(&2u16.to_le_bytes()); // block align
    out.extend_from_slice(&16u16.to_le_bytes()); // bits per sample
    out.extend_from_slice(b"data");
    out.extend_from_slice(&data_len.to_le_bytes());
    for s in samples {
        let v = (s.clamp(-1.0, 1.0) * i16::MAX as f32).round() as i16;
        out.extend_from_slice(&v.to_le_bytes());
    }
    out
}

/// multipart/form-data body with `model`, `response_format` and the WAV as `file`.
fn multipart_body(boundary: &str, model: &str, wav: &[u8]) -> Vec<u8> {
    let mut body = Vec::with_capacity(wav.len() + 512);
    for (name, value) in [("model", model), ("response_format", "json")] {
        body.extend_from_slice(
            format!(
                "--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n"
            )
            .as_bytes(),
        );
    }
    body.extend_from_slice(
        format!(
            "--{boundary}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"audio.wav\"\r\nContent-Type: audio/wav\r\n\r\n"
        )
        .as_bytes(),
    );
    body.extend_from_slice(wav);
    body.extend_from_slice(format!("\r\n--{boundary}--\r\n").as_bytes());
    body
}

/// Send the utterance to the configured server and return the raw transcript.
pub async fn transcribe(settings: &AppSettings, samples: &[f32]) -> Result<String> {
    let url = transcriptions_url(&settings.remote_stt_base_url);
    let model = match settings.remote_stt_model.trim() {
        "" => DEFAULT_MODEL,
        m => m,
    };
    let wav = encode_wav_pcm16(samples, WHISPER_SAMPLE_RATE);
    let audio_secs = samples.len() as f64 / WHISPER_SAMPLE_RATE as f64;
    // Generous enough for a slow CPU server, short enough that a dead one falls back quickly.
    let timeout = Duration::from_secs_f64(8.0 + audio_secs * 0.5);
    let boundary = format!(
        "jarvis-{:x}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos())
            .unwrap_or(0)
    );

    let mut request = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(3))
        .timeout(timeout)
        .build()?
        .post(&url)
        .header(
            reqwest::header::CONTENT_TYPE,
            format!("multipart/form-data; boundary={boundary}"),
        )
        .body(multipart_body(&boundary, model, &wav));
    let key = settings.remote_stt_api_key.trim();
    if !key.is_empty() {
        request = request.bearer_auth(key);
    }

    let response = request.send().await?;
    let status = response.status();
    if !status.is_success() {
        let detail: String = response
            .text()
            .await
            .unwrap_or_default()
            .chars()
            .take(200)
            .collect();
        return Err(anyhow!("{} from {}: {}", status, url, detail));
    }
    let json: serde_json::Value = response.json().await?;
    json.get("text")
        .and_then(|t| t.as_str())
        .map(|t| t.trim().to_string())
        .ok_or_else(|| anyhow!("response from {} has no \"text\" field", url))
}

/// Open the TCP + TLS connection while the user is still talking (saves a round trip or two).
pub async fn prewarm(settings: &AppSettings) {
    let mut request = reqwest::Client::new()
        .get(models_url(&settings.remote_stt_base_url))
        .timeout(Duration::from_secs(5));
    let key = settings.remote_stt_api_key.trim();
    if !key.is_empty() {
        request = request.bearer_auth(key);
    }
    let _ = request.send().await;
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::settings::get_default_settings;

    #[test]
    fn remote_stt_is_off_by_default() {
        let settings = get_default_settings();
        assert!(!settings.remote_stt_enabled);
        assert!(!is_configured(&settings));
    }

    #[test]
    fn needs_a_base_url_as_well_as_the_switch() {
        let mut settings = get_default_settings();
        settings.remote_stt_enabled = true;
        assert!(!is_configured(&settings));
        settings.remote_stt_base_url = "https://stt.example/v1".into();
        assert!(is_configured(&settings));
    }

    #[test]
    fn builds_endpoint_urls() {
        assert_eq!(
            transcriptions_url("https://stt.example/v1/"),
            "https://stt.example/v1/audio/transcriptions"
        );
        assert_eq!(
            transcriptions_url(" https://stt.example/v1 "),
            "https://stt.example/v1/audio/transcriptions"
        );
        assert_eq!(
            models_url("http://127.0.0.1:8000/v1"),
            "http://127.0.0.1:8000/v1/models"
        );
    }

    #[test]
    fn encodes_a_valid_pcm16_wav() {
        let wav = encode_wav_pcm16(&[0.0, 1.0, -1.0, 2.0], 16000);
        assert_eq!(wav.len(), 44 + 8);
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(u32::from_le_bytes(wav[4..8].try_into().unwrap()), 36 + 8);
        assert_eq!(&wav[8..16], b"WAVEfmt ");
        assert_eq!(u32::from_le_bytes(wav[24..28].try_into().unwrap()), 16000);
        assert_eq!(&wav[36..40], b"data");
        let s: Vec<i16> = wav[44..]
            .chunks(2)
            .map(|c| i16::from_le_bytes([c[0], c[1]]))
            .collect();
        assert_eq!(s, vec![0, i16::MAX, -i16::MAX, i16::MAX]); // out-of-range input is clamped
    }

    #[test]
    fn multipart_body_has_all_parts() {
        let body = multipart_body("b", "m1", b"WAV");
        let text = String::from_utf8_lossy(&body);
        assert!(text.contains("name=\"model\"\r\n\r\nm1\r\n"));
        assert!(text.contains("name=\"response_format\"\r\n\r\njson\r\n"));
        assert!(text.contains("filename=\"audio.wav\""));
        assert!(text.ends_with("WAV\r\n--b--\r\n"));
    }
}
