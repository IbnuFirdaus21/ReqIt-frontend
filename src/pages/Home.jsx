import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../hooks/useAuth';
import {
    fetchTodayMenu,
    sendRequest,
    sendFeedback,
    sendRating,
    sendChatMessage
} from '../services/api';

function Home() {
    const { isLoggedIn, user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [messages, setMessages] = useState([
        {
            type: 'bot',
            text: 'Halo Perkenalkan saya Yves, Saya adalah ai asistant yang membantu anda menjawab pertanyaan mengenai menu makanan MBG hari ini.',
            time: '02:22 AM'
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestNotif, setRequestNotif] = useState('');
    const [feedbackMessage, setFeedbackMessage] = useState('');

    // State untuk fitur rating
    const [selectedRating, setSelectedRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [ratingComment, setRatingComment] = useState('');
    const [currentMenu, setCurrentMenu] = useState({ id: null, name: '' });
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingMessage, setRatingMessage] = useState('');

    // State untuk menu hari ini
    const [todayMenu, setTodayMenu] = useState(null);

    // State untuk help modal
    const [showHelpModal, setShowHelpModal] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const loadMenu = async () => {
            try {
                const data = await fetchTodayMenu();
                setTodayMenu(data);
                if (data) {
                    setCurrentMenu({ id: data.id, name: data.name });
                }
            } catch (err) {
                console.error('Gagal memuat menu:', err);
            }
        };
        loadMenu();
    }, []);

    useEffect(() => {
        const chatBody = document.getElementById('chatBody');
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const input = document.getElementById('chatInput');
        if (input) {
            const handleKeyDown = (e) => {
                if (e.key === 'Enter') {
                    handleSendMessage();
                }
            };
            input.addEventListener('keydown', handleKeyDown);
            return () => input.removeEventListener('keydown', handleKeyDown);
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!isChatOpen) return;
            const chatPopup = document.getElementById('chatPopup');
            const toggleBtn = document.querySelector('.chat-toggle-btn');
            if (
                chatPopup && !chatPopup.contains(e.target) &&
                toggleBtn && !toggleBtn.contains(e.target)
            ) {
                setIsChatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isChatOpen]);

    // Handler untuk membuka modal rating
    // menuId bisa berupa number atau null/undefined
    const handleOpenRating = (menuIdOrName, menuName) => {
        if (!isLoggedIn) {
            setShowLoginModal(true);
            return;
        }
        
        // Jika hanya 1 parameter, itu adalah menuName (backward compatibility)
        let menuId = null;
        let name = '';
        
        if (menuName) {
            // 2 parameter: menuId dan menuName
            menuId = menuIdOrName;
            name = menuName;
        } else {
            // 1 parameter: hanya menuName (menuId = null)
            name = menuIdOrName;
            menuId = null;
        }
        
        setCurrentMenu({ id: menuId, name: name });
        setSelectedRating(0);
        setHoverRating(0);
        setRatingComment('');
        setRatingMessage('');
        setShowRatingModal(true);
    };
    // Handler untuk chat
    const handleToggleChat = () => {
        setIsChatOpen(prev => !prev);
    };

    const handleToggleMenu = () => {
        setIsMenuOpen(prev => !prev);
    };

    const handleCloseMenu = () => {
        setIsMenuOpen(false);
    };

    const requireAuth = () => {
        if (!isLoggedIn) setShowLoginModal(true);
    };

    // Handler batal rating
    const handleCancelRating = () => {
        setShowRatingModal(false);
        setSelectedRating(0);
        setHoverRating(0);
        setRatingComment('');
        setRatingMessage('');
        setCurrentMenu({ id: null, name: '' });
    };

    // Handler submit rating
    const handleSubmitRating = async () => {
        if (!isLoggedIn || !user) {
            setShowLoginModal(true);
            return;
        }
        if (!selectedRating) {
            setRatingMessage('Mohon pilih rating terlebih dahulu.');
            return;
        }
        try {
            await sendRating(user.id, currentMenu.id, selectedRating, ratingComment);
            setRatingMessage('Rating berhasil dikirim! Terima kasih.');
            setTimeout(() => {
                setShowRatingModal(false);
                setSelectedRating(0);
                setRatingComment('');
                setRatingMessage('');
            }, 1500);
        } catch (err) {
            setRatingMessage(err.message || 'Terjadi kesalahan.');
        }
    };
    // Handler untuk logout
    const handleLogout = () => {
        logout('/');
    };
    // Handler untuk send message
    const handleSendMessage = async () => {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const userMessage = input.value.trim();
        if (!userMessage) return;
        const currentTime = new Date().toLocaleTimeString([], { 
            hour: '2-digit', minute: '2-digit' 
        });
        setMessages(prev => [...prev, { 
            type: 'user', text: userMessage, time: currentTime 
        }]);
        input.value = '';
        setIsTyping(true);
        try {
            const data = await sendChatMessage(userMessage);
            setMessages(prev => [...prev, {
                type: 'bot',
                text: data.reply,
                time: new Date().toLocaleTimeString([], { 
                    hour: '2-digit', minute: '2-digit' 
                })
            }]);
        } catch {
            setMessages(prev => [...prev, {
                type: 'bot',
                text: 'Terjadi kesalahan saat mengambil data dari AI.',
                time: new Date().toLocaleTimeString([], { 
                    hour: '2-digit', minute: '2-digit' 
                })
            }]);
        } finally {
            setIsTyping(false);
        }
    };
    // Handler untuk send feedback
    const handleSendFeedback = async () => {
        if (!isLoggedIn || !user) {
            setShowLoginModal(true);
            return;
        }
        const textarea = document.querySelector('.feedback-container textarea');
        const message = textarea?.value?.trim();
        if (!message) {
            setFeedbackMessage('Mohon tulis saran terlebih dahulu.');
            return;
        }
        try {
            await sendFeedback(user.id, message);
            setFeedbackMessage('Saran berhasil dikirim! Terima kasih.');
            if (textarea) textarea.value = '';
        } catch (err) {
            setFeedbackMessage(err.message || 'Terjadi kesalahan.');
        }
    };
    // Handler untuk send request
    const handleSendRequest = async () => {
        if (!isLoggedIn || !user) {
            setShowLoginModal(true);
            return;
        }
        const menuName = requestMessage.trim();
        if (!menuName) {
            setRequestNotif('Mohon masukkan nama menu yang ingin direquest.');
            return;
        }
        try {
            await sendRequest(user.id, menuName);
            setRequestMessage('');
            setRequestNotif('Request berhasil dikirim! Terima kasih.');
        } catch (err) {
            setRequestNotif(err.message || 'Terjadi kesalahan.');
        }
    };
    return (
        <div>
            <nav className="navbar">
                <div className="logo">ReqIt</div>
                <ul className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
                    <li><a href="#hero" onClick={handleCloseMenu}>BERANDA</a></li>
                    <li><a href="#menu-section" onClick={handleCloseMenu}>MENU HARI INI</a></li>
                    <li><a href="#request" onClick={handleCloseMenu}>REQUEST</a></li>
                    <li><a href="#feedback" onClick={handleCloseMenu}>SARAN</a></li>
                    <li><a href="#footer" onClick={handleCloseMenu}>KONTAK</a></li>
                    <li className="nav-menu-auth" style={{ marginTop: '20px' }}>
                        {isLoggedIn ? (
                            <button className="btn-logout" onClick={() => { handleLogout(); handleCloseMenu(); }} style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontWeight: '600'
                            }}>Logout</button>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <Link to="/login" className="login-link" onClick={handleCloseMenu}>LOGIN</Link>
                                <Link to="/register" className="btn-register" onClick={handleCloseMenu}>Register</Link>
                            </div>
                        )}
                    </li>
                </ul>
                <div className="nav-auth">
                    {isLoggedIn ? (
                        <button className="btn-logout" onClick={handleLogout} style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>Logout</button>
                    ) : (
                        <>
                            <Link to="/login" className="login-link">LOGIN</Link>
                            <Link to="/register" className="btn-register">Register</Link>
                        </>
                    )}
                </div>
                <div
                    className={`nav-overlay ${isMenuOpen ? 'open' : ''}`}
                    onClick={handleCloseMenu}
                />
                <div
                    className={`hamburger ${isMenuOpen ? 'open' : ''}`}
                    onClick={handleToggleMenu}
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </nav>
            <header className="hero" id="hero">
                <div className="hero-content">
                    <span className="hero-tag">SELAMAT DATANG</span>
                    <h1>Mulai Langkah Sehat<br/>Bersama Program<br/>Makan Bergizi Gratis</h1>
                    <p className="hero-desc">Penasaran besok makan apa? Di ReqIt, ayo intip menu harian secara transparan dan ayo ikut nentuin menu favorit. Karena suara kita bersama adalah bumbu utama untuk hidangan yang lebih baik!</p>
                    <a href="#menu-section" className="btn-hero">Lihat Menu Hari Ini</a>
                </div>
            </header>
            <section className="about">
                <div className="about-content">
                    <h2>Apa itu ReqIt?</h2>
                    <p>ReqIt adalah sebuah platform digital berbasis website yang dirancang sebagai "Jembatan Komunikasi" interaktif antara penyelenggara program Makan Bergizi Gratis (Dapur MBG) dengan siswa sebagai penerima manfaat.</p>
                </div>
            </section>
            <section className="menu-section" id="menu-section">
                <div className="menu-tabs">
                    <span className="active">MAKANAN BERGIZI HARI INI</span>
                </div>
                <div className="menu-container">
                    {todayMenu ? (
                        <div className="menu-card">
                            {todayMenu.image ? (
                                <img src={`http://localhost:8800${todayMenu.image}`} alt={todayMenu.name} />
                            ) : (
                                <img src="assets/img/menu 1.jpg" alt="Menu placeholder" />
                            )}
                            <div className="card-info">
                                <h4>{todayMenu.name}</h4>
                                <p>{todayMenu.description}</p>
                                <div className="stars-trigger" onClick={() => handleOpenRating(todayMenu.id, todayMenu.name)}>☆☆☆☆☆</div>
                            </div>
                        </div>
                    ) : (
                        <div className="menu-card">
                            <div style={{ backgroundColor: '#f0f0f0', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px' }}>
                                <p>Menu MBG belum diperbarui</p>
                            </div>
                            <div className="card-info">
                                <h4>Menu belum tersedia</h4>
                                <p>Admin sedang mempersiapkan menu untuk hari ini. Silahkan kembali lagi nanti.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <section className="request" id="request">
                <h3>Kirim menu permintaan anda</h3>
                <div className="request-input-container">
                    <input type="text" placeholder="Tulis permintaan anda" value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} onFocus={requireAuth} onKeyDown={(e) => { if (e.key === 'Enter') handleSendRequest(); }} />
                    <button className="btn-send" onClick={handleSendRequest}>➤</button>
                </div>
                {requestNotif && <p style={{ color: requestNotif.includes('berhasil') ? 'green' : 'red', marginTop: '10px' }}>{requestNotif}</p>}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>Hanya satu request per hari. Masukkan satu menu makanan saja.</p>
            </section>
            <section className="feedback" id="feedback">
                <div className="feedback-container">
                    <h3>Kirim Saran Anda</h3>
                    <p className="feedback-subtitle">
                        Bantu kami meningkatkan kualitas program MBG dengan saran kamu
                    </p>
                    <textarea
                        placeholder="Tulis saran atau masukan kamu di sini..."
                        onFocus={requireAuth}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isLoggedIn) handleSendFeedback();
                            }
                        }}
                    ></textarea>
                    <button className="btn-submit" onClick={handleSendFeedback}>
                        Kirim Saran
                    </button>
                    {feedbackMessage && (
                        <p style={{
                            color: feedbackMessage.includes('berhasil') ? '#2D6A4F' : '#dc3545',
                            marginTop: '12px',
                            fontSize: '13px'
                        }}>
                            {feedbackMessage}
                        </p>
                    )}
                </div>
            </section>
            <footer className="footer" id="footer">
                <div className="footer-col">
                    <h4>ReqIt</h4>
                </div>
                <div className="footer-col">
                    <h4>DAPATKAN BANTUAN</h4>
                    <button onClick={() => setShowHelpModal(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0 }}>Panduan</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0 }}>Hubungi Kami</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 'inherit', padding: 0 }}>08xx-xxx-xxxx</button>
                </div>
                <div className="footer-col">
                    <h4>SERVICES</h4>
                    <a href="#menu-section">Menu</a>
                    <a href="#request">Request Menu</a>
                    <a href="#feedback">Saran</a>
                </div>
                <div className="footer-col">
                    <h4>TENTANG KAMI</h4>
                    <a href="https://www.bgn.go.id/">Profil</a>
                </div>
                <div className="footer-col">
                    <h4>SOSIAL MEDIA</h4>
                    <div className="app-downloads">
                        <a href="https://www.instagram.com/kabarmbg?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="><img src="assets/img/instagram.png" alt="" /></a>
                        <a href="https://www.facebook.com/p/Badan-Gizi-Nasional-Republik-Indonesia-61572906507007/"><img src="assets/img/facebook.png" alt="" /></a>
                        <a href="https://www.tiktok.com/@badangizinasional.ri?is_from_webapp=1&sender_device=pc"><img src="assets/img/tik-tok.png" alt="" /></a>
                    </div>
                </div>

                <div className="footer-copyright">
                    <p>© {new Date().getFullYear()} ReqIt All rights reserved.</p>
                </div>

                <div className={`modal ${showRatingModal ? 'show' : ''}`} id="ratingModal">
                    <div className="modal-box">
                        <h4 id="menuTitle">
                            {currentMenu.name
                                ? `Nilai ${currentMenu.name}!`
                                : 'Nilai Makanan Hari Ini!'}
                        </h4>
                        <p className="modal-subtitle">Bantu kami meningkatkan kualitas makanan kamu agar sesuai dengan selera kamu dengan memberi kami penilaian di sini!</p>
                        <div className="star-select">
                            {[1, 2, 3, 4, 5].map((star) => {
                                const active = (hoverRating || selectedRating) >= star;
                                return (
                                    <span
                                        key={star}
                                        data-rate={star}
                                        className={active ? 'active' : ''}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        onClick={() => setSelectedRating(star)}
                                    >
                                        {active ? '★' : '☆'}
                                    </span>
                                );
                            })}
                        </div>
                        <p style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '5px'}}>Bisakah Anda memberi tahu kami lebih lanjut?</p>
                        <textarea
                            placeholder="Tambahkan umpan balik"
                            value={ratingComment}
                            onChange={(e) => {
                                setRatingComment(e.target.value);
                                if (ratingMessage) {
                                    setRatingMessage('');
                                }
                            }}
                        ></textarea>
                        {ratingMessage && (
                            <p
                                style={{
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: ratingMessage.includes('berhasil') ? 'lightgreen' : 'salmon'
                                }}
                            >
                                {ratingMessage}
                            </p>
                        )}
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={handleCancelRating}>Batal</button>
                            <button className="btn-confirm" onClick={handleSubmitRating}>Kirim</button>
                        </div>
                    </div>
                </div>
                <div className={`modal ${showHelpModal ? 'show' : ''}`} id="helpModal">
                    <div className="modal-box" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h4 style={{ marginBottom: '20px', color: '#ffffff' }}>📚 Panduan ReqIt</h4>
                        <div style={{ textAlign: 'left', lineHeight: '1.6' }}>
                            <h5 style={{ color: '#ffffff', marginBottom: '10px' }}>🍽️ Melihat Menu MBG Hari Ini</h5>
                            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Gulir ke bawah halaman utama dan lihat bagian "MENU HARI INI". 
                                Di sana kamu bisa lihat gambar dan deskripsi makanan yang disediakan hari ini.
                            </p>

                            <h5 style={{ color: '#ffffff', marginBottom: '10px' }}>📝 Mengirim Request Makanan</h5>
                            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Di bagian "REQUEST", tulis nama makanan yang kamu inginkan. 
                                Hanya satu request per hari ya! Pastikan tulis dengan sopan dan jelas.
                            </p>

                            <h5 style={{ color: '#ffffff', marginBottom: '10px' }}>⭐ Memberi Rating & Saran</h5>
                            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Klik bintang di kartu menu untuk beri rating 1-5 bintang. 
                                Kalau rating ≤3, wajib isi alasan di kolom komentar. 
                                Saran bebas bisa dikirim di bagian "SARAN".
                            </p>

                            <h5 style={{ color: '#ffffff', marginBottom: '10px' }}>🤖 Menggunakan Chatbot Gizi</h5>
                            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Klik ikon chatbot di kanan bawah. Tanyakan tentang kandungan gizi, 
                                manfaat makanan, atau pertanyaan seputar nutrisi MBG.
                            </p>

                            <h5 style={{ color: '#ffffff', marginBottom: '10px' }}>ℹ️ Tentang Data Kamu</h5>
                            <p style={{ marginBottom: '15px', fontSize: '14px' }}>
                                Data NIS, email, dan alergi kamu digunakan hanya untuk meningkatkan 
                                layanan MBG. Kami jaga privasi kamu dengan aman.
                            </p>
                        </div>
                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-confirm" onClick={() => setShowHelpModal(false)} style={{ backgroundColor: '#ffffff', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}>Tutup</button>
                        </div>
                    </div>
                </div>
                <div className={`chat-popup ${isChatOpen ? 'show' : ''}`} id="chatPopup">
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: '10px'
                    }}>
                        <button
                            onClick={handleToggleChat}
                            style={{
                                background: 'rgba(255,255,255,0.3)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                    <div className="chat-body-custom" id="chatBody">
                        {messages.map((msg, index) => (
                            <div key={index} className={`msg-row ${msg.type}`}>
                                {msg.type === 'bot' ? (
                                    <>
                                        <div className="avatar-circle">
                                            <img src="assets/img/chatbot.png" alt="bot" />
                                        </div>
                                        <div className="msg-content">
                                            <div className="msg-meta">Yves <span>{msg.time}</span></div>
                                            <div className="msg-bubble">
                                                <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="msg-content">
                                            <div className="msg-meta text-right">You <span>{msg.time}</span></div>
                                            <div className="msg-bubble user-bg">{msg.text}</div>
                                        </div>
                                        <div className="avatar-circle">
                                            <img src="assets/img/joktit.png" alt="you" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                        {isTyping && (
                            <div className="msg-row bot">
                                <div className="avatar-circle">
                                    <img src="assets/img/chatbot.png" alt="bot" />
                                </div>
                                <div className="msg-content">
                                    <div className="msg-meta">Yves <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                    <div className="msg-bubble typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="chat-footer-new">
                        <div className="input-pill">
                            <input type="text" placeholder="Kirim Pesan" id="chatInput" />
                            <button className="btn-send-green" onClick={handleSendMessage}>
                                <span className="arrow-up">↑</span>
                            </button>
                        </div>
                    </div>
                </div>
                {!isChatOpen && (
                    <button className="chat-toggle-btn" onClick={handleToggleChat}>
                        <img src="assets/img/circle.png" alt="bot" />
                    </button>
                )}
            </footer>
            {showLoginModal && (
                <div
                    onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
                    style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000, padding: '20px'
                    }}
                >
                    <div style={{
                        background: 'white',
                        borderRadius: '24px',
                        padding: '32px 28px 24px',
                        width: '100%',
                        maxWidth: '340px',
                        textAlign: 'center',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
                    }}>
                        <div style={{
                            width: '60px', height: '60px',
                            background: '#EAF3DE',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            margin: '0 auto 20px',
                            fontSize: '28px'
                        }}>
                            🔒
                        </div>
                        <h4 style={{
                            margin: '0 0 8px',
                            fontSize: '17px',
                            fontWeight: '600',
                            color: '#1a1a1a'
                        }}>
                            Login diperlukan
                        </h4>
                        <p style={{
                            margin: '0 0 24px',
                            fontSize: '13px',
                            color: '#888',
                            lineHeight: '1.6'
                        }}>
                            Untuk menggunakan fitur ini, silakan login atau buat akun baru terlebih dahulu.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                            <button
                                onClick={() => { setShowLoginModal(false); navigate('/login'); }}
                                style={{
                                    width: '100%', padding: '13px',
                                    background: '#3F6F4E', color: 'white',
                                    border: 'none', borderRadius: '50px',
                                    fontSize: '14px', fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => { setShowLoginModal(false); navigate('/register'); }}
                                style={{
                                    width: '100%', padding: '13px',
                                    background: 'white', color: '#3F6F4E',
                                    border: '1.5px solid #3F6F4E', borderRadius: '50px',
                                    fontSize: '14px', fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Daftar sekarang
                            </button>
                        </div>
                        <button
                            onClick={() => setShowLoginModal(false)}
                            style={{
                                background: 'none', border: 'none',
                                fontSize: '13px', color: '#aaa',
                                cursor: 'pointer', padding: '4px 12px'
                            }}
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
