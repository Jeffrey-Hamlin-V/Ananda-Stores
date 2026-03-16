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

## 💻 Local Development Setup

To run this application on your local machine, follow these instructions.

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or newer)
- Git

### 1. Clone the repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Configure Environment Variables
In the root directory of the project, create a `.env` file containing the following required credentials. *Note: Never commit your `.env` file to version control.*
```env
PORT=3000
DATABASE_URL=postgres://<user>:<password>@<host>:<port>/<dbname>
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Install Backend Dependencies
Navigate to the `server` directory and install the required Node.js packages:
```bash
cd server
npm install
```

### 4. Start the Application

You will need two terminal windows running simultaneously to independently operate the backend API and the static frontend UI.

**Terminal 1 (Backend API):**
```bash
# From within the /server directory
npm start
# The server will log: "Connected to PostgreSQL database." and "Server is running on port 3000"
```

**Terminal 2 (Frontend Client):**
Open a new terminal session in the **root** folder of your project (not the server directory), and execute:
```bash
python -m http.server 5000
```
Navigate to `http://127.0.0.1:5000` in your web browser.

---

## 🤝 Maintenance
For feature enhancements, please coordinate via the project repository. Before running localized updates, verify that your IP configuration interfaces with the Railway production database accurately (or pivot your local `.env` setup to a Dockerized/local Postgres instance as needed).
