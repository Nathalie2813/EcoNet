import { useEffect, useState } from "react";
import CarteStat from "../components/CarteStat";
import Graphique from "../components/Graphique";

// algo
const calculerMeilleurMoment = (data: number[]): string => {
  if (data.length === 0) return "Pas de données";

  const moyenne = data.reduce((a, b) => a + b, 0) / data.length;
  const heures = ["00h", "03h", "06h", "09h", "12h", "15h", "18h", "21h"];

  const momentsFaibles = data
    .map((val, i) => (val < moyenne ? heures[i % heures.length] : null))
    .filter((val): val is string => val !== null);

  return momentsFaibles.length > 0
    ? momentsFaibles.join(" - ")
    : "Pas de recommandation";
};

export default function Dashboard() {

  // user (cloud)
  const USER = localStorage.getItem("user") || "guest";

  // limite
  const LIMITE_MENSUELLE = 1000;

  // State
  const [vitesse, setVitesse] = useState<string>("Calcul...");
  const [historique, setHistorique] = useState<number[]>(() => {
    const stored = localStorage.getItem("econet_data");
    return stored ? JSON.parse(stored) : [];
  });

  // notification
  const notifier = (message: string) => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      new Notification(message);
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(message);
        }
      });
    }
  };

  // save cloud
  const sauvegarderCloud = async (data: number[]) => {
    await fetch("http://localhost:5000/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: USER,
        data: data,
      }),
    }).catch((err) =>
      console.error("Erreur Cloud:", err)
    );
  };

  // test vitesse
  useEffect(() => {
    let isMounted = true;

    const testerVitesse = () => {
      const image = new Image();
      const start = Date.now();

      image.src = "https://via.placeholder.com/1000x1000?cache=" + start;

      image.onload = () => {
        if (!isMounted) return;

        const duration = (Date.now() - start) / 1000;
        const tailleBits = 1000 * 1000 * 8;
        const vitesseKbps = (tailleBits / duration) / 1024;

        setVitesse(vitesseKbps.toFixed(2) + " kb/s");
      };
    };

    testerVitesse();
    return () => { isMounted = false };
  }, []);

  // load cloud
  useEffect(() => {
    fetch(`http://localhost:5000/data/${USER}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          setHistorique(data);
          localStorage.setItem("econet_data", JSON.stringify(data));
        }
      })
      .catch((err) =>
        console.error("Erreur serveur:", err)
      );
  }, []);

  // ajout data
  const ajouterData = () => {
    let base = 50;
    const heure = new Date().getHours();

    if (heure >= 0 && heure <= 6) base = 10;
    if (heure >= 7 && heure <= 12) base = 40;
    if (heure >= 13 && heure <= 18) base = 70;
    if (heure >= 19 && heure <= 23) base = 120;

    const variation = Math.random() * 30;
    const nouvelleValeur = Math.floor(base + variation);

    const nouveau = [...historique, nouvelleValeur];
    if (nouveau.length > 7) nouveau.shift();

    setHistorique(nouveau);
    localStorage.setItem("econet_data", JSON.stringify(nouveau));

    // save cloud
    sauvegarderCloud(nouveau);

    // notification
    const total = nouveau.reduce((a, b) => a + b, 0);
    const pourcentage = (total / LIMITE_MENSUELLE) * 100;

    if (pourcentage >= 100) {
      notifier("🔥 Limite dépassée !");
    } else if (pourcentage >= 80) {
      notifier("⚠️ Bientôt limite atteinte");
    }
  };

  // reset
  const resetData = () => {
    localStorage.removeItem("econet_data");
    setHistorique([]);
    sauvegarderCloud([]);
  };

  // Logique
  const meilleurMoment = calculerMeilleurMoment(historique);

  const calculerAlerte = (data: number[]) => {
    if (data.length === 0) return "Pas de données";

    const moyenne = data.reduce((a, b) => a + b, 0) / data.length;
    const today = data[data.length - 1];

    if (today > moyenne * 1.5) return "🔥 Très élevé";
    if (today > moyenne) return "⚠️ Élevé";
    return "✅ Normal";
  };

  const alerte = calculerAlerte(historique);

  const total = historique.reduce((a, b) => a + b, 0);
  const pourcentage = (total / LIMITE_MENSUELLE) * 100;

  const messageLimite = () => {
    if (pourcentage >= 100) return "🔥 Limite dépassée";
    if (pourcentage >= 80) return "⚠️ Attention limite";
    return "✅ OK";
  };

  const prediction = () => {
    if (historique.length === 0) return "Pas de données";

    const moyenne = total / historique.length;
    const joursRestants = 30 - historique.length;

    return (total + moyenne * joursRestants).toFixed(0) + " MB";
  };

  const data = {
    today: total + " MB",
  };

  // UI
  return (
  <div style={{
    padding: "20px",
    maxWidth: "420px",
    margin: "auto",
    background: "#020617",
    minHeight: "100vh",
    color: "white"
  }}>
      <h1>EcoNet Dashboard</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        <CarteStat titre="Data aujourd'hui" valeur={data.today} />
        <CarteStat titre="Vitesse" valeur={vitesse} />
        <CarteStat titre="Alerte" valeur={alerte} />
      </div>

      <Graphique data={historique} />

      <p style={{ marginTop: "15px" }}>
        📥 Meilleur moment : {meilleurMoment}
      </p>

      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <p>📅 {total} / {LIMITE_MENSUELLE} MB</p>
        <p>📊 {pourcentage.toFixed(1)}%</p>
        <p>{messageLimite()}</p>
        <p>📈 Prévision : {prediction()}</p>

        <div style={{
          height: "10px",
          background: "#ddd",
          borderRadius: "10px",
          overflow: "hidden",
          marginTop: "10px"
        }}>
          <div style={{
            width: `${Math.min(pourcentage, 100)}%`,
            background: pourcentage > 80 ? "red" : "green",
            height: "100%"
          }} />
        </div>
      </div>

      <button onClick={ajouterData} style={btnGreen}>
        Ajouter consommation
      </button>

      <button onClick={resetData} style={btnRed}>
        Reset data
      </button>
    </div>
  );
}

const btnGreen = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#22c55e",
  color: "white",
  cursor: "pointer",
  width: "100%",
};

const btnRed = {
  ...btnGreen,
  background: "red",
};