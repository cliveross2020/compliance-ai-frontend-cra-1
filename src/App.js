import './styles.css';
import logo from './logo.svg';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="Navbar">
          <div className="Navbar-brand">
            <img src={logo} alt="Compliance AI Logo" className="Navbar-logo" />
            <span className="Navbar-title">Compliance AI</span>
          </div>
          <ul className="Navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/chatbot">Chatbot</Link></li>
          </ul>
        </nav>

        <main className="Main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chatbot" element={<Chatbot />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
