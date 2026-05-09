# SAAS PROJECT MANAGEMENT PLATFORM - TECHNICAL DOCUMENTATION

## Executive Summary

This is a production-grade MERN stack SaaS application designed for collaborative project and resource management. The platform implements intelligent resource allocation, smart versioning, and tier-based access control.

## Problem Statement and Solution

### Problem 1: Uncontrolled Storage Consumption
**Challenge**: Traditional SaaS platforms use simple storage limits without real-time validation
**Solution**: Implemented dynamic storage quota calculation that validates every upload against current usage in real-time. The system prevents uploads exceeding limits and provides users with detailed usage breakdowns.

### Problem 2: Resource Version Management Complexity
**Challenge**: Manual version tracking leads to confusion about resource history and changes
**Solution**: Automatic versioning system where every resource maintains a versions array with timestamps and change logs. This eliminates manual documentation overhead.

### Problem 3: Insecure Team Collaboration
**Challenge**: Simple yes/no sharing without role-based control allows data breaches
**Solution**: Implemented RBAC (Role-Based Access Control) with three tiers per project: admin, editor, viewer. This provides granular control while maintaining collaboration efficiency.

## System Design

### Architecture Overview

```
Client Layer (React) 
    ↓
Network (CORS-enabled, Rate Limited)
    ↓
API Gateway (Express Router)
    ↓
Middleware (Auth, RBAC, Compression)
    ↓
Business Logic (Routes)
    ↓
Data Access (MongoDB Models)
    ↓
Persistence (MongoDB)
```

### Technology Choices and Rationale

**Express.js**:
- Minimal footprint with maximum flexibility
- Excellent middleware ecosystem
- Industry-standard for Node.js APIs
- Easy to scale horizontally

**MongoDB**:
- Flexible schema suits evolving requirements
- Built-in horizontal scaling
- JSON-native data format
- Excellent aggregation pipeline for analytics

**React**:
- Component-based architecture enables reusability
- Hooks pattern simplifies state management
- Large ecosystem of libraries
- Hot reload during development

**JWT Authentication**:
- Stateless, horizontally scalable
- No session storage required
- Works perfectly with microservices
- Client-side token management

## Database Schema Design

### User Collection
```
{
  _id: ObjectId,
  name: String,
  email: String (unique, indexed),
  password: String (hashed),
  subscriptionTier: String (enum: free, pro, enterprise),
  features: {
    projectLimit: Number,
    storageLimit: Number,
    teamMembers: Number
  },
  isActive: Boolean,
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes**:
- email: for login queries
- createdAt: for user growth analytics

### Project Collection
```
{
  _id: ObjectId,
  name: String,
  description: String,
  ownerId: ObjectId (ref: User),
  collaborators: [{
    userId: ObjectId (ref: User),
    role: String (enum: admin, editor, viewer)
  }],
  resources: [ObjectId] (ref: Resource),
  tags: [String],
  isPublic: Boolean,
  settings: {
    allowComments: Boolean,
    versionControl: Boolean,
    autoSave: Boolean
  },
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes**:
- (ownerId, createdAt): for user project listings
- tags: for tag-based filtering

**Rationale**: Storing collaborators array in project document allows fast access control checks without joins. Tags are indexed for efficient filtering.

### Resource Collection
```
{
  _id: ObjectId,
  title: String,
  type: String (enum: document, image, video, data),
  projectId: ObjectId (ref: Project, indexed),
  ownerId: ObjectId (ref: User),
  size: Number,
  url: String,
  metadata: {
    duration: Number,
    dimensions: { width, height },
    format: String
  },
  tags: [String],
  accessControl: String (enum: private, project, public),
  versions: [{
    versionNumber: Number,
    timestamp: Date,
    changeLog: String
  }],
  createdAt: Date (indexed),
  updatedAt: Date
}
```

**Indexes**:
- (projectId, createdAt): for resource listing
- ownerId: for user resource queries

**Design Decisions**:
- versions array embedded in document: avoids joins, keeps version history with resource
- size stored as number: enables sum aggregations for quota calculations
- metadata object: extensible for future file types

### Analytics Collection
```
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  projectId: ObjectId (ref: Project),
  eventType: String (enum: login, project_create, resource_upload, collaboration, export),
  metadata: {
    duration: Number,
    resourceCount: Number,
    storageUsed: Number,
    collaboratorCount: Number
  },
  timestamp: Date (indexed)
}
```

**Indexes**:
- (userId, timestamp): for user analytics queries
- (projectId, timestamp): for project analytics
- Both in descending order for time-series queries

**Why This Design**: Time-series data naturally benefits from timestamp indexing. Separate indexes for user and project analytics allow fast queries for either perspective.

## API Design and Endpoints

### RESTful Principles
- POST: Create resources
- GET: Retrieve resources
- PUT: Update entire resources
- DELETE: Remove resources

### Authentication Endpoint
```
POST /api/auth/register
Body: { name, email, password }
Response: { token, user }

POST /api/auth/login
Body: { email, password }
Response: { token, user }

GET /api/auth/me
Headers: { Authorization: Bearer <token> }
Response: { user }
```

### Project Endpoints
```
POST /api/projects
- Validates project count against user subscription tier
- Creates project with owner as admin

GET /api/projects
- Returns all projects where user is owner or collaborator
- Uses $or query for efficiency

GET /api/projects/:projectId
- Requires RBAC middleware
- Returns full project with populated collaborators

PUT /api/projects/:projectId
- Only admin can update
- Prevents unauthorized modifications

POST /api/projects/:projectId/collaborators
- Validates user exists
- Checks if adding collaborator exceeds team member limit
- Only admin can add
```

### Resource Endpoints
```
POST /api/resources/:projectId/upload
- Calculates total project storage before upload
- Prevents upload if exceeds user storage limit
- Initializes automatic version 1

GET /api/resources/:projectId/resources
- Returns resources with version count
- Limited to 100 for pagination

POST /api/resources/:projectId/resources/:resourceId/version
- Increments version number
- Records timestamp and change log
- Maintains version history

DELETE /api/resources/:projectId/resources/:resourceId
- Removes resource and frees storage
- Returns freed space to UI
```

### Analytics Endpoints
```
GET /api/analytics/user-insights
- Aggregates events from past 30 days
- Groups by event type
- Calculates event counts and averages
- Returns project and resource totals

GET /api/analytics/project-analytics/:projectId
- Date-based activity analysis
- Storage usage aggregation
- Collaborator tracking
- Limited to 30 days for performance

POST /api/analytics/log-event
- Records user interactions
- Allows custom metadata
- Enables feature usage tracking
```

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Backend hashes password with bcrypt (10 rounds)
3. Compares with stored hash
4. Generates JWT with userId payload
5. Client stores token in localStorage
6. Subsequent requests include token
7. Backend verifies signature and expiry

### Token Structure
```javascript
{
  userId: ObjectId,
  iat: timestamp,
  exp: timestamp (30 days from creation)
}
```

### Authorization Strategy
- Middleware `auth`: Validates JWT, extracts userId
- Middleware `rbac`: Checks user role in project
- Role enforcement at endpoint level

### Security Headers
Using Helmet.js:
- X-Frame-Options: Prevents clickjacking
- Content-Security-Policy: Prevents XSS
- X-XSS-Protection: Browser XSS filtering
- Strict-Transport-Security: Enforces HTTPS

### Rate Limiting
- 100 requests per 15 minutes per IP
- Applied to /api/* routes
- Returns 429 Too Many Requests

## Performance Optimizations

### Database Optimization
- Compound indexes on frequently queried field combinations
- Projections to return only needed fields
- Aggregation pipeline for complex queries

### API Optimization
- Compression middleware reduces response size
- Response limiting (100 projects, 100 resources)
- Efficient data selection with select()

### Caching Strategy
- JWT stored client-side (no database reads)
- Project list cached in React state
- Minimal re-renders with component optimization

### Query Optimization Examples
```javascript
// Bad: Returns entire documents
await Project.find({ ownerId: userId })

// Good: Selects needed fields
await Project.find({ ownerId: userId })
  .select('name description ownerId tags createdAt')
  .limit(50)
```

## Storage Quota Implementation Details

### Calculation Process
```
1. User initiates upload
2. Query: sum(size) from resources where projectId = X
3. Check: usedStorage + newSize <= user.features.storageLimit
4. If true: Allow upload, save resource, increment size
5. If false: Return 403 with usage details
6. Return: { currentUsage, limit, available }
```

### Subscription Tier Mapping
- Free: 1 GB = 1,000,000 bytes
- Pro: 50 GB = 50,000,000 bytes
- Enterprise: 500 GB = 500,000,000 bytes

### User Feedback
On upload failure, UI receives:
- Current usage percentage
- Remaining quota
- Suggestion to upgrade
- Option to delete resources

## Event Tracking System

### Event Types
- login: User authentication
- project_create: New project creation
- resource_upload: File upload
- collaboration: Team member addition
- export: Data export (future)

### Metadata Captured
- duration: How long activity took
- resourceCount: Number of resources in project
- storageUsed: Total storage used by project
- collaboratorCount: Team members active

### Analytics Queries
```javascript
// 30-day event breakdown
Analytics.aggregate([
  { $match: { userId: userId, timestamp: { $gte: 30DaysAgo } } },
  { $group: { _id: '$eventType', count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Daily project activity
Analytics.aggregate([
  { $match: { projectId: projectId } },
  { $group: { 
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
    count: { $sum: 1 }
  }},
  { $sort: { _id: -1 } }
])
```

## Frontend Architecture

### Component Hierarchy
```
App
├── Navbar (if authenticated)
└── Routes
    ├── Auth (login/register)
    ├── Dashboard (home page)
    ├── Projects (project list)
    ├── ProjectDetail (project view)
    ├── Analytics (insights)
    └── Subscription (pricing)
```

### State Management
- localStorage: authentication token
- Component state: form inputs, UI toggles
- React hooks: useState, useEffect
- No Redux (unnecessary for this scale)

### Data Fetching Pattern
```javascript
useEffect(() => {
  fetchData()
}, [token, userId])

const fetchData = async () => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const data = await response.json()
  if (data.success) setState(data.result)
}
```

### Component Features
- Dashboard: Displays user stats and recent projects
- Projects: Create projects, search, filter by tags
- ProjectDetail: Manage resources, add collaborators
- Analytics: User insights and project-level analytics
- Subscription: View plans, upgrade tier

## Scalability Considerations

### Horizontal Scaling
1. Database: MongoDB replication set with 3+ nodes
2. API: Multiple Express instances behind load balancer
3. Frontend: Static assets on CDN

### Vertical Scaling
1. Increase MongoDB server resources
2. Add Node.js worker threads
3. Increase file upload limits if needed

### Caching Layer
1. Redis for session tokens (if moving to session-based)
2. MongoDB query caching
3. CDN for static assets

### Database Sharding
If data exceeds 1TB:
- Shard on userId (horizontal partition)
- Shard on projectId for resource collections
- Maintain cross-shard transactions

## Monitoring and Observability

### Metrics to Track
- API response times per endpoint
- Error rates and status codes
- MongoDB query performance
- Active user count
- Storage utilization
- Failed authentication attempts

### Logging Strategy
- Log errors with full stack trace
- Log suspicious activities (failed auth)
- Log resource creation/deletion
- Structured logging with timestamps

### Health Checks
- Database connectivity
- API responsiveness
- Disk space
- Memory usage

## Deployment Architecture

### Development Environment
```
localhost:3000 (React dev server)
localhost:5000 (Express API)
localhost:27017 (MongoDB local)
```

### Production Environment
```
Frontend: Vercel / Netlify (CI/CD from Git)
Backend: AWS EC2 / Heroku (Docker container)
Database: MongoDB Atlas (managed service)
```

### Docker Setup
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Environment Variables
- MONGODB_URI: Atlas connection string
- JWT_SECRET: Cryptographic key for signing
- PORT: Express server port
- NODE_ENV: development or production
- CORS_ORIGIN: Frontend URL

## Testing Strategy

### Unit Tests
- User schema pre-save hooks
- Password comparison methods
- Utility functions

### Integration Tests
- API endpoints with various roles
- Storage quota validation
- Version creation logic

### E2E Tests
- User registration flow
- Project creation to resource upload
- Subscription upgrade

## Future Enhancements

### Real-Time Features
- WebSocket for live collaboration
- Instant notifications
- Live cursor position sharing

### Advanced Features
- Full-text search on resources
- Advanced permissions (read-only, no-delete)
- Audit trail for compliance
- Two-factor authentication

### Performance
- File uploads to S3/Cloud Storage
- CDN for resource delivery
- Batch operations API
- GraphQL alternative to REST

### Integrations
- Slack notifications
- Google Drive sync
- Zapier webhooks
- Payment processor (Stripe)

## Conclusion

This SaaS platform demonstrates production-grade architecture with proper separation of concerns, security implementations, and scalability patterns. The unique problem-solving approach to storage quotas, versioning, and collaboration addresses real pain points in team-based project management.
