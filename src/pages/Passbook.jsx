import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const RESULTS = ["Win", "Loss", "Draw", "No Contest"];
const METHODS = ["Points (WP)", "RSC (Referee Stops Contest)", "RSCH (Head)", "Walkover", "Disqualification"];

export default function Passbook({ user, onAuthRequired }) {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [bouts, setBouts] = useState([]);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [showAddBout, setShowAddBout] = useState(false);
  const [error, setError] = useState("");

  const [athleteForm, setAthleteForm] = useState({
    full_name: "", date_of_birth: "", gender: "Male", nationality: "",
    club: "", medical_clearance_date: "", federation_reg_number: "",
  });

  const [boutForm, setBoutForm] = useState({
    bout_date: "", tournament_name: "", opponent_name: "", opponent_club: "",
    weight_kg: "", result: "Win", method: "Points (WP)", rounds: "", notes: "",
  });

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadAthletes();
  }, [user]);

  async function loadAthletes() {
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("athletes")
        .select("*")
        .order("full_name", { ascending: true });
      if (err) throw err;
      setAthletes(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadBouts(athleteId) {
    try {
      const { data, error: err } = await supabase
        .from("bouts")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("bout_date", { ascending: false });
      if (err) throw err;
      setBouts(data || []);
    } catch (err) {
      setError(err.message);
    }
  }

  function openAthlete(athlete) {
    setSelected(athlete);
    loadBouts(athlete.id);
  }

  async function submitAthlete(e) {
    e.preventDefault();
    setError("");
    if (!athleteForm.full_name) { setError("Name is required."); return; }
    try {
      const payload = { ...athleteForm, created_by: user.id };
      const { data, error: err } = await supabase
        .from("athletes")
        .insert([payload])
        .select()
        .single();
      if (err) throw err;
      setAthletes((prev) => [...prev, data].sort((a, b) => a.full_name.localeCompare(b.full_name)));
      setShowAddAthlete(false);
      setAthleteForm({ full_name: "", date_of_birth: "", gender: "Male", nationality: "", club: "", medical_clearance_date: "", federation_reg_number: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitBout(e) {
    e.preventDefault();
    setError("");
    if (!boutForm.bout_date || !boutForm.opponent_name) { setError("Date and opponent name are required."); return; }
    try {
      const payload = {
        ...boutForm,
        athlete_id: selected.id,
        weight_kg: boutForm.weight_kg ? parseFloat(boutForm.weight_kg) : null,
        rounds: boutForm.rounds ? parseInt(boutForm.rounds) : null,
      };
      const { data, error: err } = await supabase
        .from("bouts")
        .insert([payload])
        .select()
        .single();
      if (err) throw err;
      setBouts((prev) => [data, ...prev]);
      setShowAddBout(false);
      setBoutForm({ bout_date: "", tournament_name: "", opponent_name: "", opponent_club: "", weight_kg: "", result: "Win", method: "Points (WP)", rounds: "", notes: "" });
    } catch (err) {
      setError(err.message);
    }
  }

  function printPassbook() {
    window.print();
  }

  function record(list) {
    const wins = list.filter((b) => b.result === "Win").length;
    const losses = list.filter((b) => b.result === "Loss").length;
    const draws = list.filter((b) => b.result === "Draw").length;
    return { wins, losses, draws, total: list.length };
  }

  const styles = {
    page: { minHeight: "100vh", background: "#0a0a0a", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: 1000, margin: "0 auto" },
    title: { fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#F5C518", margin: "0 0 8px 0", letterSpacing: 2 },
    subtitle: { color: "#888", fontSize: 16, marginBottom: 24 },
    btn: { background: "#F5C518", color: "#000", border: "none", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
    btnOutline: { background: "none", border: "1px solid #F5C518", color: "#F5C518", borderRadius: 8, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginLeft: 12 },
    backBtn: { background: "none", border: "1px solid #333", color: "#aaa", borderRadius: 8, padding: "8px 16px", fontSize: 13, cursor: "pointer", marginBottom: 20, fontFamily: "inherit" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16, marginTop: 24 },
    athleteCard: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 20, cursor: "pointer" },
    athleteName: { fontFamily: "Bebas Neue, sans-serif", fontSize: 20, color: "#F5C518", letterSpacing: 1, marginBottom: 4 },
    athleteMeta: { color: "#888", fontSize: 13, lineHeight: 1.6 },
    card: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, marginBottom: 24 },
    label: { color: "#aaa", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 6 },
    input: { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "10px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
    formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
    error: { background: "#1a0a0a", border: "1px solid #c0392b", borderRadius: 8, padding: 14, color: "#e74c3c", marginBottom: 16 },
    boutRow: { background: "#161616", border: "1px solid #222", borderRadius: 8, padding: 16, marginBottom: 10, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 },
    boutResult: (result) => ({
      display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: 1,
      background: result === "Win" ? "#0f2a17" : result === "Loss" ? "#2a0f0f" : "#2a2510",
      color: result === "Win" ? "#4ade80" : result === "Loss" ? "#f87171" : "#facc15",
    }),
    empty: { textAlign: "center", padding: "60px 20px", color: "#666" },
    modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
    modal: { background: "#141414", border: "1px solid #2A2A2A", borderRadius: 16, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" },
    recordPill: { color: "#888", fontSize: 14, marginTop: 4 },
  };

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <h1 style={styles.title}>ATHLETE PASSBOOK</h1>
          <p style={styles.subtitle}>Sign in to track your athletes' bout history and export official records.</p>
          <button style={styles.btn} onClick={onAuthRequired}>Sign In</button>
        </div>
      </div>
    );
  }

  const rec = selected ? record(bouts) : null;

  return (
    <div style={styles.page}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>
      <div style={styles.container}>
        {!selected ? (
          <>
            <h1 style={styles.title} className="no-print">ATHLETE PASSBOOK</h1>
            <p style={styles.subtitle} className="no-print">Track every athlete's bout history in one place - permanent records that travel across tournaments and clubs.</p>
            {error && <div style={styles.error} className="no-print">{error}</div>}
            <button style={styles.btn} className="no-print" onClick={() => setShowAddAthlete(true)}>+ Add Athlete</button>

            {loading ? (
              <div style={styles.empty} className="no-print">Loading...</div>
            ) : athletes.length === 0 ? (
              <div style={styles.empty} className="no-print">No athletes yet. Add your first one above.</div>
            ) : (
              <div style={styles.grid} className="no-print">
                {athletes.map((a) => (
                  <div key={a.id} style={styles.athleteCard} onClick={() => openAthlete(a)}>
                    <div style={styles.athleteName}>{a.full_name}</div>
                    <div style={styles.athleteMeta}>
                      {a.club || "No club listed"}<br />
                      {a.nationality || ""}{a.date_of_birth ? ` · DOB ${a.date_of_birth}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button style={styles.backBtn} className="no-print" onClick={() => setSelected(null)}>← Back to all athletes</button>

            {/* Screen view header */}
            <div className="no-print">
              <h1 style={styles.title}>{selected.full_name}</h1>
              <p style={styles.subtitle}>
                {selected.club || "No club"} · {selected.nationality || "No nationality set"}
                {selected.date_of_birth ? ` · DOB ${selected.date_of_birth}` : ""}
                {selected.medical_clearance_date ? ` · Medical cleared ${selected.medical_clearance_date}` : ""}
              </p>
              <p style={styles.recordPill}>
                Record: {rec.wins}W - {rec.losses}L{rec.draws ? ` - ${rec.draws}D` : ""} ({rec.total} bout{rec.total !== 1 ? "s" : ""})
              </p>
            </div>

            {/* Print-only official header */}
            <div className="print-only" style={{ color: "#000" }}>
              <div style={{ borderBottom: "3px solid #000", paddingBottom: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#555" }}>Official Athlete Passbook</div>
                <div style={{ fontSize: 32, fontWeight: 700, marginTop: 4 }}>{selected.full_name}</div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, fontSize: 13 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 12px 4px 0", color: "#555", fontWeight: 600 }}>Club</td>
                    <td style={{ padding: "4px 0" }}>{selected.club || "-"}</td>
                    <td style={{ padding: "4px 12px 4px 24px", color: "#555", fontWeight: 600 }}>Nationality</td>
                    <td style={{ padding: "4px 0" }}>{selected.nationality || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 12px 4px 0", color: "#555", fontWeight: 600 }}>Date of Birth</td>
                    <td style={{ padding: "4px 0" }}>{selected.date_of_birth || "-"}</td>
                    <td style={{ padding: "4px 12px 4px 24px", color: "#555", fontWeight: 600 }}>Gender</td>
                    <td style={{ padding: "4px 0" }}>{selected.gender || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 12px 4px 0", color: "#555", fontWeight: 600 }}>Medical Clearance</td>
                    <td style={{ padding: "4px 0" }}>{selected.medical_clearance_date || "-"}</td>
                    <td style={{ padding: "4px 12px 4px 24px", color: "#555", fontWeight: 600 }}>Federation Reg. No.</td>
                    <td style={{ padding: "4px 0" }}>{selected.federation_reg_number || "-"}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
                Record: {rec.wins}W - {rec.losses}L{rec.draws ? ` - ${rec.draws}D` : ""} ({rec.total} total bout{rec.total !== 1 ? "s" : ""})
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #000", textAlign: "left" }}>
                    <th style={{ padding: "6px 8px 6px 0" }}>Date</th>
                    <th style={{ padding: "6px 8px" }}>Tournament</th>
                    <th style={{ padding: "6px 8px" }}>Opponent</th>
                    <th style={{ padding: "6px 8px" }}>Weight</th>
                    <th style={{ padding: "6px 8px" }}>Result</th>
                    <th style={{ padding: "6px 0 6px 8px" }}>Method</th>
                  </tr>
                </thead>
                <tbody>
                  {bouts.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: "16px 0", color: "#777" }}>No bouts logged yet.</td></tr>
                  ) : (
                    bouts.map((b) => (
                      <tr key={b.id} style={{ borderBottom: "1px solid #ccc" }}>
                        <td style={{ padding: "6px 8px 6px 0" }}>{b.bout_date}</td>
                        <td style={{ padding: "6px 8px" }}>{b.tournament_name || "-"}</td>
                        <td style={{ padding: "6px 8px" }}>{b.opponent_name}{b.opponent_club ? ` (${b.opponent_club})` : ""}</td>
                        <td style={{ padding: "6px 8px" }}>{b.weight_kg ? `${b.weight_kg}kg` : "-"}</td>
                        <td style={{ padding: "6px 8px", fontWeight: 700 }}>{b.result}</td>
                        <td style={{ padding: "6px 0 6px 8px" }}>{b.method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              <div style={{ marginTop: 32, fontSize: 11, color: "#777" }}>
                Generated via SportsTripz on {new Date().toLocaleDateString()}
              </div>
            </div>

            {error && <div style={styles.error} className="no-print">{error}</div>}
            <button style={styles.btn} className="no-print" onClick={() => setShowAddBout(true)}>+ Log a Bout</button>
            <button style={styles.btnOutline} className="no-print" onClick={printPassbook}>Print Passbook</button>

            <div style={{ marginTop: 24 }} className="no-print">
              {bouts.length === 0 ? (
                <div style={styles.empty}>No bouts logged yet for this athlete.</div>
              ) : (
                bouts.map((b) => (
                  <div key={b.id} style={styles.boutRow}>
                    <div>
                      <div style={{ color: "#eee", fontSize: 14, fontWeight: 600 }}>
                        vs {b.opponent_name} {b.opponent_club ? `(${b.opponent_club})` : ""}
                      </div>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 4 }}>
                        {b.bout_date}{b.tournament_name ? ` · ${b.tournament_name}` : ""}{b.weight_kg ? ` · ${b.weight_kg}kg` : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={styles.boutResult(b.result)}>{b.result}</span>
                      <div style={{ color: "#888", fontSize: 12, marginTop: 6 }}>{b.method}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {showAddAthlete && (
        <div style={styles.modalOverlay} onClick={() => setShowAddAthlete(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ ...styles.title, fontSize: 28 }}>Add Athlete</h2>
            <form onSubmit={submitAthlete}>
              <label style={styles.label}>Full Name *</label>
              <input style={{ ...styles.input, marginBottom: 14 }} value={athleteForm.full_name}
                onChange={(e) => setAthleteForm({ ...athleteForm, full_name: e.target.value })} />
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Date of Birth</label>
                  <input type="date" style={styles.input} value={athleteForm.date_of_birth}
                    onChange={(e) => setAthleteForm({ ...athleteForm, date_of_birth: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Gender</label>
                  <select style={styles.input} value={athleteForm.gender}
                    onChange={(e) => setAthleteForm({ ...athleteForm, gender: e.target.value })}>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Nationality</label>
                  <input style={styles.input} value={athleteForm.nationality}
                    onChange={(e) => setAthleteForm({ ...athleteForm, nationality: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Club</label>
                  <input style={styles.input} value={athleteForm.club}
                    onChange={(e) => setAthleteForm({ ...athleteForm, club: e.target.value })} />
                </div>
              </div>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Medical Clearance Date</label>
                  <input type="date" style={styles.input} value={athleteForm.medical_clearance_date}
                    onChange={(e) => setAthleteForm({ ...athleteForm, medical_clearance_date: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Federation Reg. Number</label>
                  <input style={styles.input} value={athleteForm.federation_reg_number}
                    onChange={(e) => setAthleteForm({ ...athleteForm, federation_reg_number: e.target.value })} />
                </div>
              </div>
              <button type="submit" style={{ ...styles.btn, width: "100%", marginTop: 8 }}>Save Athlete</button>
            </form>
          </div>
        </div>
      )}

      {showAddBout && selected && (
        <div style={styles.modalOverlay} onClick={() => setShowAddBout(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ ...styles.title, fontSize: 28 }}>Log a Bout</h2>
            <p style={{ color: "#888", fontSize: 13, marginBottom: 16 }}>For {selected.full_name}</p>
            <form onSubmit={submitBout}>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Bout Date *</label>
                  <input type="date" style={styles.input} value={boutForm.bout_date}
                    onChange={(e) => setBoutForm({ ...boutForm, bout_date: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Tournament</label>
                  <input style={styles.input} value={boutForm.tournament_name}
                    onChange={(e) => setBoutForm({ ...boutForm, tournament_name: e.target.value })} />
                </div>
              </div>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Opponent Name *</label>
                  <input style={styles.input} value={boutForm.opponent_name}
                    onChange={(e) => setBoutForm({ ...boutForm, opponent_name: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Opponent Club</label>
                  <input style={styles.input} value={boutForm.opponent_club}
                    onChange={(e) => setBoutForm({ ...boutForm, opponent_club: e.target.value })} />
                </div>
              </div>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Weight (kg)</label>
                  <input type="number" step="0.1" style={styles.input} value={boutForm.weight_kg}
                    onChange={(e) => setBoutForm({ ...boutForm, weight_kg: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Rounds</label>
                  <input type="number" style={styles.input} value={boutForm.rounds}
                    onChange={(e) => setBoutForm({ ...boutForm, rounds: e.target.value })} />
                </div>
              </div>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Result</label>
                  <select style={styles.input} value={boutForm.result}
                    onChange={(e) => setBoutForm({ ...boutForm, result: e.target.value })}>
                    {RESULTS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Method</label>
                  <select style={styles.input} value={boutForm.method}
                    onChange={(e) => setBoutForm({ ...boutForm, method: e.target.value })}>
                    {METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <label style={styles.label}>Notes</label>
              <textarea style={{ ...styles.input, minHeight: 60, resize: "vertical", marginBottom: 14 }} value={boutForm.notes}
                onChange={(e) => setBoutForm({ ...boutForm, notes: e.target.value })} />
              <button type="submit" style={{ ...styles.btn, width: "100%" }}>Save Bout</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
