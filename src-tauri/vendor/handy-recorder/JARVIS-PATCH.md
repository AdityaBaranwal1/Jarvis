# Jarvis patch of handy-recorder 0.1.1

Upstream: crates.io `handy-recorder` 0.1.1 (git `acce019a`, `crates/handy-recorder` in
cjpais/Handy's workspace), copied unchanged except for the files below. Wired in with
`[patch.crates-io]` in `src-tauri/Cargo.toml`.

Why: Jarvis's Capture Source setting (Microphone / System Audio / Mixed) records what an
output device plays. Handy 0.7.x recorded through its own `recorder.rs`, which Jarvis
extended with loopback; Handy 0.10 moved recording into this crate, which only opens
input devices.

What changed:
- `src/lib.rs`: `pub const LOOPBACK_PREFIX = "loopback:"`.
- `src/backend/cpal/mod.rs`: `open_device` sends an ID of `loopback:<output device name>`
  (`loopback:` = default output) to the new `open_loopback`, which opens that output device
  at its default output format. CPAL builds an input stream on an output device as a
  WASAPI loopback stream (`AUDCLNT_STREAMFLAGS_LOOPBACK`). The sample-format mapping moved
  into `map_sample_format` so both paths share it.

Works on Windows. PulseAudio users can instead pick a "Monitor of ..." source as the
microphone. To update: copy the new upstream version here and re-apply the two hunks.
