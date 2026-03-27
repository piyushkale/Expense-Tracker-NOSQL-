# 📊 Expense Tracker (MongoDB + Node.js)

A full-stack **Expense Tracker Application** built using **Node.js, Express, and MongoDB (native driver)**.  
It allows users to manage expenses, track spending, upgrade to premium, and view leaderboards.

---

## 🚀 Features

- 🔐 User Authentication (JWT + bcrypt)
- 💸 Add, Update, Delete Expenses
- 📄 Pagination for expense listing
- 📊 Leaderboard (Top users by total expense)
- 💎 Premium Membership (Payment Integration)
- 🔁 Password Reset via Email (UUID based)
- 🤖 AI-based Expense Category Suggestion
- 📥 Download Expenses (File export)
- ⚡ Optimized with MongoDB `$inc` for atomic updates

---

## 🧠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MongoDB (Native Driver)  
- **Authentication:** JWT, bcrypt  
- **Payments:** Cashfree  
- **Email Service:** SendinBlue / Brevo  
- **Other:** UUID, dotenv  

---

## 📦 Project Structure

backend/
│── controllers/
│── models/
│── routes/
│── services/
│── utils/
│── app.js
│── .env

