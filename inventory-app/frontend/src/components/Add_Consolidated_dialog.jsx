import React,{useState} from 'react'
import { RxCrossCircled } from "react-icons/rx";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";

function Add_Consolidated_dialog({dialog_status,handle_add_dialog, handle_submit}) {
    const [file, setFile] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleClose = () => {
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
        handle_add_dialog();
    };

    const handleSubmit = () => {
        handle_submit(file);
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };
    
    return (
    <>
        {
            <>
                {(dialog_status)?
                <div className='dialog_box_container'>
                    <div className="dialog_box_holder">
                        <div className="dialog_header">
                            <h2 className='dialog_header red-hat-display-bold'>Add Item</h2>
                            <button className='dialog_close' onClick={handleClose}><RxCrossCircled className='icon'/></button>
                        </div>
                        <div className="input_containers">
                            <div className="file_upload_container">
                                <PiMicrosoftExcelLogoFill className='file_upload_icon'/>
                                <div className="file_upload_info">
                                    <h3 className='file_upload_header red-hat-display-bold'>Upload Consolidated File</h3>
                                    <p className='file_upload_text space-mono-regular'>Accepted Files: .xlsx, .xls </p>
                                    <label htmlFor="excelInput" className="upload-btn">Upload File</label>
                                    <input type="file" id="excelInput" ref={fileInputRef} accept=".xlsx,.xls" onChange={handleFileChange}/>
                                </div>
                            </div>
                        </div>
                        <div className="submit_btn_holder">
                            <button className="submit_btn_1" onClick={handleClose}><span>Cancel</span></button>
                            <button className="submit_btn" onClick={handleSubmit}>Submit</button>
                        </div>
                    </div>
                </div>:<></>}
            
            </>
        }   
    </>
  )
}

export default Add_Consolidated_dialog