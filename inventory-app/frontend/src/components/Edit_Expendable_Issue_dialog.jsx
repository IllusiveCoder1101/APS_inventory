import React,{useState} from 'react'

import { RxCrossCircled } from "react-icons/rx";

function Edit_Expendable_Issue_dialog({dialog_status,handle_add_dialog,handle_submit}) {
    
    const [payload,setPayload]=useState({"rv_iv":"","whom_id_issue":"","qty_arrived":0,"qty_issued":0,"category_id":0})
        
    return (
        
        <>
            {(dialog_status)?
                <div className='dialog_box_container'>
                    <div className="dialog_box_holder_1">
                        <div className="dialog_header">
                            <h2 className='dialog_header red-hat-display-bold'>Add Issue</h2>
                            <button className='dialog_close' onClick={()=>handle_add_dialog()}><RxCrossCircled className='icon'/></button>
                        </div>
                        <div className="input_containers">
                            <div className="tertiary_container">
                                <div className="input_holder long_input_1">
                                    <input type="date" disabled className="input_box_1 space-mono-regular" placeholder='Date' />
                                </div>
                            </div>
                            <div className="tertiary_container">
                                <div className="input_holder long_input_1">
                                    <input type="text" className="input_box_1 space-mono-regular" placeholder='RV/IV' defaultValue={payload["rv_iv"]} onChange={(e)=>setPayload({...payload,"rv_iv":e.target.value})}/>
                                </div>
                                <div className="input_holder long_input_1">
                                    <input type="text" className="input_box_1 space-mono-regular" placeholder='Whom ID Issue' defaultValue={payload["whom_id_issue"]} onChange={(e)=>setPayload({...payload,"whom_id_issue":e.target.value})}/>
                                </div>
                                
                            </div>
                            <div className="tertiary_container">
                                <div className="input_holder long_input_1">
                                    <input type="number" className="input_box_1 space-mono-regular" placeholder='Qty Arrived' defaultValue={payload["qty_arrived"]} onChange={(e)=>setPayload({...payload,"qty_arrived":e.target.value})}/>
                                </div>
                                <div className="input_holder long_input_1">
                                    <input type="number" className="input_box_1 space-mono-regular" placeholder='Qty Issued' defaultValue={payload["qty_issued"]} onChange={(e)=>setPayload({...payload,"qty_issued":e.target.value})}/>
                                </div>
                            </div>
                            
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