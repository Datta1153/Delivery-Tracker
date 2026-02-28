# Delivery-Tracker

A full-stack delivery tracking application built with Node.js/Express and React. Recently extended with an AI-powered chat assistant using OpenAI's API.

## Setup

1. **Backend**
   - `cd backend`
   - copy `.env.example` to `.env` and fill in the values (MongoDB URI, JWT secret, SMTP, and `OPENAI_API_KEY` for the chat bot).
   - `npm install` (the `openai` package has been added for AI features)
   - `npm run dev` to start server.
   - `npm run seed` to create a default admin user (email `admin@deliverytracker.com`, password `Admin@123`).
     Run this again if you ever drop the database or need to recreate the account.

2. **Frontend**
   - `cd frontend`
   - `npm install`
   - `npm start`

## AI Chat Assistant

The application includes a simple conversational endpoint at `/api/ai/chat`. Authenticated users can open the **Chat** page in the frontend to send messages; requests are proxied to OpenAI and replies returned. Ensure you set `OPENAI_API_KEY` in your backend environment. Use responsibly to avoid API costs.


