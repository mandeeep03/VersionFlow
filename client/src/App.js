import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Analytics from './pages/Analytics';
import Auth from './pages/Auth';
import Subscription from './pages/Subscription';
import './styles/App.css';  

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch('https://versionflow.onrender.com/api/auth/me', {  
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await response.json();
          if (data.success) {
            setUser(data.user);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (err) {
          console.error('Error fetching user', err);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route path="/auth" element={<Auth setToken={setToken} setUser={setUser} />} />
          {user ? (
            <>
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/projects" element={<Projects user={user} />} />
              <Route path="/projects/:id" element={<ProjectDetail user={user} />} />
              <Route path="/analytics" element={<Analytics user={user} />} />
              <Route path="/subscription" element={<Subscription user={user} setUser={setUser} token={token} />} />
            </>
          ) : (
            <Route path="*" element={<Auth setToken={setToken} setUser={setUser} />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
