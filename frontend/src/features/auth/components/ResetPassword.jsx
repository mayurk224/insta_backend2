import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../hooks/useAuth';

const ResetPassword = () => {
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isValidatingToken, setIsValidatingToken] = useState(true);
    const [tokenError, setTokenError] = useState(null);

    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { handleResetPassword, handleVerifyResetToken, loading } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setTokenError("Invalid or missing reset token");
            setIsValidatingToken(false);
            return;
        }

        const verifyToken = async () => {
            try {
                await handleVerifyResetToken(token);
                setIsValidatingToken(false);
            } catch (err) {
                setTokenError(err.message || 'Invalid or expired reset token.');
                setIsValidatingToken(false);
            }
        };

        verifyToken();
    }, [searchParams, handleVerifyResetToken]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showToast("Passwords do not match", "error");
            return;
        }

        const token = searchParams.get('token');
        if (!token) {
            showToast("Invalid or missing reset token", "error");
            return;
        }


        try {
            const response = await handleResetPassword({
                token,
                newPassword: formData.password
            })

            showToast(response.message || 'Password reset successfully!', 'success');
            setIsSubmitted(true);

            setTimeout(() => {
                navigate('/sign-in');
            }, 3000);

        } catch (err) {
            showToast(err.message || 'Failed to reset password.', 'error');
        }
    };

    if (isValidatingToken) {
        return (
            <div className="auth-header">
                <h2>Verifying Link...</h2>
                <p>Please wait while we verify your reset link.</p>
            </div>
        );
    }

    if (tokenError) {
        return (
            <div className="auth-header">
                <h2>Link Expired or Invalid</h2>
                <p>{tokenError}</p>
                <div className="auth-links" style={{ marginTop: '20px' }}>
                    <Link to="/forgot-password">Request a new reset link</Link>
                </div>
            </div>
        );
    }

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

                <button type="submit" className="auth-button" disabled={loading || isSubmitted}>
                    {loading ? 'Resetting...' : isSubmitted ? 'Password Reset' : 'Reset Password'}
                </button>
            </form>

            <div className="auth-links">
                Remember your password? <Link to="/sign-in">Log in</Link>
            </div>
        </>
    );
};

export default ResetPassword;
