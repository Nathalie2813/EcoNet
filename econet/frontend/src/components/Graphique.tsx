import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

// 👇 recevoir les données depuis Dashboard
type Props = {
  data: number[];
};

export default function Graphique({ data }: Props) {

  const labels = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  const chartData = {
    labels: labels.slice(-data.length), // adapte à la taille
    datasets: [
      {
        label: "Consommation (MB)",
        data: data,
        borderColor: "cyan",
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ width: "100%", marginTop: "30px" }}>
      <Line data={chartData} />
    </div>
  );
}