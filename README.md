# SecureVault - Encrypted Password Manager (Next.js + MongoDB)

SecureVault is a **client‑side encrypted password manager** built with
**Next.js 15**, **MongoDB** and **JWT authentication**.
Passwords never leave the client unencrypted --- your vault data is
encrypted **inside the browser** using AES‑256 before being sent to the
backend.

<img width="960" height="540" alt="image" src="https://github.com/user-attachments/assets/7dd92394-e5de-4c4b-895a-1a74b631cf4f" />

**Watch this demo video ->** https://drive.google.com/file/d/1n3zFQhPmdBJetRQ3SUU0kGaw3X1cydqn/view?usp=sharing

------------------------------------------------------------------------

## 🚀 Features

### 🔐 **End‑to‑End Encryption (E2EE)**

-   Uses **CryptoJS AES-256 encryption**
-   Encryption key is **derived client-side**
-   Server never sees decrypted data

### 🔑 **User Authentication**

-   JWT-based authentication stored in secure httpOnly cookies
-   Login, Register, Logout endpoints

### 🗄️ **Encrypted Vault Items**

Each vault entry contains: 
- Title
- Username
- Email
- Password
- URL
- Notes

All fields are encrypted client‑side.

### 🔍 **Search & Filtering**

-   Search by title, username, or URL (after client-side decryption)
-   Optional hashed title index for fast search

### 🔒 **Copy Protection**

-   Secure clipboard copying with automatic clearing
-   Passwords never logged or stored in plaintext

### 🔧 **Built‑in Password Generator**

Includes: - Adjustable length (8--64) - Numbers toggle - Symbols
toggle - Exclude look‑alike characters - One‑click copy + auto-refresh

### 🗑️ CRUD Operations

-   Add item
-   Edit item
-   Delete item
    (All encrypted)

------------------------------------------------------------------------

## 🛠️ Tech Stack

### **Frontend**

-   Next.js 15 (App Router)
-   React Server Components + Client Components
-   TailwindCSS
-   Lucide Icons

### **Backend**

-   API Routes (`src/app/api/*`)
-   JWT Auth + Secure Cookies
-   MongoDB (Mongoose ODM)

### **Security**

-   AES‑256 client-side encryption (CryptoJS)
-   httpOnly + Secure cookies
-   Rate limiting recommended (optional)
-   No encryption key ever leaves the client

------------------------------------------------------------------------

## 📂 Project Structure

    src/
     ├─ app/
     │   ├─ api/
     │   │   ├─ auth/
     │   │   │   ├─ login/route.ts
     │   │   │   ├─ register/route.ts
     │   │   │   ├─ 2fa/route.ts
     │   │   └─ vault/
     │   │       ├─ route.ts          # GET, POST
     │   │       └─ [id]/route.ts     # PUT, DELETE
     │   └─ dashboard/page.tsx
     │
     ├─ components/
     │   └─ Vault.tsx
     │
     ├─ lib/
     │   ├─ crypto.ts   # AES encryption/decryption
     │   ├─ db.ts       # MongoDB connection
     │   ├─ mail.ts     # Brevo SMTP mail sender
     │   └─ hooks.ts    # Clipboard hook
     │
     ├─ models/
     │   ├─ User.ts
     │   └─ VaultItem.ts

------------------------------------------------------------------------

## ⚙️ Environment Variables

Create a `.env.local`:

    MONGODB_URI=YOUR_MONGO_ATLAS_URI
    JWT_SECRET=YOUR_JWT_SECRET

------------------------------------------------------------------------

## ▶️ Running the Project

### Install Dependencies

    npm install

### Start Dev Server

    npm run dev

### Build for Production

    npm run build
    npm start

------------------------------------------------------------------------

## 🔒 Security Model (Important)

### What the server **can see**

-   Your authenticated user ID
-   Encrypted vault item content
-   Metadata timestamps

### What the server **cannot see**

-   Plain title
-   Plain password
-   Plain username
-   Encryption key

### Where encryption happens

- ✔ In browser
- ✖ Never on the server
- ✖ Never stored in DB unencrypted

------------------------------------------------------------------------


