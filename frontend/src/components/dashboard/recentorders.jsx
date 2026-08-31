import {
  Package,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react";

function RecentOrders() {
  const orders = [
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
  ];

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