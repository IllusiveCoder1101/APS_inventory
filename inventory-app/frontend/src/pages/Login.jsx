import React,{useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { FaRegCircleUser } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import Status_model from '../components/Status_model';
function Login() {
    const [password,setPassword]=useState(true)
    const [status,setStatus]=useState({"type":"","msg":""})

    const navigate=useNavigate()
    const handlePassword=(value)=>{
        setPassword(value)
    }
    const handleLogin=()=>{
        setStatus({"type":"success","msg":"Successfully Logged In!"})
        setTimeout(()=>{
            setStatus({"type":"","msg":""})
            navigate("/dashboard")
        },2000)
        
    }
  
    return (
    <div className='page_container'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <nav className='nav-bar'>
            <h3 className='logo red-hat-display-bold'>INVENTORY</h3>
        </nav>
        <div className='box_container'>
            <div className='login_holder'>
                <h2 className='header space-mono-bold'>LOGIN</h2>
                <FaRegCircleUser  className='header_icon'/>
                <div className='input_holder'>
                    <MdEmail className='icon_1'/>
                    <input type="email" className='input_box space-mono-regular'  placeholder='Email'/>
                </div>
                <div className='input_holder'>
                    <RiLockPasswordLine className='icon_1'/>
                    <input type={(password)?"password":"text"} className='input_box space-mono-regular' placeholder='Password'/>
                    {(password)?<button className='btn-1' onClick={()=>handlePassword(false)}><FaEye className='icon_2'/></button>:<button  className='btn-1' onClick={()=>handlePassword(true)}><FaEyeSlash className='icon_2'/></button>}
                </div>
                <button className='submit_btn space-mono-regular' onClick={handleLogin}>Submit</button>
            </div>
        </div>
        <footer className='footer_section'>
            <p className='footer_text red-hat-display-regukar'>Copyright © Army Public School Binnaguri All Right Reserved </p>
        </footer>
    </div>
  )
}

export default Login