import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login.css'; // Import file CSS terpisah

function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(formData.email, formData.password);
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError(err.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="top-nav">
                <Link to="/login" className="active">Login</Link>
                <Link to="/register">Register</Link>
            </div>
            <div className="wrapper">
                <div className="left-content">
                    <h2>Selamat Datang</h2>
                    <h1>ReqIt</h1>
                    <img src="assets/img/mbg.png" alt="Illustration" />
                </div>
                <div className="right-content">
                    <h3 className="form-title">Login</h3>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input 
                                type="text" 
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <span className="eye-btn" onClick={togglePassword}>
                                {showPassword ? '👁️' : '👁️'}
                            </span>
                        </div>
                        <Link to="/forgot-password" className="forgot-pass">Recover Password ?</Link>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Login;