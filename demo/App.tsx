"use client";

/* 
Auth-flow-kit demo
- Page state controls UI
- Auth state restores UI after refresh
*/

import {
  AuthProvider,
  LoginScreen,
  SignupScreen,
  PasswordResetScreen,
  Protected,
  useAuth,
} from "../src";

import { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  return (
    <AuthProvider
      config={{
        baseURL: "http://localhost:10000",
        endpoints: {
          login: "/auth/login",
          signup: "/auth/signup",
          forgot: "/auth/forgot",
        },
      }}
    >
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("login");

  useEffect(() => {
    if (user) {
      setPage("dashboard");
    } else {
      setPage("login");
    }
  }, [user]);

  return (
    <div className="app-container">
      {page !== "dashboard" && (
        <div className="nav">
          <div
            onClick={() => setPage("login")}
            style={page === "login" ? activeStyle : inactiveStyle}
          >
            Login
          </div>

          <div
            onClick={() => setPage("signup")}
            style={page === "signup" ? activeStyle : inactiveStyle}
          >
            Signup
          </div>

          <div
            onClick={() => setPage("reset")}
            style={page === "reset" ? activeStyle : inactiveStyle}
          >
            Reset
          </div>
        </div>
      )}

      {page === "login" && <LoginScreen />}
      {page === "signup" && <SignupScreen />}
      {page === "reset" && <PasswordResetScreen />}

      {page === "dashboard" && (
        <Protected>
          <Dashboard onLogout={logout} />
        </Protected>
      )}
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h3>Dashboard</h3>

      {user ? (
        <>
          <p>
            Welcome <strong>{user.name}</strong> 🎉
          </p>
          <button onClick={onLogout}>Logout</button>
        </>
      ) : (
        <p>No user loaded.</p>
      )}
    </div>
  );
}

const activeStyle = {
  padding: "8px 16px",
  background: "linear-gradient(90deg, #5353aaff, #060f22ff)",
  color: "white",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
};

const inactiveStyle = {
  padding: "8px 16px",
  background: "#eee",
  color: "black",
  border: "1px solid #ccc",
  borderRadius: 6,
  cursor: "pointer",
};
