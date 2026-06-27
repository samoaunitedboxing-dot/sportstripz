import { useState, useRef } from 'react'

const SPORTS = ['Boxing', 'Wrestling', 'Judo', 'Taekwondo', 'MMA', 'Swimming', 'Athletics', 'Other']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const ACCOMMODATION_TYPES = ['Hostel (shared)', 'Hostel (private rooms)', 'Budget hotel', 'Mid-range hotel', 'Premium hotel', 'Airbnb (whole property)']
const ACCOM_COSTS = { 'Hostel (shared)': 25, 'Hostel (private rooms)': 40, 'Budget hotel': 55, 'Mid-range hotel': 80, 'Premium hotel': 130, 'Airbnb (whole property)': 45 }

// Regional flight cost estimates (per person return)
const FLIGHT_ESTIMATES = {
  'Pacific Islands → Europe': 1500,
  'Pacific Islands → USA': 1100,
  'Pacific Islands → Australia/NZ': 500,
  'Pacific Islands → Asia': 900,
  'Europe → Europe': 200,
  'Europe → USA': 650,
  'Europe → Asia': 800,
  'USA → USA (domestic)': 350,
  'USA → Europe': 650,
  'Asia → Europe': 750,
  'Custom (enter below)': 0,
}

export default function BudgetCalculator({ onNavigate }) {
  const printRef = useRef()
  const [form, setForm] = useState({
    // Team
    teamName: '',
    clubName: '',
    coachName: '',
    sport: 'Boxing',
    athletes: 6,
    coaches: 2,
    // Trip
    tournament: '',
    destination: '',
    country: '',
    month: 'March',
    tripDays: 6,
    // Flights
    flightRoute: 'Pacific Islands → Europe',
    customFlightCost: 1500,
    // Accommodation
    accommodationType: 'Budget hotel',
    customAccomCost: 0,
    // Other costs
    entryFeePerAthlete: 180,
    mealsPerDayPerPerson: 30,
    localTransportPerDay: 15,
    visaFeePerPerson: 80,
    visaRequired: true,
    equipmentShipping: 0,
    uniformsCost: 0,
    medicalInsurancePerPerson: 40,
    contingency: 10,
    // Funding
    associationGrant: 0,
    sponsorship: 0,
    athleteContribution: 0,
    // Doc
    submittedTo: '',
    purpose: '',
    notes: '',
  })
  const [result, setResult] = useState(null)
  const [printed, setPrinted] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  const totalPeople = parseInt(form.athletes) + parseInt(form.coaches)
  const flightCostPP = form.flightRoute === 'Custom (enter below)' ? parseInt(form.customFlightCost) || 0 : FLIGHT_ESTIMATES[form.flightRoute] || 0
  const accomCostPerNight = form.accommodationType === 'Custom' ? parseInt(form.customAccomCost) || 0 : ACCOM_COSTS[form.accommodationType] || 0

  function calculate() {
    const nights = Math.max(1, parseInt(form.tripDays) - 1)
    const athletes = parseInt(form.athletes)
    const coaches = parseInt(form.coaches)
    const total = athletes + coaches

    const flights = flightCostPP * total
    const accommodation = accomCostPerNight * nights * total
    const meals = parseInt(form.mealsPerDayPerPerson) * parseInt(form.tripDays) * total
    const localTransport = parseInt(form.localTransportPerDay) * parseInt(form.tripDays) * total
    const entryFees = parseInt(form.entryFeePerAthlete) * athletes
    const visas = form.visaRequired ? parseInt(form.visaFeePerPerson) * total : 0
    const equipment = parseInt(form.equipmentShipping) || 0
    const uniforms = parseInt(form.uniformsCost) || 0
    const insurance = parseInt(form.medicalInsurancePerPerson) * total

    const subtotal = flights + accommodation + meals + localTransport + entryFees + visas + equipment + uniforms + insurance
    const contingencyAmt = Math.round(subtotal * (parseInt(form.contingency) / 100))
    const grossTotal = subtotal + contingencyAmt

    const funding = parseInt(form.associationGrant || 0) + parseInt(form.sponsorship || 0) + parseInt(form.athleteContribution || 0)
    const amountRequired = Math.max(0, grossTotal - funding)

    setResult({
      nights,
      flights, accommodation, meals, localTransport,
      entryFees, visas, equipment, uniforms, insurance,
      subtotal, contingencyAmt, grossTotal,
      funding, amountRequired,
      perPerson: Math.round(grossTotal / total),
      perAthlete: Math.round((grossTotal - parseInt(form.associationGrant || 0)) / athletes),
    })
  }

  function handlePrint() {
    const printContent = printRef.current
    const originalBody = document.body.innerHTML
    document.body.innerHTML = printContent.innerHTML
    window.print()
    document.body.innerHTML = originalBody
    window.location.reload()
  }

  return (
    <div style={page}>
      <div style={pageHeader}>
        <button style={backBtn} onClick={() => onNavigate('home')}>← Back to tournaments</button>
        <div style={headerBadge}>Funding Ready</div>
        <h1 style={pageTitle}>Team Budget Calculator</h1>
        <p style={pageSub}>
          Build a complete trip budget for your squad. Export as a professional PDF to submit to your boxing association, sports ministry, or government for funding.
        </p>
      </div>

      <div style={layout}>
        {/* ── FORM ── */}
        <div style={formCol}>

          <Section title="🏆 Team & Tournament">
            <Field label="Team / Club Name">
              <input style={inp} placeholder="e.g. Samoa Boxing Federation" value={form.teamName} onChange={e => set('teamName', e.target.value)} />
            </Field>
            <div style={twoCol}>
              <Field label="Head Coach">
                <input style={inp} placeholder="Coach name" value={form.coachName} onChange={e => set('coachName', e.target.value)} />
              </Field>
              <Field label="Sport">
                <select style={inp} value={form.sport} onChange={e => set('sport', e.target.value)}>
                  {SPORTS.map(s => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <div style={twoCol}>
              <Field label="Number of Athletes">
                <input style={inp} type="number" min="1" value={form.athletes} onChange={e => set('athletes', e.target.value)} />
              </Field>
              <Field label="Number of Coaches">
                <input style={inp} type="number" min="1" value={form.coaches} onChange={e => set('coaches', e.target.value)} />
              </Field>
            </div>
            <Field label="Tournament Name">
              <input style={inp} placeholder="e.g. Belgrade Golden Gloves 2025" value={form.tournament} onChange={e => set('tournament', e.target.value)} />
            </Field>
            <div style={twoCol}>
              <Field label="Destination City">
                <input style={inp} placeholder="Belgrade" value={form.destination} onChange={e => set('destination', e.target.value)} />
              </Field>
              <Field label="Country">
                <input style={inp} placeholder="Serbia" value={form.country} onChange={e => set('country', e.target.value)} />
              </Field>
            </div>
            <div style={twoCol}>
              <Field label="Travel Month">
                <select style={inp} value={form.month} onChange={e => set('month', e.target.value)}>
                  {MONTHS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Field>
              <Field label="Total Trip Days">
                <input style={inp} type="number" min="2" value={form.tripDays} onChange={e => set('tripDays', e.target.value)} />
              </Field>
            </div>
          </Section>

          <Section title="✈️ Flights">
            <Field label="Flight Route">
              <select style={inp} value={form.flightRoute} onChange={e => set('flightRoute', e.target.value)}>
                {Object.keys(FLIGHT_ESTIMATES).map(r => <option key={r}>{r}</option>)}
              </select>
            </Field>
            {form.flightRoute === 'Custom (enter below)' && (
              <Field label="Custom flight cost per person (USD return)">
                <input style={inp} type="number" value={form.customFlightCost} onChange={e => set('customFlightCost', e.target.value)} />
              </Field>
            )}
            <div style={estimateBox}>
              ✈️ Estimated flight cost: <strong style={{ color: '#F5C518' }}>${flightCostPP.toLocaleString()} per person return</strong>
              <span style={{ color: '#666', fontSize: 12 }}> · ${(flightCostPP * totalPeople).toLocaleString()} total group</span>
            </div>
          </Section>

          <Section title="🏨 Accommodation">
            <Field label="Accommodation Type">
              <select style={inp} value={form.accommodationType} onChange={e => set('accommodationType', e.target.value)}>
                {ACCOMMODATION_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <div style={estimateBox}>
              🏨 Estimated accommodation: <strong style={{ color: '#F5C518' }}>${accomCostPerNight}/night per person</strong>
            </div>
          </Section>

          <Section title="💳 Tournament & Other Costs">
            <div style={twoCol}>
              <Field label="Entry fee per athlete (USD)">
                <input style={inp} type="number" value={form.entryFeePerAthlete} onChange={e => set('entryFeePerAthlete', e.target.value)} />
              </Field>
              <Field label="Meals per day per person (USD)">
                <input style={inp} type="number" value={form.mealsPerDayPerPerson} onChange={e => set('mealsPerDayPerPerson', e.target.value)} />
              </Field>
            </div>
            <div style={twoCol}>
              <Field label="Local transport per day (USD)">
                <input style={inp} type="number" value={form.localTransportPerDay} onChange={e => set('localTransportPerDay', e.target.value)} />
              </Field>
              <Field label="Medical insurance per person (USD)">
                <input style={inp} type="number" value={form.medicalInsurancePerPerson} onChange={e => set('medicalInsurancePerPerson', e.target.value)} />
              </Field>
            </div>
            <div style={twoCol}>
              <Field label="Equipment shipping (USD total)">
                <input style={inp} type="number" value={form.equipmentShipping} onChange={e => set('equipmentShipping', e.target.value)} />
              </Field>
              <Field label="Uniforms / kit (USD total)">
                <input style={inp} type="number" value={form.uniformsCost} onChange={e => set('uniformsCost', e.target.value)} />
              </Field>
            </div>
            <div style={twoCol}>
              <Field label="Visa required?">
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <button type="button" style={{ ...toggleBtn, ...(form.visaRequired ? toggleActive : {}) }} onClick={() => set('visaRequired', true)}>Yes</button>
                  <button type="button" style={{ ...toggleBtn, ...(!form.visaRequired ? toggleActive : {}) }} onClick={() => set('visaRequired', false)}>No</button>
                </div>
              </Field>
              {form.visaRequired && (
                <Field label="Visa fee per person (USD)">
                  <input style={inp} type="number" value={form.visaFeePerPerson} onChange={e => set('visaFeePerPerson', e.target.value)} />
                </Field>
              )}
            </div>
            <Field label={`Contingency buffer (${form.contingency}%)`}>
              <input type="range" min="0" max="20" step="5" value={form.contingency}
                onChange={e => set('contingency', e.target.value)}
                style={{ width: '100%', accentColor: '#F5C518' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#666', marginTop: 2 }}>
                <span>0%</span><span style={{ color: '#F5C518' }}>{form.contingency}%</span><span>20%</span>
              </div>
            </Field>
          </Section>

          <Section title="💵 Funding Already Secured">
            <div style={twoCol}>
              <Field label="Association / Federation grant (USD)">
                <input style={inp} type="number" value={form.associationGrant} onChange={e => set('associationGrant', e.target.value)} />
              </Field>
              <Field label="Sponsorship (USD)">
                <input style={inp} type="number" value={form.sponsorship} onChange={e => set('sponsorship', e.target.value)} />
              </Field>
            </div>
            <Field label="Athlete self-contribution (USD total)">
              <input style={inp} type="number" value={form.athleteContribution} onChange={e => set('athleteContribution', e.target.value)} />
            </Field>
          </Section>

          <Section title="📄 For the Funding Application">
            <Field label="Submitting to (organisation name)">
              <input style={inp} placeholder="e.g. Samoa Sports Commission" value={form.submittedTo} onChange={e => set('submittedTo', e.target.value)} />
            </Field>
            <Field label="Purpose / justification">
              <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }}
                placeholder="e.g. This tournament is part of the Pacific Boxing Confederation qualifying series for the 2026 Commonwealth Games..."
                value={form.purpose} onChange={e => set('purpose', e.target.value)} />
            </Field>
            <Field label="Additional notes">
              <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' }}
                placeholder="Any other relevant information..."
                value={form.notes} onChange={e => set('notes', e.target.value)} />
            </Field>
          </Section>

          <button style={calcBtn} onClick={calculate}>
            💰 Calculate Budget
          </button>
        </div>

        {/* ── RESULTS ── */}
        <div style={resultsCol}>
          {!result ? (
            <div style={emptyResult}>
              <div style={{ fontSize: 64, marginBottom: 20 }}>📊</div>
              <h3 style={{ color: '#eee', marginBottom: 10 }}>Your budget will appear here</h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>Fill in your trip details and click Calculate Budget. You'll get a complete breakdown ready to submit for funding.</p>
            </div>
          ) : (
            <div ref={printRef}>
              {/* ── BUDGET RESULT CARD ── */}
              <div style={resultCard}>
                {/* Header */}
                <div style={resultHeader}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={resultOrg}>🥊 SportsTripz Budget Report</div>
                      <h2 style={resultTitle}>{form.teamName || 'Team'} — {form.tournament || 'Tournament Trip'}</h2>
                      <div style={resultMeta}>{form.destination}{form.country ? `, ${form.country}` : ''} · {form.month} · {form.tripDays} days</div>
                    </div>
                    <div style={totalBubble}>
                      <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>Total Required</div>
                      <div style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 42, color: '#F5C518', lineHeight: 1 }}>
                        ${result.amountRequired.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 11, color: '#666' }}>USD</div>
                    </div>
                  </div>

                  <div style={summaryChips}>
                    <SummaryChip label="Athletes" val={form.athletes} />
                    <SummaryChip label="Coaches" val={form.coaches} />
                    <SummaryChip label="Total People" val={totalPeople} />
                    <SummaryChip label="Trip Days" val={form.tripDays} />
                    <SummaryChip label="Per Person" val={`$${result.perPerson.toLocaleString()}`} gold />
                  </div>
                </div>

                {/* Cost breakdown */}
                <div style={breakdownSection}>
                  <h3 style={breakdownTitle}>Cost Breakdown</h3>
                  <div style={breakdownGrid}>
                    <CostLine label="✈️ Flights" detail={`$${flightCostPP.toLocaleString()} × ${totalPeople} people`} amount={result.flights} />
                    <CostLine label="🏨 Accommodation" detail={`$${accomCostPerNight}/night × ${result.nights} nights × ${totalPeople} people`} amount={result.accommodation} />
                    <CostLine label="🍽️ Meals" detail={`$${form.mealsPerDayPerPerson}/day × ${form.tripDays} days × ${totalPeople} people`} amount={result.meals} />
                    <CostLine label="🚌 Local Transport" detail={`$${form.localTransportPerDay}/day × ${form.tripDays} days × ${totalPeople} people`} amount={result.localTransport} />
                    <CostLine label="🏆 Tournament Entry Fees" detail={`$${form.entryFeePerAthlete} × ${form.athletes} athletes`} amount={result.entryFees} />
                    {result.visas > 0 && <CostLine label="🛂 Visa Fees" detail={`$${form.visaFeePerPerson} × ${totalPeople} people`} amount={result.visas} />}
                    {result.equipment > 0 && <CostLine label="📦 Equipment Shipping" detail="Total" amount={result.equipment} />}
                    {result.uniforms > 0 && <CostLine label="👕 Uniforms / Kit" detail="Total" amount={result.uniforms} />}
                    <CostLine label="🏥 Medical Insurance" detail={`$${form.medicalInsurancePerPerson} × ${totalPeople} people`} amount={result.insurance} />
                  </div>

                  <div style={subtotalRow}>
                    <span>Subtotal</span>
                    <span>${result.subtotal.toLocaleString()}</span>
                  </div>
                  <div style={contingencyRow}>
                    <span>Contingency ({form.contingency}%)</span>
                    <span>${result.contingencyAmt.toLocaleString()}</span>
                  </div>
                  <div style={totalRow}>
                    <span>GROSS TOTAL</span>
                    <span>${result.grossTotal.toLocaleString()} USD</span>
                  </div>
                </div>

                {/* Funding */}
                {(parseInt(form.associationGrant) > 0 || parseInt(form.sponsorship) > 0 || parseInt(form.athleteContribution) > 0) && (
                  <div style={fundingSection}>
                    <h3 style={breakdownTitle}>Funding Secured</h3>
                    {parseInt(form.associationGrant) > 0 && <CostLine label="🏛️ Association / Federation Grant" detail="" amount={parseInt(form.associationGrant)} green />}
                    {parseInt(form.sponsorship) > 0 && <CostLine label="🤝 Sponsorship" detail="" amount={parseInt(form.sponsorship)} green />}
                    {parseInt(form.athleteContribution) > 0 && <CostLine label="👤 Athlete Contributions" detail="" amount={parseInt(form.athleteContribution)} green />}
                    <div style={{ ...totalRow, borderColor: '#1A3D1A', color: '#51CF66' }}>
                      <span>AMOUNT REQUIRED FROM {(form.submittedTo || 'FUNDING BODY').toUpperCase()}</span>
                      <span>${result.amountRequired.toLocaleString()} USD</span>
                    </div>
                  </div>
                )}

                {/* Purpose */}
                {form.purpose && (
                  <div style={purposeSection}>
                    <h3 style={breakdownTitle}>Purpose & Justification</h3>
                    <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7 }}>{form.purpose}</p>
                  </div>
                )}

                {/* Notes */}
                {form.notes && (
                  <div style={{ padding: '0 24px 16px' }}>
                    <p style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{form.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div style={docFooter}>
                  <div>Prepared by: <strong>{form.coachName || 'Head Coach'}</strong> · {form.clubName || form.teamName}</div>
                  <div style={{ marginTop: 4 }}>Generated by SportsTripz · sportstripz.com · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  {form.submittedTo && <div style={{ marginTop: 4, color: '#F5C518' }}>Submitted to: {form.submittedTo}</div>}
                </div>
              </div>

              {/* Action buttons */}
              <div style={actionRow}>
                <button style={btnGold} onClick={handlePrint}>
                  🖨️ Print / Save as PDF
                </button>
                <button style={btnOutline} onClick={() => { setResult(null); window.scrollTo(0,0) }}>
                  ← Edit budget
                </button>
              </div>
              <p style={{ color: '#666', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
                To save as PDF: click Print → change destination to "Save as PDF" → Save
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={section}>
      <h3 style={sectionTitle}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}
function Field({ label, children }) {
  return <div><label style={fieldLabel}>{label}</label><div style={{ marginTop: 5 }}>{children}</div></div>
}
function CostLine({ label, detail, amount, green }) {
  return (
    <div style={costLine}>
      <div>
        <span style={{ color: '#eee', fontSize: 14 }}>{label}</span>
        {detail && <span style={{ color: '#666', fontSize: 12, marginLeft: 8 }}>{detail}</span>}
      </div>
      <span style={{ color: green ? '#51CF66' : '#eee', fontWeight: 600, fontSize: 14 }}>
        {green ? '-' : ''}${amount.toLocaleString()}
      </span>
    </div>
  )
}
function SummaryChip({ label, val, gold }) {
  return (
    <div style={summaryChip}>
      <div style={{ color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      <div style={{ color: gold ? '#F5C518' : '#eee', fontWeight: 700, fontSize: 16 }}>{val}</div>
    </div>
  )
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const page = { maxWidth: 1200, margin: '0 auto', padding: '0 20px 80px' }
const pageHeader = { textAlign: 'center', padding: '48px 20px 36px', borderBottom: '1px solid #2A2A2A', marginBottom: 32 }
const backBtn = { background: 'none', border: '1px solid #2A2A2A', borderRadius: 6, color: '#888', padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, display: 'block' }
const headerBadge = { display: 'inline-block', background: '#1A1200', color: '#F5C518', border: '1px solid #3A2E00', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }
const pageTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: 3, color: '#E8E8E8', margin: '0 0 12px' }
const pageSub = { color: '#888', fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }
const layout = { display: 'grid', gridTemplateColumns: '420px 1fr', gap: 32, alignItems: 'start' }
const formCol = { display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 70, maxHeight: 'calc(100vh - 90px)', overflowY: 'auto', paddingRight: 4 }
const section = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px 20px' }
const sectionTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 18, letterSpacing: 1.5, color: '#F5C518', margin: '0 0 16px' }
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
const fieldLabel = { display: 'block', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }
const inp = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '9px 12px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const estimateBox = { background: '#1A1200', border: '1px solid #3A2E00', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#aaa' }
const toggleBtn = { flex: 1, background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 6, color: '#888', padding: '8px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
const toggleActive = { background: '#1A1200', border: '1px solid #F5C518', color: '#F5C518' }
const calcBtn = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }
const resultsCol = { minHeight: 400 }
const emptyResult = { background: '#141414', border: '1px dashed #2A2A2A', borderRadius: 16, padding: 48, textAlign: 'center', position: 'sticky', top: 70 }
const resultCard = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, overflow: 'hidden' }
const resultHeader = { background: 'linear-gradient(135deg, #111108, #0A0A0A)', padding: '28px 28px 20px', borderBottom: '1px solid #2A2A2A' }
const resultOrg = { color: '#F5C518', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }
const resultTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, letterSpacing: 2, color: '#E8E8E8', margin: '0 0 4px' }
const resultMeta = { color: '#888', fontSize: 14 }
const totalBubble = { background: '#1A1200', border: '1px solid #3A2E00', borderRadius: 12, padding: '14px 20px', textAlign: 'center', flexShrink: 0 }
const summaryChips = { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }
const summaryChip = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, padding: '8px 14px' }
const breakdownSection = { padding: '20px 28px' }
const breakdownTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 18, letterSpacing: 1.5, color: '#F5C518', margin: '0 0 14px' }
const breakdownGrid = { display: 'flex', flexDirection: 'column', gap: 0 }
const costLine = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #1C1C1C' }
const subtotalRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0 6px', color: '#aaa', fontSize: 14, borderTop: '1px solid #333', marginTop: 8 }
const contingencyRow = { display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#888', fontSize: 13 }
const totalRow = { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '2px solid #F5C518', color: '#F5C518', fontWeight: 700, fontSize: 16, marginTop: 4 }
const fundingSection = { padding: '0 28px 20px', borderTop: '1px solid #2A2A2A' }
const purposeSection = { padding: '16px 28px', borderTop: '1px solid #2A2A2A' }
const docFooter = { background: '#0A0A0A', padding: '16px 28px', color: '#666', fontSize: 12, borderTop: '1px solid #1C1C1C' }
const actionRow = { display: 'flex', gap: 12, marginTop: 20 }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '12px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', flex: 1 }
const btnOutline = { background: 'none', border: '1px solid #F5C518', borderRadius: 8, color: '#F5C518', padding: '12px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }
