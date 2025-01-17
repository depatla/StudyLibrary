import React, { useEffect, useState } from "react";
import { useDatabase } from "./../config/useDatabase"; // Replace with your database hook

interface DashboardData {
  upiPayments: number;
  cashPayments: number;
  studentsJoined: number;
  studyHallMaintenance: number;
}

const Dashboard: React.FC = () => {
  const databaseId = "676f62930015946e6bb5"; // Replace with your Appwrite database ID
  const bookingsCollectionId = "6775433b0022fae7ea28"; // Replace with your Bookings collection ID
  const studentsCollectionId = "67734d7e002ad7b37a2b"; // Replace with your Students collection ID
  const maintenanceCollectionId = "your-maintenance-collection-id"; // Replace with your Maintenance collection ID

  const [data, setData] = useState<DashboardData>({
    upiPayments: 0,
    cashPayments: 0,
    studentsJoined: 0,
    studyHallMaintenance: 0,
  });

  const { list: bookings, fetchAll: fetchBookings } = useDatabase(
    databaseId,
    bookingsCollectionId
  );
  const { list: students, fetchAll: fetchStudents } = useDatabase(
    databaseId,
    studentsCollectionId
  );
  const { list: maintenance, fetchAll: fetchMaintenance } = useDatabase(
    databaseId,
    maintenanceCollectionId
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Fetch bookings
      await fetchBookings();
      // Fetch students
      await fetchStudents();
      // Fetch maintenance data
      await fetchMaintenance();
    };

    fetchDashboardData();
  }, [fetchBookings, fetchStudents, fetchMaintenance]);

  useEffect(() => {
    // Calculate UPI and Cash Payments
    if (bookings.length > 0) {
      const upiPayments = bookings
        .filter((booking) => booking.payment_type === "UPI")
        .reduce((sum, booking) => sum + parseFloat(booking.amount || 0), 0);

      const cashPayments = bookings
        .filter((booking) => booking.payment_type === "Cash")
        .reduce((sum, booking) => sum + parseFloat(booking.amount || 0), 0);

      setData((prev) => ({ ...prev, upiPayments, cashPayments }));
    }

    // Calculate Students Joined (Current Month)
    if (students.length > 0) {
      const currentMonth = new Date().getMonth();
      const studentsJoined = students.filter((student) => {
        const joinDate = new Date(student.join_date);
        return joinDate.getMonth() === currentMonth;
      }).length;

      setData((prev) => ({ ...prev, studentsJoined }));
    }

    // Fetch Maintenance Data
    if (maintenance.length > 0) {
      const maintenanceCost = maintenance.reduce(
        (sum, entry) => sum + parseFloat(entry.amount || 0),
        0
      );
      setData((prev) => ({ ...prev, studyHallMaintenance: maintenanceCost }));
    }
  }, [bookings, students, maintenance]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* UPI Payments */}
        <div className="bg-blue-500 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-md font-semibold mb-2">UPI Payments</h3>
          <p className="text-2xl font-bold">
            ₹{data.upiPayments.toLocaleString()}
          </p>
          <p className="text-sm mt-2">Current Month</p>
        </div>

        {/* Cash Payments */}
        <div className="bg-blue-400 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-md font-semibold mb-2">Cash Payments</h3>
          <p className="text-2xl font-bold">
            ₹{data.cashPayments.toLocaleString()}
          </p>
          <p className="text-sm mt-2">Current Month</p>
        </div>

        {/* Students Joined */}
        <div className="bg-green-500 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-md font-semibold mb-2">Students Joined</h3>
          <p className="text-2xl font-bold">{data.studentsJoined}</p>
          <p className="text-sm mt-2">Current Month</p>
        </div>

        {/* Study Hall Maintenance Amount */}
        <div className="bg-yellow-500 text-white rounded-lg p-4 shadow-md">
          <h3 className="text-md font-semibold mb-2">Study Hall Maintenance</h3>
          <p className="text-2xl font-bold">
            ₹{data.studyHallMaintenance.toLocaleString()}
          </p>
          <p className="text-sm mt-2">Current Month</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
