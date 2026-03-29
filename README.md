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
