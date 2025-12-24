import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { TfiTrash } from "react-icons/tfi";
import Add_Expendable_Issue_dialog from '../components/Add_Expendable_Issue_dialog';
import Edit_Expendable_Issue_dialog from '../components/Edit_Expendable_Issue_dialog';
import Status_model from '../components/Status_model';
import { useNavigate } from 'react-router-dom';

function Expendable_Item() {
    const [addDialog,setAddDialog]=useState(false)
    const [editDialog,setEditDialog]=useState(false)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [item,setItem]=useState([])
    const navigate=useNavigate()
    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
    }

    const handle_edit_dialog=()=>{
        setEditDialog(!editDialog)
    }

    const handle_add_issue_submit=()=>{
        setStatus({"type":"success","msg":"Successfully Added Issue!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
        },2000)
    }

    const handle_edit_issue_dialog=()=>{
        setStatus({"type":"success","msg":"Successfully Edited Issue!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
        },2000)
    }
    

    const handleDelete=()=>{
        setStatus({"type":"success","msg":"Successfully Deleted Item!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
            navigate("/expendable-items")
        },2000)
    }

    const handleEdit=()=>{
        setStatus({"type":"success","msg":"Successfully Edited Item!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
        },2000)
    }
    const select_item=(item_id)=>{
        if(item.indexOf(item_id)!=-1){
            setItem(item.filter((item_query)=>item_query!=item_id))
        }
        else{
            setItem([...item,item_id])
        }
    }
    const handle_item_deletion=()=>{
        setStatus({"type":"success","msg":"Successfully Deleted!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
            setItem([])
        },2000)
    }
    
    
    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Edit_Expendable_Issue_dialog dialog_status={editDialog} handle_add_dialog={handle_edit_dialog} handle_submit={handle_edit_issue_dialog}/>
        <Add_Expendable_Issue_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog} handle_submit={handle_add_issue_submit}/>
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
                            <input type="text" className='details_input  space-mono-regular' placeholder='Item Name'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Ledger Balance</h3>
                            <input type="number" className='details_input  space-mono-regular' placeholder='Ledger Balance'/>
                        </div>
                    </div>
                    <div className="secondary_details_section">
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>New Purchase</h3>
                            <input type="number" disabled className='details_input  space-mono-regular' placeholder='New Purchases'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Utilized</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Utilized'/>
                        </div>
                        <div className="details_container">
                            <h3 className='details_name red-hat-display-regular'>Ground Balance</h3>
                            <input type="number" disabled className='details_input space-mono-regular' placeholder='Ground Balance'/>
                        </div>
                    </div>
                    <div className="tertiary_details_section">
                        <div className="details_container_1">
                            <h3 className='details_name red-hat-display-regular'>Remarks</h3>
                            <input type="text" className='details_input space-mono-regular' placeholder='Remarks'/>
                        </div>
                    </div>
                </div>
                <div className="table_section">
                    <div className='section_header'>
                        <h3 className="details_name_1 red-hat-display-bold ">Item Issue</h3>
                        <div className='input_holder'>
                            <IoIosSearch className='icon_1'/>
                            <input type="text" placeholder='Search For Items' className='input_box space-mono-regular'/>
                        </div>
                                        
                    </div>
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Date</th>
                            <th  className='col_heading space-mono-bold'>RV/IV</th>
                            <th  className='col_heading space-mono-bold'>Whom ID Issue</th>
                            <th  className='col_heading space-mono-bold'>QTY Arrived</th>
                            <th  className='col_heading space-mono-bold'>QTY Issued</th>
                            <th  className='col_heading space-mono-bold'>QTY Balance</th>

                            <th className='col_heading space-mono-bold'>Actions</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className={(item.indexOf(1)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(1)}>
                                <td className='table_data space-mono-regular'>01/12/25</td>
                                <td className='table_data space-mono-regular'>---</td>
                                <td className='table_data space-mono-regular'>Teacher Name</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn red-hat-display-regular' onClick={()=>handle_edit_dialog()}><MdEdit className='edit_icon'/></button>
                                        <button className='action_btn red-hat-display-regular'><MdDelete className='delete_icon'/></button>

                                    </div>
                                </td>
                            </tr>

                            <tr className={(item.indexOf(2)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(2)}>
                                <td className='table_data space-mono-regular'>01/12/25</td>
                                <td className='table_data space-mono-regular'>---</td>
                                <td className='table_data space-mono-regular'>Teacher Name</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn red-hat-display-regular' onClick={()=>handle_edit_dialog()}><MdEdit className='edit_icon'/></button>
                                        <button className='action_btn red-hat-display-regular'><MdDelete className='delete_icon'/></button>

                                    </div>
                                </td>
                            </tr>

                            <tr className={(item.indexOf(3)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(3)}>
                                <td className='table_data space-mono-regular'>01/12/25</td>
                                <td className='table_data space-mono-regular'>---</td>
                                <td className='table_data space-mono-regular'>Teacher Name</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn red-hat-display-regular' onClick={()=>handle_edit_dialog()}><MdEdit className='edit_icon'/></button>
                                        <button className='action_btn red-hat-display-regular'><MdDelete className='delete_icon'/></button>

                                    </div>
                                </td>
                            </tr>

                            <tr className={(item.indexOf(4)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(4)}>
                                <td className='table_data space-mono-regular'>01/12/25</td>
                                <td className='table_data space-mono-regular'>---</td>
                                <td className='table_data space-mono-regular'>Teacher Name</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn red-hat-display-regular' onClick={()=>handle_edit_dialog()}><MdEdit className='edit_icon'/></button>
                                        <button className='action_btn red-hat-display-regular'><MdDelete className='delete_icon'/></button>

                                    </div>
                                </td>
                            </tr>

                            <tr className={(item.indexOf(5)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(5)}>
                                <td className='table_data space-mono-regular'>01/12/25</td>
                                <td className='table_data space-mono-regular'>---</td>
                                <td className='table_data space-mono-regular'>Teacher Name</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn red-hat-display-regular' onClick={()=>handle_edit_dialog()}><MdEdit className='edit_icon'/></button>
                                        <button className='action_btn red-hat-display-regular'><MdDelete className='delete_icon'/></button>

                                    </div>
                                </td>
                            </tr>


                            <tr className={(item.indexOf(6)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(6)}>
                                <td className='table_data space-mono-regular'>01/12/25</td>
                                <td className='table_data space-mono-regular'>---</td>
                                <td className='table_data space-mono-regular'>Teacher Name</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data space-mono-regular'>0</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn red-hat-display-regular' onClick={()=>handle_edit_dialog()}><MdEdit className='edit_icon'/></button>
                                        <button className='action_btn red-hat-display-regular'><MdDelete className='delete_icon'/></button>

                                    </div>
                                </td>
                            </tr>
                            
                        </tbody>
                    </table>
                    <div className="btn_holder">
                        <button className='action_btn_2 space-mono-regular'  onClick={()=>handle_add_dialog()}> <FaPlus className='btn_icon_1'/>Add Issue</button>
                        {(item.length>0)?<button className='action_btn_3_2 space-mono-regular' onClick={()=>handle_item_deletion()}><TfiTrash className='btn_icon_2'/> Delete issues</button>:<></>}
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