import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Customer Pages
import Home from './pages/Home';
import Branches from './pages/Branches';
import BranchDetail from './pages/BranchDetail';
import Rooms from './pages/Rooms';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import StaffAuth from './pages/StaffAuth';
import Offers from './pages/Offers';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Profile from './pages/ProfilePage';

// Role Portals
import CustomerPortal from './pages/portals/CustomerPortal';
import SuperAdminPortal from './pages/portals/SuperAdminPortal';
import BranchAdminPortal from './pages/portals/BranchAdminPortal';
import ReceptionPortal from './pages/portals/ReceptionPortal';
import HousekeepingPortal from './pages/portals/HousekeepingPortal';
import MaintenancePortal from './pages/portals/MaintenancePortal';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-main text-main">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/branches/:id" element={<BranchDetail />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/staff" element={<StaffAuth />} />
          <Route path="/staff/login" element={<StaffAuth />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Role-Protected Portals */}
          <Route 
            path="/portal/customer" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/superadmin" 
            element={
              <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                <SuperAdminPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/branchadmin" 
            element={
              <ProtectedRoute allowedRoles={['BRANCH_ADMIN']}>
                <BranchAdminPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/reception" 
            element={
              <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
                <ReceptionPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/housekeeping" 
            element={
              <ProtectedRoute allowedRoles={['HOUSEKEEPING']}>
                <HousekeepingPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portal/maintenance" 
            element={
              <ProtectedRoute allowedRoles={['MAINTENANCE']}>
                <MaintenancePortal />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
