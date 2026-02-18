import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// --- Components ---
import Header from './components/customer/Header';

// --- Auth Pages ---
import SplashScreen from './pages/auth/SplashScreen';
import Login from './pages/auth/Login';

// --- Customer Pages ---
import Home from './pages/customer/Home';
import AllProducts from './pages/customer/AllProducts';
import CollectionView from './pages/customer/CollectionView';
import ProductDetails from './pages/customer/ProductDetails';
import SearchResults from './pages/customer/SearchResults';
import Cart from './pages/customer/Cart';
import Orders from './pages/customer/Orders';
import OrderSuccess from './pages/customer/OrderSuccess';
import Profile from './pages/customer/Profile'; 

// --- Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import Inventory from './pages/admin/Inventory';
import Categories from './pages/admin/Categories';
import Banners from './pages/admin/Banners';
import AdminOrders from './pages/admin/AdminOrders';
import Customers from './pages/admin/Customers';
import StoreSettings from './pages/admin/StoreSettings';

/**
 * ScrollToTop Utility
 * Reset viewport to top on every route change for premium UX.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* --- Entry & Auth Flow --- */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />

        {/* --- Customer Store Routes --- */}
        {/* Home includes the Header specifically as requested */}
        <Route path="/home" element={<><Header /><Home /></>} />
        
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/collection/:section" element={<CollectionView />} />
        <Route path="/collection/:section/:categoryName" element={<CollectionView />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/orders" element={<Orders />} /> 
        <Route path="/profile" element={<Profile />} />
        
        {/* --- Admin Management Suite --- */}
        {/* Nested Routing for Admin Terminal */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route index element={<div className="hidden" />} /> {/* Default Dashboard View handled in AdminDashboard */}
          <Route path="inventory" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="banners" element={<Banners />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<StoreSettings />} />
          <Route path="customers" element={<Customers />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;