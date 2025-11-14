import React from 'react'
import Sidebar from '../components/Sidebar'

import { IoIosSearch } from "react-icons/io";
import { FaCircleArrowRight } from "react-icons/fa6";
function Dashboard() {
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
                    <h1 className="section_title red-hat-display-bold ">Expendable Items</h1>
                    <button className="explore_btn red-hat-display-regular">Explore More</button>
                                
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                           
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                                        
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (Gov)</h1>
                     <button className="explore_btn red-hat-display-regular">Explore More</button>
                      
                                
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                           
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                                        
                        </tbody>
                    </table>
                </div>
            </div>
            <div className='items_section'>
                <div className='section_header'>
                    <h1 className="section_title red-hat-display-bold ">Non-Expendable Items (School)</h1>
                     <button className="explore_btn red-hat-display-regular">Explore More</button>
                         
                </div>
                <div className="table_section">
                    <table className='table_container'>
                        <thead className='table_header'>
                            <th className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                            <th  className='col_heading space-mono-bold'>Column</th>
                        </thead>
                        <tbody className='table_body'>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                           
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
                            </tr>
                            <tr className='table_data_container'>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                <td className='table_data space-mono-regular'>Data</td>
                                            
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