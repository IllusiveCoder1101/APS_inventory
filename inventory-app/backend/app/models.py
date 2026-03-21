from sqlalchemy import Column, Integer, String, Numeric, Computed,Date,text, ForeignKey
from app.database import Base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import inspect,Identity

class User(Base):
    __tablename__ = "users"

    id = Column( UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
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
    serv_value=Column(Numeric(18,2),nullable=True)
    dep_value=Column(Numeric(18,2),nullable=True)
    
    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}
class NonExpendableItems(Base):
    __tablename__ = "non_expendable_items"

    id = Column( UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    ser_no=Column(Integer,Identity(start=1, increment=1),index=True, unique=True,nullable=False)
    lp_no=Column(Integer, unique=True, nullable=False)
    nomenclature=Column(String, unique=True, nullable=False)
    nonexpendable_type=Column(String, nullable=False)
    category_appendix = Column(
        String,
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
    dep_value=Column(Numeric(10,2),nullable=False)
    remarks=Column(String, nullable=True)

    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

class ExpendableItems(Base):
    __tablename__ = "expendable_items"

    id = Column(UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    ser_no=Column(Integer,Identity(start=1, increment=1),index=True, unique=True,nullable=False)
    items=Column(String, unique=True, nullable=False)
    unit=Column(String, nullable=False)
    qty_prev_month=Column(Integer,nullable=False)
    purchase_curr_month=Column(Integer,nullable=False)
    utilized_curr_month=Column(Integer,nullable=False)
    remarks=Column(String, nullable=True)
    
    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}

class ExpendableItemsIssue(Base):
    __tablename__ = "expendable_items_issue"

    id = Column(UUID(as_uuid=True),server_default=text("gen_random_uuid()"), primary_key=True, index=True)
    ser_no=Column(Integer,Identity(start=1, increment=1),index=True, unique=True,nullable=False)
    date= Column(Date, nullable=False)
    rv_iv=Column(String,nullable=True)
    category_id = Column(
        Integer,
        ForeignKey("expendable_items.ser_no", ondelete="CASCADE"),
        nullable=False
    )
    whom_id_issue=Column(String,nullable=False)
    qty_received=Column(Integer,nullable=True)
    qty_issued=Column(Integer,nullable=False)

    def to_dict(self):
        """Convert SQLAlchemy model instance to a dict."""
        return {c.key: getattr(self, c.key) for c in inspect(self).mapper.column_attrs}



