import React, { useState } from 'react';

const Logout = (axios) => {
    const [err, setErr]                 = useState("");
    const [errMsg, setErrMsg]           = useState("");
    const _axios                        = axios.axios;

    const logout = () => {
        _axios.post('http://localhost:3001/logout', {},
        {
            withCredentials: true
        }).then((result) => {
            console.log(result.data.msg);
            if (result.data.error) {
                setErr(result.data.error);
                setErrMsg(result.data.msg);
            } else if (result.data.msg === 'logout success') {
                window.location.href = '/login';
            }
        });
    }

    logout();

    return (
        <>
        {
            err &&
            <h3 className="center error-msg" dangerouslySetInnerHTML={{__html: errMsg}}></h3>
        }
        </>
    )
};

export default Logout;