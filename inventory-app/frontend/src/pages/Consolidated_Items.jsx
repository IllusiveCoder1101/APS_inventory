import React,{useState,useEffect,useRef} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import { TfiTrash } from "react-icons/tfi";
import { IoIosArrowBack, IoIosArrowForward  } from "react-icons/io";
import Add_Consolidated_dialog from '../components/Add_Consolidated_dialog';
import { useNavigate } from 'react-router-dom'
import Status_model from '../components/Status_model';
import axios from 'axios'
import * as XLSX from "xlsx-js-style";
function Consolidated_Items() {
    const [consolidatedItems,setConsolidatedItems]=useState([])
    const [search,setSearch]=useState("")
    const [filterValues,setFilterValues]=useState([])
    const [page,setPage]=useState(1)
    const [addDialog,setAddDialog]=useState(false)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [selectedCategory,setSelectedCategory]=useState([])
    const [item,setItem]=useState([])
    const listRef = useRef(null);

    const [totalPage,setTotalPage]=useState(0)
    


    const downloadExcel = (data, filename = "items.xlsx") => {
        
        
        const worksheet = XLSX.utils.json_to_sheet(data);

        const range = XLSX.utils.decode_range(worksheet["!ref"]);

        
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } },
            alignment: { horizontal: "center", vertical: "center" },
            border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            },
        };

        
        const cellStyle = {
            alignment: { vertical: "center" },
            border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
            },
        };

        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
            if (cell) cell.s = headerStyle;
        }

        for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
            const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell) cell.s = cellStyle;
            }
        }

        
        worksheet["!cols"] = Object.keys(data[0] || {}).map(() => ({
            wch: 18,
        }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Items");

        XLSX.writeFile(workbook, filename);
    }


    const handle_submit_add=(file)=>{
        if (file){
            let access_token=JSON.parse(sessionStorage.getItem("access_token"))
            const formData = new FormData();
            formData.append("file", file);

            axios.post("http://127.0.0.1:8000/consolidated/create-consolidated-items",formData,{headers: {Authorization: `Bearer ${access_token}`,},})
                .then((data)=>{
                    if(data.status==200){
                        setStatus({"type":"success","msg":"Successfully Created!"})
                        setTimeout(()=>{
                            setStatus({"type":"","msg":""})
                            handleGETRequests()
                        },1000)
                    }
                })
                .catch((error)=>{
                    if(error.status==401){
                        handleRefresh()
                    }
                    else{
                        setStatus({"type":"error","msg":"Invalid Details!"})
                    }
                })
        }
        else{
            setStatus({"type":"error","msg":"Invalid Details!"})
        }
    }


    const navigate=useNavigate()
    
    const handle_add_dialog=()=>{
        setAddDialog(!addDialog)
    }
    
    const handleCategory=(item)=>{
        if(selectedCategory.indexOf(item)==-1){
            setSelectedCategory([...selectedCategory,item])
            
        }
        else{
            setSelectedCategory(selectedCategory.filter((category)=>category!=item))
        }
        handleGETRequest()
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
        
        
        let payload={
            "item_ids":item
        }
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.delete("http://127.0.0.1:8000/consolidated/delete-consolidated-items",JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Deleted!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        setItem([])
                        handleGETRequests()
                    },1000)
                }
            })
            .catch((error)=>{
                if(error.status==401){
                    handleRefresh()
                }
                else{
                    setStatus({"type":"error","msg":"Invalid Details!"})
                }
            })
        
    }

    const handle_item_download=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get("http://127.0.0.1:8000/consolidated/download-consolidated-items",{headers:{"Authorization":`Bearer ${access_token}`}})
        .then((data)=>{
            if(data.status==200){

                const dataset=data.data.items

                const formatted = dataset.map(i => ({
                    "Property Head": i.property_head,
                    "Appendix": i.appendix,
                    "Fund Details": i.fund_details,
                    "Last Year Value": i.prev_year_value,
                    "Last Year Purchases": i.prev_year_purchases,
                    "UNSV Value": i.unsv_value,
                    "SERV Value": i.serv_value,
                    "Depreciated Value": i.dep_value,
                    "Remarks": i.remarks ?? "",
                }));

                downloadExcel(formatted, "Consolidated.xlsx");
            }
        })
        .catch((error)=>{
            if(error.status==401){
                    handleRefresh()
                }
            else{
                setStatus({"type":"error","msg":"Invalid Details!"})
            }
        })
    
    }

    const handleNavigate=(page,appendix)=>{
        sessionStorage.setItem("consolidated_item_id",appendix)
        navigate(page)
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
            })
    }
    const handleGETRequest=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get("http://127.0.0.1:8000/consolidated/get-consolidated-items",{params: { fund_details_filter: selectedCategory.length ? selectedCategory: undefined, search : search || undefined , skip : page , limit : 10 ,},headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setConsolidatedItems(data.data.items)
                    setPage(1)
                    setTotalPage(Math.ceil(data.data.total / data.data.limit))
                    setFilterValues(data.data.filter_values)
                }
            })
            .catch((error)=>{
                if(error.status==401){
                        handleRefresh()
                    }
                else{
                    setStatus({"type":"error","msg":"Invalid Details!"})
                }
            })
    
    
    }
    
    const handlePageChange=(pg)=>{
        setPage(pg)
        handleGETRequest()
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }


    useEffect(()=>{
        handleGETRequest()
    },[])


    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Add_Consolidated_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog} handle_submit={handle_submit_add}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Consolidated Items</h1>
                    <div className='input_holder'>
                        <IoIosSearch className='icon_1'/>
                        <input type="text" placeholder='Search For Items' className='input_box space-mono-regular' defaultValue={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") {handleGETRequest()}}}/>
                    </div>
                    
                </div>
                {filterValues.length>0 && <div className="inner_section">
                    <h2 className="section_title_1 space-mono-bold ">Fund Details Filter</h2>   
                    <div className="items_container">
                        {filterValues.map((filter)=>{
                            return (
                                <button key={filter} className={(selectedCategory.indexOf(filter)==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory(filter)}>{filter}</button>
                            )
                        })}
                    
                    </div>                 
                </div>   }          
                <div className="table_section">
                    
                    {(consolidatedItems.length>0)?<table className='table_container' ref={listRef}>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Property Head</th>
                                <th  className='col_heading space-mono-bold'>Appendix</th>
                                <th  className='col_heading space-mono-bold'>Fund Details</th>
                                <th  className='col_heading space-mono-bold'>Past Value</th>
                               
                                <th className='col_heading space-mono-bold'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            {consolidatedItems.map((consolidated)=>{
                                return (
                                    <tr className={(item.indexOf(consolidated.appendix)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(consolidated.appendix)}>
                                        <td className='table_data space-mono-regular'>{consolidated.property_head}</td>
                                        <td className='table_data space-mono-regular'>{consolidated.appendix}</td>
                                        <td className='table_data space-mono-regular'>{consolidated.fund_details}</td>
                                        <td className='table_data space-mono-regular'>{consolidated.prev_year_value}</td>
                                        
                                        
                                        <td className='table_data'>
                                            <div className='action_btn_holder'>
                                                <button className='view_btn' onClick={()=>handleNavigate(`/consolidated-items/${consolidated.appendix}`, consolidated.appendix)}>View More</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>:<div className='empty_handler'>
                        <h3 className='empty_handler_text red-hat-display-bold'>No Items Found</h3>
                    </div>}
                </div>
                {totalPage && <div className='pagination_container'>
                    <button
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                        className='pagination_button space-mono-regular'
                    >
                        <IoIosArrowBack className='pagination_icon'/>
                    </button>

                    <div className="pages_container">
                        {Array.from({ length: totalPage }, (_, i) => i + 1)
                        .slice(
                        Math.max(0, page - 3),
                        Math.min(totalPage, page + 2)
                        )
                        .map(p => (
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
                        className='pagination_button space-mono-regular'>
                        <IoIosArrowForward className='pagination_icon'/>
                    </button>
                </div>}
                <div className="btn_section">
                    <button className='action_btn_1 space-mono-regular' onClick={handle_item_download}><GoDownload className='btn_icon'/> Download</button>
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

export default Consolidated_Items