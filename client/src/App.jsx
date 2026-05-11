const stages = [
  "מבנה אתר מסודר",
  "צד שרת מוכן להתחלה",
  "הכנה לחיבור MongoDB",
  "הכנה למסכי התחברות והעלאת וידאו"
];

function App() {
  return (
    <div className="app-shell">
      <main className="setup-card">
        <p className="badge">Step 1</p>
        <h1>AI Smart Security System</h1>
        <p className="lead">
          הפרויקט הוקם בהצלחה. בשלב הבא נבנה את מסכי הלוגין וההרשמה לפי
          התמונות ששלחת.
        </p>

        <section className="status-grid" aria-label="Project status">
          {stages.map((stage) => (
            <article className="status-item" key={stage}>
              <span className="status-dot" />
              <p>{stage}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
