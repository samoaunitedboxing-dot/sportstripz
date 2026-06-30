$path = "C:\sportstripz\src\pages\TripPlanner.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$old = 'Be specific, practical, and globally accurate. Use your knowledge of passport visa restrictions worldwide. Use markdown formatting with ## for section headers and **bold** for key terms.'
$new = 'IMPORTANT: Before answering the VISA REQUIREMENTS section, use the web_search tool to find current, official visa requirements for a ' + '${form.passport}' + ' passport holder travelling to ' + '${form.destination}' + '. Search official government or embassy sources. Do not rely on memory alone for visa rules - they change frequently and being wrong could strand a sports team at the border. Cite what you found from your search. Be specific, practical, and globally accurate. Use markdown formatting with ## for section headers and **bold** for key terms.'

$content = $content.Replace($old, $new)

$content = $content -replace 'max_tokens: 1500', 'max_tokens: 2500'

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - prompt updated to require web search"