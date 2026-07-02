function TabbedMarkdown({ text }) {
  const elements = renderMarkdown(text);
  if (!elements) return null;

  const sections = [];
  let current = { title: null, label: "Overview", key: "intro", items: [] };
  elements.forEach((el) => {
    if (el.type === "h2") {
      sections.push(current);
      const label = typeof el.props.children === "string" ? el.props.children : (Array.isArray(el.props.children) ? el.props.children.join("") : "Section");
      current = { title: el, label, key: el.key, items: [] };
    } else {
      current.items.push(el);
    }
  });
  sections.push(current);

  const [activeTab, setActiveTab] = useState(sections[0]?.key || "intro");
  const activeSection = sections.find((s) => s.key === activeTab) || sections[0];

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24, borderBottom: "1px solid #2A2A2A", paddingBottom: 16 }}>
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveTab(s.key)}
            style={{
              background: activeTab === s.key ? "#F5C518" : "#1a1a1a",
              color: activeTab === s.key ? "#000" : "#ccc",
              border: activeTab === s.key ? "1px solid #F5C518" : "1px solid #333",
              borderRadius: 20,
              padding: "8px 18px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              cursor: "pointer",
              textTransform: "uppercase",
              transition: "all 0.15s ease",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div>{activeSection?.items}</div>
    </div>
  );
}