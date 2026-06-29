import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { MOCK_TOURNAMENTS, SPORTS, AGE_GROUPS, MONTHS } from './mockData'
import FilterBar from './components/FilterBar'
import TournamentCard from './components/TournamentCard'
import TournamentDetail from './components/TournamentDetail'
import AuthModal from './components/AuthModal'
import AddTournamentForm from './components/AddTournamentForm'
import TripPlanner from './pages/TripPlanner'
import FlightFinder from './pages/FlightFinder'
import AccommodationFinder from './pages/AccommodationFinder'
import BudgetCalculator from './pages/BudgetCalculator'


const DEFAULT_FILTERS = { sport: 'All Sports', country: 'All Countries', month: 'All Months', ageGroup: 'All Ages' }

const NAV_ITEMS = [
  { id: 'home', label: 'Tournaments', icon: '🏆' },
  { id: 'accommodation', label: 'Accommodation', icon: '🏨' },
  { id: 'planner', label: 'Trip Planner', icon: '🗺️' },
  { id: 'flights', label: 'Flight Finder', icon: '✈️' },
  { id: 'budget', label: 'Budget Tool', icon: '💰' },
  { id: 'docs', label: 'Doc Generator', icon:  '📋' },
]

export default function App() {
  const [page, setPage] = useState('home')
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selected, setSelected] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sportstripz_user')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('tournaments')
            .select('*, reviews:team_reviews(*)')
            .order('start_date', { ascending: true })
          if (error) throw error
          setTournaments(data?.length ? data : MOCK_TOURNAMENTS)
        } else {
          await new Promise(r => setTimeout(r, 400))
          setTournaments(MOCK_TOURNAMENTS)
        }
      } catch (err) {
        console.error('Failed to load tournaments:', err)
        setTournaments(MOCK_TOURNAMENTS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function signOut() { localStorage.removeItem('sportstripz_user'); setUser(null); setMenuOpen(false) }
  function handleAuth(u) { setUser(u); setShowAuth(false) }
  function addTournament(t) { setTournaments(ts => [t, ...ts]) }
  function addReview(tournamentId, review) {
    setTournaments(ts => ts.map(t => t.id === tournamentId ? { ...t, reviews: [...(t.reviews || []), review] } : t))
    setSelected(prev => prev?.id === tournamentId ? { ...prev, reviews: [...(prev.reviews || []), review] } : prev)
  }

  const countries = [...new Set(tournaments.map(t => t.country))].sort()
  const filtered = tournaments.filter(t => {
    if (filters.sport !== 'All Sports' && t.sport !== filters.sport) return false
    if (filters.country !== 'All Countries' && t.country !== filters.country) return false
    if (filters.month !== 'All Months') {
      const mi = MONTHS.indexOf(filters.month) - 1
      if (new Date(t.start_date).getMonth() !== mi) return false
    }
    if (filters.ageGroup !== 'All Ages' && !(t.age_groups || []).includes(filters.ageGroup)) return false
    return true
  })
  const totalReviews = tournaments.reduce((a, t) => a + (t.reviews?.length || 0), 0)

  const sharedProps = { user, onAuthRequired: () => setShowAuth(true), onNavigate: setPage }

  return (
    <div style={app}>
      {/* NAV */}
      <nav style={nav}>
        <div style={navInner}>
          <button style={logoBtn} onClick={() => setPage('home')}>
            <span style={{ fontSize: 22 }}>🥊</span>
            <span style={logoText}>Sports<span style={{ color: '#F5C518' }}>Tripz</span></span>
          </button>

          {/* Desktop nav */}
          <div style={navLinks}>
            {NAV_ITEMS.map(item => (
              <button key={item.id}
                style={{ ...navLink, ...(page === item.id ? navLinkActive : {}) }}
                onClick={() => setPage(item.id)}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          <div style={navActions}>
            {user ? (
              <>
                <span style={userPill}><span style={{ color: '#F5C518' }}>●</span> {user.name}</span>
                <button style={btnOutline} onClick={() => setShowAddForm(true)}>+ Add</button>
                <button style={btnGhost} onClick={signOut}>Out</button>
              </>
            ) : (
              <>
                <button style={btnOutline} onClick={() => setShowAuth(true)}>Sign Up</button>
                <button style={btnGold} onClick={() => setShowAuth(true)}>Sign In</button>
              </>
            )}
          </div>

          <button style={hamburger} onClick={() => setMenuOpen(m => !m)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {menuOpen && (
          <div style={mobileMenu}>
            {NAV_ITEMS.map(item => (
              <button key={item.id} style={mobileLinkBtn} onClick={() => { setPage(item.id); setMenuOpen(false) }}>
                {item.icon} {item.label}
              </button>
            ))}
            <div style={{ borderTop: '1px solid #2A2A2A', marginTop: 8, paddingTop: 8 }}>
              {user ? (
                <>
                  <button style={mobileLinkBtn} onClick={() => { setShowAddForm(true); setMenuOpen(false) }}>+ Add Tournament</button>
                  <button style={{ ...mobileLinkBtn, color: '#888' }} onClick={signOut}>Sign out</button>
                </>
              ) : (
                <button style={{ ...mobileLinkBtn, color: '#F5C518' }} onClick={() => { setShowAuth(true); setMenuOpen(false) }}>Sign In / Sign Up</button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* PAGES */}
      {page === 'planner' && <TripPlanner {...sharedProps} />}
      {page === 'flights' && <FlightFinder {...sharedProps} />}
      {page === 'accommodation' && <AccommodationFinder {...sharedProps} />}
      {page === 'budget' && <BudgetCalculator {...sharedProps} />}
      


      {/* HOME PAGE */}
      {page === 'home' && (
        <>
          <header style={hero}>
            <div style={heroContent}>
              <div style={eyebrow}>The complete platform for travelling sports teams</div>
              <h1 style={heroTitle}>
                Find your next<br /><span style={{ color: '#F5C518' }}>international bout.</span>
              </h1>
              <p style={heroSub}>Tournaments, accommodation, flights, visas, and budgets — all in one place. Built for coaches.</p>
              <div style={heroStats}>
                <Stat num={tournaments.length} label="tournaments" />
                <div style={statDiv} />
                <Stat num={totalReviews} label="coach reviews" />
                <div style={statDiv} />
                <Stat num={new Set(tournaments.map(t => t.country)).size} label="countries" />
              </div>

              {/* Feature grid */}
              <div style={featureGrid}>
                {[
                  { id: 'accommodation', icon: '🏨', title: 'Accommodation Finder', sub: 'Coach-verified stays near venues' },
                  { id: 'budget', icon: '💰', title: 'Budget Calculator', sub: 'PDF reports for funding applications' },
                  { id: 'planner', icon: '🗺️', title: 'AI Trip Planner', sub: 'Full itinerary in seconds' },
                  { id: 'flights', icon: '✈️', title: 'Flight Finder', sub: 'Routes with passport warnings' },
                ].map(f => (
                  <button key={f.id} style={featureBtn} onClick={() => setPage(f.id)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#F5C518'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#2A2A2A'}>
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#eee', fontSize: 14 }}>{f.title}</div>
                      <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{f.sub}</div>
                    </div>
                  </button>
                ))}
              </div>

              {!user && (
                <button style={{ ...btnGold, marginTop: 20, fontSize: 14, padding: '11px 28px' }} onClick={() => setShowAuth(true)}>
                  Join as a coach — it's free
                </button>
              )}
            </div>
          </header>

          <main style={main}>
            <FilterBar filters={filters} setFilters={setFilters} countries={countries} />
            <div style={resultsBar}>
              <span style={{ color: '#888', fontSize: 14 }}>
                {loading ? 'Loading…' : `${filtered.length} tournament${filtered.length !== 1 ? 's' : ''}`}
              </span>
              {user
                ? <button style={btnGoldSm} onClick={() => setShowAddForm(true)}>+ Add Tournament</button>
                : <button style={linkBtn} onClick={() => setShowAuth(true)}>Sign up to add a tournament →</button>
              }
            </div>

            {loading ? (
              <div style={loadingState}><div style={spinner} /><p style={{ color: '#888', marginTop: 16 }}>Loading tournaments…</p></div>
            ) : filtered.length === 0 ? (
              <div style={emptyState}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                <h3 style={{ color: '#eee', marginBottom: 8 }}>No tournaments match your filters</h3>
                <button style={linkBtn} onClick={() => setFilters(DEFAULT_FILTERS)}>Clear all filters</button>
              </div>
            ) : (
              <div style={grid}>
                {filtered.map(t => <TournamentCard key={t.id} t={t} onOpen={setSelected} />)}
              </div>
            )}
          </main>

          <footer style={footer}>
            <div style={footerInner}>
              <span style={logoText}>Sports<span style={{ color: '#F5C518' }}>Tripz</span></span>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {NAV_ITEMS.filter(n => n.id !== 'home').map(n => (
                  <button key={n.id} style={footerLink} onClick={() => setPage(n.id)}>{n.icon} {n.label}</button>
                ))}
              </div>
            </div>
          </footer>
        </>
      )}

      {/* MODALS */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onAuth={handleAuth} />}
      {showAddForm && user && <AddTournamentForm user={user} onClose={() => setShowAddForm(false)} onAdd={addTournament} />}
      {selected && (
        <TournamentDetail tournament={selected} user={user} onClose={() => setSelected(null)}
          onAddReview={addReview} onAuthRequired={() => { setSelected(null); setShowAuth(true) }} />
      )}
    </div>
  )
}

function Stat({ num, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px' }}>
      <span style={{ fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 36, color: '#F5C518', letterSpacing: 2, lineHeight: 1 }}>{num}</span>
      <span style={{ color: '#888', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>{label}</span>
    </div>
  )
}

const app = { background: '#0A0A0A', minHeight: '100vh', color: '#E8E8E8', fontFamily: "'Inter', system-ui, sans-serif" }
const nav = { position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,10,10,0.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #2A2A2A' }
const navInner = { maxWidth: 1300, margin: '0 auto', padding: '0 20px', height: 58, display: 'flex', alignItems: 'center', gap: 12 }
const logoBtn = { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }
const logoText = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 22, letterSpacing: 2, color: '#E8E8E8' }
const navLinks = { display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }
const navLink = { background: 'none', border: 'none', color: '#666', padding: '5px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 6, fontFamily: 'inherit', whiteSpace: 'nowrap' }
const navLinkActive = { color: '#F5C518', background: '#1A1200' }
const navActions = { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }
const userPill = { color: '#aaa', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5 }
const hamburger = { display: 'none', background: 'none', border: 'none', color: '#E8E8E8', fontSize: 22, cursor: 'pointer', flexShrink: 0 }
const mobileMenu = { background: '#141414', borderTop: '1px solid #2A2A2A', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 4 }
const mobileLinkBtn = { background: 'none', border: 'none', color: '#E8E8E8', padding: '10px 0', fontSize: 15, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }
const hero = { background: 'linear-gradient(135deg, #0A0A0A 0%, #111108 60%, #0A0A0A 100%)', borderBottom: '1px solid #2A2A2A', padding: '56px 20px 48px' }
const heroContent = { maxWidth: 860, margin: '0 auto', textAlign: 'center' }
const eyebrow = { color: '#F5C518', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }
const heroTitle = { fontFamily: "'Bebas Neue', Impact, sans-serif", fontSize: 'clamp(44px, 8vw, 78px)', lineHeight: 1.05, letterSpacing: 3, margin: '0 0 18px', color: '#E8E8E8' }
const heroSub = { color: '#888', fontSize: 16, lineHeight: 1.7, marginBottom: 28 }
const heroStats = { display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 28 }
const statDiv = { width: 1, height: 36, background: '#2A2A2A' }
const featureGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12, maxWidth: 860, margin: '0 auto' }
const featureBtn = { display: 'flex', alignItems: 'center', gap: 14, background: '#141414', border: '1px solid #2A2A2A', borderRadius: 12, padding: '16px 18px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }
const main = { maxWidth: 1300, margin: '0 auto', padding: '32px 20px 64px' }
const resultsBar = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }
const loadingState = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }
const spinner = { width: 36, height: 36, border: '3px solid #2A2A2A', borderTop: '3px solid #F5C518', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }
const emptyState = { textAlign: 'center', padding: '80px 20px', color: '#888' }
const footer = { borderTop: '1px solid #2A2A2A', padding: '24px 20px' }
const footerInner = { maxWidth: 1300, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }
const footerLink = { background: 'none', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }
const btnGold = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }
const btnGoldSm = { background: '#F5C518', color: '#000', border: 'none', borderRadius: 6, padding: '7px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }
const btnOutline = { background: 'none', border: '1px solid #F5C518', borderRadius: 8, color: '#F5C518', padding: '7px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }
const btnGhost = { background: 'none', border: '1px solid #2A2A2A', borderRadius: 8, color: '#888', padding: '7px 12px', fontSize: 13, cursor: 'pointer' }
const linkBtn = { background: 'none', border: 'none', color: '#F5C518', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', padding: 0 }
