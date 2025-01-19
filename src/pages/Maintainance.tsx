import React, { useState, useEffect } from "react";
import { DateTime } from "luxon";

interface Maintenance {
  id: string;
  type: string; // Rent, Maid, Water, Cleaning, Repair
  amount: number;
  user: string;
  date: string; // ISO date string
  comment: string;
}

const MaintenanceList: React.FC = () => {
  const [maintenanceData, setMaintenanceData] = useState<Maintenance[]>([
    {
      id: "1",
      type: "Rent",
      amount: 12000,
      user: "John Doe",
      date: "2025-01-05",
      comment: "Monthly rent for office space",
    },
    {
      id: "2",
      type: "Maid",
      amount: 2000,
      user: "Jane Smith",
      date: "2024-12-10",
      comment: "Maid service payment",
    },
    {
      id: "3",
      type: "Water",
      amount: 500,
      user: "Alex Johnson",
      date: "2024-11-15",
      comment: "Water bill for November",
    },
  ]);

  const [filteredData, setFilteredData] = useState<Maintenance[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState<number>(0); // State for total amount
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [newMaintenance, setNewMaintenance] = useState({
    type: "",
    amount: "",
    comment: "",
  });
  const [errors, setErrors] = useState({
    type: false,
    amount: false,
    comment: false,
  });

  // Function to generate the last four months, including the current month
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

  // Set default filter to the current month
  useEffect(() => {
    const currentMonth = DateTime.now().toFormat("yyyy-MM");
    setSelectedMonth(currentMonth);
  }, []);

  // Filter data and calculate total amount based on the selected month
  useEffect(() => {
    if (selectedMonth) {
      const filtered = maintenanceData.filter(
        (item) =>
          DateTime.fromISO(item.date).toFormat("yyyy-MM") === selectedMonth
      );
      setFilteredData(filtered);

      // Calculate total amount
      const total = filtered.reduce((sum, item) => sum + item.amount, 0);
      setTotalAmount(total);
    }
  }, [selectedMonth, maintenanceData]);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {
      type: newMaintenance.type === "",
      amount:
        newMaintenance.amount === "" ||
        isNaN(parseFloat(newMaintenance.amount)),
      comment: newMaintenance.comment === "",
    };
    setErrors(newErrors);

    // Return true if there are no errors
    return !Object.values(newErrors).some((error) => error === true);
  };

  // Add new maintenance record
  const handleAddMaintenance = () => {
    if (validateForm()) {
      const newRecord: Maintenance = {
        id: (maintenanceData.length + 1).toString(),
        type: newMaintenance.type,
        amount: parseFloat(newMaintenance.amount),
        user: "Admin", // Replace with actual user if available
        date: DateTime.now().toISODate(),
        comment: newMaintenance.comment,
      };
      setMaintenanceData([...maintenanceData, newRecord]);
      closeModal(); // Close modal
      setNewMaintenance({ type: "", amount: "", comment: "" }); // Reset form
      setErrors({ type: false, amount: false, comment: false }); // Reset errors
    }
  };

  // Open Modal
  const openModal = () => {
    setIsModalOpen(true);
    document.body.classList.add("overflow-hidden"); // Prevent body scrolling
  };

  // Close Modal
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.classList.remove("overflow-hidden"); // Restore body scrolling
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Maintenance List</h1>

      {/* Filter and Add Button Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 space-y-2 md:space-y-0">
        {/* Month Filter and Total Amount */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
          {/* Month Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Filter by Month:</label>
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

          {/* Total Amount */}
          <div className="text-sm font-medium mt-2 md:mt-0">
            Total Amount:{" "}
            <span className="font-bold text-green-600">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Add Maintenance Button */}
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition"
          onClick={openModal}
        >
          Add Maintenance
        </button>
      </div>

      {/* Scrollable Table Section */}
      <div className="overflow-x-auto">
        <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg">
          {filteredData.length === 0 ? (
            <p className="text-gray-600 p-4">
              No maintenance records available for the selected month.
            </p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2 text-left">
                    Maintenance Type
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Amount (₹)
                  </th>
                  <th className="border border-gray-300 p-2 text-left hidden sm:table-cell">
                    User
                  </th>
                  <th className="border border-gray-300 p-2 text-left hidden sm:table-cell">
                    Date
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-300 p-2">{item.type}</td>
                    <td className="border border-gray-300 p-2">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 p-2 hidden sm:table-cell">
                      {item.user}
                    </td>
                    <td className="border border-gray-300 p-2 hidden sm:table-cell">
                      {DateTime.fromISO(item.date).toFormat("dd MMM yyyy")}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {item.comment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Maintenance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white max-h-[90vh] overflow-y-auto p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Maintenance</h2>
            <form className="space-y-4">
              {/* Maintenance Type */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Maintenance Type
                </label>
                <select
                  className={`border p-2 rounded-md w-full text-sm ${
                    errors.type ? "border-red-500" : "border-gray-300"
                  }`}
                  value={newMaintenance.type}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      type: e.target.value,
                    })
                  }
                >
                  <option value="">Select Type</option>
                  <option value="Rent">Rent</option>
                  <option value="Maid">Maid</option>
                  <option value="Water">Water</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Repair">Repair</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">
                    This field is required.
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  className={`border p-2 rounded-md w-full text-sm ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  value={newMaintenance.amount}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      amount: e.target.value,
                    })
                  }
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">
                    Enter a valid amount.
                  </p>
                )}
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comment
                </label>
                <textarea
                  className={`border p-2 rounded-md w-full text-sm ${
                    errors.comment ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                  value={newMaintenance.comment}
                  onChange={(e) =>
                    setNewMaintenance({
                      ...newMaintenance,
                      comment: e.target.value,
                    })
                  }
                />
                {errors.comment && (
                  <p className="text-red-500 text-sm mt-1">
                    This field is required.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  className="bg-gray-300 text-sm px-4 py-2 rounded-md"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md"
                  onClick={handleAddMaintenance}
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceList;
