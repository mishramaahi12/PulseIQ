import { useEffect, useState } from "react";
import {
  IndianRupee,
  ShoppingBag,
  Users,
  TrendingUp,
} from "lucide-react";

function StatsCards() {
  const [stats, setStats] = useState({
    revenue: "12.4L",
    orders: 2486,
    customers: 8942,
    growth: "32%",
  });

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  }, []);

  const cards = [
    {
      title: "Revenue",
      value: `₹${stats.revenue}`,
      change: "+18.4%",
      icon: IndianRupee,
    },
    {
      title: "Orders",
      value: stats.orders.toLocaleString(),
      change: "+12.8%",
      icon: ShoppingBag,
    },
    {
      title: "Customers",
      value: stats.customers.toLocaleString(),
      change: "+9.2%",
      icon: Users,
    },
    {
      title: "Growth",
      value: stats.growth,
      change: "This month",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="stats-grid">

      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="stat-card hover-lift"
          >

            <div className="stat-top">
              <div className="stat-icon">
                <Icon size={20} />
              </div>

              <span className="stat-change">
                {card.change}
              </span>
            </div>

            <p>{card.title}</p>

            <h2>{card.value}</h2>

          </div>
        );
      })}

    </div>
  );
}

export default StatsCards;