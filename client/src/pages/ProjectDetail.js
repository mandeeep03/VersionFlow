import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/ProjectDetail.css';

function ProjectDetail({ user }) {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    type: 'document',
    size: 0,
  });

  const token = localStorage.getItem('token');

  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await fetch(`https://versionflow.onrender.com/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
      }

      const resourceResponse = await fetch(`https://versionflow.onrender.com/api/resources/${id}/resources`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const resourceData = await resourceResponse.json();
      if (resourceData.success) {
        setResources(resourceData.resources);
      }
    } catch (err) {
      console.error('Error fetching project', err);
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleUploadResource = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://versionflow.onrender.com/api/resources/${id}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...uploadData,
          url: `https://storage.example.com/${uploadData.title}`,
          metadata: {},
        }),
      });

      const data = await response.json();
      if (data.success) {
        setResources([...resources, data.resource]);
        setUploadData({ title: '', type: 'document', size: 0 });
        setShowUploadForm(false);
      }
    } catch (err) {
      console.error('Error uploading resource', err);
    }
  };

  const handleAddCollaborator = async (e) => {
    e.preventDefault();
    const email = prompt('Enter collaborator email:');
    if (email) {
      console.log('Add collaborator:', email);
    }
  };

  if (loading) return <div className="loading">Loading project...</div>;
  if (!project) return <div className="error">Project not found</div>;

  return (
    <div className="project-detail">
      <div className="project-header">
        <div>
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <button className="add-collaborator-btn" onClick={handleAddCollaborator}>
          Add Collaborator
        </button>
      </div>

      <div className="project-info">
        <div className="info-section">
          <h3>Collaborators</h3>
          <div className="collaborators">
            <div className="collaborator">
              <span className="name">You (Owner)</span>
            </div>
            {project.collaborators?.map(collab => (
              <div key={collab.userId._id} className="collaborator">
                <span className="name">{collab.userId.name}</span>
                <span className="role">{collab.role}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="info-section">
          <h3>Project Settings</h3>
          <div className="settings">
            <div className="setting-item">
              <span>Comments Enabled</span>
              <span className="badge">{project.settings.allowComments ? 'Yes' : 'No'}</span>
            </div>
            <div className="setting-item">
              <span>Version Control</span>
              <span className="badge">{project.settings.versionControl ? 'Yes' : 'No'}</span>
            </div>
            <div className="setting-item">
              <span>Auto Save</span>
              <span className="badge">{project.settings.autoSave ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="resources-section">
        <div className="resources-header">
          <h2>Resources</h2>
          <button 
            className="upload-btn"
            onClick={() => setShowUploadForm(!showUploadForm)}
          >
            Upload Resource
          </button>
        </div>

        {showUploadForm && (
          <form className="upload-form" onSubmit={handleUploadResource}>
            <input
              type="text"
              placeholder="Resource Title"
              value={uploadData.title}
              onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
              required
            />
            <select
              value={uploadData.type}
              onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
            >
              <option value="document">Document</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
              <option value="data">Data</option>
            </select>
            <input
              type="number"
              placeholder="File Size (KB)"
              value={uploadData.size}
              onChange={(e) => setUploadData({...uploadData, size: parseInt(e.target.value)})}
              required
            />
            <button type="submit">Upload</button>
          </form>
        )}

        <div className="resources-list">
          {resources.length > 0 ? (
            resources.map(resource => (
              <div key={resource._id} className="resource-item">
                <div className="resource-info">
                  <h4>{resource.title}</h4>
                  <span className="type-badge">{resource.type}</span>
                  <p className="size">{(resource.size / 1024).toFixed(2)} MB</p>
                </div>
                <div className="resource-meta">
                  <span className="date">{new Date(resource.createdAt).toLocaleDateString()}</span>
                  <span className="version">v{resource.versions?.length || 1}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="empty">No resources yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
