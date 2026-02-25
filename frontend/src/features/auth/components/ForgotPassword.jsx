import React, { useState } from 'react';
import { Link } from 'react-router';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Forgot Password Form submitted', { email });
    };

    return (
        <>
            <div className="auth-header">
                <h2>Forgot Password</h2>
                <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-required="true"
                    />
                </div>

                <button type="submit" className="auth-button">
                    Send Reset Link
                </button>
            </form>

            <div className="auth-links">
                Remember your password? <Link to="/sign-in">Log in</Link>
            </div>
        </>
    );
};

export default ForgotPassword;
