function Stars({ rating }) {
  return (
    <span style={{ color: '#F5C518', letterSpacing: 1 }}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ReviewCard({ review }) {
  return (
    <div style={card}>
      <div style={header}>
        <div>
          <span style={teamName}>{review.flag} {review.team_name}</span>
          {review.country && <span style={country}> · {review.country}</span>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <Stars rating={review.rating} />
          {review.date_attended && (
            <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{review.date_attended}</div>
          )}
        </div>
      </div>

      {review.coach && (
        <p style={coach}>Coach: {review.coach}</p>
      )}

      <div style={grid}>
        {review.accommodation && (
          <InfoRow icon="🏨" label="Accommodation" value={review.accommodation} />
        )}
        {review.flight_route && (
          <InfoRow icon="✈️" label="Flight route" value={review.flight_route} />
        )}
        {review.total_cost_per_person && (
          <InfoRow icon="💰" label="Total cost per person" value={review.total_cost_per_person} gold />
        )}
      </div>

      {review.tips && (
        <div style={tipsBox}>
          <div style={{ color: '#F5C518', fontWeight: 700, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
            💬 Coach Tips
          </div>
          <p style={{ margin: 0, color: '#ccc', fontSize: 14, lineHeight: 1.65 }}>{review.tips}</p>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon, label, value, gold }) {
  return (
    <div style={infoRow}>
      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 2 }}>{icon}</span>
      <div>
        <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ color: gold ? '#F5C518' : '#ddd', fontWeight: gold ? 700 : 400, fontSize: 13, marginTop: 2, lineHeight: 1.5 }}>
          {value}
        </div>
      </div>
    </div>
  )
}

const card = {
  background: '#1C1C1C',
  border: '1px solid #2A2A2A',
  borderRadius: 10,
  padding: '16px 18px',
  marginBottom: 14,
}
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 }
const teamName = { fontWeight: 700, fontSize: 15 }
const country = { color: '#888', fontSize: 14 }
const coach = { color: '#888', fontSize: 13, margin: '0 0 12px' }
const grid = { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }
const infoRow = { display: 'flex', gap: 10, alignItems: 'flex-start' }
const tipsBox = {
  background: '#0D0D10',
  border: '1px solid #252530',
  borderRadius: 8,
  padding: '12px 14px',
}
