$path = "C:\sportstripz\src\App.jsx"
$content = Get-Content $path -Raw -Encoding UTF8

$old = '<div style={eyebrow}>The complete platform for travelling sports teams</div>
                  <h1 style={heroTitle}>
                    Find your next<br /><span style={{ color: ''#F5C518'' }}>international bout.</span>
                  </h1>
                  <p style={heroSub}>Tournaments, accommodation, flights, visas, and budgets - all in one place. Built for coaches.</p>

                  <div style={heroStats}>
                    <Stat num={tournaments.length} label="tournaments" />
                    <div style={statDiv} />
                    <Stat num={totalReviews} label="coach reviews" />
                    <div style={statDiv} />
                    <Stat num={new Set(tournaments.map(t => t.country)).size} label="countries" />
                  </div>'

$new = '<div style={eyebrow}>Built by a coach who got stuck at customs with no visa letter</div>
                  <h1 style={heroTitle}>
                    Never get stranded<br /><span style={{ color: ''#F5C518'' }}>at the border again.</span>
                  </h1>
                  <p style={heroSub}>AI-powered trip planning, visa warnings, and accommodation built specifically for coaches taking athletes overseas. Type your sport, your passport, and your destination - get a complete travel plan in seconds.</p>

                  <div style={heroStats}>
                    <Stat num={tournaments.length} label="tournaments" />
                    <div style={statDiv} />
                    <Stat num={totalReviews} label="coach reviews" />
                    <div style={statDiv} />
                    <Stat num={new Set(tournaments.map(t => t.country)).size} label="countries" />
                  </div>'

$content = $content.Replace($old, $new)
[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - hero rewritten"