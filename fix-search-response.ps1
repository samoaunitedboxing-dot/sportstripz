$path = "C:\sportstripz\src\pages\TripPlanner.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$old = 'if (data.content && data.content[0] && data.content[0].text) {
        setResult(data.content[0].text);
      } else if (data.error) {'
$new = 'if (data.content) {
        const textBlocks = data.content.filter(b => b.type === "text").map(b => b.text);
        const combined = textBlocks.join("\n\n");
        if (combined) {
          setResult(combined);
        } else {
          setError("No text content in response. Please try again.");
        }
      } else if (data.error) {'

$content = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - response handling fixed for search results"