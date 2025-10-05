#  Password Generator + Secure Vault (MVP)

A minimal password manager web app built with **Next.js, TypeScript, and MongoDB**, focused on **privacy-first storage**.  
Users can generate strong passwords, save them securely in a personal vault, and manage them with client-side encryption.


##  Features

- **Password Generator**
  - Length slider
  - Include/exclude letters, numbers, symbols
  - Exclude look-alike characters (e.g., `O/0`, `I/l`)

- **User Authentication**
  - Email + password signup/login
  - Each user has their own encrypted vault

- **Secure Vault**
  - Save entries with: title, username, password, URL, notes
  - View, edit, delete items
  - Client-side encryption (server never stores plaintext)
  - Basic search/filter support

- **Clipboard Privacy**
  - Copy password to clipboard
  - Auto-clear after 10–20 seconds

---

##  Tech Stack

- **Frontend**: Next.js + TypeScript
- **Backend**: Next.js API routes (Node.js under the hood)
- **Database**: MongoDB Atlas
- **Encryption**: [crypto-js](https://www.npmjs.com/package/crypto-js) (AES) for client-side encryption

---

##  Crypto Choice

We used **AES (Advanced Encryption Standard)** from `crypto-js` for:
- Strong, well-tested symmetric encryption
- Lightweight library suitable for client-side use
- Ensures only encrypted data is stored in DB, keeping passwords private

---



## ⚡ Getting Started


# 1. Clone Repo
git clone https://github.com/Asteinwords/Madquick.git


# 2. Install Dependencies
npm install

# 3. Setup Environment
 Create a .env.local file in the root folder and add:
 MONGO_URI=your-mongodb-connection-string
 JWT_SECRET=your-secret-key

# 4. Run App
npm run dev

App will be available at: http://localhost:3000
