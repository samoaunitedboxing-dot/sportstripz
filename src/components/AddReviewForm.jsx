import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AddReviewForm({ user, tournament, onClose, onAdd }) {
  const [form, setForm] = useState({
    team_name: user?.club || '',
    country: '',
    flag: '🏳️',
    coach: user?.name || '',
    accommodation: '',
    total_cost_per_person: '',
    flight_route: '',
    tips: '',
    rating: 5,
    date_attended: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.team_name || !form.tips) { setError('Team name and tips are required.'); return }
    setLoading(true)
    setError('')

    try {
      if (supabase) {
        const { data, error: err } = await supabase
          .from('reviews')
          .insert([{ ...form, tournament_id: tournament.id, user_id: user.id }])
          .select()
          .single()
        if (err) throw err
        onAdd(data)
      } else {
        // Demo mode
        onAdd({ ...form, id: Date.now(), tournament_id: tournament.id })
      }
      setSuccess(true)
      setTimeout(onClose, 1800)
    } catch (err) {
      setError(err.message || 'Failed to submit review.')
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
            <div style={{ fontSize: 52 }}>✅</div>
            <h2 style={title}>Review submitted!</h2>
            <p style={{ color: '#aaa', marginTop: 8 }}>Thanks for helping other coaches plan their trip.</p>
          </div>
        ) : (
          <>
            <h2 style={title}>Add Team Review</h2>
            <p style={sub}>{tournament.name}</p>
            {error && <div style={errorBox}>{error}</div>}
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={twoCol}>
                <div>
                  <label style={label}>Club / Team Name *</label>
                  <input style={input} value={form.team_name} onChange={e => set('team_name', e.target.value)} required />
                </div>
                <div>
                  <label style={label}>Country</label>
                  <input style={input} placeholder="e.g. Ireland" value={form.country} onChange={e => set('country', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={label}>Coach Name</label>
                <input style={input} value={form.coach} onChange={e => set('coach', e.target.value)} />
              </div>
              <div>
                <label style={label}>Accommodation used + nightly cost</label>
                <input style={input} placeholder="e.g. Hotel Central — €45/night, 10 min walk to venue" value={form.accommodation} onChange={e => set('accommodation', e.target.value)} />
              </div>
              <div>
                <label style={label}>Total cost per person</label>
                <input style={input} placeholder="e.g. €620 (flights + accommodation + entry)" value={form.total_cost_per_person} onChange={e => set('total_cost_per_person', e.target.value)} />
              </div>
              <div>
                <label style={label}>Flight route taken + approx cost</label>
                <input style={input} placeholder="e.g. Dublin → Vienna → Sarajevo — €160 return" value={form.flight_route} onChange={e => set('flight_route', e.target.value)} />
              </div>
              <div>
                <label style={label}>Tips for other coaches *</label>
                <textarea
                  style={{ ...input, minHeight: 100, resize: 'vertical' }}
                  placeholder="What do other coaches need to know? Logistics, food, officials, atmosphere..."
                  value={form.tips}
                  onChange={e => set('tips', e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={label}>Your rating</label>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button
                      type="button"
                      key={n}
                      onClick={() => set('rating', n)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 26, color: n <= form.rating ? '#F5C518' : '#444', padding: 0 }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={label}>When did you attend?</label>
                <input style={input} placeholder="e.g. March 2024" value={form.date_attended} onChange={e => set('date_attended', e.target.value)} />
              </div>
              <button type="submit" style={{ ...btnGold, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modal = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: '28px', width: '100%', maxWidth: 540, position: 'relative', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }
const closeBtn = { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }
const title = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 30, letterSpacing: 2, margin: '0 0 4px', color: '#E8E8E8' }
const sub = { color: '#888', fontSize: 13, marginBottom: 20 }
const errorBox = { background: '#2A1212', border: '1px solid #5A2020', borderRadius: 6, padding: '8px 12px', color: '#FF8080', fontSize: 13, marginBottom: 12 }
const formStyle = { display: 'flex', flexDirection: 'column', gap: 14 }
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
const label = { display: 'block', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }
const input = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit' }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '12px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }
