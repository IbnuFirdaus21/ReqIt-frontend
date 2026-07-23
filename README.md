# Frontend - MBG Web Application

This React frontend powers the student-facing experience for the Program Makan Bergizi Gratis (MBG) web app. It provides the public pages, authentication flow, menu interaction, and the admin dashboard used to manage requests, ratings, feedback, and allergy insights.

## What this frontend includes

- Landing page and main user interface for MBG information
- Login, registration, and admin login pages
- Protected admin route for dashboard access
- Menu-related interactions that call the backend API
- Allergy summary and feedback visualization support
- Chatbot integration UI for student questions

## Main technology stack

- React 19
- React Router DOM
- Recharts for charts and summaries
- React Markdown for text rendering
- Axios and fetch-based API helpers
- Firebase hosting configuration

## Project structure

- src/App.js: route configuration for the app
- src/pages/: page components such as Home, Login, Register, Login_admin, and Admin
- src/components/auth/ProtectedRoute.jsx: route protection for admin access
- src/services/api.js: centralized API calls to the backend
- src/constants/index.js: API base URL configuration
- public/: static assets and HTML entry point

## Prerequisites

- Node.js 18 or newer
- npm
- A running backend server on port 8800

## Setup

1. Change into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create an environment file if needed:
   ```bash
   echo REACT_APP_API_URL=http://localhost:8800 > .env
   ```
4. Start the development server:
   ```bash
   npm start
   ```

The application should open at http://localhost:3000.

## Available scripts

- npm start: runs the development server
- npm test: runs the test suite
- npm run build: creates a production build
- npm run eject: exposes the underlying build configuration (not usually needed)

## Notes

- The frontend expects the backend API to be available at the URL defined in REACT_APP_API_URL.
- If you deploy the app, update the API base URL accordingly.
- Firebase deployment configuration is already included in firebase.json.
