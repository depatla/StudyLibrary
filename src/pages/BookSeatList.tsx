import React, { useEffect, useState } from "react";
import { useDatabase } from "./../config/useDatabase"; // Ensure you have this hook or replace with appropriate data-fetching logic

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
  const databaseId = "676f62930015946e6bb5"; // Replace with your Appwrite database ID
  const bookingsCollectionId = "6775433b0022fae7ea28"; // Replace with your Bookings collection ID

  // Fetch bookings using the database hook
  const { list, fetchAll, loading, error } = useDatabase(
    databaseId,
    bookingsCollectionId
  );

  // Local state for storing formatted bookings
  const [bookings, setBookings] = useState<BookedSeat[]>([]);

  // Fetch bookings on component mount
  useEffect(() => {
    const fetchBookings = async () => {
      await fetchAll();
    };
    fetchBookings();
  }, [fetchAll]);

  // Format bookings whenever `list` changes
  useEffect(() => {
    if (list) {
      const formattedBookings: BookedSeat[] = list.map((item) => ({
        id: item.$id,
        studentName: item.student_name || "Unknown", // Assuming field `studentName`
        receivedBy: item.received_by || "Admin", // Assuming field `receivedBy`
        fromDate: item.from_date || "",
        toDate: item.to_date || "",
        amount: item.amount || "0",
        paymentType: item.payment_type || "Unknown",
      }));
      setBookings(formattedBookings);
    }
  }, [list]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Booked Seats</h2>
      <div className="overflow-x-auto">
        {loading ? (
          <p>Loading bookings...</p>
        ) : error ? (
          <p className="text-red-500">Error loading bookings: {error}</p>
        ) : bookings.length === 0 ? (
          <p>No bookings available.</p>
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
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  {/* <td className="border border-gray-200 p-2">{booking.id}</td> */}
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
                    {booking.amount}
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
