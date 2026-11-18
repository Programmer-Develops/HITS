# 🚀 HITS - Hygiene Issue and Tracking System

## 📌 Overview

**HITS (Hygiene Issue and Tracking System)** is a full-stack sanitation monitoring platform designed to report, track, translate, and manage hygiene-related issues efficiently.

The platform enables workers and administrators to monitor sanitation conditions through a centralized dashboard, upload photo-based reports, receive multilingual support, and integrate with WhatsApp for real-time communication.

---

## ✨ Features

- 👨‍🔧 Worker Registration and Management
- 🏢 Sanitation Block Management
- 📸 Photo-Based Hygiene Issue Reporting
- 🔍 Duplicate Report Detection
- 🌐 Bilingual Support (English & Telugu)
- 💬 WhatsApp Webhook Integration
- 📊 Dashboard for Report Status Tracking
- ☁️ Cloudinary Image Storage
- 🌗 Light & Dark Theme Support
- 🚀 Vercel Deployment Ready

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- Lucide React
- Context API

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer
- Cloudinary
- WhatsApp Graph API
- MyMemory Translation API

---

## 📂 Project Structure

```text
HITS/
│
├── client/                  # React Frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                  # Express Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── package.json
│
├── uploads/
├── README.md
└── .env
```

---

## ✅ Prerequisites

Before running the project, ensure you have:

- Node.js (v18 or later)
- npm
- MongoDB Database
- Cloudinary Account
- Meta WhatsApp Cloud API Credentials

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/HITS.git
cd HITS
```

### 2. Install Dependencies

#### Frontend

```bash
cd client
npm install
```

#### Backend

```bash
cd server
npm install
```

---

## 🔐 Environment Variables

Create a `.env` file in the server directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_VERIFY_TOKEN=your_verify_token
```

---

## ▶️ Running the Application

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

The application will be available at:

```text
Frontend: http://localhost:5173
Backend: http://localhost:5000
```

---

## 🌍 Supported Languages

| Language | Support |
|-----------|----------|
| English | ✅ |
| Telugu | ✅ |

---

## 📸 Core Workflow

1. Worker registers in the system.
2. Hygiene issue is reported with a photo.
3. System checks for duplicate reports.
4. Image gets uploaded to Cloudinary.
5. Issue details are translated if required.
6. WhatsApp notifications are triggered.
7. Administrators monitor and update status from the dashboard.

---

## 🚀 Deployment

### Frontend Deployment

Deploy easily using:

- Vercel
- Netlify

### Backend Deployment

Deploy using:

- Render
- Railway
- AWS
- DigitalOcean

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push the branch
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

Developed as a sanitation monitoring and issue management platform to improve hygiene tracking, reporting, and resolution workflows.