# Job Portal (MERN Stack)

A full-stack recruitment platform where **students** search and apply for jobs and **recruiters** register companies, post jobs and review applicants. Uses cookie-based JWT authentication with server-side role-based access control.

## Live Demo

| Service | URL |
| --- | --- |
| Frontend (Vercel) | https://job-portal-lovat-tau.vercel.app |
| Backend API (Render) | https://qr-code-h49v.onrender.com |
| Health check | https://qr-code-h49v.onrender.com/health |

> The backend is on Render's free tier, so the first request after inactivity can take 30-60 seconds.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Security](#security)
- [Troubleshooting](#troubleshooting)

## Features

| Role | Features |
| --- | --- |
| **Student** | Register and log in, search and filter jobs, view job details, apply once per job, track application status, manage profile (bio, skills, photo, resume) |
| **Recruiter** | Create and manage companies (with logo), post jobs with deadline, view applicants per job, accept or reject applications, view resumes |
| **Platform** | Password reset with emailed OTP, change password, file uploads (Cloudinary), rate limiting, input validation, responsive UI |

## Tech Stack

| Layer | Technologies |
| --- | --- |
| Frontend | React 19, Vite, React Router, Redux Toolkit, Redux Persist, Axios, Tailwind CSS 4, shadcn/ui |
| Backend | Node.js, Express 5, Mongoose, JWT, bcryptjs, Multer, Nodemailer, Helmet, express-rate-limit |
| Database | MongoDB Atlas |
| Services | Cloudinary (uploads), Gmail SMTP (OTP emails) |
| Hosting | Vercel (frontend), Render (backend) |

## Project Structure

```
Job-Portal/
├── Backend/
│   ├── app.js              # Express app: middleware, CORS, routes, error handling
│   ├── index.js            # Server entry: env check, DB connect, start
│   ├── controllers/        # Request handlers (user, company, job, application)
│   ├── middlewares/        # Auth, role check, validation, uploads, rate limits, errors
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API route definitions
│   └── utils/              # DB, env, cookies, Cloudinary, email, validators
└── Frontend/
    ├── public/
    └── src/
        ├── components/     # Pages, admin/, auth/, hooks/, shared/, ui/
        ├── redux/          # Store and slices
        ├── lib/            # cn() helper
        └── utils/          # API constants, job filters, axios setup
```

## Local Development

**Prerequisites:** Node.js 20+, a MongoDB database, a Cloudinary account, a Gmail App Password.

```bash
# 1. Clone
git clone <your-repo-url>
cd Job-Portal

# 2. Backend (create Backend/.env first, see below)
cd Backend
npm install
npm run dev          # http://localhost:8000

# 3. Frontend (new terminal, create Frontend/.env first)
cd Frontend
npm install
npm run dev          # http://localhost:5173
```

| Location | Command | Description |
| --- | --- | --- |
| Backend | `npm run dev` | Start with nodemon |
| Backend | `npm start` | Start for production |
| Frontend | `npm run dev` | Start Vite dev server |
| Frontend | `npm run build` | Production build in `dist/` |
| Frontend | `npm run lint` | Run ESLint |

## Environment Variables

**Backend (`Backend/.env`)**

| Variable | Example / Description |
| --- | --- |
| `NODE_ENV` | `development` or `production` |
| `PORT` | `8000` (Render sets this automatically) |
| `CLIENT_URL` | `http://localhost:5173` (allowed frontend origin, no trailing slash) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string |
| `CLOUD_NAME`, `API_KEY`, `API_SECRET` | Cloudinary credentials |
| `EMAIL_USER` | Gmail address that sends OTP emails |
| `EMAIL_APP_PASSWORD` | Gmail App Password (needs 2-step verification) |

**Frontend (`Frontend/.env`)**

| Variable | Example / Description |
| --- | --- |
| `VITE_API_URL` | `http://localhost:8000` (backend URL, no `/api/v1`, no trailing slash) |

> Never commit `.env` files.

## Deployment

Deploy the backend first, then the frontend.

**Backend on Render (Web Service)**

| Setting | Value |
| --- | --- |
| Root Directory | `Backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| `NODE_ENV` | `production` |
| `CLIENT_URL` | `https://job-portal-lovat-tau.vercel.app` |

Add the remaining backend variables, and allow Render's IPs in MongoDB Atlas (Network Access).

**Frontend on Vercel**

| Setting | Value |
| --- | --- |
| Root Directory | `Frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| `VITE_API_URL` | `https://qr-code-h49v.onrender.com` |

Add `Frontend/vercel.json` so page refreshes do not return 404:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

In production the auth cookie is `Secure; SameSite=None`, so both sites must use HTTPS and `CLIENT_URL` must exactly match the frontend URL.

## API Reference

Base URL: `https://qr-code-h49v.onrender.com/api/v1` (local: `http://localhost:8000/api/v1`). Auth uses an httpOnly cookie, so send requests with credentials.

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/health` (no `/api/v1` prefix) | Public | Server status |
| POST | `/user/register` | Public | Create account (`fullname`, `email`, `phoneNumber`, `password`, `role`, optional `profilePhoto`) |
| POST | `/user/login` | Public | Log in (`email`, `password`, `role`) |
| GET | `/user/logout` | Public | Clear auth cookie |
| POST | `/user/profile/update` | Logged in | Update profile, photo and resume |
| POST | `/user/forgot-password` | Public | Email a 6-digit OTP |
| POST | `/user/verify-otp` | Public | Verify OTP, returns `resetToken` |
| POST | `/user/reset-password` | Public | Set new password using `resetToken` |
| POST | `/user/change-password` | Logged in | Change password |
| POST | `/company/register` | Recruiter | Register a company (`companyName`) |
| GET | `/company/get` | Recruiter | List own companies |
| GET | `/company/get/:id` | Recruiter | Get one company |
| PUT | `/company/update/:id` | Recruiter | Update company details and logo |
| DELETE | `/company/delete/:id` | Recruiter | Delete company with its jobs and applications |
| GET | `/job/get?keywords=` | Public | List and search jobs |
| GET | `/job/get/:id` | Public | Get job details |
| POST | `/job/post` | Recruiter | Create job (`title`, `description`, `requirements`, `salary` in LPA, `location`, `jobType`, `experience`, `positions`, `companyId`, `applicationDeadline`) |
| GET | `/job/getadminjobs` | Recruiter | List own posted jobs |
| POST | `/application/apply/:id` | Student | Apply to a job |
| GET | `/application/get` | Student | List own applications |
| GET | `/application/check/:id` | Logged in | Check if already applied |
| GET | `/application/:id/applicants` | Recruiter | List applicants of own job |
| POST | `/application/status/:id/update` | Recruiter | Accept or reject (`status`: `accepted` / `rejected`) |

## Data Models

| Model | Key fields |
| --- | --- |
| **User** | `fullname`, `email` (unique), `phoneNumber`, `password` (hashed), `role`, `profile` (`bio`, `skills`, `resume`, `profilePicture`) |
| **Company** | `name`, `description`, `website`, `location`, `logo`, `userId` |
| **Job** | `title`, `description`, `requirements[]`, `salary` (LPA), `experience`, `location`, `jobType`, `positions`, `applicationDeadline`, `company`, `createdBy`, `applications[]` |
| **Application** | `job`, `applicant`, `status` (`pending` / `accepted` / `rejected`), unique on (`job`, `applicant`) |
| **PasswordReset** | `userId`, hashed OTP, expiry, attempts, hashed reset token |

## Security

| Area | Implementation |
| --- | --- |
| Authentication | bcrypt password hashing, JWT in httpOnly cookie |
| Authorization | Server-side role checks and ownership checks |
| Password reset | Hashed OTP and reset token, 10-minute expiry, 5 attempts, single use |
| Protection | Helmet, CORS allow-list, rate limiting, input validation, escaped search regex |
| Uploads | 5 MB limit, images (JPEG/PNG/WebP), resumes (PDF/DOC/DOCX) |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| 401 or logged out after login in production | Set `NODE_ENV=production` and make `CLIENT_URL` exactly match the Vercel URL |
| CORS error | Check `CLIENT_URL` on Render and redeploy |
| 404 on page refresh (Vercel) | Add `Frontend/vercel.json` as shown above |
| First request is slow | Render free tier is waking up, retry after a minute |
| Server exits with missing env variables | Set `MONGO_URI` and `JWT_SECRET` |
| MongoDB connection fails | Allow Render's IPs in Atlas Network Access |
| OTP email not sent | Use a Gmail App Password with 2-step verification enabled |
| Frontend calls `localhost` after deploy | Set `VITE_API_URL` in Vercel and redeploy |
