type Props = {
  titre: string;
  valeur: string;
};

export default function CarteStat({ titre, valeur }: Props) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0f172a, #1e293b)",
      color: "white",
      padding: "20px",
      borderRadius: "20px",
      textAlign: "center",
      boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
      transition: "transform 0.2s"
    }}>
      <h3 style={{ opacity: 0.7 }}>{titre}</h3>

      <p style={{
        fontSize: "24px",
        fontWeight: "bold",
        marginTop: "10px"
      }}>
        {valeur}
      </p>
    </div>
  );
}