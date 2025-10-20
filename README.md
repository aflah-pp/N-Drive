# 🚀 N-Drive —  Cloud Like File Manager

**N-Drive** is a full-stack cloud file management platform built with **React (frontend)** and **Django REST Framework (backend)**.  
It allows users to securely upload, organize, share, and download files or folders — all with **AI-assisted features** like chat and image generation.

---

## ⚙️ Overview

N-Drive is a file management platform built with **React + Django REST**.  
It includes secure uploads, AI chat, and dynamic user plans.  

Users can:
- Upload and manage files & folders.
- Share uploaded files or folders with a **unique auto-generated link**.
- Download folders as **ZIP archives**.
- Chat with AI or generate images (integrated via API).

🧠 Learn more about AI chat and image generation in the **AI Integration** section.

---

---

## 🧩 Quick Start (Local Setup)

```bash
# Clone repo
git clone https://github.com/yourusername/n-drive.git

# Backend setup
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend setup
cd client
npm install
npm run dev
```

---

## ⚡ Frontend Architecture

The frontend of **N-Drive** is built using **ReactJS**, a JavaScript library released by Facebook.  

### 💡 Why React?
- Virtual DOM for fast rendering  
- Reusable Components  
- JSX syntax  
- One-way data binding  
- Scalable and modular structure  

### 🧩 Tech Highlights
- Functional components with React Hooks (`useState`, `useEffect`, `useRef`, etc.)
- **Axios** for API communication
- **TailwindCSS** for styling
- Routing with **React Router**
- Clean UI with responsive design

> ⚠️ The folder structure might be a bit messy — hey, I’m still a fresher learning my craft ❤️

---

## 🖥️ Backend (Django REST)

The server-side of **N-Drive** is powered by **Django**, a Python web framework, with **Django REST Framework (DRF)** handling APIs.

### ✨ Why Django?
Because Django automates a ton of backend work:
- Auto-generates SQL tables from model definitions  
- Provides built-in admin, authentication, and serialization tools  
- Offers stability and scalability

### 🔧 Packages Used
- `djangorestframework`
- `rest_framework_simplejwt` (JWT Authentication)
- `zipfile` (to zip folders)
- `cryptography` (for encrypting AI chat)
- `requests` (for external API calls)

Authentication uses **JWT tokens**, for more Go to Apps Doc url.

---

## 🗄️ Database Models

Database is a critical component of N-Drive.

### 🧱 Setup
- **DB** → SQLite (default Django database)

### 📂 Main Tables
- **User** — Custom user model for accounts
- **Package** — Defines user subscription tiers
- **File** — Stores file info, link, and metadata
- **Folder** — For organizing files
- **Transaction** — Payment tracking

---

## 🔐 Authentication (JWT)

N-Drive uses **JWT (JSON Web Token)** authentication through Django’s  
`rest_framework_simplejwt` package.

### ⚙️ Flow
1. On successful login/registration → Backend returns **Access** & **Refresh** tokens.
2. Frontend stores them in **LocalStorage**.
3. Every API request sends the Access token in headers.
4. If Access token expires → Refresh token regenerates a new one automatically.

This system ensures **secure, token-based access** across the app.

---

## 💳 Payment & Packages

N-Drive has a mock payment and plan system allowing users to **upgrade** their storage and unlock AI features.

### 🧾 Plan Features
| Plan | Storage | AI Chat | AI Image Gen | 
|------|----------|----------|---------------|
| Free | 25MB | ❌ | ❌ | 
| Basic | 50MB | ✅ | ❌ | 
| Pro | 100MB | ✅ | ✅ |

Payment flow is simulated using mock endpoints:
- **Frontend** generates an orderId.
- **Backend** verifies it and updates the user plan.

---

## 🧠 AI Integration

N-Drive integrates **AI chat and image generation** via external APIs.

- 🗣️ **Chatbot:** Encrypted communication with AI assistant.
- 🎨 **Image Gen:** AI-powered image generation using text prompts.

All communication is handled securely via backend wrappers using `cryptography` and token-based APIs.

---

## 🧰 Troubleshooting

Common issues and fixes:

1️⃣ **File upload failing?**  
→ Check your plan’s storage limit (upgrade if needed).

2️⃣ **AI not responding?**  
→ Verify API access or check backend logs.

3️⃣ **Nothing showing up?**  
→ Ensure backend service is running.

4️⃣ **Other errors?**  
→ Use browser DevTools — Console & Network tabs often reveal the issue.

---

## 🧑‍💻 Developer Notes

- Built with ❤️ by a full-stack learner exploring React, Django, and AI integrations.
- Don’t hesitate to open an issue or suggestion — feedback makes it better!

---

## 🛠️ Tech Stack Summary

| Layer | Tech |
|-------|------|
| Frontend | React, TailwindCSS, Axios |
| Backend | Django REST Framework |
| Auth | JWT (SimpleJWT) |
| Database | SQLite  |
| AI | External API Integration |
| Hosting | Rendor / Netlify |

---

## 📜 License

This project is open-source and free to explore for educational purposes.


