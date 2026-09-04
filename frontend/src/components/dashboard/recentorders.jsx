import { useEffect, useState } from "react";

import {
  Package,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";

function RecentOrders() {
  const [orders, setOrders] = useState([
    {
      id: "#2486",
      customer: "Rahul Sharma",
      amount: "₹2,400",
      status: "Completed",
      icon: <CheckCircle size={17} />,
      type: "green",
    },
    {
      id: "#2485",
      customer: "Priya Patel",
      amount: "₹1,800",
      status: "Processing",
      icon: <Clock size={17} />,
      type: "orange",
    },
    {
      id: "#2484",
      customer: "Aman Verma",
      amount: "₹3,200",
      status: "Shipped",
      icon: <Truck size={17} />,
      type: "blue",
    },
    {
      id: "#2483",
      customer: "Sneha Gupta",
      amount: "₹950",
      status: "Completed",
      icon: <Package size={17} />,
      type: "yellow",
    },
  ]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/dashboard")
      .then((res) => res.json())
      .then((data) => {
        if (
          data.recent_orders &&
          Array.isArray(data.recent_orders) &&
          data.recent_orders.length > 0
        ) {
          const iconList = [
            <CheckCircle size={17} />,
            <Clock size={17} />,
            <Truck size={17} />,
            <Package size={17} />,
          ];

          const typeList = [
            "green",
            "orange",
            "blue",
            "yellow",
          ];

          setOrders(
            data.recent_orders.map((order, index) => ({
              id:
                order.id ||
                order.order_id ||
                `#${index + 1}`,

              customer:
                order.customer ||
                order.customer_name ||
                "Customer",

              amount:
                order.amount ||
                order.revenue ||
                order.total ||
                "₹0",

              status:
                order.status ||
                "Completed",

              icon: iconList[index % iconList.length],

              type: typeList[index % typeList.length],
            }))
          );
        }
      })
      .catch(() => {
        // Keep demo orders if backend is unavailable
      });
  }, []);

  return (
    <div className="recent-orders-card">
      <div className="section-card-header">
        <div>
          <span className="chart-label">ORDERS</span>
          <h2>Recent Orders</h2>
        </div>

        <button className="view-all-button">
          View All
        </button>
      </div>

      <div className="recent-orders-list">
        {orders.map((order) => (
          <div
            key={order.id}
            className="recent-order-item"
          >
            <div className="recent-order-left">
              <div
                className={`order-status-icon ${order.type}`}
              >
                {order.icon}
              </div>

              <div>
                <h3>{order.id}</h3>
                <p>{order.customer}</p>
              </div>
            </div>

            <div className="recent-order-right">
              <strong>{order.amount}</strong>
              <span>{order.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentOrders;