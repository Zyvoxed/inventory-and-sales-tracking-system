import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../assets/styles/SalesChart.css";

const data = [
  { name: "Men's Clothing", sales: 4000 },
  { name: "Women's Clothing", sales: 3000 },
  { name: "Accessories", sales: 2000 },
  { name: "Footwear", sales: 2780 },
  { name: "Children's Clothing", sales: 1890 },
  { name: "Others", sales: 2390 },
];

export default function SalesChart() {
  return (
    <div className="sales-chart">
      <h4>Sales by Category</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill="#3498db" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
