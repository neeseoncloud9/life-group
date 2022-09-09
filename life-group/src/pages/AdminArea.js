import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const AdminArea = (props) => {
    const _axios                                  = props.props.axios;
    const user                                    = props.props.user;
    const [usernameReg, setUsernameReg]           = useState("");
    return (
        <>
        {
            !user &&
            <Navigate to='/'/>
        }
        <p>this is the admin area boi!</p>
        </>
    )
};

export default AdminArea;