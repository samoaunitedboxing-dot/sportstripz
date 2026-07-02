import { useState } from "react";

function addAthlete(groups, key, athlete) {
  if (!groups[key]) groups[key] = [];
  groups[key].push({ id: "a" + Math.random().toString(36).slice(2, 9), ...athlete });
}

function parseAndGroup(raw) {
  const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const groups = {};
  let currentHeader = null;
  const numberedRe = /^\d+\.\s*(.+)$/;
  const dashSplitRe = /\s[–—-]\s/;

  lines.forEach((line) => {
    const numMatch = line.match(numberedRe);
    if (numMatch) {
      const rest = numMatch[1];
      if (rest.split(",").length >= 4) {
        const parts = rest.split(",").map((p) => p.trim());
        const [name, club, weight, ageGroup, gender] = parts;
        const key = `${weight} | ${ageGroup} | ${gender}`;
        addAthlete(groups, key, { name, club, weight, ageGroup, gender });
        return;
      }
      if (dashSplitRe.test(rest)) {
        const parts = rest.split(dashSplitRe).map((p) => p.trim());
        let name, country, club;
        if (parts.length >= 3) {
          [name, country, club] = parts;
        } else if (parts.length === 2) {
          [name, club] = parts;
        } else {
          name = parts[0];
        }
        const key = currentHeader || "Unsorted";
        addAthlete(groups, key, { name, club: club || "Unknown Club", country: country || "" });
        return;
      }
      addAthlete(groups, currentHeader || "Unsorted", { name: rest, club: "Unknown Club" });
      return;
    }

    if (line.split(",").length >= 4) {
      const parts = line.split(",").map((p) => p.trim());
      const [name, club, weight, ageGroup, gender] = parts;
      const key = `${weight} | ${ageGroup} | ${gender}`;
      addAthlete(groups, key, { name, club, weight, ageGroup, gender });
      return;
    }

    currentHeader = line;
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
      if (list[i] && list[i + 1] && list[i].club && list[i].club === list[i + 1].club) {
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

function buildRound1(athletes) {
  const ordered = avoidSameClubFirstRound(athletes);
  const bracketSize = nextPowerOfTwo(ordered.length);
  const byesNeeded = bracketSize - ordered.length;
  const slots = [...ordered];
  for (let i = 0; i < byesNeeded; i++) {
    slots.push({ id: "bye" + i, name: "BYE", club: "", isBye: true });
  }
  const pairs = [];
  for (let i = 0; i < slots.length; i += 2) {
    pairs.push({ a: slots[i], b: slots[i + 1] });
  }
  return pairs;
}

function resolveMatch(match, ri, mi, choices) {
  if (!match) return null;
  if (match.a && match.a.isBye) return match.b || null;
  if (match.b && match.b.isBye) return match.a || null;
  if (match.b === undefined) return match.a || null;
  const pick = choices?.[ri]?.[mi];
  if (pick === "a") return match.a;
  if (pick === "b") return match.b;
  return null;
}

function computeRounds(round1, choices) {
  const rounds = [round1];
  let current = round1;
  let ri = 0;
  while (current.length > 1) {
    const winners = current.map((m, mi) => resolveMatch(m, ri, mi, choices));
    const next = [];
    for (let i = 0; i < winners.length; i += 2) {
      next.push({ a: winners[i] || null, b: winners[i + 1] !== undefined ? winners[i + 1] || null : undefined });
    }
    rounds.push(next);
    current = next;
    ri++;
  }
  return rounds;
}

export default function DrawTool() {
  const [raw, setRaw] = useState("");
  const [groups, setGroups] = useState(null);
  const [round1ByGroup, setRound1ByGroup] = useState({});
  const [choicesByGroup, setChoicesByGroup] = useState({});
  const [error, setError] = useState(null);

  const styles = {
    page: { minHeight: "100vh", background: "#0a0a0a", padding: "40px 20px", fontFamily: "Inter, sans-serif" },
    container: { maxWidth: 1200, margin: "0 auto" },
    title: { fontFamily: "Bebas Neue, sans-serif", fontSize: 48, color: "#F5C518", margin: "0 0 8px 0", letterSpacing: 2 },
    subtitle: { color: "#888", fontSize: 16, marginBottom: 32 },
    card: { background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32, marginBottom: 24 },
    label: { color: "#aaa", fontSize: 13, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", display: "block", marginBottom: 8 },
    textarea: { width: "100%", minHeight: 200, background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "12px 16px", color: "#fff", fontSize: 14, fontFamily: "monospace", outline: "none", boxSizing: "border-box", resize: "vertical" },
    hint: { color: "#666", fontSize: 12, marginTop: 8, lineHeight: 1.6 },
    btn: { background: "#F5C518", color: "#000", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginTop: 16 },
    btnDisabled: { background: "#333", color: "#666", border: "none", borderRadius: 8, padding: "14px 28px", fontSize: 16, fontWeight: 700, cursor: "not-allowed", fontFamily: "Bebas Neue, sans-serif", letterSpacing: 2, marginTop: 16 },
    error: { background: "#1a0a0a", border: "1px solid #c0392b", borderRadius: 8, padding: 16, color: "#e74c3c", marginBottom: 20 },
    groupTitle: { fontFamily: "Bebas Neue, sans-serif", fontSize: 22, color: "#F5C518", letterSpacing: 1, marginBottom: 4 },
    groupCount: { color: "#666", fontSize: 13, marginBottom: 16 },
    actionBtn: { background: "none", border: "1px solid #F5C518", color: "#F5C518", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", marginLeft: 8 },
    champion: { background: "#1a1500", border: "1px solid #F5C518", borderRadius: 8, padding: "10px 16px", color: "#F5C518", fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 1, marginBottom: 16 },
    bracketWrap: { display: "flex", gap: 32, overflowX: "auto", paddingBottom: 12 },
    roundCol: { display: "flex", flexDirection: "column", justifyContent: "space-around", gap: 16, minWidth: 220 },
    roundLabel: { color: "#666", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" },
    matchBox: { background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, overflow: "hidden" },
    slotBase: { padding: "10px 14px", fontSize: 13, borderBottom: "1px solid #333", cursor: "default", width: "100%", textAlign: "left", background: "none", border: "none", fontFamily: "inherit" },
    slotDefault: { color: "#ddd" },
    slotWinner: { color: "#0a0a0a", background: "#F5C518", fontWeight: 700 },
    slotLoser: { color: "#555", textDecoration: "line-through" },
    slotBye: { color: "#555", fontStyle: "italic" },
    slotEmpty: { color: "#444" },
    slotClickable: { cursor: "pointer" },
    club: { fontSize: 11, marginLeft: 6, opacity: 0.75 },
  };

  const isReady = raw.trim().length > 0;

  const generate = () => {
    setError(null);
    const grouped = parseAndGroup(raw);
    if (Object.keys(grouped).length === 0) {
      setError("Couldn't find any athletes. Check the format and try again.");
      return;
    }
    setGroups(grouped);
    const newRound1 = {};
    Object.entries(grouped).forEach(([key, list]) => {
      newRound1[key] = buildRound1(list);
    });
    setRound1ByGroup(newRound1);
    setChoicesByGroup({});
  };

  const reshuffleGroup = (key) => {
    setRound1ByGroup((prev) => ({ ...prev, [key]: buildRound1(groups[key]) }));
    setChoicesByGroup((prev) => ({ ...prev, [key]: {} }));
  };

  const resetPicks = (key) => {
    setChoicesByGroup((prev) => ({ ...prev, [key]: {} }));
  };

  const pickWinner = (key, ri, mi, side) => {
    setChoicesByGroup((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [ri]: { ...((prev[key] || {})[ri] || {}), [mi]: side },
      },
    }));
  };

  const renderSlot = (athlete, key, ri, mi, side, resolvedWinner, clickable) => {
    if (!athlete) {
      return <div style={{ ...styles.slotBase, ...styles.slotEmpty }}>TBD</div>;
    }
    if (athlete.isBye) {
      return <div style={{ ...styles.slotBase, ...styles.slotBye }}>BYE</div>;
    }
    const isWinner = resolvedWinner && resolvedWinner.id === athlete.id;
    const isLoser = resolvedWinner && resolvedWinner.id !== athlete.id;
    const styleCombo = {
      ...styles.slotBase,
      ...(isWinner ? styles.slotWinner : isLoser ? styles.slotLoser : styles.slotDefault),
      ...(clickable ? styles.slotClickable : {}),
    };
    return (
      <button
        style={styleCombo}
        onClick={clickable ? () => pickWinner(key, ri, mi, side) : undefined}
        disabled={!clickable}
      >
        {athlete.name}
        <span style={styles.club}>{athlete.club}</span>
      </button>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>DRAW TOOL</h1>
        <p style={styles.subtitle}>
          Paste your athlete list and generate weight-class brackets automatically - with bye handling and same-club avoidance in round one. Works for boxing, wrestling, judo, and any weight-class combat sport. Once the tournament starts, tap the winning athlete in each match to advance them to the next round.
        </p>

        <div style={styles.card}>
          <label style={styles.label}>Athlete List</label>
          <textarea
            style={styles.textarea}
            placeholder={"Either format works:\n\nWeight-class headers:\nLightweight (57-60kg)\n1. John Smith - Samoa - SUBA\n2. Jane Doe - Fiji - Suva Boxing\n\nOr simple CSV:\nJohn Smith, SUBA, 57kg, U15, Male"}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
          />
          <div style={styles.hint}>
            Paste a weight-class heading followed by numbered "Name - Country - Club" lines, or use "Name, Club, Weight, Age Group, Gender" on each line. Athletes are grouped automatically.
          </div>

          {error && <div style={{ ...styles.error, marginTop: 16 }}>{error}</div>}

          <button style={isReady ? styles.btn : styles.btnDisabled} onClick={generate} disabled={!isReady}>
            GENERATE DRAW
          </button>
        </div>

        {groups &&
          Object.entries(groups).map(([key, list]) => {
            const round1 = round1ByGroup[key] || [];
            const choices = choicesByGroup[key] || {};
            const rounds = computeRounds(round1, choices);
            const finalRoundIdx = rounds.length - 1;
            const champion = resolveMatch(rounds[finalRoundIdx][0], finalRoundIdx, 0, choices);

            return (
              <div key={key} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                  <div>
                    <div style={styles.groupTitle}>{key}</div>
                    <div style={styles.groupCount}>{list.length} athlete{list.length !== 1 ? "s" : ""}</div>
                  </div>
                  <div>
                    <button style={styles.actionBtn} onClick={() => resetPicks(key)}>Reset Picks</button>
                    <button style={styles.actionBtn} onClick={() => reshuffleGroup(key)}>Re-shuffle Draw</button>
                  </div>
                </div>

                {champion && !champion.isBye && rounds[finalRoundIdx].length === 1 && rounds.length > 1 && (
                  <div style={styles.champion}>🏆 CHAMPION: {champion.name}</div>
                )}

                <div style={styles.bracketWrap}>
                  {rounds.map((round, ri) => (
                    <div key={ri} style={styles.roundCol}>
                      <div style={styles.roundLabel}>
                        {ri === 0 ? "Round 1" : ri === rounds.length - 1 ? "Final" : `Round ${ri + 1}`}
                      </div>
                      {round.map((match, mi) => {
                        const resolvedWinner = resolveMatch(match, ri, mi, choices);
                        const clickable = !!(match.a && match.b && !match.a.isBye && !match.b.isBye);
                        return (
                          <div key={mi} style={styles.matchBox}>
                            {renderSlot(match.a, key, ri, mi, "a", resolvedWinner, clickable)}
                            {renderSlot(match.b, key, ri, mi, "b", resolvedWinner, clickable)}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}