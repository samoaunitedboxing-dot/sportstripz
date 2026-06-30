$path = "C:\sportstripz\src\App.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$content = [regex]::Replace($content, 'The complete platform for travelling sports teams', 'Built by a coach who got stuck at customs with no visa letter')
$content = [regex]::Replace($content, "Find your next<br /><span style=\{\{ color: '#F5C518' \}\}>international bout\.</span>", "Never get stranded<br /><span style={{ color: '#F5C518' }}>at the border again.</span>")
$content = [regex]::Replace($content, 'Tournaments, accommodation, flights, visas, and budgets - all in one place\. Built for coaches\.', 'AI-powered trip planning, visa warnings, and accommodation built specifically for coaches taking athletes overseas. Type your sport, your passport, and your destination - get a complete travel plan in seconds.')

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - hero rewritten v2"