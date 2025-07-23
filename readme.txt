============================================================
                        DIRTY-SCREENER
            Live DexScreener Export to Telegram
                    Created by Tropica dev
============================================================

WHAT IS DIRTY-SCREENER?
------------------------
Dirty-Screener is a real-time Telegram bot that exports filtered token pairs 
from DexScreener into Telegram without using an official API. This allows 
users to receive live alerts for new pairs directly on their phone.

WHY WAS IT BUILT?
-----------------
DexScreener does not provide an API for real-time filtered tokens.
Scraping is unreliable and gets blocked. This tool injects JavaScript into 
your browser console, which sends data to a local WebSocket server. 
The Telegram bot then reads the data and pushes it to your Telegram chat.

MAIN FEATURES:
--------------
- Leaderboard Mode → View top token rankings sorted by 5-minute % change.
- New Token Alerts → Get instant alerts for new pairs matching your 
  DexScreener filters.
- Auto-Refreshing Data → The leaderboard updates every 8 seconds.
- Server Monitoring → Bot detects when the system is ONLINE or OFFLINE 
  and pins a status update.

============================================================
                 INSTALLATION & SETUP GUIDE
============================================================

1. INSTALL NODE.JS
-------------------
Check if Node.js is installed:

    node -v

If not, download & install it from:

    https://nodejs.org

2. CLONE THE PROJECT FROM GITHUB
---------------------------------
Run the following commands:

    git clone https://github.com/tropicaengineering/dirty-screener.git
    cd dirty-screener

3. INSTALL DEPENDENCIES
-----------------------
Run:

    npm install

This installs:
- node-telegram-bot-api → Telegram API support
- ws → WebSocket support
- fs → File system operations

4. CONFIGURE YOUR TELEGRAM BOT
-------------------------------
1. Open `telegram-bot.js`
2. Replace `BOT_TOKEN` with your actual Telegram bot token:

    const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

3. Save the file.

5. START THE WEBSOCKET SERVER
------------------------------
Run the server in VSCode or terminal:

    node server.js

If successful, you should see:

    WebSocket Server is running…
    Connected to WebSocket Server

6. LOAD DEXSCREENER IN YOUR BROWSER
------------------------------------
1. Open DexScreener in your browser.
2. Press `F12` (or `Ctrl + Shift + I`) to open the Developer Console.
3. Copy-paste the script from `paste-in-browser-console.js` and press Enter.
4. You should see:

    Connected to WebSocket Server
    Sent updated data to WebSocket

7. START THE TELEGRAM BOT
--------------------------
Run:

    node telegram-bot.js

You should see:

    Telegram bot is running…
    Monitoring and updating leaderboard…

8. ADD THE BOT TO YOUR TELEGRAM GROUP
--------------------------------------
1. Create a new group in Telegram.
2. Add the bot to the group.
3. Give it admin permissions so it can send messages.

============================================================
                   USAGE & AVAILABLE COMMANDS
============================================================

COMMANDS:

| Command       | Description                                 |
|--------------|---------------------------------------------|
| /leaderboard | View the live token rankings.              |
| /alerts      | Enable real-time new token alerts.         |
| /help        | Show bot instructions & available commands.|

REAL-TIME FEATURES:

- Leaderboard Auto-Updates → Updates every 8 seconds.
- Instant New Token Alerts → Checks for new tokens every 5 seconds.
- Server Online/Offline Monitoring → Pins a status message when the bot 
  is ONLINE or OFFLINE.

============================================================
                 CREDIT & ATTRIBUTION
============================================================

This project was created by Tropica Engineering.  
If you find it useful, we appreciate a mention or link back to our work.

============================================================
                 CONTRIBUTING
============================================================

1. Fork the repository.
2. Clone your fork:

    git clone https://github.com/YOUR_GITHUB_USERNAME/dirty-screener.git

3. Create a new branch:

    git checkout -b feature-name

4. Make changes & commit:

    git add .
    git commit -m "Added new feature"

5. Push to your branch:

    git push origin feature-name

6. Open a Pull Request on GitHub.

============================================================
                 LICENSE - MIT
============================================================

MIT License  

Copyright (c) 2024 Tropica Engineering  

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:  

The above copyright notice and this permission notice shall be included  
in all copies or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL  
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN  
THE SOFTWARE.

============================================================
              FUTURE UPDATES & IMPROVEMENTS
============================================================

- Multi-Chain Support (Ethereum, BSC, Solana, etc.)
- Custom Token Watchlist
- Advanced Trading Signals

============================================================
FINAL NOTES:
============================================================

- You are free to modify and distribute this software under the MIT License.
- If you find this tool useful, consider giving credit to Tropica Dev.
