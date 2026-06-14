@echo off
set "PROJECT=C:\Users\Sun\Documents\Codex\2026-06-12\files-mentioned-by-the-user-sellermargin"
cd /d "%PROJECT%"
echo Starting SellerMargin local website...
echo.
echo Keep the server window open while viewing the website.
echo http://localhost:3000/zh/landed-cost-calculator
echo.
start "SellerMargin Dev Server" cmd /k ""C:\Program Files\nodejs\npm.cmd" run dev"
timeout /t 5 /nobreak > nul
start "" "http://localhost:3000/zh/landed-cost-calculator"
