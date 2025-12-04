# FastAPI Authentication System (JWT + Refresh Tokens)

This document explains how to set up and use the authentication system built using **FastAPI**, **JWT**, **Refresh Tokens**, **SQLAlchemy**, and **PostgreSQL**.

---

## 📁 Project Structure

```
app/
├── core/
│   ├── config.py            # loads environment variables
│   └── security.py          # hashing, JWT, auth utilities
│
├── auth/
│   └── routes.py            # login, register, refresh
│
├── models.py                # User model (single file)
│
├── schemas/
│   └── user.py              # Pydantic schemas
│
├── database.py              # DB engine + session
└── main.py                  # FastAPI entrypoint
```

---

## 🔑 Environment Variables (.env)

```
SECRET_KEY=<ACCESS_TOKEN_SECRET>
REFRESH_SECRET_KEY=<REFRESH_TOKEN_SECRET>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/db
```

---

## ⚙️ Config (config.py)

Loads secrets, token expiry times, and algorithm.

---

## 👤 User Model (models.py)

Add this field to support refresh tokens:

```
refresh_token_hash = Column(String, nullable=True)
```

This stores a **hashed version** of the refresh token.

---

## 🔐 Security Utilities (security.py)

Includes:

* Password hashing (bcrypt)
* Data hashing for refresh tokens
* Access token creation
* Refresh token creation
* OAuth2 authentication dependency
* `get_current_user()`

---

## 🧾 Schemas (schemas/user.py)

* `LoginRequest`
* `TokenResponse`
* `RefreshRequest`

---

## 🔄 Authentication Routes (auth/routes.py)

### 1️⃣ Register — `POST /auth/register`

Creates a user and stores hashed password.

### 2️⃣ Login — `POST /auth/login`

* Validates user
* Issues **access** and **refresh** tokens
* Stores hashed refresh token in DB

### 3️⃣ Refresh — `POST /auth/refresh`

* Validates refresh token
* Issues new access token

---

## 🔁 Token Workflow

| Token         | Lifespan    | Purpose                |
| ------------- | ----------- | ---------------------- |
| Access Token  | ~15 minutes | Protect routes         |
| Refresh Token | ~7 days     | Issue new access token |

---

## 🗄 Database & Alembic

When modifying models (such as adding `refresh_token_hash`), you must run Alembic.

### 🟦 Initial setup (run once):

```
alembic init alembic
```

### 🟧 Whenever you change models:

```
alembic revision --autogenerate -m "update user model"
```

### 🟩 Apply migrations:

```
alembic upgrade head
```

### Example migration output:

```
op.add_column('users', sa.Column('refresh_token_hash', sa.String(), nullable=True))
```

---

## 🔐 Protecting Routes

Example usage:

```
@router.get("/profile")
def profile(user = Depends(get_current_user)):
    return user
```

This requires a **valid access token**.

---

## ✔️ System Capabilities

* User registration
* Secure password hashing
* Access + Refresh JWTs
* Refresh endpoint
* Hashed refresh tokens in DB
* OAuth2-compatible
* Works with single `models.py` file

---

## 🧩 When to Run Alembic Commands

Run Alembic every time you change your SQLAlchemy models.

### **1. Generate migration**

```
alembic revision --autogenerate -m "describe change"
```

### **2. Apply migration**

```
alembic upgrade head
```

### **3. If you need to undo**

```
alembic downgrade -1
```

---

If you want, I can also generate the **full authentication codebase**, a **Postman collection**, or a **Docker setup**.
