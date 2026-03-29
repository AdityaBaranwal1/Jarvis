# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project

J.A.R.V.I.S. — A personal voice assistant for Windows, forked from Handy v0.7.10.
Built with Tauri 2.x (Rust backend + React/TypeScript frontend).
Local-first speech-to-text via Parakeet/Whisper models with LLM post-processing.

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

**VAD model** (`src-tauri/resources/models/silero_vad_v4.onnx`) is already in the repo.
ASR models (Parakeet, Whisper, etc.) download at runtime from `blob.handy.computer`.

## Architecture Overview

### Backend (src-tauri/src/)

- `lib.rs` — Tauri setup, plugin registration, manager initialization
- `managers/` — Core business logic:
  - `audio.rs` — CPAL recording, device management, VAD integration
  - `model.rs` — Model download/extract from blob.handy.computer CDN
  - `transcription.rs` — ASR engine loading (Parakeet, Whisper, Moonshine, etc.)
  - `history.rs` — SQLite transcription history
- `audio_toolkit/` — Low-level audio: recording, resampling, Silero VAD, FFT
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
- `blob.handy.computer` URLs — model CDN from upstream, still needed for downloads
- `LICENSE` — MIT, legally required to retain

## Hardware Target

- Windows 11, Ryzen 9 7900X, RTX 4070 Ti, 32GB DDR5
- All ASR inference on CPU via ONNX Runtime (no GPU)
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
