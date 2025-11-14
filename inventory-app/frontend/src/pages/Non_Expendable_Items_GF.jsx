import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { MdEditSquare,MdDelete } from "react-icons/md";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import Add_Non_Expendable_GF_dialog from '../components/Add_Non_Expendable_GF_dialog';
import Edit_Non_Expendable_GF_dialog from '../components/Edit_Non_Expendable_GF_dialog';


function Non_Expendable_Items_GF() {
    const [editDialog,setEditDialog]=useState(false)
    const [addDialog,setAddDialog]=useState(false)
    const handle_edit_dialog=()=>{
        setEditDialog(!editDialog)
    }
    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
    }
    return (
    <div className='page_container_1'>
        <Edit_Non_Expendable_GF_dialog dialog_status={editDialog} handle_edit_dialog={handle_edit_dialog}/>
        <Add_Non_Expendable_GF_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (Gov)</h1>
                    <div className='input_holder'>
                        <IoIosSearch className='icon_1'/>
                        <input type="text" placeholder='Search For Items' className='input_box space-mono-regular'/>
                    </div>
                    
                </div>
                <div className="inner_section">
                    <h2 className="section_title_1 space-mono-bold ">Category</h2>   
                    <div className="items_container">
                        <button className="filter_btn space-mono-regular">Category 1</button>
                        <button className="active_btn space-mono-regular">Category 1</button>
                        <button className="active_btn space-mono-regular">Category 1</button>
                        <button className="filter_btn space-mono-regular">Category 1</button>
                        <button className="filter_btn space-mono-regular">Category 1</button>
                        <button className="filter_btn space-mono-regular">Category 1</button>
                        <button className="filter_btn space-mono-regular">Category 1</button>
                        <button className="active_btn space-mono-regular">Category 1</button>
                        <button className="filter_btn space-mono-regular">Category 1</button>
                        <button className="filter_btn space-mono-regular">Category 1</button>
                    </div>                 
                </div>
                <div className="inner_section">
                    <h2 className="section_title_1 space-mono-bold ">Columns</h2>
                    <div className="items_container">
                        <button className="filter_btn space-mono-regular">Column 1</button>
                        <button className="active_btn space-mono-regular">Column 1</button>
                        <button className="filter_btn space-mono-regular">Column 1</button>
                        <button className="filter_btn space-mono-regular">Column 1</button>
                        <button className="active_btn space-mono-regular">Column 1</button>
                        <button className="filter_btn space-mono-regular">Column 1</button>
                    </div>
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th className='col_heading space-mono-bold'>Actions</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/></button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/></button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/></button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/></button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/></button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/> </button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='action_btn'><MdEditSquare className='edit_icon' onClick={()=>handle_edit_dialog()}/></button>
                                        <button className='action_btn'><MdDelete className='delete_icon'/></button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="btn_section">
                    <button className='action_btn_1 space-mono-regular'><GoDownload className='btn_icon'/> Download</button>
                    <button className='action_btn_1 space-mono-regular' onClick={()=>handle_add_dialog()}><IoIosAdd  className='btn_icon'/> New Items</button>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default Non_Expendable_Items_GF