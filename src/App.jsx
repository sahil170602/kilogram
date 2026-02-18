import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/customer/Header'; // Ensure this is imported here

// Auth Pages
import SplashScreen from './pages/auth/SplashScreen';
import Login from './pages/auth/Login';

// Customer Pages
import Home from './pages/customer/Home';
import AllProducts from './pages/customer/AllProducts';
import CollectionView from './pages/customer/CollectionView';
import ProductDetails from './pages/customer/ProductDetails';
import SearchResults from './pages/customer/SearchResults';
import Cart from './pages/customer/Cart';
import OrderSuccess from './pages/customer/OrderSuccess';
import Profile from './pages/customer/Profile'; 

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Inventory from './pages/admin/Inventory';
import Categories from './pages/admin/Categories';
import Banners from './pages/admin/Banners';
import AdminOrders from './pages/admin/AdminOrders';
import Customers from './pages/admin/Customers';
import Orders from './pages/customer/Orders';
import StoreSettings from './pages/admin/StoreSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- Entry & Auth Flow --- */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />

        {/* --- Customer Store Routes --- */}
        {/* SPECIFIC EDIT: Header added only to Home */}
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
        <Route path="/admin" element={<AdminDashboard />}>
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