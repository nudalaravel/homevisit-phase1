# API Standalone Server

## การแยก API Server ออกจาก Nuxt

API Server ถูกแยกออกมารันแยกต่างหากจาก Nuxt frontend เพื่อ:

- ✅ ความยืดหยุ่นในการพัฒนา
- ✅ Scale ได้แยกกัน
- ✅ Deploy แยกกันได้
- ✅ Debug ง่ายขึ้น

---

## Configuration

### Port Configuration

**Frontend (Nuxt):**

- Default Port: `3300`
- URL: `http://localhost:3300`

**Backend (API):**

- Default Port: `3001`
- URL: `http://localhost:3001`

### Environment Variables

แก้ไขในไฟล์ `.env`:

```bash
# Frontend Server (Nuxt)
PORT=3300
HOST=0.0.0.0

# API Server (Express)
API_PORT=3001
API_HOST=0.0.0.0
API_BASE_URL=http://localhost:3001

# Enable/Disable Cache
ENABLE_CACHE=false
```

---

## วิธีการรัน

### 1. รัน API Server อย่างเดียว

```bash
npm run api
```

Output:

```
🚀 API Server running at http://0.0.0.0:3001
📡 Endpoints:
   - POST http://0.0.0.0:3001/auth/login
   - POST http://0.0.0.0:3001/auth/logout
   - GET  http://0.0.0.0:3001/auth/user
   - GET  http://0.0.0.0:3001/dashboard
   - GET  http://0.0.0.0:3001/dashboard/stats
   - GET  http://0.0.0.0:3001/dashboard/orders
   - GET  http://0.0.0.0:3001/dashboard/chart
```

### 2. รัน Nuxt Frontend อย่างเดียว

```bash
npm run dev
```

Frontend จะรันที่: `http://localhost:3300`

### 3. รันทั้งสองพร้อมกัน (แนะนำ)

```bash
npm run dev:all
```

จะรัน:

- 🔵 **API**: `http://localhost:3001`
- 🟢 **NUXT**: `http://localhost:3300`

Output ตัวอย่าง:

```
[API]   🚀 API Server running at http://0.0.0.0:3001
[NUXT]  ℹ Listening on: http://localhost:3300/
```

---

## API Endpoints

### Authentication

#### POST /auth/login

เข้าสู่ระบบ

**Request:**

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Response:**

```json
{
  "token": "mock-jwt-token-1",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@riper.com",
    "role": "admin",
    "name": "Administrator"
  }
}
```

#### POST /auth/logout

ออกจากระบบ

**Request:**

```bash
curl -X POST http://localhost:3001/auth/logout
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/user

ดึงข้อมูลผู้ใช้ปัจจุบัน

**Request:**

```bash
curl -X GET http://localhost:3001/auth/user \
  -H "Authorization: Bearer mock-jwt-token-1"
```

**Response:**

```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@riper.com",
    "role": "admin",
    "name": "Administrator"
  }
}
```

### Dashboard

#### GET /dashboard

ดึงข้อมูล dashboard ทั้งหมด

**Request:**

```bash
curl -X GET http://localhost:3001/dashboard
```

**Response:**

```json
{
  "stats": {
    "totalUsers": 1250,
    "totalOrders": 3420,
    "totalRevenue": 125000,
    "totalProducts": 89
  },
  "recentOrders": [...],
  "chartData": {...}
}
```

#### GET /dashboard/stats

ดึงสถิติ

**Request:**

```bash
curl -X GET http://localhost:3001/dashboard/stats
```

**Response:**

```json
{
  "totalUsers": 1250,
  "totalOrders": 3420,
  "totalRevenue": 125000,
  "totalProducts": 89
}
```

#### GET /dashboard/orders

ดึงรายการคำสั่งซื้อ

**Request:**

```bash
curl -X GET http://localhost:3001/dashboard/orders
```

**Response:**

```json
[
  {
    "id": 1,
    "customer": "John Doe",
    "amount": 299.99,
    "status": "completed",
    "date": "2024-01-15"
  },
  ...
]
```

#### GET /dashboard/chart

ดึงข้อมูลกราฟ

**Request:**

```bash
curl -X GET http://localhost:3001/dashboard/chart
```

**Response:**

```json
{
  "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  "datasets": [
    {
      "label": "Revenue",
      "data": [12000, 19000, 15000, 25000, 22000, 30000],
      "borderColor": "rgb(75, 192, 192)",
      "backgroundColor": "rgba(75, 192, 192, 0.2)"
    }
  ]
}
```

---

## CORS Configuration

API Server มี CORS enabled สำหรับทุก origins:

```javascript
app.use(cors());
```

หากต้องการจำกัด origins:

```javascript
// แก้ไขใน api/index.js
app.use(
  cors({
    origin: ["http://localhost:3300", "http://localhost:3000"],
    credentials: true,
  })
);
```

---

## การทดสอบ

### 1. ทดสอบ API ด้วย Browser

เปิดเบราว์เซอร์:

```
http://localhost:3001/dashboard
```

### 2. ทดสอบด้วย curl

```bash
# Test dashboard
curl http://localhost:3001/dashboard

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. ทดสอบด้วย Postman

Import collection:

- Base URL: `http://localhost:3001`
- Endpoints: ตามที่ระบุด้านบน

---

## การแก้ปัญหา

### ปัญหา: CORS Error

**สาเหตุ:** Frontend และ API รันคนละ port

**วิธีแก้:**

- ตรวจสอบว่า API มี `cors` middleware
- ตรวจสอบว่า `API_BASE_URL` ใน `.env` ถูกต้อง

### ปัญหา: Connection Refused

**สาเหตุ:** API Server ไม่ได้รัน

**วิธีแก้:**

```bash
# ตรวจสอบว่า API รันอยู่
lsof -i :3001

# รัน API
npm run api
```

### ปัญหา: Port Already in Use

**วิธีแก้:**

```bash
# หยุด process ที่ใช้ port
lsof -ti:3001 | xargs kill -9

# หรือเปลี่ยน port ในไฟล์ .env
API_PORT=3002
```

### ปัญหา: Frontend ไม่เชื่อมต่อ API

**ตรวจสอบ:**

1. API_BASE_URL ใน `.env`:

   ```bash
   API_BASE_URL=http://localhost:3001
   ```

2. Axios config ใน `nuxt.config.js`:

   ```javascript
   axios: {
     baseURL: process.env.API_BASE_URL || "http://localhost:3001",
   }
   ```

3. Restart ทั้ง API และ Frontend:
   ```bash
   npm run dev:all
   ```

---

## Demo Users

### Admin

- Username: `admin`
- Password: `admin123`

### Regular User

- Username: `user`
- Password: `user123`

---

## npm Scripts สรุป

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run api`       | รัน API Server อย่างเดียว (port 3001)    |
| `npm run dev`       | รัน Nuxt Frontend อย่างเดียว (port 3300) |
| `npm run dev:all`   | รันทั้ง API และ Frontend พร้อมกัน        |
| `npm run dev:cache` | รัน Nuxt with cache enabled              |
| `npm run build`     | Build for production                     |
| `npm start`         | Start production server                  |

---

## Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Frontend (Nuxt)   │ ◄─────► │   Backend (API)     │
│   Port: 3300        │  HTTP   │   Port: 3001        │
│   Vue.js SPA        │         │   Express Server    │
└─────────────────────┘         └─────────────────────┘
         │                               │
         │                               │
         ▼                               ▼
    IndexedDB                        Mock Data
   (Browser Storage)              (In-Memory Arrays)
```

---

## Next Steps

### สำหรับ Production:

1. **แยก Environment:**

   ```bash
   # Development
   API_BASE_URL=http://localhost:3001

   # Production
   API_BASE_URL=https://api.yourdomain.com
   ```

2. **เพิ่ม Authentication:**

   - JWT token validation
   - Refresh token
   - Session management

3. **เพิ่ม Database:**

   - MongoDB
   - PostgreSQL
   - MySQL

4. **เพิ่ม Features:**
   - Rate limiting
   - Request logging
   - Error handling middleware
   - API documentation (Swagger)

---

## ✅ สรุป

ตอนนี้โปรเจคมี:

- ✅ API Server แยกต่างหาก (port 3001)
- ✅ Frontend Nuxt (port 3300)
- ✅ CORS enabled
- ✅ Mock authentication
- ✅ Mock dashboard data
- ✅ รันทั้งสองพร้อมกันได้ด้วย `npm run dev:all`

**รันด้วย:**

```bash
npm run dev:all
```

**เข้าใช้งาน:**

- Frontend: http://localhost:3300
- API: http://localhost:3001
