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

const App = () => {
  return (
    <Routes>

      {/* Login Route */}
      <Route path="/" element={<Login />} />

      {/* Dashboard Layout */}
      <Route path="/dashboard" element={<AdminLayout />}>

        <Route index element={<Dashboard />} />

        <Route path="category" element={<Category/>}/>

        <Route path="properties" element={<Properties />} />
        <Route path="agents" element={<Agents />} />
        <Route path="customers" element={<Customers />} />
        <Route path="enquiries" element={<Enquiries />} />

        <Route path="create-hostel" element={<CreateHostel />} />
        <Route path="banners" element={<Banners />} />

      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
};

export default App;