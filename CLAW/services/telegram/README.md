# Telegram Control Surface

## Purpose

This is the supervised operator inbox for the local Zer0paLab Clawstation.

It is intentionally not a shell.

The Telegram bot may:

- report phase, health, queue, and checkpoint state
- accept operator requests as bounded queue artifacts
- mark queued operator requests approved or rejected

It may not:

- execute arbitrary shell commands from chat
- access paths outside the Website workspace
- override control-plane gates

## Secrets

The live bot token is read from either:

- `ZEROPA_TELEGRAM_BOT_TOKEN`
- macOS Keychain service `zer0palab-claw-telegram-bot`

Allowed operator chat IDs are read from either:

- `ZEROPA_TELEGRAM_ALLOWED_CHAT_IDS`
- `~/.config/zer0pa-claw/telegram.json`

Optional supervised pairing code:

- `ZEROPA_TELEGRAM_PAIRING_CODE`
- `~/.config/zer0pa-claw/telegram.json`

No secrets are committed into this repo.

## Commands

- `/start`
- `/help`
- `/status`
- `/health`
- `/phase`
- `/queue`
- `/checkpoint`
- `/pair <code>`
- `/request <text>`
- `/approve <request_id>`
- `/reject <request_id>`

## State

- offset and poll state: `CLAW/services/telegram/state.json`
- operator requests: `CLAW/control-plane/operator-requests/*.json`

## Launch

Dry check:

```bash
npm run claw:telegram -- --doctor
```

Single poll:

```bash
npm run claw:telegram -- --once
```

Long poll loop:

```bash
npm run claw:telegram
```

## Local Config

Example `~/.config/zer0pa-claw/telegram.json`:

```json
{
  "allowed_chat_ids": ["123456789"],
  "pairing_code": "set-a-rotating-code-here",
  "keychain_service": "zer0palab-claw-telegram-bot"
}
```
