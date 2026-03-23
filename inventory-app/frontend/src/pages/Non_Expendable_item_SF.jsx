import React,{useState,useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import Status_model from '../components/Status_model';
import { useNavigate, useParams } from 'react-router-dom';
import { RiAuctionFill } from "react-icons/ri";
import { RiFileDamageFill } from "react-icons/ri";
import { PiEmptyFill } from "react-icons/pi";
import Status_dialog from '../components/Status_dialog';
import axios from 'axios'
function Non_Expendable_Item_SF() {
    const { nonExpendableItemSFID } = useParams()
    const non_expendable_item_id = nonExpendableItemSFID
    const [nonExpendable,setNonExpendable]=useState({})
    const [StatusDialog,setStatusDialog]=useState(false)
    const [error,setError]=useState(false)
    const [loading,setLoading]=useState(true)
    const [editItem,setEditItem]=useState({"lp_no":"","nomenclature":"","appendix":"","a_u":"","vintage":"","qty":"","rate":"","qty_unsv":"","qty_serv":"","dep_value":""})

    const [status,setStatus]=useState({"type":"","msg":""})
    const [statusType,setStatusType]=useState("")
    const [deleteRemark,setDeleteRemark]=useState(null)
    const navigate=useNavigate()


    const handle_status_dialog=(type)=>{
        setStatusType(type)
        setStatusDialog(!StatusDialog)
    }


    const handle_status_submit=(status_type,payload)=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.put(`http://127.0.0.1:8000/non-expendable/add-remarks/${status_type}/${non_expendable_item_id}`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":(status_type=='Auction')?"Succesfully Auctioned":(status_type=='Destroy')?"Succesfully Destroyed":"Succesfully Used up"})
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

    const handle_status_delete=(status_type,payload)=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.put(`http://127.0.0.1:8000/non-expendable/remove-remarks/${status_type}/${non_expendable_item_id}`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Removed Remarks!"})
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

    const handleDelete=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.delete(`http://127.0.0.1:8000/non-expendable/delete-non-expendable-item/${non_expendable_item_id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Deleted Item!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        navigate("/non-expendable-items-sf")
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
        const payload=editItem
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.put(`http://127.0.0.1:8000/non-expendable/edit-non-expendable-item/${non_expendable_item_id}`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
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
                    setError(false)
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
        axios.get(`http://127.0.0.1:8000/non-expendable/get-non-expendable-item/${non_expendable_item_id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setNonExpendable(data.data.items)
                    setEditItem({"lp_no":data.data.items["lp_no"],
                                 "nomenclature":data.data.items["nomenclature"],
                                 "appendix":data.data.items["category_appendix"],
                                 "a_u":data.data.items["a_u"],
                                 "vintage":data.data.items["vintage"],
                                 "qty":data.data.items["qty"],
                                 "rate":data.data.items["rate"],
                                 "qty_unsv":data.data.items["qty_unsv"],
                                 "qty_serv":data.data.items["qty_serv"],
                                 "dep_value":data.data.items["dep_value"]})
                    setTimeout(()=>setLoading(false),800)
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
    if(loading) return (
    <div className='page_container_1'>
        <Sidebar/>
        <div className='skeleton_page'>
            <div className='skeleton_table_section' style={{marginTop:'3em'}}>
                <div className='skeleton_table_header'>
                    <div className='skeleton skeleton_title'></div>
                </div>
                {[1,2,3,4,5].map(r=>(
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
        <Status_dialog handle_submit={handle_status_submit} handle_status_dialog={handle_status_dialog} dialog_status={StatusDialog} status_type={statusType}/>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Sidebar/>
        <div className='main_section'>

            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Item (School) Details</h1>
                    
                    <div className="actions_section">
                        <button className="auction_btn red-hat-display-bold" onClick={()=>handle_status_dialog("Auction")}> <RiAuctionFill/> Auction</button>
                        <button className="destroy_btn red-hat-display-bold" onClick={()=>handle_status_dialog("Destroy")}> <RiFileDamageFill/> Destroy</button>
                        <button className="used_btn red-hat-display-bold" onClick={()=>handle_status_dialog("Used")}><PiEmptyFill/>Used Up</button>
                    </div>
                </div>
                <div className="item_details">
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>LP No.</h3>
                            <input type="number" className='details_input  space-mono-regular' placeholder='LP NO.' value={editItem["lp_no"]} onChange={(e)=>{setEditItem({...editItem,"lp_no":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Nomenclature</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Nomenclature' value={editItem["nomenclature"]} onChange={(e)=>{setEditItem({...editItem,"nomenclature":e.target.value})}}/>
                        </div>
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>A/U</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='A/U' value={editItem["a_u"]} onChange={(e)=>{setEditItem({...editItem,"a_u":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Vintage</h3>
                            <input type="date" className='details_input  space-mono-regular' placeholder='Vintage' value={editItem["vintage"]} onChange={(e)=>{setEditItem({...editItem,"vintage":e.target.value})}}/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty</h3>
                            <input type="number"  className='details_input  space-mono-regular' placeholder='QTY' value={editItem["qty"]} onChange={(e)=>{setEditItem({...editItem,"qty":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Rate (Each Item)</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Rate (Each Item)' value={editItem["rate"]} onChange={(e)=>{setEditItem({...editItem,"rate":e.target.value})}}/>
                        </div>
                        
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty SERV</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Qty SERV' value={editItem["qty_serv"]} onChange={(e)=>{setEditItem({...editItem,"qty_serv":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty UNSV</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Qty UNSV' value={editItem["qty_unsv"]} onChange={(e)=>{setEditItem({...editItem,"qty_unsv":e.target.value})}}/>
                        </div>
                    </div>
                
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Last yr bid value</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Last yr bid value' value={nonExpendable["last_yr_bid_value"] ?? ""}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of SERV items</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Value of SERV items' value={nonExpendable["serv_value"] ?? ""}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of UNSV items</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Value of UNSV items' value={nonExpendable["unsv_value"] ?? ""}/>
                        </div>
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Depreciation (%)</h3>
                            <input type="number" min="0" max="100" step="0.01" className='details_input  space-mono-regular' placeholder='0 - 100' value={editItem["dep_value"]} onChange={(e)=>{setEditItem({...editItem,"dep_value":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of Items after Dep</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Value of Items after Dep' value={nonExpendable["dep_price"] ?? ""}/>
                        </div>
                    </div>
                    <div className="tertiary_details_section">
                        <div className="details_container_1">
                            <h3 className='details_name red-hat-display-bold'>Remarks</h3>
                            <div className='remarks_container'>
                                {nonExpendable["remarks"] ? nonExpendable["remarks"].split(" ").filter(Boolean).map((r,i)=>{
                                    const [type,qty]=r.split(":")
                                    const badgeClass=type==="Auction"?"auction":type==="Destroy"?"destroy":"used"
                                    return <span key={i} className={`remark_badge ${badgeClass} space-mono-regular`}>{type}: {qty} <button className='remark_delete_btn' onClick={()=>setDeleteRemark({type,qty:parseInt(qty)})}>x</button></span>
                                }) : <span className='space-mono-regular' style={{color:'#888'}}>No Remarks</span>}
                            </div>
                        </div>
                    </div>
                    {deleteRemark && <div className="remark_delete_confirm">
                        <p className='red-hat-display-regular'>Restore <strong>{deleteRemark.qty}</strong> {deleteRemark.type} items to:</p>
                        <div className="remark_delete_actions">
                            <button className='type_btn space-mono-regular' onClick={()=>{handle_status_delete(deleteRemark.type,{"qty":deleteRemark.qty,"qty_type":"SERV"});setDeleteRemark(null)}}>SERV</button>
                            <button className='type_btn space-mono-regular' onClick={()=>{handle_status_delete(deleteRemark.type,{"qty":deleteRemark.qty,"qty_type":"UNSV"});setDeleteRemark(null)}}>UNSV</button>
                            <button className='type_btn space-mono-regular' onClick={()=>setDeleteRemark(null)}>Cancel</button>
                        </div>
                    </div>}
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

export default Non_Expendable_Item_SF