import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { MOCK_ROUTES } from '../mockRoutes'

const PASSPORT_WARNINGS = {
  'samoa': {
    'Schengen': 'Samoan passport holders require a Schengen visa for most EU countries. Serbia, Bosnia & Herzegovina, and Bulgaria are visa-free alternatives.',
    'Singapore (SIN)': 'Samoan passport: visa-free transit in Singapore under 96 hours.',
    'Dubai (DXB)': 'Samoan passport: check UAE transit visa requirements — contact Emirates directly before booking.',
    'Sydney (SYD)': 'Samoan passport: Australian transit visa required — apply free online at immi.homeaffairs.gov.au',
    'Auckland (AKL)': 'Samoan passport: NZeTA required for NZ transit — apply online at nzeta.immigration.govt.nz ($17 NZD)',
    'United States': 'Samoan passport: US visa required (B1/B2 tourist or P1 athlete visa). Apply at US Embassy Apia. Allow 12+ weeks.',
  },
  'tonga': {
    'Schengen': 'Tongan passport holders require a Schengen visa for most EU countries.',
    'United States': 'Tongan passport: US visa required. Apply at nearest US Embassy.',
  },
  'fiji': {
    'Schengen': 'Fijian passport: Schengen visa required for most EU countries.',
    'United States': 'Fijian passport: US visa required.',
  },
  'png': {
    'Schengen': 'PNG passport: Schengen visa required.',
    'United States': 'PNG passport: US visa required.',
  },
}

function getWarnings(passportCountry, routes) {
  const key = passportCountry.toLowerCase().replace(/[^a-z]/g, '')
  const warnings = PASSPORT_WARNINGS[key] || {}
  const triggered = []

  routes.forEach(route => {
    // Check transit hubs
    ;(route.transit_hubs || []).forEach(hub => {
      Object.entries(warnings).forEach(([zone, msg]) => {
        if (hub.includes(zone.split(' ')[0]) || zone.includes(hub.split(' ')[0])) {
          triggered.push({ hub, message: msg })
        }
      })
    })
    // Check destination country for Schengen
    const schengenCountries = ['Germany','France','Italy','Spain','Netherlands','Belgium','Austria','Poland','Croatia','Greece','Portugal','Sweden','Norway','Denmark','Finland','Czech Republic','Slovakia','Hungary']
    if (schengenCountries.some(c => route.destination_country?.includes(c)) && warnings['Schengen']) {
      triggered.push({ hub: 'Schengen Zone', message: warnings['Schengen'] })
    }
    // US
    if (route.destination_country?.includes('United States') && warnings['United States']) {
      triggered.push({ hub: 'United States', message: warnings['United States'] })
    }
  })

  return [...new Map(triggered.map(w => [w.hub, w])).values()]
}

function bookingUrlFor(route, month) {
  var q = "Flights from " + (route.departure_region || "") + " to " + (route.destination_city || "") + " in " + (month || "")
  return "https://www.google.com/travel/flights?q=" + encodeURIComponent(q)
}

export default function FlightFinder({ onNavigate }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ departure: '', destination: '', passportCountry: '', groupSize: 5, month: 'March', budget: 1500 })
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [warnings, setWarnings] = useState([])
  const [tip, setTip] = useState('')
  const [tipRoute, setTipRoute] = useState(null)
  const [tipSaved, setTipSaved] = useState(false)
  const [expandedRoute, setExpandedRoute] = useState(null)
  const [expandedHub, setExpandedHub] = useState(null)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function searchRoutes() {
    setLoading(true)
    try {
      let data = []
      if (supabase) {
        const dep = form.departure.toLowerCase()
        const dest = form.destination.toLowerCase()
        const { data: rows } = await supabase
          .from('known_routes')
          .select('*')
          .or(`departure_region.ilike.%${dep}%,departure_country.ilike.%${dep}%`)
          .or(`destination_city.ilike.%${dest}%,destination_country.ilike.%${dest}%`)
          .order('avg_cost_usd', { ascending: true })
          .limit(6)
        data = rows || []
      }
      if (!data.length) {
        data = MOCK_ROUTES.filter(r =>
          (r.departure_region.toLowerCase().includes(form.departure.toLowerCase()) ||
           (r.departure_country || '').toLowerCase().includes(form.departure.toLowerCase())) &&
          (r.destination_city.toLowerCase().includes(form.destination.toLowerCase()) ||
           r.destination_country.toLowerCase().includes(form.destination.toLowerCase()))
        )
        if (!data.length) {
        const prompt = `You are SportsTripz flight routing expert. Generate realistic flight route options for a travelling sports team.

SEARCH REQUEST:
- Departure: ${form.departure}
- Destination: ${form.destination}
- Passport: ${form.passportCountry}
- Group size: ${form.groupSize}
- Travel month: ${form.month}
- Budget per person USD: ${form.budget}

Return ONLY a JSON array with 6 realistic route options, covering a genuine range of airlines, transit hubs, and price points (budget through premium) - not 6 near-identical routes. Each object must have these exact fields:
{"departure_region":"${form.departure}","departure_country":"${form.departure}","destination_city":"City name","destination_country":"${form.destination}","route_summary":"Airline(s) and routing e.g. via Istanbul (IST)","airlines":["Airline 1","Airline 2"],"transit_hubs":["City (CODE)"],"avg_cost_usd":1400,"cost_range":"e.g. $950-$1900","duration":"e.g. 26-34 hours total","notes":"Best value / visa tips / booking advice","coach_tip":"Practical tip for booking as a team"}
Return ONLY the JSON array. No other text. No markdown.`;

        try {
          const res = await fetch("/api/claude", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "claude-sonnet-4-6",
              max_tokens: 3000,
              messages: [{ role: "user", content: prompt }]
            })
          });
          const aiData = await res.json();
          const textBlock = (aiData.content || []).find(b => b.type === "text");
          if (textBlock && textBlock.text) {
            const clean = textBlock.text.trim().replace(/```json|```/g, "").trim();
            data = JSON.parse(clean);
          } else {
            data = MOCK_ROUTES.slice(0, 6);
          }
        } catch (e) {
          data = MOCK_ROUTES.slice(0, 6);
        }
      }
      }
      const sorted = data.sort((a, b) => (a.avg_cost_usd || 0) - (b.avg_cost_usd || 0)).slice(0, 6)
      setRoutes(sorted)
      setWarnings(getWarnings(form.passportCountry, sorted))
    } finally {
      setLoading(false)
      setStep(4)
    }
  }

  async function saveCommunityTip(routeId) {
    if (!tip.trim()) return
    try {
      if (supabase) {
        await supabase.from('known_routes').update({
          community_tips: supabase.raw(`array_append(community_tips, '${tip.replace(/'/g, "''")}')`)
        }).eq('id', routeId)
      }
      setTipSaved(true)
      setTip('')
      setTimeout(() => setTipSaved(false), 3000)
    } catch {
      setTipSaved(true)
    }
  }

  const steps = [
    { num: 1, label: 'Departure' },
    { num: 2, label: 'Destination' },
    { num: 3, label: 'Passport' },
    { num: 4, label: 'Results' },
  ]

  return (
    <div style={page}>
      <div style={pageHeader}>
        <button style={backBtn} onClick={() => onNavigate('home')}>← Back to tournaments</button>
        <div style={headerBadge}>Route Intelligence</div>
        <h1 style={pageTitle}>Group Flight Finder</h1>
        <p style={pageSub}>Find the best flight routes for your team. We flag visa restrictions based on your passport country automatically.</p>
      </div>

      {/* Step indicator */}
      <div style={stepBar}>
        {steps.map((s, i) => (
          <div key={s.num} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                ...stepCircle,
                background: step >= s.num ? '#F5C518' : '#1C1C1C',
                color: step >= s.num ? '#000' : '#888',
                border: step === s.num ? '2px solid #F5C518' : '2px solid #2A2A2A',
                cursor: step > s.num ? 'pointer' : 'default',
              }}
                onClick={() => step > s.num && setStep(s.num)}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <div style={{ color: step >= s.num ? '#F5C518' : '#555', fontSize: 11, whiteSpace: 'nowrap' }}>{s.label}</div>
            </div>
            {i < steps.length - 1 && <div style={{ ...stepLine, background: step > s.num ? '#F5C518' : '#2A2A2A' }} />}
          </div>
        ))}
      </div>

      <div style={wizardWrap}>
        {/* STEP 1 */}
        {step === 1 && (
          <WizardCard title="Where are you travelling FROM?" step={1}>
            <p style={stepSub}>Enter your departure country or city</p>
            <input style={bigInput} placeholder="e.g. Samoa, Fiji, Ireland, Germany..." autoFocus
              value={form.departure} onChange={e => set('departure', e.target.value)} />
            <div style={quickPicks}>
              {['Samoa','Fiji','Tonga','Papua New Guinea','New Zealand','Australia','Ireland','United Kingdom'].map(c => (
                <button key={c} style={quickBtn} onClick={() => set('departure', c)}>{c}</button>
              ))}
            </div>
            <div style={stepFooter}>
              <div />
              <button style={btnNext} onClick={() => form.departure && setStep(2)} disabled={!form.departure}>
                Next: Destination →
              </button>
            </div>
          </WizardCard>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <WizardCard title="Where are you travelling TO?" step={2}>
            <p style={stepSub}>Enter your tournament destination</p>
            <input style={bigInput} placeholder="e.g. Europe, Belgrade, Warsaw, USA..." autoFocus
              value={form.destination} onChange={e => set('destination', e.target.value)} />
            <div style={quickPicks}>
              {['Europe','Belgrade Serbia','Warsaw Poland','Sarajevo Bosnia','Sofia Bulgaria','Los Angeles USA','Sydney Australia'].map(c => (
                <button key={c} style={quickBtn} onClick={() => set('destination', c)}>{c}</button>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <label style={fieldLabel}>Group size</label>
              <input style={{ ...bigInput, marginTop: 8 }} type="number" min="2" max="50"
                value={form.groupSize} onChange={e => set('groupSize', parseInt(e.target.value))}
                placeholder="Total number of travellers" />
            </div>
            <div style={stepFooter}>
              <button style={btnBack} onClick={() => setStep(1)}>← Back</button>
              <button style={btnNext} onClick={() => form.destination && setStep(3)} disabled={!form.destination}>
                Next: Passport →
              </button>
            </div>
          </WizardCard>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <WizardCard title="What passport will you travel on?" step={3}>
            <p style={stepSub}>This is critical — we'll flag any visa requirements and transit restrictions</p>
            <input style={{ ...bigInput, borderColor: form.passportCountry ? '#F5C518' : '#2A2A2A' }}
              placeholder="e.g. Samoa, Fiji, Ireland, Germany, USA..."
              autoFocus value={form.passportCountry} onChange={e => set('passportCountry', e.target.value)} />
            <div style={quickPicks}>
              {['Samoa','Fiji','Tonga','Papua New Guinea','New Zealand','Australia','Ireland','United Kingdom','Germany','United States'].map(c => (
                <button key={c} style={{ ...quickBtn, ...(form.passportCountry === c ? quickBtnActive : {}) }}
                  onClick={() => set('passportCountry', c)}>{c}</button>
              ))}
            </div>
            {form.passportCountry && ['samoa','fiji','tonga','png','papua'].some(p => form.passportCountry.toLowerCase().includes(p)) && (
              <div style={passportAlert}>
                <strong style={{ color: '#F5C518' }}>Pacific Island passport detected.</strong>
                <p style={{ margin: '6px 0 0', color: '#ccc', fontSize: 13, lineHeight: 1.5 }}>
                  We'll check Schengen visa requirements, US visa requirements, and transit visa needs for your full routing. Many European tournaments are accessible without Schengen visas — Serbia, Bosnia, and Bulgaria are popular options.
                </p>
              </div>
            )}
            <div style={stepFooter}>
              <button style={btnBack} onClick={() => setStep(2)}>← Back</button>
              <button style={btnNext} onClick={searchRoutes} disabled={!form.passportCountry || loading}>
                {loading ? 'Searching routes…' : 'Find Routes →'}
              </button>
            </div>
          </WizardCard>
        )}

        {/* STEP 4 — RESULTS */}
        {step === 4 && (
          <div>
            {/* Visa warnings */}
            {warnings.length > 0 && (
              <div style={warningSection}>
                {warnings.map((w, i) => (
                  <div key={i} style={warningBanner}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#FF8080', marginBottom: 4 }}>
                          {form.passportCountry} passport — {w.hub} restriction
                        </div>
                        <p style={{ margin: 0, color: '#ccc', fontSize: 14, lineHeight: 1.5 }}>{w.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={resultsHeader}>
              <div>
                <h2 style={resHeading}>Top Routes Found</h2>
                <p style={{ color: '#888', fontSize: 14 }}>
                  {form.departure} → {form.destination} · {form.groupSize} travellers · {form.passportCountry} passport
                </p>
              </div>
              <button style={btnBack} onClick={() => setStep(3)}>← Refine search</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {routes.map((route, i) => (
                <div key={route.id || i} style={{ ...routeCard, ...(i === 0 ? routeCardBest : {}), cursor: "pointer" }} onClick={() => setExpandedRoute(expandedRoute === (route.id || i) ? null : (route.id || i))}>
                  {i === 0 && <div style={bestBadge}>⭐ Best Value</div>}
                  <div style={routeTop}>
                    <div style={{ flex: 1 }}>
                      <div style={routeRegions}>
                        {route.departure_region} <span style={{ color: '#F5C518' }}>→</span> {route.destination_city}, {route.destination_country}
                      </div>
                      <div style={routeViaLine}>
                        via {(route.transit_hubs || []).join(' + ')}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={routeCost}>${route.avg_cost_usd?.toLocaleString()}</div>
                      <div style={{ color: '#888', fontSize: 12 }}>per person avg</div>
                      {route.cost_range_min && (
                        <div style={{ color: '#666', fontSize: 11 }}>${route.cost_range_min}–${route.cost_range_max} range</div>
                      )}
                    </div>
                  </div>

                  <div style={airlineRow}>
                    {(route.airlines || []).map((a, j) => <span key={j} style={airlineChip}>{a}</span>)}
                    {route.flight_hours && <span style={{ color: '#666', fontSize: 12, marginLeft: 'auto' }}>⏱ {route.flight_hours}</span>}
                  </div>

                  <a
                    href={bookingUrlFor(route, form.month)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={bookNowBtn}
                  >
                    Search &amp; Book Flights
                  </a>

                  {route.tips && <p style={routeTips}>{route.tips}</p>}

                  {route.visa_notes && (
                    <div style={routeVisaBox}>
                      <div style={{ color: '#51CF66', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>🛂 Visa Notes</div>
                      <p style={{ margin: 0, color: '#ccc', fontSize: 13, lineHeight: 1.5 }}>{route.visa_notes}</p>
                    </div>
                  )}

                  {/* Community tips */}
                  {(route.community_tips || []).length > 0 && (
                    <div style={communitySection}>
                      <div style={{ color: '#F5C518', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>💬 Coach Tips</div>
                      {route.community_tips.map((ct, j) => (
                        <div key={j} style={communityTip}>→ {ct}</div>
                      ))}
                    </div>
                  )}

                  {/* Add tip */}
                  {tipRoute === route.id ? (
                    <div style={addTipBox}>
                      <textarea style={tipInput} placeholder="Share a routing tip for other coaches..."
                        value={tip} onChange={e => setTip(e.target.value)} rows={2} />
                      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button style={btnGoldSm} onClick={() => saveCommunityTip(route.id)}>
                          {tipSaved ? 'Saved! ✓' : 'Share tip'}
                        </button>
                        <button style={btnGhostSm} onClick={() => setTipRoute(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                    {expandedRoute === (route.id || i) && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #333" }}>
                      <div style={{ color: "#F5C518", fontWeight: 700, marginBottom: 8 }}>Route Details</div>
                      <div style={{ color: "#ccc", fontSize: 13, marginBottom: 10 }}>
                        Tap a layover below for more info. Confirm exact connection times when booking.
                      </div>
                      {(route.transit_hubs || []).map((hub, hi) => {
                        const hubKey = `${route.id || i}-${hi}`;
                        return (
                          <div key={hi}>
                            <div
                              onClick={(e) => { e.stopPropagation(); setExpandedHub(expandedHub === hubKey ? null : hubKey); }}
                              style={{ background: "#242830", padding: "8px 12px", borderRadius: 6, marginBottom: 6, fontSize: 13, cursor: "pointer" }}
                            >
                              <strong style={{ color: "#F5C518" }}>{hub}</strong> layover
                            </div>
                            {expandedHub === hubKey && (
                              <div style={{ background: "#1a1d24", padding: "8px 12px", borderRadius: 6, marginBottom: 6, fontSize: 12, color: "#aaa" }}>
                                Typical layover: 2-4 hours. Allow buffer time for transit visa checks and terminal transfers at {hub}.
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <div style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
                        Boxing gear / sports equipment may incur excess baggage fees — confirm directly with the airline for team bookings.
                      </div>
                    </div>
                  )}
                  <button style={addTipBtn} onClick={() => setTipRoute(route.id)}>
                      + Add a routing tip
                    </button>
                  </>
                )}
                </div>
              ))}
            </div>

            {routes.length === 0 && (
              <div style={noResults}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ color: '#eee' }}>No routes found for this combination</h3>
                <p style={{ color: '#888', marginTop: 8 }}>Try broader search terms — e.g. "Europe" instead of a specific city</p>
                <button style={{ ...btnGoldSm, marginTop: 16 }} onClick={() => setStep(1)}>Start over</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function WizardCard({ title, step, children }) {
  return (
    <div style={wizardCard}>
      <div style={wizardStep}>Step {step} of 3</div>
      <h2 style={wizardTitle}>{title}</h2>
      {children}
    </div>
  )
}

// styles
const page = { maxWidth: 860, margin: '0 auto', padding: '0 20px 80px' }
const pageHeader = { textAlign: 'center', padding: '48px 20px 32px', borderBottom: '1px solid #2A2A2A', marginBottom: 40 }
const backBtn = { background: 'none', border: '1px solid #2A2A2A', borderRadius: 6, color: '#888', padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20 }
const headerBadge = { display: 'inline-block', background: '#0E110E', color: '#51CF66', border: '1px solid #1A3D1A', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }
const pageTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: 3, color: '#E8E8E8', margin: '0 0 12px' }
const pageSub = { color: '#888', fontSize: 15, lineHeight: 1.7 }
const stepBar = { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 0, marginBottom: 40 }
const stepCircle = { width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, transition: 'all 0.2s' }
const stepLine = { width: 60, height: 2, margin: '17px 8px 0', transition: 'background 0.3s' }
const wizardWrap = { maxWidth: 600, margin: '0 auto' }
const wizardCard = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: 36 }
const wizardStep = { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }
const wizardTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, letterSpacing: 2, color: '#E8E8E8', margin: '0 0 6px' }
const stepSub = { color: '#888', fontSize: 14, marginBottom: 20 }
const bigInput = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 10, color: '#E8E8E8', padding: '14px 18px', fontSize: 16, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s' }
const quickPicks = { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }
const quickBtn = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 20, color: '#888', padding: '5px 14px', fontSize: 13, cursor: 'pointer' }
const quickBtnActive = { background: '#1A1200', border: '1px solid #F5C518', color: '#F5C518' }
const stepFooter = { display: 'flex', justifyContent: 'space-between', marginTop: 28 }
const btnNext = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '11px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }
const btnBack = { background: 'none', border: '1px solid #2A2A2A', borderRadius: 8, color: '#888', padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }
const fieldLabel = { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }
const passportAlert = { background: '#1A1200', border: '1px solid #3A2E00', borderRadius: 8, padding: '14px 16px', marginTop: 14 }
const warningSection = { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }
const warningBanner = { background: '#1A0A0A', border: '1px solid #5A2020', borderRadius: 10, padding: '16px 18px' }
const resultsHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }
const resHeading = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, letterSpacing: 2, color: '#E8E8E8', margin: 0 }
const routeCard = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px 22px', position: 'relative' }
const routeCardBest = { border: '1px solid #F5C518' }
const bestBadge = { position: 'absolute', top: -12, left: 20, background: '#F5C518', color: '#000', borderRadius: 20, padding: '2px 14px', fontSize: 12, fontWeight: 700 }
const routeTop = { display: 'flex', gap: 16, justifyContent: 'space-between', marginBottom: 12 }
const routeRegions = { fontWeight: 700, fontSize: 16, color: '#E8E8E8', marginBottom: 4 }
const routeViaLine = { color: '#888', fontSize: 13 }
const routeCost = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, color: '#F5C518', letterSpacing: 1 }
const airlineRow = { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12, alignItems: 'center' }
const airlineChip = { background: '#1C1C1C', border: '1px solid #333', borderRadius: 4, padding: '3px 10px', fontSize: 12, color: '#bbb' }
const bookNowBtn = { display: 'inline-block', background: '#F5C518', color: '#000', border: 'none', borderRadius: 6, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', marginBottom: 12 }
const routeTips = { color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: '0 0 12px' }
const routeVisaBox = { background: '#0E110E', border: '1px solid #1A2E1A', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }
const communitySection = { background: '#0D0D10', border: '1px solid #252530', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }
const communityTip = { color: '#ccc', fontSize: 13, padding: '3px 0', lineHeight: 1.5 }
const addTipBox = { marginTop: 12 }
const tipInput = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '10px 14px', fontSize: 13, width: '100%', fontFamily: 'inherit', resize: 'none' }
const addTipBtn = { background: 'none', border: '1px dashed #333', borderRadius: 6, color: '#666', padding: '6px 14px', fontSize: 12, cursor: 'pointer', marginTop: 8 }
const btnGoldSm = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 6, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
const btnGhostSm = { background: 'none', border: '1px solid #333', borderRadius: 6, color: '#888', padding: '7px 14px', fontSize: 13, cursor: 'pointer' }
const noResults = { textAlign: 'center', padding: '60px 20px', color: '#888' }
