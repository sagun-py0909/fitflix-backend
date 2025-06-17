```markdown
# Fitflix Backend API Documentation

### Base URL

`https://fitflix-backend-rym0.onrender.com/api`

---

## Authentication

All endpoints under `/admin`, `/user`, and other protected modules require a valid JWT in the `Authorization` header:

```

Authorization: Bearer \<your\_jwt\_token>

````

---

## 1. Admin Module

### 1.1 Gym Management

- **Create Gym**  
  `POST /admin/gyms`  
  **Body**

  ```json
  {
    "name": "Fitflix Downtown",
    "address": "123 Main St, Hyderabad, India",
    "phone_number": "+91-9876543210",
    "email": "downtown@fitflix.com",
    "open_time": "2025-06-01T06:00:00Z",
    "close_time": "2025-06-01T22:00:00Z"
  }
````

* **Get All Gyms**
  `GET /admin/gyms`

* **Get Gym By ID**
  `GET /admin/gyms/:gymId`

* **Update Gym**
  `PUT /admin/gyms/:gymId`

* **Delete Gym**
  `DELETE /admin/gyms/:gymId`

---

### 1.2 Staff Management

* **Create Staff**
  `POST /admin/staff`
  **Body**

  ```json
  {
    "email": "jane.smith@example.com",
    "password": "StrongPass!23",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "+91-9000000000",
    "user_profile": { /* profile fields */ },
    "name": "Jane Smith",
    "staff_type": "manager",
    "bio": "Expert fitness manager",
    "photo_url": "https://...",
    "gym_id": "373cc6e5-42d1-4eb3-882d-d0a2fec10194"
  }
  ```

* **Get All Staff**
  `GET /admin/staff`

* **Get Staff By ID**
  `GET /admin/staff/:staffId`

* **Update Staff**
  `PUT /admin/staff/:staffId`

* **Delete Staff**
  `DELETE /admin/staff/:staffId`

---

### 1.3 Membership Type Management (Global Templates)

* **Create Membership Type**
  `POST /admin/membership-types`
  **Body**

  ```json
  {
    "name": "Standard Plan",
    "description": "Includes all group classes",
    "price": 4999,
    "duration_months": 1
  }
  ```

* **Get All Membership Types**
  `GET /admin/membership-types`

* **Get Membership Type By ID**
  `GET /admin/membership-types/:typeId`

* **Update Membership Type**
  `PUT /admin/membership-types/:typeId`

* **Delete Membership Type**
  `DELETE /admin/membership-types/:typeId`

---

### 1.4 Memberships by Gym

* **Create Membership for a Gym**
  `POST /admin/gyms/:gymId/memberships`
  **Body**

  ```json
  {
    "name": "Gold Membership",
    "description": "Access to all equipment and classes",
    "price_rupees": 2500,
    "duration_days": 30
  }
  ```

* **Get All Memberships for a Gym**
  `GET /admin/gyms/:gymId/memberships`

* **Get Specific Membership by ID**
  `GET /admin/gyms/:gymId/memberships/:membershipId`

* **Update Membership for a Gym**
  `PUT /admin/gyms/:gymId/memberships/:membershipId`
  **Body** (any of the create fields + `status`)

* **Soft Delete Membership**
  `DELETE /admin/gyms/:gymId/memberships/:membershipId`

---

### 1.5 Analytics

* **Total Users**
  `GET /admin/analytics/total-users`

* **Total Revenue**
  `GET /admin/analytics/total-revenue`

* **Total Check-ins**
  `GET /admin/analytics/total-checkins`

---

## 2. Authentication Module

* **Login**
  `POST /auth/login`
  **Body**

  ```json
  {
    "email": "john.doe@example.com",
    "password": "SecurePass123"
  }
  ```

---

## 3. User Module

### 3.1 User Profile

* **Get Profile**
  `GET /user/profile`

* **Update Profile**
  `PUT /user/profile`
  **Body**

  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "date_of_birth": "1990-05-15",
    "gender": "male",
    "address": "123 Elm Street",
    "phone_number": "+91-9123456780",
    "emergency_contact_name": "Jane Doe",
    "emergency_contact_number": "+91-9988776655",
    "medical_conditions": "none",
    "goals": "muscle gain",
    "lifestyle": "active",
    "food_preferences": "vegetarian"
  }
  ```

---

## 4. Gym Types Module

* **Create Gym Type**
  `POST /admin/gym-types`
  **Body**

  ```json
  { "name": "Premium" }
  ```

* **Get All Gym Types**
  `GET /admin/gym-types`

* **Get Gym Type By ID**
  `GET /admin/gym-types/:typeId`

* **Update Gym Type**
  `PUT /admin/gym-types/:typeId`
  **Body**

  ```json
  { "name": "Standard" }
  ```

* **Delete Gym Type**
  `DELETE /admin/gym-types/:typeId`

---

*End of `api.md`.*

```

