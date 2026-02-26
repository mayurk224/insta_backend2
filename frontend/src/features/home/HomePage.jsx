import { useNavigate } from 'react-router';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../auth/hooks/useAuth';

const HomePage = () => {
    const { user, handleLogout } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async () => {
        try {
            const response = await handleLogout();
            showToast(response.message || 'Logged out successfully!', 'success');
            navigate('/sign-in');
        } catch (err) {
            showToast('Failed to logout', 'error');
        }
    };

    return (
        <div style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#fafafa' }}>
            <div style={{ backgroundColor: 'white', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h1 style={{ marginBottom: '1rem', color: '#262626' }}>Welcome to Instagram Clone</h1>
                {user && <h2 style={{ marginBottom: '2rem', color: '#8e8e8e', fontWeight: '400' }}>Hello, {user.username}!</h2>}
                <button
                    onClick={handleSubmit}
                    style={{
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        backgroundColor: '#efefef',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: '#262626',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#dbdbdb'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#efefef'}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default HomePage;
