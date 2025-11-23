import "../assets/styles/Saleschart.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { name: "Women's Clothing", value: 123 },
  { name: "Accessories", value: 321 },
  { name: "Men's Clothing", value: 456 },
  { name: "Footwear", value: 678 },
  { name: "Children's Clothing", value: 890 },
];

const COLORS = ["#0f172a", "#1e293b", "#2563eb", "#3b82f6", "#60a5fa"];

export default function SalesChart() {
  const totalProfit = "1,234,567";

  return (
    <div>
      <div className="chart-content">
        {/* Pie Chart */}
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend & Profit */}
        <div className="chart-right">
          <p className="profit-title">Total Profit</p>
          <h1 className="profit-value">{totalProfit}</h1>

          <ul className="category-list">
            {data.map((item, index) => (
              <li key={index}>
                <span
                  className="color-box"
                  style={{ backgroundColor: COLORS[index] }}
                ></span>
                {item.name}
                <span className="category-number">{item.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
