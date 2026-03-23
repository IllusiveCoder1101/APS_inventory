import React,{useState,useEffect} from 'react'

import { RxCrossCircled } from "react-icons/rx";

function Edit_Expendable_Issue_dialog({dialog_status,handle_add_dialog,handle_submit,editData}) {

    const [payload,setPayload]=useState({"rv_iv":"","whom_id_issue":"","qty_received":0,"qty_issued":0})
    const [mode,setMode]=useState("receive")

    useEffect(()=>{
        if(editData){
            const isReceive = editData["rv_iv"] && editData["rv_iv"] !== "NA"
            setMode(isReceive ? "receive" : "issue")
            setPayload({
                "rv_iv": editData["rv_iv"] === "NA" ? "" : (editData["rv_iv"] || ""),
                "whom_id_issue": editData["whom_id_issue"] === "NA" ? "" : (editData["whom_id_issue"] || ""),
                "qty_received": editData["qty_received"] || 0,
                "qty_issued": editData["qty_issued"] || 0
            })
        }
    },[editData])

    return (

        <>
            {(dialog_status)?
                <div className='dialog_box_container'>
                    <div className="dialog_box_holder_1">
                        <div className="dialog_header">
                            <h2 className='dialog_header red-hat-display-bold'>Edit Issue</h2>
                            <button className='dialog_close' onClick={()=>handle_add_dialog()}><RxCrossCircled className='icon'/></button>
                        </div>
                        <div className="input_containers">
                            <div className="primary_container">
                                <div className="input_holder long_input">
                                    <input type="date" disabled className="input_box_1 space-mono-regular" placeholder='Date' value={editData?.date || ""}/>
                                </div>
                            </div>
                            <div className="primary_container" style={{marginBottom:'0.5em'}}>
                                <span className={(mode==="receive")?"type_btn active_type_btn space-mono-regular":"type_btn space-mono-regular"} style={{textAlign:'center',padding:'0.4em 0',cursor:'default'}}>
                                    {mode==="receive" ? "Receive Stock" : "Issue Stock"}
                                </span>
                            </div>
                            {mode==="receive" ? (
                                <>
                                    <div className="tertiary_container">
                                        <div className="input_holder long_input">
                                            <input type="text" className="input_box_1 space-mono-regular" placeholder='RV/IV (Vendor / Receipt Voucher)' value={payload["rv_iv"]} onChange={(e)=>setPayload({...payload,"rv_iv":e.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="tertiary_container">
                                        <div className="input_holder long_input">
                                            <input type="number" className="input_box_1 space-mono-regular" placeholder='Qty Received' value={payload["qty_received"]} onChange={(e)=>setPayload({...payload,"qty_received":parseInt(e.target.value)||0})}/>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="tertiary_container">
                                        <div className="input_holder long_input">
                                            <input type="text" className="input_box_1 space-mono-regular" placeholder='Whom ID Issue (Issued To)' value={payload["whom_id_issue"]} onChange={(e)=>setPayload({...payload,"whom_id_issue":e.target.value})}/>
                                        </div>
                                    </div>
                                    <div className="tertiary_container">
                                        <div className="input_holder long_input">
                                            <input type="number" className="input_box_1 space-mono-regular" placeholder='Qty Issued' value={payload["qty_issued"]} onChange={(e)=>setPayload({...payload,"qty_issued":parseInt(e.target.value)||0})}/>
                                        </div>
                                    </div>
                                </>
                            )}

                            </div>
                        <div className="submit_btn_holder">
                            <button className="submit_btn_1" onClick={()=>handle_add_dialog()}><span>Cancel</span></button>
                            <button className="submit_btn" onClick={()=>{handle_submit(payload)}}>Submit</button>
                        </div>
                    </div>
                </div>:
                <></>
            }
        </>
    )
}

export default Edit_Expendable_Issue_dialog
