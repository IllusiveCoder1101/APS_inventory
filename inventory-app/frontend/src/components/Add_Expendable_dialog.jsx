import React from 'react'

import { RxCrossCircled } from "react-icons/rx";
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
                <div className="primary_container">
                    <div className="input_holder short_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                    <div className="input_holder long_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                </div>
                <div className="secondary_container">
                    <div className="input_holder long_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                    <div className="input_holder short_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                </div>
                <div className="tertiary_container">
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                </div>
                <div className="secondary_container">
                    <div className="input_holder long_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                    <div className="input_holder short_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                </div>
                <div className="primary_container">
                    <div className="input_holder short_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                    <div className="input_holder long_input">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                </div>
                <div className="tertiary_container">
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                    <div className="input_holder long_input_1">
                        <input type="text" className="input_box_1 space-mono-regular" placeholder='Placeholder'/>
                    </div>
                </div>
            </div><div className="submit_btn_holder">
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