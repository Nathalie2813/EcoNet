import { useEffect, useState } from "react";
import CarteStat from "../components/CarteStat";
import Graphique from "../components/Graphique";

// 🧠 ALGORITHME
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

  // 📊 STATE
  const [vitesse, setVitesse] = useState<string>("Calcul...");
  const [historique, setHistorique] = useState<number[]>(() => {
    const stored = localStorage.getItem("econet_data");
    return stored ? JSON.parse(stored) : [];
  });

  // 📶 TEST VITESSE
// 📶 TEST VITESSE (Garde celui-là intact !)
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

  // ☁️ CHARGEMENT DES DONNÉES CLOUD (Ajoute celui-ci ici !)
  useEffect(() => {
    fetch("http://localhost:5000/data")
      .then(res => res.json())
      .then(data => {
        // Si le serveur renvoie des données, on met à jour l'historique
        if (data && data.length > 0) {
          setHistorique(data);
          // Optionnel : tu peux aussi mettre à jour le localStorage pour qu'il soit synchro
          localStorage.setItem("econet_data", JSON.stringify(data));
        }
      })
      .catch(err => console.error("Erreur de connexion au serveur:", err));
  }, []);

  // ➕ AJOUT DATA
 const ajouterData = () => {
   // eslint-disable-next-line react-hooks/purity
  const nouvelleValeur = Math.floor(Math.random() * 100);
  const nouveau = [...historique, nouvelleValeur];

  if (nouveau.length > 7) nouveau.shift();

  // ✅ Calcul AVANT mise à jour
  const total = nouveau.reduce((a, b) => a + b, 0);
  const pourcentage = (total / 1000) * 100;

  // 🔔 NOTIFICATION ICI
  if (pourcentage >= 80) {
    notifier("⚠️ Attention : tu approches la limite !");
  }

  setHistorique(nouveau);
  localStorage.setItem("econet_data", JSON.stringify(nouveau));

  sauvegarderCloud(nouveau);
};


  // 🔄 RESET
  const resetData = () => {
    localStorage.removeItem("econet_data");
    setHistorique([]);
  };

  // 🧠 LOGIQUES
  const meilleurMoment = calculerMeilleurMoment(historique);

  const calculerAlerte = (data: number[]) => {
    if (data.length === 0) return "Pas de données";

    const moyenne = data.reduce((a, b) => a + b, 0) / data.length;
    const today = data[data.length - 1];

    if (today > moyenne * 1.5) return "🔥 Consommation très élevée";
    if (today > moyenne) return "⚠️ Consommation au-dessus";
    return "✅ Consommation normale";
  };

  const alerte = calculerAlerte(historique);

  // 📅 LIMITE
  const LIMITE_MENSUELLE = 1000;
  const total = historique.reduce((a, b) => a + b, 0);
  const pourcentage = (total / LIMITE_MENSUELLE) * 100;

  const messageLimite = () => {
    if (pourcentage >= 100) return "🔥 Limite dépassée !";
    if (pourcentage >= 80) return "⚠️ Bientôt limite atteinte";
    return "✅ OK";
  };

  const prediction = () => {
    if (historique.length === 0) return "Pas de données";

    const moyenne = total / historique.length;
    const joursRestants = 30 - historique.length;

    return (total + moyenne * joursRestants).toFixed(0) + " MB";
  };

  // 📦 DATA UI
  const data = {
    today: total + " MB",
  };

const notifier = (message: string) => {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(message);
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification(message);
      }
    });
  }
};

const sauvegarderCloud = async (data: number[]) => {
  await fetch("http://localhost:5000/save", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });
};

  // 🖥️ UI
  return (
    <div style={{
      padding: "20px",
      maxWidth: "400px",
      margin: "auto"
    }}>
      <h1>EcoNet Dashboard</h1>

      {/* 📊 STATS */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginTop: "20px"
      }}>
        <CarteStat titre="Data aujourd'hui" valeur={data.today} />
        <CarteStat titre="Vitesse" valeur={vitesse} />
        <CarteStat titre="Alerte" valeur={alerte} />
      </div>

      {/* 📈 GRAPHIQUE */}
      <Graphique data={historique} />

      {/* 🧠 RECO */}
      <p style={{ marginTop: "15px" }}>
        📥 Meilleur moment : {meilleurMoment}
      </p>

      {/* 📅 INFOS */}
      <div style={{ marginTop: "15px", textAlign: "center" }}>
        <p>📅 Total : {total} / {LIMITE_MENSUELLE} MB</p>
        <p>📊 {pourcentage.toFixed(1)}%</p>
        <p>{messageLimite()}</p>
        <p>📈 Prévision : {prediction()}</p>

        {/* barre */}
        <div style={{
          height: "10px",
          background: "#ddd",
          borderRadius: "10px",
          overflow: "hidden",
          marginTop: "10px"
        }}>
          <div style={{
            width: `${pourcentage}%`,
            background: pourcentage > 80 ? "red" : "green",
            height: "100%"
          }} />
        </div>
      </div>

      {/* ➕ */}
      <button onClick={ajouterData} style={btnGreen}>
        Ajouter consommation
      </button>

      {/* 🔄 */}
      <button onClick={resetData} style={btnRed}>
        Reset data
      </button>

    </div>
  );
}

// 🎨 styles boutons
const btnGreen = {
  marginTop: "10px",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#22c55e",
  color: "white",
  cursor: "pointer",
  width: "100%"
};

const btnRed = {
  ...btnGreen,
  background: "red"
};