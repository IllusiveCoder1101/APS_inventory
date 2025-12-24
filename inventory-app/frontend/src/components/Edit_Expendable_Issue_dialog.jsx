import React from 'react'

import { RxCrossCircled } from "react-icons/rx";

function Edit_Expendable_Issue_dialog({dialog_status,handle_add_dialog,handle_submit}) {
  return (
      <>
       {
  
          <>
              {
                  (dialog_status)?<div className='dialog_box_container'>
           <div className="dialog_box_holder_1">
              <div className="dialog_header">
                  <h2 className='dialog_header red-hat-display-bold'>Edit Issue</h2>
                  <button className='dialog_close' onClick={()=>handle_add_dialog()}><RxCrossCircled className='icon'/></button>
              </div>
              <div className="input_containers">
                <div className="tertiary_container">
                    <div className="input_holder long_input_1">
                        <input type="date" className="input_box_1 space-mono-regular" placeholder='Date'/>
                    </div>
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='RV/IV'/>
                    </div>
                </div>
                <div className="secondary_container">
                    <div className="input_holder long_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Whom ID Issue'/>
                    </div>
                    
                </div>
                <div className="tertiary_container">
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Qty Arrived'/>
                    </div>
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Qty Issued'/>
                    </div>
                </div>
                
                </div>
              <div className="submit_btn_holder">
                  <button className="submit_btn_1" onClick={()=>handle_add_dialog()}><span>Cancel</span></button>
                  <button className="submit_btn" onClick={()=>{handle_submit()}}>Submit</button>
              </div>
           </div>
      </div>:<></>
              }
          
          </>
       }   
      </>
    )
}

export default Edit_Expendable_Issue_dialog