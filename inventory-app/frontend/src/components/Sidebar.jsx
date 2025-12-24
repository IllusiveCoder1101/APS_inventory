import React from 'react'
import { useNavigate } from 'react-router-dom'
import { MdOutlineInventory2 } from "react-icons/md";
import { GiExpense } from "react-icons/gi";
import { MdSummarize } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { GoHome } from "react-icons/go";
import { CgCopy } from "react-icons/cg";
import { FaSitemap } from "react-icons/fa6";
function Sidebar() {
  const navigate=useNavigate()

  const handleNavigate=(page)=>{
    navigate(page)
  }

  return (
    <aside className='sidebar'>
        <div className='logo_holder'>
            <MdOutlineInventory2 className='logo_icon'/>
        </div>
        <div className='btns_section'>
            <div className='btns_list'>
                <button title='Home' className='nav_btn' onClick={()=>handleNavigate("/dashboard")}><GoHome className='nav_icon'/></button>
                <button title='Consolidated Items' className='nav_btn'  onClick={()=>handleNavigate("/consolidated-items")}><FaSitemap  className='nav_icon'/></button>
                <button title="Expendable Items" className='nav_btn'  onClick={()=>handleNavigate("/expendable-items")}><GiExpense  className='nav_icon'/></button>
                <button title='Non-Expendable Items Gov' className='nav_btn'  onClick={()=>handleNavigate("/non-expendable-items-gf")}><CgCopy  className='nav_icon'/></button>
                <button title='Non Expendable Items School' className='nav_btn' onClick={()=>handleNavigate("/non-expendable-items-sf")}><MdSummarize  className='nav_icon'/></button>
            </div>
            <button className='nav_btn' onClick={()=>handleNavigate("/")}><IoLogOutOutline  className='nav_icon'/></button>
        </div>
    </aside>
  )
}

export default Sidebar