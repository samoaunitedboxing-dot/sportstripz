$fix = @'
const NAV_ITEMS = [
  { id: "home", label: "Tournaments", icon: "" },
  { id: "accommodation", label: "Accommodation", icon: "" },
  { id: "planner", label: "Trip Planner", icon: "" },
  { id: "flights", label: "Flight Finder", icon: "" },
  { id: "budget", label: "Budget Tool", icon: "" },
  { id: "docs", label: "Doc Generator", icon: "" },
]
'@

$appPath = "C:\sportstripz\src\App.jsx"
$content = Get-Content $appPath -Raw -Encoding UTF8
$old = 'const NAV_ITEMS = \[[\s\S]*?\]'
$content = [regex]::Replace($content, $old, $fix)
[System.IO.File]::WriteAllText($appPath, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - icons removed"