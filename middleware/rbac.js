const Project = require('../models/Project');

const roleBasedAccess = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const isOwner = project.ownerId.toString() === userId;
    const collaborator = project.collaborators.find(c => c.userId.toString() === userId);

    if (!isOwner && !collaborator) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.userRole = isOwner ? 'admin' : collaborator.role;
    req.project = project;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = roleBasedAccess;
