
# 📘 **Authentication System Documentation (FastAPI + JWT + Refresh Tokens)**

This document explains how the authentication system is implemented in your FastAPI backend using:

* 🔐 JWT Access Tokens
* 🔄 Refresh Tokens
* 🗄 Stored hashed refresh tokens
* 🧱 SQLAlchemy ORM (single `models.py`)
* 🐘 PostgreSQL
* ⚙️ Alembic migrations

It covers architecture, endpoints, data flow, and configuration.

---

---

## 📁 1. Project Structure

Your relevant auth-related layout:

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
└── main.py                  # FastAPI app entrypoint
```


## 🔑 2. Environment Variables

Stored in `.env`:

```
SECRET_KEY=<ACCESS_TOKEN_SECRET>
REFRESH_SECRET_KEY=<REFRESH_TOKEN_SECRET>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
DATABASE_URL=postgresql+psycopg2://user:pass@localhost:5432/db
```

* `SECRET_KEY` → used for signing access tokens
* `REFRESH_SECRET_KEY` → used for refresh tokens


## ⚙️ 3. Configuration (`config.py`)

Loads all environment variables:

* Access token expiry
* Refresh token expiry
* Secrets
* Algorithm

These values are used across the authentication logic.



## 👤 4. User Model (`models.py`)

Your `User` table includes:

| Field                | Purpose                     |
| -------------------- | --------------------------- |
| `id`                 | primary key                 |
| `email`              | unique identifier           |
| `password`           | hashed password             |
| `refresh_token_hash` | hashed active refresh token |

### Added field:

```python
refresh_token_hash = Column(String, nullable=True)
```

This allows the system to:

* **Store only a hashed version of the refresh token**
* Verify refresh token authenticity during refresh
* Invalidate refresh tokens (logouts, rotations)


## 🔐 5. Security Utilities (`security.py`)

`security.py` contains all core authentication utilities:

### 💠 Password Hashing

Uses Passlib (bcrypt):

* `hash_password(password)`
* `verify_password(plain, hashed)`

### 💠 Data Hashing (for refresh tokens)

* `hash_data(data)`
* `verify_data(plain, hashed)`

### 💠 Access Token

Short-lived (15 minutes):

```
create_access_token({"sub": user.email})
```

### 💠 Refresh Token

Long-lived (7 days):

```
create_refresh_token({"sub": user.email})
```

### 💠 Authentication Dependency

`get_current_user()` validates an access token and loads the user.

This is used in protected routes:

```python
Depends(get_current_user)
```


## 🧾 6. Schemas (`schemas/user.py`)

Pydantic models define request/response structures:

### **LoginRequest**

```
email
password
```

### **TokenResponse**

```
access_token
refresh_token
token_type
```

### **RefreshRequest**

```
refresh_token
```


## 🔄 7. Auth Routes (`auth/routes.py`)

Your auth system exposes **3 endpoints**:

---

### **1️⃣ Register**

`POST /auth/register`

Flow:

1. Check if user exists
2. Hash password
3. Create user
4. Save to DB
5. Return success message

---

### **2️⃣ Login**

`POST /auth/login`

Flow:

1. Validate email/password
2. Create **access token**
3. Create **refresh token**
4. Hash refresh token
5. Store hashed refresh token in DB
6. Return both tokens

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer"
}
```

---

### **3️⃣ Refresh Token**

`POST /auth/refresh`

Flow:

1. Decode refresh token using `REFRESH_SECRET_KEY`
2. Load user via `email = payload["sub"]`
3. Compare provided refresh token with stored hash
4. If valid → issue **new access token**
5. Do NOT issue new refresh token (unless you add rotation later)



## 🔁 8. Token Workflow

### Login generates:

* Access Token (15 mins)
* Refresh Token (7 days)

### Refresh generates:

* A new Access Token
* (Optional) A new Refresh Token — you currently do **not** rotate

### Logout (if implemented later) should:

* Remove `refresh_token_hash` from DB


## 🗄 9. Database & Alembic

To support refresh token storage, your migration adds:

```python
op.add_column('users', sa.Column('refresh_token_hash', sa.String(), nullable=True))
```

This matches your single `models.py` setup.


## 🔐 10. Protecting Routes

Any route can be protected using:

```python
@router.get("/profile")
def profile(user = Depends(get_current_user)):
    return user
```

If the access token is expired:

* User calls `/auth/refresh`
* Receives new access token
* Continues using API



## 🚀 11. Summary of System Capabilities

| Feature                          | Status |
| -------------------------------- | ------ |
| Email/password login             | ✅      |
| bcrypt password hashing          | ✅      |
| JWT access tokens                | ✅      |
| Refresh tokens                   | ✅      |
| Refresh endpoint                 | ✅      |
| Hashed refresh tokens in DB      | ✅      |
| Token expiration handling        | ✅      |
| OAuth2 password flow             | ✅      |
| Single `models.py` compatibility | ✅      |

Your authentication system is now **secure, scalable, and production-ready**.
