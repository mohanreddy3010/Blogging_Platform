import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'student' // Default role
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5001/api/login', formData);
        console.log('User logged in successfully:', response.data);

        // Fetch user's name from the backend using the email
        const userResponse = await axios.get(`http://localhost:5001/api/user/${formData.email}`);
        const userName = userResponse.data.name;

        // Store user name and email in local storage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', formData.email); // Store email

        // Redirect to dashboard upon successful login
        navigate('/dashboard');
    } catch (error) {
        console.error('Error logging in:', error);
        // Handle error (display error message, etc.)
        setErrorMessage('Invalid email or password');
    }
};

  

  return (
    <div className="login-page">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
        </div>
        <button type="submit">Login</button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default LoginPage;
