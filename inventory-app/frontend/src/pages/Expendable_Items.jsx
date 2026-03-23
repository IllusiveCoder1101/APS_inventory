import React,{useState,useRef,useEffect} from 'react'
import Sidebar from '../components/Sidebar'
import { IoIosSearch } from "react-icons/io";
import { GoDownload } from "react-icons/go";
import { IoIosAdd } from "react-icons/io";
import { TfiTrash } from "react-icons/tfi";
import { IoIosArrowBack, IoIosArrowForward  } from "react-icons/io";
import Add_Expendable_dialog from '../components/Add_Expendable_dialog';
import { useNavigate } from 'react-router-dom'
import Status_model from '../components/Status_model';
import axios from 'axios';
import * as XLSX from 'xlsx-js-style';
function Expendable_Items() {

    const [addDialog,setAddDialog]=useState(false)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [item,setItem]=useState([])

    const [ExpendableItems,setExpendableItems]=useState([])
    const [search,setSearch]=useState("")
    const listRef = useRef(null);
    const [page,setPage]=useState(1)
    const [totalPage,setTotalPage]=useState(0)

    const [error,setError]=useState(false)
    const [loading,setLoading]=useState(true)
    

    function downloadExcel(data, filename) {
        const workbook = XLSX.utils.book_new();

        const summaryRows = [];

        const SUMMARY_FIELDS = [
            "Ser No",
            "Item Name",
            "Qty Previous Month",
            "Purchase Current Month",
            "Utilized Current Month",
            "Final Balance",
            "Remarks",
        ];

        Object.entries(data).forEach(([key, item]) => {
            const sheetName = (item["Item Name"] || key).toString().slice(0, 31);

            // ---------- ITEM SHEET ----------
            const worksheet = XLSX.utils.aoa_to_sheet([]);

            // Metadata
            const metadata = [
                ["Ser No", item["Ser No"]],
                ["item Name", item["Item Name"]],
                ["Qty Previous Month", item["Qty Previous Month"]],
                ["Purchase Current Month", item["Purchase Current Month"]],
                ["Utilized Current Month", item["Utilized Current Month"]],
                ["Final Balance", item["Final Balance"]],
                ["Remarks", item["Remarks"]],
                [],
            ];

            XLSX.utils.sheet_add_aoa(worksheet, metadata, {
            origin: "A1",
            });

            // Inner items table
            const tableStartRow = metadata.length;

            if (item.inner_items?.length) {
            const tableSheet = XLSX.utils.json_to_sheet(
                item.inner_items,
                { origin: `A${tableStartRow + 1}` }
            );
            Object.assign(worksheet, tableSheet);
            }

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                sheetName
            );

            // ---------- SUMMARY ROW ----------
            const summaryRow = {};
            SUMMARY_FIELDS.forEach((field) => {
            summaryRow[field] = item[field] ?? "";
            });

            summaryRows.push(summaryRow);
        });

        // ---------- SUMMARY SHEET ----------
        const summarySheet =
            XLSX.utils.json_to_sheet(summaryRows);

        XLSX.utils.book_append_sheet(
            workbook,
            summarySheet,
            "All Items Summary"
        );

        // ✅ Use provided filename
        XLSX.writeFile(workbook, filename);
    }

    
    const handle_item_download=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get("http://127.0.0.1:8000/expendable/download-expendable-items",{headers:{"Authorization":`Bearer ${access_token}`}})
        .then((data)=>{
            if(data.status==200){

                const dataset=data.data.items

                const formatted = dataset.map(i => ({
                    "Ser No": i["item_details"].ser_no,
                    "Item Name": i["item_details"].items,
                    "Qty Previous Month": i["item_details"].qty_prev_month,
                    "Purchase Current Month": i["item_details"].purchase_curr_month,
                    "Utilized Current Month": i["item_details"].utilized_curr_month,
                    "Final Balance": i["item_details"].final_balance,
                    "Remarks": i["item_details"].remarks ?? "",
                    "inner_items":i["inner_items"]
                }));

                downloadExcel(formatted, "Expendable.xlsx");
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

    const handle_submit_add=(file)=>{
        if (file){

            const formData = new FormData();
            formData.append("file", file);
            let access_token=JSON.parse(sessionStorage.getItem("access_token"))
            axios.post("http://127.0.0.1:8000/expendable/create-expendable-items",formData,{headers: {Authorization: `Bearer ${access_token}`,},})
                .then((data)=>{
                    if(data.status==200){
                        setStatus({"type":"success","msg":"Successfully Created!"})
                        setTimeout(()=>{
                            setStatus({"type":"","msg":""})
                            handleGETRequest()
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
    const navigate=useNavigate()
        
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
        axios.delete("http://127.0.0.1:8000/expendable/delete-expendable-items",{data:payload,headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setStatus({"type":"success","msg":"Successfully Deleted!"})
                    setTimeout(()=>{
                        setStatus({"type":"","msg":""})
                        setItem([])
                        handleGETRequest()
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
    const handleNavigate=(page)=>{
        navigate(page)
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
    
    const handleGETRequest=(pg)=>{
        const currentPage = pg || page
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get("http://127.0.0.1:8000/expendable/get-expendable-items",{params: { search : search || undefined , skip : currentPage-1 , limit : 10 ,},headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setExpendableItems(data.data.items)
                    setTotalPage(Math.ceil(data.data.total / data.data.limit))
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


    const handlePageChange=(pg)=>{
        setPage(pg)
        handleGETRequest(pg)
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
    if(loading) return (
    <div className='page_container_1'>
        <Sidebar/>
        <div className='skeleton_page'>
            <div className='skeleton_table_section' style={{marginTop:'3em'}}>
                <div className='skeleton_table_header'>
                    <div className='skeleton skeleton_title'></div>
                    <div className='skeleton skeleton_search'></div>
                </div>
                {[1,2,3,4,5,6,7,8].map(r=>(
                    <div key={r} className='skeleton_row'>
                        <div className='skeleton skeleton_cell w10'></div>
                        <div className='skeleton skeleton_cell flex'></div>
                        <div className='skeleton skeleton_cell w20'></div>
                        <div className='skeleton skeleton_cell w20'></div>
                        <div className='skeleton skeleton_cell w15'></div>
                        <div className='skeleton skeleton_cell w10'></div>
                    </div>
                ))}
            </div>
        </div>
    </div>)
    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Add_Expendable_dialog dialog_status={addDialog} handle_add_dialog={handle_add_dialog} handle_submit={handle_submit_add}/>
        <Sidebar/>
        <div className='main_section'>
            
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Expendable Items</h1>
                    <div className='input_holder'>
                        <IoIosSearch className='icon_1'/>
                        <input type="text" placeholder='Search For Items' className='input_box space-mono-regular' value={search} onChange={(e)=>setSearch(e.target.value)} onKeyDown={(e) => {if (e.key === "Enter") {setPage(1);handleGETRequest(1)}}}/>
                    </div>
                    
                </div>   
                <div className="table_section">
                    {(ExpendableItems.length>0)?<table className='table_container'>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Ser No.</th>
                                <th  className='col_heading space-mono-bold'>Items</th>
                                <th  className='col_heading space-mono-bold'>Ledger Balance</th>
                                <th  className='col_heading space-mono-bold'>Utilized</th>
                                <th  className='col_heading space-mono-bold'>Purchase</th>
                                <th  className='col_heading space-mono-bold'>Remarks</th>
                                <th className='col_heading space-mono-bold'>Actions</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            {ExpendableItems.map((expendable)=>{
                                return (
                                    <tr key={expendable.ser_no} className={(item.indexOf(expendable.ser_no)!=-1)?"table_data_container active_table_container":'table_data_container'} onClick={()=>select_item(expendable.ser_no)}>
                                        <td className='table_data space-mono-regular'>{expendable.ser_no}</td>
                                        <td className='table_data space-mono-regular'>{expendable.items}</td>
                                        <td className='table_data space-mono-regular'>{Number(expendable.qty_prev_month).toLocaleString('en-IN')}</td>
                                        <td className='table_data space-mono-regular'>{Number(expendable.utilized_curr_month).toLocaleString('en-IN')}</td>
                                        <td className='table_data space-mono-regular'>{Number(expendable.purchase_curr_month).toLocaleString('en-IN')}</td>
                                        <td className='table_data space-mono-regular'>{expendable.remarks}</td>
                                        
                                        <td className='table_data'>
                                            <div className='action_btn_holder'>
                                                <button className='view_btn' onClick={()=>handleNavigate(`/expendable-items/${expendable.ser_no}`)}>View More</button>
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

export default Expendable_Items