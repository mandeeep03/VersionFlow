import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    projects: 0,
    resources: 0,
    collaborators: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://versionflow.onrender.com/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setRecentProjects(data.projects.slice(0, 5));
          setStats({
            projects: data.projects.length,
            resources: data.projects.reduce((sum, p) => sum + (p.resources?.length || 0), 0),
            collaborators: data.projects.reduce((sum, p) => sum + (p.collaborators?.length || 0), 0),
          });
        }
      } catch (err) {
        console.error('Error fetching projects', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}</h1>
        <p>Manage your projects and resources efficiently</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.projects}</h3>
          <p>Projects</p>
          <span className="tier-badge">{user.subscriptionTier}</span>
        </div>
        <div className="stat-card">
          <h3>{stats.resources}</h3>
          <p>Resources</p>
        </div>
        <div className="stat-card">
          <h3>{stats.collaborators}</h3>
          <p>Active Collaborators</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Projects</h2>
          <Link to="/projects" className="view-all">View All</Link>
        </div>
        {recentProjects.length > 0 ? (
          <div className="projects-list">
            {recentProjects.map(project => (
              <Link key={project._id} to={`/projects/${project._id}`} className="project-item">
                <h3>{project.name}</h3>
                <p>{project.description || 'No description'}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No projects yet</p>
            <Link to="/projects" className="cta-button">Create Your First Project</Link>
          </div>
        )}
      </div>

      <div className="upgrade-section">
        <h2>Upgrade Your Plan</h2>
        <p>Get more projects, storage, and team members</p>
        <Link to="/subscription" className="upgrade-button">View Plans</Link>
      </div>
    </div>
  );
}

export default Dashboard;
