import React from 'react'

import { RxCrossCircled } from "react-icons/rx";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
function Add_Expendable_dialog({dialog_status,handle_add_dialog}) {
  return (
    <>
     {

        <>
            {
                (dialog_status)?<div className='dialog_box_container'>
        <div className="dialog_box_holder">
            <div className="dialog_header">
                <h2 className='dialog_header red-hat-display-bold'>Add Item</h2>
                <button className='dialog_close' onClick={()=>handle_add_dialog()}><RxCrossCircled className='icon'/></button>
            </div>
            <div className="input_containers">
                <div className="file_upload_container">
                    <PiMicrosoftExcelLogoFill className='file_upload_icon'/>
                    <div className="file_upload_info">
                        <h3 className='file_upload_header red-hat-display-bold'>Upload Expendable File</h3>
                        <p className='file_upload_text space-mono-regular'>Accepted Files: .xlsx, .xls </p>
                        <label for="excelInput" class="upload-btn">Upload File</label>
                        <input type="file" id="excelInput" accept=".xlsx,.xls" />
                    </div>
                </div>
            </div>
            <div className="submit_btn_holder">
                <button className="submit_btn_1" onClick={()=>handle_add_dialog()}><span>Cancel</span></button>
                <button className="submit_btn">Submit</button>
            </div>
        </div>
    </div>:<></>
            }
        
        </>
     }   
    </>
  )
}

export default Add_Expendable_dialog