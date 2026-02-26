import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import axios from 'axios';
import { useToast } from '../../../context/ToastContext';
import '../styles/auth.scss';
import { useAuth } from '../hooks/useAuth';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email please wait...');
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { handleVerifyEmail, loading } = useAuth();
    const hasAttempted = useRef(false);

    useEffect(() => {
        if (hasAttempted.current) return;

        const verifyEmail = async () => {
            hasAttempted.current = true;
            if (!token) {
                setVerificationStatus('error');
                setMessage('Invalid or missing verification token.');
                showToast('Invalid or missing verification token.', 'error');
                return;
            }

            try {
                const response = await handleVerifyEmail({ token });
                setVerificationStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                showToast(response.message || 'Email verified successfully!', 'success');

                // Auto redirect to sign-in after a short delay
                setTimeout(() => {
                    navigate('/sign-in');
                }, 3000);

            } catch (err) {
                setVerificationStatus('error');
                const errorMsg = err.message || 'Failed to verify email.';
                setMessage(errorMsg);
                showToast(errorMsg, 'error');
            }
        };

        verifyEmail();
    }, [token, navigate, showToast, handleVerifyEmail]);

    return (
        <>
            <div className="auth-header">
                <h2>Email Verification</h2>
                <p>Please wait while we verify your account.</p>
            </div>

            <div className="auth-form" style={{ textAlign: 'center', padding: '2rem 0' }}>
                {verificationStatus === 'verifying' && (
                    <div className="verification-status">
                        <div className="spinner" style={{ margin: '0 auto 1rem', width: '40px', height: '40px', border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: '#0095f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <p>{message}</p>
                    </div>
                )}

                {verificationStatus === 'success' && (
                    <div className="verification-status success">
                        <svg style={{ width: '64px', height: '64px', color: '#4BB543', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        <p style={{ color: '#4BB543', fontWeight: 'bold' }}>{message}</p>
                        <button onClick={() => navigate('/sign-in')} className="auth-button" style={{ marginTop: '1rem' }}>
                            Proceed to Login
                        </button>
                    </div>
                )}

                {verificationStatus === 'error' && (
                    <div className="verification-status error">
                        <svg style={{ width: '64px', height: '64px', color: '#ff3333', margin: '0 auto 1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        <p style={{ color: '#ff3333', fontWeight: 'bold' }}>{message}</p>
                        <button onClick={() => navigate('/sign-in')} className="auth-button" style={{ marginTop: '1rem' }}>
                            Back to Login
                        </button>
                    </div>
                )}
                <style dangerouslySetInnerHTML={{
                    __html: `
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}} />
            </div>
        </>
    );
};

export default VerifyEmail;
