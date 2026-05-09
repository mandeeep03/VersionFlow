import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';

function Analytics({ user }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState('');
  const [projectAnalytics, setProjectAnalytics] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/analytics/user-insights', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Error fetching insights', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectAnalytics = async (pId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/analytics/project-analytics/${pId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProjectAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Error fetching project analytics', err);
    }
  };

  const handleProjectSelect = (e) => {
    const pId = e.target.value;
    setProjectId(pId);
    if (pId) {
      fetchProjectAnalytics(pId);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  return (
    <div className="analytics-page">
      <h1>Analytics & Insights</h1>

      <div className="insights-grid">
        <div className="insight-card">
          <h3>Total Projects</h3>
          <p className="number">{insights?.totalProjects || 0}</p>
        </div>
        <div className="insight-card">
          <h3>Total Resources</h3>
          <p className="number">{insights?.totalResources || 0}</p>
        </div>
        <div className="insight-card">
          <h3>Activity Period</h3>
          <p className="number">{insights?.period}</p>
        </div>
      </div>

      <div className="events-section">
        <h2>Event Breakdown (Last 30 Days)</h2>
        <div className="events-list">
          {insights?.eventBreakdown && insights.eventBreakdown.length > 0 ? (
            insights.eventBreakdown.map(event => (
              <div key={event._id} className="event-item">
                <div className="event-info">
                  <h4>{event._id}</h4>
                  <span className="count">{event.count} events</span>
                </div>
                {event.avgDuration && (
                  <p className="duration">Avg Duration: {event.avgDuration.toFixed(2)}s</p>
                )}
              </div>
            ))
          ) : (
            <p className="empty">No events recorded</p>
          )}
        </div>
      </div>

      <div className="project-analytics-section">
        <h2>Project Analytics</h2>
        <select value={projectId} onChange={handleProjectSelect} className="project-select">
          <option value="">Select a project</option>
        </select>

        {projectAnalytics && (
          <div className="project-stats">
            <div className="stat">
              <h4>Total Resources</h4>
              <p>{projectAnalytics.totalResources}</p>
            </div>
            <div className="stat">
              <h4>Storage Used</h4>
              <p>{(projectAnalytics.totalStorageUsed / (1024 * 1024)).toFixed(2)} GB</p>
            </div>
            <div className="stat">
              <h4>Collaborators</h4>
              <p>{projectAnalytics.collaboratorCount}</p>
            </div>
          </div>
        )}

        {projectAnalytics?.dailyActivity && (
          <div className="daily-activity">
            <h3>Daily Activity</h3>
            <div className="activity-list">
              {projectAnalytics.dailyActivity.map((day, idx) => (
                <div key={idx} className="activity-day">
                  <span className="date">{day._id}</span>
                  <span className="count">{day.count} events</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Analytics;
