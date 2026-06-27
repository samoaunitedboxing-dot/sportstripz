const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function TournamentCard({ t, onOpen }) {
  const d = new Date(t.start_date)
  const reviewCount = t.reviews?.length || 0

  return (
    <div
      style={card}
      onClick={() => onOpen(t)}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5C518'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(0)' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(t)}
      aria-label={`View details for ${t.name}`}
    >
      {/* Gold left accent */}
      <div style={accent} />

      <div style={body}>
        {/* Top row: date stamp + title */}
        <div style={topRow}>
          <div style={dateStamp}>
            <div style={stampMonth}>{MONTH_SHORT[d.getMonth()]}</div>
            <div style={stampDay}>{d.getDate()}</div>
            <div style={stampYear}>{d.getFullYear()}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={sportBadge}>{t.sport}</div>
            <h3 style={cardTitle}>{t.name}</h3>
            <div style={location}>{t.flag} {t.city}, {t.country}</div>
          </div>
        </div>

        {/* Meta row */}
        <div style={metaRow}>
          <span style={meta}>📅 {formatDate(t.start_date)} – {formatDate(t.end_date)}</span>
          <span style={meta}>💳 {t.entry_fee}</span>
          <span style={meta}>⭐ {t.level}</span>
        </div>

        {/* Age groups */}
        <div style={ageRow}>
          {(t.age_groups || []).map(ag => (
            <span key={ag} style={ageBadge}>{ag}</span>
          ))}
        </div>

        {/* Footer */}
        <div style={footer}>
          <span style={{ color: '#888', fontSize: 13 }}>
            👥 {t.total_teams} teams &nbsp;·&nbsp; 💬 {reviewCount} review{reviewCount !== 1 ? 's' : ''}
          </span>
          <span style={viewBtn}>View details →</span>
        </div>
      </div>
    </div>
  )
}

const card = {
  display: 'flex',
  background: '#141414',
  border: '1px solid #2A2A2A',
  borderRadius: 12,
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'border-color 0.2s, transform 0.15s',
}
const accent = {
  width: 4,
  background: 'linear-gradient(180deg, #F5C518 0%, #C9A014 100%)',
  flexShrink: 0,
}
const body = { padding: '20px 20px 16px', flex: 1, minWidth: 0 }
const topRow = { display: 'flex', gap: 16, marginBottom: 14, alignItems: 'flex-start' }
const dateStamp = {
  background: '#1C1C1C',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  padding: '8px 12px',
  textAlign: 'center',
  flexShrink: 0,
  minWidth: 52,
}
const stampMonth = { color: '#F5C518', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }
const stampDay = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, color: '#E8E8E8', lineHeight: 1 }
const stampYear = { color: '#888', fontSize: 11 }
const sportBadge = {
  display: 'inline-block',
  background: '#1A1200',
  color: '#F5C518',
  border: '1px solid #3A2E00',
  borderRadius: 4,
  padding: '2px 8px',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: 'uppercase',
  marginBottom: 6,
}
const cardTitle = { margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#E8E8E8', lineHeight: 1.3 }
const location = { color: '#888', fontSize: 13 }
const metaRow = { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }
const meta = { color: '#aaa', fontSize: 12 }
const ageRow = { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }
const ageBadge = {
  background: '#1A1A1A',
  border: '1px solid #333',
  borderRadius: 4,
  padding: '2px 8px',
  fontSize: 11,
  color: '#bbb',
}
const footer = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: 12,
  borderTop: '1px solid #2A2A2A',
}
const viewBtn = { color: '#F5C518', fontSize: 13, fontWeight: 600 }
