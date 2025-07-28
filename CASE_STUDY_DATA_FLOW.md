# Case Study Data Flow

## Overview
This document explains how case study submissions are collected, stored, and managed in the RAI Values application.

## Data Collection Flow

### 1. Frontend Collection (CaseStudyChat.jsx)
The conversation data is collected through a step-by-step chat interface:

```javascript
// Data structure collected:
const caseStudyData = {
  title: "AI-Powered Content Generation",
  category: "Media",
  description: "AI system for content creation...",
  challenges: "Bias, privacy concerns...",
  principles: ["User Autonomy", "Transparency"],
  outcomes: "Improved productivity, lessons learned..."
}
```

### 2. Data Storage Locations

#### A. Browser Console (Development)
- All submissions are logged to the browser console
- Access via: `F12 → Console` in your browser
- Look for: `"Case Study Data:"` or `"Submission successful:"`

#### B. Local Storage (Fallback)
- Data is stored in browser's localStorage as backup
- Key: `'caseStudySubmissions'`
- Access via: `F12 → Application → Local Storage → http://localhost:5173`
- Or use the "View Submissions" button in the chat interface

#### C. Backend API (Production)
- Data is sent to `/api/case-studies` endpoint
- Stored in JSON file: `data/case-studies.json`
- Includes metadata like timestamps and status

## How to Access the Data

### 1. During Development (Console)
```javascript
// In browser console, you can access:
console.log('Current case study data:', caseStudyData);
console.log('All submissions:', JSON.parse(localStorage.getItem('caseStudySubmissions')));
```

### 2. Local Storage Access
```javascript
// Get all submissions
const submissions = JSON.parse(localStorage.getItem('caseStudySubmissions') || '[]');
console.log('Stored submissions:', submissions);

// Get latest submission
const latest = submissions[submissions.length - 1];
console.log('Latest submission:', latest);
```

### 3. Backend API (if running)
```bash
# Start the backend server
cd rai-values-react
npm install
node backend-example.js

# API endpoints available:
GET    http://localhost:3001/api/case-studies     # Get all submissions
POST   http://localhost:3001/api/case-studies     # Submit new case study
PUT    http://localhost:3001/api/case-studies/:id # Update submission
DELETE http://localhost:3001/api/case-studies/:id # Delete submission
```

### 4. Direct File Access
If using the backend, data is stored in:
```
rai-values-react/data/case-studies.json
```

## Data Structure

### Submission Object
```json
{
  "id": "1703123456789",
  "title": "AI-Powered Content Generation",
  "category": "Media",
  "description": "AI system for content creation...",
  "challenges": "Bias, privacy concerns...",
  "principles": ["User Autonomy", "Transparency"],
  "outcomes": "Improved productivity, lessons learned...",
  "submittedAt": "2023-12-21T10:30:45.123Z",
  "status": "pending",
  "reviewed": false
}
```

### Message History
```json
{
  "type": "user|bot",
  "text": "Message content",
  "timestamp": "2023-12-21T10:30:45.123Z"
}
```

## Development Workflow

### 1. Test the Chat Interface
1. Go to Case Studies section
2. Click "Contribute a Case Study"
3. Complete the conversation
4. Check browser console for data

### 2. View Collected Data
1. Use "View Submissions" button in chat header
2. Check browser console for detailed output
3. Access localStorage directly via DevTools

### 3. Set Up Backend (Optional)
```bash
# Install backend dependencies
npm install express cors

# Start backend server
node backend-example.js

# Update frontend API URL if needed
# In CaseStudyChat.jsx, change fetch URL to: http://localhost:3001/api/case-studies
```

## Production Considerations

### 1. Database Integration
Replace file storage with:
- PostgreSQL
- MongoDB
- Firebase
- Supabase

### 2. Authentication
Add user authentication to:
- Track who submitted each case study
- Allow users to edit their submissions
- Implement admin review system

### 3. Data Validation
Enhance validation for:
- Content moderation
- Required field validation
- Data sanitization

### 4. Admin Interface
Create admin panel for:
- Reviewing submissions
- Approving/rejecting case studies
- Managing published content

## Troubleshooting

### Data Not Appearing
1. Check browser console for errors
2. Verify localStorage is enabled
3. Check network tab for API errors

### Backend Connection Issues
1. Ensure backend server is running
2. Check CORS settings
3. Verify API endpoint URLs

### Missing Data
1. Check if conversation completed fully
2. Verify all required fields were answered
3. Look for validation errors in console 