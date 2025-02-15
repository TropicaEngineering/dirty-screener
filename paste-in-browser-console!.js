const ws = new WebSocket("ws://localhost:8080");

ws.onopen = () => {
    console.log("✅ Connected to WebSocket Server");
    
    // Function to send updated DexScreener data
    const sendData = () => {
        try {
            const rows = document.querySelectorAll('.ds-dex-table-row'); // Get all table rows
            let data = [];

            rows.forEach(row => {
                const token = row.querySelector('.ds-dex-table-row-base-token-symbol')?.innerText || "Unknown";
                const age = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-pair-age span')?.innerText || "N/A";
                const price = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-price')?.innerText || "N/A";
                const liquidity = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-liquidity')?.innerText || "N/A";
                const marketCap = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-market-cap')?.innerText || "N/A";
                const volume = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-volume')?.innerText || "N/A";
                const fiveMinChange = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-price-change-m5 span')?.innerText || "N/A";
                const oneHourChange = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-price-change-h1 span')?.innerText || "N/A";
                const sixHourChange = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-price-change-h6 span')?.innerText || "N/A";
                const twentyFourHourChange = row.querySelector('.ds-table-data-cell.ds-dex-table-row-col-price-change-h24 span')?.innerText || "N/A";
                const pairUrl = row.getAttribute('href');
                
                // Extract pool address from URL (last part after /)
                let poolAddress = "N/A";
                if (pairUrl) {
                    const parts = pairUrl.split('/');
                    poolAddress = parts[parts.length - 1] || "N/A";
                }

                data.push({
                    token,
                    age,
                    price,
                    liquidity,
                    marketCap,
                    volume,
                    "5m Change": fiveMinChange,
                    "1h Change": oneHourChange,
                    "6h Change": sixHourChange,
                    "24h Change": twentyFourHourChange,
                    poolAddress: poolAddress,
                    url: pairUrl ? `https://dexscreener.com${pairUrl}` : "N/A"
                });
            });

            // Send data as JSON
            ws.send(JSON.stringify(data, null, 2));
            console.log("📡 Sent updated data to VSCode WebSocket server.");
        } catch (error) {
            console.error("❌ Error extracting data:", error);
        }
    };

    // Send initial data, then update every 3 seconds
    sendData();
    setInterval(sendData, 6000);
};

ws.onclose = () => console.log("❌ WebSocket Disconnected.");
ws.onerror = error => console.error("⚠️ WebSocket Error:", error);