import React, { useState } from 'react';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            console.error("Passwords do not match");
            // Add more sophisticated error handling like toast/alert here a later stage if needed
            return;
        }
        console.log('Reset Password Form submitted', formData);
    };

    return (
        <>
            <div className="auth-header">
                <h2>Set New Password</h2>
                <p>Please enter your new password below.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="password">New Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        aria-required="true"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        aria-required="true"
                    />
                </div>

                <button type="submit" className="auth-button">
                    Reset Password
                </button>
            </form>

            <div className="auth-links">
                Remember your password? <a href="/sign-in">Log in</a>
            </div>
        </>
    );
};

export default ResetPassword;
