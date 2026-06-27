import { SPORTS, AGE_GROUPS, MONTHS } from '../mockData'

export default function FilterBar({ filters, setFilters, countries }) {
  const COUNTRIES = ['All Countries', ...countries]

  const hasActive =
    filters.sport !== 'All Sports' ||
    filters.country !== 'All Countries' ||
    filters.month !== 'All Months' ||
    filters.ageGroup !== 'All Ages'

  function clear() {
    setFilters({ sport: 'All Sports', country: 'All Countries', month: 'All Months', ageGroup: 'All Ages' })
  }

  return (
    <div style={bar}>
      <Select
        label="Sport"
        value={filters.sport}
        onChange={v => setFilters(f => ({ ...f, sport: v }))}
        options={SPORTS}
      />
      <Select
        label="Country"
        value={filters.country}
        onChange={v => setFilters(f => ({ ...f, country: v }))}
        options={COUNTRIES}
      />
      <Select
        label="Month"
        value={filters.month}
        onChange={v => setFilters(f => ({ ...f, month: v }))}
        options={MONTHS}
      />
      <Select
        label="Age Group"
        value={filters.ageGroup}
        onChange={v => setFilters(f => ({ ...f, ageGroup: v }))}
        options={AGE_GROUPS}
      />
      {hasActive && (
        <button style={clearBtn} onClick={clear}>Clear filters ✕</button>
      )}
    </div>
  )
}

function Select({ label, value, onChange, options }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      style={select}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

const bar = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  padding: '16px',
  background: '#141414',
  borderRadius: 10,
  border: '1px solid #2A2A2A',
  marginBottom: 20,
}
const select = {
  background: '#1C1C1C',
  border: '1px solid #2A2A2A',
  borderRadius: 6,
  color: '#E8E8E8',
  padding: '8px 12px',
  fontSize: 14,
  cursor: 'pointer',
  outline: 'none',
  minWidth: 130,
}
const clearBtn = {
  background: 'none',
  border: '1px solid #444',
  borderRadius: 6,
  color: '#888',
  padding: '8px 14px',
  fontSize: 13,
  cursor: 'pointer',
  alignSelf: 'center',
}
