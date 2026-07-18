import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import LoginAdmin from './pages/Login_admin.jsx';
import Register from './pages/Register.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/login_admin' element={<LoginAdmin />} />
                <Route
                    path='/admin'
                    element={
                        <ProtectedRoute requiredRole='admin' redirectTo='/login_admin'>
                            <Admin />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;