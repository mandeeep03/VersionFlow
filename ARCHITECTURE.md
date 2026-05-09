SYSTEM ARCHITECTURE OVERVIEW

1. CLIENT LAYER (React)
   ├── Authentication Pages
   │   └── Login/Register with JWT token management
   ├── Dashboard
   │   ├── User statistics
   │   ├── Recent projects
   │   └── Subscription tier display
   ├── Project Management
   │   ├── Create/Edit projects
   │   ├── Project listing with search
   │   └── Tag-based filtering
   ├── Project Detail
   │   ├── Resource management
   │   ├── Collaborator management
   │   ├── Version history
   │   └── Project settings
   ├── Analytics
   │   ├── User insights (30 days)
   │   ├── Event breakdown
   │   └── Project-specific analytics
   └── Subscription
       ├── Tier comparison
       ├── Feature display
       └── Upgrade functionality

2. NETWORK LAYER
   ├── CORS enabled for localhost:3000
   ├── Rate limiting (100 requests/15 min)
   ├── Compression middleware
   ├── Security headers (Helmet)
   └── Error handling middleware

3. API GATEWAY (Express Routes)
   ├── /api/auth - Authentication
   ├── /api/projects - Project management
   ├── /api/resources - Resource handling
   └── /api/analytics - Analytics data

4. MIDDLEWARE LAYER
   ├── Authentication (JWT verification)
   ├── Authorization (RBAC checks)
   ├── Validation (input checking)
   └── Logging (error tracking)

5. BUSINESS LOGIC
   ├── User Service
   │   ├── Register/Login
   │   ├── Password hashing
   │   └── Tier management
   ├── Project Service
   │   ├── CRUD operations
   │   ├── Collaborator management
   │   └── Access control
   ├── Resource Service
   │   ├── Storage quota calculation
   │   ├── Version management
   │   └── Access control
   └── Analytics Service
       ├── Event tracking
       ├── Aggregation
       └── Reporting

6. DATA ACCESS LAYER (MongoDB Models)
   ├── User Model
   │   └── Schema validation and hashing
   ├── Project Model
   │   └── Indexes for optimization
   ├── Resource Model
   │   └── Versioning support
   └── Analytics Model
       └── Time-series indexes

7. PERSISTENCE LAYER
   └── MongoDB
       ├── User collection
       ├── Project collection
       ├── Resource collection
       └── Analytics collection

DATA FLOW EXAMPLES

User Registration Flow:
User Input → React Form → POST /api/auth/register → 
Hash Password → Save User → Generate JWT → 
Return Token & User → Store in localStorage → 
Update UI State

Project Creation Flow:
User Click → Project Form → POST /api/projects → 
Verify Auth → Check Project Limit → 
Create Document → Return Project → 
Update Local State → List in Dashboard

Resource Upload Flow:
File Selection → File Input Form → POST /api/resources/:projectId/upload →
Verify Auth & RBAC → Calculate Storage Usage →
Check Against Limit → Save Resource with v1 →
Update UI with Success/Error → Show Storage Status

Analytics Query Flow:
User Views Analytics → GET /api/analytics/user-insights →
Verify Auth → Aggregate Events (30 days) →
Group by Event Type → Calculate Averages →
Count Projects & Resources → Return Insights →
Display Charts & Stats in UI

SECURITY FLOW

Authentication:
User Password → bcrypt.hash(10 rounds) → Stored Hashed →
User Login → bcrypt.compare → JWT Generation →
Sign with JWT_SECRET → Token to Client →
Client stores in localStorage → Include in Headers

Authorization:
Each Request → Extract Token from Header →
Verify JWT Signature → Decode userId →
Check Token Expiry → Extract userId → 
Pass to Next Middleware → RBAC checks role →
Verify user in project collaborators →
Allow/Deny based on role

STORAGE QUOTA SYSTEM

Tier Limits:
- Free: 1 GB (1,000,000 bytes)
- Pro: 50 GB (50,000,000 bytes)
- Enterprise: 500 GB (500,000,000 bytes)

Quota Check Process:
1. User initiates upload
2. Query: sum(size) WHERE projectId = X
3. Retrieve: user.features.storageLimit
4. Calculate: usedSpace + newFileSize
5. Compare: (usedSpace + newFileSize) <= limit
6. Result: Allow or Reject with feedback

VERSIONING SYSTEM

Automatic Versioning:
- Initial upload → version 1
- Update resource → new version object added
- versionNumber incremented
- timestamp recorded
- changeLog optional
- All versions stored in resource document
- No separate version collection needed

Version Tracking:
Resource.versions = [
  { versionNumber: 1, timestamp: 2024-05-06, changeLog: 'Initial' },
  { versionNumber: 2, timestamp: 2024-05-07, changeLog: 'Updated content' },
  { versionNumber: 3, timestamp: 2024-05-08, changeLog: 'Fixed typos' }
]

ROLE-BASED ACCESS CONTROL

Project Collaboration:
- Owner: Full control, admin role
- Admin: Can invite, manage, delete (assigned)
- Editor: Can upload, create versions (assigned)
- Viewer: Read-only access (assigned)

Access Checks:
GET /projects/:id → Check if owner OR in collaborators
PUT /projects/:id → Check if admin role
DELETE resource → Check if admin or editor
Upload → Check if not viewer

INDEXING STRATEGY

User Collection:
- { email: 1 }: Fast login lookups
- { createdAt: 1 }: User growth tracking

Project Collection:
- { ownerId: 1, createdAt: -1 }: User project list
- { tags: 1 }: Tag filtering

Resource Collection:
- { projectId: 1, createdAt: -1 }: Project resources
- { ownerId: 1 }: User resource searches

Analytics Collection:
- { userId: 1, timestamp: -1 }: User analytics
- { projectId: 1, timestamp: -1 }: Project analytics

AGGREGATION PIPELINE EXAMPLES

Event Breakdown (30 days):
db.analytics.aggregate([
  { $match: { userId: ObjectId, timestamp: { $gte: 30DaysAgo } } },
  { $group: { _id: '$eventType', count: { $sum: 1 }, avg: { $avg: '$metadata.duration' } } },
  { $sort: { count: -1 } }
])

Daily Activity:
db.analytics.aggregate([
  { $match: { projectId: ObjectId } },
  { $group: { 
    _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
    count: { $sum: 1 },
    collaborators: { $addToSet: '$userId' }
  }},
  { $sort: { _id: -1 } },
  { $limit: 30 }
])

DEPLOYMENT TOPOLOGY

Development:
Frontend (React) :3000 → CORS → Backend (Express) :5000 → MongoDB Local

Production:
CDN / Static Host (Frontend Build) → API Gateway (Backend Load Balanced) → 
MongoDB Replication Set (Primary + 2 Secondaries) with Backup

Docker Containerization:
Frontend Container :3000 → Backend Container :5000 → 
MongoDB Container :27017 (or Atlas)

MONITORING POINTS

Frontend:
- Page load time
- API response time
- Error tracking
- User session duration
- Feature usage

Backend:
- API endpoint response times
- Database query performance
- Error rates
- Authentication failures
- Rate limit hits

Database:
- Query execution time
- Index usage
- Connection pool status
- Storage growth
- Replication lag

SCALING STRATEGY

Vertical Scaling:
1. Increase server RAM and CPU
2. Optimize database indexes
3. Add caching layer
4. Compress responses

Horizontal Scaling:
1. Multiple API instances behind load balancer
2. MongoDB replication set
3. Separate read replicas
4. Session store (Redis)

Caching:
1. Client-side: localStorage for tokens
2. Server-side: Redis for sessions
3. CDN: Static assets
4. Query cache: Frequently accessed data

FUTURE SCALING

When traffic exceeds current capacity:

Microservices:
- Auth service
- Project service
- Resource service
- Analytics service
- Notification service

Message Queue:
- RabbitMQ for async operations
- Event-driven architecture
- Decoupled services

Search Layer:
- Elasticsearch for full-text search
- Fast resource searching

File Storage:
- S3 or Cloud Storage for large files
- CDN for delivery
- Streaming uploads

Real-time Updates:
- WebSocket servers
- Socket.io for live collaboration
- Real-time notifications
