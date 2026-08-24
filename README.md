<h1 align="center">🚀 SnapCut AI</h1>

<p align="center">
  <b>AI-Powered Background Removal Platform</b><br/>
  <i>Fast ⚡ • Secure 🔐 • Scalable 🚀</i>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Poppins&size=26&pause=1000&color=0EA5FF&center=true&vCenter=true&width=700&lines=Remove+Backgrounds+in+Seconds;AI+Powered+Image+Processing;Built+for+Real+World+SaaS;Fast+⚡+Secure+🔐+Scalable+🚀" />
</p>

---

## 🌌 Overview

**SnapCut AI** is a production-ready SaaS platform that enables users to remove image backgrounds instantly using AI.

It is built using a **serverless architecture**, ensuring:
- ⚡ High performance  
- 📈 Scalability  
- 🔐 Security  
- 💳 Monetization readiness  

This project demonstrates a **real-world full-stack system design** using modern tools.

---

## 🎯 Key Features

### 🖼 Image Processing
- Drag & drop image upload  
- AI-powered background removal  
- Instant preview & download  
- Supports JPG, PNG, WEBP  
- Max file size: 10MB  

---

### 👤 Authentication & Security
- Email/password authentication  
- Google OAuth login  
- Email verification  
- Password reset flow  
- JWT-based session handling  

---

### 📊 User Dashboard
- Upload history (last 7 days)  
- Credit usage tracking  
- Subscription details  
- Download history  

---

### 💳 Payments & Monetization
- Free plan (limited usage)  
- Pro subscription model  
- Credit-based system  
- Razorpay integration  
- Secure webhook verification  

---

### 🔌 Public API (B2B Ready)
- API key generation  
- Rate limiting  
- Usage tracking  
- Developer integration support  

---

### 🛠 Admin Panel
- User management  
- Revenue tracking  
- API usage analytics  
- Workflow monitoring  

---

## 🧠 System Architecture

```txt
User Upload
   ↓
Cloudinary (Temporary Storage)
   ↓
n8n Webhook
   ↓
AI Background Removal API
   ↓
Cloudinary (Processed Image)
   ↓
Supabase (Metadata & Auth)
   ↓
Frontend Display
