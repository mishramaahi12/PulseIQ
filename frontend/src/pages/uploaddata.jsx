import { useState } from "react";
import "./upload.css";

import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  Database,
  BarChart3,
  Info,
  Check,
  X,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

function UploadData() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setResult(data);
    } catch (error) {
      setError(
        error.message ||
          "Something went wrong while uploading the dataset."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">

          {/* PAGE HEADING */}
          <div className="page-heading">
            <div>
              <span className="eyebrow">DATA ANALYTICS</span>

              <h1>Upload your business data</h1>

              <p>
                Upload your CSV or Excel dataset and let
                PulseIQ analyze your business performance.
              </p>
            </div>
          </div>

          <div className="upload-page-grid">

            {/* UPLOAD CARD */}
            <div className="dashboard-card upload-page-card">

              <div className="upload-card-header">
                <div className="upload-main-icon">
                  <Database size={23} />
                </div>

                <div>
                  <h2>Upload Dataset</h2>

                  <p>
                    Start by uploading your business data.
                  </p>
                </div>
              </div>

              <div className="upload-dropzone">

                <div className="upload-file-icon">
                  <FileSpreadsheet size={32} />
                </div>

                <h2>Drop your dataset here</h2>

                <p>
                  Supported formats: CSV, XLSX and XLS
                </p>

                <input
                  id="dataset-file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  hidden
                  onChange={(event) => {
                    setFile(
                      event.target.files?.[0] || null
                    );

                    setResult(null);
                    setError("");
                  }}
                />

                <label
                  htmlFor="dataset-file"
                  className="upload-select-button"
                >
                  <Upload size={17} />
                  Choose File
                </label>

                {file && (
                  <div className="upload-selected">
                    <FileSpreadsheet size={17} />

                    <span>
                      {file.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setResult(null);
                        setError("");
                      }}
                      className="upload-remove"
                      aria-label="Remove file"
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}

                {file && !loading && (
                  <button
                    type="button"
                    className="upload-analyze-button"
                    onClick={handleUpload}
                  >
                    <BarChart3 size={17} />
                    Analyze Dataset
                  </button>
                )}

                {loading && (
                  <div className="upload-selected">
                    <Loader2
                      size={17}
                      className="prism-loader"
                    />

                    <span>
                      Analyzing dataset...
                    </span>
                  </div>
                )}

                {error && (
                  <div className="upload-error">
                    {error}
                  </div>
                )}

              </div>
            </div>

            {/* DATA REQUIREMENTS */}
            <div className="dashboard-card upload-guide-card">

              <div className="upload-guide-header">
                <div className="upload-guide-icon">
                  <Info size={19} />
                </div>

                <div>
                  <h2>What should your file contain?</h2>

                  <p>
                    For the best analysis, include these
                    business details in your dataset.
                  </p>
                </div>
              </div>

              <div className="upload-guide-list">

                <div className="upload-guide-item">
                  <div className="guide-check">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>Revenue / Sales</strong>

                    <span>
                      Total sales or revenue generated
                      from each transaction.
                    </span>
                  </div>
                </div>

                <div className="upload-guide-item">
                  <div className="guide-check">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>Orders</strong>

                    <span>
                      Order ID, quantity, or number of
                      products ordered.
                    </span>
                  </div>
                </div>

                <div className="upload-guide-item">
                  <div className="guide-check">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>Customers</strong>

                    <span>
                      Customer ID, customer name, or
                      client information.
                    </span>
                  </div>
                </div>

                <div className="upload-guide-item">
                  <div className="guide-check">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>Date</strong>

                    <span>
                      Order date, transaction date, or
                      monthly sales date.
                    </span>
                  </div>
                </div>

                <div className="upload-guide-item">
                  <div className="guide-check">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>Product / Category</strong>

                    <span>
                      Product names, categories, or
                      services being sold.
                    </span>
                  </div>
                </div>

                <div className="upload-guide-item">
                  <div className="guide-check">
                    <Check size={15} />
                  </div>

                  <div>
                    <strong>Profit / Cost</strong>

                    <span>
                      Profit, cost, discount, or expense
                      data if available.
                    </span>
                  </div>
                </div>

              </div>

              {/* EXAMPLE */}
              <div className="upload-example">

                <div className="upload-example-title">
                  <FileSpreadsheet size={16} />

                  <span>Example columns</span>
                </div>

                <div className="example-columns">
                  <span>Date</span>
                  <span>Customer</span>
                  <span>Product</span>
                  <span>Category</span>
                  <span>Quantity</span>
                  <span>Revenue</span>
                  <span>Cost</span>
                  <span>Profit</span>
                </div>

              </div>

              <div className="upload-guide-note">
                <strong>Tip:</strong> Keep one transaction or
                order per row and use clear column names.
              </div>

            </div>

            {/* RESULT */}
            {result && (
              <div className="dashboard-card upload-result-card">

                <div className="upload-success">
                  <CheckCircle size={20} />

                  <div>
                    <strong>
                      Dataset analyzed successfully
                    </strong>

                    <span>
                      PulseIQ processed your business data.
                    </span>
                  </div>
                </div>

                <div className="upload-stats">

                  <div className="upload-stat">
                    <span>FILE</span>

                    <strong>
                      {result.filename}
                    </strong>
                  </div>

                  <div className="upload-stat">
                    <span>ROWS</span>

                    <strong>
                      {result.rows}
                    </strong>
                  </div>

                  <div className="upload-stat">
                    <span>COLUMNS</span>

                    <strong>
                      {result.columns.length}
                    </strong>
                  </div>

                  <div className="upload-stat">
                    <span>NUMERIC</span>

                    <strong>
                      {
                        result.analysis
                          .numeric_columns.length
                      }
                    </strong>
                  </div>

                </div>

                {result.analysis.detected?.revenue && (
                  <div className="detected-revenue">

                    <div>
                      <small>
                        DETECTED REVENUE
                      </small>

                      <h2>
                        ₹
                        {result.analysis.detected.revenue.total.toLocaleString()}
                      </h2>

                      <span>
                        Column:{" "}
                        {
                          result.analysis.detected
                            .revenue.column
                        }
                      </span>
                    </div>

                  </div>
                )}

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

export default UploadData;