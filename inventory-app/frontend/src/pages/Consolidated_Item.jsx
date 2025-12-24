import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import Status_model from '../components/Status_model';
import { useNavigate } from 'react-router-dom';
function Consolidated_Item() {
    const [status,setStatus]=useState({"type":"","msg":""})
    const navigate=useNavigate()

    const handleDelete=()=>{
        setStatus({"type":"success","msg":"Successfully Deleted Item!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
            navigate("/consolidated-items")
        },2000)
    }

    const handleEdit=()=>{
        setStatus({"type":"success","msg":"Successfully Edited Item!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
        },2000)
    }
    
    
    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
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
                    <button className='action_btn_1 space-mono-regular' onClick={handleDelete}><MdDelete className='btn_icon'/> Delete</button>
                    <button className='action_btn_1 space-mono-regular' onClick={handleEdit}><MdEdit  className='btn_icon'/> Edit</button>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default Consolidated_Item