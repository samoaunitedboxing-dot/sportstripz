$path = "C:\sportstripz\src\pages\AccommodationFinder.jsx"
$content = Get-Content $path -Raw -Encoding UTF8
$content = $content -replace '8 to 10 accommodation options', '6 accommodation options'
$content = $content -replace 'at least 2 hotels, 2 hostels, 2 apartments, and 1-2 guesthouses if available', 'a mix of hotels, hostels, and apartments'
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - reduced to 6 results to avoid timeout"