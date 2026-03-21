import React,{useState,useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import { IoIosArrowBack, IoIosArrowForward  } from "react-icons/io";
import Add_Expendable_Issue_dialog from '../components/Add_Expendable_Issue_dialog';
import Edit_Expendable_Issue_dialog from '../components/Edit_Expendable_Issue_dialog';
import Status_model from '../components/Status_model';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
function Expendable_Item() {
    const expendable_item_id = sessionStorage.getItem("expendable_item_id")
    const [expendableItem,setExpendableItem]=useState({})
    const [addDialog,setAddDialog]=useState(false)
    const [editDialog,setEditDialog]=useState(false)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [issue,setIssue]=useState([])
    const [item,setItem]=useState([])
    const [editIssue,setEditIssue]=useState({"item_id":0})
    const [editItem,setEditItem]=useState({"items":"","remarks":""})
    const [search,setSearch]=useState("")
    const [page,setPage]=useState(1)
    const [totalPage,setTotalPage]=useState(0)
    const [error,setError]=useState(false)
    const navigate=useNavigate()
    
    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
    }

    const handle_edit_dialog=()=>{
        
        setEditDialog(!editDialog)
    }

    const handleDelete=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.delete(`http://127.0.0.1:8000/expendable/delete-expendable-item/${expendable_item_id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Deleted Item!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        navigate("/expendable-items")
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
        axios.put(`http://127.0.0.1:8000/expendable/edit-expendable-item/${expendable_item_id}`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
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
        axios.get(`http://127.0.0.1:8000/expendable/get-expendable-item/${expendable_item_id}`,{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setExpendableItem({...data.data["items"],"final_balance":data.data["final_balance"]})
                    setEditItem({"items":data.data["items"]["items"],"unit":data.data["items"]["unit"],"remarks":data.data["items"]["remarks"]})
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
    const handleEditIssueRequest=(payload)=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.put(`http://127.0.0.1:8000/expendable-issue/edit-expendable-issue/${editIssue["item_id"]}`,JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Edited Issue!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        handleGETIssueRequest()
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
    const handleAddIssueRequest=(payload)=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        payload["category_id"] = expendable_item_id

        axios.post("http://127.0.0.1:8000/expendable-issue/create-expendable-issue",JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Created Issue!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        handleGETIssueRequest()
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
    const handleDeleteIssueRequest=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        let payload=item
        axios.delete("http://127.0.0.1:8000/expendable-issue/delete-expendable-issue",JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Deleted Issue!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        handleGETIssueRequest()
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
    const handleGETIssueRequest=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get(`http://127.0.0.1:8000/expendable-issue/get-expendable-issue/${expendable_item_id}`,{params: { search : search || undefined , skip : page , limit : 10 ,},headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setIssue(data.data.items)
                    setPage(1)
                    setTotalPage(Math.ceil(data.data.total / data.data.limit))
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
    const select_item=(item_id)=>{
        if(item.indexOf(item_id)!=-1){
            setItem(item.filter((item_query)=>item_query!=item_id))
        }
        else{
            setItem([...item,item_id])
        }
    }
    const handlePageChange=(pg)=>{
        setPage(pg)
        handleGETRequest()
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
    useEffect(()=>{
        handleGETRequest()
        handleGETIssueRequest()
    },[])

    useEffect(()=>{
        if(error){
            handleRefresh()
        }
    },[error])
    useEffect(()=>{
        if(status["type"]){
            setTimeout(()=>{
                setStatus({"type":"","msg":""})
            },1000)
        }
    },[status["type"]])
    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Edit_Expendable_Issue_dialog dialog_status={editDialog} handle_add_dialog={handle_edit_dialog} handle_submit={handleEditIssueRequest}/>
        <Add_Expendable_Issue_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog} handle_submit={handleAddIssueRequest}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Expendable Item Details</h1>
                    
                </div>
                <div className="item_details">
                    <div className="primary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Item Name</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='Item Name' defaultValue={editItem["items"]} onChange={(e)=>setEditItem({...editItem,"items":e.target.value})}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Ledger Balance</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='Ledger Balance' defaultValue={expendableItem["qty_prev_month"]}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Unit</h3>
                            <input type="text" className='details_input  space-mono-regular' placeholder='New Purchases' defaultValue={editItem["unit"]} onChange={(e)=>setEditItem({...editItem,"unit":e.target.value})}/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>New Purchase</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='New Purchases' defaultValue={expendableItem["purchase_curr_month"]}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Utilized</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Utilized' defaultValue={expendableItem["utilized_curr_month"]}/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Ground Balance</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Ground Balance' defaultValue={expendableItem["final_balance"]}/>
                        </div>
                    </div>
                    <div className="tertiary_details_section">
                        <div className="details_container_1">
                            <h3 className='details_name red-hat-display-regular'>Remarks</h3>
                            <input type="text" className='details_input space-mono-regular' placeholder='Remarks' defaultValue={editItem["remarks"]} onChange={(e)=>setEditItem({...editItem,"remarks":e.target.value})}/>
                        </div>
                    </div>
                </div>
                <div className='section_header'>
                    <h3 className="details_name_1 red-hat-display-bold ">Item Issue</h3>
                    <div className='input_holder'>
                        <IoIosSearch className='icon_1'/>
                        <input type="text" placeholder='Search For Items' className='input_box space-mono-regular' defaultValue={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") {handleGETIssueRequest()}}}/>
                    </div>
                                        
                </div>
                <div className="table_section">
                    
                    {(issue.length>0)?<table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th className='col_heading space-mono-bold'>Date</th>
                            <th  className='col_heading space-mono-bold'>RV/IV</th>
                            <th  className='col_heading space-mono-bold'>Whom ID Issue</th>
                            <th  className='col_heading space-mono-bold'>QTY Arrived</th>
                            <th  className='col_heading space-mono-bold'>QTY Issued</th>
                            <th className='col_heading space-mono-bold'>Actions</th>
                        </thead>
                        <tbody className='table_body'>
                            {issue.map((i)=>{
                                return (
                                    <tr className={(item.indexOf(i["ser_no"])!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(i["ser_no"])}>
                                        <td className='table_data space-mono-regular'>{i["ser_no"]}</td>
                                        <td className='table_data space-mono-regular'>{i["date"]}</td>
                                        <td className='table_data space-mono-regular'>{i["rv_iv"]}</td>
                                        <td className='table_data space-mono-regular'>{i["whom_id_issue"]}</td>
                                        <td className='table_data space-mono-regular'>{i["qty_received"]}</td>
                                        <td className='table_data space-mono-regular'>{i["qty_issued"]}</td>
                                        <td className='table_data'>
                                            <div className='action_btn_holder'>
                                                <button className='action_btn red-hat-display-regular' onClick={()=>{setEditIssue({"item_id":i['ser_no']});handle_edit_dialog()}}><MdEdit className='edit_icon'/></button>
                                            </div>
                                        </td>
                                    </tr>
                                )   
                            })}

                            
                            
                        </tbody>
                    </table>:<div className='empty_handler'>
                        <h3 className='empty_handler_text red-hat-display-bold'>No Issues Found</h3>
                    </div>}
                    {totalPage && 
                    <div className='pagination_container'>
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className='pagination_button space-mono-regular'
                        >
                            <IoIosArrowBack className='pagination_icon'/>
                        </button>
                                    
                        <div className="pages_container">
                            {Array.from({ length: totalPage }, (_, i) => i + 1).slice(Math.max(0, page - 3),Math.min(totalPage, page + 2)).map(p => (
                            <button
                                key={p}
                                onClick={() => handlePageChange(p)}
                                className={(p==page)?"pagination_page_button space-mono-regular pagination_active":"pagination_page_button space-mono-regular"}
                            >
                                {p}
                            </button>
                            ))}
                                    
                        </div>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPage}
                            className='pagination_button space-mono-regular'
                        >
                            <IoIosArrowForward className='pagination_icon'/>
                        </button>
                    </div>}
                    <div className="btn_holder">
                        <button className='action_btn_2 space-mono-regular'  onClick={()=>handle_add_dialog()}> <FaPlus className='btn_icon_1'/>Add Issue</button>
                        {(item.length>0)?<button className='action_btn_3_2 space-mono-regular' onClick={()=>handleDeleteIssueRequest()}><TfiTrash className='btn_icon_2'/> Delete issues</button>:<></>}
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

export default Expendable_Item