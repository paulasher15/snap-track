import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef } from "react";

const categoryColors = {
  Food: "#f97316", Transport: "#3b82f6", Shopping: "#a855f7",
  Bills: "#ef4444", Health: "#22c55e", Entertainment: "#eab308", Other: "#6b7280",
};

function Badge({ category }) {
  const color = categoryColors[category] || categoryColors["Other"];
  return (
    <span style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
      {category}
    </span>
  );
}

function SheetSetup({ sheetId, onSave, onCancel }) {
  const [val, setVal] = useState(sheetId || "");
  const extract = (v) => {
    const m = v.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return m ? m[1] : v.trim();
  };
  return (
    <div style={{ background: "#13151f", border: "1px solid #2a2d3a", borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>📊 Link your Google Sheet</p>
        <button onClick={onCancel} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>✕</button>
      </div>
      <p style={{ margin: "0 0 12px", fontSize: 12, color: "#666" }}>
        You're signed in with Google — just paste your Sheet URL. No API key needed!
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          style={{ flex: 1, background: "#0f1117", border: "1px solid #2a2d3a", borderRadius: 8, padding: "9px 12px", color: "#f0f0f0", fontSize: 13, outline: "none" }}
        />
        <button
          onClick={() => { const id = extract(val); if (id) onSave(id); }}
          style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", border: "none", borderRadius: 8, padding: "9px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Save
        </button>
      </div>
      <p style={{ margin: "10px 0 0", fontSize: 11, color: "#444" }}>
        💡 The sheet must be in your Google Drive (or shared with your Gmail as Editor).
      </p>
    </div>
  );
}

function SignInPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>📸</div>
        <h1 style={{ color: "#f0f0f0", fontSize: 28, fontWeight: 800, margin: "0 0 10px", letterSpacing: -0.5 }}>Snap & Track</h1>
        <p style={{ color: "#555", fontSize: 14, margin: "0 0 10px", lineHeight: 1.7 }}>
          Take a photo of any receipt → AI reads it → rows appear in your Google Sheet automatically.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "0 0 28px", padding: "14px 16px", background: "#13151f", borderRadius: 12, border: "1px solid #1e2130", textAlign: "left" }}>
          {["📷  Snap a receipt photo", "🤖  Gemini AI extracts details", "📊  Auto-saves to Google Sheets", "📱  Works like a phone app"].map(f => (
            <p key={f} style={{ margin: 0, fontSize: 13, color: "#888" }}>{f}</p>
          ))}
        </div>
        <button
          onClick={() => signIn("google")}
          style={{
            display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
            width: "100%", padding: "14px 24px",
            background: "#fff", border: "none", borderRadius: 12,
            color: "#1a1a1a", fontWeight: 700, fontSize: 15, cursor: "pointer",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <GoogleLogo />
          Continue with Google
        </button>
        <p style={{ color: "#2a2d3a", fontSize: 11, marginTop: 14 }}>100% free · No credit card · Your data stays in your Sheet</p>
      </div>
    </div>
  );
}

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [extractStatus, setExtractStatus] = useState(null);
  const [sheetStatus, setSheetStatus] = useState(null);
  const [sheetId, setSheetId] = useState("");
  const [showSheetSetup, setShowSheetSetup] = useState(false);
  const fileRef = useRef();

  const processImage = async (file) => {
    if (!file?.type.startsWith("image/")) return;
    setLoading(true); setExtractStatus(null); setSheetStatus(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result.split(",")[1];
      setPreview(e.target.result);

      try {
        // Step 1: Extract via Gemini
        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
        });
        const extractData = await extractRes.json();
        if (!extractRes.ok) throw new Error(extractData.error);

        const parsed = extractData.transactions;
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setExtractStatus({ ok: false, msg: "No transactions found. Try a clearer photo." });
          setLoading(false); return;
        }

        setTransactions(prev => [...prev, ...parsed]);
        setExtractStatus({ ok: true, msg: `🔍 Extracted ${parsed.length} transaction${parsed.length > 1 ? "s" : ""}` });

        // Step 2: Save to Google Sheet
        if (sheetId) {
          const sheetRes = await fetch("/api/append-sheet", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions: parsed, sheetId }),
          });
          const sheetData = await sheetRes.json();
          if (sheetRes.ok) {
            setSheetStatus({ ok: true, msg: `✅ ${parsed.length} row${parsed.length > 1 ? "s" : ""} saved to your Google Sheet!` });
          } else {
            setSheetStatus({ ok: false, msg: `⚠️ Sheet error: ${sheetData.error}` });
          }
        }
      } catch (err) {
        setExtractStatus({ ok: false, msg: `Error: ${err.message}` });
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  if (status === "loading") {
    return (
      <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (status === "unauthenticated") return <SignInPage />;

  const totalExpenses = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0f1117", color: "#f0f0f0", fontFamily: "'DM Sans','Segoe UI',sans-serif", padding: "24px 16px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#a78bfa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📸</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Snap & Track</h1>
              <p style={{ margin: 0, fontSize: 11, color: "#555" }}>{session.user.email}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowSheetSetup(p => !p)}
              style={{
                background: sheetId ? "#22c55e18" : "#6366f118",
                border: `1px solid ${sheetId ? "#22c55e50" : "#6366f150"}`,
                borderRadius: 8, padding: "7px 12px",
                color: sheetId ? "#22c55e" : "#a78bfa",
                fontWeight: 700, fontSize: 12, cursor: "pointer",
              }}
            >
              {sheetId ? "✓ Sheet Linked" : "📊 Link Sheet"}
            </button>
            <button
              onClick={() => signOut()}
              style={{ background: "none", border: "1px solid #2a2d3a", borderRadius: 8, padding: "7px 12px", color: "#555", fontWeight: 600, fontSize: 12, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>

        {showSheetSetup && (
          <SheetSetup sheetId={sheetId} onSave={(id) => { setSheetId(id); setShowSheetSetup(false); }} onCancel={() => setShowSheetSetup(false)} />
        )}

        {!sheetId && !showSheetSetup && (
          <div style={{ background: "#eab30812", border: "1px solid #eab30835", borderRadius: 10, padding: "11px 14px", color: "#eab308", fontSize: 13, marginBottom: 18 }}>
            ⚠️ No sheet linked — click <b>Link Sheet</b> to enable auto-save to Google Sheets.
          </div>
        )}

        {/* Upload Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); processImage(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? "#6366f1" : "#2a2d3a"}`,
            borderRadius: 16, padding: "36px 24px", textAlign: "center",
            cursor: "pointer", background: dragOver ? "#6366f112" : "#13151f",
            transition: "all 0.2s", marginBottom: 18,
          }}
        >
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={e => processImage(e.target.files[0])} />
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, border: "3px solid #6366f1", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ margin: 0, color: "#a78bfa", fontWeight: 600 }}>
                {sheetId ? "Reading receipt & saving to Sheet…" : "Reading receipt with Gemini AI…"}
              </p>
            </div>
          ) : preview ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <img src={preview} alt="" style={{ maxHeight: 90, maxWidth: 200, borderRadius: 8, objectFit: "contain", opacity: 0.75 }} />
              <p style={{ margin: 0, color: "#6366f1", fontWeight: 600, fontSize: 13 }}>✓ Done — tap to scan another receipt</p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 44, marginBottom: 10 }}>📷</div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 16 }}>Tap to take a photo or upload a receipt</p>
              <p style={{ margin: "6px 0 0", color: "#555", fontSize: 13 }}>Receipts · Invoices · Bank screenshots · Expense photos</p>
            </>
          )}
        </div>

        {extractStatus && (
          <div style={{ background: extractStatus.ok ? "#6366f112" : "#ef444412", border: `1px solid ${extractStatus.ok ? "#6366f135" : "#ef444435"}`, borderRadius: 10, padding: "11px 14px", color: extractStatus.ok ? "#a78bfa" : "#ef4444", fontSize: 13, marginBottom: 10 }}>
            {extractStatus.msg}
          </div>
        )}
        {sheetStatus && (
          <div style={{ background: sheetStatus.ok ? "#22c55e12" : "#ef444412", border: `1px solid ${sheetStatus.ok ? "#22c55e35" : "#ef444435"}`, borderRadius: 10, padding: "11px 14px", color: sheetStatus.ok ? "#22c55e" : "#ef4444", fontSize: 13, marginBottom: 18 }}>
            {sheetStatus.msg}
          </div>
        )}

        {/* Summary Cards */}
        {transactions.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 18 }}>
            {[
              { label: "Entries", value: transactions.length, color: "#6366f1", icon: "📋" },
              { label: "Expenses", value: `₱${totalExpenses.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "#ef4444", icon: "💸" },
              { label: "Income", value: `₱${totalIncome.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: "#22c55e", icon: "💰" },
            ].map(s => (
              <div key={s.label} style={{ background: "#13151f", borderRadius: 12, padding: "14px 12px", border: "1px solid #1e2130" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <div style={{ background: "#13151f", borderRadius: 14, border: "1px solid #1e2130", overflow: "hidden" }}>
            <div style={{ padding: "13px 16px", borderBottom: "1px solid #1e2130", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>This Session ({transactions.length})</span>
              <button onClick={() => { setTransactions([]); setPreview(null); setExtractStatus(null); setSheetStatus(null); }}
                style={{ background: "none", border: "1px solid #2a2d3a", color: "#555", borderRadius: 7, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
                Clear
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#0f1117" }}>
                    {["Date", "Description", "Amount", "Category", "Notes"].map(h => (
                      <th key={h} style={{ padding: "9px 13px", textAlign: "left", color: "#444", fontWeight: 600, fontSize: 10, letterSpacing: 0.6, textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i} style={{ borderTop: "1px solid #1a1d2a" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#1a1d2a"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 13px", color: "#aaa", whiteSpace: "nowrap" }}>{t.date}</td>
                      <td style={{ padding: "10px 13px", fontWeight: 500 }}>{t.description}</td>
                      <td style={{ padding: "10px 13px", fontWeight: 700, color: t.amount > 0 ? "#ef4444" : "#22c55e", whiteSpace: "nowrap" }}>
                        {t.amount > 0 ? "-" : "+"}₱{Math.abs(t.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: "10px 13px" }}><Badge category={t.category} /></td>
                      <td style={{ padding: "10px 13px", color: "#555", fontSize: 12 }}>{t.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {transactions.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#2a2d3a" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🧾</div>
            <p style={{ margin: 0, fontSize: 13 }}>No transactions yet — tap above to scan your first receipt!</p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
