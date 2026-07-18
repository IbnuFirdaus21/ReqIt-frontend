import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    fetchRequestsSummary,
    fetchRatings,
    fetchFeedbacks,
    fetchAllergySummary,
    uploadMenu
} from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Admin.css';

const Admin = () => {
    const { user, logout } = useAuth();

    const [activePage, setActivePage] = useState('page-home');
    const [activeTab, setActiveTab] = useState('penilaian');
    const [chartData, setChartData] = useState([]);
    const [ratingData, setRatingData] = useState([]);
    const [suggestionData, setSuggestionData] = useState([]);
    const [menuForm, setMenuForm] = useState({
        name: '',
        description: '',
        image: null
    });
    const [menuSubmitMessage, setMenuSubmitMessage] = useState('');
    const [showAvatarMenu, setShowAvatarMenu] = useState(false);
    const [allergySummary, setAllergySummary] = useState({
        totalAllergyStudents: 0,
        allergyStats: [],
        allergyUsers: []
    });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [chart, ratings, feedbacks, allergy] = await Promise.all([
                    fetchRequestsSummary(),
                    fetchRatings(),
                    fetchFeedbacks(),
                    fetchAllergySummary()
                ]);
                setChartData(chart);
                setRatingData(ratings);
                setSuggestionData(feedbacks);
                setAllergySummary(allergy);
            } catch (err) {
                console.error('Gagal memuat data admin:', err);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.admin-avatar-dropdown')) {
                setShowAvatarMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const showPage = (pageId) => {
        setActivePage(pageId);
        // Set active tab based on page
        if (pageId === 'page-penilaian') {
        setActiveTab('penilaian');
        } else if (pageId === 'page-saran-list') {
        setActiveTab('saran');
        }
    };

    const handleMenuChange = (e) => {
        setMenuForm({
        ...menuForm,
        [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
        setMenuForm({
            ...menuForm,
            image: file
        });
        }
    };

    const handleMenuSubmit = async (e) => {
        e.preventDefault();
        setMenuSubmitMessage('');

        if (!menuForm.name || !menuForm.description) {
            setMenuSubmitMessage('Nama dan deskripsi menu harus diisi.');
            return;
        }

        const formData = new FormData();
        formData.append('name', menuForm.name);
        formData.append('description', menuForm.description);
        if (menuForm.image) {
            formData.append('image', menuForm.image);
        }

        try {
            await uploadMenu(formData);
            setMenuSubmitMessage('Menu berhasil diperbarui!');
            setMenuForm({ name: '', description: '', image: null });
            const fileInput = document.getElementById('image-upload');
            if (fileInput) fileInput.value = '';
        } catch (err) {
            setMenuSubmitMessage(err.message || 'Gagal mengunggah menu.');
        }
    };

    const handleLogout = () => {
        logout('/login_admin');
    };

    const renderStars = (rating) => {
        const numRating = Number(rating) || 0;
        return [...Array(5)].map((_, index) => (
            <i 
                key={index} 
                className={`fas fa-star ${index < numRating ? '' : 'gray'}`}
            ></i>
        ));
    };

    return (
        <div className="admin-dashboard">
        {/* Sidebar */}
        <div className="sidebar">
            <div className="logo">ReqIt</div>
            <div className="sidebar-label">Dashboard</div>
            <div className="sidebar-nav">
                <div 
                className={`nav-item ${activePage === 'page-home' ? 'active' : ''}`} 
                onClick={() => showPage('page-home')}
                >
                <i className="far fa-smile"></i> Request Menu
                </div>
                <div 
                className={`nav-item ${activePage === 'page-update' ? 'active' : ''}`} 
                onClick={() => showPage('page-update')}
                >
                <i className="far fa-edit"></i> Menu Update
                </div>
                <div 
                className={`nav-item ${(activePage === 'page-penilaian' || activePage === 'page-saran-list') ? 'active' : ''}`} 
                onClick={() => showPage('page-penilaian')}
                >
                <i className="far fa-envelope"></i> Lihat Pesan
                </div>
                <div 
                className={`nav-item ${activePage === 'page-allergies' ? 'active' : ''}`} 
                onClick={() => showPage('page-allergies')}
                >
                <i className="fas fa-allergies"></i> Data Alergi
                </div>
            </div>
        </div>

        {/* Main Wrapper */}
        <div className="main-wrapper">
            {/* Header */}
            <header>
            <div className="search-bar">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Search" />
            </div>
            <div className="header-right">
                <div className="admin-avatar-dropdown">
                    <button
                        className="admin-avatar-btn"
                        onClick={() => setShowAvatarMenu(prev => !prev)}
                    >
                        {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </button>
                    {showAvatarMenu && (
                        <div className="admin-avatar-menu">
                            <p className="admin-avatar-menu-email">
                                {user?.email || 'Admin'}
                            </p>
                            <p className="admin-avatar-menu-id">
                                ID: {user?.id || '-'}
                            </p>
                            <button
                                className="admin-avatar-menu-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
            </header>

            {/* Page: Request Menu (Home) */}
            <div className={`content-area ${activePage === 'page-home' ? 'active' : ''}`}>
            <p className="greeting">👋 Hey Admin!</p>
            <h2 className="page-title">Berikut request makanan hari ini</h2>

            <div className="chart-container">
                <div className="date-badge">
                <span>Today <i className="fas fa-caret-down"></i></span>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="food" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#F0E491" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            </div>

            {/* Page: Menu Update */}
            <div className={`content-area ${activePage === 'page-update' ? 'active' : ''}`}>
            <h2 className="page-title">Menu Update</h2>
            <form onSubmit={handleMenuSubmit} className="menu-form-grid">
                <div className="chart-container image-upload-section">
                <h4 className="section-title">Gambar Menu</h4>
                <div className="image-placeholder">
                    {menuForm.image ? (
                    <img 
                        src={URL.createObjectURL(menuForm.image)} 
                        alt="Preview" 
                        style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '15px' }}
                    />
                    ) : (
                    <i className="far fa-image"></i>
                    )}
                </div>
                <input 
                    type="file" 
                    id="image-upload" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                />
                <button 
                    type="button" 
                    className="btn-add-image"
                    onClick={() => document.getElementById('image-upload').click()}
                >
                    Tambah
                </button>
                </div>

                <div className="chart-container">
                <h4 className="section-title">Informasi General</h4>
                <label className="form-label">Nama Menu</label>
                <input 
                    type="text" 
                    name="name"
                    placeholder="Masukkan Nama Menu" 
                    className="form-input"
                    value={menuForm.name}
                    onChange={handleMenuChange}
                    required
                />
                <label className="form-label">Deskripsi</label>
                <textarea 
                    rows="5" 
                    name="description"
                    placeholder="Deskripsi" 
                    className="form-textarea"
                    value={menuForm.description}
                    onChange={handleMenuChange}
                    required
                ></textarea>
                <button type="submit" className="btn-upload">Unggah</button>
                {menuSubmitMessage && (
                    <p style={{ marginTop: '10px', color: menuSubmitMessage.includes('berhasil') ? 'green' : 'red' }}>
                        {menuSubmitMessage}
                    </p>
                )}
                </div>
            </form>
            </div>

            {/* Page: Penilaian & Saran */}
            <div className={`content-area ${(activePage === 'page-penilaian' || activePage === 'page-saran-list') ? 'active' : ''}`}>
            <div className="tabs">
                <div 
                className={`tab ${activeTab === 'penilaian' ? 'active' : ''}`} 
                onClick={() => showPage('page-penilaian')}
                >
                Penilaian
                </div>
                <div 
                className={`tab ${activeTab === 'saran' ? 'active' : ''}`} 
                onClick={() => showPage('page-saran-list')}
                >
                Saran
                </div>
            </div>

            {/* Tab Penilaian */}
            {activeTab === 'penilaian' && (
                <div className="message-grid">
                {ratingData && ratingData.length > 0 ? (
                    ratingData.map((item) => (
                        <div key={item.id} className="msg-card">
                        <div className="msg-header">
                            <div className="avatar" style={{ background: '#4CC9F0' }}>
                            {item.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                            <h4 className="user-name">{item.email}</h4>
                            <span className="timestamp">{new Date(item.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="stars">
                            {renderStars(item.rating)}
                        </div>
                        <p className="msg-body">{item.comment || 'Tidak ada komentar'}</p>
                        <div className="msg-arrow">
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '20px' }}>Belum ada penilaian.</p>
                )}
                </div>
            )}

            {/* Tab Saran */}
            {activeTab === 'saran' && (
                <div className="message-grid">
                {suggestionData && suggestionData.length > 0 ? (
                    suggestionData.map((item) => (
                        <div key={item.id} className="msg-card">
                        <div className="msg-header">
                            <div className="avatar" style={{ background: '#9B5DE5' }}>
                            {item.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                            <h4 className="user-name">{item.email}</h4>
                            <span className="timestamp">{new Date(item.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                        <p className="msg-body">{item.message}</p>
                        <div className="msg-arrow">
                            <i className="fas fa-chevron-right"></i>
                        </div>
                        </div>
                    ))
                ) : (
                    <p style={{ padding: '20px' }}>Belum ada saran.</p>
                )}
                </div>
            )}
            </div>

            {/* Page: Data Alergi */}
            <div className={`content-area ${activePage === 'page-allergies' ? 'active' : ''}`}>

                    <h2 style={{ marginBottom: '24px', color: '#2D6A4F' }}>
                        Data Alergi Siswa
                    </h2>

                    {allergySummary && (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '16px',
                                marginBottom: '32px'
                            }}>
                                <div style={{
                                    background: 'white',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                    border: '1px solid #e8f5e9'
                                }}>
                                    <p style={{
                                        fontSize: '36px',
                                        fontWeight: '700',
                                        color: '#2D6A4F',
                                        margin: '0 0 6px'
                                    }}>
                                        {allergySummary.totalAllergyStudents}
                                    </p>
                                    <p style={{
                                        fontSize: '12px',
                                        color: '#888',
                                        margin: 0
                                    }}>
                                        Total Siswa dengan Alergi
                                    </p>
                                </div>

                                {allergySummary.allergyStats?.slice(0, 5).map((item, index) => (
                                    <div key={index} style={{
                                        background: 'white',
                                        borderRadius: '16px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        border: '1px solid #e8f5e9'
                                    }}>
                                        <p style={{
                                            fontSize: '36px',
                                            fontWeight: '700',
                                            color: '#3F6F4E',
                                            margin: '0 0 6px'
                                        }}>
                                            {item.total}
                                        </p>
                                        <p style={{
                                            fontSize: '12px',
                                            color: '#888',
                                            margin: 0,
                                            textTransform: 'capitalize'
                                        }}>
                                            {item.allergy}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                marginBottom: '32px'
                            }}>
                                <h3 style={{
                                    marginBottom: '20px',
                                    fontSize: '15px',
                                    color: '#333'
                                }}>
                                    Distribusi Alergi
                                </h3>
                                {allergySummary.allergyStats?.map((item, index) => (
                                    <div key={index} style={{
                                        marginBottom: '14px'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '5px'
                                        }}>
                                            <span style={{
                                                fontSize: '13px',
                                                textTransform: 'capitalize',
                                                color: '#444'
                                            }}>
                                                {item.allergy}
                                            </span>
                                            <span style={{
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: '#2D6A4F'
                                            }}>
                                                {item.total} siswa
                                            </span>
                                        </div>
                                        <div style={{
                                            background: '#f0f0f0',
                                            borderRadius: '50px',
                                            height: '8px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                borderRadius: '50px',
                                                background: '#3F6F4E',
                                                width: `${Math.round(
                                                    (item.total / allergySummary.totalAllergyStudents) * 100
                                                )}%`,
                                                transition: 'width 0.6s ease'
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{
                                background: 'white',
                                borderRadius: '16px',
                                padding: '24px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                            }}>
                                <h3 style={{
                                    marginBottom: '20px',
                                    fontSize: '15px',
                                    color: '#333'
                                }}>
                                    Daftar Siswa dengan Alergi
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{
                                        width: '100%',
                                        borderCollapse: 'collapse',
                                        fontSize: '13px'
                                    }}>
                                        <thead>
                                            <tr style={{ background: '#f8faf8' }}>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    textAlign: 'left',
                                                    color: '#666',
                                                    fontWeight: '600',
                                                    borderBottom: '1px solid #eee'
                                                }}>NIS</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    textAlign: 'left',
                                                    color: '#666',
                                                    fontWeight: '600',
                                                    borderBottom: '1px solid #eee'
                                                }}>Nama Lengkap</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    textAlign: 'left',
                                                    color: '#666',
                                                    fontWeight: '600',
                                                    borderBottom: '1px solid #eee'
                                                }}>Kelas</th>
                                                <th style={{
                                                    padding: '12px 16px',
                                                    textAlign: 'left',
                                                    color: '#666',
                                                    fontWeight: '600',
                                                    borderBottom: '1px solid #eee'
                                                }}>Detail Alergi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allergySummary.allergyUsers?.map((student, index) => (
                                                <tr key={index} style={{
                                                    borderBottom: '1px solid #f5f5f5'
                                                }}>
                                                    <td style={{
                                                        padding: '12px 16px',
                                                        color: '#888'
                                                    }}>
                                                        {student.nis}
                                                    </td>
                                                    <td style={{
                                                        padding: '12px 16px',
                                                        fontWeight: '500',
                                                        color: '#333'
                                                    }}>
                                                        {student.full_name}
                                                    </td>
                                                    <td style={{
                                                        padding: '12px 16px'
                                                    }}>
                                                        <span style={{
                                                            background: '#e8f5e9',
                                                            color: '#2D6A4F',
                                                            padding: '3px 10px',
                                                            borderRadius: '20px',
                                                            fontSize: '12px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {student.class}
                                                        </span>
                                                    </td>
                                                    <td style={{
                                                        padding: '12px 16px',
                                                        color: '#555'
                                                    }}>
                                                        {student.allergies_details}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
            </div>
        </div>
        <nav className="admin-bottom-nav">
            <button
                className={`admin-bottom-nav-item ${activePage === 'page-home' ? 'active' : ''}`}
                onClick={() => showPage('page-home')}
            >
                <i className="fas fa-utensils"></i>
                <span>Request</span>
            </button>
            <button
                className={`admin-bottom-nav-item ${activePage === 'page-update' ? 'active' : ''}`}
                onClick={() => showPage('page-update')}
            >
                <i className="fas fa-edit"></i>
                <span>Menu</span>
            </button>
            <button
                className={`admin-bottom-nav-item ${activePage === 'page-penilaian' || activePage === 'page-saran-list' ? 'active' : ''}`}
                onClick={() => showPage('page-penilaian')}
            >
                <i className="fas fa-envelope"></i>
                <span>Pesan</span>
            </button>
            <button
                className={`admin-bottom-nav-item ${activePage === 'page-allergies' ? 'active' : ''}`}
                onClick={() => showPage('page-allergies')}
            >
                <i className="fas fa-hand-paper"></i>
                <span>Alergi</span>
            </button>
        </nav>
        </div>
    );
};

export default Admin;