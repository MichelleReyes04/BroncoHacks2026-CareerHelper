import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { onAuthStateChanged } from "firebase/auth";
import { auth, getCurrentUserToken, isFirebaseConfigured, logOut, signInWithGoogle } from "./firebase";
import "./styles.css";

const initialProfile = {
  year: "Sophomore",
  major: "Computer Science",
  interests: "AI tools, web apps, hackathons, education technology",
  experience: "Beginner to intermediate. Built class projects and small React apps.",
  skills: "JavaScript, Python, React, Git, basic APIs",
  goals: "Find practical project ideas, decide a career direction, and build experience before internships.",
  location: "",
  opportunityData: ""
};

const fields = [
  { name: "year", label: "Year", placeholder: "Freshman, sophomore, junior..." },
  { name: "major", label: "Major", placeholder: "Computer Science, Data Science..." },
  { name: "interests", label: "Interests", placeholder: "AI, cybersecurity, design, finance..." },
  { name: "experience", label: "Experience level", placeholder: "Beginner, class projects, internship..." },
  { name: "skills", label: "Skills", placeholder: "Python, SQL, React, communication..." },
  { name: "goals", label: "Career goals", placeholder: "Explore roles, build portfolio, find research..." },
  { name: "location", label: "School or location", placeholder: "Optional" },
  { name: "opportunityData", label: "Known real opportunities", placeholder: "Optional: paste real hackathon, lab, or campus program details here.", large: true }
];

function splitAdvice(text) {
  return text
    .split(/\n(?=## )/g)
    .map((section) => section.trim())
    .filter(Boolean);
}

function getHistoryKey(user, previewMode) {
  return `careerhelper.history.${previewMode ? "preview" : user?.uid || "guest"}`;
}

function readHistory(user, previewMode) {
  try {
    return JSON.parse(localStorage.getItem(getHistoryKey(user, previewMode)) || "[]");
  } catch {
    return [];
  }
}

function writeHistory(user, previewMode, history) {
  localStorage.setItem(getHistoryKey(user, previewMode), JSON.stringify(history.slice(0, 30)));
}

function AdviceSection({ section }) {
  const lines = section.split("\n").filter(Boolean);
  const heading = lines[0].replace(/^##\s*/, "");
  const body = lines.slice(1);

  return (
    <article className="advice-section">
      <h3>{heading}</h3>
      <div className="advice-body">
        {body.map((line, index) => {
          if (line.startsWith("### ")) {
            return <h4 key={index}>{line.replace(/^###\s*/, "")}</h4>;
          }
          if (line.startsWith("- ")) {
            const [label, ...rest] = line.replace(/^- /, "").split(":");
            const hasLabel = rest.length > 0 && label.length < 34;
            return (
              <p className="bullet-line" key={index}>
                <span aria-hidden="true" />
                <span>{hasLabel ? <><strong>{label}:</strong>{rest.join(":")}</> : line.replace(/^- /, "")}</span>
              </p>
            );
          }
          return <p key={index}>{line}</p>;
        })}
      </div>
    </article>
  );
}

function AppNav({ activePage, onNavigate, user, previewMode }) {
  const navItems = [
    { id: "home", label: "Home" },
    { id: "generator", label: "AI Generator" },
    { id: "dashboard", label: "Dashboard" }
  ];

  return (
    <header className="topbar">
      <div className="topbar-identity">
        <span className="topbar-brand">CareerHelper</span>
        <span className="topbar-status">{previewMode ? "Preview mode" : `Signed in as ${user?.displayName || user?.email}`}</span>
      </div>
      <nav className="nav-tabs" aria-label="Main navigation">
        {navItems.map((item) => (
          <button
            className={activePage === item.id ? "nav-tab active" : "nav-tab"}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {!previewMode && (
        <button className="ghost-button" type="button" onClick={logOut}>Sign out</button>
      )}
    </header>
  );
}

function HomePage({ user, historyCount, onStart, onDashboard }) {
  const firstName = user?.displayName?.split(" ")[0] || "there";

  return (
    <section className="home-page">
      <div className="home-hero">
        <div className="home-copy">
          <p className="eyebrow">Welcome back</p>
          <h1>Hi {firstName}, build your next career move with evidence, not guesswork.</h1>
          <p>
            Generate a focused career plan from your student profile, then come back to your dashboard
            to compare previous advice and track how your direction is evolving.
          </p>
          <div className="home-actions">
            <button className="primary-button large-button" type="button" onClick={onStart}>Start AI Generator</button>
            <button className="ghost-button large-button" type="button" onClick={onDashboard}>View Dashboard</button>
          </div>
        </div>
        <div className="home-summary">
          <span className="summary-number">{historyCount}</span>
          <span className="summary-label">saved career plans</span>
          <p>{historyCount ? "Your newest plans are waiting in Dashboard." : "Generate your first plan to start your history."}</p>
        </div>
      </div>

      <div className="feature-grid">
        <article>
          <span>01</span>
          <h3>Profile-first guidance</h3>
          <p>Year, major, skills, goals, and interests shape the recommendations.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Actionable opportunities</h3>
          <p>Project ideas, hackathon search targets, research directions, and portfolio steps.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Saved outputs</h3>
          <p>Every generated response is stored for your signed-in Google account on this device.</p>
        </article>
      </div>
    </section>
  );
}

function AuthGate({ onAuthReady }) {
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  async function handleGoogleSignIn() {
    setAuthLoading(true);
    setAuthError("");

    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthError(err.message || "Google sign-in failed.");
    } finally {
      setAuthLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-hero">
        <div className="auth-copy">
          <p className="eyebrow">CareerHelper</p>
          <h1>Sign in to build a career plan that turns into action.</h1>
          <p>
            Use Google to continue. After login, you will open the student profile workspace for career paths,
            projects, hackathon ideas, research directions, and a focused weekly plan.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-card-header">
            <div className="google-mark" aria-hidden="true">G</div>
            <div>
              <h2>Login or sign up</h2>
              <p>One Google account is all you need.</p>
            </div>
          </div>

          <button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={authLoading || !isFirebaseConfigured}>
            <span className="google-icon" aria-hidden="true">G</span>
            {authLoading ? "Opening Google..." : "Continue with Google"}
          </button>

          {!isFirebaseConfigured && (
            <div className="notice auth-notice">
              Firebase is not configured yet. Add the required <code> VITE_FIREBASE_* </code> variables,
              restart the dev server, then sign in with Google.
            </div>
          )}

          {authError && <p className="error-message">{authError}</p>}

          {!isFirebaseConfigured && (
            <button className="text-button" type="button" onClick={onAuthReady}>
              Preview without auth setup
            </button>
          )}
        </div>
      </section>
    </main>
  );
}

function GeneratorPage({ user, previewMode, onSaveAdvice }) {
  const [profile, setProfile] = useState(initialProfile);
  const [advice, setAdvice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);
  const sections = useMemo(() => splitAdvice(advice), [advice]);
  const completion = useMemo(() => {
    const required = ["year", "major", "interests", "experience", "skills", "goals"];
    return Math.round((required.filter((key) => profile[key].trim()).length / required.length) * 100);
  }, [profile]);

  function updateField(name, value) {
    setProfile((current) => ({ ...current, [name]: value }));
  }

  async function generateAdvice(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setUsedFallback(false);

    try {
      const response = await fetch("/api/career", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(await getCurrentUserToken())
        },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to generate recommendations.");
      setAdvice(data.advice);
      setUsedFallback(Boolean(data.usedFallback));
      onSaveAdvice({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        profile,
        advice: data.advice,
        usedFallback: Boolean(data.usedFallback)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyAdvice() {
    if (advice) navigator.clipboard.writeText(advice);
  }

  function resetProfile() {
    setProfile({ ...initialProfile, location: "", opportunityData: "" });
    setAdvice("");
    setError("");
  }

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">CareerHelper</p>
          <h1>Turn a student profile into career paths, projects, and this-week actions.</h1>
          <p>
            Built for college students who need practical next steps: roles to search, skills to build,
            beginner-friendly opportunities to look for, and portfolio moves that count.
          </p>
        </div>
        <div className="status-panel" aria-label="Profile completion">
          <div>
            <span className="status-label">Profile readiness</span>
            <strong>{completion}%</strong>
          </div>
          <div className="meter"><span style={{ width: `${completion}%` }} /></div>
          <p>{completion === 100 ? "Ready to generate a focused plan." : "Fill the core fields for sharper recommendations."}</p>
        </div>
      </section>

      <section className="workspace">
        <form className="profile-panel" onSubmit={generateAdvice}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Student Intake</p>
              <h2>Profile</h2>
            </div>
            <button className="ghost-button" type="button" onClick={resetProfile}>Reset</button>
          </div>

          <div className="field-grid">
            {fields.map((field) => (
              <label className={field.large ? "field field-large" : "field"} key={field.name}>
                <span>{field.label}</span>
                {field.large ? (
                  <textarea
                    value={profile[field.name]}
                    placeholder={field.placeholder}
                    onChange={(event) => updateField(field.name, event.target.value)}
                  />
                ) : (
                  <input
                    value={profile[field.name]}
                    placeholder={field.placeholder}
                    onChange={(event) => updateField(field.name, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Career Plan"}
            </button>
            <p>Accuracy guardrails are built in: no invented dates, professors, labs, or deadlines.</p>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>

        <section className="results-panel" aria-live="polite">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h2>Action Plan</h2>
            </div>
            <button className="ghost-button" type="button" onClick={copyAdvice} disabled={!advice}>Copy</button>
          </div>

          {!advice && (
            <div className="empty-state">
              <div className="empty-mark">CH</div>
              <h3>Your generated plan will appear here.</h3>
              <p>Use the sample profile or replace it with a real student profile, then generate a plan.</p>
            </div>
          )}

          {usedFallback && (
            <div className="notice">
              No OpenAI key was detected, so CareerHelper used the local structured fallback. Add
              <code> OPENAI_API_KEY </code> in Vercel for live AI generation.
            </div>
          )}

          {sections.length > 0 && (
            <div className="advice-list">
              {sections.map((section, index) => <AdviceSection section={section} key={index} />)}
            </div>
          )}
        </section>
      </section>
    </>
  );
}

function DashboardPage({ history, onOpenGenerator, onClearHistory }) {
  const [selectedId, setSelectedId] = useState(history[0]?.id || "");
  const selected = history.find((item) => item.id === selectedId) || history[0];

  useEffect(() => {
    if (!selectedId && history[0]?.id) setSelectedId(history[0].id);
    if (selectedId && !history.some((item) => item.id === selectedId)) {
      setSelectedId(history[0]?.id || "");
    }
  }, [history, selectedId]);

  function copySelected() {
    if (selected?.advice) navigator.clipboard.writeText(selected.advice);
  }

  if (!history.length) {
    return (
      <section className="dashboard-empty">
        <div className="empty-mark">CH</div>
        <h1>No saved career plans yet.</h1>
        <p>Generate your first AI career plan and it will appear here automatically.</p>
        <button className="primary-button large-button" type="button" onClick={onOpenGenerator}>Start AI Generator</button>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <div className="dashboard-heading">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Your saved career advice</h1>
          <p>Review previous generated outputs and compare how your goals, skills, and recommended paths change over time.</p>
        </div>
        <button className="ghost-button" type="button" onClick={onClearHistory}>Clear History</button>
      </div>

      <div className="dashboard-layout">
        <aside className="history-list" aria-label="Previous generated plans">
          {history.map((item) => (
            <button
              className={selected?.id === item.id ? "history-item active" : "history-item"}
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
            >
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              <strong>{item.profile.major || "Student"} plan</strong>
              <small>{item.profile.goals || "Career plan"}</small>
            </button>
          ))}
        </aside>

        <section className="saved-advice-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{new Date(selected.createdAt).toLocaleString()}</p>
              <h2>{selected.profile.major || "Student"} Career Plan</h2>
            </div>
            <button className="ghost-button" type="button" onClick={copySelected}>Copy</button>
          </div>

          <div className="profile-chips">
            <span>{selected.profile.year}</span>
            <span>{selected.profile.major}</span>
            <span>{selected.profile.experience}</span>
          </div>

          <div className="advice-list">
            {splitAdvice(selected.advice).map((section, index) => (
              <AdviceSection section={section} key={index} />
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function CareerApp({ user, previewMode }) {
  const [activePage, setActivePage] = useState("home");
  const [history, setHistory] = useState(() => readHistory(user, previewMode));

  useEffect(() => {
    setHistory(readHistory(user, previewMode));
    setActivePage("home");
  }, [user?.uid, previewMode]);

  function saveAdvice(record) {
    setHistory((current) => {
      const next = [record, ...current];
      writeHistory(user, previewMode, next);
      return next.slice(0, 30);
    });
  }

  function clearHistory() {
    writeHistory(user, previewMode, []);
    setHistory([]);
  }

  return (
    <main className="app-shell">
      <AppNav activePage={activePage} onNavigate={setActivePage} user={user} previewMode={previewMode} />

      {activePage === "home" && (
        <HomePage
          user={user}
          historyCount={history.length}
          onStart={() => setActivePage("generator")}
          onDashboard={() => setActivePage("dashboard")}
        />
      )}

      {activePage === "generator" && (
        <GeneratorPage user={user} previewMode={previewMode} onSaveAdvice={saveAdvice} />
      )}

      {activePage === "dashboard" && (
        <DashboardPage
          history={history}
          onOpenGenerator={() => setActivePage("generator")}
          onClearHistory={clearHistory}
        />
      )}
    </main>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(!isFirebaseConfigured);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (!auth) return undefined;

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
      if (currentUser) setPreviewMode(false);
    });
  }, []);

  if (!authChecked) {
    return (
      <main className="auth-shell">
        <div className="loading-panel">Checking your session...</div>
      </main>
    );
  }

  if (!user && !previewMode) {
    return <AuthGate onAuthReady={() => setPreviewMode(true)} />;
  }

  return <CareerApp user={user} previewMode={previewMode} />;
}

createRoot(document.getElementById("root")).render(<App />);
