$path = "C:\sportstripz\src\pages\TripPlanner.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$old = '            <div>{renderMarkdown(result)}</div>'
$new = '            <div>{renderMarkdown(result)}</div>
            <div style={{ marginTop: 24, padding: 16, background: "#1a1500", border: "1px solid #F5C518", borderRadius: 8, color: "#F5C518", fontSize: 13, lineHeight: 1.6 }}>
              <strong>Important:</strong> Visa rules and entry requirements change frequently and can vary by passport, length of stay, and purpose of travel. This AI-generated information may contain errors. Always confirm directly with the destination country''s embassy, consulate, or official government website before booking flights or making travel arrangements.
            </div>'

$content = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - disclaimer added"