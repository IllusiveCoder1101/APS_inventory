from pydantic import BaseModel
from uuid import UUID
from datetime import date



class UserCreate(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class DeleteItems(BaseModel):
    item_ids: list[int]

class ExpendableItem(BaseModel):
 
    items: str | None = None
    remarks: str | None = None


class ExpendableItemsList(BaseModel):
    ser_no: int
    items: str
    qty_prev_month: int
    purchase_curr_month: int
    utilized_curr_month: int
    remarks: str | None = None



class NonExpendableItem(BaseModel):
    lp_no: int | None = None
    nomenclature: str | None = None
    appendix: str | None = None
    a_u: int | None = None
    vintage: int | None = None
    qty: int | None = None
    rate: float | None = None
    qty_ledger: int | None = None
    qty_ground: int | None = None
    qty_serv: int | None = None
    qty_unsv: int | None = None
    dep_value: int | None = None
    remarks: str | None = None



class NonExpendableItemsList(BaseModel):
    ser_no: int
    lp_no: int
    nomenclature: str
    appendix: str
    a_u: int
    vintage: int     
    qty: int
    rate: float
    qty_ledger: int
    qty_ground: int
    qty_serv: int
    qty_unsv: int
    dep_value: int
    remarks: str | None = None


class NonExpendableRemarks(BaseModel):
    qty:int
    qty_type:str
    


class ConsolidatedItemGet(BaseModel):
    property_head: str
    appendix: str
    fund_details: str
    prev_year_value: float
    prev_year_purchase : float
    unsv_value: float
    serv_value: float
    dep_value: float

class ConsolidatedItemEdit(BaseModel):
    property_head: str | None = None
    appendix: str | None = None
    fund_details: str | None = None


class ConsolidatedItemsGet(BaseModel):
    property_head: str
    appendix: str
    fund_details: str
    dep_value: float

class ConsolidatedAppendixList(BaseModel):
    appendix_list: list[str]


class ExpendableIssueGet(BaseModel):
    ser_no: int
    rv_iv: str 
    date: date
    category_id: int 
    whom_id_issue: str 
    qty_received: int 
    qty_issued: int 
    remarks: str | None = None


class ExpendableIssueCreate(BaseModel):
    ser_no: int
    date: date
    rv_iv: str
    category_id: int
    whom_id_issue: str
    qty_received: int
    qty_issued: int
    remarks: str | None = None

class ExpendableIssueEdit(BaseModel):
    rv_iv: str | None = None
    whom_id_issue: str | None = None
    qty_received: int | None = None
    qty_issued: int | None = None
    remarks: str | None = None

class DefaultResponse(BaseModel):
    msg: str
