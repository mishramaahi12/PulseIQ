from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey, DateTime
from datetime import datetime
from database import Base


# =========================================================
# USER
# =========================================================

class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String(255),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    last_login = Column(
        DateTime,
        nullable=True
    )


# =========================================================
# ACTIVITY LOG
# =========================================================
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    action = Column(
        String(100),
        nullable=False,
        index=True
    )

    description = Column(
        String(500),
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )

# =========================================================
# BUSINESS DATA
# =========================================================

class BusinessData(Base):

    __tablename__ = "business_data"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    customer_name = Column(
        String(150),
        nullable=False,
        index=True
    )

    product = Column(
        String(200),
        nullable=False,
        index=True
    )

    quantity = Column(
        Float,
        nullable=False,
        default=1
    )

    unit_price = Column(
        Float,
        nullable=False,
        default=0
    )

    total_amount = Column(
        Float,
        nullable=False,
        default=0
    )

    payment_status = Column(
        String(50),
        nullable=False,
        default="Paid"
    )

    purchase_date = Column(
        Date,
        nullable=False
    )

    invoice_id = Column(
        String(100),
        nullable=True,
        index=True
    )


# =========================================================
# EXPENSE DATA
# =========================================================

class Expense(Base):

    __tablename__ = "expenses"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    expense_date = Column(
        Date,
        nullable=False,
        index=True
    )

    expense_name = Column(
        String(200),
        nullable=False,
        index=True
    )

    category = Column(
        String(100),
        nullable=False,
        index=True
    )

    amount = Column(
        Float,
        nullable=False,
        default=0
    )

    payment_method = Column(
        String(50),
        nullable=False,
        default="Other"
    )

    vendor = Column(
        String(200),
        nullable=True,
        index=True
    )

    description = Column(
        String(500),
        nullable=True
    )