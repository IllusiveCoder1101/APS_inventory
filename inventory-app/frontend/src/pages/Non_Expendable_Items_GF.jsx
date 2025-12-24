import React,{useState} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { TfiTrash } from "react-icons/tfi";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import Add_Non_Expendable_GF_dialog from '../components/Add_Non_Expendable_GF_dialog';
import { useNavigate } from 'react-router-dom'
import Status_model from '../components/Status_model';
function Non_Expendable_Items_GF() {
   
    const navigate=useNavigate()
    const [addDialog,setAddDialog]=useState(false)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [selectedCategory,setSelectedCategory]=useState([])
    const [item,setItem]=useState([])
    const handle_submit_add=()=>{
        setStatus({"type":"error","msg":"Invalid Details!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
        },2000)
    }
        
    const handleCategory=(item)=>{
        if(selectedCategory.indexOf(item)==-1){
            setSelectedCategory([...selectedCategory,item])
        }
        else{
            setSelectedCategory(selectedCategory.filter((category)=>category!=item))
        }
    }

    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
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
    const handleNavigate=(page)=>{
        navigate(page)
    }
    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Add_Non_Expendable_GF_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog} handle_submit={handle_submit_add}/>
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
                        <button className={(selectedCategory.indexOf("Category 1")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 1")}>Category 1</button>
                        <button className={(selectedCategory.indexOf("Category 2")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 2")}>Category 2</button>
                        <button className={(selectedCategory.indexOf("Category 3")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 3")}>Category 3</button>
                        <button className={(selectedCategory.indexOf("Category 4")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 4")}>Category 4</button>
                        <button className={(selectedCategory.indexOf("Category 5")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 5")}>Category 5</button>
                        <button className={(selectedCategory.indexOf("Category 6")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 6")}>Category 6</button>
                        <button className={(selectedCategory.indexOf("Category 7")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 7")}>Category 7</button>
                        <button className={(selectedCategory.indexOf("Category 8")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 8")}>Category 8</button>
                        <button className={(selectedCategory.indexOf("Category 9")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 9")}>Category 9</button>
                        <button className={(selectedCategory.indexOf("Category 10")==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory("Category 10")}>Category 10</button>
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
                            <tr className={(item.indexOf(1)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(1)}>
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
                            <tr className={(item.indexOf(2)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(2)}>
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
                            <tr className={(item.indexOf(3)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(3)}>
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
                            <tr className={(item.indexOf(4)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(4)}>
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
                            <tr className={(item.indexOf(5)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(5)}>
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
                            <tr className={(item.indexOf(6)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(6)}>
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
                    <div className='items_btn_container'>
                        {(item.length>0)?<button className='action_btn_3 space-mono-regular' onClick={()=>handle_item_deletion()}><TfiTrash className='btn_icon_2'/> Delete Items</button>:<></>}
                        <button className='action_btn_1 space-mono-regular' onClick={()=>handle_add_dialog()}><IoIosAdd  className='btn_icon'/> New Items</button>
                    </div>
                </div>
            </div>
        </div>
    </div> 
  )
}

export default Non_Expendable_Items_GF