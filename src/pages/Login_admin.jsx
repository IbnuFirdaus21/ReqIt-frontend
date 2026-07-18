import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login_admin.css';

function Login_admin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password, 'admin');
            navigate('/admin');
        } catch (err) {
            setError(err.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <style>
                {`
                    :root {
                        --primary-green: #2D6A4F;
                        --bg-light: #f8f9fa;
                    }

                    * { margin: 0; padding: 0; box-sizing: 'border-box'; font-family: 'Inter', sans-serif; }

                    .login-container {
                        width: 100%;
                        max-width: 450px;
                        text-align: center;
                        padding: 20px;
                    }

                    .login-container h2 {
                        color: var(--primary-green);
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 40px;
                    }

                    .input-group {
                        margin-bottom: 20px;
                        position: relative;
                        text-align: left;
                    }

                    .input-group input {
                        width: 100%;
                        padding: 18px 20px;
                        border-radius: 12px;
                        border: 1px solid #e0e0e0;
                        background-color: #fcfcfc;
                        font-size: 14px;
                        outline: none;
                        transition: 0.3s;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.02);
                    }

                    .input-group input:focus {
                        border-color: var(--primary-green);
                    }

                    .toggle-password {
                        position: absolute;
                        right: 20px;
                        top: 50%;
                        transform: translateY(-50%);
                        color: #aaa;
                        cursor: pointer;
                    }

                    .recover-link {
                        display: block;
                        margin: 25px 0;
                        color: #888;
                        font-size: 13px;
                        text-decoration: none;
                        font-weight: 500;
                    }

                    .btn-login {
                        width: 100%;
                        background-color: var(--primary-green);
                        color: white;
                        border: none;
                        padding: 18px;
                        border-radius: 12px;
                        font-size: 16px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: 0.3s;
                        box-shadow: 0 8px 20px rgba(45, 106, 79, 0.2);
                    }

                    .btn-login:hover {
                        background-color: #1b4332;
                        transform: translateY(-2px);
                    }
                `}
            </style>

            <div className="login-container">
                <h2>Login</h2>

                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            type="email" 
                            placeholder="Email Admin" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            id="passwordField" 
                            placeholder="Password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                        <i className={`far ${showPassword ? 'fa-eye-slash' : 'fa-eye'} toggle-password`} onClick={togglePassword}></i>
                    </div>

                    {error && <p style={{ color: 'red', marginBottom: '10px' }}>{error}</p>}

                    <a href="#" className="recover-link">Recover Password ?</a>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login_admin;
