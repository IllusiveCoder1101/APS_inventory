import React from 'react'
import { MdOutlineInventory2 } from "react-icons/md";
import { GiExpense } from "react-icons/gi";
import { MdSummarize } from "react-icons/md";
import { IoLogOutOutline } from "react-icons/io5";
import { GoHome } from "react-icons/go";
import { CgCopy } from "react-icons/cg";
function Sidebar() {
  return (
    <aside className='sidebar'>
        <div className='logo_holder'>
            <MdOutlineInventory2 className='logo_icon'/>
        </div>
        <div className='btns_section'>
            <div className='btns_list'>
                <button className='nav_btn'><GoHome className='nav_icon'/></button>
                <button className='nav_btn'><GiExpense  className='nav_icon'/></button>
                <button  className='nav_btn'><CgCopy  className='nav_icon'/></button>
                <button  className='nav_btn'><MdSummarize  className='nav_icon'/></button>
            </div>
            <button className='btn_2'><IoLogOutOutline  className='nav_icon_1'/></button>
        </div>
    </aside>
  )
}

export default Sidebar