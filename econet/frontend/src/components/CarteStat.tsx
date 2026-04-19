type Props = {
  titre: string;
  valeur: string;
};

export default function CarteStat({ titre, valeur }: Props) {

  const getColor = () => {
    if (valeur.includes("🔥")) return "#dc2626"; // rouge
    if (valeur.includes("⚠️")) return "#f59e0b"; // orange
    return "#16a34a"; // vert
  };

  return (
    <div style={{
      background: "#1e293b",
      color: "white",
      padding: "20px",
      borderRadius: "16px",
      textAlign: "center",
      boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
    }}>
      <h3>{titre}</h3>
      <p style={{
        fontSize: "20px",
        fontWeight: "bold",
        color: getColor()
      }}>
        {valeur}
      </p>
    </div>
  );
}