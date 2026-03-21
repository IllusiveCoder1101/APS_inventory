import React,{useState,useRef,useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { TfiTrash } from "react-icons/tfi";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import Add_Non_Expendable_GF_dialog from '../components/Add_Non_Expendable_GF_dialog';
import { useNavigate } from 'react-router-dom'
import Status_model from '../components/Status_model';
import axios from 'axios'
import * as XLSX from "xlsx-js-style";
function Non_Expendable_Items_GF() {
    
    const navigate=useNavigate()
    const [nonExpendable,setNonExpendable]=useState([])
    const [search,setSearch]=useState("")
    const [filterValues,setFilterValues]=useState([])
    const [page,setPage]=useState(1)
    const [addDialog,setAddDialog]=useState(false)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [selectedCategory,setSelectedCategory]=useState([])
    const [item,setItem]=useState([])
    const [error,setError]=useState(false)
    const listRef = useRef(null);
    
    const [totalPage,setTotalPage]=useState(0)
    
    
    const downloadExcel = (data, filename) => {
        const workbook = XLSX.utils.book_new()
        
        const HEADERS_MAP = {
            ser_no: "Serial No.",
            lp_no:"LP No.",
            nomenclature: "Nomenclature",
            category_appendix:"Consolidated Category",
            a_u:"A/U",
            vinatge:"Vintage",
            qty: "Quantity",
            rate: "Rate",
            qty_ledger: "Quantity Ledger",
            qty_serv: "Quantity Serviciable",
            qty_unsv:"Quantity Unservicable",
            last_yr_bid_value:"Last Year Bid Value",
            serv_value:"Servicable Value",
            unsv_value:"Unservicable Value",
            dep_value: "Depreciation Percentage",
            dep_price: "Final Price",
            remarks: "Remarks",
        }

        Object.entries(data).forEach(([key, item]) => {
            const sheetName = key

            const worksheet = XLSX.utils.aoa_to_sheet([])
            const rows = item.inner_items.map((row) => {
                const formatted = {};
                Object.entries(HEADERS_MAP).forEach(
                    ([key, label]) => {
                        formatted[label] = row[key] ?? "";
                    }
                );
                return formatted;
            });
            if (item?.length) {
            const tableSheet = XLSX.utils.json_to_sheet(
                item,
                { origin: `A1` }
            );
            Object.assign(worksheet, tableSheet);
            }

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                sheetName
            );

        });

        XLSX.utils.book_append_sheet(
            workbook,
            "All Items Summary"
        );

        // ✅ Use provided filename
        XLSX.writeFile(workbook, filename);
    }
    
    const handle_submit_add=(file)=>{
        if (file){

            const formData = new FormData();
            formData.append("file", file);
            let access_token=JSON.parse(sessionStorage.getItem("access_token"))
            axios.post("http://127.0.0.1:8000/non-expendable/create-non-expendable-items/gov",formData,{headers: {Authorization: `Bearer ${access_token}`,},})
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
                        setError(true)
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
        
    const handleCategory=(item)=>{
        if(selectedCategory.indexOf(item)==-1){
            setSelectedCategory([...selectedCategory,item])
        }
        else{
            setSelectedCategory(selectedCategory.filter((category)=>category!=item))
        }
        handleGETRequest()
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
        
        
        let payload={
            "item_ids":item
        }
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.delete("http://127.0.0.1:8000/non-expendable/delete-non-expendable-items",JSON.stringify(payload),{headers:{"Authorization":`Bearer ${access_token}`}})
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
                    setError(true)
                }
                else{
                    setStatus({"type":"error","msg":"Invalid Details!"})
                }
            })
    }
    const handle_item_download=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get("http://127.0.0.1:8000/non-expendable/download-non-expendable-items/gov",{headers:{"Authorization":`Bearer ${access_token}`}})
        .then((data)=>{
            if(data.status==200){
                const dataset=data.data.items
                downloadExcel(dataset, "Non_Expendable_Gov_Fund.xlsx");
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

    const handleNavigate=(page,item_id)=>{
        sessionStorage.setItem("non_expendable_gf_id",item_id)
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
        axios.get("http://127.0.0.1:8000/non-expendable/get-non-expendable-items/gov",{params: { category_appendix_filter: selectedCategory.length ? selectedCategory: undefined, search : search || undefined , skip : page , limit : 10 ,},headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setNonExpendable(data.data.items)
                    setPage(1)
                    setTotalPage(Math.ceil(data.data.total / data.data.limit))
                    setFilterValues(data.data.filter_values)
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
    
    const handlePageChange=(pg)=>{
        setPage(pg)
        handleGETRequest()
        listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
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
        <Status_model msg={status['msg']} type={status['type']}/>
        <Add_Non_Expendable_GF_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog} handle_submit={handle_submit_add}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (Gov)</h1>
                    <div className='input_holder'>
                        <IoIosSearch className='icon_1'/>
                        <input type="text" placeholder='Search For Items' className='input_box space-mono-regular' defaultValue={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") {handleGETRequest()}}}/>
                    </div>
                    
                </div>
                {filterValues.length>0 && <div className="inner_section">
                    <h2 className="section_title_1 space-mono-bold ">Category Appendix Filter</h2>   
                    <div className="items_container">
                        {filterValues.map((filter)=>{
                            return (
                                <button key={filter} className={(selectedCategory.indexOf(filter)==-1)?"filter_btn space-mono-regular":"active_btn space-mono-regular"} onClick={()=>handleCategory(filter)}>{filter}</button>
                            )
                        })}
                    
                    </div>                 
                </div>   }      
                <div className="table_section">
                    {(nonExpendable.length>0)?<table className='table_container' ref={listRef}>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Ser No.</th>
                                <th  className='col_heading space-mono-bold'>LP No.</th>
                                <th  className='col_heading space-mono-bold'>Nomenclature</th>
                                <th  className='col_heading space-mono-bold'>A/U</th>
                                <th  className='col_heading space-mono-bold'>Category</th>
                                <th className='col_heading space-mono-bold'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            
                            {nonExpendable.map((items)=>{
                                return (
    
                                    <tr className={(item.indexOf(items.ser_no)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(items.ser_no)}>
                                        <td className='table_data space-mono-regular'>{items.ser_no}</td>
                                        <td className='table_data space-mono-regular'>{items.lp_no}</td>
                                        <td className='table_data space-mono-regular'>{items.nomenclature}</td>
                                        <td className='table_data space-mono-regular'>{items.category_appendix}</td>
                                        <td className='table_data space-mono-regular'>{items.a_u}</td>
                                        <td className='table_data'>
                                        <div className='action_btn_holder'>
                                                <button className='view_btn'  onClick={()=>handleNavigate(`/non-expendable-items-gf/${items.ser_no}`, items.ser_no)}>View More</button>
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

export default Non_Expendable_Items_GF