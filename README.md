# 🏥 Medical ERP System - نظام إدارة العيادات المتكامل

A professional, high-performance Medical Enterprise Resource Planning (ERP) system built for modern clinics and hospitals. The system features a beautiful dark/light mode interface, real-time updates, and multi-role access control.

---

## 🚀 Key Modules & Features

### 📊 Analytics Hub
- **Real-time Stats**: Track today's revenue, patient count, and pending appointments.
- **Data Visualization**: Interactive charts for revenue trends and visit types.

### 💊 Pharmacy & Inventory
- **Drug Database**: Full CRUD for clinical medications.
- **Stock Management**: Automated low-stock alerts and history of dispensed items.
- **Auto-Billing**: Integrated with doctor prescriptions for seamless invoicing.

### ⏳ Queue Management
- **Smart Queue**: Real-time patient flow control for receptionists and doctors.
- **Now Serving**: Audible and visual "Call Next" functionality.
- **📺 Public Display**: Dedicated full-screen route (`/public-queue`) for waiting room TV screens.

### 🖨️ Professional Printing
- **Clean Layouts**: Custom-designed templates for Invoices, Prescriptions (Rx), and Lab Reports.
- **Silent Printing**: Optimized for modern browser print engines.

### 🛡️ Role-Based Access Control (RBAC)
- **Admin (مدير)**: Full system access, staff management, and audit logs.
- **Doctor (طبيب)**: Focused on patient history, electronic prescriptions, and lab results.
- **Cashier (كاشير)**: Handles patient registration, scheduling, and billing payments.

### 🌍 Localization & Theme
- **Fully Arabic/English**: Seamless toggle with high-quality clinical translations.
- **Modern UI**: Built with Shadcn/UI benchmarks, Glassmorphism, and Framer Motion.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS 4.0, Lucide Icons, Framer Motion, Axios.
- **Backend**: Node.js, Express, Socket.io (Real-time).
- **Database**: MongoDB (Mongoose).
- **Security**: JWT Authentication, Bcrypt Password Hashing, Audit Logging Middleware.

---

## ⚙️ Installation & Setup

1. **Clone the repository**
2. **Install Dependencies**
   - Backend: `npm install` inside the `/server` directory.
   - Frontend: `npm install` inside the `/client` directory.
3. **Environment Variables**
   - Create a `.env` file in the `/server` directory with:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `PORT` (default 5000)
4. **Run the Application**
   - Backend: `npm run dev`
   - Frontend: `npm run dev`

---

## 👨‍💻 Developed By

**Mr. Masa Official**

[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/@MrMasaOfficial)
[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://www.facebook.com/MrMasaOfficial)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/MrMasaOfficial)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/201271046052)

---

Developed with ❤️ as a production-ready medical solution.
