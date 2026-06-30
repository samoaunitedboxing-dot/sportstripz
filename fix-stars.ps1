$path = "C:\sportstripz\src\pages\AccommodationFinder.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$oldStars = 'const stars = \(n\) => "[^"]*"\.repeat\(Math\.floor\(n\)\) \+ "[^"]*"\.repeat\(5 - Math\.floor\(n\)\);'
$newStars = 'const stars = (n) => "*".repeat(Math.floor(n)) + "-".repeat(5 - Math.floor(n));'
$content = [regex]::Replace($content, $oldStars, $newStars)

$content = $content.Replace([char]0x00E2 + [char]0x20AC + [char]0x201D, "-")

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - accommodation stars and dash fixed"