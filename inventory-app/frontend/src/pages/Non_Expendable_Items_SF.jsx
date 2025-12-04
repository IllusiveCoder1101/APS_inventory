import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import Add_Non_Expendable_SF_dialog from '../components/Add_Non_Expendable_SF_dialog';
import { useNavigate } from 'react-router-dom'

function Non_Expendable_Items_SF() {
    const [addDialog,setAddDialog]=useState(false)
    
    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
    }
    const navigate=useNavigate()
    
    const handleNavigate=(page)=>{
        navigate(page)
    }
    return (
    <div className='page_container_1'>
        
        <Add_Non_Expendable_SF_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (School)</h1>
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
                                <th  className='col_heading space-mono-bold'>LP No.</th>
                                <th  className='col_heading space-mono-bold'>Nomenclature</th>
                                <th  className='col_heading space-mono-bold'>A/U</th>
                                <th  className='col_heading space-mono-bold'>Vintage</th>
                                <th className='col_heading space-mono-bold'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                   <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
                                    </div>
                                </td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22/06/93</td>
                                <td className='table_data'>
                                    <div className='action_btn_holder'>
                                        <button className='view_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf/1")}>View More</button>
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

export default Non_Expendable_Items_SF