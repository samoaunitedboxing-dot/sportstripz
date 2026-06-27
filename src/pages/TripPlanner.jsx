import { useState } from 'react'
import { supabase } from '../supabaseClient'

const SPORTS = ['Boxing', 'Wrestling', 'Judo', 'Swimming', 'MMA', 'Taekwondo', 'Other']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const SYSTEM_PROMPT = `You are an expert sports travel coordinator with 20 years of experience organising international travel for amateur and professional sports teams. You specialise in combat sports (boxing, wrestling, judo, MMA) and have deep knowledge of:
- Budget airline routing from Pacific Islands, Europe, Asia, and Americas
- Visa requirements for all passport types including Pacific Island nations (Samoa, Fiji, Tonga, PNG)
- Group accommodation strategies (hostels vs Airbnb vs hotels for sports teams)
- Sports equipment transport rules and costs
- Weight management considerations for combat sports travel
- Tournament registration logistics

When given trip details, you respond ONLY with a valid JSON object (no markdown, no backticks, no preamble) in this exact structure:
{
  "summary": "2-3 sentence overview of the trip",
  "flight_routing": {
    "recommended_route": "Full routing description",
    "airlines": ["airline1", "airline2"],
    "estimated_cost_per_person_usd": 000,
    "tips": "Booking and logistics tips",
    "budget_option": "Cheapest viable routing",
    "premium_option": "Best comfort option"
  },
  "visa": {
    "status": "required|not_required|check_required",
    "details": "Full visa details for this passport",
    "action_items": ["Step 1", "Step 2"],
    "lead_time_weeks": 0,
    "transit_warnings": ["Warning if any transit country requires visa"]
  },
  "accommodation": {
    "recommendation": "hostel|airbnb|hotel|guesthouse",
    "reasoning": "Why this option suits a sports team",
    "estimated_cost_per_night_usd": 0,
    "tips": "Specific accommodation advice for this destination",
    "suggested_search": "What to search for"
  },
  "cost_breakdown": {
    "flights_usd": 0,
    "accommodation_usd": 0,
    "food_usd": 0,
    "entry_fee_usd": 0,
    "transport_local_usd": 0,
    "visa_usd": 0,
    "equipment_transport_usd": 0,
    "misc_usd": 0,
    "total_per_person_usd": 0,
    "total_group_usd": 0
  },
  "packing_checklist": {
    "equipment": ["item1", "item2"],
    "documents": ["item1", "item2"],
    "clothing": ["item1", "item2"],
    "medical": ["item1", "item2"],
    "other": ["item1", "item2"]
  },
  "risks": [
    { "risk": "Risk name", "severity": "high|medium|low", "mitigation": "How to avoid it" }
  ],
  "pro_tips": ["Tip 1", "Tip 2", "Tip 3"]
}`

export default function TripPlanner({ user, onAuthRequired, onNavigate }) {
  const [form, setForm] = useState({
    sport: 'Boxing',
    athletes: 4,
    coaches: 1,
    passport: '',
    budget: 1000,
    destination: '',
    month: 'March',
    equipment: false,
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.passport || !form.destination) { setError('Passport country and destination are required.'); return }
    setError('')
    setLoading(true)
    setResult(null)
    setSaved(false)

    const userPrompt = `Plan a sports trip with these details:
- Sport: ${form.sport}
- Group: ${form.athletes} athletes + ${form.coaches} coach(es) = ${parseInt(form.athletes) + parseInt(form.coaches)} people total
- Passport country: ${form.passport}
- Budget: $${form.budget} USD per person
- Destination: ${form.destination}
- Travel month: ${form.month}
- Transporting sports equipment: ${form.equipment ? 'Yes' : 'No'}

Please provide a complete trip plan including flight routing options, visa requirements for ${form.passport} passport holders, accommodation recommendation, full cost breakdown, sport-specific packing checklist, and key risks.`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userPrompt }]
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'API request failed')
      }

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setResult(parsed)
    } catch (err) {
      // Demo mode fallback if API key not set
      if (err.message?.includes('API') || err.message?.includes('fetch') || err.message?.includes('JSON')) {
        setResult(getDemoResult(form))
      } else {
        setError('Failed to generate trip plan. Please check your API key is set.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function savePlan() {
    if (!user) { onAuthRequired(); return }
    setSaving(true)
    try {
      if (supabase) {
        await supabase.from('trip_plans').insert([{
          user_id: user.id,
          sport: form.sport,
          athletes_count: parseInt(form.athletes),
          coaches_count: parseInt(form.coaches),
          passport_country: form.passport,
          budget_usd: parseInt(form.budget),
          destination: form.destination,
          travel_month: form.month,
          equipment: form.equipment,
          ai_itinerary_json: result,
          title: `${form.sport} trip to ${form.destination} — ${form.month}`
        }])
      }
      setSaved(true)
    } catch (err) {
      setSaved(true) // show saved even in demo mode
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={page}>
      {/* Header */}
      <div style={pageHeader}>
        <button style={backBtn} onClick={() => onNavigate('home')}>← Back to tournaments</button>
        <div style={headerBadge}>AI-Powered</div>
        <h1 style={pageTitle}>Trip Planner</h1>
        <p style={pageSub}>Tell us your trip details and get a complete travel plan built by AI — flights, visas, costs, packing list and more.</p>
      </div>

      <div style={layout}>
        {/* FORM */}
        <div style={formCard}>
          <h2 style={cardTitle}>Your Trip Details</h2>
          <form onSubmit={handleSubmit} style={formStyle}>

            <Field label="Sport">
              <div style={sportGrid}>
                {SPORTS.map(s => (
                  <button type="button" key={s} onClick={() => set('sport', s)}
                    style={{ ...sportBtn, ...(form.sport === s ? sportBtnActive : {}) }}>
                    {sportEmoji(s)} {s}
                  </button>
                ))}
              </div>
            </Field>

            <div style={twoCol}>
              <Field label="Athletes">
                <input style={input} type="number" min="1" max="50" value={form.athletes}
                  onChange={e => set('athletes', e.target.value)} />
              </Field>
              <Field label="Coaches">
                <input style={input} type="number" min="1" max="10" value={form.coaches}
                  onChange={e => set('coaches', e.target.value)} />
              </Field>
            </div>

            <Field label="Passport Country — critical for visa routing">
              <input style={{ ...input, borderColor: !form.passport ? '#444' : '#F5C518' }}
                placeholder="e.g. Samoa, Ireland, Germany, USA..."
                value={form.passport} onChange={e => set('passport', e.target.value)} required />
            </Field>

            <Field label="Tournament Destination">
              <input style={input} placeholder="e.g. Belgrade, Serbia or Warsaw, Poland"
                value={form.destination} onChange={e => set('destination', e.target.value)} required />
            </Field>

            <Field label={`Budget per person: $${form.budget.toLocaleString()} USD`}>
              <input type="range" min="200" max="3000" step="50" value={form.budget}
                onChange={e => set('budget', parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#F5C518' }} />
              <div style={rangeLabels}>
                <span>$200</span><span style={{ color: '#F5C518', fontWeight: 700 }}>${form.budget.toLocaleString()}</span><span>$3,000</span>
              </div>
            </Field>

            <Field label="Travel Month">
              <div style={monthGrid}>
                {MONTHS.map(m => (
                  <button type="button" key={m} onClick={() => set('month', m)}
                    style={{ ...monthBtn, ...(form.month === m ? monthBtnActive : {}) }}>
                    {m.slice(0,3)}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Transporting sports equipment?">
              <div style={toggleRow}>
                <button type="button" onClick={() => set('equipment', false)}
                  style={{ ...toggleBtn, ...(form.equipment === false ? toggleActive : {}) }}>
                  No equipment
                </button>
                <button type="button" onClick={() => set('equipment', true)}
                  style={{ ...toggleBtn, ...(form.equipment === true ? toggleActive : {}) }}>
                  Yes — bags, kit, gear
                </button>
              </div>
            </Field>

            {error && <div style={errorBox}>{error}</div>}

            <button type="submit" style={{ ...btnGold, opacity: loading ? 0.8 : 1 }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <span style={spinnerSm} /> Generating your trip plan…
                </span>
              ) : '🗺️ Generate Trip Plan'}
            </button>
          </form>
        </div>

        {/* RESULTS */}
        <div style={resultsCol}>
          {!result && !loading && (
            <div style={emptyResult}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>✈️</div>
              <h3 style={{ color: '#eee', marginBottom: 10 }}>Your trip plan will appear here</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>Fill in your trip details and click Generate. The AI will build a complete itinerary including flights, visa requirements, accommodation, costs and a packing checklist.</p>
            </div>
          )}

          {loading && (
            <div style={loadingResult}>
              <div style={spinner} />
              <p style={{ color: '#F5C518', marginTop: 20, fontWeight: 600 }}>Analysing routes and visa requirements…</p>
              <p style={{ color: '#888', marginTop: 8, fontSize: 14 }}>This takes about 10 seconds</p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Summary */}
              <ResultCard icon="🗺️" title="Trip Overview">
                <p style={bodyText}>{result.summary}</p>
                <div style={tripMeta}>
                  <MetaChip label="Sport" val={form.sport} />
                  <MetaChip label="Group" val={`${parseInt(form.athletes) + parseInt(form.coaches)} people`} />
                  <MetaChip label="Destination" val={form.destination} />
                  <MetaChip label="Month" val={form.month} />
                </div>
              </ResultCard>

              {/* Visa */}
              <ResultCard icon="🛂" title="Visa Requirements"
                accent={result.visa?.status === 'required' ? '#FF6B6B' : result.visa?.status === 'not_required' ? '#51CF66' : '#F5C518'}>
                <div style={{ ...visaStatus, background: result.visa?.status === 'required' ? '#2A1212' : result.visa?.status === 'not_required' ? '#0E1F0E' : '#1A1200', borderColor: result.visa?.status === 'required' ? '#5A2020' : result.visa?.status === 'not_required' ? '#1A3D1A' : '#3A2E00' }}>
                  <span style={{ fontWeight: 700, color: result.visa?.status === 'required' ? '#FF8080' : result.visa?.status === 'not_required' ? '#51CF66' : '#F5C518' }}>
                    {result.visa?.status === 'required' ? '⚠️ VISA REQUIRED' : result.visa?.status === 'not_required' ? '✅ VISA NOT REQUIRED' : '🔍 CHECK REQUIRED'}
                  </span>
                  {result.visa?.lead_time_weeks > 0 && (
                    <span style={{ color: '#888', fontSize: 13 }}> · Apply {result.visa.lead_time_weeks} weeks in advance</span>
                  )}
                </div>
                <p style={bodyText}>{result.visa?.details}</p>
                {result.visa?.transit_warnings?.length > 0 && (
                  <div style={warningBox}>
                    {result.visa.transit_warnings.map((w, i) => <p key={i} style={{ margin: '4px 0', fontSize: 13 }}>⚠️ {w}</p>)}
                  </div>
                )}
                {result.visa?.action_items?.length > 0 && (
                  <ul style={actionList}>
                    {result.visa.action_items.map((a, i) => <li key={i} style={actionItem}>✓ {a}</li>)}
                  </ul>
                )}
              </ResultCard>

              {/* Flights */}
              <ResultCard icon="✈️" title="Flight Routing">
                <div style={routeBox}>
                  <div style={routeLabel}>Recommended Route</div>
                  <div style={routeText}>{result.flight_routing?.recommended_route}</div>
                </div>
                <div style={twoColResult}>
                  <div style={costChip}>
                    <div style={costLabel}>Est. per person</div>
                    <div style={costVal}>${result.flight_routing?.estimated_cost_per_person_usd?.toLocaleString()}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Airlines</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {result.flight_routing?.airlines?.map((a, i) => <span key={i} style={chip}>{a}</span>)}
                    </div>
                  </div>
                </div>
                <p style={bodyText}>{result.flight_routing?.tips}</p>
                {result.flight_routing?.budget_option && (
                  <div style={optionBox}>
                    <span style={{ color: '#51CF66', fontWeight: 700, fontSize: 12 }}>💚 Budget option: </span>
                    <span style={{ color: '#ccc', fontSize: 13 }}>{result.flight_routing.budget_option}</span>
                  </div>
                )}
              </ResultCard>

              {/* Accommodation */}
              <ResultCard icon="🏨" title="Accommodation">
                <div style={accomBadge}>{result.accommodation?.recommendation?.toUpperCase()}</div>
                <p style={bodyText}>{result.accommodation?.reasoning}</p>
                <div style={twoColResult}>
                  <div style={costChip}>
                    <div style={costLabel}>Per night</div>
                    <div style={costVal}>${result.accommodation?.estimated_cost_per_night_usd}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#888', fontSize: 12 }}>{result.accommodation?.tips}</div>
                  </div>
                </div>
              </ResultCard>

              {/* Cost Breakdown */}
              <ResultCard icon="💰" title="Cost Breakdown">
                <div style={costGrid}>
                  {[
                    ['Flights', result.cost_breakdown?.flights_usd],
                    ['Accommodation', result.cost_breakdown?.accommodation_usd],
                    ['Food', result.cost_breakdown?.food_usd],
                    ['Entry fee', result.cost_breakdown?.entry_fee_usd],
                    ['Local transport', result.cost_breakdown?.transport_local_usd],
                    ['Visa fees', result.cost_breakdown?.visa_usd],
                    ['Equipment transport', result.cost_breakdown?.equipment_transport_usd],
                    ['Miscellaneous', result.cost_breakdown?.misc_usd],
                  ].filter(([, v]) => v > 0).map(([label, val]) => (
                    <div key={label} style={costRow}>
                      <span style={{ color: '#aaa', fontSize: 14 }}>{label}</span>
                      <span style={{ color: '#eee', fontWeight: 600 }}>${val?.toLocaleString()}</span>
                    </div>
                  ))}
                  <div style={{ ...costRow, borderTop: '1px solid #3A2E00', paddingTop: 12, marginTop: 4 }}>
                    <span style={{ color: '#F5C518', fontWeight: 700 }}>Total per person</span>
                    <span style={{ color: '#F5C518', fontWeight: 700, fontSize: 20 }}>${result.cost_breakdown?.total_per_person_usd?.toLocaleString()}</span>
                  </div>
                  <div style={costRow}>
                    <span style={{ color: '#888' }}>Total group ({parseInt(form.athletes) + parseInt(form.coaches)} people)</span>
                    <span style={{ color: '#888', fontWeight: 600 }}>${result.cost_breakdown?.total_group_usd?.toLocaleString()}</span>
                  </div>
                </div>
              </ResultCard>

              {/* Packing checklist */}
              <ResultCard icon="🎒" title="Packing Checklist">
                <div style={checklistGrid}>
                  {Object.entries(result.packing_checklist || {}).map(([cat, items]) => (
                    <div key={cat}>
                      <div style={checkCat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</div>
                      {items.map((item, i) => (
                        <div key={i} style={checkItem}>
                          <span style={{ color: '#F5C518' }}>☐</span> {item}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </ResultCard>

              {/* Risks */}
              <ResultCard icon="⚠️" title="Risks & How to Avoid Them">
                {result.risks?.map((r, i) => (
                  <div key={i} style={{ ...riskItem, borderLeft: `3px solid ${r.severity === 'high' ? '#FF6B6B' : r.severity === 'medium' ? '#F5C518' : '#51CF66'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#eee' }}>{r.risk}</span>
                      <span style={{ fontSize: 11, color: r.severity === 'high' ? '#FF8080' : r.severity === 'medium' ? '#F5C518' : '#51CF66', textTransform: 'uppercase', letterSpacing: 1 }}>{r.severity}</span>
                    </div>
                    <p style={{ margin: 0, color: '#aaa', fontSize: 13, lineHeight: 1.5 }}>{r.mitigation}</p>
                  </div>
                ))}
              </ResultCard>

              {/* Pro tips */}
              {result.pro_tips?.length > 0 && (
                <ResultCard icon="💡" title="Pro Tips from the AI Coordinator">
                  {result.pro_tips.map((t, i) => (
                    <div key={i} style={proTip}>
                      <span style={{ color: '#F5C518', flexShrink: 0 }}>→</span>
                      <span style={{ color: '#ccc', fontSize: 14, lineHeight: 1.5 }}>{t}</span>
                    </div>
                  ))}
                </ResultCard>
              )}

              {/* Save button */}
              <div style={{ textAlign: 'center', paddingTop: 8 }}>
                {saved ? (
                  <div style={savedMsg}>✅ Trip plan saved to your account!</div>
                ) : (
                  <button style={btnGoldLg} onClick={savePlan} disabled={saving}>
                    {saving ? 'Saving…' : user ? '💾 Save This Trip Plan' : '🔐 Sign in to Save This Plan'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultCard({ icon, title, children, accent }) {
  return (
    <div style={{ ...resCard, borderLeft: `3px solid ${accent || '#F5C518'}` }}>
      <h3 style={resTitle}>{icon} {title}</h3>
      {children}
    </div>
  )
}
function Field({ label, children }) {
  return <div><label style={fieldLabel}>{label}</label><div style={{ marginTop: 6 }}>{children}</div></div>
}
function MetaChip({ label, val }) {
  return <div style={metaChip}><span style={{ color: '#888', fontSize: 11 }}>{label}</span><span style={{ color: '#eee', fontWeight: 600, fontSize: 13 }}>{val}</span></div>
}
function sportEmoji(s) {
  return { Boxing: '🥊', Wrestling: '🤼', Judo: '🥋', Swimming: '🏊', MMA: '🥋', Taekwondo: '🦶', Other: '🏅' }[s] || '🏅'
}

function getDemoResult(form) {
  return {
    summary: `Demo trip plan for a ${form.athletes} athlete ${form.sport} team from ${form.passport} travelling to ${form.destination} in ${form.month}. This is a demo — add your Anthropic API key to VITE_ANTHROPIC_API_KEY for real AI-generated plans.`,
    flight_routing: { recommended_route: `${form.passport} → Hub airport → ${form.destination}`, airlines: ['Demo Airlines', 'Sample Air'], estimated_cost_per_person_usd: 850, tips: 'Book 3-4 months in advance for best group rates.', budget_option: 'Search budget carriers via Skyscanner', premium_option: 'Full-service carrier for equipment allowance' },
    visa: { status: 'check_required', details: `Visa requirements for ${form.passport} passport holders travelling to ${form.destination}. Add your API key for accurate visa information.`, action_items: ['Check embassy website', 'Apply 8 weeks in advance', 'Gather supporting documents'], lead_time_weeks: 8, transit_warnings: [] },
    accommodation: { recommendation: 'hostel', reasoning: 'Hostels offer the best value for sports teams and allow the group to stay together.', estimated_cost_per_night_usd: 35, tips: 'Book a private dormitory for the whole team.', suggested_search: 'sports hostel group booking' },
    cost_breakdown: { flights_usd: 850, accommodation_usd: 280, food_usd: 150, entry_fee_usd: 180, transport_local_usd: 60, visa_usd: 80, equipment_transport_usd: form.equipment ? 120 : 0, misc_usd: 50, total_per_person_usd: 1170, total_group_usd: 1170 * (parseInt(form.athletes) + parseInt(form.coaches)) },
    packing_checklist: { equipment: ['Boots/shoes', 'Protective gear', 'Training kit'], documents: ['Passport', 'Visa (if required)', 'Tournament registration'], clothing: ['Competition kit', 'Warm-up suits', 'Casual clothes'], medical: ['First aid kit', 'Strapping tape', 'Pain relief'], other: ['Snacks for travel', 'Portable scales', 'Team flags'] },
    risks: [{ risk: 'Visa delays', severity: 'high', mitigation: 'Apply 8-10 weeks in advance, use a visa agent if needed' }, { risk: 'Equipment loss', severity: 'medium', mitigation: 'Use hard-shell cases, label everything, carry essentials in cabin bag' }],
    pro_tips: ['Add VITE_ANTHROPIC_API_KEY to your .env file for real AI-generated plans', 'Book group flights together for better rates and easier check-in', 'Always carry physical copies of all documents']
  }
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const page = { maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }
const pageHeader = { textAlign: 'center', padding: '48px 20px 40px', borderBottom: '1px solid #2A2A2A', marginBottom: 40 }
const backBtn = { background: 'none', border: '1px solid #2A2A2A', borderRadius: 6, color: '#888', padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20 }
const headerBadge = { display: 'inline-block', background: '#1A1200', color: '#F5C518', border: '1px solid #3A2E00', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }
const pageTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(40px, 6vw, 64px)', letterSpacing: 3, color: '#E8E8E8', margin: '0 0 12px' }
const pageSub = { color: '#888', fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: '0 auto' }
const layout = { display: 'grid', gridTemplateColumns: 'minmax(300px, 420px) 1fr', gap: 32, alignItems: 'start' }
const formCard = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: 28, position: 'sticky', top: 80 }
const cardTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 24, letterSpacing: 2, color: '#E8E8E8', margin: '0 0 24px' }
const formStyle = { display: 'flex', flexDirection: 'column', gap: 20 }
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
const fieldLabel = { display: 'block', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }
const input = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const sportGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }
const sportBtn = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#888', padding: '8px 10px', fontSize: 13, cursor: 'pointer', textAlign: 'left' }
const sportBtnActive = { background: '#1A1200', border: '1px solid #F5C518', color: '#F5C518' }
const monthGrid = { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }
const monthBtn = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 6, color: '#888', padding: '6px 4px', fontSize: 12, cursor: 'pointer' }
const monthBtnActive = { background: '#1A1200', border: '1px solid #F5C518', color: '#F5C518' }
const rangeLabels = { display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666', marginTop: 4 }
const toggleRow = { display: 'flex', gap: 10 }
const toggleBtn = { flex: 1, background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#888', padding: '10px', fontSize: 13, cursor: 'pointer' }
const toggleActive = { background: '#1A1200', border: '1px solid #F5C518', color: '#F5C518' }
const errorBox = { background: '#2A1212', border: '1px solid #5A2020', borderRadius: 6, padding: '8px 12px', color: '#FF8080', fontSize: 13 }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '13px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }
const btnGoldLg = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 10, padding: '14px 40px', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit' }
const spinnerSm = { width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTop: '2px solid #000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }
const resultsCol = { minHeight: 400 }
const emptyResult = { background: '#141414', border: '1px dashed #2A2A2A', borderRadius: 16, padding: 48, textAlign: 'center' }
const loadingResult = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: 64, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }
const spinner = { width: 40, height: 40, border: '3px solid #2A2A2A', borderTop: '3px solid #F5C518', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }
const resCard = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px 22px' }
const resTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 20, letterSpacing: 1.5, color: '#E8E8E8', margin: '0 0 14px' }
const bodyText = { color: '#ccc', fontSize: 14, lineHeight: 1.65, margin: '8px 0' }
const tripMeta = { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }
const metaChip = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 6, padding: '6px 12px', display: 'flex', flexDirection: 'column', gap: 2 }
const visaStatus = { border: '1px solid', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }
const warningBox = { background: '#1A0D00', border: '1px solid #5A3000', borderRadius: 6, padding: '10px 14px', marginTop: 8 }
const actionList = { listStyle: 'none', padding: 0, margin: '10px 0 0' }
const actionItem = { color: '#ccc', fontSize: 13, padding: '3px 0', lineHeight: 1.5 }
const routeBox = { background: '#1C1C1C', borderRadius: 8, padding: '12px 16px', marginBottom: 14 }
const routeLabel = { color: '#F5C518', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }
const routeText = { color: '#eee', fontSize: 14, lineHeight: 1.5 }
const twoColResult = { display: 'flex', gap: 16, alignItems: 'flex-start', margin: '12px 0' }
const costChip = { background: '#1A1200', border: '1px solid #3A2E00', borderRadius: 8, padding: '10px 16px', flexShrink: 0 }
const costLabel = { color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }
const costVal = { color: '#F5C518', fontWeight: 700, fontSize: 20, marginTop: 2 }
const chip = { background: '#1C1C1C', border: '1px solid #333', borderRadius: 4, padding: '3px 8px', fontSize: 12, color: '#bbb' }
const optionBox = { background: '#0E1F0E', border: '1px solid #1A3D1A', borderRadius: 6, padding: '8px 12px', marginTop: 10 }
const accomBadge = { display: 'inline-block', background: '#1A1200', color: '#F5C518', border: '1px solid #3A2E00', borderRadius: 4, padding: '3px 10px', fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }
const costGrid = { display: 'flex', flexDirection: 'column', gap: 8 }
const costRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
const checklistGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }
const checkCat = { color: '#F5C518', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }
const checkItem = { color: '#ccc', fontSize: 13, padding: '3px 0', display: 'flex', gap: 8, lineHeight: 1.4 }
const riskItem = { background: '#1C1C1C', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }
const proTip = { display: 'flex', gap: 12, padding: '6px 0', borderBottom: '1px solid #1C1C1C' }
const savedMsg = { background: '#0E1F0E', border: '1px solid #1A3D1A', borderRadius: 8, padding: '12px 24px', color: '#51CF66', fontWeight: 600, display: 'inline-block' }
