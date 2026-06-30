# J.A.R.V.I.S.

Personal voice assistant for Windows. Local-first speech-to-text with LLM-powered voice commands.

Forked from [Handy](https://github.com/cjpais/Handy) v0.7.10.

## Features

- Local speech-to-text via Parakeet, Whisper, Moonshine, and more (ONNX, CPU-only)
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

```bash
bun install
bun run tauri dev
```

First build takes ~15 minutes (Rust compilation). Subsequent builds are fast.

## License

MIT — see [LICENSE](LICENSE).
