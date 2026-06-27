import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { SPORTS, AGE_GROUPS } from '../mockData'

const LEVELS = ['Community', 'Regional', 'National', 'International', 'Elite International']
const COUNTRY_FLAGS = {
  'Bosnia & Herzegovina': '🇧🇦', 'Bulgaria': '🇧🇬', 'Serbia': '🇷🇸',
  'Croatia': '🇭🇷', 'Poland': '🇵🇱', 'Germany': '🇩🇪', 'France': '🇫🇷',
  'Italy': '🇮🇹', 'Spain': '🇪🇸', 'Ireland': '🇮🇪', 'United Kingdom': '🇬🇧',
  'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Hungary': '🇭🇺', 'Romania': '🇷🇴',
  'Greece': '🇬🇷', 'Turkey': '🇹🇷', 'Portugal': '🇵🇹', 'Sweden': '🇸🇪',
  'Norway': '🇳🇴', 'Denmark': '🇩🇰', 'Finland': '🇫🇮', 'Austria': '🇦🇹',
  'Switzerland': '🇨🇭', 'Czech Republic': '🇨🇿', 'Slovakia': '🇸🇰',
  'Ukraine': '🇺🇦', 'Russia': '🇷🇺', 'United States': '🇺🇸', 'Canada': '🇨🇦',
}

export default function AddTournamentForm({ user, onClose, onAdd }) {
  const empty = {
    name: '', sport: 'Boxing', country: '', city: '', flag: '🏆',
    start_date: '', end_date: '', age_groups: [], entry_fee: '',
    visa_notes: '', description: '', level: 'International', total_teams: 0,
  }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(key, val) {
    setForm(f => {
      const updated = { ...f, [key]: val }
      if (key === 'country') {
        updated.flag = COUNTRY_FLAGS[val] || '🏆'
      }
      return updated
    })
  }

  function toggleAge(ag) {
    setForm(f => ({
      ...f,
      age_groups: f.age_groups.includes(ag)
        ? f.age_groups.filter(x => x !== ag)
        : [...f.age_groups, ag],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.country || !form.city || !form.start_date) {
      setError('Name, country, city and start date are required.')
      return
    }
    if (form.age_groups.length === 0) {
      setError('Please select at least one age group.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const payload = { ...form, user_id: user.id }
      if (supabase) {
        const { data, error: err } = await supabase
          .from('tournaments')
          .insert([payload])
          .select()
          .single()
        if (err) throw err
        onAdd({ ...data, reviews: [] })
      } else {
        onAdd({ ...payload, id: Date.now(), reviews: [] })
      }
      setSuccess(true)
      setTimeout(onClose, 1800)
    } catch (err) {
      setError(err.message || 'Failed to submit tournament.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>✕</button>
        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 52 }}>🏆</div>
            <h2 style={title}>Tournament submitted!</h2>
            <p style={{ color: '#aaa', marginTop: 8 }}>It'll appear in the directory shortly.</p>
          </div>
        ) : (
          <>
            <h2 style={title}>Submit a Tournament</h2>
            <p style={sub}>Help other coaches discover great competitions.</p>
            {error && <div style={errorBox}>{error}</div>}
            <form onSubmit={handleSubmit} style={formStyle}>
              <Field label="Tournament name *">
                <input style={input} placeholder="e.g. Sarajevo Open Boxing Championship" value={form.name} onChange={e => set('name', e.target.value)} required />
              </Field>
              <div style={twoCol}>
                <Field label="Sport *">
                  <select style={input} value={form.sport} onChange={e => set('sport', e.target.value)}>
                    {SPORTS.slice(1).map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Level">
                  <select style={input} value={form.level} onChange={e => set('level', e.target.value)}>
                    {LEVELS.map(l => <option key={l}>{l}</option>)}
                  </select>
                </Field>
              </div>
              <div style={twoCol}>
                <Field label="Country *">
                  <input style={input} placeholder="e.g. Serbia" value={form.country} onChange={e => set('country', e.target.value)} required />
                </Field>
                <Field label="City *">
                  <input style={input} placeholder="e.g. Belgrade" value={form.city} onChange={e => set('city', e.target.value)} required />
                </Field>
              </div>
              <div style={twoCol}>
                <Field label="Start date *">
                  <input style={input} type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
                </Field>
                <Field label="End date">
                  <input style={input} type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} />
                </Field>
              </div>
              <Field label="Age groups *">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {AGE_GROUPS.slice(1).map(ag => (
                    <button
                      type="button"
                      key={ag}
                      onClick={() => toggleAge(ag)}
                      style={{
                        background: form.age_groups.includes(ag) ? '#1A1200' : '#1C1C1C',
                        border: `1px solid ${form.age_groups.includes(ag) ? '#F5C518' : '#2A2A2A'}`,
                        color: form.age_groups.includes(ag) ? '#F5C518' : '#888',
                        borderRadius: 20,
                        padding: '5px 14px',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                    >
                      {ag}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Entry fee">
                <input style={input} placeholder="e.g. €150 per boxer" value={form.entry_fee} onChange={e => set('entry_fee', e.target.value)} />
              </Field>
              <Field label="Estimated number of teams">
                <input style={input} type="number" min="0" value={form.total_teams} onChange={e => set('total_teams', parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Visa notes for travelling teams">
                <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} placeholder="Visa requirements, entry rules, currency tips..." value={form.visa_notes} onChange={e => set('visa_notes', e.target.value)} />
              </Field>
              <Field label="Tournament description">
                <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} placeholder="Venue, format, what makes this tournament special..." value={form.description} onChange={e => set('description', e.target.value)} />
              </Field>
              <button type="submit" style={{ ...btnGold, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Tournament'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {children}
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modal = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 560, position: 'relative', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }
const closeBtn = { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }
const title = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 30, letterSpacing: 2, margin: '0 0 4px', color: '#E8E8E8' }
const sub = { color: '#888', fontSize: 13, marginBottom: 20 }
const errorBox = { background: '#2A1212', border: '1px solid #5A2020', borderRadius: 6, padding: '8px 12px', color: '#FF8080', fontSize: 13, marginBottom: 12 }
const formStyle = { display: 'flex', flexDirection: 'column', gap: 14 }
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
const fieldLabel = { display: 'block', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }
const input = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }
