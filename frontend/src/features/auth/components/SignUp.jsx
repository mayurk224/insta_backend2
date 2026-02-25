import React, { useState } from 'react';
import '../styles/auth.scss';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle sign-up submission
    console.log('Form submitted', formData);
  };

  return (
    <>
      <div className="auth-header">
        <h2>Create an Account</h2>
        <p>Join us today! Please fill in your details below.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="John Doe"
            value={formData.username}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </div>

        <button type="submit" className="auth-button">
          Sign Up
        </button>
      </form>

      <div className="auth-links">
        Already have an account? <a href="/sign-in">Log in</a>
      </div>
    </>
  );
};

export default SignUp;