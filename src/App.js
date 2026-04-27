import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Properties from "./views/hostels/Hostels";
import Agents from "./pages/Agents";
import Customers from "./pages/Customers";
import Enquiries from "./pages/Enquiries";

import CreateHostel from "./views/hostels/CreateHostel";
import CreateBanner from "./views/banners/CreateBanner";
import Login from "./views/Login";
import Category from "./views/Category";
import Banners from "./views/banners/CreateBanner";
import SingleHostel from "./views/hostels/SingleHostel";
import Hostels from "./views/hostels/Hostels";
import PendingVendors from "./views/Vendors/PendingVendors";

const App = () => {
  return (
    <Routes>

      {/* Login Route */}
      <Route path="/" element={<Login />} />

      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<AdminLayout />}>

        <Route index element={<Dashboard />} />

        <Route path="category" element={<Category />} />

        <Route path="agents" element={<Agents />} />
        <Route path="customers" element={<Customers />} />
        <Route path="enquiries" element={<Enquiries />} />

        <Route path="create-hostel" element={<CreateHostel />} />
        <Route path="hostels" element={<Hostels />} />
        <Route path="hostels/:id" element={<SingleHostel />} />
        <Route path="banners" element={<Banners />} />

        <Route path="vendors/pending" element={<PendingVendors />} />

      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
};

export default App;