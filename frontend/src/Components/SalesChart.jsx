  // src/Components/SalesChart.jsx
  import { useEffect, useState } from "react";
  import "../assets/styles/Saleschart.css";
  import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

  const COLORS = [
    "#0f172a",
    "#2563eb",
    "#3b82f6",
    "#06b6d4",
    "#10b981",
    "#84cc16",
    "#facc15",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#a855f7",
    "#6366f1",
  ];

  export default function SalesChart() {
    const [chartData, setChartData] = useState([]);
    const [totalProfit, setTotalProfit] = useState(0);
    const [filterMonth, setFilterMonth] = useState("all");
    const [filterDate, setFilterDate] = useState("");

    useEffect(() => {
      loadChartData();
    }, [filterMonth, filterDate]);

    const loadChartData = async () => {
      try {
        const res = await fetch("http://localhost:8081/sales");
        const sales = await res.json();

        let filtered = sales;

        if (filterMonth !== "all") {
          filtered = filtered.filter((s) => s.sale_date.startsWith(filterMonth));
        }

        if (filterDate) {
          filtered = filtered.filter(
            (s) => s.sale_date.split(" ")[0] === filterDate
          );
        }

        let categories = {};
        let total = 0;

        filtered.forEach((item) => {
          total += item.subtotal;

          if (!categories[item.category]) categories[item.category] = 0;
          categories[item.category] += item.subtotal;
        });

        setTotalProfit(total);

        const formatted = Object.entries(categories).map(([name, value]) => ({
          name,
          value,
        }));

        setChartData(formatted);
      } catch (err) {
        console.log("Chart Load Error:", err);
      }
    };

    return (
      <div className="saleschart-container">
        {/* FILTERS ROW */}
        <div className="chart-filters-row">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="chart-select"
          >
            <option value="all">All Months</option>
            <option value="2025-01">January</option>
            <option value="2025-02">February</option>
            <option value="2025-03">March</option>
            <option value="2025-04">April</option>
            <option value="2025-05">May</option>
            <option value="2025-06">June</option>
            <option value="2025-07">July</option>
            <option value="2025-08">August</option>
            <option value="2025-09">September</option>
            <option value="2025-10">October</option>
            <option value="2025-11">November</option>
            <option value="2025-12">December</option>
          </select>

          <input
            type="date"
            className="chart-date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        {/* CHART + LEGEND */}
        <div className="chart-main">
          {/* LEFT PIE CHART */}
          <div className="pie-wrapper">
            <ResponsiveContainer width="100%" height={290}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* RIGHT LEGEND & TOTAL PROFIT */}
          <div className="legend-wrapper">
            <p className="profit-label">Total Profit</p>
            <h1 className="profit-value">₱{totalProfit.toLocaleString()}</h1>

            {/* SCROLLABLE LEGEND */}
            <div className="category-scroll">
              {chartData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span
                    className="legend-color"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></span>

                  <span className="legend-name">{item.name}</span>

                  <span className="legend-amount">
                    ₱{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
