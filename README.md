# TraceCode

**Secure Multi-Language Code Execution, Debugging, and Explanation Platform**

TraceCode is a web-based programming assistance platform that allows users to write, run, debug, and understand code with AI-powered explanations. Unlike traditional online compilers, TraceCode explains **why** errors occur and **how to fix them** without revealing complete solutions.

---

## 🎯 Features

### For Students
- ✅ **Python Code Execution** - Run Python code securely in sandboxed environment
- 🤖 **AI-Powered Debugging** - Get intelligent hints using OpenAI GPT-3.5
- 📚 **Educational Approach** - Learn from mistakes with progressive hints
- 📊 **Personal Dashboard** - Track your coding progress and statistics
- 💾 **Submission History** - Review past code submissions and errors
- 🔐 **Secure Authentication** - Email/password and Google OAuth sign-in

### For Educators
- 📈 **Student Analytics** - Monitor class performance (coming soon)
- 🎓 **Google Classroom Style** - Designed for educational use
- 🔍 **Error Pattern Analysis** - Identify common student struggles

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| TypeScript | Type-safe development |
| Vite | Build tool & dev server |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Monaco Editor | Code editor |
| Firebase Auth | Authentication |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime |
| **Express** | Web framework |
| **TypeScript** | Type-safe development |
| OpenAI API | AI hint generation |
| Firebase Admin | User management |
| JWT | API authentication |
| bcrypt | Password hashing |

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Firebase Project** (for authentication)
- **OpenAI API Key** (for AI hints)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lab-assistant-ai-00
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your Firebase configuration

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:8080**

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (already exists)
# Make sure it has your OpenAI API key

# Start backend server in development mode
npm run dev

# Or build and start in production mode
npm run build
npm start
```

Backend API will run at: **http://localhost:8000**

API Documentation: **http://localhost:8000/api/info**

---

## ⚙️ Environment Variables

### Frontend (`.env`)

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Backend API URL
VITE_API_URL=http://localhost:8000
```

### Backend (`server/.env`)

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# AI Configuration
OPENAI_API_KEY=sk-proj-...your-openai-api-key

# Environment
ENVIRONMENT=development
```

---

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing
3. Note your project details

### 2. Enable Authentication
1. Navigate to **Authentication** → **Sign-in method**
2. Enable **Email/Password** provider
3. Enable **Google** provider (optional)
4. Add authorized domains

### 3. Get Configuration
1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Click **Web app** (</>) to get Firebase config
4. Copy configuration to `.env` file

---

## 📁 Project Structure

```
tracecode/
├── src/                           # React frontend
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── code-editor/           # Monaco editor
│   │   ├── layout/                # Navbar, Footer
│   │   └── debug-assistant/       # AI hints display
│   ├── pages/
│   │   ├── Index.tsx              # Landing page
│   │   ├── Login.tsx              # Login page
│   │   ├── Register.tsx           # Registration
│   │   └── student/               # Student dashboard
│   ├── services/
│   │   ├── authService.ts         # Firebase authentication
│   │   └── apiService.ts          # Backend API calls
│   └── config/
│       └── firebase.ts            # Firebase config
│
├── server/                        # Node.js/Express backend
│   ├── src/
│   │   ├── index.ts               # Express application
│   │   ├── config/
│   │   │   └── env.ts             # Environment config
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript types
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT middleware
│   │   ├── routes/
│   │   │   ├── auth.ts            # Authentication
│   │   │   ├── code.ts            # Code execution
│   │   │   ├── hints.ts           # AI hints
│   │   │   └── submissions.ts     # User history
│   │   └── services/
│   │       ├── authService.ts     # JWT & bcrypt
│   │       ├── codeService.ts     # Python execution
│   │       ├── hintService.ts     # OpenAI integration
│   │       ├── firebaseService.ts # Firebase Admin
│   │       └── submissionsService.ts # History storage
│   ├── package.json
│   └── tsconfig.json
│
└── public/                        # Static assets
```

---

## 🔌 API Endpoints

### Authentication
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Register with email/password |
| `/api/auth/login` | POST | No | Login with credentials |
| `/api/auth/firebase` | POST | No | Authenticate with Firebase token |
| `/api/auth/me` | GET | Yes | Get current user info |
| `/api/auth/refresh` | POST | Yes | Refresh JWT token |

### Code Execution
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/code/run` | POST | No | Execute Python code |
| `/api/code/debug` | POST | Optional | Run with AI hints |
| `/api/code/run-and-save` | POST | Yes | Execute & save to history |

### Submissions
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/submissions` | GET | Yes | List user's submissions |
| `/api/submissions/stats` | GET | Yes | User statistics |
| `/api/submissions/{id}` | GET | Yes | Get specific submission |
| `/api/submissions/{id}` | DELETE | Yes | Delete submission |

### AI Hints
| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/hints/get` | POST | No | Get debugging hints |

---

## 🧪 Testing the API

### Visit API Documentation
Navigate to `http://localhost:8000/api/info` for endpoint information.

### Using PowerShell

**Test Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/health"
```

**Test Code Execution:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/code/run" -Method POST -ContentType "application/json" -Body '{"code":"print(1+1)","language":"python"}'
```

---

## 🔐 Security Features

- 🔒 **Sandboxed Execution** - Code runs in isolated subprocess with timeout
- 🛡️ **JWT Authentication** - Secure API access with bearer tokens
- 🔑 **Environment Variables** - Sensitive data in `.env` files
- ✅ **TypeScript** - Type-safe development
- 🚫 **CORS Protection** - Configurable allowed origins
- ⏱️ **Execution Timeout** - 10-second limit prevents infinite loops
- 🔐 **bcrypt** - Secure password hashing

---

## 📊 Current Status

| Feature | Status |
|---------|--------|
| Node.js Backend | ✅ Complete |
| Python Code Execution | ✅ Complete |
| OpenAI Hints | ✅ Complete |
| Email/Password Auth | ✅ Complete |
| Google OAuth | ✅ Complete |
| Submission History | ✅ Complete |
| User Statistics | ✅ Complete |
| TypeScript Backend | ✅ Complete |
| C/C++/Java Support | ⏳ Planned |
| Docker Sandbox | ⏳ Planned |
| Instructor Dashboard | ⏳ Planned |

**Backend:** 100% Complete (Node.js/Express/TypeScript)  
**Frontend Integration:** In Progress

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Development Team** - TraceCode
- **Support Email** - hariharan.rwork@gmail.com

---

## 🙏 Acknowledgments

- OpenAI for GPT-3.5 API
- Firebase for authentication
- shadcn/ui for component library
- Express.js for excellent Node.js framework
- Monaco Editor for code editing experience

---

**Built with ❤️ for better learning**
