import React, { useState } from 'react';
import validator from 'validator';
import { useSearchParams } from 'react-router-dom';

const Login = (props) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [err, setErr]                   = useState("");
    const [errMsg, setErrMsg]             = useState("");
    const [fullName, setFullName]         = useState("");
    const [email, setEmail]               = useState("");
    const [phone, setPhone]               = useState("");
    const [joinGroup, setJoinGroup]       = useState(false);
    const [validEmail, setValidEmail]     = useState(false);
    const [validPhone, setValidPhone]     = useState(false);
    const getGroupIDParam                 = searchParams.get("group");
    const groupID                         = Buffer.from(getGroupIDParam, 'base64').toString('ascii');
    const _axios                          = props.props.axios;

    const validateEmail = (value) => {
        const valid = validator.isEmail(value);
        setValidEmail(valid);
    }

    const validatePhone = (value) => {
        const valid = validator.isMobilePhone(value,'en-US');
        setValidPhone(valid);
    }

    const joinLifeGroup = (e) => {
        e.preventDefault();
        if (validEmail && validPhone) {
            _axios.post('http://localhost:3001/joinGroup', {
                fullName: fullName,
                email: email,
                phone: phone,
                groupID: groupID,
            },
            {
                withCredentials: true
            }).then((result) => {
                if (result.data.error) {
                    setErr(result.data.error);
                    setErrMsg(result.data.msg);
                } else if (result.data.msg === 'Accepted') {
                    console.log(result.data);
                    setJoinGroup(true);
                }
            });
        }
    }

    return (
        <>
        {
            err &&
            <h3 className="text-center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        {
            joinGroup &&
            <h3>Thank You For Submitting! A Group Leader Will Be In Contact With You Shortly</h3>
        }
        {
            !joinGroup &&
            <form className="login-form">
                <input
                    type="text"
                    className="login-username"
                    onChange={(e) => {
                        setFullName(e.target.value)
                    }}
                    required={true}
                    placeholder="Joe Smith"
                />
                <input
                    type="email"
                    className="login-username"
                    onChange={(e) => {
                        setEmail(e.target.value);
                        validateEmail(e.target.value);
                    }}
                    autoFocus="true"
                    required={true}
                    placeholder="Email"
                    style={(validEmail) ? {} : {borderBottom: '1px solid #cc0000'}}
                />
                <input
                    type="number"
                    className="login-username"
                    onChange={(e) => {
                        setPhone(e.target.value);
                        validatePhone(e.target.value);
                    }}
                    autoFocus="true"
                    required={true}
                    placeholder="5809998888"
                    style={(validPhone) ? {} : {borderBottom: '1px solid #cc0000'}}
                />
                <button className="login-submit" onClick={(e) => {joinLifeGroup(e)}}>Join</button>
            </form>
        }
        </>
    )
};

export default Login;