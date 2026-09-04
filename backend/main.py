import os
import json
import tempfile
import math
import re

import pandas as pd
from dotenv import load_dotenv

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Header,
)

from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from google import genai

from database import engine, Base, SessionLocal
from models import User, BusinessData, Expense


# =========================================================
# ENVIRONMENT
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

gemini_client = None

if GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(
            api_key=GEMINI_API_KEY
        )
    except Exception as e:
        print(
            "Gemini client initialization error:",
            repr(e)
        )
        gemini_client = None


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="PulseIQ API"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://10.45.196.65:5173",
         "https://pulseiq-cyan.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(
    bind=engine
)


# =========================================================
# REQUEST MODELS
# =========================================================

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class AIRequest(BaseModel):
    message: str
    source: str | None = None


# =========================================================
# EXPENSE REQUEST MODELS
# =========================================================

class ExpenseCreateRequest(BaseModel):
    expense_date: str
    expense_name: str
    category: str
    amount: float
    payment_method: str = "Other"
    vendor: str = ""
    description: str = ""


class ExpenseUpdateRequest(BaseModel):
    expense_date: str
    expense_name: str
    category: str
    amount: float
    payment_method: str = "Other"
    vendor: str = ""
    description: str = ""


# =========================================================
# CURRENT DATASET
# =========================================================

current_dataset = {
    "filename": None,
    "rows": 0,
    "columns": [],
    "data": None,
    "analysis": None,
}


# =========================================================
# DEMO DATA
# =========================================================

DEMO_DATA = {
    "revenue": "₹12.4L",
    "revenue_numeric": 1240000,
    "revenue_growth": "18.4%",
    "orders": 2486,
    "orders_growth": "12.8%",
    "customers": 8942,
    "customers_growth": "9.2%",
    "business_growth": "32%",
    "profit": "₹3.1L",
    "profit_numeric": 310000,
    "profit_growth": "15.7%",
    "top_product": "Wireless Earbuds",
    "top_product_revenue": "₹4.2L",
    "top_product_sales": 420,
}


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "status": "success",
        "message": "PulseIQ Backend is running.",
    }


# =========================================================
# DATABASE TEST
# =========================================================

@app.get("/db-test")
def db_test():

    db = SessionLocal()

    try:
        db.execute(
            __import__("sqlalchemy").text("SELECT 1")
        )

        return {
            "status": "success",
            "database": "connected",
        }

    except Exception as e:

        return {
            "status": "error",
            "database": "not connected",
            "error": str(e),
        }

    finally:
        db.close()


# =========================================================
# SIGNUP
# =========================================================

@app.post("/signup")
def signup(data: SignupRequest):

    name = data.name.strip()
    email = data.email.strip().lower()
    password = data.password.strip()

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )

    if not email:
        raise HTTPException(
            status_code=400,
            detail="Email is required."
        )

    if not password:
        raise HTTPException(
            status_code=400,
            detail="Password is required."
        )

    db = SessionLocal()

    try:

        existing_user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="An account with this email already exists."
            )

        user = User(
            name=name,
            email=email,
            password=password,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "status": "success",
            "message": "Account created successfully.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            },
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(data: LoginRequest):

    email = data.email.strip().lower()
    password = data.password.strip()

    if not email or not password:
        raise HTTPException(
            status_code=400,
            detail="Email and password are required."
        )

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(
                User.email == email,
                User.password == password,
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

        return {
            "status": "success",
            "message": "Login successful.",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            },
        }

    finally:
        db.close()


# =========================================================
# USER VALIDATION
# =========================================================

def require_user_id(
    x_user_id: int | None
):

    if x_user_id is None:
        raise HTTPException(
            status_code=401,
            detail="User ID is required."
        )

    db = SessionLocal()

    try:

        user = (
            db.query(User)
            .filter(User.id == x_user_id)
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Invalid user."
            )

        return x_user_id

    finally:
        db.close()


# =========================================================
# HELPERS
# =========================================================

def safe_float(
    value,
    default=0.0
):

    try:

        if value is None:
            return default

        if isinstance(value, str):

            value = (
                value
                .replace("₹", "")
                .replace(",", "")
                .replace("%", "")
                .strip()
            )

            if not value:
                return default

        number = float(value)

        if math.isnan(number) or math.isinf(number):
            return default

        return number

    except Exception:
        return default


def format_inr(value):

    value = safe_float(value)

    return f"₹{value:,.2f}"


def clean_text(value):

    if value is None:
        return ""

    if pd.isna(value):
        return ""

    return str(value).strip()


def normalize_column_name(value):

    value = clean_text(value)

    value = value.replace("_", " ")
    value = value.replace("-", " ")

    value = re.sub(
        r"\s+",
        " ",
        value
    )

    return value.lower().strip()


def numeric_series(
    df,
    column
):

    if column not in df.columns:
        return pd.Series(
            [0] * len(df),
            index=df.index,
            dtype=float,
        )

    series = df[column]

    if pd.api.types.is_numeric_dtype(series):
        return pd.to_numeric(
            series,
            errors="coerce"
        )

    return pd.to_numeric(
        series.astype(str)
        .str.replace(
            r"[₹,$,\s,%]",
            "",
            regex=True
        )
        .str.replace(
            ",",
            "",
            regex=False
        )
        .str.strip(),
        errors="coerce"
    )


def find_column(
    df,
    keywords,
    numeric=None
):

    normalized_map = {
        column: normalize_column_name(column)
        for column in df.columns
    }

    candidates = []

    for column, normalized in normalized_map.items():

        score = 0

        for keyword in keywords:

            keyword_normalized = normalize_column_name(
                keyword
            )

            if normalized == keyword_normalized:
                score += 10

            elif keyword_normalized in normalized:
                score += 5

        if numeric is True:

            series = numeric_series(
                df,
                column
            )

            numeric_count = series.notna().sum()

            if numeric_count > 0:
                score += 3

        if numeric is False:

            if not pd.api.types.is_numeric_dtype(
                df[column]
            ):
                score += 2

        if score > 0:
            candidates.append(
                (score, column)
            )

    if not candidates:
        return None

    candidates.sort(
        key=lambda x: x[0],
        reverse=True
    )

    return candidates[0][1]


def find_customer_column(df):

    keywords = [
        "customer",
        "customer name",
        "customer id",
        "client",
        "client name",
        "buyer",
        "buyer name",
        "customer_name",
        "client_name",
    ]

    return find_column(
        df,
        keywords,
        numeric=False
    )


# =========================================================
# BUSINESS DATA -> DATAFRAME
# =========================================================

def db_records_to_dataframe(
    records
):
    rows = []

    for record in records:
        rows.append({
            "Customer Name":
                record.customer_name,

            "Product / Service":
                record.product,

            "Quantity":
                record.quantity,

            "Unit Price":
                record.unit_price,

            "Total Amount":
                record.total_amount,

            "Payment Status":
                record.payment_status,

            "Purchase Date":
                record.purchase_date,

            "Invoice ID":
                record.invoice_id,
        })

    return pd.DataFrame(rows)

# =========================================================
# LOAD USER DATASET
# =========================================================

def load_user_dataset(
    user_id
):

    global current_dataset

    db = SessionLocal()

    try:

        records = (
            db.query(BusinessData)
            .filter(
                BusinessData.user_id == user_id
            )
            .order_by(
                BusinessData.id.asc()
            )
            .all()
        )

        if not records:

            current_dataset = {
                "filename": None,
                "rows": 0,
                "columns": [],
                "data": None,
                "analysis": None,
            }

            return current_dataset

        df = db_records_to_dataframe(
            records
        )

        analysis = analyze_dataframe(
            df
        )

        filename = getattr(
            records[0],
            "filename",
            None
        )

        current_dataset = {
            "filename": filename or "PulseIQ Business Data",
            "rows": len(df),
            "columns": df.columns.tolist(),
            "data": df.to_dict(
                orient="records"
            ),
            "analysis": analysis,
        }

        return current_dataset

    finally:
        db.close()


# =========================================================
# SAVE DATAFRAME
# =========================================================

# =========================================================
# SAVE DATAFRAME FOR USER
# =========================================================

def save_dataframe_for_user(
    df,
    user_id,
    filename="PulseIQ Business Data"
):
    required_columns = {
        "customer": find_column(
            df,
            [
                "customer",
                "customer name",
                "client",
                "buyer",
            ],
            numeric=False
        ),

        "product": find_column(
            df,
            [
                "product",
                "product name",
                "item",
                "service",
                "product / service",
            ],
            numeric=False
        ),

        "quantity": find_column(
            df,
            [
                "quantity",
                "qty",
                "units",
                "units sold",
                "items sold",
            ],
            numeric=True
        ),

        "unit_price": find_column(
            df,
            [
                "unit price",
                "price",
                "selling price",
                "rate",
            ],
            numeric=True
        ),

        "total": find_column(
            df,
            [
                "total amount",
                "total",
                "revenue",
                "sales",
                "sale amount",
                "sales amount",
                "amount",
            ],
            numeric=True
        ),

        "payment": find_column(
            df,
            [
                "payment status",
                "status",
                "payment",
                "paid status",
            ],
            numeric=False
        ),

        "date": find_column(
            df,
            [
                "purchase date",
                "order date",
                "transaction date",
                "date",
            ],
            numeric=False
        ),
    }

    missing = [
        key
        for key, value in required_columns.items()
        if value is None
    ]

    # ---------------------------------------------------------
    # IMPORTANT:
    # Revenue can also be calculated using
    # Quantity × Unit Price.
    # So total should not block the upload if both
    # quantity and unit price are available.
    # ---------------------------------------------------------

    if required_columns["total"] is None:
        if (
            required_columns["quantity"] is None
            or required_columns["unit_price"] is None
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Revenue/Total column could not be detected. "
                    "Your dataset must contain either a Total/Revenue/"
                    "Sales column or both Quantity and Unit Price columns."
                )
            )

        if "total" in missing:
            missing.remove("total")

    if missing:
        raise HTTPException(
            status_code=400,
            detail=(
                "Required business columns could not "
                "be detected: "
                + ", ".join(missing)
            )
        )

    customer_column = required_columns["customer"]
    product_column = required_columns["product"]
    quantity_column = required_columns["quantity"]
    unit_price_column = required_columns["unit_price"]
    total_column = required_columns["total"]
    payment_column = required_columns["payment"]
    date_column = required_columns["date"]

    invoice_column = find_column(
        df,
        [
            "invoice id",
            "invoice number",
            "invoice no",
            "order id",
            "order number",
            "transaction id",
        ],
        numeric=False
    )

    db = SessionLocal()

    try:
        # ---------------------------------------------------------
        # REMOVE OLD BUSINESS DATA FOR THIS USER
        # ---------------------------------------------------------

        db.query(BusinessData).filter(
            BusinessData.user_id == user_id
        ).delete(
            synchronize_session=False
        )

        db.commit()

        saved_count = 0

        # ---------------------------------------------------------
        # SAVE EVERY VALID BUSINESS ROW
        # ---------------------------------------------------------

        for _, row in df.iterrows():

            customer_name = clean_text(
                row.get(customer_column)
            )

            product_service = clean_text(
                row.get(product_column)
            )

            # -----------------------------------------------------
            # QUANTITY
            # -----------------------------------------------------

            quantity = 0.0

            if quantity_column:
                quantity = safe_float(
                    row.get(quantity_column)
                )

            # -----------------------------------------------------
            # UNIT PRICE
            # -----------------------------------------------------

            unit_price = 0.0

            if unit_price_column:
                unit_price = safe_float(
                    row.get(unit_price_column)
                )

            # -----------------------------------------------------
            # TOTAL / REVENUE
            # -----------------------------------------------------

            total_amount = 0.0

            if total_column:
                total_amount = safe_float(
                    row.get(total_column)
                )

            # -----------------------------------------------------
            # FALLBACK:
            # Quantity × Unit Price = Revenue
            #
            # This fixes datasets where there is no Total column
            # or where Total is empty/zero.
            # -----------------------------------------------------

            if (
                total_amount == 0
                and quantity != 0
                and unit_price != 0
            ):
                total_amount = quantity * unit_price

            # -----------------------------------------------------
            # PAYMENT STATUS
            # -----------------------------------------------------

            payment_status = clean_text(
                row.get(payment_column)
            )

            if not payment_status:
                payment_status = "Paid"

            # -----------------------------------------------------
            # PURCHASE DATE
            # -----------------------------------------------------

            purchase_date = pd.to_datetime(
                row.get(date_column),
                errors="coerce"
            )

            if pd.isna(purchase_date):
                # BusinessData.purchase_date is nullable=False.
                # Invalid rows cannot safely be inserted.
                continue

            purchase_date = purchase_date.date()

            # -----------------------------------------------------
            # INVOICE ID
            # -----------------------------------------------------

            invoice_id = ""

            if invoice_column:
                invoice_id = clean_text(
                    row.get(invoice_column)
                )

            # -----------------------------------------------------
            # SKIP COMPLETELY EMPTY BUSINESS ROWS
            # -----------------------------------------------------

            if not customer_name and not product_service:
                continue

            # -----------------------------------------------------
            # CREATE DATABASE RECORD
            #
            # IMPORTANT:
            # models.py uses "product", NOT "product_service".
            # -----------------------------------------------------

            business_row = BusinessData(
                user_id=user_id,
                customer_name=customer_name,
                product=product_service,
                quantity=quantity,
                unit_price=unit_price,
                total_amount=total_amount,
                payment_status=payment_status,
                purchase_date=purchase_date,
                invoice_id=invoice_id,
            )

            # -----------------------------------------------------
            # Filename compatibility
            # -----------------------------------------------------

            if hasattr(
                BusinessData,
                "filename"
            ):
                business_row.filename = filename

            db.add(
                business_row
            )

            saved_count += 1

        # ---------------------------------------------------------
        # COMMIT ALL BUSINESS DATA
        # ---------------------------------------------------------

        db.commit()

        # ---------------------------------------------------------
        # RELOAD DATASET
        # ---------------------------------------------------------

        load_user_dataset(
            user_id
        )

        return saved_count

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Could not save dataset: "
                + str(e)
            )
        )

    finally:
        db.close()

# =========================================================
# DATAFRAME ANALYSIS
# =========================================================

def analyze_dataframe(df):

    if df is None or df.empty:

        return {
            "rows": 0,
            "columns": [],
            "numeric_columns": [],
            "categorical_columns": [],
            "summary": {},
            "detected": {},
            "customer_list": [],
            "top_categories": {},
            "product_performance": [],
            "product_profit_performance": [],
            "correlations": {},
            "chart_data": [],
        }

    df = df.copy()

    numeric_columns = []

    categorical_columns = []

    for column in df.columns:

        if pd.api.types.is_numeric_dtype(
            df[column]
        ):
            numeric_columns.append(
                column
            )
        else:
            converted = pd.to_numeric(
                df[column],
                errors="coerce"
            )

            if (
                converted.notna().sum()
                >= max(1, int(len(df) * 0.5))
            ):
                numeric_columns.append(
                    column
                )
            else:
                categorical_columns.append(
                    column
                )

    detected = {}

    customer_list = []

    # =====================================================
    # REVENUE
    # =====================================================

    revenue_column = find_column(
        df,
        [
            "revenue",
            "sales",
            "sale amount",
            "sales amount",
            "amount",
            "income",
            "turnover",
            "earnings",
            "total sales",
            "total amount",
        ],
        numeric=True
    )

    # =====================================================
    # PROFIT
    # =====================================================

    profit_column = find_column(
        df,
        [
            "profit",
            "net profit",
            "gross profit",
        ],
        numeric=True
    )

    # =====================================================
    # COST
    # =====================================================

    cost_column = find_column(
        df,
        [
            "cost",
            "expense",
            "expenses",
            "spending",
            "expenditure",
        ],
        numeric=True
    )

    # =====================================================
    # ORDER
    # =====================================================

    order_column = find_column(
        df,
        [
            "order id",
            "order number",
            "order no",
            "transaction id",
            "transaction number",
            "invoice id",
            "invoice number",
            "invoice no",
        ],
        numeric=False
    )

    # =====================================================
    # QUANTITY
    # =====================================================

    quantity_column = find_column(
        df,
        [
            "quantity",
            "qty",
            "units sold",
            "units",
            "items sold",
            "unit quantity",
        ],
        numeric=True
    )

    # =====================================================
    # EXPLICIT ORDERS
    # =====================================================

    explicit_orders_column = find_column(
        df,
        [
            "orders",
            "order count",
            "number of orders",
        ],
        numeric=True
    )

    # =====================================================
    # DATE
    # =====================================================

    date_column = find_column(
        df,
        [
            "date",
            "order date",
            "transaction date",
            "purchase date",
            "time",
            "month",
            "year",
        ],
        numeric=False
    )

    # =====================================================
    # PRODUCT
    # =====================================================

    product_column = find_column(
        df,
        [
            "product",
            "product name",
            "item",
            "item name",
            "service",
            "product / service",
        ],
        numeric=False
    )

    # =====================================================
    # REVENUE DETECTION
    # =====================================================

    if revenue_column:

        revenue_values = numeric_series(
            df,
            revenue_column
        )

        detected["revenue"] = {
            "column": revenue_column,
            "total": round(
                float(
                    revenue_values.sum()
                ),
                2
            ),
            "average": round(
                float(
                    revenue_values.mean()
                ),
                2
            ),
            "minimum": round(
                float(
                    revenue_values.min()
                ),
                2
            ) if revenue_values.notna().any() else 0,
            "maximum": round(
                float(
                    revenue_values.max()
                ),
                2
            ) if revenue_values.notna().any() else 0,
        }

    # =====================================================
    # COST DETECTION
    # =====================================================

    if cost_column:

        cost_values = numeric_series(
            df,
            cost_column
        )

        detected["cost"] = {
            "column": cost_column,
            "total": round(
                float(
                    cost_values.sum()
                ),
                2
            ),
            "average": round(
                float(
                    cost_values.mean()
                ),
                2
            ),
        }

    # =====================================================
    # PROFIT DETECTION
    # =====================================================

    if profit_column:

        profit_values = numeric_series(
            df,
            profit_column
        )

        detected["profit"] = {
            "column": profit_column,
            "total": round(
                float(
                    profit_values.sum()
                ),
                2
            ),
            "average": round(
                float(
                    profit_values.mean()
                ),
                2
            ),
        }

    elif (
        revenue_column
        and cost_column
    ):

        revenue_values = numeric_series(
            df,
            revenue_column
        )

        cost_values = numeric_series(
            df,
            cost_column
        )

        profit_values = (
            revenue_values
            - cost_values
        )

        detected["profit"] = {
            "column": "Calculated Profit",
            "total": round(
                float(
                    profit_values.sum()
                ),
                2
            ),
            "average": round(
                float(
                    profit_values.mean()
                ),
                2
            ),
            "calculated": True,
        }

    # =====================================================
    # ORDERS
    # =====================================================

    if order_column:

        values = (
            df[order_column]
            .dropna()
            .astype(str)
            .str.strip()
        )

        values = values[
            values != ""
        ]

        detected["orders"] = {
            "column": order_column,
            "total": int(
                values.nunique()
            ),
        }

    elif explicit_orders_column:

        values = numeric_series(
            df,
            explicit_orders_column
        )

        detected["orders"] = {
            "column": explicit_orders_column,
            "total": round(
                float(
                    values.sum()
                ),
                2
            ),
        }

    else:

        detected["orders"] = {
            "column": None,
            "total": int(len(df)),
        }

    # =====================================================
    # QUANTITY
    # =====================================================

    if quantity_column:

        values = numeric_series(
            df,
            quantity_column
        )

        detected["quantity"] = {
            "column": quantity_column,
            "total": round(
                float(
                    values.sum()
                ),
                2
            ),
        }

    # =====================================================
    # CUSTOMERS
    # =====================================================

    customer_column = find_customer_column(
        df
    )

    if customer_column:

        values = (
            df[customer_column]
            .dropna()
            .astype(str)
            .str.strip()
        )

        values = values[
            ~values.str.lower().isin(
                [
                    "",
                    "nan",
                    "none",
                    "null",
                ]
            )
        ]

        unique_customers = sorted(
            values.unique().tolist()
        )

        detected["customers"] = {
            "column": customer_column,
            "unique": int(
                len(unique_customers)
            ),
        }

        # =================================================
        # EMAIL COLUMN
        # =================================================

        email_column = None

        for column in df.columns:

            normalized = normalize_column_name(
                column
            )

            if (
                "email" in normalized
                or "e mail" in normalized
            ):
                email_column = column
                break

        # =================================================
        # BUILD CUSTOMER LIST
        # =================================================

        for index, customer_name in enumerate(
            unique_customers
        ):

            customer_id = index + 1

            email_value = "No email available"

            if email_column:

                matching_rows = df[
                    df[customer_column]
                    .astype(str)
                    .str.strip()
                    == customer_name
                ]

                if not matching_rows.empty:

                    email_candidate = (
                        matching_rows.iloc[0]
                        [email_column]
                    )

                    if pd.notna(
                        email_candidate
                    ):

                        email_candidate = (
                            str(
                                email_candidate
                            )
                            .strip()
                        )

                        if email_candidate:

                            email_value = (
                                email_candidate
                            )

            customer_list.append({
                "id": customer_id,
                "name": customer_name,
                "email": email_value,
                "status": "Active",
            })

    # =====================================================
    # DATE
    # =====================================================

    if date_column:

        parsed_dates = pd.to_datetime(
            df[date_column],
            errors="coerce"
        )

        valid_dates = (
            parsed_dates.dropna()
        )

        if not valid_dates.empty:

            detected["date"] = {
                "column": date_column,
                "minimum":
                    valid_dates.min().strftime(
                        "%Y-%m-%d"
                    ),
                "maximum":
                    valid_dates.max().strftime(
                        "%Y-%m-%d"
                    ),
            }

    # =====================================================
    # PRODUCT
    # =====================================================

    if product_column:

        values = (
            df[product_column]
            .dropna()
            .astype(str)
            .str.strip()
        )

        values = values[
            ~values.str.lower().isin(
                [
                    "",
                    "nan",
                    "none",
                    "null",
                ]
            )
        ]

        detected["product"] = {
            "column": product_column,
            "unique": int(
                values.nunique()
            ),
        }

    # =====================================================
    # PROFIT MARGIN
    # =====================================================

    if (
        detected.get("revenue")
        and detected.get("profit")
    ):

        revenue_total = safe_float(
            detected["revenue"]["total"]
        )

        profit_total = safe_float(
            detected["profit"]["total"]
        )

        if revenue_total != 0:

            detected["profit_margin"] = {
                "value": round(
                    (
                        profit_total
                        / revenue_total
                    ) * 100,
                    2
                )
            }

    # =====================================================
    # COST RATIO
    # =====================================================

    if (
        detected.get("revenue")
        and detected.get("cost")
    ):

        revenue_total = safe_float(
            detected["revenue"]["total"]
        )

        cost_total = safe_float(
            detected["cost"]["total"]
        )

        if revenue_total != 0:

            detected["cost_ratio"] = {
                "value": round(
                    (
                        cost_total
                        / revenue_total
                    ) * 100,
                    2
                )
            }

    # =====================================================
    # TOP CATEGORIES
    # =====================================================

    top_categories = {}

    for column in categorical_columns[:15]:

        counts = (
            df[column]
            .astype(str)
            .value_counts()
            .head(10)
        )

        top_categories[column] = {
            str(key): int(value)
            for key, value
            in counts.items()
        }

    # =====================================================
    # PRODUCT PERFORMANCE
    # =====================================================

    product_performance = []

    if (
        product_column
        and revenue_column
    ):

        temp = df[
            [
                product_column,
                revenue_column,
            ]
        ].copy()

        temp[revenue_column] = numeric_series(
            temp,
            revenue_column
        )

        temp = temp.dropna()

        if not temp.empty:

            grouped = (
                temp
                .groupby(
                    product_column
                )[revenue_column]
                .sum()
                .sort_values(
                    ascending=False
                )
                .head(10)
            )

            for product, value in grouped.items():

                product_performance.append({
                    "product": str(product),
                    "revenue": round(
                        float(value),
                        2
                    ),
                })

    # =====================================================
    # PRODUCT PROFIT PERFORMANCE
    # =====================================================

    product_profit_performance = []

    if (
        product_column
        and profit_column
    ):

        temp = df[
            [
                product_column,
                profit_column,
            ]
        ].copy()

        temp[profit_column] = numeric_series(
            temp,
            profit_column
        )

        temp = temp.dropna()

        if not temp.empty:

            grouped = (
                temp
                .groupby(
                    product_column
                )[profit_column]
                .sum()
                .sort_values(
                    ascending=False
                )
                .head(10)
            )

            for product, value in grouped.items():

                product_profit_performance.append({
                    "product": str(product),
                    "profit": round(
                        float(value),
                        2
                    ),
                })

    # =====================================================
    # CORRELATIONS
    # =====================================================

    correlations = {}

    if len(numeric_columns) >= 2:

        try:

            corr = (
                df[numeric_columns]
                .apply(
                    pd.to_numeric,
                    errors="coerce"
                )
                .corr()
            )

            for column in numeric_columns:

                correlations[column] = {}

                for other in numeric_columns:

                    value = corr.loc[
                        column,
                        other
                    ]

                    if pd.notna(value):

                        correlations[
                            column
                        ][other] = round(
                            float(value),
                            3
                        )

        except Exception:

            correlations = {}

    # =====================================================
    # SUMMARY
    # =====================================================

    summary = {}

    for column in numeric_columns:

        values = pd.to_numeric(
            df[column],
            errors="coerce"
        )

        if values.dropna().empty:
            continue

        summary[column] = {
            "sum": round(
                float(values.sum()),
                2
            ),
            "average": round(
                float(values.mean()),
                2
            ),
            "minimum": round(
                float(values.min()),
                2
            ),
            "maximum": round(
                float(values.max()),
                2
            ),
            "count": int(
                values.count()
            ),
        }

    # =====================================================
    # CHART DATA
    # =====================================================

    chart_data = []

    chart_column = (
        revenue_column
        or (
            numeric_columns[0]
            if numeric_columns
            else None
        )
    )

    if chart_column:

        values = (
            numeric_series(
                df,
                chart_column
            )
            .dropna()
            .head(12)
        )

        for index, value in enumerate(
            values
        ):

            chart_data.append({
                "label": str(index + 1),
                "value": round(
                    float(value),
                    2
                ),
            })

    # =====================================================
    # FINAL RESULT
    # =====================================================

    return {
        "rows": int(len(df)),
        "columns": df.columns.tolist(),
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "summary": summary,
        "detected": detected,
        "customer_list": customer_list,
        "top_categories": top_categories,
        "product_performance": product_performance,
        "product_profit_performance":
            product_profit_performance,
        "correlations": correlations,
        "chart_data": chart_data,
    }


# =========================================================
# DASHBOARD
# =========================================================

@app.get("/dashboard")
def dashboard(
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    load_user_dataset(
        user_id
    )

    if current_dataset["analysis"]:

        analysis = (
            current_dataset["analysis"]
        )

        detected = analysis.get(
            "detected",
            {}
        )

        revenue = (
            detected
            .get("revenue", {})
            .get("total", 0)
        )

        orders = (
            detected
            .get("orders", {})
            .get("total", 0)
        )

        customers = (
            detected
            .get("customers", {})
            .get("unique", 0)
        )

        profit = (
            detected
            .get("profit", {})
            .get("total", 0)
        )

        profit_margin = (
            detected
            .get("profit_margin", {})
            .get("value", None)
        )

        quantity = (
            detected
            .get("quantity", {})
            .get("total", 0)
        )

        return {
            "source": "actual",
            "filename":
                current_dataset["filename"],
            "rows":
                current_dataset["rows"],
            "revenue":
                revenue,
            "orders":
                orders,
            "customers":
                customers,
            "profit":
                profit,
            "profit_margin":
                profit_margin,
            "quantity":
                quantity,
            "growth": None,
            "analysis":
                analysis,
        }

    # =====================================================
    # DEMO
    # =====================================================

    return {
        "source": "demo",
        "revenue":
            DEMO_DATA["revenue"],
        "revenue_numeric":
            DEMO_DATA["revenue_numeric"],
        "orders":
            DEMO_DATA["orders"],
        "customers":
            DEMO_DATA["customers"],
        "profit":
            DEMO_DATA["profit"],
        "profit_numeric":
            DEMO_DATA["profit_numeric"],
        "profit_margin": round(
            (
                DEMO_DATA["profit_numeric"]
                /
                DEMO_DATA["revenue_numeric"]
            ) * 100,
            2
        ),
        "growth":
            DEMO_DATA["business_growth"],
    }


# =========================================================
# UPLOAD DATA
# =========================================================

@app.post("/upload")
async def upload_data(
    file: UploadFile = File(...),
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    filename = (
        file.filename or ""
    ).strip()

    if not filename:

        raise HTTPException(
            status_code=400,
            detail="No filename provided."
        )

    extension = (
        filename
        .lower()
        .split(".")[-1]
    )

    if extension not in {
        "csv",
        "xlsx",
        "xls",
    }:

        raise HTTPException(
            status_code=400,
            detail=(
                "Only CSV, XLSX and XLS "
                "files are supported."
            )
        )

    temp_path = None

    try:

        file_bytes = await file.read()

        if not file_bytes:

            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=f".{extension}"
        ) as temp:

            temp.write(
                file_bytes
            )

            temp_path = temp.name

        # =================================================
        # READ FILE
        # =================================================

        if extension == "csv":

            try:

                df = pd.read_csv(
                    temp_path,
                    encoding="utf-8-sig"
                )

            except UnicodeDecodeError:

                df = pd.read_csv(
                    temp_path,
                    encoding="latin1"
                )

        else:

            df = pd.read_excel(
                temp_path
            )

        # =================================================
        # CLEAN DATAFRAME
        # =================================================

        if df.empty:

            raise HTTPException(
                status_code=400,
                detail=(
                    "The uploaded file contains "
                    "no usable rows."
                )
            )

        df.columns = [
            str(column)
            .replace("\ufeff", "")
            .strip()
            for column in df.columns
        ]

        df = df.dropna(
            how="all"
        )

        if df.empty:

            raise HTTPException(
                status_code=400,
                detail=(
                    "The uploaded file contains "
                    "no usable rows."
                )
            )

        # =================================================
        # SAVE
        # =================================================

        saved = save_dataframe_for_user(
            df,
            user_id,
            filename
        )

        analysis = (
            current_dataset["analysis"]
        )

        return {
            "status": "success",
            "message": (
                f"{filename} uploaded "
                "and saved successfully."
            ),
            "filename": filename,
            "rows": saved,
            "columns":
                current_dataset["columns"],
            "analysis": analysis,
            "source": "actual",
        }

    except HTTPException:
        raise

    except Exception as e:

        print(
            "Upload processing error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Dataset processing failed: "
                + str(e)
            )
        )

    finally:

        if temp_path:

            try:

                os.remove(
                    temp_path
                )

            except OSError:
                pass


# =========================================================
# DATASET STATUS
# =========================================================

@app.get("/dataset")
def get_dataset(
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    load_user_dataset(
        user_id
    )

    if current_dataset["analysis"]:

        return {
            "status": "uploaded",
            "source": "actual",
            "filename":
                current_dataset["filename"],
            "rows":
                current_dataset["rows"],
            "columns":
                current_dataset["columns"],
            "analysis":
                current_dataset["analysis"],
        }

    return {
        "status": "empty",
        "source": "actual",
        "message":
            "No business data saved yet.",
    }


# =========================================================
# CUSTOMERS
# =========================================================

@app.get("/customers")
def get_customers(
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    db = SessionLocal()

    try:

        rows = (
            db.query(
                BusinessData
            )
            .filter(
                BusinessData.user_id
                == user_id
            )
            .order_by(
                BusinessData.purchase_date.asc(),
                BusinessData.id.asc()
            )
            .all()
        )

        grouped = {}

        for r in rows:

            key = (
                r.customer_name or ""
            ).strip()

            if not key:
                continue

            item = grouped.setdefault(
                key,
                {
                    "name": key,
                    "purchase_count": 0,
                    "total_purchases": 0,
                    "total_amount": 0.0,
                    "paid_amount": 0.0,
                    "pending_amount": 0.0,
                    "last_purchase": None,
                    "status": "Active",
                }
            )

            item["purchase_count"] += 1
            item["total_purchases"] += 1

            amount = safe_float(
                r.total_amount,
                0
            )

            item[
                "total_amount"
            ] += amount

            payment_status = str(
                r.payment_status
                or "Paid"
            ).strip().lower()

            if any(
                word in payment_status
                for word in [
                    "pending",
                    "unpaid",
                    "due",
                ]
            ):

                item[
                    "pending_amount"
                ] += amount

            else:

                item[
                    "paid_amount"
                ] += amount

            if r.purchase_date:

                purchase_date = (
                    r.purchase_date
                    .isoformat()
                )

                if (
                    not item[
                        "last_purchase"
                    ]
                    or purchase_date
                    >
                    item[
                        "last_purchase"
                    ]
                ):

                    item[
                        "last_purchase"
                    ] = purchase_date

        customers = list(
            grouped.values()
        )

        for customer in customers:

            customer[
                "total_amount"
            ] = round(
                customer[
                    "total_amount"
                ],
                2
            )

            customer[
                "paid_amount"
            ] = round(
                customer[
                    "paid_amount"
                ],
                2
            )

            customer[
                "pending_amount"
            ] = round(
                customer[
                    "pending_amount"
                ],
                2
            )

            if (
                customer[
                    "pending_amount"
                ] > 0
                and customer[
                    "paid_amount"
                ] > 0
            ):

                customer[
                    "status"
                ] = "Pending"

            elif (
                customer[
                    "pending_amount"
                ] > 0
            ):

                customer[
                    "status"
                ] = "Payment Due"

            else:

                customer[
                    "status"
                ] = "Active"

        customers.sort(
            key=lambda x:
                x["total_amount"],
            reverse=True
        )

        return {
            "status": "success",
            "source": "actual",
            "total":
                len(customers),
            "customer_column":
                "Customer Name",
            "customers":
                customers,
        }

    finally:
        db.close()


# =========================================================
# REMOVE DATASET
# =========================================================

@app.delete("/remove-dataset")
def remove_dataset(
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    db = SessionLocal()

    try:

        deleted = (
            db.query(
                BusinessData
            )
            .filter(
                BusinessData.user_id
                == user_id
            )
            .delete(
                synchronize_session=False
            )
        )

        db.commit()

        load_user_dataset(
            user_id
        )

        return {
            "status": "success",
            "deleted": deleted,
            "message":
                "Business data removed successfully.",
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# EXPENSE HELPERS
# =========================================================

def parse_expense_date(value):

    try:

        return pd.to_datetime(
            value
        ).date()

    except Exception:

        raise HTTPException(
            status_code=400,
            detail="Invalid expense date."
        )


def expense_to_dict(
    expense
):

    return {
        "id": expense.id,
        "user_id": expense.user_id,
        "expense_date":
            expense.expense_date.isoformat()
            if expense.expense_date
            else None,
        "expense_name":
            expense.expense_name,
        "category":
            expense.category,
        "amount":
            float(expense.amount or 0),
        "payment_method":
            expense.payment_method,
        "vendor":
            expense.vendor or "",
        "description":
            expense.description or "",
    }


# =========================================================
# EXPENSES - GET ALL
# =========================================================

@app.get("/expenses")
def get_expenses(
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    db = SessionLocal()

    try:

        expenses = (
            db.query(
                Expense
            )
            .filter(
                Expense.user_id == user_id
            )
            .order_by(
                Expense.expense_date.desc(),
                Expense.id.desc()
            )
            .all()
        )

        return {
            "success": True,
            "expenses": [
                expense_to_dict(
                    expense
                )
                for expense in expenses
            ],
        }

    finally:
        db.close()


# =========================================================
# EXPENSES - CREATE
# =========================================================

@app.post("/expenses")
def create_expense(
    data: ExpenseCreateRequest,
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    if data.amount < 0:

        raise HTTPException(
            status_code=400,
            detail="Expense amount cannot be negative."
        )

    expense_name = (
        data.expense_name.strip()
    )

    category = (
        data.category.strip()
    )

    if not expense_name:

        raise HTTPException(
            status_code=400,
            detail="Expense name is required."
        )

    if not category:

        raise HTTPException(
            status_code=400,
            detail="Expense category is required."
        )

    expense_date = parse_expense_date(
        data.expense_date
    )

    db = SessionLocal()

    try:

        expense = Expense(
            user_id=user_id,
            expense_date=expense_date,
            expense_name=expense_name,
            category=category,
            amount=data.amount,
            payment_method=(
                data.payment_method.strip()
                or "Other"
            ),
            vendor=data.vendor.strip(),
            description=data.description.strip(),
        )

        db.add(expense)

        db.commit()

        db.refresh(expense)

        return {
            "success": True,
            "message":
                "Expense added successfully.",
            "expense":
                expense_to_dict(expense),
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# EXPENSE SUMMARY
# =========================================================

@app.get("/expenses/summary")
def get_expense_summary(
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    db = SessionLocal()

    try:

        expenses = (
            db.query(
                Expense
            )
            .filter(
                Expense.user_id == user_id
            )
            .order_by(
                Expense.expense_date.asc()
            )
            .all()
        )

        # =================================================
        # REVENUE FROM BUSINESS DATA
        # =================================================

        business_rows = (
            db.query(
                BusinessData
            )
            .filter(
                BusinessData.user_id
                == user_id
            )
            .all()
        )

        total_revenue = sum(
            safe_float(
                row.total_amount
            )
            for row in business_rows
        )

        # =================================================
        # NO EXPENSES
        # =================================================

        if not expenses:

            return {
                "success": True,
                "total_expenses": 0,
                "expense_count": 0,
                "average_expense": 0,
                "highest_expense": 0,
                "highest_expense_name": None,
                "highest_category": None,
                "category_breakdown": [],
                "payment_breakdown": [],
                "monthly_trend": [],
                "total_revenue":
                    round(total_revenue, 2),
                "net_profit":
                    round(total_revenue, 2),
                "expense_ratio": 0,
                "alerts": [],
                "health_score": 100,
                "saving_opportunities": [],
            }

        # =================================================
        # DATAFRAME
        # =================================================

        expense_rows = []

        for expense in expenses:

            expense_rows.append({
                "date":
                    expense.expense_date,
                "name":
                    expense.expense_name,
                "category":
                    expense.category or "Other",
                "amount":
                    safe_float(
                        expense.amount
                    ),
                "payment_method":
                    expense.payment_method
                    or "Other",
                "vendor":
                    expense.vendor or "",
            })

        df = pd.DataFrame(
            expense_rows
        )

        # =================================================
        # BASIC METRICS
        # =================================================

        total_expenses = safe_float(
            df["amount"].sum()
        )

        expense_count = len(df)

        average_expense = safe_float(
            df["amount"].mean()
        )

        highest_expense = safe_float(
            df["amount"].max()
        )

        highest_row = df.loc[
            df["amount"].idxmax()
        ]

        highest_expense_name = (
            str(
                highest_row["name"]
            )
        )

        # =================================================
        # CATEGORY BREAKDOWN
        # =================================================

        category_group = (
            df.groupby(
                "category"
            )["amount"]
            .sum()
            .sort_values(
                ascending=False
            )
        )

        category_breakdown = []

        for category, amount in (
            category_group.items()
        ):

            percentage = (
                (
                    amount
                    / total_expenses
                ) * 100
                if total_expenses
                else 0
            )

            category_breakdown.append({
                "category":
                    str(category),
                "amount":
                    round(
                        float(amount),
                        2
                    ),
                "percentage":
                    round(
                        float(percentage),
                        2
                    ),
            })

        highest_category = (
            category_breakdown[0]["category"]
            if category_breakdown
            else None
        )

        # =================================================
        # PAYMENT BREAKDOWN
        # =================================================

        payment_group = (
            df.groupby(
                "payment_method"
            )["amount"]
            .sum()
            .sort_values(
                ascending=False
            )
        )

        payment_breakdown = []

        for method, amount in (
            payment_group.items()
        ):

            percentage = (
                (
                    amount
                    / total_expenses
                ) * 100
                if total_expenses
                else 0
            )

            payment_breakdown.append({
                "payment_method":
                    str(method),
                "amount":
                    round(
                        float(amount),
                        2
                    ),
                "percentage":
                    round(
                        float(percentage),
                        2
                    ),
            })

        # =================================================
        # MONTHLY TREND
        # =================================================

        df["date"] = pd.to_datetime(
            df["date"],
            errors="coerce"
        )

        valid_monthly = (
            df.dropna(
                subset=["date"]
            )
            .set_index("date")
            .resample("ME")["amount"]
            .sum()
        )

        monthly_trend = []

        for date, amount in (
            valid_monthly.items()
        ):

            monthly_trend.append({
                "month":
                    date.strftime("%b %Y"),
                "amount":
                    round(
                        float(amount),
                        2
                    ),
            })

        # =================================================
        # MONEY FLOW
        # =================================================

        net_profit = (
            total_revenue
            - total_expenses
        )

        expense_ratio = (
            (
                total_expenses
                / total_revenue
            ) * 100
            if total_revenue
            else 0
        )

        # =================================================
        # ALERTS
        # =================================================

        alerts = []

        if expense_ratio >= 50:

            alerts.append({
                "type": "danger",
                "title":
                    "High Expense Ratio",
                "message":
                    (
                        "Expenses are consuming more than "
                        "50% of your revenue."
                    ),
            })

        elif expense_ratio >= 30:

            alerts.append({
                "type": "warning",
                "title":
                    "Rising Expense Ratio",
                "message":
                    (
                        "Expenses are consuming more than "
                        "30% of your revenue."
                    ),
            })

        # Category concentration

        if category_breakdown:

            top_category_percentage = (
                category_breakdown[0]["percentage"]
            )

            if top_category_percentage >= 50:

                alerts.append({
                    "type": "warning",
                    "title":
                        "Category Concentration",
                        "message":
            (
                f"{category_breakdown[0]['category']} is your "
                f"largest expense category, accounting for "
                f"{top_category_percentage:.1f}% of total expenses. "
                "Reviewing this category could help identify "
                "potential cost-saving opportunities."
            ),
    })
        # Large expense

        if (
            average_expense > 0
            and highest_expense
            > average_expense * 3
        ):

            alerts.append({
                "type": "info",
                "title":
                    "Unusually Large Expense",
                "message":
                    (
                        f"{highest_expense_name} is significantly "
                        "higher than your average expense."
                    ),
            })

        # =================================================
        # HEALTH SCORE
        # =================================================

        health_score = 100

        if expense_ratio >= 50:
            health_score -= 35

        elif expense_ratio >= 40:
            health_score -= 25

        elif expense_ratio >= 30:
            health_score -= 15

        elif expense_ratio >= 20:
            health_score -= 5

        if category_breakdown:

            concentration = (
                category_breakdown[0]["percentage"]
            )

            if concentration >= 70:
                health_score -= 20

            elif concentration >= 50:
                health_score -= 10

        if (
            average_expense > 0
            and highest_expense
            > average_expense * 3
        ):
            health_score -= 10

        health_score = max(
            0,
            min(
                100,
                health_score
            )
        )

        # =================================================
        # SAVING OPPORTUNITIES
        # =================================================

        saving_opportunities = []

        for item in category_breakdown[:3]:

            if item["percentage"] >= 20:

                potential_saving = (
                    item["amount"] * 0.10
                )

                saving_opportunities.append({
                    "category":
                        item["category"],
                    "current_amount":
                        item["amount"],
                    "percentage":
                        item["percentage"],
                    "potential_saving":
                        round(
                            potential_saving,
                            2
                        ),
                    "message":
                        (
                            f"Review {item['category']} spending "
                            "for possible savings."
                        ),
                })

        return {
            "success": True,

            "total_expenses":
                round(
                    total_expenses,
                    2
                ),

            "expense_count":
                expense_count,

            "average_expense":
                round(
                    average_expense,
                    2
                ),

            "highest_expense":
                round(
                    highest_expense,
                    2
                ),

            "highest_expense_name":
                highest_expense_name,

            "highest_category":
                highest_category,

            "category_breakdown":
                category_breakdown,

            "payment_breakdown":
                payment_breakdown,

            "monthly_trend":
                monthly_trend,

            "total_revenue":
                round(
                    total_revenue,
                    2
                ),

            "net_profit":
                round(
                    net_profit,
                    2
                ),

            "expense_ratio":
                round(
                    expense_ratio,
                    2
                ),

            "alerts":
                alerts,

            "health_score":
                health_score,

            "saving_opportunities":
                saving_opportunities,
        }

    except Exception as e:

        print(
            "Expense summary error:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# EXPENSES - UPDATE
# =========================================================

@app.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    data: ExpenseUpdateRequest,
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    if data.amount < 0:

        raise HTTPException(
            status_code=400,
            detail="Expense amount cannot be negative."
        )

    expense_name = (
        data.expense_name.strip()
    )

    category = (
        data.category.strip()
    )

    if not expense_name:

        raise HTTPException(
            status_code=400,
            detail="Expense name is required."
        )

    if not category:

        raise HTTPException(
            status_code=400,
            detail="Expense category is required."
        )

    expense_date = parse_expense_date(
        data.expense_date
    )

    db = SessionLocal()

    try:

        expense = (
            db.query(
                Expense
            )
            .filter(
                Expense.id == expense_id,
                Expense.user_id == user_id,
            )
            .first()
        )

        if not expense:

            raise HTTPException(
                status_code=404,
                detail="Expense not found."
            )

        expense.expense_date = (
            expense_date
        )

        expense.expense_name = (
            expense_name
        )

        expense.category = (
            category
        )

        expense.amount = (
            data.amount
        )

        expense.payment_method = (
            data.payment_method.strip()
            or "Other"
        )

        expense.vendor = (
            data.vendor.strip()
        )

        expense.description = (
            data.description.strip()
        )

        db.commit()

        db.refresh(
            expense
        )

        return {
            "success": True,
            "message":
                "Expense updated successfully.",
            "expense":
                expense_to_dict(expense),
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# EXPENSES - DELETE
# =========================================================

@app.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    x_user_id: int | None = Header(
        default=None
    )
):

    user_id = require_user_id(
        x_user_id
    )

    db = SessionLocal()

    try:

        expense = (
            db.query(
                Expense
            )
            .filter(
                Expense.id == expense_id,
                Expense.user_id == user_id,
            )
            .first()
        )

        if not expense:

            raise HTTPException(
                status_code=404,
                detail="Expense not found."
            )

        db.delete(
            expense
        )

        db.commit()

        return {
            "success": True,
            "message":
                "Expense deleted successfully.",
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:
        db.close()


# =========================================================
# PRISM AI
# =========================================================

def is_greeting(
    message: str
):

    normalized = (
        message
        .strip()
        .lower()
        .replace("!", "")
        .replace(".", "")
        .replace("?", "")
        .replace(",", "")
    )

    greetings = {
        "hi",
        "hello",
        "hey",
        "hii",
        "hiii",
        "yo",
        "good morning",
        "good afternoon",
        "good evening",
    }

    return normalized in greetings


# =========================================================
# INTENT DETECTION
# =========================================================

def detect_intent(message):

    text = (
        message
        .lower()
        .strip()
    )

    # GREETING
    if is_greeting(text):
        return "greeting"

    # EXPENSES
    if any(
        phrase in text
        for phrase in [
            "expense",
            "expenses",
            "spending",
            "spent",
            "expense ratio",
            "highest expense",
            "biggest expense",
            "largest expense",
            "expense category",
            "expense health",
            "money flow",
            "cost saving",
            "cost saving opportunity",
            "saving opportunity",
            "total spending",
            "total expense",
            "how much did i spend",
            "how much have i spent",

            "save money",
            "how can i save money",
            "ways to save money",
            "reduce my spending",
        ]
    ):
        return "expenses"

    # LOSS
    if any(
        phrase in text
        for phrase in [
            "loss",
            "losses",
            "losing money",
            "am i losing",
            "money lost",
            "negative profit",
            "negative margin",
        ]
    ):
        return "loss"

    # FORECAST
    if any(
        phrase in text
        for phrase in [
            "forecast",
            "predict",
            "prediction",
            "next month",
            "future revenue",
            "future sales",
            "future profit",
            "what will my revenue",
            "expected revenue",
        ]
    ):
        return "forecast"

    # PROFIT ADVICE
    if any(
        phrase in text
        for phrase in [
            "increase profit",
            "improve profit",
            "grow profit",
            "increase my profit",
            "how do i increase profit",
            "how can i increase profit",
            "make more profit",
            "more profitable",
            "improve profitability",
            "reduce cost",
            "reduce costs",
            "cut costs",
            "lower expenses",
            "improve margin",
        ]
    ):
        return "profit_advice"

    # RECOMMENDATION
    if any(
        phrase in text
        for phrase in [
            "what should i do",
            "what should i improve",
            "what should i focus on",
            "where should i focus",
            "recommend",
            "recommendation",
            "suggest",
            "suggestion",
            "opportunity",
            "opportunities",
            "how can i improve",
            "how should i improve",
        ]
    ):
        return "recommendation"

    # TOP PRODUCT
    if any(
        phrase in text
        for phrase in [
            "top product",
            "best product",
            "best selling product",
            "best-selling product",
            "highest selling",
            "highest revenue product",
            "most profitable product",
            "which product is best",
        ]
    ):
        return "top_product"

    # PRODUCT
    if (
        "product" in text
        or "products" in text
    ):
        return "product"

    # PROFIT
    if any(
        phrase in text
        for phrase in [
            "profit",
            "profits",
            "profitable",
            "profit margin",
            "margin",
        ]
    ):
        return "profit"

    # COST
    if any(
        phrase in text
        for phrase in [
            "cost",
            "costs",
        ]
    ):
        return "cost"

    # CUSTOMERS
    if any(
        phrase in text
        for phrase in [
            "customer",
            "customers",
            "clients",
            "client",
        ]
    ):
        return "customers"

    # SALES
    if any(
        phrase in text
        for phrase in [
            "sales",
            "sale",
            "orders",
            "order",
            "selling",
            "units sold",
            "quantity",
        ]
    ):
        return "sales"

    # REVENUE
    if any(
        phrase in text
        for phrase in [
            "revenue",
            "income",
            "turnover",
            "earnings",
        ]
    ):
        return "revenue"

    # GENERAL ANALYSIS
    if any(
        phrase in text
        for phrase in [
            "performance",
            "analyze",
            "analyse",
            "analysis",
            "business health",
            "business performance",
            "overview",
            "summary",
            "insight",
            "insights",
        ]
    ):
        return "analysis"

    return "general"


# =========================================================
# EXPENSE AI ANSWER
# =========================================================

def answer_expense_question(
    user_id,
    message
):
    db = SessionLocal()

    try:
        expenses = (
            db.query(Expense)
            .filter(
                Expense.user_id == user_id
            )
            .all()
        )

        if not expenses:
            return (
                "You don't have any expenses recorded yet. "
                "Add some expenses in the Expenses section "
                "and I'll analyze your spending."
            )

        expense_rows = []

        for expense in expenses:
            expense_rows.append({
                "date": expense.expense_date,
                "name": expense.expense_name,
                "category": expense.category or "Other",
                "amount": safe_float(
                    expense.amount
                ),
                "payment_method": (
                    expense.payment_method
                    or "Other"
                ),
                "vendor": expense.vendor or "",
            })

        df = pd.DataFrame(expense_rows)

        # =====================================================
        # BASIC EXPENSE METRICS
        # =====================================================

        total = safe_float(
            df["amount"].sum()
        )

        expense_count = len(df)

        average = (
            safe_float(
                df["amount"].mean()
            )
            if expense_count
            else 0
        )

        highest_index = df["amount"].idxmax()

        highest = df.loc[
            highest_index
        ]

        # =====================================================
        # CATEGORY ANALYSIS
        # =====================================================

        category_totals = (
            df.groupby(
                "category"
            )["amount"]
            .sum()
            .sort_values(
                ascending=False
            )
        )

        top_category = (
            category_totals.index[0]
            if len(category_totals)
            else "Other"
        )

        top_category_amount = (
            safe_float(
                category_totals.iloc[0]
            )
            if len(category_totals)
            else 0
        )

        # =====================================================
        # PAYMENT METHOD ANALYSIS
        # =====================================================

        payment_totals = (
            df.groupby(
                "payment_method"
            )["amount"]
            .sum()
            .sort_values(
                ascending=False
            )
        )

        top_payment_method = (
            payment_totals.index[0]
            if len(payment_totals)
            else "Other"
        )

        top_payment_amount = (
            safe_float(
                payment_totals.iloc[0]
            )
            if len(payment_totals)
            else 0
        )

        # =====================================================
        # BUSINESS REVENUE
        # =====================================================

        business_rows = (
            db.query(
                BusinessData
            )
            .filter(
                BusinessData.user_id
                == user_id
            )
            .all()
        )

        revenue = sum(
            safe_float(
                row.total_amount
            )
            for row in business_rows
        )

        ratio = (
            (
                total / revenue
            ) * 100
            if revenue
            else 0
        )

        net_profit = (
            revenue - total
        )

        # =====================================================
        # USER MESSAGE
        # =====================================================

        text = (
            message
            .lower()
            .strip()
        )

        # =====================================================
        # TOTAL EXPENSE
        # =====================================================

        if (
            "total expense" in text
            or "total expenses" in text
            or "total spending" in text
            or "how much did i spend" in text
            or "how much have i spent" in text
            or "spend" in text
        ):
            return (
                f"Your total recorded expenses are "
                f"**{format_inr(total)}** across "
                f"**{expense_count} expense records**.\n\n"
                f"Your average expense is "
                f"**{format_inr(average)}**."
            )

        # =====================================================
        # HIGHEST SINGLE EXPENSE
        # =====================================================

        if (
            "highest expense" in text
            or "biggest expense" in text
            or "largest expense" in text
            or "most expensive" in text
        ):
            return (
                f"Your highest single expense is "
                f"**{highest['name']}** at "
                f"**{format_inr(highest['amount'])}**.\n\n"
                f"Category: **{highest['category']}**\n"
                f"Payment method: **{highest['payment_method']}**"
            )

        # =====================================================
        # HIGHEST EXPENSE CATEGORY
        # =====================================================

        if (
            "highest category" in text
            or "biggest category" in text
            or "top expense category" in text
            or "which category" in text
            or "most expense category" in text
            or "most spending category" in text
        ):
            percentage = (
                (
                    top_category_amount
                    / total
                ) * 100
                if total
                else 0
            )

            return (
                f"Your highest expense category is "
                f"**{top_category}**, with "
                f"**{format_inr(top_category_amount)}** spent.\n\n"
                f"That represents approximately "
                f"**{percentage:.1f}%** of your total expenses."
            )

        # =====================================================
        # SPECIFIC CATEGORY EXPENSE
        # =====================================================

        matched_category = None

        for category in category_totals.index:
            if category.lower() in text:
                matched_category = category
                break

        if matched_category:
            category_amount = safe_float(
                category_totals[
                    matched_category
                ]
            )

            category_percentage = (
                (
                    category_amount
                    / total
                ) * 100
                if total
                else 0
            )

            return (
                f"You spent "
                f"**{format_inr(category_amount)}** "
                f"on **{matched_category}**.\n\n"
                f"That's approximately "
                f"**{category_percentage:.1f}%** "
                f"of your total expenses."
            )

        # =====================================================
        # PAYMENT METHOD
        # =====================================================

        matched_payment = None

        for payment in payment_totals.index:
            if payment.lower() in text:
                matched_payment = payment
                break

        if matched_payment:
            payment_amount = safe_float(
                payment_totals[
                    matched_payment
                ]
            )

            return (
                f"You spent "
                f"**{format_inr(payment_amount)}** "
                f"using **{matched_payment}**."
            )

        # =====================================================
        # PAYMENT SUMMARY
        # =====================================================

        if (
            "payment method" in text
            or "payment methods" in text
            or "paid by" in text
            or "payment breakdown" in text
        ):
            payment_lines = []

            for payment, amount in payment_totals.items():
                payment_lines.append(
                    f"• **{payment}** — "
                    f"{format_inr(amount)}"
                )

            return (
                "Here's your expense breakdown by "
                "payment method:\n\n"
                + "\n".join(payment_lines)
            )

        # =====================================================
        # CATEGORY BREAKDOWN
        # =====================================================

        if (
            "category breakdown" in text
            or "expense breakdown" in text
            or "breakdown" in text
        ):
            category_lines = []

            for category, amount in category_totals.items():
                category_lines.append(
                    f"• **{category}** — "
                    f"{format_inr(amount)}"
                )

            return (
                "Here's your expense breakdown by category:\n\n"
                + "\n".join(category_lines)
            )

        # =====================================================
        # EXPENSE RATIO
        # =====================================================

        if (
            "ratio" in text
            or "expense ratio" in text
        ):
            if revenue:
                return (
                    f"Your total expenses are "
                    f"**{format_inr(total)}**, while revenue is "
                    f"**{format_inr(revenue)}**.\n\n"
                    f"Your expense ratio is approximately "
                    f"**{ratio:.2f}%**."
                )

            return (
                f"Your total expenses are "
                f"**{format_inr(total)}**.\n\n"
                "I can't calculate the expense ratio because "
                "no business revenue is available yet."
            )

        # =====================================================
        # NET PROFIT
        # =====================================================

        if (
            "net profit" in text
            or "profit after expense" in text
            or "profit after expenses" in text
        ):
            if revenue:
                return (
                    f"Your current revenue is "
                    f"**{format_inr(revenue)}** and your "
                    f"recorded expenses are "
                    f"**{format_inr(total)}**.\n\n"
                    f"Your estimated net profit is "
                    f"**{format_inr(net_profit)}**."
                )

            return (
                f"Your expenses are "
                f"**{format_inr(total)}**, but I don't have "
                "business revenue available to calculate net profit."
            )

        # =====================================================
        # AVERAGE EXPENSE
        # =====================================================

        if (
            "average" in text
            or "avg" in text
            or "average expense" in text
        ):
            return (
                f"Your average expense is "
                f"**{format_inr(average)}** "
                f"across **{expense_count} expense records**."
            )

        # =====================================================
        # EXPENSE COUNT
        # =====================================================

        if (
            "how many expenses" in text
            or "number of expenses" in text
            or "expense records" in text
            or "expense count" in text
        ):
            return (
                f"You currently have "
                f"**{expense_count} expense records** "
                f"with total spending of "
                f"**{format_inr(total)}**."
            )

        # =====================================================
        # EXPENSE HEALTH
        # =====================================================

        if (
            "health" in text
            or "healthy" in text
            or "expense health" in text
        ):
            health = 100

            if ratio >= 50:
                health -= 35
            elif ratio >= 40:
                health -= 25
            elif ratio >= 30:
                health -= 15
            elif ratio >= 20:
                health -= 5

            if total and (
                top_category_amount / total
            ) >= 0.5:
                health -= 10

            health = max(
                0,
                health
            )

            return (
                f"Your Expense Health Score is "
                f"**{health}/100**.\n\n"
                f"Total expenses: **{format_inr(total)}**\n"
                f"Expense ratio: **{ratio:.2f}%**\n"
                f"Largest category: **{top_category}**"
            )

        # =====================================================
        # SAVING OPPORTUNITIES
        # =====================================================

        if (
            "saving" in text
            or "save money" in text
            or "reduce expense" in text
            or "reduce expenses" in text
            or "cut cost" in text
            or "cut costs" in text
            or "cost saving" in text
            or "cost savings" in text
        ):
            possible_saving = (
                top_category_amount * 0.10
            )

            return (
                f"Your biggest spending area is "
                f"**{top_category}** at "
                f"**{format_inr(top_category_amount)}**.\n\n"
                f"A 10% reduction in this category could "
                f"potentially save around "
                f"**{format_inr(possible_saving)}**.\n\n"
                "Reviewing vendors, recurring costs and "
                "unnecessary purchases in this category "
                "could help reduce spending."
            )

        # =====================================================
        # MONTHLY EXPENSE
        # =====================================================

        if (
            "monthly" in text
            or "this month" in text
            or "month expense" in text
            or "month spending" in text
        ):
            df["date"] = pd.to_datetime(
                df["date"],
                errors="coerce"
            )

            current_month = pd.Timestamp.now().month
            current_year = pd.Timestamp.now().year

            monthly_df = df[
                (df["date"].dt.month == current_month)
                & (df["date"].dt.year == current_year)
            ]

            monthly_total = safe_float(
                monthly_df["amount"].sum()
            )

            return (
                f"Your expenses for the current month "
                f"are **{format_inr(monthly_total)}** "
                f"across **{len(monthly_df)} records**."
            )

        # =====================================================
        # GENERAL EXPENSE SUMMARY
        # =====================================================

        return (
            f"Your total recorded expenses are "
            f"**{format_inr(total)}** across "
            f"**{expense_count} records**.\n\n"
            f"Highest category: **{top_category}**\n"
            f"Average expense: **{format_inr(average)}**\n"
            f"Highest single expense: "
            f"**{format_inr(highest['amount'])}**\n"
            f"Top payment method: **{top_payment_method}** "
            f"({format_inr(top_payment_amount)})"
        )

    except Exception as e:
        print(
            "Expense AI error:",
            repr(e)
        )

        return (
            "I couldn't analyze your expenses right now."
        )

    finally:
        db.close()

# =========================================================
# REVENUE FORECAST
# =========================================================

def calculate_revenue_forecast():

    analysis = (
        current_dataset.get(
            "analysis"
        )
        or {}
    )

    detected = analysis.get(
        "detected",
        {}
    )

    revenue_info = detected.get(
        "revenue"
    )

    date_info = detected.get(
        "date"
    )

    if (
        not revenue_info
        or not date_info
    ):

        return None

    revenue_column = (
        revenue_info.get(
            "column"
        )
    )

    date_column = (
        date_info.get(
            "column"
        )
    )

    if (
        not revenue_column
        or not date_column
    ):

        return None

    try:

        df = pd.DataFrame(
            current_dataset["data"]
        )

        dates = pd.to_datetime(
            df[date_column],
            errors="coerce"
        )

        revenues = numeric_series(
            df,
            revenue_column
        )

        temp = pd.DataFrame({
            "date": dates,
            "revenue": revenues,
        }).dropna()

        if len(temp) < 3:
            return None

        temp = temp.sort_values(
            "date"
        )

        monthly = (
            temp
            .set_index("date")
            .resample("ME")[
                "revenue"
            ]
            .sum()
            .dropna()
        )

        if len(monthly) < 2:
            return None

        recent = monthly.tail(
            min(
                6,
                len(monthly)
            )
        )

        x = list(
            range(len(recent))
        )

        y = [
            safe_float(value)
            for value in recent.values
        ]

        if len(y) < 2:
            return None

        n = len(x)

        x_mean = (
            sum(x) / n
        )

        y_mean = (
            sum(y) / n
        )

        numerator = sum(
            (
                x[i] - x_mean
            )
            *
            (
                y[i] - y_mean
            )
            for i in range(n)
        )

        denominator = sum(
            (
                x[i] - x_mean
            ) ** 2
            for i in range(n)
        )

        if denominator == 0:
            slope = 0
        else:
            slope = (
                numerator
                / denominator
            )

        intercept = (
            y_mean
            - slope * x_mean
        )

        next_x = len(x)

        forecast = (
            intercept
            + slope * next_x
        )

        forecast = max(
            0,
            forecast
        )

        last_revenue = y[-1]

        if last_revenue != 0:

            growth = (
                (
                    forecast
                    - last_revenue
                )
                / last_revenue
            ) * 100

        else:

            growth = 0

        return {
            "forecast":
                round(
                    forecast,
                    2
                ),
            "growth":
                round(
                    growth,
                    2
                ),
            "months_used":
                len(recent),
            "last_period_revenue":
                round(
                    last_revenue,
                    2
                ),
        }

    except Exception as e:

        print(
            "Forecast calculation error:",
            repr(e)
        )

        return None


# =========================================================
# ACTUAL DATA ANSWERS
# =========================================================

def answer_from_actual_dataset(
    intent,
    message
):

    analysis = (
        current_dataset.get(
            "analysis"
        )
        or {}
    )

    detected = analysis.get(
        "detected",
        {}
    )

    # =====================================================
    # GREETING
    # =====================================================

    if intent == "greeting":

        return (
            "👋 Hi! I'm PRISM AI. "
            "I can analyze your uploaded "
            "business data and help you "
            "understand revenue, profit, "
            "sales, customers, products, "
            "costs and trends."
        )

    # =====================================================
    # REVENUE
    # =====================================================

    if intent == "revenue":

        revenue = detected.get(
            "revenue"
        )

        if not revenue:

            return (
                "Revenue information is not "
                "available in your uploaded dataset."
            )

        return (
            f"Your total revenue is "
            f"**{format_inr(revenue['total'])}**.\n\n"
            f"The average revenue per record is "
            f"**{format_inr(revenue.get('average', 0))}**."
        )

    # =====================================================
    # PROFIT
    # =====================================================

    if intent == "profit":

        profit = detected.get(
            "profit"
        )

        if not profit:

            return (
                "Profit information is not "
                "available in your uploaded dataset."
            )

        answer = (
            f"Your total profit is "
            f"**{format_inr(profit['total'])}**."
        )

        margin = detected.get(
            "profit_margin"
        )

        if margin:

            answer += (
                f"\n\nYour profit margin is approximately "
                f"**{margin['value']:.2f}%**."
            )

        return answer

    # =====================================================
    # LOSS
    # =====================================================

    if intent == "loss":

        revenue_info = detected.get(
            "revenue"
        )

        profit_info = detected.get(
            "profit"
        )

        cost_info = detected.get(
            "cost"
        )

        if not revenue_info:

            return (
                "I can't determine your loss position "
                "because revenue information is not "
                "available in the uploaded dataset."
            )

        revenue = safe_float(
            revenue_info["total"]
        )

        if profit_info:

            profit = safe_float(
                profit_info["total"]
            )

            if profit < 0:

                return (
                    f"Yes. Your dataset shows a loss of "
                    f"**{format_inr(abs(profit))}**."
                )

            return (
                f"You are **not currently showing a loss** "
                f"based on the uploaded data.\n\n"
                f"Revenue: **{format_inr(revenue)}**\n"
                f"Profit: **{format_inr(profit)}**"
            )

        if cost_info:

            cost = safe_float(
                cost_info["total"]
            )

            result = (
                revenue - cost
            )

            if result < 0:

                return (
                    f"Your estimated loss is "
                    f"**{format_inr(abs(result))}** "
                    f"because costs exceed revenue."
                )

            return (
                f"You are not showing a loss based on "
                f"revenue versus detected costs.\n\n"
                f"Revenue: **{format_inr(revenue)}**\n"
                f"Costs: **{format_inr(cost)}**"
            )

        return (
            "I don't have enough information to calculate "
            "your loss accurately. I need profit or cost "
            "information in the uploaded dataset."
        )

    # =====================================================
    # COST
    # =====================================================

    if intent == "cost":

        cost = detected.get(
            "cost"
        )

        if not cost:

            return (
                "Cost or expense information is not available "
                "in your uploaded dataset."
            )

        answer = (
            f"Your total detected costs/expenses are "
            f"**{format_inr(cost['total'])}**."
        )

        ratio = detected.get(
            "cost_ratio"
        )

        if ratio:

            answer += (
                f"\n\nCosts represent approximately "
                f"**{ratio['value']:.2f}%** of your revenue."
            )

        return answer

    # =====================================================
    # SALES
    # =====================================================

    if intent == "sales":

        orders = detected.get(
            "orders"
        )

        quantity = detected.get(
            "quantity"
        )

        if not orders:

            return (
                "Order or sales information "
                "is not available in your dataset."
            )

        answer = (
            f"Your total orders/transactions are "
            f"**{orders['total']:,.0f}**."
        )

        if quantity:

            answer += (
                f"\n\nTotal quantity sold is "
                f"**{quantity['total']:,.0f}**."
            )

        return answer

    # =====================================================
    # CUSTOMERS
    # =====================================================

    if intent == "customers":

        customers = detected.get(
            "customers"
        )

        if not customers:

            return (
                "Customer information is not available "
                "in your uploaded dataset. Make sure your "
                "dataset contains a Customer Name, Customer "
                "ID, Client, or similar column."
            )

        return (
            f"Your dataset contains "
            f"**{customers['unique']:,} unique customers** "
            f"from the column "
            f"**{customers['column']}**."
        )

    # =====================================================
    # TOP PRODUCT
    # =====================================================

    if intent == "top_product":

        products = analysis.get(
            "product_performance",
            []
        )

        if not products:

            return (
                "I couldn't determine your top product. "
                "I need both a product column and a "
                "revenue/sales column."
            )

        top = products[0]

        return (
            f"Your top product by revenue is "
            f"**{top['product']}**, generating "
            f"**{format_inr(top['revenue'])}**."
        )

    # =====================================================
    # PRODUCT
    # =====================================================

    if intent == "product":

        products = analysis.get(
            "product_performance",
            []
        )

        if not products:

            return (
                "Product-level revenue information is not "
                "available in your uploaded dataset."
            )

        lines = [
            "Here are your top products by revenue:"
        ]

        for index, item in enumerate(
            products[:5],
            start=1
        ):

            lines.append(
                f"{index}. **{item['product']}** — "
                f"{format_inr(item['revenue'])}"
            )

        return "\n".join(
            lines
        )

    # =====================================================
    # FORECAST
    # =====================================================

    if intent == "forecast":

        forecast = (
            calculate_revenue_forecast()
        )

        if not forecast:

            return (
                "I can't generate a reliable revenue forecast "
                "from this dataset yet. I need at least a few "
                "historical time periods with both date and "
                "revenue data."
            )

        direction = (
            "increase"
            if forecast["growth"] >= 0
            else "decrease"
        )

        return (
            f"Based on the recent historical revenue trend, "
            f"your estimated next-period revenue is "
            f"**{format_inr(forecast['forecast'])}**.\n\n"
            f"This represents an estimated "
            f"**{abs(forecast['growth']):.2f}% {direction}** "
            f"from the latest period."
        )

    # =====================================================
    # PROFIT ADVICE
    # =====================================================

    if intent == "profit_advice":

        revenue = detected.get(
            "revenue"
        )

        profit = detected.get(
            "profit"
        )

        cost = detected.get(
            "cost"
        )

        products = analysis.get(
            "product_performance",
            []
        )

        recommendations = []

        if profit and revenue:

            revenue_value = safe_float(
                revenue["total"]
            )

            profit_value = safe_float(
                profit["total"]
            )

            if revenue_value != 0:

                margin = (
                    profit_value
                    / revenue_value
                ) * 100

                if margin < 10:

                    recommendations.append(
                        f"Your current profit margin is about "
                        f"**{margin:.2f}%**, so improving margins "
                        f"should be a priority."
                    )

                elif margin < 20:

                    recommendations.append(
                        f"Your profit margin is about "
                        f"**{margin:.2f}%**. Look for opportunities "
                        f"to reduce unnecessary costs."
                    )

                else:

                    recommendations.append(
                        f"Your profit margin is about "
                        f"**{margin:.2f}%**, giving you a "
                        f"reasonable base to scale from."
                    )

        if cost and revenue:

            revenue_value = safe_float(
                revenue["total"]
            )

            cost_value = safe_float(
                cost["total"]
            )

            if revenue_value != 0:

                cost_ratio = (
                    cost_value
                    / revenue_value
                ) * 100

                recommendations.append(
                    f"Your detected costs are around "
                    f"**{cost_ratio:.2f}% of revenue**. "
                    f"Reducing avoidable expenses can improve profit."
                )

        if products:

            top = products[0]

            recommendations.append(
                f"Your highest-revenue product is "
                f"**{top['product']}**. Consider focusing "
                f"marketing and upselling around products "
                f"that already demonstrate strong demand."
            )

        if not recommendations:

            return (
                "I need revenue, profit or cost information "
                "from your dataset to give you a data-backed "
                "profit improvement strategy."
            )

        return (
            "Based on your uploaded data, here are the "
            "most useful areas to focus on:\n\n"
            +
            "\n\n".join(
                f"• {item}"
                for item in recommendations
            )
        )

    # =====================================================
    # RECOMMENDATION
    # =====================================================

    if intent == "recommendation":

        products = analysis.get(
            "product_performance",
            []
        )

        revenue = detected.get(
            "revenue"
        )

        profit = detected.get(
            "profit"
        )

        recommendations = []

        if products:

            top = products[0]

            recommendations.append(
                f"Focus on **{top['product']}**, "
                f"your highest-revenue product, which "
                f"generated **{format_inr(top['revenue'])}**."
            )

        if revenue and profit:

            revenue_value = safe_float(
                revenue["total"]
            )

            profit_value = safe_float(
                profit["total"]
            )

            if revenue_value:

                margin = (
                    profit_value
                    / revenue_value
                ) * 100

                recommendations.append(
                    f"Your current profit margin is "
                    f"**{margin:.2f}%**. Monitor this closely "
                    f"while scaling sales."
                )

        cost = detected.get(
            "cost"
        )

        if cost and revenue:

            cost_value = safe_float(
                cost["total"]
            )

            revenue_value = safe_float(
                revenue["total"]
            )

            if revenue_value:

                ratio = (
                    cost_value
                    / revenue_value
                ) * 100

                recommendations.append(
                    f"Detected costs are about "
                    f"**{ratio:.2f}% of revenue**, so "
                    f"cost control is another opportunity."
                )

        if not recommendations:

            return (
                "I need more recognizable business metrics "
                "to provide data-backed recommendations."
            )

        return (
            "Based on your uploaded data:\n\n"
            +
            "\n\n".join(
                f"• {item}"
                for item in recommendations
            )
        )

    # =====================================================
    # GENERAL ANALYSIS
    # =====================================================

    if intent == "analysis":

        parts = []

        revenue = detected.get(
            "revenue"
        )

        profit = detected.get(
            "profit"
        )

        orders = detected.get(
            "orders"
        )

        customers = detected.get(
            "customers"
        )

        products = analysis.get(
            "product_performance",
            []
        )

        if revenue:

            parts.append(
                f"Revenue: "
                f"**{format_inr(revenue['total'])}**"
            )

        if profit:

            parts.append(
                f"Profit: "
                f"**{format_inr(profit['total'])}**"
            )

        if orders:

            parts.append(
                f"Orders/Transactions: "
                f"**{orders['total']:,.0f}**"
            )

        if customers:

            parts.append(
                f"Unique customers: "
                f"**{customers['unique']:,}**"
            )

        if products:

            parts.append(
                f"Top product: "
                f"**{products[0]['product']}**"
            )

        if not parts:

            return (
                "I couldn't find enough recognizable business "
                "metrics in the uploaded dataset."
            )

        return (
            "Here's a data-backed snapshot "
            "of your business:\n\n"
            +
            "\n".join(
                f"• {item}"
                for item in parts
            )
        )

    return None


# =========================================================
# DEMO DATA ANSWERS
# =========================================================

def answer_from_demo(
    intent,
    message
):

    if intent == "greeting":

        return (
            "👋 Hi! I'm PRISM AI. "
            "I can analyze PulseIQ's demo business "
            "data and help you with revenue, profit, "
            "sales, customers, products and business "
            "decisions."
        )

    if intent == "revenue":

        return (
            f"Your total revenue is "
            f"**{DEMO_DATA['revenue']}**."
        )

    if intent == "profit":

        return (
            f"Your total profit is "
            f"**{DEMO_DATA['profit']}**."
        )

    if intent == "loss":

        revenue = DEMO_DATA[
            "revenue_numeric"
        ]

        profit = DEMO_DATA[
            "profit_numeric"
        ]

        costs = (
            revenue - profit
        )

        return (
            f"You are **not currently showing a loss** "
            f"in the demo data.\n\n"
            f"Revenue: **{DEMO_DATA['revenue']}**\n"
            f"Profit: **{DEMO_DATA['profit']}**\n"
            f"Implied costs: approximately "
            f"**{format_inr(costs)}**."
        )

    if intent == "cost":

        costs = (
            DEMO_DATA["revenue_numeric"]
            -
            DEMO_DATA["profit_numeric"]
        )

        return (
            f"Your implied costs in the demo data are "
            f"approximately **{format_inr(costs)}**."
        )

    if intent == "sales":

        return (
            f"Your total orders are "
            f"**{DEMO_DATA['orders']:,}**."
        )

    if intent == "customers":

        return (
            f"You have "
            f"**{DEMO_DATA['customers']:,} customers**."
        )

    if intent == "top_product":

        return (
            f"Your top product is "
            f"**{DEMO_DATA['top_product']}**, "
            f"generating "
            f"**{DEMO_DATA['top_product_revenue']}** "
            f"from "
            f"**{DEMO_DATA['top_product_sales']} sales**."
        )

    if intent == "forecast":

        return (
            "A reliable revenue forecast requires "
            "historical time-based revenue data. "
            "The current demo summary does not "
            "contain enough historical data."
        )

    if intent == "profit_advice":

        revenue = DEMO_DATA[
            "revenue_numeric"
        ]

        profit = DEMO_DATA[
            "profit_numeric"
        ]

        margin = (
            profit
            / revenue
        ) * 100

        return (
            f"Based on the demo data, your profit margin "
            f"is approximately **{margin:.2f}%**.\n\n"
            f"To improve profit, focus on:\n"
            f"• reducing unnecessary costs\n"
            f"• improving margins on high-revenue products\n"
            f"• increasing sales of your strongest products\n"
            f"• monitoring customer and order trends"
        )

    if intent == "recommendation":

        return (
            f"Based on the demo data, your strongest visible "
            f"opportunity is your top product, "
            f"**{DEMO_DATA['top_product']}**, which generates "
            f"**{DEMO_DATA['top_product_revenue']}**.\n\n"
            f"Focus on products with strong demand, control "
            f"costs, and use customer/order trends to identify "
            f"where additional sales can be generated."
        )

    if intent == "analysis":

        return (
            f"Here's your current PulseIQ demo snapshot:\n\n"
            f"• Revenue: **{DEMO_DATA['revenue']}**\n"
            f"• Profit: **{DEMO_DATA['profit']}**\n"
            f"• Orders: **{DEMO_DATA['orders']:,}**\n"
            f"• Customers: **{DEMO_DATA['customers']:,}**\n"
            f"• Business growth: **{DEMO_DATA['business_growth']}**\n"
            f"• Top product: **{DEMO_DATA['top_product']}**"
        )

    return None


# =========================================================
# GEMINI CONTEXT
# =========================================================

def build_ai_context(
    source
):

    if source == "actual":

        return {
            "data_source":
                "actual uploaded business data",
            "filename":
                current_dataset["filename"],
            "rows":
                current_dataset["rows"],
            "columns":
                current_dataset["columns"],
            "analysis":
                current_dataset["analysis"],
            "sample_data":
                current_dataset["data"],
        }

    return {
        "data_source":
            "PulseIQ demo data",
        "metrics":
            DEMO_DATA,
    }


# =========================================================
# GEMINI
# =========================================================

def ask_gemini(
    user_message,
    source
):

    if not gemini_client:
        return None

    context = build_ai_context(
        source
    )

    prompt = f"""
You are PRISM AI, the business intelligence assistant
inside PulseIQ.

You are answering a user using ONLY the selected data source.

SELECTED DATA SOURCE:

{source}

USER QUESTION:

{user_message}

BUSINESS DATA:

{json.dumps(context, indent=2, default=str)}

IMPORTANT RULES:

1. Use ONLY the selected data source.
2. Never mix uploaded data with demo data.
3. Never invent a number.
4. Never invent a percentage.
5. Never invent a product.
6. Never invent a customer count.
7. Never invent revenue.
8. Never invent profit.
9. Never invent sales or orders.
10. Never claim a metric exists if it is not present.
11. If the user asks for advice, recommendations, causes,
    strategies or explanations, use the available data.
12. Give practical data-backed recommendations.
13. If the user asks about loss, distinguish clearly between
    accounting loss and revenue/profit differences.
14. If the exact requested metric is unavailable, explain that.
15. Do not ask the user to select a data source again.
16. Do not mention Gemini, APIs, backend or prompts.
17. Be concise but useful.
18. Use simple business language.
19. Show calculations when useful.
20. Answer the actual question directly.

Return ONLY the answer that should be shown to the user.
"""

    try:

        response = (
            gemini_client
            .models
            .generate_content(
                model="gemini-3.6-flash",
                contents=prompt
            )
        )

        if (
            response
            and response.text
        ):

            return (
                response.text.strip()
            )

    except Exception as e:

        print(
            "Gemini error:",
            repr(e)
        )

    return None


# =========================================================
# PRISM AI ENDPOINT
# =========================================================

@app.post("/ai")
def prism_ai(
    data: AIRequest,
    x_user_id: int | None = Header(
        default=None
    )
):

    print(
        "Prism AI question:",
        data.message
    )

    source = (
        data.source.lower().strip()
        if data.source
        else None
    )

    # =====================================================
    # SOURCE VALIDATION
    # =====================================================

    if source not in {
        "demo",
        "actual",
    }:

        return {
            "type":
                "source_selection",
            "reply":
                (
                    "Which data should I use "
                    "for this analysis?"
                ),
            "options": [
                {
                    "label":
                        "My Uploaded Data",
                    "value":
                        "actual",
                },
                {
                    "label":
                        "Demo Data",
                    "value":
                        "demo",
                },
            ],
        }

    # =====================================================
    # ACTUAL DATA
    # =====================================================

    user_id = None

    if source == "actual":

        user_id = require_user_id(
            x_user_id
        )

        load_user_dataset(
            user_id
        )

        if not current_dataset[
            "analysis"
        ]:

            # Expense data can still exist
            # even when business dataset is empty.

            db = SessionLocal()

            try:

                expense_exists = (
                    db.query(Expense)
                    .filter(
                        Expense.user_id
                        == user_id
                    )
                    .first()
                    is not None
                )

            finally:
                db.close()

            if not expense_exists:

                return {
                    "reply":
                        (
                            "You haven't uploaded a dataset yet. "
                            "Please upload your CSV or Excel file first."
                        ),
                    "source":
                        "actual",
                }

    print(
        "Prism AI data source:",
        source
    )

    # =====================================================
    # INTENT
    # =====================================================

    intent = detect_intent(
        data.message
    )

    print(
        "Prism AI intent:",
        intent
    )

    # =====================================================
    # EXPENSE QUESTIONS
    # =====================================================

    if (
        intent == "expenses"
        and source == "actual"
    ):

        expense_reply = (
            answer_expense_question(
                user_id,
                data.message
            )
        )

        return {
            "reply":
                expense_reply,
            "source":
                source,
        }

    # =====================================================
    # DEMO EXPENSE FALLBACK
    # =====================================================

    if (
        intent == "expenses"
        and source == "demo"
    ):

        return {
            "reply": (
                "Expense intelligence is available for "
                "your recorded expenses. Add expenses in "
                "the Expenses section to get total spending, "
                "expense ratio, category analysis, alerts "
                "and saving opportunities."
            ),
            "source":
                source,
        }

    # =====================================================
    # DETERMINISTIC ANSWERS
    # =====================================================

    if source == "actual":

        fast_reply = (
            answer_from_actual_dataset(
                intent,
                data.message
            )
        )

    else:

        fast_reply = (
            answer_from_demo(
                intent,
                data.message
            )
        )

    # =====================================================
    # DETERMINISTIC INTENTS
    # =====================================================

    deterministic_intents = {
        "greeting",
        "revenue",
        "profit",
        "loss",
        "sales",
        "customers",
        "top_product",
        "product",
        "forecast",
        "analysis",
    }

    if (
        fast_reply
        and intent
        in deterministic_intents
    ):

        return {
            "reply":
                fast_reply,
            "source":
                source,
        }

    # =====================================================
    # GEMINI
    # =====================================================

    gemini_reply = ask_gemini(
        data.message,
        source
    )

    if gemini_reply:

        return {
            "reply":
                gemini_reply,
            "source":
                source,
        }

    # =====================================================
    # FALLBACK
    # =====================================================

    if fast_reply:

        return {
            "reply":
                fast_reply,
            "source":
                source,
        }

    return {
        "reply":
            (
                "I couldn't determine a reliable answer "
                "from the available business data. Try "
                "asking about revenue, profit, sales, "
                "customers, products, costs, expenses, "
                "performance, recommendations or forecasts."
            ),
        "source":
            source,
    }


# =========================================================
# SERVER CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status":
            "healthy",
        "service":
            "PulseIQ Backend",
        "database":
            "connected",
        "gemini":
            bool(gemini_client),
    }