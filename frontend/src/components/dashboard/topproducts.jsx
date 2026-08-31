import { TrendingUp } from "lucide-react";

function TopProducts() {
  const products = [
    {
      name: "Wireless Earbuds",
      sales: 420,
      revenue: "₹4.2L",
    },
    {
      name: "Smart Watch",
      sales: 310,
      revenue: "₹3.1L",
    },
    {
      name: "Bluetooth Speaker",
      sales: 210,
      revenue: "₹2.4L",
    },
    {
      name: "Laptop Stand",
      sales: 180,
      revenue: "₹1.8L",
    },
  ];

  return (
    <div className="dashboard-card">

      <div className="section-card-header">
        <h2>Top Products</h2>

        <span className="best-sellers">
          <TrendingUp size={15} />
          Best sellers
        </span>
      </div>

      <div className="products-list">

        {products.map((product, index) => (
          <div key={product.name} className="product-item">

            <div>
              <strong>{product.name}</strong>

              <span>
                {product.sales} sales
              </span>
            </div>

            <strong className="product-revenue">
              {product.revenue}
            </strong>

            <div className="product-track">
              <div
                style={{
                  width: `${85 - index * 15}%`,
                }}
              />
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default TopProducts;