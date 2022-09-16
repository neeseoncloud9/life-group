import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = (user) => {
    const LoggedIn = user.user;
    return (
        <nav className='nav justify-content-center'>
            <ul>
                <li>
                    <Link to="/">life Groups</Link>
                </li>
                {
                    LoggedIn &&
                    <>
                    <li>
                        <Link to="/adminArea">Admin Panel</Link>
                    </li>
                    <li>
                        <Link to="/logout">Logout</Link>
                    </li>
                    </>
                }
                {
                    !LoggedIn &&
                    <li>
                        <Link to="/login">Login</Link>
                    </li>
                }
                
            </ul>
        </nav>
    )
};

export default NavBar;