import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Lost from './pages/Lost';
import Found from './pages/Found';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import Register from './pages/Register';
import ItemDetail from './pages/ItemDetail';
import QrRedirect from './pages/QrRedirect';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import Shop from './pages/Shop';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/found" element={<Found />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/qr/:qrNumber" element={<QrRedirect />} />
          <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
          <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}




