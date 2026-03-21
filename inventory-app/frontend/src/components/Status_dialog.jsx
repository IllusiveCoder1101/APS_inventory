import React, { useState } from 'react'

import { RxCrossCircled } from "react-icons/rx";

function Status_dialog({dialog_status,status_type,qty_left,handle_status_dialog,handle_submit}) {

  const statusText={"Auction":"How much to Auction?",
                    "Destroy":"How much to Destroy?",
                    "Used":"How much Used Up?"
                    }
  const [selectedType,setSelectedType]=useState("")

  const handleActiveType=(type)=>{
    if (selectedType==type){
        setSelectedType("")
    }
    else{
        setSelectedType(type)
    }
  }

  return (
        <>
         {
    
            <>
                {
                    (dialog_status)?<div className='dialog_box_container'>
             <div className="dialog_box_holder_2">
                <div className="dialog_header">
                    <h2 className='dialog_header red-hat-display-bold'>{status_type}</h2>
                    <button className='dialog_close' onClick={()=>handle_status_dialog("")}><RxCrossCircled className='icon'/></button>
                </div>
                <div className="input_containers">
                  
                    <div className="tertiary_container">
                        <div className="input_holder long_input_1">
                            <input type="text" className="input_box_1 space-mono-regular" placeholder='Qty SERV'/>
                        </div>
                        <div className="input_holder long_input_1">
                            <input type="text" className="input_box_1 space-mono-regular" placeholder='Qty UNSV'/>
                        </div>
                    </div>

                    <div className="secondary_container">
                        <div className="input_holder long_input">
                            <input type="text" className="input_box_1 space-mono-regular" placeholder={statusText[status_type]}/>
                        </div>
                        
                    </div>
                    <div className="tertiary_container">
                        <button className={(selectedType=='SERV')?'active_type_btn space-mono-regular':'type_btn space-mono-regular'} onClick={()=>handleActiveType("SERV")}>SERV</button>
                        <button className={(selectedType=='UNSV')?'active_type_btn space-mono-regular':'type_btn space-mono-regular'} onClick={()=>handleActiveType("UNSV")}>UNSV</button>
                    </div>
                  
                </div>
                <div className="submit_btn_holder">
                    <button className="submit_btn_1" onClick={()=>handle_status_dialog("")}><span>Cancel</span></button>
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

export default Status_dialog