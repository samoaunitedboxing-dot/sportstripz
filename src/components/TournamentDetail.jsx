import { useState } from 'react'
import ReviewCard from './ReviewCard'
import AddReviewForm from './AddReviewForm'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TournamentDetail({ tournament: t, user, onClose, onAddReview, onAuthRequired }) {
  const [showReviewForm, setShowReviewForm] = useState(false)

  function handleAddReview() {
    if (!user) { onAuthRequired(); return }
    setShowReviewForm(true)
  }

  return (
    <>
      <div style={overlay} onClick={onClose}>
        <div style={modal} onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div style={header}>
            <button style={closeBtn} onClick={onClose} aria-label="Close">✕</button>
            <span style={sportBadge}>{t.sport}</span>
            <h2 style={title}>{t.name}</h2>
            <div style={locationLine}>{t.flag} {t.city}, {t.country}</div>
          </div>

          <div style={body}>
            {/* Info grid */}
            <div style={infoGrid}>
              <InfoBlock icon="📅" label="Dates" val={`${formatDate(t.start_date)} – ${formatDate(t.end_date)}`} />
              <InfoBlock icon="💳" label="Entry fee" val={t.entry_fee || 'TBC'} />
              <InfoBlock icon="🏆" label="Level" val={t.level} />
              <InfoBlock icon="👥" label="Teams" val={`${t.total_teams} attending`} />
            </div>

            {/* Age groups */}
            <Section label="Age Groups">
              <div style={tagRow}>
                {(t.age_groups || []).map(ag => <span key={ag} style={ageBadge}>{ag}</span>)}
              </div>
            </Section>

            {/* Description */}
            {t.description && (
              <Section label="About This Tournament">
                <p style={bodyText}>{t.description}</p>
              </Section>
            )}

            {/* Visa notes */}
            {t.visa_notes && (
              <div style={visaBox}>
                <div style={visaTitle}>🛂 Visa & Entry Notes</div>
                <p style={{ margin: 0, color: '#ccc', fontSize: 14, lineHeight: 1.7 }}>{t.visa_notes}</p>
              </div>
            )}

            {/* Reviews */}
            <div style={{ marginTop: 28 }}>
              <div style={reviewsHeader}>
                <div style={sectionLabel}>
                  Teams Who Went · {t.reviews?.length || 0} Review{(t.reviews?.length || 0) !== 1 ? 's' : ''}
                </div>
                <button style={btnGoldSm} onClick={handleAddReview}>+ Add review</button>
              </div>

              {!user && (
                <div style={signInNudge}>
                  <button style={linkBtn} onClick={onAuthRequired}>Sign in</button> to add your team's review
                </div>
              )}

              {(t.reviews?.length || 0) === 0 ? (
                <div style={emptyReviews}>
                  No reviews yet — be the first coach to share your experience from this tournament!
                </div>
              ) : (
                (t.reviews || []).map(r => <ReviewCard key={r.id} review={r} />)
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewForm && (
        <AddReviewForm
          user={user}
          tournament={t}
          onClose={() => setShowReviewForm(false)}
          onAdd={(rev) => {
            onAddReview(t.id, rev)
            setShowReviewForm(false)
          }}
        />
      )}
    </>
  )
}

function InfoBlock({ icon, label, val }) {
  return (
    <div style={infoBlock}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
        <div style={{ color: '#eee', fontSize: 14, fontWeight: 600, marginTop: 2 }}>{val}</div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={sectionLabel}>{label}</div>
      <div style={{ marginTop: 8 }}>{children}</div>
    </div>
  )
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modal = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, width: '100%', maxWidth: 680, maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }
const header = { background: 'linear-gradient(135deg, #111108 0%, #0F0F0A 100%)', padding: '28px 28px 22px', borderBottom: '1px solid #2A2A2A', position: 'relative' }
const closeBtn = { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }
const sportBadge = { display: 'inline-block', background: '#1A1200', color: '#F5C518', border: '1px solid #3A2E00', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }
const title = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: 2, margin: '0 40px 6px 0', color: '#E8E8E8' }
const locationLine = { color: '#888', fontSize: 15 }
const body = { padding: '24px 28px' }
const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }
const infoBlock = { display: 'flex', gap: 12, alignItems: 'flex-start', background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, padding: '12px 14px' }
const sectionLabel = { color: '#F5C518', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }
const tagRow = { display: 'flex', flexWrap: 'wrap', gap: 8 }
const ageBadge = { background: '#1A1A1A', border: '1px solid #333', borderRadius: 4, padding: '3px 10px', fontSize: 12, color: '#bbb' }
const bodyText = { color: '#ccc', lineHeight: 1.7, fontSize: 15, margin: 0 }
const visaBox = { background: '#0E110E', border: '1px solid #1A2E1A', borderRadius: 10, padding: '16px 18px', marginBottom: 4 }
const visaTitle = { color: '#F5C518', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }
const reviewsHeader = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }
const btnGoldSm = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 6, padding: '7px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
const signInNudge = { color: '#888', fontSize: 13, marginBottom: 12 }
const linkBtn = { background: 'none', border: 'none', color: '#F5C518', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }
const emptyReviews = { textAlign: 'center', color: '#888', padding: '32px 0', fontSize: 15, lineHeight: 1.6 }
