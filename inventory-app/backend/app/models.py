from sqlalchemy import Column, Integer, String, Numeric, Computed,Date,text, ForeignKey
from app.database import Base
from sqlalchemy.dialects.postgresql import UUID

class User(Base):
    __tablename__ = "users"

    id = Column( UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    hashed_refresh_token = Column(String, nullable=True)

    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

class ConsolidatedItems(Base):
    __tablename__ = "consolidated_items"

    id = Column( UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    property_head=Column(String, unique=True, nullable=False)
    appendix=Column(String, unique=True, nullable=False)
    fund_details=Column(String, nullable=False)
    prev_year_value=Column(Numeric(18,2),nullable=False)
    prev_year_purchases=Column(Numeric(18,2),nullable=True)
    unsv_value=Column(Numeric(18,2),nullable=True)
    dep_value=Column(Numeric(18,2),nullable=True)
    present_value=Column(Numeric(18,2),Computed("COALESCE(prev_year_value,0) + COALESCE(prev_year_purchases,0) - COALESCE(unsv_value,0) - COALESCE(dep_value,0)"),nullable=False)
    
    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
class NonExpendableItems(Base):
    __tablename__ = "non_expendable_items"

    id = Column( UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    ser_no=Column(Integer, unique=True, nullable=False, index=True)
    lp_no=Column(Integer, unique=True, nullable=False)
    nomenclature=Column(String, unique=True, nullable=False)
    category_appendix = Column(
        UUID(as_uuid=True),
        ForeignKey("consolidated_items.appendix", ondelete="CASCADE"),
        nullable=False
    )
    a_u=Column(String,nullable=False)
    vintage=Column(Date,nullable=False)
    qty=Column(Integer,nullable=False)
    rate=Column(Numeric(12,2),nullable=False)
    qty_ledger=Column(Integer,nullable=False)
    qty_ground=Column(Integer,nullable=False)
    qty_serv=Column(Integer,nullable=False)
    qty_unsv=Column(Integer,nullable=False)
    last_yr_bd_value=Column(Numeric(10,2),Computed("COALESCE(rate,0)*COALESCE(qty,0)"),nullable=False)
    serv_value=Column(Numeric(10,2),Computed("COALESCE(rate,0)*COALESCE(qty_serv,0)"),nullable=False)
    unsv_value=Column(Numeric(10,2),Computed("COALESCE(rate,0)*COALESCE(qty_unsv,0)"),nullable=False)
    dep_value=Column(Numeric(10,2),nullable=False)
    remarks=Column(String, nullable=True)

    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

class ExpendableItems(Base):
    __tablename__ = "expendable_items"

    id = Column(UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    ser_no=Column(Integer, unique=True, nullable=False, index=True)
    items=Column(String, unique=True, nullable=False)
    category_appendix = Column(
        UUID(as_uuid=True),
        ForeignKey("consolidated_items.appendix", ondelete="CASCADE"),
        nullable=False
    )
    qty_prev_month=Column(Integer,nullable=False)
    purchase_curr_month=Column(Integer,nullable=False)
    utilized_curr_month=Column(Integer,nullable=False)
    final_balance=Column(Integer,Computed("COALESCE(qty_prev_month,0)+COALESCE(purchase_curr_month,0)-COALESCE(utilized_curr_month,0)"),nullable=False)
    remarks=Column(String, nullable=True)
    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

class ExpendableItemsIssue(Base):
    __tablename__ = "expendable_items_issue"

    id = Column(UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    ser_no=Column(Integer, unique=True, nullable=False, index=True)
    date= Column(Date, nullable=False)
    rv_iv=Column(String,nullable=True)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("expendable_items.ser_no", ondelete="CASCADE"),
        nullable=False
    )
    whom_id_issue=Column(String,nullable=False)
    qty_received=Column(Integer,nullable=True)
    qty_issued=Column(Integer,nullable=False)
    remarks=Column(String, nullable=True)

    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}