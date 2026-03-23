import React, { useEffect,useState } from 'react'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'
import Status_model from '../components/Status_model';
import axios from 'axios'
import { TbCoinRupee } from "react-icons/tb";
import { BsBoxSeam } from "react-icons/bs";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { LuSchool } from "react-icons/lu";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    PieChart, Pie, Cell,
    AreaChart, Area,
    ResponsiveContainer,
} from 'recharts'
function Dashboard() {
    const [consolidatedItems,setConsolidatedItems]=useState([])
    const [ExpendableItems,setExpendableItems]=useState({})
    const [nonExpendableGFItems,setnonExpendableGFItems]=useState([])
    const [nonExpendableSFItems,setnonExpendableSFItems]=useState([])

    const [stats,setStats]=useState({
        total_asset_value: 0,
        current_expendable_stock: 0,
        ne_gf_count: 0,
        ne_sf_count: 0,
    })
    const [chartData,setChartData]=useState({
        consolidated_by_property_head: [],
        expendable_stock_flow: [],
        items_by_fund: [],
        serv_vs_unsv: [],
        top_value_assets: [],
    })
    const [status,setStatus]=useState({"type":"","msg":""})
    const [loading,setLoading]=useState(true)

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
                    setnonExpendableGFItems(data.data.non_expendable_gf_items)
                    setnonExpendableSFItems(data.data.non_expendable_sf_items)
                    setStats(data.data.stats)
                    setChartData(data.data.chart_data)
                    setTimeout(()=>setLoading(false),800)
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

    const COLORS = ['#3B82F6', '#60A5FA', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6']
    const monoFont = '"Space Mono", monospace'
    const displayFont = '"Red Hat Display", sans-serif'
    const tooltipStyle = {background: '#1A1D27', border: '1px solid rgba(59,130,246,0.2)', color: '#C9CDD5', borderRadius: '0.5em', fontSize: '0.85em', fontFamily: monoFont, padding: '0.6em 0.9em', boxShadow: '0 0.4em 1.5em rgba(0,0,0,0.3)'}
    const legendStyle = {color: '#6B7280', fontSize: '0.8em', fontFamily: displayFont, paddingTop: '0.8em'}
    const axisTickStyle = {fill: '#6B7280', fontSize: 12, fontFamily: monoFont}
    const pieLabelStyle = {fill: '#C9CDD5', fontSize: 13, fontFamily: monoFont, fontWeight: 700}

    const formatNumber = (num) => {
        return Number(num).toLocaleString('en-IN')
    }
    const formatCurrency = (num) => {
        return '₹' + Number(num).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})
    }
    const formatStat = (num) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
        return `₹${num}`
    }
    const formatAxis = (num) => {
        if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`
        if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`
        if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`
        return '₹' + num.toLocaleString('en-IN')
    }

    if(loading) return (
    <div className='page_container_1'>
        <Sidebar/>
        <div className='skeleton_page'>
            <div className='skeleton_stats_row'>
                {[1,2,3,4].map(i=><div key={i} className='skeleton skeleton_stat_card'></div>)}
            </div>
            <div className='skeleton_graphs_row'>
                <div className='skeleton skeleton_graph_lg'></div>
                <div className='skeleton skeleton_graph_md'></div>
            </div>
            <div className='skeleton_graphs_row'>
                {[1,2,3].map(i=><div key={i} className='skeleton skeleton_graph_sm'></div>)}
            </div>
            {[1,2].map(i=>(
                <div key={i} className='skeleton_table_section'>
                    <div className='skeleton_table_header'>
                        <div className='skeleton skeleton_title'></div>
                        <div className='skeleton skeleton_btn'></div>
                    </div>
                    {[1,2,3,4,5].map(r=>(
                        <div key={r} className='skeleton_row'>
                            <div className='skeleton skeleton_cell w15'></div>
                            <div className='skeleton skeleton_cell flex'></div>
                            <div className='skeleton skeleton_cell w20'></div>
                            <div className='skeleton skeleton_cell w20'></div>
                            <div className='skeleton skeleton_cell w15'></div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>)

    return (
    <div className='page_container_1'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <Sidebar/>
        <div className='main_section'>
            <div className='stats_section'>
                <div className='stats_box'>
                    <div className='stats_header'>
                        <div className='stats_icon_box stats_icon_blue'>
                            <TbCoinRupee className='stats_icon'/>
                        </div>
                        <h4 className='stats_title red-hat-display-regular'>Consolidated Value</h4>
                    </div>
                    <h1 className='stats_text space-mono-bold'>{formatStat(stats.total_asset_value)}</h1>
                </div>
                <div className='stats_box'>
                    <div className='stats_header'>
                        <div className='stats_icon_box stats_icon_green'>
                            <BsBoxSeam className='stats_icon'/>
                        </div>
                        <h4 className='stats_title red-hat-display-regular'>Expendable Stock</h4>
                    </div>
                    <h1 className='stats_text space-mono-bold'>{formatNumber(stats.current_expendable_stock)}</h1>
                </div>
                <div className='stats_box'>
                    <div className='stats_header'>
                        <div className='stats_icon_box stats_icon_purple'>
                            <HiOutlineBuildingOffice2 className='stats_icon'/>
                        </div>
                        <h4 className='stats_title red-hat-display-regular'>Non-Exp (Gov)</h4>
                    </div>
                    <h1 className='stats_text space-mono-bold'>{formatNumber(stats.ne_gf_count)}</h1>
                </div>
                <div className='stats_box'>
                    <div className='stats_header'>
                        <div className='stats_icon_box stats_icon_amber'>
                            <LuSchool className='stats_icon'/>
                        </div>
                        <h4 className='stats_title red-hat-display-regular'>Non-Exp (School)</h4>
                    </div>
                    <h1 className='stats_text space-mono-bold'>{formatNumber(stats.ne_sf_count)}</h1>
                </div>
            </div>
            <div className="graphs_section">
                <div className='graphs_primary_section'>
                    <div className="graph_1">
                        <div className="graph_header">
                            <div className="graph_title_row">
                                <span className="graph_dot blue"></span>
                                <h1 className="section_title graph_title_primary space-mono-bold">Consolidated Value Breakdown</h1>
                            </div>
                            <p className="graph_subtitle red-hat-display-regular">Asset values by property head across categories</p>
                        </div>
                        <ResponsiveContainer width="100%" height="88%">
                            <AreaChart data={chartData.consolidated_by_property_head} margin={{top: 10, right: 20, left: 10, bottom: 5}}>
                                <defs>
                                    <linearGradient id="gradPrev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradServ" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradUnsv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="gradDep" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.1)" vertical={false} />
                                <XAxis
                                    dataKey="property_head"
                                    tick={{fill: '#9CA3AF', fontSize: 10, fontFamily: monoFont}}
                                    angle={-45}
                                    textAnchor="end"
                                    height={120}
                                    interval={0}
                                    axisLine={{stroke: 'rgba(107,114,128,0.15)'}}
                                    tickLine={false}
                                    tickFormatter={(val) => val.length > 18 ? val.slice(0, 18) + '...' : val}
                                />
                                <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
                                <Tooltip contentStyle={tooltipStyle} cursor={{stroke: 'rgba(59,130,246,0.2)', strokeDasharray: '4 4'}} formatter={(val) => formatCurrency(val)} />
                                <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
                                <Area type="monotone" dataKey="prev_year_value" name="Previous Value" stroke="#3B82F6" fill="url(#gradPrev)" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#3B82F6', stroke: '#1A1D27', strokeWidth: 2}} />
                                <Area type="monotone" dataKey="serv_value" name="Serviceable" stroke="#10B981" fill="url(#gradServ)" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#10B981', stroke: '#1A1D27', strokeWidth: 2}} />
                                <Area type="monotone" dataKey="unsv_value" name="Unserviceable" stroke="#F59E0B" fill="url(#gradUnsv)" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#F59E0B', stroke: '#1A1D27', strokeWidth: 2}} />
                                <Area type="monotone" dataKey="dep_value" name="Depreciation" stroke="#8B5CF6" fill="url(#gradDep)" strokeWidth={2} dot={false} activeDot={{r: 4, fill: '#8B5CF6', stroke: '#1A1D27', strokeWidth: 2}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph_2">
                        <div className="graph_header">
                            <div className="graph_title_row">
                                <span className="graph_dot green"></span>
                                <h1 className="section_title graph_title_primary space-mono-bold">Expendable Stock Flow</h1>
                            </div>
                            <p className="graph_subtitle red-hat-display-regular">Previous stock, purchases &amp; utilization</p>
                        </div>
                        <ResponsiveContainer width="100%" height="88%">
                            <PieChart>
                                <Pie
                                    data={chartData.expendable_stock_flow}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius="42%"
                                    outerRadius="70%"
                                    paddingAngle={3}
                                    cornerRadius={4}
                                    dataKey="value"
                                    stroke="none"
                                    label={({x, y, name, value}) => <text x={x} y={y} style={pieLabelStyle} textAnchor="middle">{formatNumber(value)}</text>}
                                    labelLine={{stroke: '#4B5563', strokeWidth: 1}}
                                >
                                    {chartData.expendable_stock_flow.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatNumber(val)} />
                                <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className='graphs_secondary_section'>
                    <div className="graph_3">
                        <div className="graph_header">
                            <div className="graph_title_row">
                                <span className="graph_dot purple"></span>
                                <h1 className="section_title graph_title_secondary space-mono-bold">Items by Fund Type</h1>
                            </div>
                            <p className="graph_subtitle red-hat-display-regular">Distribution across fund categories</p>
                        </div>
                        <ResponsiveContainer width="100%" height="88%">
                            <PieChart>
                                <Pie
                                    data={chartData.items_by_fund}
                                    cx="50%"
                                    cy="45%"
                                    outerRadius="62%"
                                    cornerRadius={3}
                                    dataKey="value"
                                    stroke="none"
                                    label={({x, y, name, value}) => <text x={x} y={y} style={pieLabelStyle} textAnchor="middle">{name}: {formatNumber(value)}</text>}
                                    labelLine={{stroke: '#4B5563', strokeWidth: 1}}
                                >
                                    {chartData.items_by_fund.map((entry, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatNumber(val)} />
                                <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph_3">
                        <div className="graph_header">
                            <div className="graph_title_row">
                                <span className="graph_dot green"></span>
                                <h1 className="section_title graph_title_secondary space-mono-bold">Serviceable vs Unserviceable</h1>
                            </div>
                            <p className="graph_subtitle red-hat-display-regular">Asset condition breakdown</p>
                        </div>
                        <ResponsiveContainer width="100%" height="88%">
                            <PieChart>
                                <Pie
                                    data={chartData.serv_vs_unsv}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius="35%"
                                    outerRadius="62%"
                                    cornerRadius={4}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                    label={({x, y, name, value}) => <text x={x} y={y} style={pieLabelStyle} textAnchor="middle">{formatNumber(value)}</text>}
                                    labelLine={{stroke: '#4B5563', strokeWidth: 1}}
                                >
                                    <Cell fill="#10B981" />
                                    <Cell fill="#F87171" />
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} formatter={(val) => formatNumber(val)} />
                                <Legend wrapperStyle={legendStyle} iconType="circle" iconSize={8} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="graph_3">
                        <div className="graph_header">
                            <div className="graph_title_row">
                                <span className="graph_dot amber"></span>
                                <h1 className="section_title graph_title_secondary space-mono-bold">Top Value Assets</h1>
                            </div>
                            <p className="graph_subtitle red-hat-display-regular">Highest value non-expendable items</p>
                        </div>
                        <ResponsiveContainer width="100%" height="88%">
                            <BarChart data={chartData.top_value_assets} layout="vertical" barCategoryGap="25%" margin={{top: 5, right: 15, left: 0, bottom: 5}}>
                                <defs>
                                    <linearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(107,114,128,0.1)" horizontal={false} />
                                <XAxis type="number" tick={axisTickStyle} axisLine={false} tickLine={false} tickFormatter={formatAxis} />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    tick={{...axisTickStyle, fontSize: 9}}
                                    width={90}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip contentStyle={tooltipStyle} cursor={{fill: 'rgba(59,130,246,0.06)'}} formatter={(val) => formatCurrency(val)} />
                                <Bar dataKey="value" name="Total Value" fill="url(#gradBar)" radius={[0,4,4,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            <div className='items_section'>
                <div className='dash_table_header'>
                    <div className='dash_table_title_group'>
                        <div className='dash_table_icon_box stats_icon_blue'>
                            <TbCoinRupee className='dash_table_icon'/>
                        </div>
                        <div className='dash_table_title_text'>
                            <h1 className="dash_table_title red-hat-display-bold">Consolidated Items</h1>
                            <p className='dash_table_subtitle red-hat-display-regular'>Asset values grouped by property head</p>
                        </div>
                    </div>
                    <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/consolidated-items")}>Explore More</button>
                </div>
                <div className="table_section">
                    {consolidatedItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Property Head</th>
                                <th className='col_heading space-mono-bold'>Appendix</th>
                                <th className='col_heading space-mono-bold'>Fund Details</th>
                                <th className='col_heading space-mono-bold'>Past Value</th>
                                <th className='col_heading space-mono-bold'>Purchases</th>
                                <th className='col_heading space-mono-bold'>Serv. Value</th>
                                <th className='col_heading space-mono-bold'>Present Value</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            {consolidatedItems.map((consolidated)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{consolidated["property_head"]}</td>
                                        <td className='table_data space-mono-regular'>{consolidated["appendix"]}</td>
                                        <td className='table_data space-mono-regular'>{consolidated["fund_details"]}</td>
                                        <td className='table_data space-mono-regular'>{formatCurrency(consolidated['prev_year_value'])}</td>
                                        <td className='table_data space-mono-regular'>{formatCurrency(consolidated["prev_year_purchases"])}</td>
                                        <td className='table_data space-mono-regular'>{formatCurrency(consolidated["serv_value"])}</td>
                                        <td className='table_data space-mono-regular'>{formatCurrency((consolidated["prev_year_value"] || 0) + (consolidated["prev_year_purchases"] || 0) + (consolidated["serv_value"] || 0) - (consolidated["dep_value"] || 0))}</td>
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
                <div className='dash_table_header'>
                    <div className='dash_table_title_group'>
                        <div className='dash_table_icon_box stats_icon_green'>
                            <BsBoxSeam className='dash_table_icon'/>
                        </div>
                        <div className='dash_table_title_text'>
                            <h1 className="dash_table_title red-hat-display-bold">Expendable Items</h1>
                            <p className='dash_table_subtitle red-hat-display-regular'>Stock levels, purchases &amp; utilization</p>
                        </div>
                    </div>
                    <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/expendable-items")}>Explore More</button>
                </div>
                <div className="table_section">
                    {ExpendableItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Ser No.</th>
                                <th className='col_heading space-mono-bold'>Items</th>
                                <th className='col_heading space-mono-bold'>Ledger Balance</th>
                                <th className='col_heading space-mono-bold'>Utilized</th>
                                <th className='col_heading space-mono-bold'>Purchase</th>
                                <th className='col_heading space-mono-bold'>Final Balance</th>
                                <th className='col_heading space-mono-bold'>Remarks</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            {ExpendableItems.map((expendable)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{expendable.ser_no}</td>
                                        <td className='table_data space-mono-regular'>{expendable.items}</td>
                                        <td className='table_data space-mono-regular'>{formatNumber(expendable.qty_prev_month)}</td>
                                        <td className='table_data space-mono-regular'>{formatNumber(expendable.utilized_curr_month)}</td>
                                        <td className='table_data space-mono-regular'>{formatNumber(expendable.purchase_curr_month)}</td>
                                        <td className='table_data space-mono-regular'>{formatNumber((expendable.qty_prev_month || 0) + (expendable.purchase_curr_month || 0) - (expendable.utilized_curr_month || 0))}</td>
                                        <td className='table_data space-mono-regular'>{expendable.remarks || '—'}</td>
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
                <div className='dash_table_header'>
                    <div className='dash_table_title_group'>
                        <div className='dash_table_icon_box stats_icon_purple'>
                            <HiOutlineBuildingOffice2 className='dash_table_icon'/>
                        </div>
                        <div className='dash_table_title_text'>
                            <h1 className="dash_table_title red-hat-display-bold">Non-Expendable Items (Gov)</h1>
                            <p className='dash_table_subtitle red-hat-display-regular'>Government funded fixed assets</p>
                        </div>
                    </div>
                    <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/non-expendable-items-gf")}>Explore More</button>
                </div>
                <div className="table_section">
                    {nonExpendableGFItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Ser No.</th>
                                <th className='col_heading space-mono-bold'>LP No.</th>
                                <th className='col_heading space-mono-bold'>Nomenclature</th>
                                <th className='col_heading space-mono-bold'>Category</th>
                                <th className='col_heading space-mono-bold'>A/U</th>
                                <th className='col_heading space-mono-bold'>Vintage</th>
                                <th className='col_heading space-mono-bold'>Rate</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            {nonExpendableGFItems.map((nonExpendable)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{nonExpendable["ser_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["lp_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["nomenclature"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["category_appendix"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["a_u"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["vintage"] || '—'}</td>
                                        <td className='table_data space-mono-regular'>{formatCurrency(nonExpendable["rate"])}</td>
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
                <div className='dash_table_header'>
                    <div className='dash_table_title_group'>
                        <div className='dash_table_icon_box stats_icon_amber'>
                            <LuSchool className='dash_table_icon'/>
                        </div>
                        <div className='dash_table_title_text'>
                            <h1 className="dash_table_title red-hat-display-bold">Non-Expendable Items (School)</h1>
                            <p className='dash_table_subtitle red-hat-display-regular'>School funded fixed assets</p>
                        </div>
                    </div>
                    <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/non-expendable-items-sf")}>Explore More</button>
                </div>
                <div className="table_section">
                    {nonExpendableSFItems.length>0 ? <table className='table_container'>
                        <thead className='table_header'>
                            <tr>
                                <th className='col_heading space-mono-bold'>Ser No.</th>
                                <th className='col_heading space-mono-bold'>LP No.</th>
                                <th className='col_heading space-mono-bold'>Nomenclature</th>
                                <th className='col_heading space-mono-bold'>Category</th>
                                <th className='col_heading space-mono-bold'>A/U</th>
                                <th className='col_heading space-mono-bold'>Vintage</th>
                                <th className='col_heading space-mono-bold'>Rate</th>
                            </tr>
                        </thead>
                        <tbody className='table_body'>
                            {nonExpendableSFItems.map((nonExpendable)=>{
                                return (
                                    <tr className='table_data_container'>
                                        <td className='table_data space-mono-regular'>{nonExpendable["ser_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["lp_no"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["nomenclature"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["category_appendix"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["a_u"]}</td>
                                        <td className='table_data space-mono-regular'>{nonExpendable["vintage"] || '—'}</td>
                                        <td className='table_data space-mono-regular'>{formatCurrency(nonExpendable["rate"])}</td>
                                    </tr>
                                )
                            })}
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