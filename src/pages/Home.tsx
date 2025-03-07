import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Dashboard from "./Dashboard";
import Seats from "./Seats";
import Students from "./Students";
import BookSeatList from "./BookSeatList";
import MaintenanceList from "./Maintainance";

export const Home = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/Seats" element={<Seats />} />
            <Route path="/Students" element={<Students />} />
            <Route path="/Bookings" element={<BookSeatList />} />
            <Route path="/maintenance" element={<MaintenanceList />} />
          </Routes>
        </main>
      </div>
      <Footer />
    </div>
  );
};
