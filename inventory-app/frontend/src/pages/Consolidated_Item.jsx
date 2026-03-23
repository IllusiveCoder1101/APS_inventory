import React,{useEffect, useState} from 'react'
import Sidebar from '../components/Sidebar'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import Status_model from '../components/Status_model';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'
function Consolidated_Item() {
    const { consolidatedItemID } = useParams()
    const [consolidatedItemId,setConsolidatedItemId]=useState(consolidatedItemID)
    const [consolidatedItem,setConsolidatedItem]=useState({})
    const [status,setStatus]=useState({"type":"","msg":""})

    const [editItem,setEditItem]=useState({"appendix":"","property_head":"","fund_details":""})
    const [error,setError]=useState(false)
    const [loading,setLoading]=useState(true)
    const navigate=useNavigate()

    const handleDelete=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.delete(`http://127.0.0.1:8000/consolidated/delete-consolidated-item/${consolidatedItemId}`,{headers:{"Authorization":`Bearer ${access_token}`}})
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
                if(error.response?.status==401){
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
        axios.put(`http://127.0.0.1:8000/consolidated/edit-consolidated-item/${consolidatedItemId}`,payload,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    const newId = editItem["appendix"] || consolidatedItemId
                    if(newId !== consolidatedItemId){
                        setConsolidatedItemId(newId)
                        navigate(`/consolidated-items/${newId}`, {replace: true})
                    }
                    setStatus({"type":"success","msg":"Successfully Edited Item!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        handleGETRequest(newId)
                    },2000)
                }
            })
            .catch((error)=>{
                if(error.response?.status==401){
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
                    setError(false)
                    handleGETRequest()
                }
            })
            .catch((error)=>{
                setError(false)
                setStatus({"type":"error","msg":"Invalid Details!"})
                navigate("/")
            })
    }

    const handleGETRequest=(itemId)=>{
        const id = itemId || consolidatedItemId
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get(`http://127.0.0.1:8000/consolidated/get-consolidated-item/${id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setConsolidatedItem(data.data.items)
                    setEditItem({"appendix":data.data.items["appendix"],"fund_details":data.data.items["fund_details"],"property_head":data.data.items["property_head"]})
                    setTimeout(()=>setLoading(false),800)
                }
            })
            .catch((error)=>{
                if(error.response?.status==401){
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
    if(loading) return (
    <div className='page_container_1'>
        <Sidebar/>
        <div className='skeleton_page'>
            <div className='skeleton_table_section' style={{marginTop:'3em'}}>
                <div className='skeleton_table_header'>
                    <div className='skeleton skeleton_title'></div>
                </div>
                {[1,2,3,4].map(r=>(
                    <div key={r} className='skeleton_detail_row'>
                        <div className='skeleton_detail_field'><div className='skeleton skeleton_label'></div><div className='skeleton skeleton_input'></div></div>
                        <div className='skeleton_detail_field'><div className='skeleton skeleton_label'></div><div className='skeleton skeleton_input'></div></div>
                    </div>
                ))}
            </div>
        </div>
    </div>)
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
                            <input type="text" className='details_input  space-mono-regular' placeholder='Property Head' value={editItem["property_head"]} onChange={(e)=>setEditItem({...editItem,"property_head":e.target.value})}/>
                        </div>

                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Appendix</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Appendix' value={editItem["appendix"]} onChange={(e)=>setEditItem({...editItem,"appendix":e.target.value})}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Fund Details</p>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Fund Details' value={editItem["fund_details"]} onChange={(e)=>setEditItem({...editItem,"fund_details":e.target.value})}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Past Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Past Value' value={consolidatedItem["prev_year_value"] ?? ""}/>
                        </div>


                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Past Purchases</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Past Purchases' value={consolidatedItem["prev_year_purchases"] ?? ""}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>UNSV Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='UNSV Value' value={consolidatedItem["unsv_value"] ?? ""}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>SERV Value</p>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='SERV VALUE' value={consolidatedItem["serv_value"] ?? ""}/>
                        </div>

                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Depreciation Value</p>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Depreciation Value' value={consolidatedItem["dep_value"] ?? ""}/>
                        </div>
                        <div className="details_container">
                            <p className='details_name red-hat-display-regular'>Present Value</p>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Present Value' value={consolidatedItem["present_value"] ?? ""}/>
                        </div>

                    </div>
                    <div className="tertiary_details_section">
                        <div className="details_container_1">
                            <p className='details_name red-hat-display-regular'>Remarks</p>
                            <input type="text" disabled className='details_input space-mono-regular' placeholder='Remarks' value={consolidatedItem["remarks"] ?? ""}/>
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