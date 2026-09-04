import { useEffect, useState } from "react";

import "./upload.css";

import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Loader2,
  Database,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Download,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

const createEmptyRow = () => ({
  customerName: "",
  product: "",
  quantity: "",
  unitPrice: "",
  totalAmount: "",
  paymentStatus: "Paid",
  purchaseDate: "",
  invoiceId: "",
});

// --------------------------------------------------
// SIMPLE CLIENT-SIDE CSV PARSER
// --------------------------------------------------

function splitCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);

  return result.map((value) =>
    value
      .replace(/^\uFEFF/, "")
      .trim()
      .replace(/^"|"$/g, "")
      .trim()
  );
}

function parseCSVToRows(text) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "");

  if (lines.length < 2) {
    return [];
  }

  const headers = splitCSVLine(lines[0]).map((h) =>
    h
      .replace(/^\uFEFF/, "")
      .trim()
      .toLowerCase()
  );

  const findValue = (columns, ...names) => {
    for (const name of names) {
      const idx = headers.indexOf(name.toLowerCase());

      if (idx !== -1) {
        return columns[idx] || "";
      }
    }

    return "";
  };

  const parsedRows = [];

  for (let i = 1; i < lines.length; i++) {
    const columns = splitCSVLine(lines[i]);

    const customerName = findValue(
      columns,
      "customer name"
    );

    const product = findValue(
      columns,
      "product / service",
      "product",
      "service"
    );

    const quantity = findValue(
      columns,
      "quantity",
      "qty"
    );

    const unitPrice = findValue(
      columns,
      "unit price",
      "price"
    );

    let totalAmount = findValue(
      columns,
      "total amount",
      "total",
      "revenue",
      "sales"
    );

    const paymentStatus =
      findValue(
        columns,
        "payment status",
        "status"
      ) || "Paid";

    const purchaseDate = findValue(
      columns,
      "purchase date",
      "date"
    );

    const invoiceId = findValue(
      columns,
      "invoice id",
      "invoice"
    );

    if (!customerName) {
      continue;
    }

    if (!totalAmount) {
      const q =
        Number(
          String(quantity).replace(/,/g, "")
        ) || 0;

      const p =
        Number(
          String(unitPrice).replace(/,/g, "")
        ) || 0;

      totalAmount = (q * p).toFixed(2);
    }

    parsedRows.push({
      customerName: customerName.trim(),
      product: product.trim(),
      quantity: quantity,
      unitPrice: unitPrice,
      totalAmount: totalAmount,

      paymentStatus:
        paymentStatus.toLowerCase().trim() ===
        "pending"
          ? "Pending"
          : "Paid",

      purchaseDate,
      invoiceId,
    });
  }

  return parsedRows;
}

// --------------------------------------------------
// GET LOGGED-IN USER ID
// --------------------------------------------------

const getStoredUserId = async () => {
  // --------------------------------------------------
  // FIRST: CHECK DIRECT USER ID
  // --------------------------------------------------

  const directUserIdKeys = [
    "pulseiq_user_id",
    "pulseiqUserId",
    "userId",
    "currentUserId",
  ];

  for (const key of directUserIdKeys) {
    const value = localStorage.getItem(key);

    if (
      value &&
      !Number.isNaN(Number(value))
    ) {
      return value;
    }
  }

  // --------------------------------------------------
  // SECOND: CHECK STORED USER OBJECT
  // --------------------------------------------------

  const possibleUserKeys = [
    "pulseiq_user",
    "pulseiqUser",
    "user",
    "currentUser",
    "pulseiq_current_user",
  ];

  let savedUser = null;

  for (const key of possibleUserKeys) {
    const value = localStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      const parsed = JSON.parse(value);

      // User object directly contains ID
      if (parsed?.id) {
        localStorage.setItem(
          "pulseiq_user_id",
          String(parsed.id)
        );

        return parsed.id;
      }

      // Nested user object
      if (parsed?.user?.id) {
        localStorage.setItem(
          "pulseiq_user_id",
          String(parsed.user.id)
        );

        return parsed.user.id;
      }

      // userId property
      if (
        parsed?.userId &&
        !Number.isNaN(
          Number(parsed.userId)
        )
      ) {
        localStorage.setItem(
          "pulseiq_user_id",
          String(parsed.userId)
        );

        return parsed.userId;
      }

      // Current frontend user contains email/password
      if (
        parsed?.email &&
        parsed?.password
      ) {
        savedUser = parsed;
      }
    } catch (err) {
      console.error(
        "Error reading stored user:",
        err
      );
    }
  }

  // --------------------------------------------------
  // THIRD: GET MYSQL USER ID THROUGH BACKEND LOGIN
  // --------------------------------------------------

  if (
    savedUser?.email &&
    savedUser?.password
  ) {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/login",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            email: savedUser.email,
            password: savedUser.password,
          }),
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch (err) {
        data = null;
      }

      if (
        response.ok &&
        data?.user?.id
      ) {
        const userId = data.user.id;

        // Save ID separately
        localStorage.setItem(
          "pulseiq_user_id",
          String(userId)
        );

        // Update stored user object
        const updatedUser = {
          ...savedUser,

          id: userId,

          name:
            data.user.name ||
            savedUser.name,

          email:
            data.user.email ||
            savedUser.email,
        };

        localStorage.setItem(
          "pulseiq_user",
          JSON.stringify(updatedUser)
        );

        return userId;
      }

      console.error(
        "Could not get user ID from backend:",
        data
      );
    } catch (err) {
      console.error(
        "Could not connect to login endpoint:",
        err
      );
    }
  }

  return null;
};

// --------------------------------------------------
// CREATE CSV FROM CURRENT ROWS
// --------------------------------------------------

const rowsToCSV = (rows) => {
  const header =
    "Customer Name,Product / Service,Quantity,Unit Price,Total Amount,Payment Status,Purchase Date,Invoice ID";

  const escapeCSV = (value) => {
    const stringValue =
      value === null ||
      value === undefined
        ? ""
        : String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;
    }

    return stringValue;
  };

  const data = rows.map((row) =>
    [
      row.customerName,
      row.product,
      row.quantity,
      row.unitPrice,
      row.totalAmount,
      row.paymentStatus,
      row.purchaseDate,
      row.invoiceId,
    ]
      .map(escapeCSV)
      .join(",")
  );

  return `${header}\n${data.join("\n")}`;
};

// --------------------------------------------------
// BACKEND UPLOAD HELPER
// --------------------------------------------------

const uploadRowsToBackend = async (
  rows,
  filename = "pulseiq-business-data.csv"
) => {
  // --------------------------------------------------
  // GET DATABASE USER ID
  // --------------------------------------------------

  const userId =
    await getStoredUserId();

  if (!userId) {
    throw new Error(
      "Unable to identify your PulseIQ account. Please log in again and try uploading the data."
    );
  }

  // --------------------------------------------------
  // CREATE CSV
  // --------------------------------------------------

  const csvText = rowsToCSV(rows);

  const blob = new Blob(
    [csvText],
    {
      type: "text/csv",
    }
  );

  const formData = new FormData();

  formData.append(
    "file",
    blob,
    filename
  );

  // --------------------------------------------------
  // SEND DATA TO BACKEND
  // --------------------------------------------------

  const response = await fetch(
    "http://127.0.0.1:8000/upload",
    {
      method: "POST",

      headers: {
        "X-User-Id": String(userId),
      },

      body: formData,
    }
  );

  // --------------------------------------------------
  // READ SERVER RESPONSE
  // --------------------------------------------------

  let data = null;

  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  // --------------------------------------------------
  // ERROR HANDLING
  // --------------------------------------------------

  if (!response.ok) {
    const backendMessage =
      data?.detail ||
      data?.message ||
      data?.error;

    if (response.status === 401) {
      throw new Error(
        "Your PulseIQ account could not be verified by the server."
      );
    }

    if (response.status === 400) {
      throw new Error(
        backendMessage ||
          "The CSV format is not compatible with PulseIQ."
      );
    }

    if (response.status === 422) {
      throw new Error(
        backendMessage ||
          "The server could not process the uploaded file."
      );
    }

    throw new Error(
      backendMessage ||
        `Server error ${response.status}.`
    );
  }

  // --------------------------------------------------
  // RETURN BACKEND ANALYSIS
  // --------------------------------------------------

  return data;
};

function UploadData() {
  const [file, setFile] = useState(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [rows, setRows] = useState([
    createEmptyRow(),
  ]);

  const [savedRows, setSavedRows] =
    useState([]);

  const [result, setResult] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // --------------------------------------------------
  // LOAD SAVED BUSINESS DATA
  // --------------------------------------------------

  useEffect(() => {
    const savedBusinessData =
      localStorage.getItem(
        "pulseiq_business_data"
      );

    if (savedBusinessData) {
      try {
        const parsed =
          JSON.parse(
            savedBusinessData
          );

        if (Array.isArray(parsed)) {
          setSavedRows(parsed);

          if (parsed.length > 0) {
            setRows(parsed);
          }
        }
      } catch (err) {
        console.error(
          "Error loading business data:",
          err
        );
      }
    }

    // Load previous upload analysis
    const savedDataset =
      localStorage.getItem(
        "pulseiq_dataset"
      );

    if (savedDataset) {
      try {
        setResult(
          JSON.parse(savedDataset)
        );
      } catch (err) {
        console.error(
          "Error loading dataset:",
          err
        );
      }
    }
  }, []);

  // --------------------------------------------------
  // UPDATE ROW
  // --------------------------------------------------

  const updateRow = (
    index,
    field,
    value
  ) => {
    setRows((previousRows) => {
      const updatedRows = [
        ...previousRows,
      ];

      updatedRows[index] = {
        ...updatedRows[index],
        [field]: value,
      };

      // Automatically calculate total amount
      if (
        field === "quantity" ||
        field === "unitPrice"
      ) {
        const quantity =
          field === "quantity"
            ? Number(value)
            : Number(
                updatedRows[index]
                  .quantity
              );

        const unitPrice =
          field === "unitPrice"
            ? Number(value)
            : Number(
                updatedRows[index]
                  .unitPrice
              );

        if (
          !Number.isNaN(quantity) &&
          !Number.isNaN(unitPrice) &&
          quantity > 0 &&
          unitPrice >= 0
        ) {
          updatedRows[index].totalAmount =
            (
              quantity * unitPrice
            ).toFixed(2);
        }
      }

      return updatedRows;
    });
  };

  // --------------------------------------------------
// ADD NEW ROW
// --------------------------------------------------
const addRow = () => {
  setRows((previousRows) => [
    createEmptyRow(),
    ...previousRows,
  ]);
};

  // --------------------------------------------------
  // DELETE ROW
  // --------------------------------------------------

  const deleteRow = (index) => {
    if (rows.length === 1) {
      setRows([
        createEmptyRow(),
      ]);

      return;
    }

    setRows((previousRows) =>
      previousRows.filter(
        (_, rowIndex) =>
          rowIndex !== index
      )
    );
  };

  // --------------------------------------------------
  // VALIDATE DATA
  // --------------------------------------------------

  const validateRows = () => {
    for (
      let i = 0;
      i < rows.length;
      i++
    ) {
      const row = rows[i];

      if (
        !row.customerName.trim()
      ) {
        return `Row ${
          i + 1
        }: Customer Name is required.`;
      }

      if (
        !row.product.trim()
      ) {
        return `Row ${
          i + 1
        }: Product / Service is required.`;
      }

      if (
        row.quantity === "" ||
        Number(row.quantity) <= 0
      ) {
        return `Row ${
          i + 1
        }: Quantity must be greater than 0.`;
      }

      if (
        row.unitPrice === "" ||
        Number(row.unitPrice) < 0
      ) {
        return `Row ${
          i + 1
        }: Unit Price is required.`;
      }

      if (
        row.totalAmount === "" ||
        Number(row.totalAmount) < 0
      ) {
        return `Row ${
          i + 1
        }: Total Amount is required.`;
      }

      if (!row.paymentStatus) {
        return `Row ${
          i + 1
        }: Payment Status is required.`;
      }

      if (!row.purchaseDate) {
        return `Row ${
          i + 1
        }: Purchase Date is required.`;
      }
    }

    return "";
  };

  // --------------------------------------------------
  // SAVE BUSINESS DATA
  // --------------------------------------------------

  const handleSaveData = async () => {
    setError("");
    setSuccess("");

    const validationError =
      validateRows();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const cleanedRows =
        rows.map((row) => ({
          ...row,

          customerName:
            row.customerName.trim(),

          product:
            row.product.trim(),

          quantity:
            Number(row.quantity),

          unitPrice:
            Number(row.unitPrice),

          totalAmount:
            Number(row.totalAmount),

          paymentStatus:
            row.paymentStatus,

          purchaseDate:
            row.purchaseDate,

          invoiceId:
            row.invoiceId.trim(),
        }));

      // --------------------------------------------------
      // SAVE CENTRALLY FOR FRONTEND MODULES
      // --------------------------------------------------

      localStorage.setItem(
        "pulseiq_business_data",
        JSON.stringify(cleanedRows)
      );

      localStorage.setItem(
        "pulseiq_data_version",
        Date.now().toString()
      );

      localStorage.setItem(
        "pulseiq_dataset_uploaded",
        "true"
      );

      setSavedRows(cleanedRows);
      setRows(cleanedRows);

      // --------------------------------------------------
      // SAVE TO BACKEND / MYSQL
      // --------------------------------------------------

      let backendSaved = false;

      try {
        await uploadRowsToBackend(
          cleanedRows,
          "pulseiq-business-data.csv"
        );

        backendSaved = true;
      } catch (backendError) {
        console.error(
          "BACKEND SAVE ERROR:",
          backendError
        );

        setError(
          `Data saved locally, but server sync failed: ${
            backendError.message ||
            "Unknown server error."
          }`
        );
      }

      // --------------------------------------------------
      // TELL DASHBOARD / ANALYTICS /
      // CUSTOMERS / OTHER MODULES
      // --------------------------------------------------

      window.dispatchEvent(
        new Event(
          "pulseiq-data-updated"
        )
      );

      window.dispatchEvent(
        new Event(
          "pulseiq-dataset-updated"
        )
      );

      if (backendSaved) {
        setSuccess(
          `${cleanedRows.length} business ${
            cleanedRows.length === 1
              ? "record"
              : "records"
          } saved successfully.`
        );
      } else {
        setSuccess(
          `${cleanedRows.length} business ${
            cleanedRows.length === 1
              ? "record"
              : "records"
          } saved locally.`
        );
      }
    } catch (err) {
      console.error(
        "SAVE DATA ERROR:",
        err
      );

      setError(
        err.message ||
          "Unable to save your business data."
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------
  // FILE SELECT
  // --------------------------------------------------

  const handleFileChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setFile(selectedFile);
    setError("");
    setSuccess("");
    setResult(null);
  };

  // --------------------------------------------------
  // UPLOAD CSV / EXCEL
  // --------------------------------------------------

  const handleUpload = async () => {
    if (!file) {
      setError(
        "Please choose a CSV file first."
      );

      return;
    }

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setError(
        "Only CSV files are supported right now. Please save your Excel file as CSV (File → Save As → CSV) and try again."
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // --------------------------------------------------
      // READ CSV FILE
      // --------------------------------------------------

      const text =
        await file.text();

      const parsedRows =
        parseCSVToRows(text);

      if (
        parsedRows.length === 0
      ) {
        throw new Error(
          "No valid rows found. Make sure the file has a header row matching the required columns and at least one data row."
        );
      }

      // --------------------------------------------------
      // CLEAN CSV DATA
      // --------------------------------------------------

      const cleanedRows =
        parsedRows.map(
          (row) => ({
            customerName:
              row.customerName,

            product:
              row.product,

            quantity:
              Number(
                row.quantity
              ) || 0,

            unitPrice:
              Number(
                String(
                  row.unitPrice
                ).replace(
                  /,/g,
                  ""
                )
              ) || 0,

            totalAmount:
              Number(
                String(
                  row.totalAmount
                ).replace(
                  /,/g,
                  ""
                )
              ) || 0,

            paymentStatus:
              row.paymentStatus,

            purchaseDate:
              row.purchaseDate,

            invoiceId:
              row.invoiceId,
          })
        );

      // --------------------------------------------------
      // VALIDATE CSV ROWS BEFORE SAVING
      // --------------------------------------------------

      for (
        let i = 0;
        i < cleanedRows.length;
        i++
      ) {
        const row =
          cleanedRows[i];

        if (
          !row.customerName
        ) {
          throw new Error(
            `Row ${
              i + 1
            }: Customer Name is missing.`
          );
        }

        if (!row.product) {
          throw new Error(
            `Row ${
              i + 1
            }: Product / Service is missing.`
          );
        }

        if (
          !row.quantity ||
          row.quantity <= 0
        ) {
          throw new Error(
            `Row ${
              i + 1
            }: Quantity must be greater than 0.`
          );
        }

        if (
          row.unitPrice < 0
        ) {
          throw new Error(
            `Row ${
              i + 1
            }: Unit Price cannot be negative.`
          );
        }

        if (
          row.totalAmount < 0
        ) {
          throw new Error(
            `Row ${
              i + 1
            }: Total Amount cannot be negative.`
          );
        }

        if (
          !row.purchaseDate
        ) {
          throw new Error(
            `Row ${
              i + 1
            }: Purchase Date is required.`
          );
        }
      }

      // --------------------------------------------------
      // MERGE WITH WHATEVER IS ALREADY SAVED
      // --------------------------------------------------

      const existing =
        savedRows.length > 0
          ? savedRows
          : [];

      const merged = [
        ...existing,
        ...cleanedRows,
      ];

      // --------------------------------------------------
      // SAVE FRONTEND DATA
      // --------------------------------------------------

      localStorage.setItem(
        "pulseiq_business_data",
        JSON.stringify(merged)
      );

      localStorage.setItem(
        "pulseiq_dataset_uploaded",
        "true"
      );

      localStorage.setItem(
        "pulseiq_data_version",
        Date.now().toString()
      );

      // --------------------------------------------------
      // SAVE UPLOAD ANALYSIS RESULT
      // --------------------------------------------------

      const analysisResult = {
        filename:
          file.name,

        rows:
          cleanedRows.length,

        columns:
          Object.keys(
            cleanedRows[0]
          ),
      };

      localStorage.setItem(
        "pulseiq_dataset",
        JSON.stringify(
          analysisResult
        )
      );

      setSavedRows(merged);
      setRows(merged);

      setResult(
        analysisResult
      );

      // --------------------------------------------------
      // SEND COMPLETE CSV DATA TO BACKEND
      // --------------------------------------------------

      let backendResult = null;

      try {
        backendResult =
          await uploadRowsToBackend(
            cleanedRows,
            file.name
          );
      } catch (backendError) {
        console.error(
          "BACKEND UPLOAD ERROR:",
          backendError
        );

        throw new Error(
          backendError.message ||
            "The CSV was read successfully, but it could not be saved to the PulseIQ server."
        );
      }

      // --------------------------------------------------
      // STORE BACKEND ANALYSIS IF AVAILABLE
      // --------------------------------------------------

      if (backendResult) {
        const backendAnalysis = {
          ...analysisResult,

          backend:
            backendResult,
        };

        localStorage.setItem(
          "pulseiq_dataset",
          JSON.stringify(
            backendAnalysis
          )
        );

        setResult(
          backendAnalysis
        );
      }

      // --------------------------------------------------
      // TELL OTHER MODULES
      // --------------------------------------------------

      window.dispatchEvent(
        new Event(
          "pulseiq-data-updated"
        )
      );

      window.dispatchEvent(
        new Event(
          "pulseiq-dataset-updated"
        )
      );

      // --------------------------------------------------
      // SUCCESS MESSAGE
      // --------------------------------------------------

      setSuccess(
        `${cleanedRows.length} row${
          cleanedRows.length === 1
            ? ""
            : "s"
        } imported, analyzed and saved successfully.`
      );
    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
        err
      );

      setError(
        err.message ||
          "Something went wrong while reading the file."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // DOWNLOAD TEMPLATE
  // --------------------------------------------------

  const downloadTemplate =
    () => {
      const header =
        "Customer Name,Product / Service,Quantity,Unit Price,Total Amount,Payment Status,Purchase Date,Invoice ID";

      const example =
        "Rahul Sharma,Laptop,2,55000,110000,Paid,2026-09-01,INV-001";

      const csv =
        `${header}\n${example}`;

      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;",
          }
        );

      const url =
        URL.createObjectURL(
          blob
        );

      const link =
        document.createElement(
          "a"
        );

      link.href = url;

      link.download =
        "pulseiq-business-data-template.csv";

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link
      );

      URL.revokeObjectURL(
        url
      );
    };

  // --------------------------------------------------
  // REMOVE UPLOAD
  // --------------------------------------------------

  const removeFile = () => {
    setFile(null);

    const input =
      document.getElementById(
        "dataset-file"
      );

    if (input) {
      input.value = "";
    }

    setResult(null);
    setError("");
    setSuccess("");
  };

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  const totalRevenue =
    savedRows.reduce(
      (sum, row) =>
        sum +
        (Number(
          row.totalAmount
        ) || 0),
      0
    );

  const paidAmount =
    savedRows
      .filter(
        (row) =>
          row.paymentStatus ===
          "Paid"
      )
      .reduce(
        (sum, row) =>
          sum +
          (Number(
            row.totalAmount
          ) || 0),
        0
      );

  const pendingAmount =
    savedRows
      .filter(
        (row) =>
          row.paymentStatus ===
          "Pending"
      )
      .reduce(
        (sum, row) =>
          sum +
          (Number(
            row.totalAmount
          ) || 0),
        0
      );

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="dashboard-content">

          {/* PAGE HEADING */}

          <div className="page-heading">
            <div>
              <span className="eyebrow">
                DATA HUB
              </span>

              <h1>
                Your business data,{" "}
                <em>
                  in one place.
                </em>
              </h1>

              <p>
                Enter your business
                transactions once.
                PulseIQ will use the
                saved data across
                your dashboard,
                analytics,
                customers,
                invoices,
                reports and
                Prism AI.
              </p>
            </div>
          </div>

          {/* DATA STATUS */}

          <div className="data-hub-status">
            <div className="data-hub-status-icon">
              <Database size={18} />
            </div>

            <div>
              <strong>
                One dataset. Every
                PulseIQ module.
              </strong>

              <span>
                Save your data here
                — there is no
                separate connect or
                sync step.
              </span>
            </div>
          </div>

          {/* MANUAL DATA ENTRY */}

          <div className="dashboard-card business-data-card">

            <div className="business-data-header">
              <div>
                <span className="section-label">
                  BUSINESS RECORDS
                </span>

                <h2>
                  Add your business
                  data
                </h2>

                <p>
                  Fields marked with{" "}
                  <strong>
                    *
                  </strong>{" "}
                  are mandatory.
                </p>
              </div>

              <div className="business-data-actions">

                <button
                  type="button"
                  className="template-button"
                  onClick={
                    downloadTemplate
                  }
                >
                  <Download
                    size={16}
                  />

                  Template
                </button>

                <button
                  type="button"
                  className="add-row-button"
                  onClick={
                    addRow
                  }
                >
                  <Plus
                    size={16}
                  />

                  Add row
                </button>

              </div>
            </div>

            {/* TABLE */}

            <div className="business-table-wrapper">

              <table className="business-data-table">

                <thead>
                  <tr>
                    <th>
                      Customer Name *
                    </th>

                    <th>
                      Product /
                      Service *
                    </th>

                    <th>
                      Quantity *
                    </th>

                    <th>
                      Unit Price *
                    </th>

                    <th>
                      Total Amount *
                    </th>

                    <th>
                      Payment Status *
                    </th>

                    <th>
                      Purchase Date *
                    </th>

                    <th>
                      Invoice ID
                    </th>

                    <th></th>
                  </tr>
                </thead>

                <tbody>

                  {rows.map(
                    (
                      row,
                      index
                    ) => (

                      <tr
                        key={
                          index
                        }
                      >

                        <td>
                          <input
                            type="text"
                            placeholder="Customer name"
                            value={
                              row.customerName
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "customerName",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            placeholder="Product / service"
                            value={
                              row.product
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "product",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="1"
                            placeholder="1"
                            value={
                              row.quantity
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "quantity",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={
                              row.unitPrice
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "unitPrice",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="number"
                            min="0"
                            placeholder="Auto"
                            value={
                              row.totalAmount
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "totalAmount",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <select
                            value={
                              row.paymentStatus
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "paymentStatus",
                                e.target
                                  .value
                              )
                            }
                          >
                            <option value="Paid">
                              Paid
                            </option>

                            <option value="Pending">
                              Pending
                            </option>
                          </select>
                        </td>

                        <td>
                          <input
                            type="date"
                            value={
                              row.purchaseDate
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "purchaseDate",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <input
                            type="text"
                            placeholder="Optional"
                            value={
                              row.invoiceId
                            }
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "invoiceId",
                                e.target
                                  .value
                              )
                            }
                          />
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-row-button"
                            onClick={() =>
                              deleteRow(
                                index
                              )
                            }
                            title="Delete row"
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* SAVE AREA */}

            <div className="business-save-area">

              <div className="business-save-info">

                <strong>
                  {rows.length}{" "}
                  {rows.length ===
                  1
                    ? "record"
                    : "records"}
                </strong>

                <span>
                  Total revenue: ₹
                  {totalRevenue.toLocaleString(
                    "en-IN"
                  )}
                </span>

              </div>

              <button
                type="button"
                className="save-business-button"
                onClick={
                  handleSaveData
                }
                disabled={
                  saving
                }
              >

                {saving ? (
                  <>
                    <Loader2
                      size={17}
                      className="prism-loader"
                    />

                    Saving data...
                  </>
                ) : (
                  <>
                    <Save
                      size={17}
                    />

                    Save Data
                  </>
                )}

              </button>

            </div>

            {/* MESSAGES */}

            {error && (
              <div className="data-message data-message-error">

                <AlertCircle
                  size={18}
                />

                <span>
                  {error}
                </span>

              </div>
            )}

            {success && (
              <div className="data-message data-message-success">

                <CheckCircle
                  size={18}
                />

                <span>
                  {success}
                </span>

              </div>
            )}

          </div>

          {/* QUICK SUMMARY */}

          {savedRows.length >
            0 && (

            <div className="dashboard-card data-summary-card">

              <div className="summary-heading">

                <div>

                  <span className="section-label">
                    SAVED DATA
                  </span>

                  <h2>
                    Business data is
                    active
                  </h2>

                  <p>
                    This saved
                    dataset is ready
                    to power the rest
                    of PulseIQ.
                  </p>

                </div>

                <div className="active-data-badge">

                  <CheckCircle
                    size={15}
                  />

                  Active

                </div>

              </div>

              <div className="data-summary-grid">

                <div className="data-summary-item">

                  <span>
                    RECORDS
                  </span>

                  <strong>
                    {
                      savedRows.length
                    }
                  </strong>

                </div>

                <div className="data-summary-item">

                  <span>
                    TOTAL REVENUE
                  </span>

                  <strong>
                    ₹
                    {totalRevenue.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div className="data-summary-item">

                  <span>
                    PAID
                  </span>

                  <strong>
                    ₹
                    {paidAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

                <div className="data-summary-item">

                  <span>
                    PENDING
                  </span>

                  <strong>
                    ₹
                    {pendingAmount.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

            </div>
          )}

          {/* CSV / EXCEL */}

          <div className="dashboard-card upload-file-card">

            <div className="upload-card-header">

              <div className="upload-main-icon">
                <FileSpreadsheet
                  size={23}
                />
              </div>

              <div>

                <h2>
                  Import existing
                  data
                </h2>

                <p>
                  Already have your
                  business data?
                  Upload a CSV instead
                  of entering every
                  record manually.
                </p>

              </div>

            </div>

            <div className="upload-dropzone">

              <div className="upload-file-icon">
                <FileSpreadsheet
                  size={32}
                />
              </div>

              <h2>
                Upload CSV
              </h2>

              <p>
                Supported format:
                CSV (download the
                template below to
                see the exact
                columns)
              </p>

              <input
                id="dataset-file"
                type="file"
                accept=".csv"
                hidden
                onChange={
                  handleFileChange
                }
              />

              {!file && (
                <label
                  htmlFor="dataset-file"
                  className="upload-select-button"
                >
                  <Upload
                    size={17}
                  />

                  Choose File
                </label>
              )}

              {file && (
                <>
                  <div className="upload-selected">

                    <FileSpreadsheet
                      size={17}
                    />

                    <span>
                      {
                        file.name
                      }
                    </span>

                    <button
                      type="button"
                      onClick={
                        removeFile
                      }
                      className="upload-remove"
                    >
                      ×
                    </button>

                  </div>

                  {!loading && (
                    <button
                      type="button"
                      className="upload-analyze-button"
                      onClick={
                        handleUpload
                      }
                    >
                      <Database
                        size={17}
                      />

                      Import &
                      Analyze
                    </button>
                  )}
                </>
              )}

              {loading && (
                <div className="upload-selected">

                  <Loader2
                    size={17}
                    className="prism-loader"
                  />

                  <span>
                    Importing and
                    analyzing
                    dataset...
                  </span>

                </div>
              )}

            </div>

            {result && (
              <div className="upload-success">

                <CheckCircle
                  size={20}
                />

                <div>

                  <strong>
                    Dataset analyzed
                    successfully
                  </strong>

                  <span>
                    {result.filename ||
                      file?.name}
                    {" · "}
                    {result.rows ||
                      0}{" "}
                    rows
                    {" · "}
                    {result.columns
                      ?.length ||
                      0}{" "}
                    columns
                  </span>

                </div>

              </div>
            )}

          </div>

          {/* REQUIRED COLUMNS */}

          <div className="dashboard-card required-columns-card">

            <div className="required-columns-heading">

              <div>

                <span className="section-label">
                  DATA FORMAT
                </span>

                <h2>
                  Required business
                  columns
                </h2>

                <p>
                  Keep these fields
                  consistent so
                  PulseIQ can
                  correctly
                  calculate your
                  business
                  metrics.
                </p>

              </div>

            </div>

            <div className="required-columns-grid">

              <div className="required-column">

                <strong>
                  Customer Name
                  <em>*</em>
                </strong>

                <span>
                  Who made the
                  purchase
                </span>

              </div>

              <div className="required-column">

                <strong>
                  Product /
                  Service
                  <em>*</em>
                </strong>

                <span>
                  What was sold
                </span>

              </div>

              <div className="required-column">

                <strong>
                  Quantity
                  <em>*</em>
                </strong>

                <span>
                  Number of units
                </span>

              </div>

              <div className="required-column">

                <strong>
                  Unit Price
                  <em>*</em>
                </strong>

                <span>
                  Price per unit
                </span>

              </div>

              <div className="required-column">

                <strong>
                  Total Amount
                  <em>*</em>
                </strong>

                <span>
                  Final transaction
                  value
                </span>

              </div>

              <div className="required-column">

                <strong>
                  Payment Status
                  <em>*</em>
                </strong>

                <span>
                  Paid or Pending
                </span>

              </div>

              <div className="required-column">

                <strong>
                  Purchase Date
                  <em>*</em>
                </strong>

                <span>
                  Transaction date
                </span>

              </div>

              <div className="required-column optional">

                <strong>
                  Invoice ID

                  <small>
                    Optional
                  </small>
                </strong>

                <span>
                  Existing invoice
                  reference
                </span>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}

export default UploadData;