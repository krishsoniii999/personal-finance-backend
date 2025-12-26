# Personal Finance Tracker - Frontend Development Guide

## Overview
This guide explains how to build a frontend application that connects to your Personal Finance Tracker backend API. The backend is running on `http://localhost:3001` and provides user authentication and transaction management.

## Backend API Endpoints

### Authentication Endpoints

#### 1. Sign Up (Create Account)
- **URL**: `POST http://localhost:3001/api/auth/signup`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
- **Response** (201 Created):
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```
- **Note**: User must confirm email before logging in

#### 2. Log In
- **URL**: `POST http://localhost:3001/api/auth/login`
- **Body**:
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```
- **Response** (200 OK):
```json
{
  "message": "Logged in successfully",
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt-token-here",
    "refresh_token": "refresh-token-here"
  }
}
```

#### 3. Get Current User
- **URL**: `GET http://localhost:3001/api/auth/user`
- **Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
- **Response** (200 OK):
```json
{
  "user": {
    "id": "uuid-here",
    "email": "user@example.com"
  }
}
```

#### 4. Log Out
- **URL**: `POST http://localhost:3001/api/auth/logout`
- **Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
- **Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

### Transaction Endpoints
**All transaction endpoints require authentication** - include the JWT token in the Authorization header.

#### 1. Get All Transactions
- **URL**: `GET http://localhost:3001/api/transactions`
- **Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
- **Response** (200 OK):
```json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "amount": 5000,
      "description": "Monthly salary",
      "transaction_type": "income",
      "category_id": null,
      "date": "2025-12-25",
      "created_at": "2025-12-25T10:30:00Z"
    }
  ]
}
```

#### 2. Create Transaction
- **URL**: `POST http://localhost:3001/api/transactions`
- **Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```
- **Body**:
```json
{
  "amount": 5000,
  "description": "Monthly salary",
  "transaction_type": "income",
  "category_id": null,
  "date": "2025-12-25"
}
```
- **Response** (201 Created):
```json
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": "uuid",
    "user_id": "uuid",
    "amount": 5000,
    "description": "Monthly salary",
    "transaction_type": "income",
    "date": "2025-12-25"
  }
}
```
- **Notes**:
  - `amount` is stored in cents (5000 = $50.00)
  - `transaction_type` must be either "income" or "expense"
  - `date` is optional (defaults to today)
  - `category_id` is optional

#### 3. Delete Transaction
- **URL**: `DELETE http://localhost:3001/api/transactions/:id`
- **Headers**:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```
- **Response** (200 OK):
```json
{
  "message": "Transaction deleted successfully"
}
```

## Frontend Implementation Guide

### Technology Recommendations
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context or Zustand
- **HTTP Client**: fetch API or axios

### Project Structure
```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Protected layout
│   │   ├── page.tsx             # Dashboard home
│   │   └── transactions/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AuthForm.tsx
│   ├── TransactionList.tsx
│   ├── TransactionForm.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts                   # API client functions
│   └── auth.ts                  # Auth helper functions
└── .env.local
```

### Environment Variables
Create `.env.local` in your frontend project:
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Authentication Flow

#### 1. Storing Tokens
After successful login/signup, store the access token:
```typescript
// Store in localStorage (simple approach)
localStorage.setItem('access_token', session.access_token);
localStorage.setItem('user', JSON.stringify(user));

// Or use a more secure approach with httpOnly cookies
```

#### 2. API Client Setup
Create `lib/api.ts`:
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = {
  // Auth methods
  async signup(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async logout(token: string) {
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  // Transaction methods
  async getTransactions(token: string) {
    const res = await fetch(`${API_URL}/api/transactions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async createTransaction(token: string, transaction: {
    amount: number;
    description?: string;
    transaction_type: 'income' | 'expense';
    date?: string;
  }) {
    const res = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transaction)
    });
    return res.json();
  },

  async deleteTransaction(token: string, id: string) {
    const res = await fetch(`${API_URL}/api/transactions/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  }
};
```

#### 3. Protected Routes
Create a layout that checks authentication:
```typescript
// app/(dashboard)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  return <div>{children}</div>;
}
```

### Example Components

#### Login Form
```typescript
// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await apiClient.login(email, password);

      if (data.error) {
        setError(data.error);
        return;
      }

      // Store token and user
      localStorage.setItem('access_token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to dashboard
      router.push('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <h2 className="text-3xl font-bold">Log In</h2>
        {error && <div className="text-red-500">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
```

#### Transaction List
```typescript
// components/TransactionList.tsx
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function TransactionList() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const data = await apiClient.getTransactions(token);
    setTransactions(data.transactions || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    await apiClient.deleteTransaction(token, id);
    loadTransactions(); // Reload list
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {transactions.map((txn: any) => (
        <div key={txn.id} className="border p-4 rounded flex justify-between">
          <div>
            <div className="font-bold">
              {txn.transaction_type === 'income' ? '+' : '-'}$
              {(txn.amount / 100).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">{txn.description}</div>
            <div className="text-xs text-gray-400">{txn.date}</div>
          </div>
          <button
            onClick={() => handleDelete(txn.id)}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}
```

#### Create Transaction Form
```typescript
// components/TransactionForm.tsx
'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api';

export default function TransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('access_token');
    if (!token) return;

    await apiClient.createTransaction(token, {
      amount: Math.round(parseFloat(amount) * 100), // Convert dollars to cents
      description,
      transaction_type: type,
    });

    // Reset form
    setAmount('');
    setDescription('');
    setType('expense');

    onSuccess(); // Callback to refresh transaction list
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded">
      <h3 className="text-xl font-bold">Add Transaction</h3>

      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          className="w-full p-2 border rounded"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount ($)</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Optional"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Add Transaction
      </button>
    </form>
  );
}
```

## Important Notes

### Money Handling
- Backend stores amounts as **integers in cents** (5000 = $50.00)
- Frontend should convert: `dollars * 100` when sending, `cents / 100` when displaying

### CORS
The backend has CORS enabled, so you can make requests from `http://localhost:3000` (Next.js default port)

### Token Management
- Access tokens are JWTs that expire
- Store securely (consider using httpOnly cookies for production)
- Include in Authorization header as: `Bearer YOUR_TOKEN`

### Error Handling
Always check for `error` property in API responses:
```typescript
const data = await apiClient.login(email, password);
if (data.error) {
  // Handle error
  console.error(data.error);
}
```

### Email Confirmation
- After signup, users must confirm email via Supabase link
- Session will be null until email is confirmed
- After confirmation, use the login endpoint

## Testing the API

You can test endpoints with curl:

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Get transactions (replace TOKEN)
curl http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create transaction
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":5000,"description":"Test","transaction_type":"income"}'
```

## Next Steps for Frontend Development

1. **Set up Next.js project**
   ```bash
   npx create-next-app@latest frontend
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file** (`.env.local`)

4. **Build authentication pages** (signup, login)

5. **Create dashboard layout** with protected routes

6. **Build transaction components** (list, form)

7. **Add styling** with Tailwind CSS

8. **Test the full flow**:
   - Sign up → Confirm email → Login → Add transaction → View transactions → Delete transaction

## Support
If you encounter any issues with the backend API, check:
- Backend server is running on http://localhost:3001
- Supabase credentials are correct in backend `.env`
- Token is included in Authorization header for protected routes
- Amount is in cents (multiply by 100)
