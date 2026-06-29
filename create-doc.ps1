$f = "src\App.jsx"
$c = Get-Content $f -Raw
$c = $c -replace "icon: '[^']*'", "icon: ''"
Set-Content $f $c -Encoding UTF8
Write-Host "Done"