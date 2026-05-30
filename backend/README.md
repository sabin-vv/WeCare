# WeCare Backend

Backend API server for **WeCare**, a healthcare management and remote patient monitoring platform that connects doctors, caregivers, and patients through appointment management, medication adherence tracking, vital monitoring, and long-term care coordination.

Built with **Express.js**, **TypeScript**, **MongoDB**, and a modular dependency injection architecture.

---

## Overview

WeCare enables healthcare professionals to manage patient care beyond consultations by providing tools for:

- Appointment scheduling and management
- Prescription management
- Automated medication scheduling
- Caregiver-assisted medication administration
- Vital sign monitoring
- Symptom tracking
- Clinical status management
- Wallet and subscription management
- Secure file uploads and storage

The platform is designed around real-world healthcare workflows where doctors define treatment plans and caregivers assist patients with daily monitoring and medication adherence.

---

## Features

### Authentication & Authorization

- JWT-based authentication
- Access and refresh tokens
- Role-based access control
- Secure route protection

### Doctor Management

- Doctor profile management
- Availability and slot management
- Appointment handling
- Prescription creation
- Patient monitoring workflows

### Patient Management

- Patient profiles
- Clinical status tracking
- Risk level management
- Medical history access

### Appointment System

- Slot-based booking
- Appointment cancellation and rescheduling
- Consultation workflow
- Wallet refund handling

### Prescription & Medication Management

- Doctor-created prescriptions
- Automated medication schedule generation
- Medication adherence tracking
- Caregiver medication logging

### Vital Monitoring

- Vital recording during consultations
- Doctor-created vital monitoring plans
- Auto-generated monitoring schedules
- Home-care monitoring workflow

Supported vitals:

- Blood Pressure
- Blood Sugar
- SPO₂
- Heart Rate

### Symptom Tracking

- Patient symptom logging
- Symptom history management
- Doctor review support

### Payments & Subscription

- Razorpay integration
- Wallet management
- Subscription plans

### File Management

- AWS S3 integration
- Presigned URL uploads
- Secure document storage

---

## Core Healthcare Workflows

### Prescription Workflow

Doctor creates Prescription

↓

System generates Medication Schedules

↓

Caregiver administers Medication

↓

Medication Logs are recorded

---

### Vital Monitoring Workflow

Doctor creates Vital Plan

↓

System generates Vital Schedules

↓

Caregiver records Vital Readings

↓

Doctor reviews patient progress

---

### Clinical Status Workflow

Supported statuses:

- Active
- Hospitalized
- Recovered
- Deceased

Clinical status changes influence:

- Monitoring plans
- Vital schedules
- Medication schedules
- Caregiver workflows

---

## Tech Stack

### Runtime

- Node.js
- TypeScript

### Framework

- Express 5

### Database

- MongoDB
- Mongoose ODM

### Cache

- Redis
- ioredis

### Authentication

- JWT
- Refresh Tokens

### Payments

- Razorpay

### File Storage

- AWS S3

### Email

- Nodemailer

### Validation

- Zod

### Dependency Injection

- tsyringe
- reflect-metadata

### Logging

- Pino

### Background Jobs

- node-cron

---

## Prerequisites

- Node.js >= 18
- MongoDB
- Redis
- AWS S3 Bucket
- Razorpay Account

---

## Installation

```bash
git clone <repository-url>
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/weCare

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Start the development server:

```bash
npm run dev
```

Server will run at:

```txt
http://localhost:5000
```

---

## Scripts

| Script       | Description              |
| ------------ | ------------------------ |
| npm run dev  | Start development server |
| npm run lint | Run ESLint               |
| npm test     | Run tests                |

---

## Project Structure

```text
src/
├── app.ts
├── server.ts
├── container/
├── core/
└── modules/
    ├── auth/
    ├── admin/
    ├── doctor/
    ├── caregiver/
    ├── patient/
    ├── appointment/
    ├── prescription/
    ├── medication/
    ├── vital/
    ├── symptom/
    ├── payment/
    ├── subscription/
    ├── wallet/
    └── uploads/
```

---

## API Modules

| Route Prefix         | Description                    |
| -------------------- | ------------------------------ |
| /api/auth            | Authentication                 |
| /api/doctors         | Doctor management              |
| /api/caregivers      | Caregiver management           |
| /api/patients        | Patient management             |
| /api/appointments    | Appointment management         |
| /api/prescriptions   | Prescription management        |
| /api/medications     | Medication schedules           |
| /api/medication-logs | Medication administration logs |
| /api/vitals          | Vital monitoring               |
| /api/symptom-logs    | Symptom tracking               |
| /api/payments        | Payment processing             |
| /api/subscriptions   | Subscription management        |
| /api/wallet          | Wallet operations              |
| /api/uploads         | File uploads                   |
| /api/admin           | Administrative operations      |

---

## Architecture Highlights

- Modular feature-based architecture
- Repository Pattern
- Dependency Injection
- Type-safe TypeScript implementation
- Centralized error handling
- Request validation with Zod
- JWT authentication and authorization
- Redis caching support
- AWS S3 file management
- Background job scheduling

---

## Future Enhancements

- Real-time notifications
- Video consultations
- Mobile application
- Advanced healthcare analytics
- AI-assisted patient insights
- Hospital workflow integration

---

## License

ISC
