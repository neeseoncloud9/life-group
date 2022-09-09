import React, { useState } from 'react';
import validator from 'validator';

const sendVerify = (axios) => {
    const [err, setErr]                 = useState("");
    const [errMsg, setErrMsg]           = useState("");
    const [usernameReg, setUsernameReg] = useState("");
    const [validEmail, setValidEmail]   = useState(true);
    const _axios                        = axios.axios;

    const SendEmail = (e) => {
        e.preventDefault();
        if (validEmail) {
            _axios.post('http://localhost:3001/sendValidate', {
                email: usernameReg
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

    const validateEmail = (value) => {
        const valid = validator.isEmail(value);
        setValidEmail(valid);
    }

    return (
        <>
        {
            err &&
            <h3 className="text-center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        <form className="login-form">
            <input
                type="email"
                className="login-username"
                onChange={(e) => {
                    setUsernameReg(e.target.value);
                    validateEmail(e.target.value);
                }}
                autoFocus="true"
                required={true}
                placeholder="Email"
                style={(validEmail) ? {} : {borderBottom: '1px solid #cc0000'}}
            />
            <button className="login-submit" onClick={(e) => {SendEmail(e)}}>Send Email</button>
        </form>
        </>
    )
};

export default sendVerify;