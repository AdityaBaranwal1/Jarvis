# J.A.R.V.I.S.

Personal voice assistant for Windows. Local-first speech-to-text with LLM-powered voice commands.

Forked from [Handy](https://github.com/cjpais/Handy); on Handy v0.10.1 since 2026-11-22.

## Features

- Local speech-to-text via Parakeet, Whisper, Canary, Qwen3-ASR, Moonshine and more (GGUF models through transcribe.cpp, CPU or Vulkan GPU)
- Capture source: microphone, or the audio playing on this PC (WASAPI loopback)
- Optional remote transcription: an OpenAI-compatible `/audio/transcriptions` server (Settings → Advanced → Transcription), falling back to the local model when it fails
- Push-to-talk or toggle mode with configurable hotkeys
- LLM post-processing (OpenAI, Groq, Anthropic, Cerebras, OpenRouter, or custom provider)
- Voice Activity Detection (Silero VAD v4)
- System tray with overlay visualization
- Transcription history (SQLite)
- 16 languages supported

## Download & Install

Grab the latest Windows installer from the [**Releases**](https://github.com/AdityaBaranwal1/Jarvis/releases) page:

- `J.A.R.V.I.S._x.y.z_x64-setup.exe` — recommended (NSIS installer), or
- `J.A.R.V.I.S._x.y.z_x64_en-US.msi` — MSI alternative

Run the installer and launch **J.A.R.V.I.S.** from the Start menu. Speech-to-text
models download automatically on first use.

> **"Windows protected your PC" warning?** The installer is not code-signed, so
> Windows SmartScreen will flag it as from an unknown publisher. This is expected
> for open-source apps. Click **More info → Run anyway** to proceed.

**Requirements:** Windows 10/11 (x64). WebView2 is built into Windows 11; on
Windows 10 the installer will fetch it if missing.

## Build from Source

**Prerequisites:**
- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/) package manager
- Visual Studio 2022 with C++ development tools
- [CMake](https://cmake.org/download/) on `PATH` (`winget install Kitware.CMake`)
- [Vulkan SDK](https://vulkan.lunarg.com/sdk/home) (`winget install KhronosGroup.VulkanSDK`, then open a new terminal so `VULKAN_SDK` is set)

See [BUILD.md](BUILD.md) for details and troubleshooting.

```bash
bun install
bun run tauri dev
```

`bun run tauri build` makes the installers in `src-tauri/target/release/bundle/` (`nsis/*-setup.exe`, `msi/*.msi`).
The first build takes a while (Rust plus the transcribe.cpp/ggml C++ build). Subsequent builds are fast.

## Updating from upstream Handy

`git remote add upstream https://github.com/cjpais/Handy.git`, `git fetch upstream --tags`, then
`git merge vX.Y.Z` on a branch. Jarvis-only changes to keep: branding, no updater (forced off in
`settings::update_checks_forced_disabled`), the capture source (vendored `handy-recorder` with a
loopback patch, `src-tauri/vendor/handy-recorder/JARVIS-PATCH.md`), Windows mute by volume
attenuation, the post-processing connection pre-warm, and (branch `feat/remote-stt-0.10.1`) optional remote transcription (`src-tauri/src/remote_stt.rs`).

## License

MIT — see [LICENSE](LICENSE).
