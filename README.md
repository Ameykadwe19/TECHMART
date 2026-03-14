# 🛍️ TECHMART - E-Commerce Platform

TECHMART is a modern full-stack e-commerce web application built with **React.js** (frontend) and **Node.js + Express.js + PostgreSQL + Sequelize** (backend). It includes **JWT authentication, Redis caching, Dockerized deployment, automated CI/CD pipeline, and rigorous SDLC practices**.

---

🔗 Live Demo
🌐 Frontend (Vercel): https://techmart-ruby.vercel.app
🔌 Backend API (Render): [https://techmart-backend-qiib.onrender.com](https://techmart-1-k96p.onrender.com)

---

## 🚀 Tech Stack

| Layer    | Tech Stack                                      |
| -------- | ----------------------------------------------- |
| Frontend | React.js, Tailwind CSS, Axios                   |
| Backend  | Node.js, Express.js, Sequelize ORM              |
| Database | PostgreSQL, Supabase                            |
| Caching  | Redis (Upstash) + In-Memory Cache               |
| Testing  | Jest + Supertest                                |
| DevOps   | Docker, GitHub Actions, Render, Railway, Vercel |

---

## ✨ Key Features

✅ User Registration & JWT Login
✅ Secure Product Management (CRUD)
✅ Add to Cart & Place Orders
✅ Role-based Access (Admin/User)
✅ Real-time Redis Caching
✅ Automated CI/CD with GitHub Actions
✅ Unit Testing with Jest + Supertest
✅ Dockerized Frontend & Backend

---

## 📂 Folder Structure

```
techmart/
├── client/        # React Frontend
└── server/        # Node.js Backend
```

---

## ⚙️ Setup Instructions

### 🔧 Backend Setup (`/server`)

```bash
cd server
npm install
```

Create `.env` in `/server`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
JWT_SECRET=your_secret
REDIS_URL=your_redis_url
PORT=5000
```

Run:

```bash
npm start
```

Run Unit Tests:

```bash
npm run test
```

---

### 🎨 Frontend Setup (`/client`)

```bash
cd client
npm install
npm start
```

---

## 🧪 Unit Testing (`/server/tests`)

* Framework: **Jest + Supertest**
* Tested:

  * ✅ Products Controller (Success + Failure)
  * ✅ Get Product By ID (Success + Failure)
* Run Tests:

  ```bash
  npm run test
  ```
* Sample Output:

  ```
  PASS tests/productsController.test.js
  PASS tests/getProductById.test.js
  ```

---

## 🐳 Dockerized Build (Client + Server)

### 1️⃣ Build Client (React)

```bash
cd client
docker build -t techmart-client .
docker run -p 3000:3000 techmart-client
```

### 2️⃣ Build Server (Node.js)

```bash
cd server
docker build -t techmart-server .
docker run -p 5000:5000 techmart-server
```

👉 Combine both using `docker-compose` for full-stack deployment.

---

## 🔗 API Endpoints

| Method | Endpoint           | Function               | Auth    |
| ------ | ------------------ | ---------------------- | ------- |
| POST   | /api/auth/register | User Registration      | ❌       |
| POST   | /api/auth/login    | User Login             | ❌       |
| GET    | /api/products      | Get All Products       | ❌       |
| GET    | /api/products/\:id | Get Product by ID      | ❌       |
| POST   | /api/products      | Add Product (Admin)    | ✅ Admin |
| PUT    | /api/products/\:id | Update Product (Admin) | ✅ Admin |
| DELETE | /api/products/\:id | Delete Product (Admin) | ✅ Admin |

---

## 📦 CI/CD Pipeline (GitHub Actions)

✅ Auto Build & Deploy Backend to **Render/Railway**
✅ Auto Build & Deploy Frontend to **Vercel**
✅ Run Unit Tests Automatically on Each Commit

### Sample `.github/workflows/node.yml`

```yaml
name: Node.js CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test
```

---

## 🔄 SDLC Process (Software Development Life Cycle)

| Phase           | Activities                                           |
| --------------- | ---------------------------------------------------- |
| 1️⃣ Requirement | Define features: User auth, Cart, Product management |
| 2️⃣ Design      | Database schema (ERD), API design, UI wireframes     |
| 3️⃣ Development | Write React.js frontend, Node.js backend             |
| 4️⃣ Testing     | Unit Testing (Jest), Integration Testing, Postman    |
| 5️⃣ Deployment  | Dockerize, CI/CD pipelines, Deploy to Render/Vercel  |
| 6️⃣ Maintenance | Monitor, fix bugs, add new features                  |

---

## 🔮 Future Scope

🚀 **Payment Gateway Integration (Stripe/Razorpay)**
🚀 **Real-time Notifications (Socket.IO)**
🚀 **Progressive Web App (PWA) Version**
🚀 **AI-driven Product Recommendations**
🚀 **Inventory Management System**
🚀 **Wishlist & Personalized Offers**

---

## 🤝 Contributing

1. Fork the project
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Open a Pull Request ✅

---

## 📄 License

MIT License.

---

Made with ❤️ by **\[Amey kadwe]**
