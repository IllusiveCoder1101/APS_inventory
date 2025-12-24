import React from 'react'
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { RxCrossCircled } from "react-icons/rx";
function Status_model({type,msg}) {
  return (
    <div className={(type)?'status_container':"close_container"}>
      <div className={(type=="success")?"status_box success_box":(type=="error")?"status_box error_box":"close_box"}>
        {(type=='success')?<IoMdCheckmarkCircleOutline className='status_type success_type'/>:<RxCrossCircled className='status_type error_type'/>}
        <p className='status_msg space-mono-regular'>{msg}</p>
      </div>

    </div>
  )
}

export default Status_model