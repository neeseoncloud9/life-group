import React, { useState } from 'react';
import validator from 'validator';
import PasswordChecklist from "react-password-checklist";
import { useSearchParams } from 'react-router-dom';

const ResetPass = (axios) => {
    const [err, setErr]                           = useState("");
    const [errMsg, setErrMsg]                     = useState("");
    const [usernameReg, setUsernameReg]           = useState("");
    const [passwordReg, setPasswordReg]           = useState("");
    const [passwordRegAgain, setPasswordRegAgain] = useState("");
    const [validEmail, setValidEmail]             = useState(true);
    const [emailSent, setEmailSent]               = useState(false);
    const [resetting, setResetting]               = useState(false);
    const [validPass, setValidPass]               = useState(true);
    const [searchParams, setSearchParams]         = useSearchParams();
    const getVerifiedParm                         = searchParams.get("verified");
    const getUserIDParam                          = searchParams.get("userID");
    const _axios                                  = axios.axios;


    if (getVerifiedParm && getUserIDParam && !resetting) {
        setResetting(true);
    }

    const resetPassSend = (e) => {
        e.preventDefault();
        if (validEmail) {
            _axios.post('http://localhost:3001/resetPass', {
                email:usernameReg
            },
            {
                withCredentials: true
            }).then((result) => {
                console.log(result.data.msg);
                if (result.data.error) {
                    setErr(result.data.error);
                    setErrMsg(result.data.msg);
                } else if (result.data.msg === 'Accepted') {
                    setEmailSent(true);
                }
            });
        }
    }

    const resetPass = (e) => {
        e.preventDefault();
        if (validPass) {
            const userID = Buffer.from(getUserIDParam, 'base64').toString('ascii');
            _axios.post('http://localhost:3001/resetPass', {
                pass:passwordReg,
                userID:userID,
                verified:getVerifiedParm
            },
            {
                withCredentials: true
            }).then((result) => {
                console.log(result.data.msg);
                if (result.data.error) {
                    setErr(result.data.error);
                    setErrMsg(result.data.msg);
                } else if (result.data.msg === 'success changing password') {
                    window.location.href = '/login';
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
        <h2 className="text-center">Reset Password</h2>
        {
            resetting &&
            <form className="login-form">
                <input
                    type="password"
                    className="login-password"
                    onChange={(e) => {
                        setPasswordReg(e.target.value);
                    }}
                    required={true}
                    placeholder="Password"
                    style={(validPass) ? {} : {borderBottom: '1px solid #cc0000'}}
                />
                <input
                    type="password"
                    className="login-password"
                    onChange={(e) => {
                        setPasswordRegAgain(e.target.value);
                    }}
                    required={true}
                    placeholder="Password"
                    style={(validPass) ? {} : {borderBottom: '1px solid #cc0000'}}
                />
                <PasswordChecklist
                    rules={["minLength","specialChar","number","capital","match"]}
                    minLength={10}
                    value={passwordReg}
                    valueAgain={passwordRegAgain}
                    onChange={(isValid) => {setValidPass(isValid)}}
                />
                <button className="login-submit" onClick={(e) => {resetPass(e)}}>Reset Password</button>
            </form>
        }
        {
            !resetting &&
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
                {
                    !emailSent &&
                    <button className="login-submit" onClick={(e) => {resetPassSend(e)}}>Reset Password</button>
                }
                
            </form>
        }
        {
            emailSent &&
            <h3>Email has sent. Go check your email and follow the instructions</h3>
        }
        </>
    )
};

export default ResetPass;