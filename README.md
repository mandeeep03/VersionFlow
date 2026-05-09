SAAS PROJECT MANAGEMENT PLATFORM

Project Overview

This is a full-stack MERN (MongoDB, Express, React, Node.js) SaaS application designed for collaborative project and resource management. The platform solves the unique problem of intelligent resource allocation with smart versioning and tier-based feature access control.

Unique Problem Solving Approach

The platform addresses three core problems:

1. Storage Quota Management - Instead of simple storage limits, the system calculates real-time storage usage per project and prevents uploads when limits are exceeded. Users get immediate feedback on usage and can delete resources to free space.

2. Smart Versioning System - Every resource automatically maintains version history with timestamps and change logs. Users can track what changed and when without manual intervention.

3. Role-Based Collaboration - Project-level access control with admin, editor, and viewer roles ensures data security while enabling seamless team collaboration.

Technology Stack

Backend:
- Node.js with Express framework
- MongoDB for data persistence
- JWT for stateless authentication
- Rate limiting for API protection
- Helmet for security headers
- Compression for response optimization

Frontend:
- React with functional components and hooks
- React Router for navigation
- CSS-in-JS with CSS modules
- RESTful API integration

System Architecture

Backend Structure:
- server.js: Main entry point with middleware setup
- models/: MongoDB schemas (User, Project, Resource, Analytics)
- routes/: API endpoints organized by domain
- middleware/: Authentication and role-based access control

Frontend Structure:
- pages/: Main page components (Dashboard, Projects, Auth, Analytics, Subscription)
- components/: Reusable components (Navbar)
- styles/: Component-specific CSS

API Endpoints

Authentication:
POST /api/auth/register - Create new account
POST /api/auth/login - User login
GET /api/auth/me - Get current user
POST /api/auth/upgrade - Change subscription tier

Projects:
POST /api/projects - Create project
GET /api/projects - List user projects
GET /api/projects/:projectId - Get project details
PUT /api/projects/:projectId - Update project
POST /api/projects/:projectId/collaborators - Add collaborator
DELETE /api/projects/:projectId - Delete project

Resources:
POST /api/resources/:projectId/upload - Upload resource
GET /api/resources/:projectId/resources - List resources
POST /api/resources/:projectId/resources/:resourceId/version - Create version
DELETE /api/resources/:projectId/resources/:resourceId - Delete resource

Analytics:
GET /api/analytics/user-insights - Get user analytics
GET /api/analytics/project-analytics/:projectId - Get project analytics
POST /api/analytics/log-event - Log custom event

Data Models

User Model:
- name, email, password
- subscriptionTier (free, pro, enterprise)
- features object with projectLimit, storageLimit, teamMembers
- isActive status

Project Model:
- name, description, ownerId
- collaborators array with role assignments
- resources array references
- tags for organization
- settings for collaboration features

Resource Model:
- title, type (document/image/video/data)
- projectId, ownerId references
- size for storage tracking
- versions array with automatic versioning
- accessControl levels
- metadata for media files

Analytics Model:
- userId, projectId references
- eventType categorization
- metadata with contextual information
- timestamp for time-series analysis

Key Features Implemented

1. Subscription Tiers
Free: 1 project, 1GB storage, 1 team member
Pro: 10 projects, 50GB storage, 5 team members
Enterprise: 100 projects, 500GB storage, 50 team members

2. Project Management
- Create and organize projects with tags
- Add collaborators with different roles
- Enable/disable features per project
- Project-level access control

3. Resource Management
- Upload multiple file types
- Real-time storage quota validation
- Automatic version control
- Role-based access to resources

4. Analytics Dashboard
- User activity insights over 30 days
- Per-project analytics and daily activity
- Event tracking and categorization
- Storage and collaboration metrics

5. Security
- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting on API endpoints
- CORS configuration
- Security headers with Helmet

Setup Instructions

Prerequisites:
- Node.js 14.0 or higher
- MongoDB local instance or Atlas connection
- npm or yarn package manager

Installation:

1. Clone repository and navigate to root

2. Backend setup:
   npm install
   Create .env file with MONGODB_URI, JWT_SECRET, PORT
   npm run dev (starts on port 5000)

3. Frontend setup:
   cd client
   npm install
   npm start (starts on port 3000)

4. MongoDB setup:
   Local: ensure MongoDB service is running
   Atlas: add connection string to .env

Development Workflow

1. Backend development runs on http://localhost:5000
2. Frontend development runs on http://localhost:3000
3. API requests use CORS-enabled endpoints
4. React hot reload enabled during development

Authentication Flow

1. User registers with email and password
2. Password hashed and stored in MongoDB
3. JWT token generated and returned
4. Token stored in localStorage on client
5. Subsequent requests include token in Authorization header
6. Backend validates token before processing requests

API Request Pattern

Each protected endpoint requires:
- Authorization header with Bearer token
- JSON content type for POST/PUT requests
- userId extracted from decoded JWT

Example:
fetch('http://localhost:5000/api/projects', {
  headers: { Authorization: 'Bearer ' + token }
})

Role-Based Access Control

Admin: Can modify project, add collaborators, update settings, delete resources
Editor: Can upload resources, create versions, modify own content
Viewer: Can read project and resources, cannot make changes

Storage Quota Implementation

When uploading:
1. Calculate total size of all project resources
2. Check if upload size + current total exceeds limit
3. Return 403 if limit exceeded with usage details
4. Allow upload if within limit
5. Updating user UI with real-time storage status

Event Tracking

System logs events for:
- Login: Track user sessions
- Project creation: Monitor project growth
- Resource upload: Track content creation
- Collaboration: Monitor team activity
- Export: Track data extraction

Aggregation Pipeline Usage

Analytics uses MongoDB aggregation for:
- Grouping events by type
- Calculating average metrics
- Time-series data organization
- Date-based filtering
- Sorting and limiting results

Deployment Considerations

Backend:
- Use environment variables for sensitive data
- Enable HTTPS in production
- Configure proper CORS origins
- Set NODE_ENV=production
- Use process manager (PM2)

Frontend:
- Build optimized production bundle
- Deploy to CDN or static hosting
- Configure API endpoint for production
- Enable caching headers
- Minify assets

Database:
- Use MongoDB Atlas for production
- Enable authentication
- Configure IP whitelist
- Regular backups
- Monitor performance

Future Enhancements

- Real-time collaboration with WebSockets
- File upload to S3 or cloud storage
- Email notifications
- Advanced search and filters
- Audit logging
- API usage quotas
- Custom branding for enterprise

Troubleshooting

MongoDB connection fails:
- Check MONGODB_URI in .env
- Ensure MongoDB service is running
- Verify IP whitelist if using Atlas

CORS errors:
- Backend must run on 5000
- Frontend must run on 3000
- Check CORS_ORIGIN in .env

Authentication fails:
- Clear localStorage
- Verify JWT_SECRET matches
- Check token expiration (30 days)

Installation Issues:
- Clear node_modules and reinstall
- Check Node.js version (14+)
- Use npm ci instead of npm install for exact versions
