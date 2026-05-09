QUICK START GUIDE

Prerequisites:
- Node.js 14+ installed
- MongoDB installed locally or Atlas account
- npm or yarn package manager

Step 1: Backend Setup

1. Navigate to project root
2. Create .env file with:
   MONGODB_URI=mongodb://localhost:27017/saas-app
   JWT_SECRET=your_secret_key_2024
   PORT=5000
   NODE_ENV=development

3. Install dependencies:
   npm install

4. Start MongoDB (if local):
   mongod

5. Run backend:
   npm run dev

Backend runs on http://localhost:5000

Step 2: Frontend Setup

1. Navigate to client folder:
   cd client

2. Install dependencies:
   npm install

3. Start frontend:
   npm start

Frontend runs on http://localhost:3000
Browser will auto-open the application

Step 3: Test the Application

1. Register new account
2. Create a project
3. Upload resources
4. View analytics
5. Upgrade subscription

Default Subscription Tiers:

Free (default):
- 1 project
- 1 GB storage
- 1 team member

Pro ($29/month):
- 10 projects
- 50 GB storage
- 5 team members

Enterprise ($99/month):
- 100 projects
- 500 GB storage
- 50 team members

API Testing with curl:

Register:
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}'

Login:
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

Get Current User (replace TOKEN with actual token):
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"

Common Issues:

MongoDB Connection Error:
- Check MONGODB_URI in .env
- Ensure MongoDB is running
- Verify connection string format

Port Already in Use:
- Backend: Kill process on 5000 or change PORT in .env
- Frontend: Kill process on 3000 or use different port

CORS Errors:
- Ensure backend runs on 5000
- Ensure frontend runs on 3000
- Check both are running simultaneously

Token Expired:
- Clear localStorage
- Login again
- Token expires in 30 days

File Structure Overview:

saas-project/
├── server.js (main backend entry)
├── package.json (backend dependencies)
├── .env.example (environment template)
├── README.md (project documentation)
├── PROJECT_DOCUMENTATION.md (technical guide)
├── models/ (database schemas)
├── routes/ (API endpoints)
├── middleware/ (auth and RBAC)
└── client/
    ├── package.json (frontend dependencies)
    ├── public/
    │   └── index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── pages/ (components)
        ├── components/ (reusable)
        └── styles/ (CSS files)

Production Deployment:

Backend:
1. Build: npm install --production
2. Set NODE_ENV=production
3. Use PM2: pm2 start server.js
4. Use reverse proxy (Nginx)
5. Enable HTTPS/SSL

Frontend:
1. Build: npm run build
2. Deploy dist/ folder to CDN
3. Configure API endpoint
4. Enable gzip compression

Database:
1. Use MongoDB Atlas
2. Configure IP whitelist
3. Enable authentication
4. Daily backups
5. Monitor performance

Next Steps:

1. Review README.md for detailed documentation
2. Check PROJECT_DOCUMENTATION.md for architecture
3. Explore API endpoints
4. Customize subscription tiers
5. Add email notifications
6. Implement file storage (S3)
7. Set up monitoring and logging
