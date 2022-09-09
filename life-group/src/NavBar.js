import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = (user) => {
    const LoggedIn = user.user;
    return (
        <nav>
            <ul>
                <li>
                    <Link to="/">life Groups</Link>
                </li>
                {
                    LoggedIn &&
                    <li>
                        <Link to="/logout">Logout</Link>
                    </li>
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