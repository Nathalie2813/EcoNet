import { useState } from "react";

// 1. On définit ce que le composant attend comme Props
interface LoginProps {
  onLogin: (name: string) => void;
}

// 2. On applique l'interface au lieu de "any"
export default function Login({ onLogin }: LoginProps) {
  const [name, setName] = useState("");

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      padding: "20px"
    }}>
      <h2>Connexion</h2>

      <input
        placeholder="Votre nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ padding: "10px", borderRadius: "10px" }}
      />

      <button
        onClick={() => {
          localStorage.setItem("user", name);
          onLogin(name);
        }}
        style={{
          padding: "10px",
          borderRadius: "10px",
          background: "#22c55e",
          color: "white",
          border: "none"
        }}
      >
        Se connecter
      </button>
    </div>
  );
}