import React,{useState} from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { FaRegCircleUser } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { RiLockPasswordLine } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { BsBoxSeam } from "react-icons/bs";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";
import { TbPackages } from "react-icons/tb";
import Status_model from '../components/Status_model';
import axios from 'axios'
function Login() {
    const [password,setPassword]=useState(true)
    const [status,setStatus]=useState({"type":"","msg":""})
    const [payload,setPayload]=useState({"email":"","password":""})
    const [loading,setLoading]=useState(false)
    const navigate=useNavigate()
    const handlePassword=(value)=>{
        setPassword(value)
    }
    const handleLogin=()=>{
        if(payload.email && payload.password){
            setLoading(true)
            axios.post("http://127.0.0.1:8000/auth/login",payload)
                .then((data)=>{
                    if(data.status==200){
                        sessionStorage.setItem("access_token",JSON.stringify(data.data.access_token))
                        sessionStorage.setItem("refresh_token",JSON.stringify(data.data.refresh_token))
                        setStatus({"type":"success","msg":"Successful Log In!"})
                        setTimeout(()=>{
                            setStatus({"type":"","msg":""})
                            navigate("/dashboard")
                        },2000)
                    }
                })
                .catch((error)=>{
                    setStatus({"type":"error","msg":"Invalid Login Details!"})
                })
                .finally(()=>setLoading(false))
        }
        else{
            setStatus({"type":"error","msg":"Please fill in all fields."})
        }

    }
    const handleKeyDown=(e)=>{
        if(e.key==='Enter') handleLogin()
    }

    return (
    <div className='login_page'>
        <Status_model msg={status['msg']} type={status['type']}/>
        <div className='login_left_panel'>
            <div className='login_brand'>
                <div className='login_logo_lockup'>
                    <div className='login_logo_icon_box'>
                        <BsBoxSeam className='login_logo_icon'/>
                    </div>
                    <div className='login_logo_text_group'>
                        <h3 className='login_logo_text red-hat-display-bold'>APS Inventory</h3>
                        <p className='login_logo_tagline red-hat-display-regular'>Asset Management System</p>
                    </div>
                </div>
                <p className='login_brand_sub red-hat-display-regular'>Army Public School Binnaguri</p>
                <div className='login_brand_features'>
                    <div className='login_brand_feature'>
                        <TbPackages className='login_feature_icon'/>
                        <span className='red-hat-display-regular'>Track expendable &amp; non-expendable assets</span>
                    </div>
                    <div className='login_brand_feature'>
                        <HiOutlineClipboardDocumentList className='login_feature_icon'/>
                        <span className='red-hat-display-regular'>Consolidated reporting &amp; analytics</span>
                    </div>
                    <div className='login_brand_feature'>
                        <BsBoxSeam className='login_feature_icon'/>
                        <span className='red-hat-display-regular'>Stock issue &amp; receipt tracking</span>
                    </div>
                </div>
            </div>
            <div className='login_brand_footer'>
                <p className='login_brand_footer_text red-hat-display-regular'>APS Inventory v1.0</p>
            </div>
        </div>
        <div className='login_right_panel'>
            <div className='login_form_card'>
                <div className='login_form_header'>
                    <FaRegCircleUser className='login_avatar_icon'/>
                    <h2 className='login_title space-mono-bold'>Welcome Back</h2>
                    <p className='login_subtitle red-hat-display-regular'>Sign in to your account</p>
                </div>
                <div className='login_form_body'>
                    <div className='login_field'>
                        <label className='login_label red-hat-display-regular'>Email</label>
                        <div className='login_input_wrapper'>
                            <MdEmail className='login_input_icon'/>
                            <input type="email" className='login_input space-mono-regular' placeholder='Enter your email' defaultValue={payload['email']} onChange={(e)=>setPayload({...payload,"email":e.target.value})} onKeyDown={handleKeyDown}/>
                        </div>
                    </div>
                    <div className='login_field'>
                        <label className='login_label red-hat-display-regular'>Password</label>
                        <div className='login_input_wrapper'>
                            <RiLockPasswordLine className='login_input_icon'/>
                            <input type={(password)?"password":"text"} className='login_input space-mono-regular' placeholder='Enter your password' defaultValue={payload['password']} onChange={(e)=>setPayload({...payload,"password":e.target.value})} onKeyDown={handleKeyDown}/>
                            <button className='login_toggle_btn' onClick={()=>handlePassword(!password)}>
                                {password ? <FaEye className='login_toggle_icon'/> : <FaEyeSlash className='login_toggle_icon'/>}
                            </button>
                        </div>
                    </div>
                    <button className='login_submit_btn space-mono-bold' onClick={handleLogin} disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </div>
            </div>
            <p className='login_footer_text red-hat-display-regular'>APS Inventory &copy; Army Public School Binnaguri. All Rights Reserved.</p>
        </div>
    </div>
  )
}

export default Login