# @kendevelops/auth-flow-kit

A lightweight authentication toolkit for **React** and **Next.js 13–16 (App Router)** that extends beyond tools like **ReduxToolkit** and **Zustand** style global state management for authentication, as it also comes with prebuilt UI screens and a globally accessible `useAuth()` hook.

## ⭐ What This Library Really Is

**auth-flow-kit** is not a traditional backend-driven auth framework:

- Authentication state is global
- User + token are stored in localStorage
- State is restored automatically when the user refreshes the page
- No extra network calls are needed to reload the session
- You can access auth from _any component_:

```tsx
const { user, login, logout, getToken } = useAuth();
```

Plus, you get **prebuilt UI screens**:

- `<LoginScreen />`
- `<SignupScreen />`
- `<PasswordResetScreen />`

And a simple `<Protected>` wrapper to guard pages.

---

## 📦 Installation

```
npm install @kendevelops/auth-flow-kit
```

or

```
bun add @kendevelops/auth-flow-kit
```

---

# 🚀 Usage (Next.js App Router)

Next.js layouts are server components, so we wrap the provider in a small client component.

## 1. Create `app/AuthProviderClient.tsx`

```tsx
"use client";

import { AuthProvider } from "@kendevelops/auth-flow-kit";

export default function AuthProviderClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider
      config={{
        baseURL: "http://localhost:4000",
        endpoints: {
          login: "/auth/login",
          signup: "/auth/signup",
          forgot: "/auth/forgot",
        },
        onLoginSuccess: () => (window.location.href = "/dashboard"),
        onLogout: () => (window.location.href = "/login"),
      }}
    >
      {children}
    </AuthProvider>
  );
}
```

---

## 2. Wrap your app in `app/layout.tsx`

```tsx
import AuthProviderClient from "./AuthProviderClient";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProviderClient>{children}</AuthProviderClient>
      </body>
    </html>
  );
}
```

---

## 3. Login Page

```tsx
"use client";
import { LoginScreen } from "@kendevelops/auth-flow-kit";

export default function LoginPage() {
  return <LoginScreen />;
}
```

---

## 4. Signup Page

```tsx
"use client";
import { SignupScreen } from "@kendevelops/auth-flow-kit";

export default function SignupPage() {
  return <SignupScreen />;
}
```

---

## 5. Protected Dashboard Page

```tsx
"use client";
import { Protected, useAuth } from "@kendevelops/auth-flow-kit";

export default function DashboardPage() {
  return (
    <Protected>
      <Dashboard />
    </Protected>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      {user ? (
        <>
          <p>Logged in as {user.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>No user loaded.</p>
      )}
    </div>
  );
}
```

---

# 🧠 Developer Experience (DX)

Because auth behaves like a global store, you can access it anywhere:

```tsx
const { user, login, logout, getToken, loading } = useAuth();
```

This means:

### ✔ Global state, just like Redux or Zustand

### ✔ No need for reducers, slices, or stores

### ✔ No extra setup

### ✔ No API calls on refresh — state is restored instantly

Your UI automatically updates when the user logs in, signs up, or logs out.

---

# 🔒 Protecting Routes and Components

```tsx
<Protected>
  <SecretSection />
</Protected>
```

If the user is not authenticated, they are redirected to `/login`.

---

# 📄 Using `useAuth()` in any component

```tsx
"use client";
import { useAuth } from "@kendevelops/auth-flow-kit";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      {user ? (
        <>
          <span>Hi {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </nav>
  );
}
```

---

# 🌐 React (Non-Next.js) Usage

```tsx
import { AuthProvider, LoginScreen } from "@kendevelops/auth-flow-kit";

export default function App() {
  return (
    <AuthProvider
      config={{
        baseURL: "http://localhost:4000",
        endpoints: {
          login: "/auth/login",
          signup: "/auth/signup",
          forgot: "/auth/forgot",
        },
      }}
    >
      <LoginScreen />
    </AuthProvider>
  );
}
```

---

# 🎉 Summary

**auth-flow-kit** provides:

- Global auth state (Redux/Zustand style)
- Prebuilt auth UI (Login, Signup, Reset)
- Easy `useAuth()` hook access
- Simple endpoint requirements
- Works in both Next.js and React

A clean, modern solution for developers who want authentication without complexity.

---
