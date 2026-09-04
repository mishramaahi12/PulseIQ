import { useEffect, useState } from "react";

import { TrendingUp } from "lucide-react";

function formatINR(value) {
  const number = Number(value) || 0;

  if (number >= 10000000) {
    return `₹${(number / 10000000).toFixed(2)}Cr`;
  }

  if (number >= 100000) {
    return `₹${(number / 100000).toFixed(2)}L`;
  }

  if (number >= 1000) {
    return `₹${(number / 1000).toFixed(1)}K`;
  }

  return `₹${number.toLocaleString("en-IN")}`;
}

function getLocalProducts() {
  try {
    const rows = JSON.parse(
      localStorage.getItem("pulseiq_business_data") || "[]"
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return [];
    }

    const grouped = {};

    rows.forEach((row) => {
      const name =
        row.product ||
        row.productName ||
        row.product_name ||
        row.service ||
        "Unknown Product";

      const quantity =
        Number(row.quantity) || 1;

      const revenue =
        Number(row.totalAmount) ||
        Number(row.total_amount) ||
        Number(row.total) ||
        quantity *
          (Number(row.unitPrice) ||
            Number(row.unit_price) ||
            0);

      if (!grouped[name]) {
        grouped[name] = {
          name,
          sales: 0,
          revenue: 0,
        };
      }

      grouped[name].sales += quantity;
      grouped[name].revenue += revenue;
    });

    return Object.values(grouped)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  } catch {
    return [];
  }
}

function getUserId() {
  const direct =
    localStorage.getItem("pulseiq_user_id");

  if (direct) {
    return direct;
  }

  try {
    const user = JSON.parse(
      localStorage.getItem("pulseiq_user") || "null"
    );

    return user?.id || user?.user_id || null;
  } catch {
    return null;
  }
}

function TopProducts() {
  const [products, setProducts] = useState([]);

  const loadProducts = async () => {
    try {
      const localProducts = getLocalProducts();

      if (localProducts.length > 0) {
        setProducts(localProducts);
        return;
      }

      const userId = getUserId();

      if (!userId) {
        setProducts([]);
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/dashboard",
        {
          headers: {
            "X-User-Id": String(userId),
          },
        }
      );

      if (!response.ok) {
        throw new Error("Dashboard request failed");
      }

      const data = await response.json();

      const performance =
        data.analysis?.product_performance || [];

      const realProducts = performance
        .slice(0, 4)
        .map((product) => ({
          name:
            product.product ||
            product.name ||
            "Product",

          sales:
            Number(product.sales) ||
            Number(product.quantity) ||
            0,

          revenue:
            Number(product.revenue) || 0,
        }));

      setProducts(realProducts);
    } catch (error) {
      console.error(
        "Top products error:",
        error
      );

      setProducts([]);
    }
  };

  useEffect(() => {
    loadProducts();

    const handleUpdate = () => {
      loadProducts();
    };

    window.addEventListener(
      "pulseiq-data-updated",
      handleUpdate
    );

    window.addEventListener(
      "pulseiq-dataset-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, []);

  const maxSales = Math.max(
    ...products.map(
      (product) => Number(product.sales) || 0
    ),
    1
  );

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
        {products.length === 0 ? (
          <div className="chart-loading">
            No product data available
          </div>
        ) : (
          products.map((product, index) => (
            <div
              key={`${product.name}-${index}`}
              className="product-item"
            >
              <div>
                <strong>
                  {product.name}
                </strong>

                <span>
                  {Number(product.sales).toLocaleString(
                    "en-IN"
                  )}{" "}
                  sales
                </span>
              </div>

              <strong className="product-revenue">
                {formatINR(product.revenue)}
              </strong>

              <div className="product-track">
                <div
                  style={{
                    width: `${Math.max(
                      (Number(product.sales) /
                        maxSales) *
                        100,
                      5
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TopProducts;