# AGENTS.md

This file provides guidance to AI agents working with this repository.

## Development Commands

**Prerequisites:**

- [Rust](https://rustup.rs/) (latest stable)
- [Bun](https://bun.sh/) package manager

```bash
bun install              # Install dependencies
bun run tauri dev        # Full app with hot reload
bun run tauri build      # Production build
bun run lint             # ESLint (frontend)
bun run format           # Prettier + cargo fmt
```

**Model Setup (Required for Development):**

The VAD model (`src-tauri/resources/models/silero-vad-v6.2-F32.gguf`) is already in the repo.

## Architecture Overview

J.A.R.V.I.S. is a desktop voice assistant built with Tauri 2.x (Rust backend + React/TypeScript frontend). Forked from Handy (merged up to v0.10.1).

### Backend (Rust - src-tauri/src/)

- `lib.rs` - Main entry point, Tauri setup, manager initialization
- `managers/` - Core business logic:
  - `audio.rs` - Audio recording and device management (CPAL)
  - `model.rs` - ASR model downloading and management
  - `transcription.rs` - Speech-to-text pipeline (transcribe-cpp, isolated worker in `engine_supervisor/`)
  - `history.rs` - Transcription history (SQLite)
- `audio_toolkit/` - Low-level audio processing:
  - `audio/` - Device enumeration, recording, resampling
  - `vad/` - Voice Activity Detection (Silero VAD v4)
- `actions.rs` - ShortcutAction trait, transcription pipeline, LLM post-processing
- `llm_client.rs` - OpenAI-compatible API client (8 providers)
- `clipboard.rs` - Paste methods including ExternalScript hook
- `commands/` - 60+ Tauri command handlers
- `shortcut/` - Global keyboard shortcuts (handy-keys + tauri-plugin-global-shortcut)
- `settings.rs` - AppSettings (50+ fields, JSON persistence)

### Frontend (React/TypeScript - src/)

- `App.tsx` - Main component with onboarding flow
- `stores/` - Zustand stores (settings, models)
- `components/settings/` - 50+ settings UI components
- `components/Sidebar.tsx` - Navigation with SECTIONS_CONFIG
- `bindings.ts` - Auto-generated Tauri type bindings (specta)
- `overlay/` - Recording overlay window
- `i18n/` - 16 languages with RTL support

### Key Patterns

- **Manager Pattern:** Arc<Mutex<T>> managers initialized at startup
- **Command-Event Architecture:** Frontend → Backend via Tauri commands; Backend → Frontend via events
- **Pipeline:** Audio → VAD → ASR Engine → (optional LLM) → Clipboard/Paste
- **State:** Zustand → Tauri Command → Rust State → tauri-plugin-store

### DO NOT Change

- `handy-keys` / `handy_keys` references — external crate, not our app name
- `blob.handy.computer` URLs — model CDN from upstream project
- `LICENSE` — MIT, legally required

### Application Flow

1. App starts, loads settings, initializes managers
2. First-run downloads preferred ASR model (Parakeet V3 recommended)
3. Global shortcut triggers audio recording with VAD filtering
4. Audio sent to ASR engine for transcription
5. Optional LLM post-processing via configured provider
6. Text pasted to active application or sent to external script
