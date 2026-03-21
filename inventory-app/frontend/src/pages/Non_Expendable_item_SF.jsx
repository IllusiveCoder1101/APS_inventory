import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import Status_model from '../components/Status_model';
import { useNavigate } from 'react-router-dom';
import { RiAuctionFill } from "react-icons/ri";
import { RiFileDamageFill } from "react-icons/ri";
import { PiEmptyFill } from "react-icons/pi";
import Status_dialog from '../components/Status_dialog';

function Non_Expendable_Item_SF() {
    const [nonExpendable,setNonExpendable]=useState({})
    const [StatusDialog,setStatusDialog]=useState(false)
    const [error,setError]=useState(false)
    const [editItem,setEditItem]=useState({"lp_no":"","nomenclature":"","appendix":"","a_u":"","vintage":"","qty":"","rate":"","qty_unsv":"","qty_serv":"","dep_value":""})
    
    const [status,setStatus]=useState({"type":"","msg":""})
    const [statusType,setStatusType]=useState("")
    const navigate=useNavigate()


    const handle_status_dialog=(type)=>{
        setStatusType(type)
        setStatusDialog(!StatusDialog)
    }


    const handle_status_submit=(status_type,payload)=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.put(`http://127.0.0.1:8000/non-expendable/add-remarks/${status_type}/1`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
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
        axios.delete(`http://127.0.0.1:8000/non-expendable/add-remarks/${status_type}/1`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
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
        axios.delete("http://127.0.0.1:8000/non-expendable/delete-non-expendable-item/1",{headers:{"Authorization":`Bearer ${access_token}`}})
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
        axios.put("http://127.0.0.1:8000/non-expendable/edit-non-expendable-item/1",JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
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
        axios.get("http://127.0.0.1:8000/non-expendable/get-non-expendable-item/1",{headers:{"Authorization":`Bearer ${access_token}`}})
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
                                 "qty_unsv":data.data["qty_unsv"],
                                 "qty_serv":data.data.items["qty_serv"],
                                 "dep_value":data.data.items["dep_value"]})
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
        <Status_dialog handle_submit={handle_status_submit} handle_status_dialog={handle_status_dialog} dialog_status={StatusDialog} status_type={statusType} qty_left={2}/>
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
                            <input type="number" className='details_input  space-mono-regular' placeholder='LP NO.' defaultValue={editItem["lp_no"]} onChange={(e)=>{setEditItem({...editItem,"lp_no":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Nomenclature</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Nomenclature' defaultValue={editItem["nomenclature"]} onChange={(e)=>{setEditItem({...editItem,"nomenclature":e.target.value})}}/>
                        </div>
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>A/U</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='A/U' defaultValue={editItem["a_u"]} onChange={(e)=>{setEditItem({...editItem,"a_u":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Vintage</h3>
                            <input type="date" className='details_input  space-mono-regular' placeholder='Vintage' defaultValue={editItem["vintage"]} onChange={(e)=>{setEditItem({...editItem,"vintage":e.target.value})}}/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty</h3>
                            <input type="number"  className='details_input  space-mono-regular' placeholder='QTY' defaultValue={editItem["qty"]} onChange={(e)=>{setEditItem({...editItem,"qty":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Rate (Each Item)</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Rate (Each Item)' defaultValue={editItem["rate"]} onChange={(e)=>{setEditItem({...editItem,"rate":e.target.value})}}/>
                        </div>
                        
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty SERV</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Qty SERV' defaultValue={editItem["qty_serv"]} onChange={(e)=>{setEditItem({...editItem,"qty_serv":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Qty UNSV</h3>
                            <input type="number"  className='details_input space-mono-regular' placeholder='Qty UNSV' defaultValue={editItem["qty_unsv"]} onChange={(e)=>{setEditItem({...editItem,"qty_unsv":e.target.value})}}/>
                        </div>
                    </div>
                
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Last yr bid value</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Last yr bid value' defaultValue={nonExpendable["last_yr_bid_value"]}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of SERV items</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Value of SERV items' defaultValue={nonExpendable["serv_value"]}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of UNSV items</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Value of UNSV items' defaultValue={nonExpendable["unsv_value"]}/>
                        </div>
                    </div>
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Dep percent of Property</h3>
                            <input type="number" className='details_input  space-mono-regular' placeholder='Dep percent of Property' defaultValue={editItem["dep_value"]} onChange={(e)=>{setEditItem({...editItem,"dep_value":e.target.value})}}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-bold'>Value of Items after Dep</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Value of Items after Dep' defaultValue={nonExpendable["dep_price"]}/>
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
                    <button className='action_btn_1 space-mono-regular' onClick={handleDelete}><MdDelete className='btn_icon'/> Delete</button>
                    <button className='action_btn_1 space-mono-regular' onClick={handleEdit}><MdEdit  className='btn_icon'/> Edit</button>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default Non_Expendable_Item_SF