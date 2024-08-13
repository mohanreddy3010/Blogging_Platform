// src/components/MainPage.js

import React from 'react';
import { Link } from 'react-router-dom';

const MainPage = () => {
  return (
    <div className="main-page">
      <h1>Blogging Platform</h1>
      <div className="buttons">
        <Link to="/signup">Signup</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default MainPage;
