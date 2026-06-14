$Root = "C:\Users\Sun\Documents\Codex\2026-06-12\files-mentioned-by-the-user-sellermargin"
$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;$env:Path"
Set-Location $Root
"starting dev server $(Get-Date -Format o)" | Out-File "$Root\work\dev-server.ps1.log" -Append
try {
  & "C:\Program Files\nodejs\npm.cmd" run dev -- --hostname 127.0.0.1 --port 3000 *>> "$Root\work\dev-server.ps1.log"
  "npm exited with code $LASTEXITCODE" | Out-File "$Root\work\dev-server.ps1.log" -Append
} catch {
  $_ | Out-File "$Root\work\dev-server.ps1.log" -Append
}
