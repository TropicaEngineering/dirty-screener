const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

let userChatId = null;
let userMode = {}; // Tracks user mode (leaderboard or alerts)
let lastLeaderboardMessageId = {}; // Stores last leaderboard message ID per user
let lastKnownTokens = new Set(); // Avoid duplicate alerts
let serverOnline = null; // Tracks server status to prevent spam messages
let pinnedStatusMessageId = null; // Stores last pinned status message

console.log("🚀 Telegram bot is running...");

// ✅ Path to server log file
const logFilePath = 'server.log';

// ✅ Define Suggested Commands for `/` Menu
bot.setMyCommands([
    { command: "/leaderboard", description: "📊 View live token rankings" },
    { command: "/alerts", description: "🚀 Enable token alerts" },
    { command: "/help", description: "ℹ️ Get help with commands" }
]);

// ✅ Welcome Message & Menu
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (!userChatId) {
        userChatId = chatId;

        bot.sendMessage(chatId, `👋 *Welcome to DexFilter!* 🚀\n\n🔹 *Track tokens in real time!*\n🔹 *Get notified when new ones appear!*\n\nUse the menu below or type / to see commands.`, {
            parse_mode: "Markdown",
            reply_markup: {
                keyboard: [
                    [{ text: "/leaderboard" }, { text: "/alerts" }],
                    [{ text: "/help" }]
                ],
                resize_keyboard: true,
                one_time_keyboard: false
            }
        });

        console.log(`✅ User started bot, chat ID: ${chatId}`);
    }
});

// ✅ /leaderboard Command
bot.onText(/\/leaderboard/, (msg) => {
    const chatId = msg.chat.id;
    userMode[chatId] = "leaderboard";

    if (lastLeaderboardMessageId[chatId]) {
        sendLeaderboard(chatId);
    } else {
        bot.sendMessage(chatId, "📊 *Leaderboard Mode Enabled!* \n\nSorted by highest *5m % change* at the top.\nUse /alerts to switch modes.", { parse_mode: "Markdown" })
            .then((sentMessage) => {
                lastLeaderboardMessageId[chatId] = sentMessage.message_id;
                sendLeaderboard(chatId);
            });
    }
});

// ✅ /alerts Command
bot.onText(/\/alerts/, (msg) => {
    const chatId = msg.chat.id;
    userMode[chatId] = "alerts";

    if (lastLeaderboardMessageId[chatId]) {
        bot.deleteMessage(chatId, lastLeaderboardMessageId[chatId]).catch(() => {});
        lastLeaderboardMessageId[chatId] = null;
    }

    bot.sendMessage(chatId, "🚀 *New Token Alerts Enabled!* \n\nYou'll get alerts for fresh tokens.\nUse /leaderboard to switch back.", { parse_mode: "Markdown" });
});

// ✅ /help Command
bot.onText(/\/help/, (msg) => {
    bot.sendMessage(msg.chat.id, "📖 *How to Use This Bot:*\n\n✅ *Leaderboard Mode:* Shows live rankings sorted by 5m % change.\n✅ *Alerts Mode:* Notifies you about new tokens.\n✅ *Server Status:* Pins an update when online/offline.\n\nUse the menu below or type / to see commands.", {
        parse_mode: "Markdown",
        reply_markup: {
            keyboard: [
                [{ text: "/leaderboard" }, { text: "/alerts" }]
            ],
            resize_keyboard: true
        }
    });
});

// ✅ Function to Format % Change
const formatChange = (change) => {
    if (!change || change === "N/A") return "N/A";
    return change.includes("-") ? `🔴 ${change}` : `🟢 ${change}`;
};

// ✅ Function to Read & Update Leaderboard
const sendLeaderboard = (chatId) => {
    fs.readFile('dexscreener_data.json', 'utf8', (err, data) => {
        if (err) return console.error("❌ Error reading JSON file:", err);

        try {
            let jsonData = JSON.parse(data);
            jsonData.sort((a, b) => parseFloat(b["5m Change"] || 0) - parseFloat(a["5m Change"] || 0));

            let leaderboardMessage = `📊 *Live Token Leaderboard (Sorted by 5m % Change)*\n━━━━━━━━━━━━━━━━━━\n`;

            jsonData.forEach((token, index) => {
                const dexChart = `https://dexscreener.com/solana/${token.poolAddress}`;

                leaderboardMessage += `
${index + 1}. *${token.token}*  (${token.age})
💰 *Price:* ${token.price}
📊 *Liquidity:* ${token.liquidity}
📈 *Market Cap:* ${token.marketCap}
💵 *Volume:* ${token.volume}
📊 *5m:* ${formatChange(token["5m Change"])}  |  *1h:* ${formatChange(token["1h Change"])}
🔄 *6h:* ${formatChange(token["6h Change"])}  |  *24h:* ${formatChange(token["24h Change"])}
🔗 *Pool:* \`${token.poolAddress}\`
📈 [**DexScreener Chart**](${dexChart})
━━━━━━━━━━━━━━━━━━`;
            });

            if (lastLeaderboardMessageId[chatId]) {
                bot.editMessageText(leaderboardMessage, {
                    chat_id: chatId,
                    message_id: lastLeaderboardMessageId[chatId],
                    parse_mode: "Markdown",
                    disable_web_page_preview: true
                }).catch((err) => {
                    console.error("⚠️ Error editing leaderboard:", err);
                });
            } else {
                bot.sendMessage(chatId, leaderboardMessage, {
                    parse_mode: "Markdown",
                    disable_web_page_preview: true
                }).then((sentMessage) => {
                    lastLeaderboardMessageId[chatId] = sentMessage.message_id;
                });
            }

        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
        }
    });
};

// ✅ Monitor Server Logs & Send Online/Offline Alerts
const monitorServerLogs = () => {
    setInterval(() => {
        fs.readFile(logFilePath, 'utf8', (err, data) => {
            if (err) return;

            const lines = data.split('\n').filter(Boolean);
            const lastLine = lines[lines.length - 1] || "";

            if (lastLine.includes("✅ Data saved to dexscreener_data.json")) {
                if (serverOnline !== true) {
                    serverOnline = true;
                    console.log("✅ Server is ONLINE!");
                    updatePinnedStatus("✅ *Server is ONLINE!* \n🚀 Live updates are running.");
                }
            } else if (lastLine.includes("❌ Browser disconnected.")) {
                if (serverOnline !== false) {
                    serverOnline = false;
                    console.log("❌ Server is OFFLINE!");
                    updatePinnedStatus("❌ *Server is OFFLINE!* \n🔄 Waiting for reconnection.");
                }
            }
        });
    }, 5000);
};

// ✅ Pin Status Message (Removes old one, pins new one)
const updatePinnedStatus = (message) => {
    if (userChatId) {
        if (pinnedStatusMessageId) {
            bot.deleteMessage(userChatId, pinnedStatusMessageId).catch(() => {});
        }

        bot.sendMessage(userChatId, message, { parse_mode: "Markdown" }).then((sentMessage) => {
            pinnedStatusMessageId = sentMessage.message_id;
            bot.pinChatMessage(userChatId, pinnedStatusMessageId).catch(() => {});
        });
    }
};

// ✅ Auto-Update Leaderboard Every 10 Seconds
setInterval(() => {
    if (userChatId && userMode[userChatId] === "leaderboard") {
        sendLeaderboard(userChatId);
    }
}, 8000);




// ✅ Function to Check for New Tokens & Send Alerts
const checkForNewTokens = () => {
    fs.readFile('dexscreener_data.json', 'utf8', (err, data) => {
        if (err) return;

        try {
            const jsonData = JSON.parse(data);
            const newTokens = [];

            jsonData.forEach(tokenData => {
                const tokenKey = `${tokenData.token}-${tokenData.poolAddress}`;
                if (!lastKnownTokens.has(tokenKey)) {
                    lastKnownTokens.add(tokenKey);
                    newTokens.push(tokenData);
                }
            });

            if (newTokens.length > 0 && userChatId && userMode[userChatId] === "alerts") {
                newTokens.forEach(token => {
                    const dexChart = `https://dexscreener.com/solana/${token.poolAddress}`;

                    bot.sendMessage(userChatId, `🚀 *New Token Alert!*\n━━━━━━━━━━━━━━━━━━
💎 *Token:* ${token.token}  
📆 *Age:* ${token.age}  
💰 *Price:* ${token.price}  
📊 *Liquidity:* ${token.liquidity}  
📈 *Market Cap:* ${token.marketCap}  
📊 *5m:* ${formatChange(token["5m Change"])}  |  *1h:* ${formatChange(token["1h Change"])}
🔄 *6h:* ${formatChange(token["6h Change"])}  |  *24h:* ${formatChange(token["24h Change"])}
🔗 *Pool:* \`${token.poolAddress}\`
📈 [**DexScreener Chart**](${dexChart})`, {
                        parse_mode: "Markdown",
                        disable_web_page_preview: true
                    });
                });
            }
        } catch (parseError) {
            console.error("❌ Error parsing JSON:", parseError);
        }
    });
};

// ✅ Auto-Check for New Tokens Every 5 Seconds
setInterval(checkForNewTokens, 5000);

// ✅ Start Monitoring Server Logs
monitorServerLogs();

console.log("📡 Monitoring and updating leaderboard...");