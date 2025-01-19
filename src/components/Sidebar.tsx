import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaUserGraduate,
  FaChair,
  FaMoneyBillWave,
  FaTools, // New icon for Maintenance
} from "react-icons/fa";

const Sidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const menuItems = [
    { name: "Dashboard", path: "/", icon: <FaHome /> },
    { name: "Students", path: "/Students", icon: <FaUserGraduate /> },
    { name: "Seats", path: "/Seats", icon: <FaChair /> },
    { name: "Bookings", path: "/bookings", icon: <FaMoneyBillWave /> },
    { name: "Maintenance", path: "/maintenance", icon: <FaTools /> }, // Added Maintenance
  ];

  const location = useLocation();

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-[#2c3e50] shadow-lg transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 z-40 md:static md:translate-x-0`}
    >
      {/* Logo for Desktop */}
      <div className="p-4 bg-[#34495e] text-white text-lg font-bold text-center flex items-center justify-center gap-2">
        <img
          src="/logo.png" // Path to your logo image
          alt="Logo"
          className="h-8 w-8 object-contain"
        />
        Prajna
      </div>

      <div className="p-4">
        <ul className="space-y-4">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-4 py-2 px-3 rounded-md text-white transition duration-200 ${
                  location.pathname === item.path
                    ? "bg-[#3498db] text-white"
                    : "hover:bg-[#34495e]"
                }`}
                onClick={onClose}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
