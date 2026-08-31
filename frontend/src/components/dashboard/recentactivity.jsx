import {
  ShoppingCart,
  UserPlus,
  FileText,
  TrendingUp,
} from "lucide-react";

function RecentActivity() {
  const activities = [
    {
      icon: <ShoppingCart size={17} />,
      title: "New order received",
      time: "2 min ago",
      type: "blue",
    },
    {
      icon: <UserPlus size={17} />,
      title: "Customer joined",
      time: "15 min ago",
      type: "green",
    },
    {
      icon: <TrendingUp size={17} />,
      title: "Revenue increased",
      time: "1 hour ago",
      type: "orange",
    },
    {
      icon: <FileText size={17} />,
      title: "Monthly report generated",
      time: "Today",
      type: "yellow",
    },
  ];

  return (
    <div className="recent-activity-card">
      <div className="section-card-header">
        <div>
          <span className="chart-label">ACTIVITY</span>
          <h2>Recent Activity</h2>
        </div>

        <span className="live-indicator">
          <span></span>
          Live
        </span>
      </div>

      <div className="recent-activity-list">
        {activities.map((item, index) => (
          <div
            key={index}
            className="recent-activity-item"
          >
            <div
              className={`recent-activity-icon ${item.type}`}
            >
              {item.icon}
            </div>

            <div className="recent-activity-content">
              <p className="recent-activity-name">
                {item.title}
              </p>

              <p className="recent-activity-time">
                {item.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentActivity;