# Notes App  https://notes-app-1-c8z1.onrender.com/

A full-stack notes application built with Next.js (frontend) and Node.js/Express (backend).

## Features
- User authentication (signup, login, forgot/reset password)
- Create, read, update, and delete notes
- Responsive and modern UI
- API health check endpoint

## Tech Stack
- **Frontend:** Next.js, React, CSS Modules
- **Backend:** Node.js, Express
- **Database:** (Add your DB, e.g., MongoDB, PostgreSQL)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/khanmuhammadrayyan17/notes-app.git
   cd notes-app
   ```

2. **Install dependencies for frontend and backend:**
   ```sh
   cd my-next-app
   npm install
   cd ../backend
   npm install
   ```

3. **Set up environment variables:**
   - Copy `backend/variables.env.example` to `backend/variables.env` and update values as needed.

4. **Run the backend server:**
   ```sh
   cd backend
   npm start
   ```

5. **Run the frontend app:**
   ```sh
   cd my-next-app
   npm run dev
   ```

6. **Open your browser:**
   - Visit [http://localhost:3000](http://localhost:3000) to use the app.

## Folder Structure
- `my-next-app/` - Next.js frontend
- `backend/` - Node.js/Express backend

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)
