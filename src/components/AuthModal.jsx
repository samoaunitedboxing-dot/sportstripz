import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function AuthModal({ onClose, onAuth }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [club, setClub] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmSent, setConfirmSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Email and password are required.'); return }
    if (mode === 'signup' && !name) { setError('Your name is required.'); return }
    setLoading(true)

    try {
      if (!supabase) {
        // Demo mode — no Supabase configured
        const user = { id: 'demo-' + Date.now(), email, name: name || email.split('@')[0], club: club || 'My Club' }
        localStorage.setItem('sportstripz_user', JSON.stringify(user))
        onAuth(user)
        onClose()
        return
      }

      if (mode === 'signup') {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name, club }
          }
        })
        if (err) throw err
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists.')
          return
        }
        setConfirmSent(true)
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) throw err
        const meta = data.user?.user_metadata || {}
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: meta.name || email.split('@')[0],
          club: meta.club || ''
        }
        localStorage.setItem('sportstripz_user', JSON.stringify(user))
        onAuth(user)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (confirmSent) {
    return (
      <div style={overlay} onClick={onClose}>
        <div style={modal} onClick={e => e.stopPropagation()}>
          <button style={closeBtn} onClick={onClose}>✕</button>
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 52 }}>📧</div>
            <h2 style={title}>Check your email</h2>
            <p style={{ color: '#aaa', marginTop: 8, lineHeight: 1.6 }}>
              We've sent a confirmation link to <strong style={{ color: '#eee' }}>{email}</strong>.<br />
              Click it to activate your account, then sign in.
            </p>
            <button style={{ ...btnGold, marginTop: 24 }} onClick={() => { setMode('signin'); setConfirmSent(false) }}>
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>✕</button>
        <h2 style={title}>{mode === 'signin' ? 'Sign In' : 'Coach Sign Up'}</h2>
        <p style={sub}>
          {mode === 'signin'
            ? 'Welcome back, coach.'
            : 'Join SportsTripz to submit tournaments & share trip reviews.'}
        </p>
        {error && <div style={errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <>
              <input style={input} placeholder="Your full name *" value={name} onChange={e => setName(e.target.value)} />
              <input style={input} placeholder="Club / gym name" value={club} onChange={e => setClub(e.target.value)} />
            </>
          )}
          <input style={input} placeholder="Email address *" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input style={input} placeholder="Password *" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" style={{ ...btnGold, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', color: '#888', fontSize: 13, marginTop: 16 }}>
          {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
          <button style={linkBtn} onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}>
            {mode === 'signin' ? 'Sign up as a coach' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modal = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: '32px 28px', width: '100%', maxWidth: 440, position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }
const closeBtn = { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }
const title = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 32, letterSpacing: 2, margin: '0 0 4px', color: '#E8E8E8' }
const sub = { color: '#888', fontSize: 14, marginBottom: 20, marginTop: 4 }
const errorBox = { background: '#2A1212', border: '1px solid #5A2020', borderRadius: 6, padding: '8px 12px', color: '#FF8080', fontSize: 13, marginBottom: 12 }
const input = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none' }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '11px 20px', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }
const linkBtn = { background: 'none', border: 'none', color: '#F5C518', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }
