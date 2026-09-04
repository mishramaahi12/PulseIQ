import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  FileText,
  Plus,
  Trash2,
  User,
  CheckCircle,
  Download,
  Building2,
  RotateCcw,
} from "lucide-react";

import Sidebar from "../components/dashboard/sidebar";
import Topbar from "../components/dashboard/topbar";

import "./invoice.css";

/* =========================================================
   HELPERS
========================================================= */

const createEmptyItem = () => ({
  id: Date.now() + Math.random(),
  description: "",
  quantity: 1,
  rate: 0,
});

const todayISO = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getNextInvoiceId = () => {
  try {
    const existingInvoices =
      JSON.parse(localStorage.getItem("pulseiq_invoices")) || [];

    const numbers = existingInvoices
      .map((invoice) => {
        const match = String(invoice.invoiceId || "").match(/\d+/);
        return match ? Number(match[0]) : 0;
      })
      .filter(Boolean);

    const nextNumber =
      numbers.length > 0
        ? Math.max(...numbers) + 1
        : 1;

    return `INV-${String(nextNumber).padStart(4, "0")}`;
  } catch {
    return "INV-0001";
  }
};

const getNumber = (value) => {
  const number = Number(
    String(value ?? "")
      .replace(/₹/g, "")
      .replace(/Rs\./gi, "")
      .replace(/,/g, "")
      .trim()
  );

  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value) => {
  return `₹${getNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* =========================================================
   DATA LOADERS
========================================================= */

const loadBusinessRows = () => {
  try {
    return (
      JSON.parse(
        localStorage.getItem("pulseiq_business_data")
      ) || []
    );
  } catch {
    return [];
  }
};

const loadCustomerDirectory = () => {
  try {
    const savedCustomers =
      JSON.parse(
        localStorage.getItem("pulseiq_customers")
      ) || [];

    if (savedCustomers.length > 0) {
      return savedCustomers;
    }

    const rows = loadBusinessRows();

    const map = new Map();

    rows.forEach((row) => {
      const name =
        row.customerName ||
        row.customer ||
        row.Customer ||
        row["Customer Name"] ||
        "";

      const cleanName = String(name).trim();

      if (!cleanName) return;

      if (!map.has(cleanName)) {
        map.set(cleanName, {
          name: cleanName,
          company:
            row.customerCompany ||
            row.company ||
            "",
          phone:
            row.customerPhone ||
            row.phone ||
            "",
          email:
            row.customerEmail ||
            row.email ||
            "",
          address:
            row.customerAddress ||
            row.address ||
            "",
        });
      }
    });

    return Array.from(map.values());
  } catch {
    return [];
  }
};

const loadBusinessProfile = () => {
  try {
    const user =
      JSON.parse(
        localStorage.getItem("pulseiq_user")
      ) || {};

    return {
      companyName: user.companyName || "",
      businessPhone: user.businessPhone || "",
      businessEmail: user.businessEmail || "",
      businessAddress: user.businessAddress || "",
      website: user.website || "",
    };
  } catch {
    return {};
  }
};

/* =========================================================
   COMPONENT
========================================================= */

function Invoice() {
  const [businessProfile, setBusinessProfile] = useState({});
  const [customers, setCustomers] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [customerName, setCustomerName] = useState("");
  const [customerCompany, setCustomerCompany] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [invoiceId, setInvoiceId] =
    useState(getNextInvoiceId());

  const [invoiceDate, setInvoiceDate] =
    useState(todayISO());

  const [dueDate, setDueDate] = useState("");

  const [paymentStatus, setPaymentStatus] =
    useState("Paid");

  const [items, setItems] = useState([
    createEmptyItem(),
  ]);

  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(18);

  const [customerMode, setCustomerMode] =
    useState("existing");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [generatedInvoice, setGeneratedInvoice] =
    useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadAllData = () => {
    setBusinessProfile(loadBusinessProfile());
    setCustomers(loadCustomerDirectory());

    try {
      const savedInvoices =
        JSON.parse(
          localStorage.getItem("pulseiq_invoices")
        ) || [];

      setInvoices(savedInvoices);
    } catch {
      setInvoices([]);
    }
  };

  useEffect(() => {
    loadAllData();

    const handleUpdate = () => {
      loadAllData();
    };

    window.addEventListener(
      "pulseiq-data-updated",
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
        "storage",
        handleUpdate
      );
    };
  }, []);

  /* =======================================================
     TOTALS
  ======================================================= */

  const subtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const quantity = Math.max(
        0,
        getNumber(item.quantity)
      );

      const rate = Math.max(
        0,
        getNumber(item.rate)
      );

      return total + quantity * rate;
    }, 0);
  }, [items]);

  const discountAmount = useMemo(() => {
    const discountValue = Math.max(
      0,
      getNumber(discount)
    );

    return Math.min(
      subtotal,
      discountValue
    );
  }, [discount, subtotal]);

  const taxableAmount = useMemo(() => {
    return Math.max(
      0,
      subtotal - discountAmount
    );
  }, [subtotal, discountAmount]);

  const taxAmount = useMemo(() => {
    const taxRate = Math.max(
      0,
      getNumber(tax)
    );

    return (
      taxableAmount *
      (taxRate / 100)
    );
  }, [tax, taxableAmount]);

  const grandTotal = useMemo(() => {
    return taxableAmount + taxAmount;
  }, [taxableAmount, taxAmount]);

  /* =======================================================
     CUSTOMER SELECTION
  ======================================================= */

  const handleCustomerSelect = (value) => {
    setCustomerName(value);

    const selected = customers.find(
      (customer) =>
        String(customer.name || "").toLowerCase() ===
        String(value || "").toLowerCase()
    );

    if (!selected) {
      return;
    }

    setCustomerCompany(
      selected.company || ""
    );

    setCustomerPhone(
      selected.phone || ""
    );

    setCustomerEmail(
      selected.email || ""
    );

    setCustomerAddress(
      selected.address || ""
    );
  };

  /* =======================================================
     ITEMS
  ======================================================= */

  const updateItem = (id, field, value) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          [field]: value,
        };
      })
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(),
    ]);
  };

  const removeItem = (id) => {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter(
        (item) => item.id !== id
      );
    });
  };

  /* =======================================================
     SAVE CUSTOMER
  ======================================================= */

  const saveCustomer = () => {
    const cleanName =
      customerName.trim();

    if (!cleanName) {
      return;
    }

    try {
      const existingCustomers =
        JSON.parse(
          localStorage.getItem(
            "pulseiq_customers"
          )
        ) || [];

      const alreadyExists =
        existingCustomers.some(
          (customer) =>
            String(customer.name || "")
              .trim()
              .toLowerCase() ===
            cleanName.toLowerCase()
        );

      if (!alreadyExists) {
        existingCustomers.push({
          name: cleanName,
          company: customerCompany.trim(),
          phone: customerPhone.trim(),
          email: customerEmail.trim(),
          address: customerAddress.trim(),
        });

        localStorage.setItem(
          "pulseiq_customers",
          JSON.stringify(
            existingCustomers
          )
        );
      }
    } catch {
      // Ignore storage errors
    }
  };

  /* =======================================================
     SAVE BUSINESS TRANSACTION
  ======================================================= */

  const saveBusinessTransaction = (
    invoice
  ) => {
    try {
      const existingRows =
        JSON.parse(
          localStorage.getItem(
            "pulseiq_business_data"
          )
        ) || [];

      const transactionRows =
        invoice.items.map((item) => ({
          invoiceId: invoice.invoiceId,
          invoiceDate: invoice.invoiceDate,
          dueDate: invoice.dueDate,

          customerName:
            invoice.customerName,

          customerCompany:
            invoice.customerCompany,

          customerPhone:
            invoice.customerPhone,

          customerEmail:
            invoice.customerEmail,

          customerAddress:
            invoice.customerAddress,

          description:
            item.description,

          quantity:
            getNumber(item.quantity),

          rate:
            getNumber(item.rate),

          totalAmount:
            getNumber(item.quantity) *
            getNumber(item.rate),

          amount:
            getNumber(item.quantity) *
            getNumber(item.rate),

          paymentStatus:
            invoice.paymentStatus,

          paid:
            invoice.paymentStatus ===
            "Paid"
              ? getNumber(
                  invoice.grandTotal
                )
              : 0,

          pending:
            invoice.paymentStatus ===
            "Pending"
              ? getNumber(
                  invoice.grandTotal
                )
              : 0,

          tax:
            getNumber(invoice.tax),

          discount:
            getNumber(invoice.discount),

          source: "invoice",
        }));

      const updatedRows = [
        ...existingRows,
        ...transactionRows,
      ];

      localStorage.setItem(
        "pulseiq_business_data",
        JSON.stringify(updatedRows)
      );

      window.dispatchEvent(
        new Event(
          "pulseiq-data-updated"
        )
      );
    } catch {
      // Ignore storage errors
    }
  };

  /* =======================================================
     GENERATE PDF
  ======================================================= */

  const generatePDF = (invoice) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const pageHeight = 297;

    const left = 15;
    const right = 195;
    const contentWidth =
      right - left;

    /* -----------------------------------------------------
       PDF CURRENCY
       Rs. used because default jsPDF Helvetica
       does not reliably support ₹.
    ----------------------------------------------------- */

    const pdfCurrency = (value) => {
      return `Rs. ${getNumber(
        value
      ).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const companyName =
      businessProfile?.companyName?.trim() ||
      "Your Company";

    const businessPhone =
      businessProfile?.businessPhone?.trim() ||
      "";

    const businessEmail =
      businessProfile?.businessEmail?.trim() ||
      "";

    const businessAddress =
      businessProfile?.businessAddress?.trim() ||
      "";

    const businessWebsite =
      businessProfile?.website?.trim() ||
      "";

    /* -----------------------------------------------------
       PAGE BACKGROUND
    ----------------------------------------------------- */

    doc.setFillColor(
      255,
      255,
      255
    );

    doc.rect(
      0,
      0,
      pageWidth,
      pageHeight,
      "F"
    );

    /* -----------------------------------------------------
       WATERMARK
    ----------------------------------------------------- */

    doc.saveGraphicsState();

doc.setTextColor(
  240,
  243,
  247
);

doc.setFont(
  "helvetica",
  "bold"
);

doc.setFontSize(82);

doc.text(
  "PULSE IQ",
  105,
  190,
  {
    align: "center",
    angle: 45,
  }
);

doc.restoreGraphicsState();
    /* -----------------------------------------------------
       SELLER HEADER
    ----------------------------------------------------- */

    doc.setFillColor(
      37,
      99,
      235
    );

    doc.roundedRect(
      left,
      14,
      5,
      18,
      1.5,
      1.5,
      "F"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(18);

    doc.setTextColor(
      25,
      30,
      38
    );

    doc.text(
      companyName,
      left + 9,
      20
    );

    let sellerY = 26;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.2);

    doc.setTextColor(
      105,
      112,
      122
    );

    if (businessAddress) {
      const addressLines =
        doc.splitTextToSize(
          businessAddress,
          82
        );

      doc.text(
        addressLines,
        left + 9,
        sellerY
      );

      sellerY +=
        addressLines.length * 4;
    }

    const contactLine = [
      businessPhone,
      businessEmail,
    ]
      .filter(Boolean)
      .join("  |  ");

    if (contactLine) {
      doc.text(
        contactLine,
        left + 9,
        sellerY
      );

      sellerY += 4;
    }

    if (businessWebsite) {
      doc.text(
        businessWebsite,
        left + 9,
        sellerY
      );
    }

    /* -----------------------------------------------------
       INVOICE TITLE
    ----------------------------------------------------- */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(27);

    doc.setTextColor(
      30,
      35,
      43
    );

    doc.text(
      "INVOICE",
      right,
      20,
      {
        align: "right",
      }
    );

    doc.setFillColor(
      37,
      99,
      235
    );

    doc.roundedRect(
      right - 31,
      24,
      31,
      1.8,
      0.9,
      0.9,
      "F"
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.5);

    doc.setTextColor(
      105,
      112,
      122
    );

    doc.text(
      `Invoice No. ${invoice.invoiceId}`,
      right,
      31,
      {
        align: "right",
      }
    );

    doc.text(
      `Invoice Date: ${formatDate(
        invoice.invoiceDate
      )}`,
      right,
      36,
      {
        align: "right",
      }
    );

    if (invoice.dueDate) {
      doc.text(
        `Due Date: ${formatDate(
          invoice.dueDate
        )}`,
        right,
        41,
        {
          align: "right",
        }
      );
    }

    /* -----------------------------------------------------
       DIVIDER
    ----------------------------------------------------- */

    doc.setDrawColor(
      225,
      229,
      235
    );

    doc.setLineWidth(0.4);

    doc.line(
      left,
      48,
      right,
      48
    );

    /* -----------------------------------------------------
       BILL TO
    ----------------------------------------------------- */

    const billTop = 60;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
      37,
      99,
      235
    );

    doc.text(
      "BILL TO",
      left,
      billTop
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(13);

    doc.setTextColor(
      30,
      35,
      43
    );

    doc.text(
      invoice.customerName ||
        "Customer",
      left,
      billTop + 9
    );

    let customerY =
      billTop + 15;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.3);

    doc.setTextColor(
      100,
      107,
      117
    );

    if (invoice.customerCompany) {
      doc.text(
        invoice.customerCompany,
        left,
        customerY
      );

      customerY += 4.5;
    }

    if (invoice.customerAddress) {
      const addressLines =
        doc.splitTextToSize(
          invoice.customerAddress,
          90
        );

      doc.text(
        addressLines,
        left,
        customerY
      );

      customerY +=
        addressLines.length * 4;
    }

    if (invoice.customerPhone) {
      doc.text(
        invoice.customerPhone,
        left,
        customerY
      );

      customerY += 4.5;
    }

    if (invoice.customerEmail) {
      doc.text(
        invoice.customerEmail,
        left,
        customerY
      );
    }

    /* -----------------------------------------------------
       PAYMENT STATUS
    ----------------------------------------------------- */

    const statusX = 145;
    const statusY = 57;

    const statusWidth = 50;
    const statusHeight = 29;

    const isPaid =
      invoice.paymentStatus ===
      "Paid";

    if (isPaid) {
      doc.setFillColor(
        241,
        250,
        245
      );

      doc.setDrawColor(
        195,
        226,
        207
      );
    } else {
      doc.setFillColor(
        255,
        249,
        239
      );

      doc.setDrawColor(
        235,
        216,
        180
      );
    }

    doc.roundedRect(
      statusX,
      statusY,
      statusWidth,
      statusHeight,
      3,
      3,
      "FD"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(7);

    doc.setTextColor(
      105,
      112,
      122
    );

    doc.text(
      "PAYMENT STATUS",
      statusX +
        statusWidth / 2,
      statusY + 9,
      {
        align: "center",
      }
    );

    doc.setFontSize(
      10.5
    );

    if (isPaid) {
      doc.setTextColor(
        22,
        130,
        72
      );
    } else {
      doc.setTextColor(
        170,
        105,
        25
      );
    }

    doc.text(
      invoice.paymentStatus,
      statusX +
        statusWidth / 2,
      statusY + 19,
      {
        align: "center",
      }
    );

    /* -----------------------------------------------------
       ITEMS TABLE
    ----------------------------------------------------- */

    const tableRows =
      invoice.items.map(
        (item) => {
          const quantity =
            getNumber(
              item.quantity
            );

          const rate =
            getNumber(
              item.rate
            );

          const amount =
            quantity * rate;

          return [
            item.description ||
              "Item",
            String(quantity),
            pdfCurrency(rate),
            pdfCurrency(amount),
          ];
        }
      );

    autoTable(doc, {
      startY: 99,

      head: [
        [
          "DESCRIPTION",
          "QTY",
          "RATE",
          "AMOUNT",
        ],
      ],

      body: tableRows,

      theme: "grid",

      margin: {
        left: left,
        right: 15,
        top: 15,
        bottom: 30,
      },

      tableWidth:
        contentWidth,

      styles: {
        font: "helvetica",

        fontSize: 8.3,

        textColor: [
          55,
          61,
          70,
        ],

        lineColor: [
          224,
          228,
          234,
        ],

        lineWidth: 0.2,

        cellPadding: {
          top: 5,
          right: 4,
          bottom: 5,
          left: 4,
        },

        valign: "middle",

        overflow:
          "linebreak",

        cellWidth: "wrap",
      },

      headStyles: {
        fillColor: [
          37,
          99,
          235,
        ],

        textColor: [
          255,
          255,
          255,
        ],

        fontStyle:
          "bold",

        fontSize: 7.6,

        cellPadding: {
          top: 4.5,
          right: 4,
          bottom: 4.5,
          left: 4,
        },

        halign: "left",
      },

      alternateRowStyles: {
        fillColor: [
          248,
          250,
          253,
        ],
      },

      columnStyles: {
        0: {
          cellWidth: 91,
          halign: "left",
          overflow:
            "linebreak",
        },

        1: {
          cellWidth: 19,
          halign: "center",
        },

        2: {
          cellWidth: 35,
          halign: "right",
        },

        3: {
          cellWidth: 35,
          halign: "right",
          fontStyle:
            "bold",
        },
      },

      didParseCell: (
        data
      ) => {
        if (
          data.section ===
            "body" &&
          data.column.index === 0
        ) {
          data.cell.styles.overflow =
            "linebreak";
        }

        if (
          data.section ===
            "body" &&
          data.column.index === 3
        ) {
          data.cell.styles.textColor =
            [
              37,
              99,
              235,
            ];
        }
      },
    });

    
    /* -----------------------------------------------------
       TOTALS
    ----------------------------------------------------- */

    let finalY =
      doc.lastAutoTable?.finalY
        ? doc.lastAutoTable
            .finalY + 10
        : 150;

    if (finalY > 235) {
      doc.addPage();

      doc.setFillColor(
        255,
        255,
        255
      );

      doc.rect(
        0,
        0,
        pageWidth,
        pageHeight,
        "F"
      );

      finalY = 25;
    }

    const totalsLabelX =
      137;

    const totalsValueX =
      195;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8.7);

    doc.setTextColor(
      105,
      112,
      122
    );

    doc.text(
      "Subtotal",
      totalsLabelX,
      finalY
    );

    doc.setTextColor(
      45,
      51,
      60
    );

    doc.text(
      pdfCurrency(
        invoice.subtotal
      ),
      totalsValueX,
      finalY,
      {
        align: "right",
      }
    );

    finalY += 6;

    if (
      invoice.discountAmount >
      0
    ) {
      doc.setTextColor(
        105,
        112,
        122
      );

      doc.text(
        "Discount",
        totalsLabelX,
        finalY
      );

      doc.setTextColor(
        190,
        75,
        75
      );

      doc.text(
        `- ${pdfCurrency(
          invoice.discountAmount
        )}`,
        totalsValueX,
        finalY,
        {
          align: "right",
        }
      );

      finalY += 6;
    }

    if (
      invoice.taxAmount >
      0
    ) {
      doc.setTextColor(
        105,
        112,
        122
      );

      doc.text(
        `GST (${invoice.taxRate}%)`,
        totalsLabelX,
        finalY
      );

      doc.setTextColor(
        45,
        51,
        60
      );

      doc.text(
        pdfCurrency(
          invoice.taxAmount
        ),
        totalsValueX,
        finalY,
        {
          align: "right",
        }
      );

      finalY += 8;
    }

    /* -----------------------------------------------------
       GRAND TOTAL BOX
    ----------------------------------------------------- */

    doc.setDrawColor(
      210,
      219,
      232
    );

    doc.setFillColor(
      246,
      249,
      253
    );

    doc.roundedRect(
      128,
      finalY - 4,
      67,
      18,
      2,
      2,
      "FD"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      9.5
    );

    doc.setTextColor(
      35,
      43,
      54
    );

    doc.text(
      "TOTAL",
      134,
      finalY + 7
    );

    doc.setFontSize(
      13
    );

    doc.setTextColor(
      37,
      99,
      235
    );

    doc.text(
      pdfCurrency(
        invoice.grandTotal
      ),
      totalsValueX - 3,
      finalY + 7,
      {
        align: "right",
      }
    );

    /* -----------------------------------------------------
       PAYMENT INFORMATION
    ----------------------------------------------------- */

    const paymentY =
      Math.max(
        finalY + 31,
        205
      );

    doc.setFillColor(
      248,
      250,
      252
    );

    doc.setDrawColor(
      226,
      230,
      235
    );

    doc.roundedRect(
      left,
      paymentY - 5,
      82,
      invoice.dueDate
        ? 34
        : 28,
      2.5,
      2.5,
      "FD"
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      7.8
    );

    doc.setTextColor(
      37,
      99,
      235
    );

    doc.text(
      "PAYMENT INFORMATION",
      left + 5,
      paymentY + 2
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(
      7.9
    );

    doc.setTextColor(
      100,
      107,
      117
    );

    doc.text(
      `Status: ${invoice.paymentStatus}`,
      left + 5,
      paymentY + 9
    );

    doc.text(
      `Invoice Total: ${pdfCurrency(
        invoice.grandTotal
      )}`,
      left + 5,
      paymentY + 15
    );

    if (invoice.dueDate) {
      doc.text(
        `Payment Due: ${formatDate(
          invoice.dueDate
        )}`,
        left + 5,
        paymentY + 21
      );
    }

    /* -----------------------------------------------------
       FOOTER
    ----------------------------------------------------- */

    doc.setDrawColor(
      222,
      226,
      232
    );

    doc.setLineWidth(
      0.35
    );

    doc.line(
      left,
      263,
      right,
      263
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(
      7.3
    );

    doc.setTextColor(
      130,
      136,
      145
    );

    doc.text(
      "This is a digitally generated invoice. No physical signature is required.",
      105,
      272,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(
      8.5
    );

    doc.setTextColor(
      55,
      61,
      70
    );

    doc.text(
      "Thank you for your business!",
      105,
      280,
      {
        align: "center",
      }
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(
      7.3
    );

    doc.setTextColor(
      150,
      155,
      163
    );

    doc.text(
      "Powered by PulseIQ",
      105,
      288,
      {
        align: "center",
      }
    );

    /* -----------------------------------------------------
       SAVE FILE
    ----------------------------------------------------- */

    const safeCustomerName =
      String(
        invoice.customerName ||
          "Customer"
      )
        .replace(
          /[^a-z0-9]/gi,
          "_"
        )
        .slice(0, 40);

    doc.save(
      `PulseIQ_Invoice_${invoice.invoiceId}_${safeCustomerName}.pdf`
    );
  };

  /* =======================================================
     GENERATE INVOICE
  ======================================================= */

  const handleGenerateInvoice = () => {
    setError("");
    setSuccess("");

    if (!customerName.trim()) {
      setError(
        "Please enter customer name."
      );
      return;
    }

    const validItems =
      items.filter(
        (item) =>
          String(
            item.description || ""
          ).trim() &&
          getNumber(
            item.quantity
          ) > 0 &&
          getNumber(
            item.rate
          ) >= 0
      );

    if (
      validItems.length === 0
    ) {
      setError(
        "Please add at least one valid invoice item."
      );
      return;
    }

    if (grandTotal <= 0) {
      setError(
        "Invoice total must be greater than zero."
      );
      return;
    }

    const invoice = {
      invoiceId,
      invoiceDate,
      dueDate,

      customerName:
        customerName.trim(),

      customerCompany:
        customerCompany.trim(),

      customerPhone:
        customerPhone.trim(),

      customerEmail:
        customerEmail.trim(),

      customerAddress:
        customerAddress.trim(),

      paymentStatus,

      items: validItems.map(
        (item) => ({
          ...item,
          description:
            String(
              item.description
            ).trim(),
          quantity:
            getNumber(
              item.quantity
            ),
          rate:
            getNumber(
              item.rate
            ),
        })
      ),

      subtotal,

      discount:
        getNumber(discount),

      discountAmount,

      taxableAmount,

      tax:
        getNumber(tax),

      taxRate:
        getNumber(tax),

      taxAmount,

      grandTotal,

      companyName:
        businessProfile?.companyName ||
        "",

      createdAt:
        new Date().toISOString(),
    };

    try {
      const existingInvoices =
        JSON.parse(
          localStorage.getItem(
            "pulseiq_invoices"
          )
        ) || [];

      const updatedInvoices = [
        ...existingInvoices,
        invoice,
      ];

      localStorage.setItem(
        "pulseiq_invoices",
        JSON.stringify(
          updatedInvoices
        )
      );

      saveCustomer();

      saveBusinessTransaction(
        invoice
      );

      setInvoices(
        updatedInvoices
      );

      setGeneratedInvoice(
        invoice
      );

      setSuccess(
        "Invoice generated successfully."
      );

      generatePDF(invoice);

      setInvoiceId(
        getNextInvoiceId()
      );
    } catch {
      setError(
        "Unable to save invoice. Please try again."
      );
    }
  };

  /* =======================================================
     RESET
  ======================================================= */

  const resetForm = () => {
    setCustomerName("");
    setCustomerCompany("");
    setCustomerPhone("");
    setCustomerEmail("");
    setCustomerAddress("");

    setInvoiceId(
      getNextInvoiceId()
    );

    setInvoiceDate(
      todayISO()
    );

    setDueDate("");

    setPaymentStatus(
      "Paid"
    );

    setItems([
      createEmptyItem(),
    ]);

    setDiscount(0);
    setTax(18);

    setCustomerMode(
      "existing"
    );

    setError("");
    setSuccess("");
    setGeneratedInvoice(
      null
    );
  };

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <main className="invoice-page">
          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="page-heading invoice-page-heading">
            <div>
              <span className="eyebrow">
                BILLING
              </span>

              <h1>
                Create Invoice
              </h1>

              <p>
                Create professional invoices
                for your customers and download
                them as PDF.
              </p>
            </div>

            <div className="invoice-id-badge">
              <FileText
                size={16}
              />

              <span>
                {invoiceId}
              </span>
            </div>
          </div>

          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div className="invoice-alert invoice-error">
              <span>
                {error}
              </span>
            </div>
          )}

          {success && (
            <div className="invoice-alert invoice-success">
              <CheckCircle
                size={17}
              />

              <span>
                {success}
              </span>
            </div>
          )}

          {/* =================================================
              CUSTOMER DETAILS
          ================================================= */}

          <section className="invoice-section">
            <div className="invoice-section-header">
              <div className="invoice-step">
                01
              </div>

              <div>
                <h2>
                  Customer Details
                </h2>

                <p>
                  Select an existing customer
                  or enter new customer details.
                </p>
              </div>

              <div className="customer-mode-toggle">
                <button
                  type="button"
                  className={
                    customerMode ===
                    "existing"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCustomerMode(
                      "existing"
                    )
                  }
                >
                  Existing
                </button>

                <button
                  type="button"
                  className={
                    customerMode ===
                    "new"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setCustomerMode(
                      "new"
                    )
                  }
                >
                  New Customer
                </button>
              </div>
            </div>

            {customerMode ===
              "existing" && (
              <div className="invoice-grid-2">
                <div className="invoice-field">
                  <label>
                    Customer
                  </label>

                  <select
                    value={
                      customerName
                    }
                    onChange={(e) =>
                      handleCustomerSelect(
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Select customer
                    </option>

                    {customers.map(
                      (
                        customer,
                        index
                      ) => (
                        <option
                          key={`${customer.name}-${index}`}
                          value={
                            customer.name
                          }
                        >
                          {
                            customer.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="invoice-field">
                  <label>
                    Company Name
                  </label>

                  <input
                    type="text"
                    value={
                      customerCompany
                    }
                    onChange={(e) =>
                      setCustomerCompany(
                        e.target.value
                      )
                    }
                    placeholder="Customer company"
                  />
                </div>
              </div>
            )}

            <div className="invoice-grid-2">
              <div className="invoice-field">
                <label>
                  Customer Name *
                </label>

                <input
                  type="text"
                  value={
                    customerName
                  }
                  onChange={(e) =>
                    setCustomerName(
                      e.target.value
                    )
                  }
                  placeholder="Enter customer name"
                />
              </div>

              <div className="invoice-field">
                <label>
                  Company Name
                </label>

                <input
                  type="text"
                  value={
                    customerCompany
                  }
                  onChange={(e) =>
                    setCustomerCompany(
                      e.target.value
                    )
                  }
                  placeholder="Enter company name"
                />
              </div>
            </div>

            <div className="invoice-grid-3">
              <div className="invoice-field">
                <label>
                  Phone
                </label>

                <input
                  type="tel"
                  value={
                    customerPhone
                  }
                  onChange={(e) =>
                    setCustomerPhone(
                      e.target.value
                    )
                  }
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div className="invoice-field">
                <label>
                  Email
                </label>

                <input
                  type="email"
                  value={
                    customerEmail
                  }
                  onChange={(e) =>
                    setCustomerEmail(
                      e.target.value
                    )
                  }
                  placeholder="customer@email.com"
                />
              </div>

              <div className="invoice-field">
                <label>
                  Address
                </label>

                <input
                  type="text"
                  value={
                    customerAddress
                  }
                  onChange={(e) =>
                    setCustomerAddress(
                      e.target.value
                    )
                  }
                  placeholder="Customer address"
                />
              </div>
            </div>
          </section>

          {/* =================================================
              BUSINESS PROFILE
          ================================================= */}

          <section className="invoice-section">
            <div className="invoice-section-header">
              <div className="invoice-step">
                02
              </div>

              <div>
                <h2>
                  Business Details
                </h2>

                <p>
                  Seller information is taken
                  automatically from Settings.
                </p>
              </div>
            </div>

            <div className="invoice-business-preview">
              <div className="invoice-business-preview-icon">
                <Building2
                  size={19}
                />
              </div>

              <div>
                <strong>
                  {businessProfile?.companyName ||
                    "Your Company"}
                </strong>

                <span>
                  {[
                    businessProfile?.businessPhone,
                    businessProfile?.businessEmail,
                    businessProfile?.businessAddress,
                  ]
                    .filter(Boolean)
                    .join(" • ") ||
                    "Add your business information in Settings"}
                </span>
              </div>
            </div>
          </section>

          {/* =================================================
              INVOICE ITEMS
          ================================================= */}

          <section className="invoice-section">
            <div className="invoice-section-header">
              <div className="invoice-step">
                03
              </div>

              <div>
                <h2>
                  Invoice Items
                </h2>

                <p>
                  Add products or services included
                  in this invoice.
                </p>
              </div>
            </div>

            <div className="invoice-items">
              {items.map(
                (
                  item,
                  index
                ) => (
                  <div
                    className="invoice-item-row"
                    key={item.id}
                  >
                    <div className="invoice-item-number">
                      {index + 1}
                    </div>

                    <div className="invoice-field invoice-item-description">
                      <label>
                        Description
                      </label>

                      <input
                        type="text"
                        value={
                          item.description
                        }
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Product / service description"
                      />
                    </div>

                    <div className="invoice-field invoice-item-small">
                      <label>
                        Qty
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={
                          item.quantity
                        }
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "quantity",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="invoice-field invoice-item-small">
                      <label>
                        Rate
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          item.rate
                        }
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "rate",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div className="invoice-item-total">
                      <span>
                        Amount
                      </span>

                      <strong>
                        {formatCurrency(
                          getNumber(
                            item.quantity
                          ) *
                            getNumber(
                              item.rate
                            )
                        )}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="invoice-delete-item"
                      onClick={() =>
                        removeItem(
                          item.id
                        )
                      }
                      disabled={
                        items.length ===
                        1
                      }
                      aria-label="Remove item"
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                )
              )}
            </div>

            <button
              type="button"
              className="invoice-add-item"
              onClick={addItem}
            >
              <Plus
                size={16}
              />

              Add Item
            </button>

            {/* TOTALS */}

            <div className="invoice-totals">
              <div>
                <span>
                  Subtotal
                </span>

                <strong>
                  {formatCurrency(
                    subtotal
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Discount
                </span>

                <div className="invoice-inline-number">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      discount
                    }
                    onChange={(e) =>
                      setDiscount(
                        e.target.value
                      )
                    }
                  />

                  <span>
                    ₹
                  </span>
                </div>
              </div>

              <div>
                <span>
                  GST %
                </span>

                <div className="invoice-inline-number">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={tax}
                    onChange={(e) =>
                      setTax(
                        e.target.value
                      )
                    }
                  />

                  <span>
                    %
                  </span>
                </div>
              </div>

              <div>
                <span>
                  GST Amount
                </span>

                <strong>
                  {formatCurrency(
                    taxAmount
                  )}
                </strong>
              </div>

              <div className="invoice-grand-total">
                <span>
                  Grand Total
                </span>

                <strong>
                  {formatCurrency(
                    grandTotal
                  )}
                </strong>
              </div>
            </div>
          </section>

          {/* =================================================
              INVOICE DETAILS
          ================================================= */}

          <section className="invoice-section">
            <div className="invoice-section-header">
              <div className="invoice-step">
                04
              </div>

              <div>
                <h2>
                  Invoice Details
                </h2>

                <p>
                  Set invoice number, dates and
                  payment status.
                </p>
              </div>
            </div>

            <div className="invoice-grid-3">
              <div className="invoice-field">
                <label>
                  Invoice Number
                </label>

                <input
                  type="text"
                  value={
                    invoiceId
                  }
                  onChange={(e) =>
                    setInvoiceId(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="invoice-field">
                <label>
                  Invoice Date
                </label>

                <input
                  type="date"
                  value={
                    invoiceDate
                  }
                  onChange={(e) =>
                    setInvoiceDate(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="invoice-field">
                <label>
                  Due Date
                </label>

                <input
                  type="date"
                  value={
                    dueDate
                  }
                  onChange={(e) =>
                    setDueDate(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            <div className="invoice-grid-2">
              <div className="invoice-field">
                <label>
                  Payment Status
                </label>

                <select
                  value={
                    paymentStatus
                  }
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value
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
              </div>

              <div className="invoice-field">
                <label>
                  Invoice Total
                </label>

                <input
                  type="text"
                  value={formatCurrency(
                    grandTotal
                  )}
                  readOnly
                />
              </div>
            </div>
          </section>

          {/* =================================================
              FINAL PREVIEW
          ================================================= */}

          <section className="invoice-section">
            <div className="invoice-section-header">
              <div className="invoice-step">
                05
              </div>

              <div>
                <h2>
                  Generate Invoice
                </h2>

                <p>
                  Review the basic details before
                  generating the PDF.
                </p>
              </div>
            </div>

            <div className="invoice-final-preview">
              <div>
                <span>
                  Customer
                </span>

                <strong>
                  {customerName ||
                    "Not selected"}
                </strong>
              </div>

              <div>
                <span>
                  Invoice
                </span>

                <strong>
                  {invoiceId}
                </strong>
              </div>

              <div>
                <span>
                  Total
                </span>

                <strong>
                  {formatCurrency(
                    grandTotal
                  )}
                </strong>
              </div>
            </div>

            <div className="invoice-form-actions">
              <button
                type="button"
                className="invoice-reset-btn"
                onClick={
                  resetForm
                }
              >
                <RotateCcw
                  size={16}
                />

                Reset
              </button>

              <button
                type="button"
                className="invoice-generate-button"
                onClick={
                  handleGenerateInvoice
                }
              >
                <Download
                  size={17}
                />

                Generate Invoice PDF
              </button>
            </div>
          </section>

          {/* =================================================
              GENERATED SUCCESS
          ================================================= */}

          {generatedInvoice && (
            <div className="invoice-generated-card">
              <div className="invoice-generated-icon">
                <CheckCircle
                  size={20}
                />
              </div>

              <div>
                <strong>
                  Invoice{" "}
                  {
                    generatedInvoice.invoiceId
                  }{" "}
                  generated
                </strong>

                <span>
                  The PDF has been downloaded
                  successfully.
                </span>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Invoice;