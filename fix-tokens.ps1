$path = "C:\sportstripz\src\pages\AccommodationFinder.jsx"
$content = Get-Content $path -Raw -Encoding UTF8
$content = $content -replace 'max_tokens: 1500', 'max_tokens: 3000'
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - token limit increased"