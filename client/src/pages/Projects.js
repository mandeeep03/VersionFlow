import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Projects.css';

function Projects({ user }) {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('https://versionflow.onrender.com/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects', err);
    }
  }, [token]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://versionflow.onrender.com/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          tags: formData.tags.split(',').map(tag => tag.trim()),
        }),
      });

      const data = await response.json();
      if (data.success) {
        setProjects([...projects, data.project]);
        setFormData({ name: '', description: '', tags: '' });
        setShowCreateForm(false);
      }
    } catch (err) {
      console.error('Error creating project', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Projects</h1>
        <button 
          className="create-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          New Project
        </button>
      </div>

      {showCreateForm && (
        <form className="create-form" onSubmit={handleCreateProject}>
          <input
            type="text"
            placeholder="Project Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={(e) => setFormData({...formData, tags: e.target.value})}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </form>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="projects-grid">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => (
            <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
              <h3>{project.name}</h3>
              <p>{project.description || 'No description'}</p>
              <div className="project-meta">
                <span className="date">{new Date(project.createdAt).toLocaleDateString()}</span>
                {project.tags && project.tags.length > 0 && (
                  <div className="tags">
                    {project.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <p>No projects found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Projects;
