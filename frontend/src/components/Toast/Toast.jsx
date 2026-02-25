import React, { useEffect, useState } from 'react';

const Toast = ({ toast, removeToast }) => {
    const { id, message, type, duration } = toast;
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsClosing(true);
            setTimeout(() => removeToast(id), 300); // Wait for transition to finish
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, removeToast]);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => removeToast(id), 300);
    };

    return (
        <div className={`toast toast--${type} ${isClosing ? 'toast--closing' : ''}`}>
            <div className="toast__content">
                <span className="toast__icon">
                    {type === 'success' ? '✓' : '✕'}
                </span>
                <p className="toast__message">{message}</p>
            </div>
            <button onClick={handleClose} className="toast__close-btn" aria-label="Close">
                ×
            </button>
        </div>
    );
};

export default Toast;
