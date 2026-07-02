import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public & Customer Pages
import Home from './pages/Home';
import Branches from './pages/Branches';
import BranchDetail from './pages/BranchDetail';
import Rooms from './pages/Rooms';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import Offers from './pages/Offers';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';

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

          {/* Portals */}
          <Route path="/portal/customer" element={<CustomerPortal />} />
          <Route path="/portal/superadmin" element={<SuperAdminPortal />} />
          <Route path="/portal/branchadmin" element={<BranchAdminPortal />} />
          <Route path="/portal/reception" element={<ReceptionPortal />} />
          <Route path="/portal/housekeeping" element={<HousekeepingPortal />} />
          <Route path="/portal/maintenance" element={<MaintenancePortal />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
