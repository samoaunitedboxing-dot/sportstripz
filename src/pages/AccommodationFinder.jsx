import { useState } from "react";

const CACHE_KEY_PREFIX = "sportstripz_accom_cache_";

// AFFILIATE CONFIG - once CJ approves your Booking.com application, paste your
// real affiliate ID here (found under Booking.com > Get Links in your CJ account).
// Example real ID looks like: 956509
const BOOKING_AFFILIATE_ID = "REPLACE_WITH_CJ_AFFILIATE_ID";

function bookingAffiliateUrl(baseUrl) {
  if (BOOKING_AFFILIATE_ID === "REPLACE_WITH_CJ_AFFILIATE_ID") {
    return baseUrl; // no tracking yet - update BOOKING_AFFILIATE_ID above once approved
  }
  const sep = baseUrl.includes("?") ? "&" : "?";
  return baseUrl + sep + "aid=" + BOOKING_AFFILIATE_ID;
}

function safeStars(n) {
  const num = typeof n === "number" && !isNaN(n) ? Math.max(0, Math.min(5, n)) : 0;
  const filled = Math.max(0, Math.min(5, Math.floor(num)));
  return "*".repeat(filled) + "-".repeat(5 - filled);
}

function sanitizeResult(r) {
  if (!r || typeof r !== "object") return null;
  return {
    name: r.name || "Unnamed property",
    type: r.type || "hotel",
    area: r.area || "",
    distance_to_centre: r.distance_to_centre || "",
    price_usd: typeof r.price_usd === "number" ? r.price_usd : null,
    price_note: r.price_note || "per night",
    rating: typeof r.rating === "number" ? r.rating : 0,
    group_discount: r.group_discount || "Contact property directly",
    has_gym: !!r.has_gym,
    has_kitchen: !!r.has_kitchen,
    breakfast_included: !!r.breakfast_included,
    sports_friendly: !!r.sports_friendly,
    booking_tip: r.booking_tip || "",
    coach_note: r.coach_note || "",
  };
}

export default function AccommodationFinder() {
  const [search, setSearch] = useState({ city: "", type: "", maxBudget: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  const styles = {
    page: { minHeight: "100vh", background: "#0a0a0a", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: 900, margin: "0 auto" },
    title: { fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#F5C518", margin: "0 0 8px 0", letterSpacing: 2 },
    subtitle: { color: "#888", fontSize: 16, marginBottom: 40 },
    card: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, marginBottom: 24 },
    label: { color: "#aaa", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 },
    input: { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 15, marginBottom: 20, outline: "none", boxSizing: "border-box" },
    select: { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 15, marginBottom: 20, outline: "none" },
    btn: { width: "100%", background: "#F5C518", color: "#000", border: "none", borderRadius: 8, padding: "16px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 },
    btnDisabled: { width: "100%", background: "#333", color: "#666", border: "none", borderRadius: 8, padding: "16px 32px", fontSize: 18, fontWeight: 700, cursor: "not-allowed", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 },
    resultCard: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24, marginBottom: 16 },
    resultTitle: { fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: "#F5C518", marginBottom: 4 },
    tag: { display: "inline-block", background: "#1a1500", border: "1px solid #F5C518", color: "#F5C518", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginRight: 6, marginBottom: 8 },
    tagGreen: { display: "inline-block", background: "#0a1a0a", border: "1px solid #27ae60", color: "#27ae60", borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700, marginRight: 6, marginBottom: 8 },
    price: { color: "#F5C518", fontSize: 20, fontWeight: 700, marginBottom: 4 },
    detail: { color: "#888", fontSize: 13, marginBottom: 4 },
    notes: { color: "#ccc", fontSize: 14, lineHeight: 1.6, marginTop: 12, borderTop: "1px solid #222", paddingTop: 12 },
    error: { background: "#1a0a0a", border: "1px solid #c0392b", borderRadius: 8, padding: 16, color: "#e74c3c", marginBottom: 20 },
    loading: { textAlign: "center", color: "#F5C518", padding: 40, fontSize: 18 },
    noResults: { textAlign: "center", color: "#888", padding: 40 },
    badge: { display: "inline-block", background: "#1a1500", border: "1px solid #F5C518", color: "#F5C518", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 16 },
    stars: { color: "#F5C518", marginBottom: 8 },
    photoNotice: { color: "#666", fontSize: 12, marginTop: 12, fontStyle: "italic" },
  };

  const isReady = search.city.trim().length > 1;

  const cacheKey = () => CACHE_KEY_PREFIX + search.city.trim().toLowerCase() + "_" + (search.type || "any") + "_" + (search.maxBudget || "none");

  const findAccommodation = async () => {
    if (!isReady) return;
    setLoading(true);
    setError(null);
    setResults(null);
    setSearched(true);
    setFromCache(false);

    try {
      const cached = sessionStorage.getItem(cacheKey());
      if (cached) {
        const parsedCache = JSON.parse(cached);
        setResults(parsedCache);
        setFromCache(true);
        setLoading(false);
        return;
      }
    } catch {}

    const prompt = `You are SportsTripz accommodation expert. Find the best accommodation options for a travelling sports team.

SEARCH REQUEST:
- City/Destination: ${search.city}
- Accommodation type preference: ${search.type || "Any"}
- Max budget per person per night USD: ${search.maxBudget || "No limit"}

IMPORTANT: Use the web_search tool to find REAL, currently operating hotels, hostels, apartments, or guesthouses in ${search.city}. Do not invent fictional properties - every name returned must be a genuine, real, bookable accommodation that actually exists right now. Search for terms like "best hotels near [venue/city centre] ${search.city}" and "budget accommodation ${search.city}" to find real options.

After researching, return ONLY a JSON array with 6 real accommodation options suitable for sports teams in ${search.city}. Include a genuine mix across types - a mix of hotels, hostels, and apartments in that city. Cover a range of price points from budget to mid-range to higher-end, not all similar prices. Each object must have these exact fields:
{
  "name": "Real hotel name as found via search",
  "type": "hotel OR hostel OR apartment OR guesthouse",
  "area": "Neighborhood or area name",
  "distance_to_centre": "X km from city centre",
  "price_usd": 85,
  "price_note": "per person per night",
  "rating": 4.2,
  "group_discount": "10% for groups of 8+",
  "has_gym": true,
  "has_kitchen": false,
  "breakfast_included": true,
  "sports_friendly": true,
  "booking_tip": "Book directly for group rates",
  "coach_note": "Why this is good for sports teams - early checkout for weigh-ins, luggage storage, etc"
}

Return ONLY the JSON array. No other text. No markdown.`;

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      const textBlock = (data.content || []).find(b => b.type === "text");
  if (textBlock && textBlock.text) {
        const text = textBlock.text.trim();
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        const safeResults = (Array.isArray(parsed) ? parsed : []).map(sanitizeResult).filter(Boolean);
        setResults(safeResults);
        try { sessionStorage.setItem(cacheKey(), JSON.stringify(safeResults)); } catch {}
      } else if (data.error) {
        setError(data.error.message || "API error. Please try again.");
      } else {
        setError("No results returned. Please try again.");
      }
    } catch (err) {
      setError("Search failed. Please check your connection and try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>ACCOMMODATION FINDER</h1>
        <p style={styles.subtitle}>Find coach-verified stays for sports teams anywhere in the world. Group rates, early checkout, luggage storage and more.</p>

        <div style={styles.card}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>City or Destination</label>
              <input style={styles.input} placeholder="e.g. Bangkok, Tokyo, Madrid..." value={search.city} onChange={e => setSearch({...search, city: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Accommodation Type</label>
              <select style={styles.select} value={search.type} onChange={e => setSearch({...search, type: e.target.value})}>
                <option value="">Any type</option>
                <option value="hotel">Hotel</option>
                <option value="hostel">Hostel</option>
                <option value="apartment">Apartment</option>
                <option value="guesthouse">Guesthouse</option>
              </select>
            </div>
            <div>
              <label style={styles.label}>Max Budget (USD/night)</label>
              <input style={styles.input} type="number" placeholder="e.g. 80" value={search.maxBudget} onChange={e => setSearch({...search, maxBudget: e.target.value})} />
            </div>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button style={isReady ? styles.btn : styles.btnDisabled} onClick={findAccommodation} disabled={!isReady || loading}>
            {loading ? "SEARCHING WORLDWIDE..." : "FIND ACCOMMODATION"}
          </button>
        </div>

        {loading && (
          <div style={styles.card}>
            <div style={styles.loading}>Finding real, bookable options for sports teams in {search.city}...</div>
          </div>
        )}

        {results && results.length > 0 && (
          <div>
            <div style={styles.badge}>
              AI POWERED - {results.length} REAL OPTIONS FOUND IN {search.city.toUpperCase()}
              {fromCache ? " (cached result)" : ""}
            </div>
            {results.map((r, i) => (
              <div key={i} style={styles.resultCard}>
                <div style={styles.resultTitle}>{r.name}</div>
                <div style={styles.stars}>{safeStars(r.rating)} {r.rating || "N/A"}/5</div>
                <div>
                  <span style={styles.tag}>{(r.type || "hotel").toUpperCase()}</span>
                  {r.area && <span style={styles.tag}>{r.area}</span>}
                  {r.distance_to_centre && <span style={styles.tag}>{r.distance_to_centre}</span>}
                  {r.has_gym && <span style={styles.tagGreen}>GYM</span>}
                  {r.has_kitchen && <span style={styles.tagGreen}>KITCHEN</span>}
                  {r.breakfast_included && <span style={styles.tagGreen}>BREAKFAST</span>}
                  {r.sports_friendly && <span style={styles.tagGreen}>SPORTS FRIENDLY</span>}
                </div>
                <div style={styles.price}>{r.price_usd != null ? `$${r.price_usd} USD` : "Price on request"} {r.price_note}</div>
                {r.group_discount && <div style={styles.detail}>Group discount: {r.group_discount}</div>}
                {r.booking_tip && <div style={styles.detail}>Booking tip: {r.booking_tip}</div>}
                {r.coach_note && <div style={styles.notes}>{r.coach_note}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(r.name + " " + r.area + " " + search.city)}`} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#F5C518", color: "#000", padding: "10px 0", borderRadius: 6, textAlign: "center", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>View Real Photos &amp; Reviews on Maps</a>
                <a href={bookingAffiliateUrl(`https://www.booking.com/search.html?ss=${encodeURIComponent(r.name + " " + search.city)}`)} target="_blank" rel="noreferrer" style={{ flex: 1, background: "#003580", color: "#fff", padding: "10px 0", borderRadius: 6, textAlign: "center", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>Book Now</a>
              </div>
              <div style={styles.photoNotice}>Photos and reviews load from the property's real Maps listing - not shown inline to avoid mismatched images.</div>
              </div>
            ))}
          </div>
        )}

        {searched && !loading && results && results.length === 0 && (
          <div style={styles.card}>
            <div style={styles.noResults}>No results found for {search.city}. Try a different city or adjust your filters.</div>
          </div>
        )}
      </div>
    </div>
  );
}
