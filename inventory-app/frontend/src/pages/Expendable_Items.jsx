import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import Add_Expendable_dialog from '../components/Add_Expendable_dialog';
import { useNavigate } from 'react-router-dom'

function Expendable_Items() {
    const [addDialog,setAddDialog]=useState(false)
    const navigate=useNavigate()

    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
    }

    
    
    const handleNavigate=(page)=>{
        navigate(page)
    }
    return (
    <div className='page_container_1'>
        
        <Add_Expendable_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Expendable Items</h1>
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
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Ser No.</th>
                                <th  className='col_heading space-mono-bold'>Items</th>
                                <th  className='col_heading space-mono-bold'>Ledger Balance</th>
                                <th  className='col_heading space-mono-bold'>Utilized</th>
                                <th  className='col_heading space-mono-bold'>Ground Balance</th>
                                <th className='col_heading space-mono-bold'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn' onClick={()=>handleNavigate("/expendable-items/1")}>View More</button>
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

export default Expendable_Items