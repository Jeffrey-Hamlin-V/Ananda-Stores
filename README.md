# Ananda Stores - Wholesale Groceries

A bespoke B2B wholesale platform built for Ananda Stores, a Madurai-based grocery provider serving the community since 1983. This application is a fully functional e-commerce landing page with a secure administrative dashboard to manage inventory and product catalogs dynamically.

## 🚀 Live Demo

- **Frontend Application**: [https://ananda-stores.vercel.app](https://ananda-stores.vercel.app/)
- **Admin Login**: [https://ananda-stores.vercel.app/admin.html](https://ananda-stores.vercel.app/admin.html)

---

## 🛠️ Tech Stack

### Frontend Architecture
- **HTML5 & CSS3**: Pure, vanilla implementation for maximum performance and highly customized styling (CSS Variables, Flexbox, Grid).
- **Vanilla JavaScript (ES6+)**: No heavy front-end frameworks (React, Vue) were loaded to prioritize execution speed and simplicity. 
- **Modern UI/UX**: Implements Glassmorphism, CSS animations (`fadeInUp`), pill-shaped conversational CTA buttons, and native structural lazy-loading for enhanced Core Web Vitals.
- **Internationalization (i18n)**: Fully integrated dual-language support (English & Tamil) for comprehensive accessibility.

### Backend Architecture
- **Node.js runtime environment**
- **Express.js**: Lightweight framework managing the REST API and routing.
- **PostgreSQL**: Robust open-source relational database managing all inventory items, nested categories, and user credentials.
- **Authentication**: `jsonwebtoken` (JWT) for secure, stateless session management, and `bcryptjs` for protecting administrative passwords.
- **Storage**: `cloudinary` coupled with `multer-storage-cloudinary` to handle direct, scalable image uploads.

### Infrastructure & Deployment Pipeline
- **Frontend Hosting**: Vercel Engine (Edge network caching for HTML, CSS, JS).
- **Backend API Hosting**: Railway serverless deployment.
- **Database Hosting**: Railway PostgreSQL instance.
- **Version Control**: Git / GitHub.

---

## ✨ Core Features

### Client-Facing Application
- **Dynamic Product Catalog**: Products are fetched securely from the PostgreSQL database in real-time.
- **Live Search & Filtering**: Client-side categorization allows searching by Product Name, Brand, sorting by Name/Price, and adjusting maximum price ranges constraints dynamically.
- **Bilingual Interface**: One-click toggle functionality to switch the entire application's text strings, including database fetched names, between English and Tamil instantly.
- **Performance Optimized**: Implements progressive native image lazy loading `loading="lazy"` limiting initial HTTP bursts on large catalogs.

### Secure Admin Dashboard
- **Role-Based Access Control**: Login portal protected by JWT tokens. Only users with the `super_admin` role can execute destructive actions (e.g., Delete Products).
- **CRUD Operations**: Securely Add, Read, Update, and Delete products from the central Database.
- **Image Management**: Seamless upload component interfacing with the Cloudinary REST API to process product imagery upon form submission.
- **Analytics Overview**: High-level computational overview rendering Total Active Items, Unique Categories, and Total Inventory Value in real-time.

---
