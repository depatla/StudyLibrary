import React, { useEffect, useRef, useState } from "react";
import { DateTime } from "luxon"; // Import Luxon for date manipulation
import { useDatabase } from "./../config/useDatabase"; // Your database hook
import Loader from "../components/common/Loader";

interface BookedSeat {
  id: string;
  studentName: string;
  receivedBy: string;
  fromDate: string;
  toDate: string;
  amount: string;
  paymentType: string;
}

const BookSeatList: React.FC = () => {
  const databaseId = process.env.REACT_APP_DATABASE_ID
    ? process.env.REACT_APP_DATABASE_ID
    : ""; // Replace with your Appwrite database ID
  const bookingsCollectionId = process.env.REACT_APP_BOOKINGS_ID
    ? process.env.REACT_APP_BOOKINGS_ID
    : "";

  const { list, fetchAll, loading, error } = useDatabase(
    databaseId,
    bookingsCollectionId
  );

  const [bookings, setBookings] = useState<BookedSeat[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookedSeat[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedReceivedBy, setSelectedReceivedBy] = useState<string>(""); // New filter for receivedBy

  // Use a ref to prevent multiple `fetchAll` calls during Strict Mode in development
  const isFetched = useRef(false);

  useEffect(() => {
    if (!isFetched.current) {
      isFetched.current = true; // Prevent further calls
      fetchAll(); // Call the fetch function
    }
  }, [fetchAll]);

  useEffect(() => {
    if (list) {
      const formattedBookings: BookedSeat[] = list.map((item) => ({
        id: item.$id,
        studentName: item.student_name || "Unknown",
        receivedBy: item.received_by || "Admin",
        fromDate: item.from_date || "",
        toDate: item.to_date || "",
        amount: item.amount || "0",
        hall_code: "PRAJNA",
        paymentType: item.payment_type || "Unknown",
      }));
      setBookings(formattedBookings);

      const currentMonth = DateTime.now().toFormat("yyyy-MM");
      setSelectedMonth(currentMonth);
    }
  }, [list]);

  // Apply filters whenever filters or bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      let filtered = bookings;

      // Filter by month
      if (selectedMonth) {
        filtered = filtered.filter(
          (booking) =>
            DateTime.fromISO(booking.fromDate).toFormat("yyyy-MM") ===
            selectedMonth
        );
      }

      // Filter by receivedBy
      if (selectedReceivedBy) {
        filtered = filtered.filter(
          (booking) => booking.receivedBy === selectedReceivedBy
        );
      }

      setFilteredBookings(filtered);

      // Calculate total amount
      const total = filtered.reduce((sum, booking) => {
        return sum + parseFloat(booking.amount || "0");
      }, 0);

      setTotalAmount(total);
    }
  }, [selectedMonth, selectedReceivedBy, bookings]);

  const generateLastFourMonths = () => {
    const months = [];
    for (let i = 0; i < 4; i++) {
      const date = DateTime.now().minus({ months: i });
      months.push({
        value: date.toFormat("yyyy-MM"),
        label: date.toFormat("MMMM yyyy"),
      });
    }
    return months;
  };

  const months = generateLastFourMonths();

  // Extract unique `receivedBy` values for the filter dropdown
  const uniqueReceivedBy = Array.from(
    new Set(bookings.map((booking) => booking.receivedBy))
  );
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Booked Seats</h2>

      <div className="flex items-center justify-between mb-4">
        {/* Total amount */}
        <span className="text-sm font-medium">
          Total Amount:{" "}
          <span className="font-bold text-green-600">
            ₹{totalAmount.toFixed(2)}
          </span>
        </span>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          {/* Filter by Month */}
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Month:</label>
            <select
              className="border border-gray-300 p-2 rounded-md text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter by Received By */}
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Received By:</label>
            <select
              className="border border-gray-300 p-2 rounded-md text-sm"
              value={selectedReceivedBy}
              onChange={(e) => setSelectedReceivedBy(e.target.value)}
            >
              <option value="">All</option>
              {uniqueReceivedBy.map((person) => (
                <option key={person} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p className="text-red-500">Error loading bookings: {error}</p>
        ) : filteredBookings.length === 0 ? (
          <p>No bookings available for the selected filters.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 p-2 text-left">
                  Student Name
                </th>
                <th className="border border-gray-200 p-2 text-left hidden sm:table-cell">
                  Received By
                </th>
                <th className="border border-gray-200 p-2 text-left">
                  From Date
                </th>
                <th className="border border-gray-200 p-2 text-left">
                  To Date
                </th>
                <th className="border border-gray-200 p-2 text-left hidden lg:table-cell">
                  Amount
                </th>
                <th className="border border-gray-200 p-2 text-left hidden sm:table-cell">
                  Payment Type
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2">
                    {booking.studentName}
                  </td>
                  <td className="border border-gray-200 p-2 hidden sm:table-cell">
                    {booking.receivedBy}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {booking.fromDate}
                  </td>
                  <td className="border border-gray-200 p-2">
                    {booking.toDate}
                  </td>
                  <td className="border border-gray-200 p-2 hidden lg:table-cell">
                    ₹{booking.amount}
                  </td>
                  <td className="border border-gray-200 p-2 hidden sm:table-cell">
                    {booking.paymentType}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BookSeatList;
