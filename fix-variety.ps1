$path = "C:\sportstripz\src\pages\AccommodationFinder.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$old = 'Return ONLY a JSON array with exactly 4 accommodation options suitable for sports teams in ${search.city}. Each object must have these exact fields:'
$new = 'Return ONLY a JSON array with 8 to 10 accommodation options suitable for sports teams in ${search.city}. Include a genuine mix across types - at least 2 hotels, 2 hostels, 2 apartments, and 1-2 guesthouses if available in that city. Cover a range of price points from budget to mid-range to higher-end, not all similar prices. Each object must have these exact fields:'

$content = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - accommodation variety expanded"