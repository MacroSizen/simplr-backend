# Postman Testing Guide for Categories API

This guide will help you test the Categories API endpoints locally using Postman.

## Step 1: Get an Access Token

First, you need to authenticate and get an access token.

### Login Request

**Method:** `POST`  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "user": {
    "id": "...",
    "email": "..."
  }
}
```

**Copy the `access_token` value** - you'll need it for all subsequent requests.

---

## Step 2: Test Categories Endpoints

For all the following requests, you need to include the Authorization header:

**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json
```

### 1. List All Categories

**Method:** `GET`  
**URL:** `http://localhost:3000/api/categories`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
[
  {
    "id": "uuid-here",
    "user_id": "uuid-here",
    "name": "Food",
    "created_at": "2025-11-27T12:00:00.000Z"
  }
]
```

---

### 2. Create a Category

**Method:** `POST`  
**URL:** `http://localhost:3000/api/categories`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Food"
}
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "user_id": "uuid-here",
  "name": "Food",
  "created_at": "2025-11-27T12:00:00.000Z"
}
```

---

### 3. Update a Category

**Method:** `PUT`  
**URL:** `http://localhost:3000/api/categories/{category-id}`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "Groceries"
}
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "user_id": "uuid-here",
  "name": "Groceries",
  "created_at": "2025-11-27T12:00:00.000Z"
}
```

---

### 4. Delete a Category

**Method:** `DELETE`  
**URL:** `http://localhost:3000/api/categories/{category-id}`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
```

**Expected Response:**
```json
{
  "success": true
}
```

---

## Step 3: Test Creating an Expense with Category

**Method:** `POST`  
**URL:** `http://localhost:3000/api/expenses`  
**Headers:**
```
Authorization: Bearer YOUR_ACCESS_TOKEN_HERE
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "categoryId": "uuid-of-category-here",
  "amount": 25.50,
  "description": "Lunch at restaurant"
}
```

**Expected Response:**
```json
{
  "id": "uuid-here",
  "user_id": "uuid-here",
  "category_id": "uuid-of-category-here",
  "category": null,
  "amount": 25.50,
  "description": "Lunch at restaurant",
  "date": "2025-11-27T12:00:00.000Z",
  "created_at": "2025-11-27T12:00:00.000Z"
}
```

---

## Tips for Postman

1. **Save the access token as an environment variable:**
   - Create a new environment in Postman
   - Add a variable called `access_token`
   - After logging in, manually copy the token and paste it into the variable
   - Use `{{access_token}}` in the Authorization header

2. **Create a Postman Collection:**
   - Save all these requests in a collection
   - Set the Authorization at the collection level to avoid repeating it

3. **Token Expiration:**
   - If you get a 401 error, your token may have expired
   - Login again to get a new access token

---

## Common Errors

### "Missing or invalid authorization header"
- Make sure you're including the `Authorization` header
- Format: `Bearer YOUR_TOKEN` (with a space after "Bearer")

### "Unauthorized"
- Your token may have expired
- Login again to get a fresh token

### "Validation error"
- Check your request body matches the expected format
- Make sure all required fields are included
