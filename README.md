# STI College Dasmarinas Guidance Office Record Management System

A web-based record management system for the Guidance and Counselling Center of STI College Dasmarinas, Cavite. The system centralizes student records and guidance workflows for guidance personnel, teachers, and students while providing role-based access to sensitive information.

## Technology Stack

### Frontend

- React 19 with Vite
- React Router for client-side navigation
- Firebase Web SDK for Authentication and Firestore real-time listeners
- Axios for API communication
- Tailwind CSS, CSS Modules, and custom CSS for styling
- Chart.js and `react-chartjs-2` for dashboard visualizations
- Framer Motion for interface animation
- Vitest and Testing Library for tests

### Backend

- Node.js and Express 5
- Firebase Admin SDK and Cloud Firestore
- Firebase Authentication with bearer-token and session-cookie verification
- Joi for request validation
- Multer, Cloudinary, and file upload utilities for document and image handling
- Nodemailer for email notifications
- Google APIs for Drive backup and restore
- AWS Textract integration for photo-to-text processing
- Gemini API and OpenRouter for assisted wellness interpretation and summaries
- Helmet, CORS, rate limiting, request sanitization, and security headers
- MVC-style separation of routes, controllers, and models

### Infrastructure and tooling

- Firebase for authentication and database services
- Vercel for the frontend deployment configuration
- Render-compatible Node.js server configuration
- Git and Visual Studio Code

## How the Application Works

The project uses a hybrid client-server architecture:

1. The React client loads the API URL from `VITE_API_URL` and requests the Firebase web configuration from the backend.
2. Firebase Authentication handles sign-in with the user's school account. The client refreshes the Firebase ID token and sends it as a bearer token with API requests.
3. The Express server verifies the token, resolves the user's role, applies route-level authorization, validates requests, and performs protected operations.
4. Server controllers read and write records in Cloud Firestore. Models isolate collection access, while routes define the API surface.
5. The client uses Firestore `onSnapshot` listeners for selected real-time notifications and uses Axios for server-side reads and writes.
6. Background jobs run on the server for scheduled backups and cleanup of stale pending requests.

## Main User Workflow

### 1. Sign in

Users sign in from the login page with their school email and password. After authentication, the application retrieves the user's role and redirects them to the appropriate workspace. Inactivity timeout, token refresh, logout, rate limiting, and protected routes help control access.

### 2. Guidance personnel workflow

Users with the `Admin`, `Disciplinary`, or `Super Admin` roles can:

- View dashboard charts and operational summaries.
- Search, create, update, archive, restore, and bulk-upload student records.
- Manage student cases, violations, offenses, referrals, request slips, and counseling records.
- Review and respond to notifications in real time.
- Manage users, programs, strands, school periods, announcements, and other content.
- Create and release wellness surveys, review responses, and generate summaries.
- Upload supporting files and use photo-to-text processing where enabled.
- Export backups, schedule backups, and restore data through the backup tools.
- Review audit logs and record history.

### 3. Teacher workflow

Teachers can access the educator workspace to submit student referrals, review referral information, cancel or follow up on requests, and view the guidance content made available to them.

### 4. Student workflow

Students can access the pupil workspace to:

- Review and update permitted profile information.
- Submit request slips and track their status.
- Cancel or follow up on requests.
- Complete available wellness surveys.
- View relevant guidance information and notifications.

### 5. Record processing

Forms submitted by users are sent to protected Express endpoints. The server validates the payload, applies the user's permissions, writes the result to Firestore, and sends email or real-time notifications when applicable. Guidance personnel can then process, update, and audit the resulting records.

## Project Structure

```text
server/                  Express API, Firebase Admin, controllers, models, and routes
server/firestore/main/   Main Firestore features and MVC modules
server/firestore/backup/ Google Drive backup and restore features
server/modules/          Email, OCR, Gemini, and summary-generation integrations
sti-record-management/   React and Vite frontend
sti-record-management/src/pages/
						 Guidance, teacher, and student experiences
```

## Local Development

### Prerequisites

- Node.js 18 or later
- A Firebase project with Authentication and Firestore configured
- Credentials for any optional integrations that will be enabled

### Install dependencies

```bash
cd server
npm install

cd ../sti-record-management
npm install
```

### Configure environment variables

Create `server/.env` and add only the keys used by the backend. Create `sti-record-management/.env` for the frontend. The values below are placeholders and must be replaced locally or in the deployment platform. Never commit real credentials.

#### `server/.env`

```dotenv
NODE_ENV=development
PORT=5000
HOST=0.0.0.0
CLIENT_URL=http://localhost:5173

FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-admin-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nyour-private-key\\n-----END PRIVATE KEY-----\\n"
FIREBASE_DATABASE_URL=https://your-firebase-project.firebaseio.com
FIREBASE_API_KEY=your-firebase-web-api-key
FIREBASE_AUTH_DOMAIN=your-firebase-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id

CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

EMAIL_USER=your-email-address
EMAIL_PASS=your-email-app-password

GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/backup/oauth2callback
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

AWS_REGION=your-aws-region
GEMINI_API_KEY=your-gemini-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

#### `sti-record-management/.env`

```dotenv
VITE_API_URL=http://localhost:5000
```

The Firebase web configuration is returned by the server's `/firebase/config` endpoint. Do not add private Firebase Admin credentials or third-party secret keys to the frontend environment file.

### Run the applications

Start the API in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd sti-record-management
npm run dev
```

The Vite development server will print the local frontend URL. The backend defaults to `http://localhost:5000`.

### Test and build the frontend

```bash
cd sti-record-management
npm run lint
npm test
npm run build
```

## Security Notes

- Treat Firebase Admin credentials, private keys, OAuth secrets, API keys, email passwords, and Cloudinary secrets as confidential.
- Use deployment-platform environment variables for production values; do not commit `.env` files.
- Rotate any credential that has been exposed in source control, logs, screenshots, or backups.
- The `/firebase/config` endpoint is intended to return only Firebase web configuration. Firebase security rules and backend authorization must still be configured correctly.

## Collaborators

- De Pedro, Dionne Jeus D.
- Colinco, Jordan Vincent B.
- Lor, Rehneil B.
- Tugna, Sean John G.

## License

This project is distributed under the Apache License 2.0. See [LICENSE](LICENSE) for the complete license text.