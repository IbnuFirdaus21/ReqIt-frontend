import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import './Register.css';

function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        nis: '',
        password: '',
        confirmPassword: '',
        allergies: []
    });
    const [hasAllergy, setHasAllergy] = useState(false);
    const [allergyType, setAllergyType] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleAllergyChange = (e) => {
        const isYes = e.target.value === 'yes';
        setHasAllergy(isYes);
        if (!isYes) setAllergyType('');
    };

    const handleAllergyInput = (e) => {
        // Pisahkan input alergi dengan koma
        const allergiesArray = e.target.value.split(',').map(item => item.trim());
        setFormData({
            ...formData,
            allergies: allergiesArray
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Password dan konfirmasi password tidak cocok');
            setLoading(false);
            return;
        }

        if (hasAllergy && !allergyType) {
            setError('Mohon pilih jenis alergi: reaksi medis atau sekadar tidak suka');
            setLoading(false);
            return;
        }

        try {
            await registerUser({
                email: formData.email,
                nis: formData.nis,
                password: formData.password,
                hasAllergy: hasAllergy,
                allergyType: hasAllergy ? allergyType : null,
                allergiesDetails: formData.allergies.join(', ')
            });
            alert('Registrasi berhasil! Silakan login.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="top-nav">
                <Link to="/login">Login</Link>
                <Link to="/register" className="active">Register</Link>
            </div>

            <div className="wrapper">
                <div className="left-content">
                    <h2>Selamat Datang</h2>
                    <h1>ReqIt</h1>
                    <p>Tolong Register dan isi data diri kamu</p>
                    <img src="assets/img/mbg.png" alt="Illustration" />
                </div>

                <div className="right-content">
                    <h3 className="form-title">Register</h3>
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <input 
                                type="email" 
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <input 
                                type="text" 
                                name="nis"
                                placeholder="Nomor Induk Sekolah (NIS)"
                                value={formData.nis}
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
                                required
                            />
                            <span className="eye-btn" onClick={togglePassword}>
                                {showPassword ? '👁️' : '👁️'}
                            </span>
                        </div>

                        <div className="input-group">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword"
                                placeholder="Konfirmasi Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                            <span className="eye-btn" onClick={toggleConfirmPassword}>
                                {showConfirmPassword ? '👁️' : '👁️'}
                            </span>
                        </div>

                        {/* Fitur Alergi yang kamu tambahkan */}
                        <div className="allergy-section">
                            <label className="allergy-label">Apakah kamu memiliki alergi makanan?</label>
                            <div className="radio-group">
                                <label className="radio-option">
                                    <input 
                                        type="radio" 
                                        name="hasAllergy" 
                                        value="yes"
                                        onChange={handleAllergyChange}
                                    />
                                    <span>Ya</span>
                                </label>
                                <label className="radio-option">
                                    <input 
                                        type="radio" 
                                        name="hasAllergy" 
                                        value="no"
                                        onChange={handleAllergyChange}
                                        defaultChecked
                                    />
                                    <span>Tidak</span>
                                </label>
                            </div>
                        </div>

                        {hasAllergy && (
                            <>
                                <div className="allergy-type-section">
                                    <label className="allergy-label">Jenis alergi ini apa?</label>
                                    <div className="radio-group">
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="allergyType"
                                                value="medis"
                                                checked={allergyType === 'medis'}
                                                onChange={(e) => setAllergyType(e.target.value)}
                                            />
                                            <span>Alergi (reaksi medis)</span>
                                        </label>
                                        <label className="radio-option">
                                            <input
                                                type="radio"
                                                name="allergyType"
                                                value="preferensi"
                                                checked={allergyType === 'preferensi'}
                                                onChange={(e) => setAllergyType(e.target.value)}
                                            />
                                            <span>Tidak suka (preferensi)</span>
                                        </label>
                                    </div>
                                    <small className="input-hint">
                                        Pilih "Alergi" kalau tubuhmu bereaksi (gatal, sesak, bengkak, dll).
                                        Pilih "Tidak suka" kalau kamu cuma nggak suka rasanya walau aman dimakan.
                                    </small>
                                </div>

                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        placeholder="Sebutkan alergi (pisahkan dengan koma, contoh: susu, telur, kacang)"
                                        onChange={handleAllergyInput}
                                    />
                                    <small className="input-hint">Contoh: susu, telur, kacang tanah</small>
                                </div>
                            </>
                        )}

                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Daftar'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Register;