import React from 'react';
import Toast from './Toast';
import './Toast.scss';

const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

export default ToastContainer;
