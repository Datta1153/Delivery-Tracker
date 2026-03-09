# Logistiq Delivery Tracker - Project Showcase

Welcome to the project showcase folder for the **Logistiq Delivery Tracker**. 

This directory contains comprehensive technical and user documentation designed to demonstrate the architecture, features, and user journeys of this full-stack MERN application.

## Documentation Index

Please review the following files in this directory to understand the project in depth:

1. **`user_flow.md`**
   - Details the step-by-step journey of the three distinct user roles: **Customer**, **Staff** (Delivery Driver), and **Admin**. 
   - Explains how they interact with the system, from registering with an OTP, to uploading a Proof of Delivery photo, to managing the company fleet.

2. **`technology_stack.md`**
   - Breaks down the specific frameworks and libraries used to build the application.
   - Maps each major feature (like Real-time Tracking, Email Alerts, and File Uploads) to the exact technology used to implement it (Socket.io, Nodemailer, Multer, etc.).

3. **`folder_structure.md`**
   - Provides an annotated tree layout of the entire `client` and `server` repositories.
   - Highlights key architectural decisions, such as route guarding, decoupled events, and JWT injection.

## Project Highlights
* **Automated Email Notifications:** Gmail SMTP integration for Order Creation, OTP Verification, and Live Status Updates.
* **Real-time WebSockets:** A live, animated tracking timeline that updates the millisecond a driver logs a delivery.
* **Role-Based Access Control (RBAC):** Secure, isolated dashboards for Admins, Staff, and Customers using encrypted JWTs.
* **Multipart Image Uploads:** Direct-to-server photo and PDF uploads for Proof of Delivery.
* **Modern UI:** Responsive, utility-first design built with React, Vite, and Tailwind CSS.
