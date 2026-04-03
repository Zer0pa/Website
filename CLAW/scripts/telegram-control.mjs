#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { controlPath, loadControlPlane, localTimestamp, projectPath, relativeProjectPath, writeJson } from './lib/control-plane.mjs';

const TOKEN_ENV = 'ZEROPA_TELEGRAM_BOT_TOKEN';
const CHAT_IDS_ENV = 'ZEROPA_TELEGRAM_ALLOWED_CHAT_IDS';
const PAIRING_ENV = 'ZEROPA_TELEGRAM_PAIRING_CODE';
const KEYCHAIN_SERVICE_ENV = 'ZEROPA_TELEGRAM_KEYCHAIN_SERVICE';
const DEFAULT_KEYCHAIN_SERVICE = 'zer0palab-claw-telegram-bot';
const CONFIG_PATH_ENV = 'ZEROPA_TELEGRAM_CONFIG';
const STATE_PATH = projectPath('CLAW/services/telegram/state.json');
const REQUESTS_DIR = controlPath('operator-requests');
const DEFAULT_CONFIG_PATH = path.join(os.homedir(), '.config', 'zer0pa-claw', 'telegram.json');

function getConfig() {
  const configPath = process.env[CONFIG_PATH_ENV] || DEFAULT_CONFIG_PATH;
  const localConfig = readLocalConfig(configPath);
  const keychainService = process.env[KEYCHAIN_SERVICE_ENV] || localConfig.keychain_service || DEFAULT_KEYCHAIN_SERVICE;
  const token = process.env[TOKEN_ENV] || readKeychainSecret(keychainService);
  const allowedChatIds = (process.env[CHAT_IDS_ENV] || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  const mergedAllowedChatIds = [...new Set([...allowedChatIds, ...(localConfig.allowed_chat_ids || []).map(String)])];
  const pairingCode = process.env[PAIRING_ENV] || localConfig.pairing_code || '';

  return {
    token,
    allowedChatIds: mergedAllowedChatIds,
    pairingCode,
    configPath,
    keychainService,
    configExists: fs.existsSync(configPath),
  };
}

function readLocalConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return {};
  }

  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function writeLocalConfig(configPath, payload) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, `${JSON.stringify(payload, null, 2)}\n`, { mode: 0o600 });
}

function readKeychainSecret(service) {
  try {
    return execFileSync('security', ['find-generic-password', '-s', service, '-w'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function readState() {
  if (!fs.existsSync(STATE_PATH)) {
    return {
      version: 1,
      offset: 0,
      last_polled_at: null,
    };
  }

  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function writeState(state) {
  writeJson(STATE_PATH, state);
}

function requireConfig(config) {
  const issues = [];
  if (!config.token) issues.push(`Missing ${TOKEN_ENV}`);
  if (config.allowedChatIds.length === 0 && !config.pairingCode) {
    issues.push(`Missing ${CHAT_IDS_ENV} or ${PAIRING_ENV}`);
  }
  return issues;
}

async function telegramApi(config, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${config.token}/${method}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Telegram API ${method} failed with ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.ok) {
    throw new Error(`Telegram API ${method} returned not-ok.`);
  }

  return payload.result;
}

function createOperatorRequest(message) {
  const id = `REQ-${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')}`;
  const payload = {
    id,
    status: 'received',
    created_at: localTimestamp(),
    chat_id: String(message.chat.id),
    username: message.from?.username || null,
    text: message.text || '',
  };
  writeJson(controlPath('operator-requests', `${id}.json`), payload);
  return payload;
}

function updateOperatorRequest(requestId, status) {
  const requestPath = controlPath('operator-requests', `${requestId}.json`);
  if (!fs.existsSync(requestPath)) {
    return null;
  }
  const payload = JSON.parse(fs.readFileSync(requestPath, 'utf8'));
  payload.status = status;
  payload.updated_at = localTimestamp();
  writeJson(requestPath, payload);
  return payload;
}

function formatStatus() {
  const control = loadControlPlane();
  return [
    `Phase: ${control.runtime.current_phase}`,
    `Wave: ${control.runtime.active_wave}`,
    `press_go: ${control.runtime.press_go ? 'true' : 'false'}`,
    `Blockers: ${(control.runtime.blockers || []).length}`,
    `Next: ${(control.runtime.next_actions || []).slice(0, 3).join(' | ') || 'none'}`,
  ].join('\n');
}

function formatHealth() {
  const control = loadControlPlane();
  return [
    `phase=${control.runtime.current_phase}`,
    `active_cycle=${control.runtime.active_cycle ? control.runtime.active_cycle.cycle_id : 'none'}`,
    `queue_active=${control.runtime.queue?.active || 'none'}`,
    `locks=${(control.runtime.locks || []).length}`,
    `checkpoint=${control.runtime.current_checkpoint || 'none'}`,
  ].join('\n');
}

function formatCheckpoint() {
  const checkpointPath = controlPath('checkpoints', 'current.json');
  const checkpoint = JSON.parse(fs.readFileSync(checkpointPath, 'utf8'));
  return [
    `checkpoint=${checkpoint.checkpoint_id || 'none'}`,
    `status=${checkpoint.status || 'none'}`,
    `rollback=${checkpoint.rollback_point || 'none'}`,
  ].join('\n');
}

function formatQueue() {
  const control = loadControlPlane();
  const queue = control.runtime.queue || { active: null, history: [] };
  return [
    `active=${queue.active || 'none'}`,
    `history=${(queue.history || []).slice(-3).join(', ') || 'none'}`,
  ].join('\n');
}

function upsertPairedChat(config, message) {
  const localConfig = readLocalConfig(config.configPath);
  const allowed = new Set((localConfig.allowed_chat_ids || []).map(String));
  allowed.add(String(message.chat.id));
  const nextConfig = {
    ...localConfig,
    allowed_chat_ids: [...allowed],
    paired_at: localTimestamp(),
    paired_username: message.from?.username || null,
  };
  writeLocalConfig(config.configPath, nextConfig);
}

async function handleMessage(config, message) {
  const chatId = String(message.chat.id);
  const text = (message.text || '').trim();
  const [command, ...rest] = text.split(/\s+/);

  if (!config.allowedChatIds.includes(chatId)) {
    if (command === '/pair' && config.pairingCode && rest[0] === config.pairingCode) {
      upsertPairedChat(config, message);
      await telegramApi(config, 'sendMessage', {
        chat_id: chatId,
        text: 'Paired. This chat is now allowed for supervised control.',
      });
      return;
    }

    await telegramApi(config, 'sendMessage', {
      chat_id: chatId,
      text: 'Unauthorized chat.',
    });
    return;
  }

  let reply = null;

  switch (command) {
    case '/start':
    case '/help':
      reply = [
        'ZeroClaw operator desk',
        '/status',
        '/health',
        '/phase',
        '/queue',
        '/checkpoint',
        '/pair <code>',
        '/request <text>',
        '/approve <request_id>',
        '/reject <request_id>',
      ].join('\n');
      break;
    case '/status':
    case '/phase':
      reply = formatStatus();
      break;
    case '/health':
      reply = formatHealth();
      break;
    case '/queue':
      reply = formatQueue();
      break;
    case '/checkpoint':
      reply = formatCheckpoint();
      break;
    case '/request': {
      const requestText = rest.join(' ').trim();
      if (!requestText) {
        reply = 'Usage: /request <text>';
        break;
      }
      const payload = createOperatorRequest(message);
      reply = `Recorded ${payload.id}`;
      break;
    }
    case '/approve': {
      const requestId = rest[0];
      const payload = requestId ? updateOperatorRequest(requestId, 'approved') : null;
      reply = payload ? `Approved ${payload.id}` : 'Request not found.';
      break;
    }
    case '/reject': {
      const requestId = rest[0];
      const payload = requestId ? updateOperatorRequest(requestId, 'rejected') : null;
      reply = payload ? `Rejected ${payload.id}` : 'Request not found.';
      break;
    }
    default:
      reply = 'Unknown command. Use /help.';
      break;
  }

  await telegramApi(config, 'sendMessage', {
    chat_id: chatId,
    text: reply,
  });
}

async function pollOnce(config) {
  const state = readState();
  const updates = await telegramApi(config, 'getUpdates', {
    offset: state.offset,
    timeout: 5,
    allowed_updates: ['message'],
  });

  let nextOffset = state.offset;
  for (const update of updates) {
    nextOffset = Math.max(nextOffset, update.update_id + 1);
    if (update.message) {
      await handleMessage(config, update.message);
    }
  }

  writeState({
    version: 1,
    offset: nextOffset,
    last_polled_at: localTimestamp(),
  });
}

async function main() {
  const config = getConfig();
  const issues = requireConfig(config);

  if (process.argv.includes('--doctor')) {
    console.log(
      JSON.stringify(
        {
          ok: issues.length === 0,
          issues,
          token_env: TOKEN_ENV,
          allowed_chat_ids_env: CHAT_IDS_ENV,
          pairing_code_env: PAIRING_ENV,
          keychain_service: config.keychainService,
          config_path: config.configPath,
          config_exists: config.configExists,
          pairing_enabled: Boolean(config.pairingCode),
          state_file: relativeProjectPath(STATE_PATH),
        },
        null,
        2,
      ),
    );
    process.exit(issues.length === 0 ? 0 : 1);
  }

  if (issues.length > 0) {
    console.error(JSON.stringify({ ok: false, issues }, null, 2));
    process.exit(1);
  }

  if (process.argv.includes('--once')) {
    await pollOnce(config);
    return;
  }

  while (true) {
    await pollOnce(config);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
