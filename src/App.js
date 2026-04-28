import { Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./components/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Properties from "./views/hostels/Hostels";
import Agents from "./pages/Agents";
import Customers from "./pages/Customers";
import Enquiries from "./pages/Enquiries";

import CreateHostel from "./views/hostels/CreateHostel";
import Login from "./views/Login";
import Category from "./views/Category";
import SingleHostel from "./views/hostels/SingleHostel";
import Hostels from "./views/hostels/Hostels";
import PendingVendors from "./views/Vendors/PendingVendors";
import UserBanners from "./views/banners/UserBanners";
import VendorBanners from "./views/banners/VendorBaners";
import AllVendors from "./views/Vendors/AllVendors";
import EditVendor from "./views/Vendors/EditVendor";
import SingleVendorDetails from "./views/Vendors/SingleVendorDetails";
import AllBookings from "./views/Bookings/AllBookings";
import SingleBooking from "./views/Bookings/SingleBooking";
import VendorBookings from "./views/Bookings/VendorBookings";
import Notifications from "./views/Notifications/Notifications";

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

        {/* <Route path="create-hostel" element={<CreateHostel />} /> */}
        <Route path="hostels" element={<Hostels />} />
        <Route path="hostels/:id" element={<SingleHostel />} />

        <Route path="banners" element={<UserBanners />} />
        <Route path="vendor-banners" element={<VendorBanners />} />

        <Route path="vendors/pending" element={<PendingVendors />} />
        <Route path="vendors" element={<AllVendors />} />
        <Route path="vendors/:id" element={<SingleVendorDetails />} />
        <Route path="vendors/edit/:id" element={<EditVendor />} />

        <Route path="bookings" element={<AllBookings />} />
        <Route path="bookings/:id" element={<SingleBooking />} />
        <Route path="/dashboard/vendors/:id/bookings" element={<VendorBookings />} />

        <Route path="notifications" element={<Notifications />} />

      </Route>

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
};

export default App;