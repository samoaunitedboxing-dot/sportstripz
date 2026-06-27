import { useState } from 'react'
import { supabase } from '../supabaseClient'

// ── MOCK ACCOMMODATION DATA ──────────────────────────────────────────────────
const MOCK_ACCOMMODATION = [
  {
    id: 1,
    tournament_id: 1,
    tournament_name: 'Sarajevo Open Boxing Championship',
    city: 'Sarajevo',
    country: 'Bosnia & Herzegovina',
    flag: '🇧🇦',
    name: 'Hotel Central Sarajevo',
    type: 'hotel',
    address: 'Ćumurija 8, Sarajevo Old Town',
    distance_to_venue_km: 0.8,
    walk_minutes: 10,
    cost_per_night_usd: 49,
    cost_per_night_local: '€45/night',
    rooms_available: 12,
    max_group_size: 24,
    has_training_space: false,
    has_kitchen: false,
    has_gym: false,
    breakfast_included: true,
    group_booking_contact: '+387 33 561 800',
    group_discount: '10% off for groups of 8+',
    verified_by: 'Paddy Doyle, Dublin BC',
    verified_date: 'March 2024',
    rating: 5,
    notes: 'Staff are extremely helpful with sports teams. They allow early check-in for weigh-in days if you call ahead. Luggage storage available for equipment on departure day. Walking distance to the old town for team dinners.',
    tips: 'Ask for rooms on floors 3-4 — quieter. Breakfast is excellent and filling — perfect for fighters. They have a luggage room for equipment bags.',
    photos: [],
  },
  {
    id: 2,
    tournament_id: 1,
    tournament_name: 'Sarajevo Open Boxing Championship',
    city: 'Sarajevo',
    country: 'Bosnia & Herzegovina',
    flag: '🇧🇦',
    name: 'Hostel City Center Sarajevo',
    type: 'hostel',
    address: 'Mula Mustafe Bašeskije 1, Sarajevo',
    distance_to_venue_km: 1.2,
    walk_minutes: 15,
    cost_per_night_usd: 30,
    cost_per_night_local: '€28/night per person',
    rooms_available: 6,
    max_group_size: 20,
    has_training_space: false,
    has_kitchen: true,
    has_gym: false,
    breakfast_included: false,
    group_booking_contact: 'info@hostelcitycenter.ba',
    group_discount: 'Book all rooms, get 15% off',
    verified_by: 'Steven Reid, Glasgow Caledonian ABC',
    verified_date: 'March 2024',
    rating: 4,
    notes: 'Basic but very clean. Kitchen allows teams to prepare their own meals which is great for weight management. The owner speaks English and is used to sports teams.',
    tips: 'Book the entire hostel for your group — gives you privacy and a big discount. Kitchen is well equipped. Local supermarket 2 mins walk.',
    photos: [],
  },
  {
    id: 3,
    tournament_id: 2,
    tournament_name: 'Sofia International Boxing Cup',
    city: 'Sofia',
    country: 'Bulgaria',
    flag: '🇧🇬',
    name: 'Radisson Blu Hotel Sofia',
    type: 'hotel',
    address: 'Narodno Sabranie Square 4, Sofia',
    distance_to_venue_km: 1.5,
    walk_minutes: 18,
    cost_per_night_usd: 98,
    cost_per_night_local: '€90/night',
    rooms_available: 20,
    max_group_size: 40,
    has_training_space: true,
    has_kitchen: false,
    has_gym: true,
    breakfast_included: true,
    group_booking_contact: '+359 2 933 4334',
    group_discount: '15% off for groups of 10+ with code SPORTS2025',
    verified_by: 'Marcus Bell, Kronk Gym UK',
    verified_date: 'May 2024',
    rating: 5,
    notes: 'Premium option but worth it for larger delegations. Gym available 6am-10pm — great for morning sessions. Metro stop right outside for easy venue access. Staff very professional with sports delegations.',
    tips: 'Request the sports group rate when booking — not always advertised. Gym has heavy bags which is a bonus. Metro line 2 goes directly to the sports palace.',
    photos: [],
  },
  {
    id: 4,
    tournament_id: 3,
    tournament_name: 'Belgrade Golden Gloves',
    city: 'Belgrade',
    country: 'Serbia',
    flag: '🇷🇸',
    name: 'Mama Shelter Belgrade',
    type: 'hotel',
    address: 'Borivoja Stevanovića 2, Belgrade',
    distance_to_venue_km: 2.1,
    walk_minutes: 25,
    cost_per_night_usd: 71,
    cost_per_night_local: '€65/night',
    rooms_available: 15,
    max_group_size: 30,
    has_training_space: false,
    has_kitchen: false,
    has_gym: true,
    breakfast_included: false,
    group_booking_contact: 'belgrade@mamashelter.com',
    group_discount: '12% for groups of 8+',
    verified_by: 'Klaus Müller, Berlin Boxring eV',
    verified_date: 'July 2024',
    rating: 5,
    notes: 'Excellent location, stylish hotel at reasonable price. 10 min taxi to Hala Pionir arena. Rooftop bar is great for team evenings. Staff organised a private van for the team to weigh-in.',
    tips: 'Pre-arrange airport transfer with the hotel — they have a minibus service. Breakfast is pricey — go to the nearby bakery instead. July is hot so request AC rooms.',
    photos: [],
  },
  {
    id: 5,
    tournament_id: 3,
    tournament_name: 'Belgrade Golden Gloves',
    city: 'Belgrade',
    country: 'Serbia',
    flag: '🇷🇸',
    name: 'Hotel Metropol Palace',
    type: 'hotel',
    address: 'Bulevar Kralja Aleksandra 69, Belgrade',
    distance_to_venue_km: 1.8,
    walk_minutes: 22,
    cost_per_night_usd: 60,
    cost_per_night_local: '€55/night',
    rooms_available: 20,
    max_group_size: 40,
    has_training_space: true,
    has_kitchen: false,
    has_gym: true,
    breakfast_included: true,
    group_booking_contact: '+381 11 333 3100',
    group_discount: 'Group rates on request for 10+',
    verified_by: 'Antoine Beaumont, Lyon Boxe Club',
    verified_date: 'July 2024',
    rating: 4,
    notes: 'Classic hotel with large rooms perfect for sharing. Conference room available as team meeting space. Gym is small but functional. 15 min walk to arena through pleasant park.',
    tips: 'Breakfast included and very generous — great for fighter nutrition. Ask for the large rooms — some twins can fit a rollaway. Team meeting room is free for sports groups.',
    photos: [],
  },
  {
    id: 6,
    tournament_id: 4,
    tournament_name: 'Zagreb Croatia Boxing Classic',
    city: 'Zagreb',
    country: 'Croatia',
    flag: '🇭🇷',
    name: 'Hostel Bureau Zagreb',
    type: 'hostel',
    address: 'Petrinjska ulica 77, Zagreb',
    distance_to_venue_km: 1.0,
    walk_minutes: 12,
    cost_per_night_usd: 24,
    cost_per_night_local: '€22/night per person',
    rooms_available: 8,
    max_group_size: 16,
    has_training_space: false,
    has_kitchen: true,
    has_gym: false,
    breakfast_included: false,
    group_booking_contact: 'info@hostelbureau.hr',
    group_discount: 'Full hostel booking — 20% discount',
    verified_by: 'Gareth Evans, Swansea ABC',
    verified_date: 'September 2024',
    rating: 5,
    notes: 'Perfect for youth teams — very safe, central, excellent value. Owner is a sports fan and very accommodating. Kitchen fully equipped. 12 min walk to venue through beautiful Zagreb city centre.',
    tips: 'Book the whole hostel — gives you complete privacy for a youth squad. Owner will hold equipment bags. Tram stop outside for rainy days.',
    photos: [],
  },
  {
    id: 7,
    tournament_id: 5,
    tournament_name: 'Warsaw Winter Boxing Cup',
    city: 'Warsaw',
    country: 'Poland',
    flag: '🇵🇱',
    name: 'ibis Budget Warsaw Centre',
    type: 'hotel',
    address: 'Złota 48/54, Warsaw',
    distance_to_venue_km: 3.5,
    walk_minutes: 45,
    cost_per_night_usd: 41,
    cost_per_night_local: '€38/night',
    rooms_available: 25,
    max_group_size: 50,
    has_training_space: false,
    has_kitchen: false,
    has_gym: false,
    breakfast_included: false,
    group_booking_contact: '+48 22 586 0400',
    group_discount: '10% for groups of 10+ booked direct',
    verified_by: 'Jim Connolly, Northside BC Dublin',
    verified_date: 'November 2024',
    rating: 4,
    notes: 'Excellent budget option in the heart of Warsaw. Metro line M1 to venue takes 12 mins. Very clean, functional rooms. Great value for money in an expensive city.',
    tips: 'Get a 5-day metro card for the group — much cheaper than taxis. November is very cold — hotel heating is excellent. Nearby Złote Tarasy mall has cheap food court meals.',
    photos: [],
  },
]

const TYPES = ['All Types', 'hotel', 'hostel', 'airbnb', 'guesthouse', 'apartment']
const TYPE_ICONS = { hotel: '🏨', hostel: '🛏️', airbnb: '🏠', guesthouse: '🏡', apartment: '🏢' }
const TYPE_COLORS = { hotel: '#1A1200', hostel: '#0E1F0E', airbnb: '#1A0A1A', guesthouse: '#0A1A1A', apartment: '#1A1A0A' }
const TYPE_BORDER = { hotel: '#3A2E00', hostel: '#1A3D1A', airbnb: '#3D1A3D', guesthouse: '#1A3D3D', apartment: '#3D3D1A' }

export default function AccommodationFinder({ user, onAuthRequired, onNavigate }) {
  const [view, setView] = useState('browse') // browse | add | detail
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({ city: '', type: 'All Types', maxCost: 200, trainingSpace: false, kitchen: false })
  const [showAddForm, setShowAddForm] = useState(false)
  const [accommodations, setAccommodations] = useState(MOCK_ACCOMMODATION)

  const cities = [...new Set(accommodations.map(a => a.city))].sort()

  const filtered = accommodations.filter(a => {
    if (filters.city && a.city !== filters.city) return false
    if (filters.type !== 'All Types' && a.type !== filters.type) return false
    if (a.cost_per_night_usd > filters.maxCost) return false
    if (filters.trainingSpace && !a.has_training_space) return false
    if (filters.kitchen && !a.has_kitchen) return false
    return true
  })

  function addAccommodation(acc) {
    setAccommodations(prev => [{ ...acc, id: Date.now(), verified_date: 'Just now' }, ...prev])
  }

  if (selected) {
    return <AccommodationDetail acc={selected} onBack={() => setSelected(null)} user={user} onAuthRequired={onAuthRequired} />
  }

  return (
    <div style={page}>
      <div style={pageHeader}>
        <button style={backBtn} onClick={() => onNavigate('home')}>← Back to tournaments</button>
        <div style={headerBadge}>Coach-Verified</div>
        <h1 style={pageTitle}>Accommodation Finder</h1>
        <p style={pageSub}>
          Real stays logged by coaches who've been there. Not hotel reviews — sports team intel.
          Distance to venue, training space, group rates, and tips you won't find on Booking.com.
        </p>
        <div style={heroStats}>
          <StatPill num={accommodations.length} label="verified stays" />
          <StatPill num={cities.length} label="cities" />
          <StatPill num={accommodations.filter(a => a.has_training_space).length} label="with training space" />
          <StatPill num={accommodations.filter(a => a.has_kitchen).length} label="with kitchen" />
        </div>
      </div>

      {/* Filters */}
      <div style={filterBar}>
        <select style={filterSelect} value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c}>{c}</option>)}
        </select>
        <select style={filterSelect} value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          {TYPES.map(t => <option key={t}>{t === 'All Types' ? t : `${TYPE_ICONS[t]} ${t.charAt(0).toUpperCase() + t.slice(1)}`}</option>)}
        </select>
        <div style={sliderWrap}>
          <label style={sliderLabel}>Max ${filters.maxCost}/night</label>
          <input type="range" min="20" max="200" step="10" value={filters.maxCost}
            onChange={e => setFilters(f => ({ ...f, maxCost: parseInt(e.target.value) }))}
            style={{ accentColor: '#F5C518', width: 120 }} />
        </div>
        <label style={checkLabel}>
          <input type="checkbox" checked={filters.trainingSpace} onChange={e => setFilters(f => ({ ...f, trainingSpace: e.target.checked }))} />
          Training space
        </label>
        <label style={checkLabel}>
          <input type="checkbox" checked={filters.kitchen} onChange={e => setFilters(f => ({ ...f, kitchen: e.target.checked }))} />
          Kitchen
        </label>
        <button style={addBtn} onClick={() => user ? setShowAddForm(true) : onAuthRequired()}>
          + Log a Stay
        </button>
      </div>

      <div style={resultsBar}>
        <span style={{ color: '#888', fontSize: 14 }}>{filtered.length} verified stay{filtered.length !== 1 ? 's' : ''}</span>
        {!user && <button style={linkBtn} onClick={onAuthRequired}>Sign in to add a stay →</button>}
      </div>

      {/* Grid */}
      <div style={grid}>
        {filtered.map(acc => (
          <AccommodationCard key={acc.id} acc={acc} onClick={() => setSelected(acc)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={empty}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏨</div>
          <h3 style={{ color: '#eee', marginBottom: 8 }}>No accommodation matches your filters</h3>
          <p style={{ color: '#888' }}>Try adjusting your filters or <button style={linkBtn} onClick={() => setFilters({ city: '', type: 'All Types', maxCost: 200, trainingSpace: false, kitchen: false })}>clear all</button></p>
        </div>
      )}

      {showAddForm && (
        <AddAccommodationForm
          user={user}
          onClose={() => setShowAddForm(false)}
          onAdd={addAccommodation}
        />
      )}
    </div>
  )
}

// ── ACCOMMODATION CARD ────────────────────────────────────────────────────────
function AccommodationCard({ acc, onClick }) {
  return (
    <div style={card} onClick={onClick}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#F5C518'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.transform = 'translateY(0)' }}>
      {/* Type badge */}
      <div style={{ ...typeBadge, background: TYPE_COLORS[acc.type] || '#1A1200', borderColor: TYPE_BORDER[acc.type] || '#3A2E00' }}>
        {TYPE_ICONS[acc.type] || '🏨'} {acc.type}
      </div>

      <h3 style={cardTitle}>{acc.name}</h3>
      <div style={cardLocation}>{acc.flag} {acc.city}, {acc.country}</div>
      <div style={{ color: '#888', fontSize: 12, marginTop: 4 }}>📍 {acc.tournament_name}</div>

      {/* Key stats */}
      <div style={statsRow}>
        <StatBox icon="🚶" val={`${acc.walk_minutes} min`} label="to venue" />
        <StatBox icon="💰" val={acc.cost_per_night_local} label="per night" gold />
        <StatBox icon="👥" val={`${acc.max_group_size} max`} label="group" />
      </div>

      {/* Amenities */}
      <div style={amenitiesRow}>
        {acc.has_training_space && <AmenityTag icon="🥊" label="Training space" />}
        {acc.has_kitchen && <AmenityTag icon="🍳" label="Kitchen" />}
        {acc.has_gym && <AmenityTag icon="💪" label="Gym" />}
        {acc.breakfast_included && <AmenityTag icon="🍳" label="Breakfast" />}
      </div>

      {/* Verified by */}
      <div style={verifiedRow}>
        <span style={{ color: '#51CF66', fontSize: 11 }}>✓ Verified</span>
        <span style={{ color: '#666', fontSize: 11 }}>{acc.verified_by} · {acc.verified_date}</span>
      </div>

      <div style={{ ...stars, marginTop: 8 }}>
        {'★'.repeat(acc.rating)}{'☆'.repeat(5 - acc.rating)}
        <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>Coach-rated</span>
      </div>

      <div style={viewMore}>View full details & tips →</div>
    </div>
  )
}

function StatBox({ icon, val, label, gold }) {
  return (
    <div style={statBox}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <div>
        <div style={{ color: gold ? '#F5C518' : '#eee', fontWeight: 700, fontSize: 13 }}>{val}</div>
        <div style={{ color: '#666', fontSize: 10 }}>{label}</div>
      </div>
    </div>
  )
}

function AmenityTag({ icon, label }) {
  return (
    <span style={amenityTag}>{icon} {label}</span>
  )
}

// ── ACCOMMODATION DETAIL ──────────────────────────────────────────────────────
function AccommodationDetail({ acc, onBack, user, onAuthRequired }) {
  const [showContact, setShowContact] = useState(false)

  return (
    <div style={page}>
      <button style={backBtn} onClick={onBack}>← Back to accommodation</button>

      <div style={detailHeader}>
        <div style={{ ...typeBadge, background: TYPE_COLORS[acc.type] || '#1A1200', borderColor: TYPE_BORDER[acc.type] || '#3A2E00' }}>
          {TYPE_ICONS[acc.type] || '🏨'} {acc.type}
        </div>
        <h1 style={detailTitle}>{acc.name}</h1>
        <div style={{ color: '#888', fontSize: 15, marginTop: 4 }}>{acc.flag} {acc.city}, {acc.country}</div>
        <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>📍 {acc.address}</div>
        <div style={{ color: '#888', fontSize: 13, marginTop: 6 }}>Used for: {acc.tournament_name}</div>
      </div>

      <div style={detailGrid}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Key facts */}
          <DetailCard title="Key Facts">
            <div style={factsGrid}>
              <Fact icon="🚶" label="Walk to venue" val={`${acc.walk_minutes} minutes (${acc.distance_to_venue_km}km)`} />
              <Fact icon="💰" label="Cost per night" val={acc.cost_per_night_local} gold />
              <Fact icon="👥" label="Max group size" val={`${acc.max_group_size} people`} />
              <Fact icon="🛏️" label="Rooms available" val={`${acc.rooms_available} rooms`} />
              {acc.group_discount && <Fact icon="🏷️" label="Group discount" val={acc.group_discount} gold />}
            </div>
          </DetailCard>

          {/* Amenities */}
          <DetailCard title="Amenities">
            <div style={amenitiesDetail}>
              <AmenityCheck label="Training space" val={acc.has_training_space} />
              <AmenityCheck label="Kitchen" val={acc.has_kitchen} />
              <AmenityCheck label="Gym" val={acc.has_gym} />
              <AmenityCheck label="Breakfast included" val={acc.breakfast_included} />
            </div>
          </DetailCard>

          {/* Group booking */}
          <DetailCard title="Group Booking">
            <p style={bodyText}>{acc.group_discount || 'Contact directly for group rates.'}</p>
            {showContact ? (
              <div style={contactBox}>
                <div style={{ color: '#F5C518', fontWeight: 700, marginBottom: 4 }}>📞 Contact</div>
                <div style={{ color: '#eee' }}>{acc.group_booking_contact}</div>
              </div>
            ) : (
              <button style={btnGold} onClick={() => user ? setShowContact(true) : onAuthRequired()}>
                {user ? 'Show group booking contact' : 'Sign in to see contact details'}
              </button>
            )}
          </DetailCard>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Coach notes */}
          <DetailCard title="Coach Notes">
            <p style={bodyText}>{acc.notes}</p>
          </DetailCard>

          {/* Tips */}
          <DetailCard title="Tips from the Coach">
            <div style={tipsBox}>
              <p style={{ margin: 0, color: '#ccc', fontSize: 14, lineHeight: 1.65 }}>{acc.tips}</p>
            </div>
          </DetailCard>

          {/* Verified by */}
          <DetailCard title="Verified By">
            <div style={verifiedDetail}>
              <div style={{ fontSize: 32 }}>✅</div>
              <div>
                <div style={{ color: '#eee', fontWeight: 700 }}>{acc.verified_by}</div>
                <div style={{ color: '#888', fontSize: 13 }}>{acc.verified_date}</div>
                <div style={{ color: '#51CF66', fontSize: 12, marginTop: 4 }}>Coach-verified stay</div>
              </div>
            </div>
            <div style={{ ...stars, marginTop: 12 }}>
              {'★'.repeat(acc.rating)}{'☆'.repeat(5 - acc.rating)}
              <span style={{ color: '#888', fontSize: 13, marginLeft: 8 }}>{acc.rating}/5 coach rating</span>
            </div>
          </DetailCard>
        </div>
      </div>
    </div>
  )
}

function DetailCard({ title, children }) {
  return (
    <div style={detailCardStyle}>
      <h3 style={detailCardTitle}>{title}</h3>
      {children}
    </div>
  )
}

function Fact({ icon, label, val, gold }) {
  return (
    <div style={factRow}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
        <div style={{ color: gold ? '#F5C518' : '#eee', fontWeight: 600, fontSize: 14, marginTop: 1 }}>{val}</div>
      </div>
    </div>
  )
}

function AmenityCheck({ label, val }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1C1C1C' }}>
      <span style={{ color: '#ccc', fontSize: 14 }}>{label}</span>
      <span style={{ color: val ? '#51CF66' : '#555', fontWeight: 700 }}>{val ? '✓ Yes' : '✗ No'}</span>
    </div>
  )
}

// ── ADD ACCOMMODATION FORM ────────────────────────────────────────────────────
function AddAccommodationForm({ user, onClose, onAdd }) {
  const empty = {
    name: '', type: 'hotel', city: '', country: '', tournament_name: '',
    address: '', distance_to_venue_km: '', walk_minutes: '',
    cost_per_night_usd: '', cost_per_night_local: '',
    max_group_size: '', rooms_available: '',
    has_training_space: false, has_kitchen: false, has_gym: false, breakfast_included: false,
    group_booking_contact: '', group_discount: '',
    notes: '', tips: '', rating: 5,
    verified_by: user?.name ? `${user.name}, ${user.club || ''}` : '',
  }
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.city || !form.cost_per_night_local) return
    setLoading(true)
    try {
      if (supabase) {
        await supabase.from('accommodations').insert([{ ...form, user_id: user.id }])
      }
      onAdd(form)
      setSuccess(true)
      setTimeout(onClose, 1800)
    } catch { onAdd(form); setSuccess(true); setTimeout(onClose, 1800) }
    finally { setLoading(false) }
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <button style={closeBtn} onClick={onClose}>✕</button>
        {success ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ fontSize: 52 }}>🏨</div>
            <h2 style={modalTitle}>Stay logged!</h2>
            <p style={{ color: '#aaa', marginTop: 8 }}>Thanks for helping other coaches find great accommodation.</p>
          </div>
        ) : (
          <>
            <h2 style={modalTitle}>Log a Stay</h2>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>Share accommodation you've used at a tournament. Your intel helps other coaches.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Accommodation name *">
                <input style={inp} placeholder="e.g. Hotel Central Sarajevo" value={form.name} onChange={e => set('name', e.target.value)} required />
              </Field>
              <div style={twoCol}>
                <Field label="Type">
                  <select style={inp} value={form.type} onChange={e => set('type', e.target.value)}>
                    {TYPES.slice(1).map(t => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Rating">
                  <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                    {[1,2,3,4,5].map(n => (
                      <button type="button" key={n} onClick={() => set('rating', n)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: n <= form.rating ? '#F5C518' : '#444', padding: 0 }}>★</button>
                    ))}
                  </div>
                </Field>
              </div>
              <div style={twoCol}>
                <Field label="City *"><input style={inp} placeholder="Belgrade" value={form.city} onChange={e => set('city', e.target.value)} required /></Field>
                <Field label="Country *"><input style={inp} placeholder="Serbia" value={form.country} onChange={e => set('country', e.target.value)} required /></Field>
              </div>
              <Field label="Tournament it was used for">
                <input style={inp} placeholder="e.g. Belgrade Golden Gloves 2024" value={form.tournament_name} onChange={e => set('tournament_name', e.target.value)} />
              </Field>
              <Field label="Address">
                <input style={inp} placeholder="Street address" value={form.address} onChange={e => set('address', e.target.value)} />
              </Field>
              <div style={twoCol}>
                <Field label="Walk to venue (minutes)"><input style={inp} type="number" value={form.walk_minutes} onChange={e => set('walk_minutes', e.target.value)} /></Field>
                <Field label="Cost per night *"><input style={inp} placeholder="€45/night" value={form.cost_per_night_local} onChange={e => set('cost_per_night_local', e.target.value)} required /></Field>
              </div>
              <div style={twoCol}>
                <Field label="Max group size"><input style={inp} type="number" value={form.max_group_size} onChange={e => set('max_group_size', e.target.value)} /></Field>
                <Field label="Approx USD per night"><input style={inp} type="number" value={form.cost_per_night_usd} onChange={e => set('cost_per_night_usd', e.target.value)} /></Field>
              </div>
              <Field label="Amenities">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 6 }}>
                  {[['has_training_space','🥊 Training space'],['has_kitchen','🍳 Kitchen'],['has_gym','💪 Gym'],['breakfast_included','🍽️ Breakfast']].map(([k, label]) => (
                    <label key={k} style={checkLabel}>
                      <input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} /> {label}
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Group booking contact (phone or email)">
                <input style={inp} placeholder="+381 11 333 3100 or email" value={form.group_booking_contact} onChange={e => set('group_booking_contact', e.target.value)} />
              </Field>
              <Field label="Group discount available?">
                <input style={inp} placeholder="e.g. 10% off for groups of 8+" value={form.group_discount} onChange={e => set('group_discount', e.target.value)} />
              </Field>
              <Field label="Your notes about the stay">
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="What should other coaches know?" value={form.notes} onChange={e => set('notes', e.target.value)} />
              </Field>
              <Field label="Top tips for coaches">
                <textarea style={{ ...inp, minHeight: 80, resize: 'vertical' }} placeholder="Practical tips — breakfast, transport, early check-in, etc." value={form.tips} onChange={e => set('tips', e.target.value)} />
              </Field>
              <Field label="Your name & club">
                <input style={inp} value={form.verified_by} onChange={e => set('verified_by', e.target.value)} />
              </Field>
              <button type="submit" style={{ ...btnGold, opacity: loading ? 0.7 : 1 }} disabled={loading}>
                {loading ? 'Saving…' : '🏨 Log This Stay'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return <div><label style={fieldLabel}>{label}</label><div style={{ marginTop: 5 }}>{children}</div></div>
}
function StatPill({ num, label }) {
  return (
    <div style={statPill}>
      <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, color: '#F5C518', lineHeight: 1 }}>{num}</span>
      <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
    </div>
  )
}

// ── STYLES ──────────────────────────────────────────────────────────────────
const page = { maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px' }
const pageHeader = { textAlign: 'center', padding: '48px 20px 36px', borderBottom: '1px solid #2A2A2A', marginBottom: 32 }
const backBtn = { background: 'none', border: '1px solid #2A2A2A', borderRadius: 6, color: '#888', padding: '6px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 20, display: 'block' }
const headerBadge = { display: 'inline-block', background: '#0E1F0E', color: '#51CF66', border: '1px solid #1A3D1A', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }
const pageTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', letterSpacing: 3, color: '#E8E8E8', margin: '0 0 12px' }
const pageSub = { color: '#888', fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: '0 auto 24px' }
const heroStats = { display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }
const statPill = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, padding: '10px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }
const filterBar = { display: 'flex', flexWrap: 'wrap', gap: 10, padding: 16, background: '#141414', border: '1px solid #2A2A2A', borderRadius: 10, marginBottom: 20, alignItems: 'center' }
const filterSelect = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 6, color: '#E8E8E8', padding: '8px 12px', fontSize: 14, cursor: 'pointer', outline: 'none' }
const sliderWrap = { display: 'flex', flexDirection: 'column', gap: 2 }
const sliderLabel = { color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }
const checkLabel = { display: 'flex', alignItems: 'center', gap: 6, color: '#aaa', fontSize: 13, cursor: 'pointer' }
const addBtn = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }
const resultsBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }
const card = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.15s', display: 'flex', flexDirection: 'column', gap: 8 }
const typeBadge = { display: 'inline-block', borderRadius: 4, padding: '2px 10px', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', border: '1px solid', color: '#F5C518', width: 'fit-content' }
const cardTitle = { fontWeight: 700, fontSize: 16, color: '#E8E8E8', margin: 0 }
const cardLocation = { color: '#888', fontSize: 13 }
const statsRow = { display: 'flex', gap: 10, marginTop: 4 }
const statBox = { display: 'flex', gap: 8, alignItems: 'center', background: '#1C1C1C', borderRadius: 8, padding: '8px 10px', flex: 1 }
const amenitiesRow = { display: 'flex', flexWrap: 'wrap', gap: 6 }
const amenityTag = { background: '#0E1F0E', border: '1px solid #1A3D1A', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#51CF66' }
const verifiedRow = { display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #1C1C1C' }
const stars = { color: '#F5C518', letterSpacing: 1 }
const viewMore = { color: '#F5C518', fontSize: 13, fontWeight: 600 }
const empty = { textAlign: 'center', padding: '80px 20px', color: '#888' }
const detailHeader = { padding: '32px 0 24px', borderBottom: '1px solid #2A2A2A', marginBottom: 28 }
const detailTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: 2, color: '#E8E8E8', margin: '10px 0 0' }
const detailGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }
const detailCardStyle = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: '20px 22px' }
const detailCardTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 18, letterSpacing: 1.5, color: '#F5C518', margin: '0 0 14px' }
const factsGrid = { display: 'flex', flexDirection: 'column', gap: 12 }
const factRow = { display: 'flex', gap: 12, alignItems: 'flex-start' }
const amenitiesDetail = { display: 'flex', flexDirection: 'column' }
const contactBox = { background: '#1A1200', border: '1px solid #3A2E00', borderRadius: 8, padding: '12px 16px', marginTop: 12 }
const bodyText = { color: '#ccc', fontSize: 14, lineHeight: 1.65, margin: 0 }
const tipsBox = { background: '#0D0D10', border: '1px solid #252530', borderRadius: 8, padding: '14px 16px' }
const verifiedDetail = { display: 'flex', gap: 14, alignItems: 'center' }
const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }
const modal = { background: '#141414', border: '1px solid #2A2A2A', borderRadius: 16, padding: 28, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.8)' }
const closeBtn = { position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#888', fontSize: 18, cursor: 'pointer' }
const modalTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 28, letterSpacing: 2, color: '#E8E8E8', margin: '0 0 4px' }
const twoCol = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }
const fieldLabel = { display: 'block', color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }
const inp = { background: '#1C1C1C', border: '1px solid #2A2A2A', borderRadius: 8, color: '#E8E8E8', padding: '10px 14px', fontSize: 14, width: '100%', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '11px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }
const linkBtn = { background: 'none', border: 'none', color: '#F5C518', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }
