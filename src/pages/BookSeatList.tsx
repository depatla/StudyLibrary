import React, { useEffect, useState } from "react";
import { DateTime } from "luxon";
import Loader from "../components/common/Loader";
import { useDatabase } from "../config/useDatabase";

interface BookedSeat {
  id: string;
  studentName: string;
  receivedBy: string;
  fromDate: string;
  toDate: string;
  amount: string;
  paymentType: string;
  comment?: string;
  $createdAt: string;
}

const BookSeatList: React.FC = () => {
  const databaseId =
    process.env.REACT_APP_DATABASE_ID || "676f62930015946e6bb5";
  const bookingsCollectionId =
    process.env.REACT_APP_BOOKINGS_ID || "6775433b0022fae7ea28";

  const { list, fetchAllRecordsByMonth, loading, error } = useDatabase(
    databaseId,
    bookingsCollectionId
  );

  const [bookings, setBookings] = useState<BookedSeat[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookedSeat[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedReceivedBy, setSelectedReceivedBy] = useState<string>("");

  useEffect(() => {
    const currentMonth = DateTime.now().toFormat("yyyy-MM");
    setSelectedMonth(currentMonth);
    fetchAllRecordsByMonth({ yearMonth: currentMonth });
  }, [fetchAllRecordsByMonth]);

  useEffect(() => {
    if (list.length > 0) {
      const formattedBookings = list.map((item) => ({
        id: item.$id,
        studentName: item.student_name || "Unknown",
        receivedBy: item.received_by || "Admin",
        fromDate: item.from_date || "",
        toDate: item.to_date || "",
        amount: item.amount || "0",
        paymentType: item.payment_type || "Unknown",
        comment: item.comment || "",
        $createdAt: item.$createdAt || "",
      }));
      setBookings(formattedBookings);
    }
  }, [list]);

  useEffect(() => {
    let filtered = bookings;
    if (selectedReceivedBy) {
      filtered = filtered.filter(
        (booking) => booking.receivedBy === selectedReceivedBy
      );
    }

    setFilteredBookings(filtered);

    const total = filtered.reduce(
      (sum, booking) => sum + parseFloat(booking.amount || "0"),
      0
    );
    setTotalAmount(total);
  }, [selectedMonth, selectedReceivedBy, bookings]);

  const generateLastFourMonths = () => {
    return Array.from({ length: 4 }, (_, i) => {
      const date = DateTime.now().minus({ months: i });
      return {
        value: date.toFormat("yyyy-MM"),
        label: date.toFormat("MMMM yyyy"),
      };
    });
  };

  const months = generateLastFourMonths();
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

      {/* Filters & Total Amount (Responsive) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <span className="text-sm font-medium">
          Total Amount:{" "}
          <span className="font-bold text-green-600">
            ₹{totalAmount.toFixed(2)}
          </span>
        </span>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="flex items-center">
            <label className="mr-2 text-sm font-medium">Month:</label>
            <select
              className="border border-gray-300 p-2 rounded-md text-sm"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                fetchAllRecordsByMonth({ yearMonth: e.target.value });
              }}
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>

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

      {/* Table for larger screens, Grid for mobile */}
      <div className="overflow-x-auto">
        {error ? (
          <p className="text-red-500">Error loading bookings: {error}</p>
        ) : filteredBookings.length === 0 ? (
          <p>No bookings available for the selected filters.</p>
        ) : (
          <div className="w-full">
            {/* Mobile View (Grid Layout) */}
            <div className="grid grid-cols-1 gap-4 sm:hidden overflow-y-auto h-[calc(100vh-300px)] scrollbar-thin">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border p-4 rounded-lg shadow-md bg-white"
                >
                  <p className="font-bold">{booking.studentName}</p>
                  <p className="text-sm text-gray-600">
                    Received By: {booking.receivedBy}
                  </p>
                  <p className="text-sm">From: {booking.fromDate}</p>
                  <p className="text-sm">To: {booking.toDate}</p>
                  <p className="text-sm text-green-600 font-bold">
                    ₹{booking.amount}
                  </p>
                  <p className="text-sm">Payment: {booking.paymentType}</p>
                  {booking.comment && (
                    <p className="text-sm italic">"{booking.comment}"</p>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop View (Table Layout) */}
            <div className="overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              <table className="hidden sm:table w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-200 p-2 text-left">
                      Student Name
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Received By
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Created At
                    </th>
                    {/* <th className="border border-gray-200 p-2 text-left">
                      To Date
                    </th> */}
                    <th className="border border-gray-200 p-2 text-left">
                      Amount
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Payment Type
                    </th>
                    <th className="border border-gray-200 p-2 text-left">
                      Comments
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="border border-gray-200 p-2">
                        {booking.studentName}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {booking.receivedBy}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {DateTime.fromISO(booking.$createdAt).toFormat(
                          "dd-MMM-yyyy"
                        )}
                      </td>
                      <td className="border border-gray-200 p-2">
                        ₹{booking.amount}
                      </td>
                      <td className="border border-gray-200 p-2">
                        {booking.paymentType}
                      </td>
                      <td className="border border-gray-200 p-2 max-w-[200px] break-words">
                        {booking.comment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSeatList;
