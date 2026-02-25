import React, { useState } from 'react';
import { Link } from 'react-router';

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('SignIn Form submitted', formData);
  };

  return (
    <>
      <div className="auth-header">
        <h2>Welcome Back</h2>
        <p>Log in to your account to continue.</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address or Username</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>

        <button type="submit" className="auth-button">Log In</button>
      </form>

      <div className="auth-links">
        Don't have an account? <Link to="/sign-up">Sign up</Link>
      </div>
    </>
  );
}

export default SignIn;