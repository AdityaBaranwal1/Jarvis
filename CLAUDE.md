# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project

J.A.R.V.I.S. — A personal voice assistant for Windows, forked from Handy (merged up to v0.10.1, 2026-11-22;
`upstream` remote = cjpais/Handy, so updates are `git merge vX.Y.Z`).
Built with Tauri 2.x (Rust backend + React/TypeScript frontend).
Local-first speech-to-text (GGUF models through transcribe.cpp) with LLM post-processing.

**Goal:** Extend into a Jarvis-like voice command system with app launching,
smart home control (Broadlink, Google Home), and LLM-powered intent routing.

## Development Commands

**Prerequisites:** [Rust](https://rustup.rs/) (latest stable), [Bun](https://bun.sh/)

```bash
bun install              # Install frontend dependencies
bun run tauri dev        # Run in development mode (hot-reload)
bun run tauri build      # Build for production
bun run lint             # ESLint for frontend
bun run format           # Prettier + cargo fmt
```

**VAD model** (`src-tauri/resources/models/silero-vad-v6.2-F32.gguf`) is already in the repo.
ASR models (GGUF) download at runtime from Hugging Face (`handy-computer/*` repos, catalog in
`src-tauri/src/catalog/catalog.json`); old-format models from 0.7.x are migrated in the app.

## Architecture Overview

### Backend (src-tauri/src/)

- `lib.rs` — Tauri setup, plugin registration, manager initialization
- `managers/` — Core business logic:
  - `audio.rs` — CPAL recording, device management, VAD integration
  - `model.rs`, `model/` — Model catalog, downloads (Hugging Face, mirror blob.handy.computer), 0.7.x migration
  - `transcription.rs` — ASR via transcribe-cpp, run in a separate worker process (`engine_supervisor/`)
  - `history.rs` — SQLite transcription history
- `audio_toolkit/` — Low-level audio: VAD (Silero / Earshot), chunking, decoding; microphone capture is the
  `handy-recorder` crate, vendored in `vendor/handy-recorder` with a loopback patch (capture source)
- `actions.rs` — ShortcutAction trait, TranscribeAction, post-processing pipeline
- `llm_client.rs` — OpenAI-compatible API client (8 providers)
- `clipboard.rs` — Paste methods including ExternalScript hook
- `settings.rs` — AppSettings struct (50+ fields), JSON persistence
- `shortcut/` — Dual keyboard backends (Tauri global-shortcut + handy-keys)
- `commands/` — 60+ Tauri command handlers

### Frontend (src/)

- `App.tsx` — Main component, onboarding, event listeners
- `stores/settingsStore.ts` — Zustand store (all settings state)
- `stores/modelStore.ts` — Zustand store (model management)
- `components/settings/` — 50+ settings components
- `components/Sidebar.tsx` — Navigation (SECTIONS_CONFIG)
- `bindings.ts` — Auto-generated Tauri type bindings (specta)
- `overlay/` — Recording overlay window
- `i18n/` — 16 languages, RTL support

### Key Patterns

- **Manager Pattern:** Arc<Mutex<T>> managers for Audio, Model, Transcription, History
- **Command-Event:** Frontend → Backend via Tauri commands; Backend → Frontend via events
- **Pipeline:** Hotkey → Record → VAD → ASR → (optional LLM) → Paste/ExternalScript
- **State:** Zustand → Tauri Command → Rust State → tauri-plugin-store JSON

## DO NOT Change

- `handy-keys` / `handy_keys` references — external crate dependency, NOT our app name
- `blob.handy.computer` / `handy-computer/*` Hugging Face repos — upstream model sources, still needed
- `LICENSE` — MIT, legally required to retain

## Hardware Target

- Windows 11, Ryzen 9 7900X, RTX 4070 Ti, 32GB DDR5
- ASR on CPU or the Vulkan GPU backend (transcribe-cpp; Windows x64 builds need the Vulkan SDK)
- Target: under 1GB total RAM usage

## Code Style

- Rust: `cargo fmt`, explicit error handling, Arc<Mutex<T>> for shared state
- TypeScript: Strict mode, functional components, Tailwind CSS, `@/` path alias
- i18n: All user-facing strings via i18next (ESLint enforced)
- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`

## CLI Parameters

| Flag                     | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| `--toggle-transcription` | Toggle recording on/off on running instance           |
| `--toggle-post-process`  | Toggle recording with post-processing                 |
| `--cancel`               | Cancel current operation                              |
| `--start-hidden`         | Launch without showing main window                    |
| `--no-tray`              | Launch without system tray icon                       |
| `--debug`                | Enable debug mode with Trace logging                  |

## Debug Mode

`Ctrl+Shift+D` to toggle debug panel in the UI.
