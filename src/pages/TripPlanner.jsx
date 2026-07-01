import { useState } from "react";

const SPORTS = ["Boxing", "Wrestling", "Judo", "Swimming", "MMA", "Weightlifting", "Taekwondo", "Gymnastics", "Athletics", "Cycling", "Rowing", "Sailing"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function renderMarkdown(text) {
  if (!text) return null;
  const lines = text.split("\n");
  const elements = [];
  let tableRows = [];
  let inTable = false;

  const renderInline = (str) => {
    const parts = str.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const flushTable = (key) => {
    if (tableRows.length === 0) return;
    const rows = tableRows.filter(r => !r.replace(/[\s|:-]/g, "").length === false);
    const cleanRows = tableRows.filter(r => !/^[\s|:-]+$/.test(r));
    const cells = cleanRows.map(r => r.split("|").map(c => c.trim()).filter(c => c.length > 0));
    if (cells.length > 0) {
      elements.push(
        <table key={"table" + key} style={{ width: "100%", borderCollapse: "collapse", margin: "16px 0" }}>
          <tbody>
            {cells.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid #2A2A2A" }}>
                {row.map((cell, ci) => (
                  ri === 0
                    ? <th key={ci} style={{ textAlign: "left", padding: "8px 12px", color: "#F5C518", fontSize: 13, textTransform: "uppercase" }}>{renderInline(cell)}</th>
                    : <td key={ci} style={{ padding: "8px 12px", color: "#ddd", fontSize: 14 }}>{renderInline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    tableRows = [];
    inTable = false;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.includes("|") && trimmed.length > 1) {
      inTable = true;
      tableRows.push(trimmed);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    if (trimmed.startsWith("### ")) {
      elements.push(<h3 key={idx} style={{ color: "#F5C518", fontSize: 18, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1, margin: "20px 0 8px 0" }}>{renderInline(trimmed.slice(4).replace(/[#*]/g, ""))}</h3>);
    } else if (trimmed.startsWith("## ")) {
      elements.push(<h2 key={idx} style={{ color: "#F5C518", fontSize: 24, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1, margin: "28px 0 12px 0", borderBottom: "1px solid #2A2A2A", paddingBottom: 8 }}>{renderInline(trimmed.slice(3).replace(/[#*]/g, ""))}</h2>);
    } else if (trimmed.startsWith("# ")) {
      elements.push(<h1 key={idx} style={{ color: "#F5C518", fontSize: 28, fontFamily: "Bebas Neue, sans-serif", letterSpacing: 1, margin: "0 0 16px 0" }}>{renderInline(trimmed.slice(2).replace(/[#*]/g, ""))}</h1>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(<div key={idx} style={{ display: "flex", gap: 8, margin: "4px 0", color: "#ddd", fontSize: 15, lineHeight: 1.6 }}><span style={{ color: "#F5C518" }}>â€¢</span><span>{renderInline(trimmed.slice(2))}</span></div>);
    } else if (trimmed === "---") {
      elements.push(<hr key={idx} style={{ border: "none", borderTop: "1px solid #2A2A2A", margin: "20px 0" }} />);
    } else if (trimmed.length === 0) {
      elements.push(<div key={idx} style={{ height: 8 }} />);
    } else {
      elements.push(<p key={idx} style={{ color: "#ddd", fontSize: 15, lineHeight: 1.8, margin: "4px 0" }}>{renderInline(trimmed)}</p>);
    }
  });

  if (inTable) flushTable("end");

  return elements;
}

function CollapsibleMarkdown({ text }) {
  const [collapsed, setCollapsed] = useState({});
  const elements = renderMarkdown(text);
  if (!elements) return null;

  const sections = [];
  let current = { title: null, key: "intro", items: [] };
  elements.forEach((el) => {
    if (el.type === "h2") {
      sections.push(current);
      current = { title: el, key: el.key, items: [] };
    } else {
      current.items.push(el);
    }
  });
  sections.push(current);

  const toggle = (key) => setCollapsed((c) => ({ ...c, [key]: !c[key] }));

  return (
    <div>
      {sections.map((s) => (
        <div key={s.key} style={{ marginBottom: 8 }}>
          {s.title ? (
            <div
              onClick={() => toggle(s.key)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
            >
              {s.title}
              <span style={{ color: "#F5C518", fontSize: 20, marginLeft: 12 }}>
                {collapsed[s.key] ? "+" : "\u2212"}
              </span>
            </div>
          ) : null}
          {(!s.title || !collapsed[s.key]) && <div>{s.items}</div>}
        </div>
      ))}
    </div>
  );
}

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
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
    resultCard: { background: "#111", border: "1px solid #F5C518", borderRadius: 12, padding: 32 },
    resultTitle: { fontFamily: "Bebas Neue, sans-serif", fontSize: 28, color: "#F5C518", marginBottom: 20 },
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

IMPORTANT: Before answering the VISA REQUIREMENTS section, use the web_search tool to find current, official visa requirements for a ${form.passport} passport holder travelling to ${form.destination}. Search official government or embassy sources. Do not rely on memory alone for visa rules - they change frequently and being wrong could strand a sports team at the border. Cite what you found from your search. Be specific, practical, and globally accurate. Use markdown formatting with ## for section headers and **bold** for key terms.`;

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2500,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await response.json();
      if (data.content) {
        const textBlocks = data.content.filter(b => b.type === "text").map(b => b.text);
        const combined = textBlocks.join("\n\n");
        if (combined) {
          setResult(combined);
        } else {
          setError("No text content in response. Please try again.");
        }
      } else if (data.error) {
        setError(data.error.message || "API error. Please try again.");
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
        <p style={styles.subtitle}>Enter your trip details and get a complete travel plan in seconds - routing, visas, costs, documents and funding points. Works for any country worldwide.</p>

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
            <h2 style={styles.resultTitle}>{form.athletes} {form.sport} Athletes - {form.destination} - {form.month}</h2>
            <div><CollapsibleMarkdown text={result} /></div>
            <div style={{ marginTop: 24, padding: 16, background: "#1a1500", border: "1px solid #F5C518", borderRadius: 8, color: "#F5C518", fontSize: 13, lineHeight: 1.6 }}>
              <strong>Important:</strong> Visa rules and entry requirements change frequently and can vary by passport, length of stay, and purpose of travel. This AI-generated information may contain errors. Always confirm directly with the destination country's embassy, consulate, or official government website before booking flights or making travel arrangements.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}