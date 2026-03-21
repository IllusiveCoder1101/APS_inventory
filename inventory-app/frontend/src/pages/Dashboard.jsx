import React, { useEffect,useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import Status_model from '../components/Status_model';
import axios from 'axios'
function Dashboard() {
    const [consolidatedItems,setConsolidatedItems]=useState([])
    const [ExpendableItems,setExpendableItems]=useState({})
    const [nonExpendableGFItems,setnonExpendableGFItems]=useState([])
    const [nonExpendableSFItems,setnonExpendableSFItems]=useState([])

    const [status,setStatus]=useState({"type":"","msg":""})

    const navigate=useNavigate()

    const handleNavigate=(page)=>{
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
                if(error.status==401){
                    setStatus({"type":"error","msg":"Invalid Details!"})
                    handleNavigate("/")
                }
            })
    }
    const handleGETRequest=()=>{
        let access_token=JSON.parse(sessionStorage.getItem("access_token"))
        axios.get("http://127.0.0.1:8000/dashboard/get-dashboard-items",{headers:{"Authorization":`Bearer ${access_token}`}})
            .then((data)=>{
                if(data.status==200){
                    setExpendableItems(data.data.expendable_items)
                    setConsolidatedItems(data.data.consolidated_items)
                    setnonExpendableGFItems(data.data.non_expendable_items)
                    setnonExpendableSFItems(data.data.non_expendable_items)
                }
            })
            .catch((error)=>{
                if(error.status==401){
                    handleRefresh()
                }
            })
    }
    
    useEffect(()=>{
        handleGETRequest()
        
    },[])

    useEffect(()=>{
        setTimeout(()=>{
            setStatus({"msg":"","type":""})
        },1000)
    },[status["type"]])

    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Sidebar/>
        <div className='main_section'>
            <div className='stats_section'>
                <div className='stats_box'>
                    <h4 className='stats_title red-hat-display-bold '>Title</h4>
                    <h1 className='stats_text space-mono-regular'>31,000</h1>
                </div>
                <div className='stats_box'>
                    <h4 className='stats_title red-hat-display-bold '>Title</h4>
                    <h1 className='stats_text space-mono-regular'>891,000</h1>
                </div>
                <div className='stats_box'>
                    <h4 className='stats_title red-hat-display-bold '>Title</h4>
                    <h1 className='stats_text space-mono-regular'>11,000</h1>
                </div>
                <div className='stats_box'>
                    <h4 className='stats_title red-hat-display-bold '>Title</h4>
                    <h1 className='stats_text space-mono-regular'>561,000</h1>
                </div>
            </div>
            <div className="graphs_section">
                <div className='graphs_primary_section'>
                    <div className="graph_1">
                        <h1 className="section_title space-mono-bold">Main Graph</h1>
                    </div>
                    <div className="graph_2">
                        <h1 className="section_title space-mono-bold">Secondary Graph</h1>
                    </div>
                </div>
                <div className='graphs_secondary_section'>
                    <div className="graph_3">
                        <h1 className="section_title space-mono-bold">
                            Tertiary Graph
                        </h1>
                    </div>
                    <div className="graph_3">
                        <h1 className="section_title space-mono-bold">
                            Tertiary Graph
                        </h1>
                    </div>
                    <div className="graph_3">
                        <h1 className="section_title space-mono-bold">
                            Tertiary Graph
                        </h1>
                    </div>
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Consolidated Items</h1>
                     <button className="explore_btn red-hat-display-regular"  onClick={()=>handleNavigate("/consolidated-items")}>Explore More</button>
                         
                </div>
                <div className="table_section">
                    
                    {consolidatedItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Property Head</th>
                            <th  className='col_heading space-mono-bold'>Appendix</th>
                            <th  className='col_heading space-mono-bold'>Fund Details</th>
                            <th  className='col_heading space-mono-bold'>Past Value</th>
                            
                            
                        </thead>
                        <tbody className='table_body'>
                            {consolidatedItems.length>0 && consolidatedItems.map((consolidated)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{consolidated["property_head"]}</td>
                                        <td className='table_data space-mono-regular'>{consolidated["appendix"]}</td>
                                        <td className='table_data space-mono-regular'>{consolidated["fund_details"]}</td>
                                        <td className='table_data space-mono-regular'>{consolidated['prev_year_value']}</td>
                                       
                                    </tr>
                                )
                            })}

                            
                            
                        </tbody>
                    </table>:
                    <div className='empty_handler'>
                        <h3 className='empty_handler_text red-hat-display-bold'>No Items Found</h3>
                    </div>}
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Expendable Items</h1>
                    <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/expendable-items")}>Explore More</button>
                                
                </div>
                <div className="table_section">
                    {ExpendableItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th  className='col_heading space-mono-bold'>Items</th>
                            <th  className='col_heading space-mono-bold'>Ledger Balance</th>
                            <th  className='col_heading space-mono-bold'>Utilized</th>
                            <th  className='col_heading space-mono-bold'>Purchase</th>
                            
                        </thead>
                        <tbody className='table_body'>
                            {ExpendableItems.length>0 && ExpendableItems.map((expendable)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{expendable.ser_no}</td>
                                        <td className='table_data space-mono-regular'>{expendable.items}</td>
                                        <td className='table_data space-mono-regular'>{expendable.qty_prev_month}</td>
                                        <td className='table_data space-mono-regular'>{expendable.utilized_curr_month}</td>
                                        <td className='table_data space-mono-regular'>{expendable.purchase_curr_month}</td>
   
                                    </tr>
                                )
                            })}
                        
                            
                        </tbody>
                    </table>:<div className='empty_handler'>
                        <h3 className='empty_handler_text red-hat-display-bold'>No Items Found</h3>
                    </div>}
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (Gov)</h1>
                     <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/non-expendable-items-gf")}>Explore More</button>
                      
                                
                </div>
                <div className="table_section">
                    {nonExpendableGFItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th  className='col_heading space-mono-bold'>LP No.</th>
                            <th  className='col_heading space-mono-bold'>Nomenclature</th>
                            <th  className='col_heading space-mono-bold'>Category</th>
                            <th  className='col_heading space-mono-bold'>A/U</th>
                            
                        </thead>
                        <tbody className='table_body'>
                            {nonExpendableGFItems.length>0 && nonExpendableGFItems.map((nonExpendable)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{nonExpendable["ser_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["lp_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["nomenclature"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["category_appendix"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["a_u"]}</td>
                                        
                                    </tr>
                                )
                            })    }  
                        </tbody>
                    </table>:<div className='empty_handler'>
                        <h3 className='empty_handler_text red-hat-display-bold'>No Items Found</h3>
                    </div>}
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (School)</h1>
                     <button className="explore_btn red-hat-display-regular"  onClick={()=>handleNavigate("/non-expendable-items-sf")}>Explore More</button>
                         
                </div>
                <div className="table_section">
                    {nonExpendableSFItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th  className='col_heading space-mono-bold'>LP No.</th>
                            <th  className='col_heading space-mono-bold'>Nomenclature</th>
                            <th  className='col_heading space-mono-bold'>A/U</th>
                            
                        </thead>
                        <tbody className='table_body'>
                            {nonExpendableSFItems.length>0 && nonExpendableSFItems.map((nonExpendable)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{nonExpendable["ser_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["lp_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["nomenclature"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["a_u"]}</td>
                                        
                                    </tr>
                                )
                            })    }  
                        </tbody>
                    </table>:<div className='empty_handler'>
                        <h3 className='empty_handler_text red-hat-display-bold'>No Items Found</h3>
                    </div>}
                </div>
            </div>
            
        </div>
    </div> 
  )
}

export default Dashboard