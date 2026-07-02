import { useState } from "react";

function parseAthletes(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line, idx) => {
      const parts = line.split(",").map((p) => p.trim());
      const [name, club, weight, ageGroup, gender] = parts;
      return {
        id: "a" + idx,
        name: name || "Unnamed",
        club: club || "Unknown Club",
        weight: weight || "Unspecified",
        ageGroup: ageGroup || "Unspecified",
        gender: gender || "Unspecified",
      };
    });
}

function groupAthletes(athletes) {
  const groups = {};
  athletes.forEach((a) => {
    const key = `${a.weight} | ${a.ageGroup} | ${a.gender}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(a);
  });
  return groups;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function avoidSameClubFirstRound(athletes) {
  let list = shuffle(athletes);
  for (let pass = 0; pass < 20; pass++) {
    let swapped = false;
    for (let i = 0; i < list.length - 1; i += 2) {
      if (list[i] && list[i + 1] && list[i].club === list[i + 1].club) {
        for (let j = i + 2; j < list.length; j++) {
          if (list[j].club !== list[i].club) {
            [list[i + 1], list[j]] = [list[j], list[i + 1]];
            swapped = true;
            break;
          }
        }
      }
    }
    if (!swapped) break;
  }
  return list;
}

function nextPowerOfTwo(n) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

function buildBracket(athletes) {
  const ordered = avoidSameClubFirstRound(athletes);
  const bracketSize = nextPowerOfTwo(ordered.length);
  const byesNeeded = bracketSize - ordered.length;

  const slots = [...ordered];
  for (let i = 0; i < byesNeeded; i++) {
    slots.push({ id: "bye" + i, name: "BYE", club: "", isBye: true });
  }

  const rounds = [];
  let current = [];
  for (let i = 0; i < slots.length; i += 2) {
    current.push({ a: slots[i], b: slots[i + 1] });
  }
  rounds.push(current);

  let roundSize = current.length;
  while (roundSize > 1) {
    roundSize = roundSize / 2;
    const nextRound = [];
    for (let i = 0; i < roundSize; i++) {
      nextRound.push({ a: null, b: null });
    }
    rounds.push(nextRound);
  }

  return rounds;
}

export default function DrawTool() {
  const [raw, setRaw] = useState("");
  const [groups, setGroups] = useState(null);
  const [brackets, setBrackets] = useState({});
  const [error, setError] = useState(null);

  const styles = {
    page: { minHeight: "100vh", background: "#0a0a0a", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: 1100, margin: "0 auto" },
    title: { fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#F5C518", margin: "0 0 8px 0", letterSpacing: 2 },
    subtitle: { color: "#888", fontSize: 16, marginBottom: 32 },
    card: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, marginBottom: 24 },
    label: { color: "#aaa", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 },
    textarea: { width: "100%", minHeight: 180, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, fontFamily: "monospace", outline: "none", boxSizing: "border-box", resize: "vertical" },
    hint: { color: "#666", fontSize: 12, marginTop: 8, lineHeight: 1.6 },
    btn: { background: "#F5C518", color: "#000", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginTop: 16 },
    btnDisabled: { background: "#333", color: "#666", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "not-allowed", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginTop: 16 },
    error: { background: "#1a0a0a", border: "1px solid #c0392b", borderRadius: 8, padding: 16, color: "#e74c3c", marginBottom: 20 },
    groupTitle: { fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: "#F5C518", letterSpacing: 1, marginBottom: 4 },
    groupCount: { color: "#666", fontSize: 13, marginBottom: 16 },
    bracketWrap: { display: "flex", gap: 32, overflowX: "auto", paddingBottom: 12 },
    roundCol: { display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 16, minWidth: 220 },
    roundLabel: { color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" },
    matchBox: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, overflow: "hidden" },
    slotFilled: { padding: "10px 14px", fontSize: 13, color: "#ddd", borderBottom: "1px solid #333" },
    slotBye: { padding: "10px 14px", fontSize: 13, color: "#555", fontStyle: "italic", borderBottom: "1px solid #333" },
    slotEmpty: { padding: "10px 14px", fontSize: 13, color: "#444" },
    club: { color: "#F5C518", fontSize: 11, marginLeft: 6 },
  };

  const isReady = raw.trim().length > 0;

  const generate = () => {
    setError(null);
    const athletes = parseAthletes(raw);
    if (athletes.length === 0) {
      setError("Paste at least one athlete before generating a draw.");
      return;
    }
    const grouped = groupAthletes(athletes);
    setGroups(grouped);

    const newBrackets = {};
    Object.entries(grouped).forEach(([key, list]) => {
      newBrackets[key] = buildBracket(list);
    });
    setBrackets(newBrackets);
  };

  const regenerateGroup = (key) => {
    setBrackets((prev) => ({
      ...prev,
      [key]: buildBracket(groups[key]),
    }));
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>DRAW TOOL</h1>
        <p style={styles.subtitle}>Paste your athlete list and generate weight-class brackets automatically - with bye handling and same-club avoidance in round one. Works for boxing, wrestling, judo, and any weight-class combat sport.</p>

        <div style={styles.card}>
          <label style={styles.label}>Athlete List</label>
          <textarea
            style={styles.textarea}
            placeholder={"One athlete per line:\nName, Club, Weight, Age Group, Gender\n\nExample:\nAlonzo Tuilagi, SUBA, 46kg, U15, Male\nJohn Smith, Apia Boxing, 46kg, U15, Male"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={styles.hint}>
            Format: Name, Club, Weight, Age Group, Gender (one entry per line, separated by commas). Athletes are automatically grouped by matching weight, age group, and gender.
          </div>

          {error && <div style={{ ...styles.error, marginTop: 16 }}>{error}</div>}

          <button style={isReady ? styles.btn : styles.btnDisabled} onClick={generate} disabled={!isReady}>
            GENERATE DRAW
          </button>
        </div>

        {groups && Object.keys(groups).length > 0 && (
          <>
            {Object.entries(groups).map(([key, list]) => (
              <div key={key} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={styles.groupTitle}>{key}</div>
                    <div style={styles.groupCount}>{list.length} athlete{list.length !== 1 ? "s" : ""}</div>
                  </div>
                  <button
                    style={{ background: "none", border: "1px solid #F5C518", color: "#F5C518", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}
                    onClick={() => regenerateGroup(key)}
                  >
                    Re-shuffle Draw
                  </button>
                </div>

                <div style={styles.bracketWrap}>
                  {brackets[key]?.map((round, ri) => (
                    <div key={ri} style={styles.roundCol}>
                      <div style={styles.roundLabel}>
                        {ri === 0 ? "Round 1" : ri === brackets[key].length - 1 ? "Final" : `Round ${ri + 1}`}
                      </div>
                      {round.map((match, mi) => (
                        <div key={mi} style={styles.matchBox}>
                          {match.a ? (
                            match.a.isBye ? (
                              <div style={styles.slotBye}>BYE</div>
                            ) : (
                              <div style={styles.slotFilled}>
                                {match.a.name}
                                <span style={styles.club}>{match.a.club}</span>
                              </div>
                            )
                          ) : (
                            <div style={styles.slotEmpty}>TBD</div>
                          )}
                          {match.b !== undefined ? (
                            match.b ? (
                              match.b.isBye ? (
                                <div style={styles.slotBye}>BYE</div>
                              ) : (
                                <div style={{ ...styles.slotFilled, borderBottom: "none" }}>
                                  {match.b.name}
                                  <span style={styles.club}>{match.b.club}</span>
                                </div>
                              )
                            ) : (
                              <div style={{ ...styles.slotEmpty, borderBottom: "none" }}>TBD</div>
                            )
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}