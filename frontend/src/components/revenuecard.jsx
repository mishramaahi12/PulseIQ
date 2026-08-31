import { TrendingUp, IndianRupee } from "lucide-react";

function RevenueCard() {
  return (
    <div className="revenue-card">
      <div className="revenue-card-top">
        <div className="revenue-card-icon">
          <IndianRupee size={19} />
        </div>

        <span className="revenue-card-growth">
          <TrendingUp size={14} />
          +18%
        </span>
      </div>

      <p>Total Revenue</p>

      <h2>₹12.4L</h2>

      <span className="revenue-card-subtitle">
        Compared with last month
      </span>
    </div>
  );
}

export default RevenueCard;