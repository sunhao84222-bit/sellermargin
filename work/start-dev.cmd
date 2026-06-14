@echo off
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;%PATH%"
cd /d "C:\Users\Sun\Documents\Codex\2026-06-12\files-mentioned-by-the-user-sellermargin"
"C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000
