import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
function Consolidated_Item() {
    return (
    <div className='page_container_1'>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Consolidated Item Details</h1>
                    
                </div>
                <div className="item_details">
                    <div className="tertiary_details_section">
                        <div className="details_container_1">
                            <p className='details_name red-hat-display-regular'>Property Head</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Property Head'/>
                        </div>
                        
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Appendix</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Appendix'/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Fund Details</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Fund Details'/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Past Value</p>
                            <input type="number" className='details_input  space-mono-regular' placeholder='Past Value'/>
                        </div>
                        

                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Past Purchases</p>
                            <input type="number" className='details_input  space-mono-regular' placeholder='Past Purchases'/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>UNSV Value</p>
                            <input type="number"  className='details_input  space-mono-regular' placeholder='UNSV Value'/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>SERV Value</p>
                            <input type="number"  className='details_input space-mono-regular' placeholder='SERV VALUE'/>
                        </div>
                        
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Depreciatation Value</p>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Depreciation Value'/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Present Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Present Value'/>
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

export default Consolidated_Item