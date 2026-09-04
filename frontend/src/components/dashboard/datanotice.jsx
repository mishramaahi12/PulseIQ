import { useEffect, useState } from "react";
import { Database, X } from "lucide-react";

function DataNotice() {
  const [showNotice, setShowNotice] = useState(true);

  const checkDataSource = () => {
    try {
      const savedData = localStorage.getItem("pulseiq_business_data");

      if (!savedData) {
        setShowNotice(true);
        return;
      }

      const data = JSON.parse(savedData);

      if (Array.isArray(data) && data.length > 0) {
        setShowNotice(false);
      } else {
        setShowNotice(true);
      }
    } catch {
      setShowNotice(true);
    }
  };

  useEffect(() => {
    checkDataSource();

    window.addEventListener("pulseiq-data-updated", checkDataSource);
    window.addEventListener("pulseiq-dataset-updated", checkDataSource);
    window.addEventListener("storage", checkDataSource);

    return () => {
      window.removeEventListener(
        "pulseiq-data-updated",
        checkDataSource
      );

      window.removeEventListener(
        "pulseiq-dataset-updated",
        checkDataSource
      );

      window.removeEventListener(
        "storage",
        checkDataSource
      );
    };
  }, []);

  if (!showNotice) {
    return null;
  }

  return (
    <div className="data-notice">
      <div className="data-notice-icon">
        <Database size={17} />
      </div>

      <div className="data-notice-content">
        <strong>
          You're viewing sample business data
        </strong>

        <span>
          These metrics, charts and insights are generated from
          PulseIQ's demo dataset. Upload your own CSV to see
          insights based on your business data.
        </span>
      </div>

      <button
        className="data-notice-close"
        onClick={() => setShowNotice(false)}
        aria-label="Close notice"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export default DataNotice;