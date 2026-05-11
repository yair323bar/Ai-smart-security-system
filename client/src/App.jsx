const stages = [
  "Frontend workspace is ready",
  "Backend server is ready",
  "MongoDB connection setup is prepared",
  "Login and video flow will be added next"
];

function App() {
  return (
    <div className="app-shell">
      <main className="setup-card">
        <p className="badge">Project Setup</p>
        <h1>AI Smart Security System</h1>
        <p className="lead">
          The project foundation is ready. The next step is building the login
          and sign-up screens based on the provided design.
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
