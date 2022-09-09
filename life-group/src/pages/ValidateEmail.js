import React, { useState } from 'react';

const ValidateEmail = (axios) => {
    const [err, setErr]                 = useState("");
    const [errMsg, setErrMsg]           = useState("");
    const _axios                        = axios.axios;

    const SendEmail = () => {
        if (!localStorage.getItem('email_sent')) {
            localStorage.setItem('email_sent', true);
            _axios.post('http://localhost:3001/sendValidate', {
                email:false
            },
            {
                withCredentials: true
            }).then((result) => {
                console.log(result.data.msg);
                if (result.data.error) {
                    setErr(result.data.error);
                    setErrMsg(result.data.msg);
                }
            });
        }
    }

    SendEmail();

    return (
        <>
        <h2>Two Simple Steps To Finish Your Account</h2>
        <h3>1. Go Check Your Email For An Email From Us.</h3>
        <h3>2. Click The Button In Email.</h3>
        {
            err &&
            <h3 className="text-center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        <h3>Would You Like To Send Another Email?</h3>
        <button className="login-submit" onClick={()=>{window.location.href = '/sendVerify'}}>Send Another Email</button>
        </>
    )
};

export default ValidateEmail;