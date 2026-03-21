import React,{useEffect, useState} from 'react'
import Sidebar from '../components/Sidebar'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import Status_model from '../components/Status_model';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
function Consolidated_Item() {
    const consolidated_item_id = sessionStorage.getItem("consolidated_item_id")
    const [consolidatedItem,setConsolidatedItem]=useState({})
    const [status,setStatus]=useState({"type":"","msg":""})

    const [editItem,setEditItem]=useState({"appendix":"","property_head":"","fund_details":""})
    const [error,setError]=useState(false)
    const navigate=useNavigate()

    const handleDelete=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.delete(`http://127.0.0.1:8000/consolidated/delete-consolidated-item/${consolidated_item_id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Deleted Item!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        navigate("/consolidated-items")
                    },2000)
                }
            })
            .catch((error)=>{  
                if(error.status==401){
                    setError(true)
                }
                else{
                    setStatus({"type":"error","msg":"Invalid Details!"})
                }
            })
        
    }

    const handleEdit=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        const payload=editItem
        axios.put(`http://127.0.0.1:8000/consolidated/edit-consolidated-item/${consolidated_item_id}`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Edited Item!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        handleGETRequest()
                    },2000)
                }
            })
            .catch((error)=>{  
                if(error.status==401){
                    setError(true)
                }
                else{
                    setStatus({"type":"error","msg":"Invalid Details!"})
                }
            })
        
    }

    const handleRefresh=()=>{
        let refresh_token=JSON.parse(sessionStorage.getItem("refresh_token"))
        axios.post(`http://127.0.0.1:8000/auth/refresh/${refresh_token}`)
            .then((data)=>{
                if(data.status==200){
                    sessionStorage.setItem("access_token",JSON.stringify(data.data.access_token))
                    handleGETRequest()
                }
            })
            .catch((error)=>{
                setStatus({"type":"error","msg":"Invalid Details!"})
                navigate("/")
            })
    }

    const handleGETRequest=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get(`http://127.0.0.1:8000/consolidated/get-consolidated-item/${consolidated_item_id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setConsolidatedItem(data.data.items)
                    setEditItem({"appendix":data.data.items["appendix"],"fund_details":data.data.items["fund_details"],"property_head":data.data.items["property_head"]})
                }
            })
            .catch((error)=>{
                if(error.status==401){
                    setError(true)
                }
                else{
                    setStatus({"type":"error","msg":"Invalid Details!"})
                }
        
            })
    
    
    }
    useEffect(()=>{
        handleGETRequest()
    },[])
    useEffect(()=>{
        if(error){
            handleRefresh()
        }
    },[error])
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
                            <input type="text" className='details_input  space-mono-regular' placeholder='Property Head' defaultValue={editItem["property_head"]} onChange={(e)=>setEditItem({...editItem,"property_head":e.target.value})}/>
                        </div>
                        
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Appendix</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Appendix' defaultValue={editItem["appendix"]} onChange={(e)=>setEditItem({...editItem,"appendix":e.target.value})}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Fund Details</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Fund Details' defaultValue={editItem["fund_details"]} onChange={(e)=>setEditItem({...editItem,"fund_details":e.target.value})}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Past Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Past Value' defaultValue={consolidatedItem["prev_year_value"]}/>
                        </div>
                        

                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Past Purchases</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Past Purchases' defaultValue={consolidatedItem["prev_year_purchases"]}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>UNSV Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='UNSV Value' defaultValue={consolidatedItem["unsv_value"]}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>SERV Value</p>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='SERV VALUE' defaultValue={consolidatedItem["serv_value"]}/>
                        </div>
                        
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Depreciatation Value</p>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Depreciation Value' defaultValue={consolidatedItem["dep_value"]}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Present Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Present Value' defaultValue={consolidatedItem["present_value"]}/>
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