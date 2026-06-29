$content = @'
import { useState } from "react";

const SPORTS = ["Boxing", "Wrestling", "Judo", "Swimming", "MMA", "Weightlifting", "Taekwondo", "Gymnastics", "Athletics", "Cycling", "Rowing", "Sailing"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function TripPlanner() {
  const [form, setForm] = useState({ sport: "", passport: "", destination: "", athletes: "", month: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const styles = {
    page: { minHeight: "100vh", background: "#0a0a0a", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: 800, margin: "0 auto" },
    title: { fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#F5C518", margin: "0 0 8px 0", letterSpacing: 2 },
    subtitle: { color: "#888", fontSize: 16, marginBottom: 40 },
    card: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, marginBottom: 24 },
    label: { color: "#aaa", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 },
    select: { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 15, marginBottom: 20, outline: "none" },
    input: { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 15, marginBottom: 20, outline: "none", boxSizing: "border-box" },
    btn: { width: "100%", background: "#F5C518", color: "#000", border: "none", borderRadius: 8, padding: "16px 32px", fontSize: 18, fontWeight: 700, cursor: "pointer", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 },
    btnDisabled: { width: "100%", background: "#333", color: "#666", border: "none", borderRadius: 8, padding: "16px 32px", fontSize: 18, fontWeight: 700, cursor: "not-allowed", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2 },
    resultCard: { background: "#111", border: "1px solid #F5C518", borderRadius: 12, padding: 32 },
    resultTitle: { fontFamily: "Bebas Neue, sans-serif", fontSize: 28, color: "#F5C518", marginBottom: 20 },
    resultText: { color: "#ddd", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-wrap" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    error: { background: "#1a0a0a", border: "1px solid #c0392b", borderRadius: 8, padding: 16, color: "#e74c3c", marginBottom: 20 },
    loading: { textAlign: "center", color: "#F5C518", padding: 40, fontSize: 18 },
    badge: { display: "inline-block", background: "#1a1500", border: "1px solid #F5C518", color: "#F5C518", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 16 },
  };

  const isReady = form.sport && form.passport && form.destination && form.athletes && form.month;

  const generate = async () => {
    if (!isReady) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const prompt = `You are SportsTripz AI, an expert travel planner for international sports teams. A coach needs a complete trip plan.

TRIP DETAILS:
- Sport: ${form.sport}
- Passport country: ${form.passport}
- Destination: ${form.destination}
- Number of athletes: ${form.athletes}
- Travel month: ${form.month}

Provide a detailed trip plan with these exact sections:

ROUTING
Recommend the best flight routing from ${form.passport} to ${form.destination}. Include stopovers, airlines, and estimated total travel time.

VISA REQUIREMENTS
Specific visa requirements for a ${form.passport} passport travelling to ${form.destination}. Include whether visa is required, cost, processing time, and any special requirements for sports teams.

ESTIMATED COSTS (per person USD)
Break down: flights, accommodation per night, visa fees, daily expenses. Give a total budget range for the trip.

ACCOMMODATION
Best area to stay near sports venues in ${form.destination}. Give 2-3 specific recommendations suitable for a sports team.

DOCUMENTS TO PREPARE
List all documents the coach needs: for athletes, for visa applications, for sports federation, and for funding applications.

FUNDING APPLICATION POINTS
3-4 key talking points for applying to a sports ministry or national Olympic committee for funding for this trip.

TIMELINE
Working backwards from ${form.month}, when should the coach start each preparation step.

Be specific, practical, and globally accurate. Use your knowledge of passport visa restrictions worldwide.`;

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.content && data.content[0]) {
        setResult(data.content[0].text);
      } else {
        setError("No response received. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>AI TRIP PLANNER</h1>
        <p style={styles.subtitle}>Enter your trip details and get a complete travel plan in seconds — routing, visas, costs, documents and funding points. Works for any country worldwide.</p>

        <div style={styles.card}>
          <div style={styles.grid}>
            <div>
              <label style={styles.label}>Sport</label>
              <select style={styles.select} value={form.sport} onChange={e => setForm({...form, sport: e.target.value})}>
                <option value="">Select sport...</option>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Passport Country</label>
              <input style={styles.input} placeholder="e.g. Samoa, Brazil, Kenya..." value={form.passport} onChange={e => setForm({...form, passport: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Destination Country</label>
              <input style={styles.input} placeholder="e.g. Thailand, Japan, USA..." value={form.destination} onChange={e => setForm({...form, destination: e.target.value})} />
            </div>
            <div>
              <label style={styles.label}>Number of Athletes</label>
              <input style={styles.input} type="number" placeholder="e.g. 6" value={form.athletes} onChange={e => setForm({...form, athletes: e.target.value})} />
            </div>
          </div>
          <label style={styles.label}>Travel Month</label>
          <select style={styles.select} value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
            <option value="">Select month...</option>
            {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>

          {error && <div style={styles.error}>{error}</div>}

          <button style={isReady ? styles.btn : styles.btnDisabled} onClick={generate} disabled={!isReady || loading}>
            {loading ? "GENERATING YOUR TRIP PLAN..." : "GENERATE TRIP PLAN"}
          </button>
        </div>

        {loading && (
          <div style={styles.resultCard}>
            <div style={styles.loading}>Analysing routes, visas and costs for your team...</div>
          </div>
        )}

        {result && (
          <div style={styles.resultCard}>
            <div style={styles.badge}>AI GENERATED</div>
            <h2 style={styles.resultTitle}>{form.athletes} {form.sport} Athletes — {form.destination} — {form.month}</h2>
            <div style={styles.resultText}>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
'@

[System.IO.File]::WriteAllText("C:\sportstripz\src\pages\TripPlanner.jsx", $content, [System.Text.Encoding]::UTF8)
Write-Host "Done - TripPlanner updated global"