$content = Get-Content -Path "public/css/style.css" -Raw
$newContent = $content -replace '\.\./fonts/Roboto/', '/fonts/Roboto/'
$newContent | Out-File -FilePath "public/css/style.css" -Encoding utf8 -NoNewline
