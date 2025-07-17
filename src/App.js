import './styles.css';
import logo from './logo.svg';

function App() {
  return (
    <div className="App">
      <nav className="Navbar">
        <div className="Navbar-brand">
          <img src={logo} alt="Compliance AI Logo" className="Navbar-logo" />
          <span className="Navbar-title">Compliance AI</span>
        </div>
        <ul className="Navbar-links">
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Chat</a></li>
          <li><a href="#">Resources</a></li>
          <li><a href="#">Profile</a></li>
        </ul>
      </nav>

      <main className="Main">
        <section className="Hero">
          <h1>Welcome to Compliance AI</h1>
          <p>Your AI-powered assistant for navigating pharmaceutical compliance regulations.</p>
        </section>

        <section className="DashboardPreview">
          <h2>Quick Overview</h2>
          <div className="DashboardCards">
            <div className="Card">
              <h3>Compliance Chat</h3>
              <p>Ask real-time questions about ABPI Code.</p>
            </div>
            <div className="Card">
              <h3>ABPI Insights</h3>
              <p>Quick summaries and section lookups.</p>
            </div>
            <div className="Card">
              <h3>CRM Integration</h3>
              <p>Link compliance to your Salesforce/Veeva records.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="Footer">
        <p>&copy; {new Date().getFullYear()} Compliance AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
