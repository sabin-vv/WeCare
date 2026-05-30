# WeCare Frontend

Frontend application for **WeCare**, a healthcare management and remote patient monitoring platform that enables doctors, caregivers, patients, and administrators to collaborate in delivering continuous care.

Built with **React 19**, **TypeScript**, and **Vite**, the application provides role-based healthcare workflows including appointment management, medication tracking, vital monitoring, symptom reporting, and patient care coordination.

---

## Overview

WeCare is designed to extend healthcare beyond traditional consultations by providing tools for:

- Appointment scheduling and management
- Patient monitoring
- Medication adherence tracking
- Vital sign monitoring
- Symptom reporting
- Caregiver-assisted healthcare workflows
- Clinical status management
- Subscription and wallet management

The platform serves four primary user roles:

- Doctor
- Patient
- Caregiver
- Admin

---

## Key Features

### Authentication & Authorization

- Secure authentication
- OTP verification
- Role-based access control
- Protected routes

### Doctor Portal

- Doctor profile management
- Appointment management
- Prescription creation
- Patient monitoring dashboard
- Vital plan creation
- Clinical status management

### Patient Portal

- Appointment booking
- Symptom logging
- Medical history access
- Prescription tracking
- Monitoring progress view

### Caregiver Portal

- Assigned patient management
- Medication administration tracking
- Vital recording
- Daily monitoring tasks

### Admin Portal

- Doctor verification
- Caregiver verification
- User management
- Platform oversight

### Medication Management

- Prescription viewing
- Medication schedules
- Medication adherence tracking
- Medication logs

### Vital Monitoring

Supported vitals:

- Blood Pressure
- Blood Sugar
- SPO₂
- Heart Rate

Features:

- Vital plans
- Automated monitoring schedules
- Vital recording workflows
- Threshold-based monitoring

### Wallet & Subscription

- Wallet transactions
- Appointment refunds
- Subscription management

---

## Healthcare Workflows

### Appointment Workflow

Patient books appointment

↓

Doctor consultation

↓

Prescription creation

↓

Follow-up monitoring

---

### Medication Workflow

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

Caregiver records readings

↓

Doctor reviews progress

---

### Clinical Status Workflow

Supported statuses:

- Active
- Hospitalized
- Recovered
- Deceased

Clinical status impacts:

- Monitoring plans
- Medication schedules
- Caregiver workflows
- Patient care lifecycle

---

## Tech Stack

### Core

- React 19
- TypeScript
- Vite

### Routing

- React Router 7

### Forms & Validation

- React Hook Form
- Zod

### API Communication

- Axios

### UI

- CSS Modules
- Lucide React

### Notifications

- React Hot Toast

### Utilities

- react-international-phone
- libphonenumber-js
- react-easy-crop

---

## Prerequisites

- Node.js >= 18

---

## Installation

```bash
git clone <repository-url>
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the development server:

```bash
npm run dev
```

Application runs at:

```txt
http://localhost:5173
```

---

## Scripts

| Script          | Description                     |
| --------------- | ------------------------------- |
| npm run dev     | Start development server        |
| npm run build   | Type check and production build |
| npm run preview | Preview production build        |
| npm run lint    | Run ESLint                      |

---

## Project Structure

```text
src/
├── App.tsx
├── main.tsx
├── router.tsx
├── config/
├── modules/
│   ├── auth/
│   ├── patient/
│   ├── doctor/
│   ├── caregiver/
│   └── admin/
├── shared/
├── services/
├── layout/
└── utils/
```

---

## Architecture Highlights

- Feature-based modular architecture
- Reusable component system
- Type-safe TypeScript implementation
- API service abstraction layer
- Form validation with React Hook Form and Zod
- Role-based route protection
- Responsive design
- Reusable UI component library

---

## Future Enhancements

- Real-time notifications
- Advanced health analytics
- AI-assisted health insights

---

## License

ISC
