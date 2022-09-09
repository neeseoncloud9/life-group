import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ArticlesListPage from './pages/ArticlesListPage';
import ArticlePage from './pages/ArticlePage';
import NotFoundPage from './pages/NotFoundPage';
import Login from './pages/Login';
import Logout from './pages/Logout';
import ValidateEmail from './pages/ValidateEmail';
import SendVerify from './pages/SendVerify';
import AdminArea from './pages/AdminArea';
import NavBar from './NavBar';
import './App.css';
const axios = require('axios').default;

const App = () => {
    const [user, setUser] = React.useState(true);
    useEffect(() => {
        let isSubscribed = true;
        const getUser = async () => {
            await axios.get('http://localhost:3001/isLoggedIn', {
                withCredentials: true
            }).then((result) => {
                if (!result.data.error) {
                  if (isSubscribed) {
                    setUser(true);
                  }
                } else {
                  if (isSubscribed) {
                    setUser(false);
                  }
                }
            });
        }
        getUser();
        // cancel any future `setData`
        return () => isSubscribed = false;
    }, [user]);

    return (
      <Router>
        <div className="App">
          <NavBar user={user}/>
          <div id="page-body">
            <Routes>
              <Route path='/' element={<HomePage/>} exact/>
              <Route path='/about' element={<AboutPage/>} />
              <Route path='/adminArea' element={<AdminArea props={{axios:axios, user:user}}/>} />
              <Route path='/login' element={<Login props={{axios:axios, user:user}}/>} />
              <Route path='/logout' element={<Logout axios={axios}/>} />
              <Route path='/validateEmail' element={<ValidateEmail axios={axios}/>} />
              <Route path='/sendVerify' element={<SendVerify axios={axios}/>} />
              <Route path='/articles-list' element={<ArticlesListPage/>} />
              <Route path='/article/:name' element={<ArticlePage/>} />
              <Route path='*' element={<NotFoundPage/>} />
            </Routes>
          </div>
        </div>
      </Router>
    );
}

export default App;
