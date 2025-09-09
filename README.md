CivicReport
Project Overview
CivicReport is a modern web platform that empowers citizens to report, verify, and track local civic issues in real-time. The system bridges the gap between communities and local authorities by providing a transparent, efficient, and community-driven way to resolve problems.
This project is designed with a focus on usability, engagement, and impact — helping residents improve their neighborhoods while enabling authorities to prioritize effectively.
Key Features
Real-Time Reporting
Submit reports instantly for issues like traffic problems, streetlight outages, road damage, public property issues, and environmental concerns.
Categorization ensures that authorities can quickly identify the type of issue and assign it to the right department.
Community Voting System
Upvoting: Users can support important reports by upvoting, increasing their visibility and urgency.
Downvoting: Users can flag irrelevant or duplicate issues, reducing noise in the system.
Helps authorities focus on verified, high-priority issues.
Transparency & Engagement
Reports are visible to all users, fostering accountability.
Community-driven prioritization ensures that critical problems are resolved first.
Future Features
Issue resolution tracking.
Notification system for updates on reported problems.
Integration with municipal dashboards for authorities.
Technologies Used
Frontend: React + TypeScript
Styling: Tailwind CSS, shadcn/ui
Build Tool: Vite
Database & Auth: Supabase
Getting Started
Prerequisites
Node.js (v18 or higher)
npm

# Vist Now ~ https://civicvoices.netlify.app
Installation & Setup
# Clone the repository
```
git clone https://github.com/haris-collab/haris-collab-civic_reporting_system
```

# Navigate to the project
```
cd CivicReport
```

# Install dependencies
```
npm install
```

# Create a .env file and add your Supabase credentials
```
VITE_SUPABASE_URL=YOUR_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

# Start the development server
```
npm run dev
```
The application will be available at: ```http://localhost:5173```
Deployment
This project can be deployed easily on platforms like Netlify, Vercel, or AWS Amplify.
Example: Deploying to Netlify
Push your code to GitHub.
Log in to Netlify and import your project from GitHub.
Set build command:
```
npm run build
```
Set publish directory:
```
dist
```
Add your environment variables (Supabase credentials) in Netlify’s dashboard under Settings → Environment Variables.

