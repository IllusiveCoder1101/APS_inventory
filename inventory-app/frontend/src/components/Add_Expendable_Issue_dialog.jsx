import React,{useState} from 'react'

import { RxCrossCircled } from "react-icons/rx";

function Add_Expendable_Issue_dialog({dialog_status,handle_add_dialog,handle_submit}) {

    const [mode,setMode]=useState("receive")
    const [payload,setPayload]=useState({"date":"","rv_iv":"","whom_id_issue":"","qty_received":0,"qty_issued":0})

    const handleModeSwitch=(newMode)=>{
        setMode(newMode)
        setPayload({"date":payload.date,"rv_iv":"","whom_id_issue":"","qty_received":0,"qty_issued":0})
    }

    const handleSubmit=()=>{
        if(mode==="receive"){
            handle_submit({...payload,"whom_id_issue":"","qty_issued":0})
        }else{
            handle_submit({...payload,"rv_iv":"","qty_received":0})
        }
    }

    return (
      <>
       {

          <>
              {
                  (dialog_status)?<div className='dialog_box_container'>
           <div className="dialog_box_holder_1">
              <div className="dialog_header">
                  <h2 className='dialog_header red-hat-display-bold'>Add Issue</h2>
                  <button className='dialog_close' onClick={()=>handle_add_dialog()}><RxCrossCircled className='icon'/></button>
              </div>
              <div className="input_containers">
                <div className="primary_container">
                    <button className={(mode==="receive")?"type_btn active_type_btn space-mono-regular":"type_btn space-mono-regular"} onClick={()=>handleModeSwitch("receive")}>Receive Stock</button>
                    <button className={(mode==="issue")?"type_btn active_type_btn space-mono-regular":"type_btn space-mono-regular"} onClick={()=>handleModeSwitch("issue")}>Issue Stock</button>
                </div>
                <div className="primary_container">
                    <div className="input_holder long_input">
                        <input type="date" className="input_box_1 space-mono-regular" placeholder='Date' defaultValue={payload["date"]} onChange={(e)=>setPayload({...payload,"date":e.target.value})}/>
                    </div>
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
                  <button className="submit_btn" onClick={handleSubmit}>Submit</button>
              </div>
           </div>
      </div>:<></>
              }

          </>
       }
      </>
    )
}

export default Add_Expendable_Issue_dialog
