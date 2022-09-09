import React, { useState } from 'react';
import validator from 'validator';
import PasswordChecklist from "react-password-checklist";
import { useSearchParams } from 'react-router-dom';

const Login = (props) => {
    const [usernameReg, setUsernameReg]           = useState("");
    const [passwordReg, setPasswordReg]           = useState("");
    const [passwordRegAgain, setPasswordRegAgain] = useState("");
    const [fullName, setFullName]                 = useState("");
    const [signUp, setSignUp]                     = useState("");
    const [err, setErr]                           = useState("");
    const [errMsg, setErrMsg]                     = useState("");
    const [validEmail, setValidEmail]             = useState(true);
    const [validPass, setValidPass]               = useState(true);
    const [searchParams, setSearchParams]         = useSearchParams();
    const getValidEmailParam                      = searchParams.get("validateEmail");
    const getUserIDParam                          = searchParams.get("userID");
    const _axios                                  = props.props.axios;
    const user                                    = props.props.user;

    // if validating email
    if (getValidEmailParam && !localStorage.getItem('sentEmailVerify')) {
        localStorage.setItem('sentEmailVerify', true);
        const userID = Buffer.from(getUserIDParam, 'base64').toString('ascii');
        _axios.post('http://localhost:3001/validateEmail', {
            userID:userID
        },
        {
            withCredentials: true
        }).then((result) => {
            if (result.data.error) {
                setErr(result.data.error);
                setErrMsg(result.data.msg);
                localStorage.setItem('sentEmailVerify', false);
            }
        });
    }

    console.log(user);
    if (user) {
        window.location.href = '/adminArea';
    }

    const register = (e) => {
        e.preventDefault();
        if (validEmail && validPass) {
            _axios.post('http://localhost:3001/register', {
                fullName: fullName,
                email: usernameReg,
                password: passwordReg,
            },
            {
                withCredentials: true
            }).then((result) => {
                if (result.data.error) {
                    setErr(result.data.error);
                    setErrMsg(result.data.msg);
                } else if (result.data.msg === 'success adding user') {
                    window.location.href = '/validateEmail';
                }
            });
        }
    };

    const validateEmail = (value) => {
        const valid = validator.isEmail(value);
        setValidEmail(valid);
    }

    const validatePass = (value) => {
        const valid = validator.isStrongPassword(value, {
            minLength: 10, minLowercase: 1,
            minUppercase: 1, minNumbers: 1, minSymbols: 1
        })
        setValidPass(valid);
    }

    const getCookie = (name) => {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    const setCookie = (cname, cvalue, exdays) => {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    const login = (e) => {
        e.preventDefault();
        if (validEmail && validPass) {
            _axios.post('http://localhost:3001/login', {
                email: usernameReg,
                password: passwordReg,
            },
            {
                withCredentials: true
            }).then((result) => {
                console.log(result.data.msg);
                if (result.data.error) {
                    setErr(result.data.error);
                    setErrMsg(result.data.msg);
                } else if (result.data.msg === 'success') {
                    window.location.href = '/adminArea';
                }
            });
        }
    }

    return (
        <>
        {/* <img src='https://static.wixstatic.com/media/969550_4b065ae8c0cf4b09ba656c4d8f977a21~mv2.png'></img> */}
        {
            err &&
            <h3 className="center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        <form className="login-form">
            {
                signUp &&
                <input
                    type="text"
                    className="login-username"
                    onChange={(e) => {
                        setFullName(e.target.value)
                    }}
                    required={true}
                    placeholder="Joe Smith"
                />
            }
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
            <input
                type="password"
                className="login-password"
                onChange={(e) => {
                    setPasswordReg(e.target.value);
                    validatePass(e.target.value);
                }}
                required={true}
                placeholder="Password"
                style={(validPass) ? {} : {borderBottom: '1px solid #cc0000'}}
            />
            {/* <input type="submit" name="Login" value="Login" className="login-submit" /> */}
            {
                signUp &&
                <>
                <input
                    type="password"
                    className="login-password"
                    onChange={(e) => {
                        setPasswordRegAgain(e.target.value);
                        validatePass(e.target.value);
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
                    onChange={(isValid) => {}}
                />
                <button className="login-submit" onClick={register}>Register</button>
                </>
            }
            {
                !signUp &&
                <>
                <button className="login-submit" onClick={(e) => {login(e)}}>Login</button>
                <button className="login-submit" onClick={() => {setSignUp(true)}}>Sign Up</button>
                </>
            }
        </form>
        {/* <a href="#" style={{marginTop: '2rem'}} className="login-forgot-pass">forgot password?</a> */}
        </>
    )
};

export default Login;