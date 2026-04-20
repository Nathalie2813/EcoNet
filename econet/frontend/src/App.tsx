import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

export default function App() {
  const [user, setUser] = useState(
    localStorage.getItem("user") || ""
  );

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return <Dashboard />;
}