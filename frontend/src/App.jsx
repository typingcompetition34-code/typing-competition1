import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Header from './components/Header';
import UserHeader from './components/UserHeader';
import UserFooter from './components/UserFooter';
import Sidebar from './components/Sidebar';
import './App.css';
import './styles/UserShared.css';

// Lazy load pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const TournamentManagement = lazy(() => import('./pages/admin/TournamentManagement'));
const CharityManagement = lazy(() => import('./pages/admin/CharityManagement'));
const Homepage = lazy(() => import('./pages/user/Homepage'));
const TournamentDetail = lazy(() => import('./pages/user/TournamentDetail'));
const TypingArena = lazy(() => import('./pages/user/TypingArena'));
const OneToOneArena = lazy(() => import('./pages/user/OneToOneArena'));
const Login = lazy(() => import('./pages/auth/Login'));
const AdminLogin = lazy(() => import('./pages/auth/AdminLogin'));
const Register = lazy(() => import('./pages/auth/Register'));
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'));
const ProfilePage = lazy(() => import('./pages/user/ProfilePage'));
const PracticePage = lazy(() => import('./pages/user/PracticePage'));
const OneToOneContest = lazy(() => import('./pages/user/OneToOneContest'));
const PaymentMethods = lazy(() => import('./pages/admin/PaymentMethods'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const WalletDeposits = lazy(() => import('./pages/admin/WalletDeposits'));
const RedeemRequests = lazy(() => import('./pages/admin/RedeemRequests'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const AdminProfile = lazy(() => import('./pages/admin/AdminProfile'));

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch() {
  }

  render() {
    if (this.state.error) {
      const message = this.state.error?.message ? String(this.state.error.message) : 'Unknown error';
      return (
        <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', color: '#b71c1c', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontWeight: 900, fontSize: '18px', marginBottom: '8px' }}>This page crashed</div>
            <div style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{message}</div>
            <button
              onClick={() => this.setState({ error: null })}
              style={{ marginTop: '12px', padding: '10px 14px', borderRadius: '10px', border: '1px solid #b71c1c', background: '#fff', color: '#b71c1c', fontWeight: 800, cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AdminLayout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        {children}
      </div>
    </div>
  );
};

const UserLayout = ({ children }) => (
  <div className="user-layout">
    <UserHeader />
    <main style={{ minHeight: 'calc(100vh - 60px - 300px)' }}>
      {children}
    </main>
    <UserFooter />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Suspense fallback={
            <div className="loading-spinner-container">
              <div className="loading-spinner"></div>
            </div>
          }>
            <Routes>
              {/* Auth Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* User Routes - Protected except Homepage */}
              <Route path="/" element={<UserLayout><Homepage /></UserLayout>} />
              
              <Route path="/tournament/:id" element={<ProtectedRoute><UserLayout><TournamentDetail /></UserLayout></ProtectedRoute>} />

              <Route path="/play/:id" element={<ProtectedRoute><UserLayout><TypingArena /></UserLayout></ProtectedRoute>} />

              <Route path="/one-to-one/play/:id/*" element={<ProtectedRoute><RouteErrorBoundary><OneToOneArena /></RouteErrorBoundary></ProtectedRoute>} />

              <Route path="/practice" element={<ProtectedRoute><UserLayout><RouteErrorBoundary><PracticePage /></RouteErrorBoundary></UserLayout></ProtectedRoute>} />
              <Route path="/practice/:lessonName" element={<ProtectedRoute><UserLayout><RouteErrorBoundary><PracticePage /></RouteErrorBoundary></UserLayout></ProtectedRoute>} />

              <Route path="/dashboard" element={<ProtectedRoute><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />

              <Route path="/one-to-one-contest" element={<ProtectedRoute><UserLayout><OneToOneContest /></UserLayout></ProtectedRoute>} />

              <Route path="/profile" element={<ProtectedRoute><UserLayout><ProfilePage /></UserLayout></ProtectedRoute>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/tournaments" element={<AdminLayout><TournamentManagement /></AdminLayout>} />
              <Route path="/admin/charities" element={<AdminLayout><CharityManagement /></AdminLayout>} />
              <Route path="/admin/payment-methods" element={<AdminLayout><PaymentMethods /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
              <Route path="/admin/profile" element={<AdminLayout><AdminProfile /></AdminLayout>} />
              <Route path="/admin/deposits" element={<AdminLayout><WalletDeposits /></AdminLayout>} />
              <Route path="/admin/redeem-requests" element={<AdminLayout><RedeemRequests /></AdminLayout>} />
              <Route path="/admin/transactions" element={<AdminLayout><Transactions /></AdminLayout>} />



              {/* Fallback */}
              <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
          </Suspense>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
