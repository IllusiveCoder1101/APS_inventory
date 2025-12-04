import React from 'react'
import Sidebar from '../components/Sidebar'
import { useNavigate } from 'react-router-dom'

function Dashboard() {

  const navigate=useNavigate()

  const handleNavigate=(page)=>{
    navigate(page)
  }
  return (
    <div className='page_container_1'>
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
                    
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Property Head</th>
                            <th  className='col_heading space-mono-bold'>Appendix</th>
                            <th  className='col_heading space-mono-bold'>Fund Details</th>
                            <th  className='col_heading space-mono-bold'>Past Value</th>
                            <th  className='col_heading space-mono-bold'>Present Value</th>
                            
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Property Name</td>
                                <td className='table_data space-mono-regular'>A</td>
                                <td className='table_data space-mono-regular'>School Fund & Asset Replace Fund</td>
                                <td className='table_data space-mono-regular'>31,20,708.08</td>
                                <td className='table_data space-mono-regular'>33,94,679.98</td>
                                
                                
                            </tr>

                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Property Name</td>
                                <td className='table_data space-mono-regular'>A</td>
                                <td className='table_data space-mono-regular'>School Fund & Asset Replace Fund</td>
                                <td className='table_data space-mono-regular'>31,20,708.08</td>
                                <td className='table_data space-mono-regular'>33,94,679.98</td>
                                
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Property Name</td>
                                <td className='table_data space-mono-regular'>A</td>
                                <td className='table_data space-mono-regular'>School Fund & Asset Replace Fund</td>
                                <td className='table_data space-mono-regular'>31,20,708.08</td>
                                <td className='table_data space-mono-regular'>33,94,679.98</td>
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Property Name</td>
                                <td className='table_data space-mono-regular'>A</td>
                                <td className='table_data space-mono-regular'>School Fund & Asset Replace Fund</td>
                                <td className='table_data space-mono-regular'>31,20,708.08</td>
                                <td className='table_data space-mono-regular'>33,94,679.98</td>
                                
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Property Name</td>
                                <td className='table_data space-mono-regular'>A</td>
                                <td className='table_data space-mono-regular'>School Fund & Asset Replace Fund</td>
                                <td className='table_data space-mono-regular'>31,20,708.08</td>
                                <td className='table_data space-mono-regular'>33,94,679.98</td>
                                
                                
                            </tr>
                            
                            
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Expendable Items</h1>
                    <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/expendable-items")}>Explore More</button>
                                
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th  className='col_heading space-mono-bold'>Items</th>
                            <th  className='col_heading space-mono-bold'>Ledger Balance</th>
                            <th  className='col_heading space-mono-bold'>Utilized</th>
                            <th  className='col_heading space-mono-bold'>Ground Balance</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>AA/AAA Battery/MIC</td>
                                <td className='table_data space-mono-regular'>210 Nos</td>
                                <td className='table_data space-mono-regular'>34 Nos</td>
                                <td className='table_data space-mono-regular'>176 Nos</td>
                                
                            </tr>
                            
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (Gov)</h1>
                     <button className="explore_btn red-hat-display-regular" onClick={()=>handleNavigate("/non-expendable-items-gf")}>Explore More</button>
                      
                                
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th  className='col_heading space-mono-bold'>LP No.</th>
                            <th  className='col_heading space-mono-bold'>Nomenclature</th>
                            <th  className='col_heading space-mono-bold'>A/U</th>
                            <th  className='col_heading space-mono-bold'>Vintage</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (School)</h1>
                     <button className="explore_btn red-hat-display-regular"  onClick={()=>handleNavigate("/non-expendable-items-sf")}>Explore More</button>
                         
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Ser No.</th>
                            <th  className='col_heading space-mono-bold'>LP No.</th>
                            <th  className='col_heading space-mono-bold'>Nomenclature</th>
                            <th  className='col_heading space-mono-bold'>A/U</th>
                            <th  className='col_heading space-mono-bold'>Vintage</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>01.</td>
                                <td className='table_data space-mono-regular'>150</td>
                                <td className='table_data space-mono-regular'>India Political Map</td>
                                <td className='table_data space-mono-regular'>Pieces</td>
                                <td className='table_data space-mono-regular'>22-06-93</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
        </div>
    </div> 
  )
}

export default Dashboard