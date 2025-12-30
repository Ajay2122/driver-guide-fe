import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import LogList from './pages/LogList';
import LogForm from './pages/LogForm';
import LogDetail from './pages/LogDetail';
import Drivers from './pages/Drivers';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-container">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/logs" element={<LogList />} />
            <Route path="/logs/:id" element={<LogDetail />} />
            <Route path="/create" element={<LogForm />} />
            <Route path="/edit/:id" element={<LogForm />} />
            <Route path="/drivers" element={<Drivers />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <p className="footer-text">
              © 2024 Driver Log - HOS Tracking System | 
              <a href="https://www.fmcsa.dot.gov" target="_blank" rel="noopener noreferrer" className="footer-link"> FMCSA Compliant</a>
            </p>
          </div>
        </footer>
    </div>
    </Router>
  );
}

export default App;
