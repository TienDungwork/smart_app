import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import SessionDetail from './pages/SessionDetail';
import Persons from './pages/Persons';
import Rooms from './pages/Rooms';
import Cameras from './pages/Cameras';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import UnknownFaces from './pages/UnknownFaces';
import SystemDesign from './pages/SystemDesign';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading" style={{ height: '100vh' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Routes>
                                        <Route path="/" element={<Dashboard />} />
                                        <Route path="/sessions" element={<Sessions />} />
                                        <Route path="/sessions/:id" element={<SessionDetail />} />
                                        <Route path="/persons" element={<Persons />} />
                                        <Route path="/rooms" element={<Rooms />} />
                                        <Route path="/cameras" element={<Cameras />} />
                                        <Route path="/reports" element={<Reports />} />
                                        <Route path="/unknown-faces" element={<UnknownFaces />} />
                                        <Route path="/settings" element={<Settings />} />
                                        <Route path="/system-design" element={<SystemDesign />} />
                                    </Routes>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
