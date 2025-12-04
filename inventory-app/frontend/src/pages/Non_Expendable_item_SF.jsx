import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";


function Non_Expendable_Item_SF() {
   
    return (
    <div className='page_container_1'>
        <Edit_Expendable_dialog dialog_status={editDialog} handle_edit_dialog={handle_edit_dialog}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Item (School) Details</h1>
                    
                </div>
                <div className="item_details">
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>LP No.</h3>
                            <input type="number" className='details_input  space-mono-regular' placeholder='LP NO.'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Nomenclature</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Nomenclature'/>
                        </div>
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>A/U</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='A/U'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Vintage</h3>
                            <input type="date" className='details_input  space-mono-regular' placeholder='Vintage'/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty</h3>
                            <input type="number"  className='details_input  space-mono-regular' placeholder='QTY'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Rate (Each Item)</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Rate (Each Item)'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty as per Ledger</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Qty as per Ledger'/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty on Grnd</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Qty on Grnd'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty SERV</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Qty SERV'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty UNSV</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Qty UNSV'/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Last yr bid value</h3>
                            <input type="number"  className='details_input  space-mono-regular' placeholder='Last yr bid value'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of SERV items</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Value of SERV items'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of UNSV items</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Value of UNSV items'/>
                        </div>
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Dep value of Property</h3>
                            <input type="number" className='details_input  space-mono-regular' placeholder='Dep value of Property'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of Items after Dep</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Value of Items after Dep'/>
                        </div>
                    </div>
                    <div className="tertiary_details_section">
                        <div className="details_container_1">
                            <h3 className='details_name red-hat-display-bold'>Remarks</h3>
                            <input type="text" className='details_input space-mono-regular' placeholder='Remarks'/>
                        </div>
                    </div>
                </div>
                <div className="btn_section">
                    <button className='action_btn_1 space-mono-regular'><MdDelete className='btn_icon'/> Delete</button>
                    <button className='action_btn_1 space-mono-regular'><MdEdit  className='btn_icon'/> Edit</button>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default Non_Expendable_Item_SF