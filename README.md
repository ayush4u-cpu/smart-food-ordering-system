# Smart Food Ordering System

Welcome to the Smart Food Ordering System. This is a very simple and basic web application designed to help users order food online, manage their cart, and allow admins to manage menus and orders. 

This project is built using basic, easy-to-understand code structures, making it perfect for high school level projects and learning.

It is split into two main parts:
1. Backend: A single-file server (server.js) that handles database connections, user login checks, and business logic.
2. Frontend: A React user interface where customers and admins can interact.

## Features

- Simple Authentication: Users can register and log in. Passwords are saved in plain text, and logged-in states are handled using simple text tokens.
- Browse Food Items: View available dishes on the home page.
- Shopping Cart: Add food items to the cart, update quantities, and see the total price.
- Admin Dashboard: Manage items (add, edit, delete food) and view customer orders.
- Basic Popups: Uses simple JavaScript alert() calls for success and error messages instead of complex notification packages.
- Database System: Uses a simple SQL database (schema.sql) to store users, food items, and orders.

## Tech Stack

- Frontend: React.js (built with Vite)
- Backend: Node.js and Express.js
- Database: SQL (Structured Query Language)

## Project Structure

- backend: Server-side code.
  - server.js: The entire server code in a single file for easy reading.
- frontend: User interface code.
  - src/components: Reusable UI elements like the navigation bar (Navbar.jsx).
  - src/context: Manages state across the app (like tracking cart items and login state).
  - src/pages: Different screens of the app (Login, Register, Home, Cart, Orders, AdminDashboard).
- schema.sql: The database blueprint to set up tables.

## How to Get Started

### 1. Database Setup
Import the schema.sql file into your local SQL database (MySQL/PostgreSQL) to set up the necessary tables for users, food items, and orders.

### 2. Run Backend (Server)
1. Navigate to the backend folder:
   cd backend
2. Install dependencies:
   npm install
3. Set up your .env file (copy from .env.template and add your database credentials).
4. Start the server:
   node server.js

### 3. Run Frontend (User Interface)
1. Open a new terminal window and navigate to the frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Start the React development server:
   npm run dev
4. Open the link displayed in the terminal (usually http://localhost:5173) in your browser.
