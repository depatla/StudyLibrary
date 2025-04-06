import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Dashboard from "./Dashboard";
import Seats from "./Seats";
import Students from "./Students";
import BookSeatList from "./BookSeatList";
import MaintenanceList from "./Maintainance";
import { useDatabase } from "../config/useDatabase";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store/store";
import { Query } from "appwrite";
import { updateStudyall } from "../store/slice/userSlice";

const databaseId = process.env.REACT_APP_DATABASE_ID
  ? process.env.REACT_APP_DATABASE_ID
  : "676f62930015946e6bb5";
const userTableId = process.env.REACT_APP_USERS_ID
  ? process.env.REACT_APP_USERS_ID
  : "67f116bf0026474d036f";

export const Home = () => {
  const username = useSelector((state: RootState) => state.user.username);
  const dispatch = useDispatch();
  const { list, fetchAllWithFilters, loading } = useDatabase(
    databaseId,
    userTableId
  );

  useEffect(() => {
    fetchAllWithFilters({ filters: [Query.equal("name", username)] });
  }, [fetchAllWithFilters, username]);

  useEffect(() => {
    if (!loading && list.length > 0) {
      const studyhallId = list[0].studyhallId;
      dispatch(updateStudyall(studyhallId));
    }
  }, [list, loading, dispatch]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-r from-gray-50 to-gray-100">
      <Header onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main className="w-full overflow-hidden flex-1">
          {!loading && list.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-red-600 text-lg font-semibold text-center">
                You do not have permission, Please contact administration
              </p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/Seats" element={<Seats />} />
              <Route path="/Students" element={<Students />} />
              <Route path="/Bookings" element={<BookSeatList />} />
              <Route path="/maintenance" element={<MaintenanceList />} />
            </Routes>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
};
