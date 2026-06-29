# Fix App.jsx emoji encoding and add docs routing
$content = Get-Content src\App.jsx -Raw -Encoding UTF8
$content = $content -replace [regex]::Escape("ðŸ†"), "🏆"
$content = $content -replace [regex]::Escape("ðŸ "), "🏠"
$content = $content -replace [regex]::Escape("ðŸ—º"), "🗺"
$content = $content -replace [regex]::Escape("âœˆ"), "✈"
$content = $content -replace [regex]::Escape("ðŸ'°"), "💰"
$content = $content -replace [regex]::Escape("ðŸ"„"), "📄"
$content = $content -replace [regex]::Escape("â€""), "—"
Set-Content src\App.jsx $content -Encoding UTF8
Write-Host "Done"