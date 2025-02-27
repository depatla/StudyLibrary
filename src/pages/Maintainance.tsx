import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { useDatabase } from "../config/useDatabase";
import { DateTime } from "luxon";
import Loader from "../components/common/Loader";

const databaseId = process.env.REACT_APP_DATABASE_ID || "676f62930015946e6bb5";
const collectionId = process.env.REACT_APP_MAINTENANCE_ID || "678d5f3d001f5c78cbe5";

interface Maintenance {
  $id: string;
  type: string;
  amount: number;
  comments: string;
  hall_code: string;
  $createdAt: string;
}

const MaintenanceList: React.FC = () => {
  const {
    list,
    fetchAllRecordsByMonth,
    create,
    update,
    remove,
    loading,
    error,
  } = useDatabase(databaseId, collectionId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaintenanceId, setEditingMaintenanceId] = useState<
    string | null
  >(null);
  const [maintenanceType, setMaintenanceType] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [filteredList, setFilteredList] = useState<Maintenance[]>(list);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    const currentMonth = DateTime.now().toFormat("yyyy-MM");
    setSelectedMonth(currentMonth); // Set the current month as default
    fetchAllRecordsByMonth({ yearMonth: currentMonth });
  }, [fetchAllRecordsByMonth]);

  useEffect(() => {
    const currentMonth = DateTime.now().toFormat("yyyy-MM");
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    applyFilterAndSort();
  }, [list, selectedMonth, sortOrder]);

  const applyFilterAndSort = () => {
    let temp = [...list];

    if (sortOrder) {
      temp.sort((a, b) => {
        if (a.amount < b.amount) return sortOrder === "asc" ? -1 : 1;
        if (a.amount > b.amount) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    // Calculate total amount
    const total = temp.reduce((sum, booking) => {
      return sum + parseFloat(booking.amount || "0");
    }, 0);

    setTotalAmount(total);
    setFilteredList(temp);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "asc") return "desc";
      if (prevOrder === "desc") return null;
      return "asc";
    });
  };
  const handleAddOrEditMaintenance = async () => {
    try {
      if (!validateForm()) return;

      if (editingMaintenanceId === null) {
        await create({
          type: maintenanceType,
          amount: amount,
          comments,
          hall_code: "PRAJNA",
        });
      } else {
        await update(editingMaintenanceId, {
          type: maintenanceType,
          amount: amount,
          comments,
        });
      }

      const currentMonth = DateTime.now().toFormat("yyyy-MM");
      setSelectedMonth(currentMonth); // Set the current month as default
      fetchAllRecordsByMonth({ yearMonth: currentMonth }); // Fetch records for the current month
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving maintenance record:", err);
      alert("Failed to save maintenance record. Please try again.");
    }
  };

  const handleEdit = (maintenanceId: string) => {
    const record = list.find((item) => item.$id === maintenanceId);
    if (record) {
      setEditingMaintenanceId(record.$id);
      setMaintenanceType(record.type);
      setAmount(record.amount.toString());
      setComments(record.comments);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (maintenanceId: string) => {
    if (
      window.confirm("Are you sure you want to delete this maintenance record?")
    ) {
      try {
        await remove(maintenanceId);
        const currentMonth = DateTime.now().toFormat("yyyy-MM");
        setSelectedMonth(currentMonth); // Set the current month as default
        fetchAllRecordsByMonth({ yearMonth: currentMonth }); // Fetch records for the current month
      } catch (err) {
        console.error("Error deleting maintenance record:", err);
        alert("Failed to delete maintenance record. Please try again.");
      }
    }
  };

  const validateForm = () => {
    if (!maintenanceType || !amount || isNaN(parseFloat(amount)) || !comments) {
      alert("All fields are required and amount must be a valid number.");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setEditingMaintenanceId(null);
    setMaintenanceType("");
    setAmount("");
    setComments("");
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center sm:text-left">
        Maintenance List
      </h1>

      {/* Add Maintenance and Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <span className="text-sm font-medium">
          Total Amount:{" "}
          <span className="font-bold text-green-600">
            ₹{totalAmount.toFixed(2)}
          </span>
        </span>

        <div className="flex gap-4 items-center">
          <select
            value={selectedMonth}
            onChange={(e) => {
              setSelectedMonth(e.target.value);
              fetchAllRecordsByMonth({ yearMonth: e.target.value });
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full sm:w-auto"
          >
            {Array.from({ length: 4 }, (_, i) => {
              const month = DateTime.now().minus({ months: i });
              return (
                <option key={i} value={month.toFormat("yyyy-MM")}>
                  {month.toFormat("MMMM yyyy")}
                </option>
              );
            })}
          </select>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white rounded-lg px-4 py-2 w-full sm:w-auto"
          >
            + Add Maintenance
          </button>
        </div>
      </div>

      {/* Error Handling */}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      {/* Maintenance Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2 text-left">Type</th>
              <th className="border border-gray-200 p-2 text-left">
                Amount
                <span
                  onClick={toggleSortOrder}
                  className="cursor-pointer ml-2 inline-block"
                >
                  {sortOrder === "asc" && <FaSortUp />}
                  {sortOrder === "desc" && <FaSortDown />}
                  {sortOrder === null && <FaSort />}
                </span>
              </th>
              <th className="border border-gray-200 p-2 text-left">Comments</th>
              <th className="border border-gray-200 p-2 text-left">Date</th>
              <th className="border border-gray-200 p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.$id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-2">{item.type}</td>
                <td className="border border-gray-200 p-2">₹{item.amount}</td>
                <td className="border border-gray-200 p-2">{item.comments}</td>
                <td className="border border-gray-200 p-2">
                  {DateTime.fromISO(item.$createdAt).toFormat("dd MMM yyyy")}
                </td>
                <td className="border border-gray-200 p-2 flex gap-2 justify-start">
                  <button
                    onClick={() => handleEdit(item.$id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item.$id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center">
              {editingMaintenanceId ? "Edit Maintenance" : "Add Maintenance"}
            </h2>
            <form>
              <select
                value={maintenanceType}
                onChange={(e) => setMaintenanceType(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
              >
                <option value="">Select Type</option>
                <option value="Rent">Rent</option>
                <option value="Maid">Maid</option>
                <option value="Water">Water</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Repair">Repair</option>
                <option value="Elecricity">Elecricity</option>
                <option value="Wifi">Wifi</option>
                <option value="Others">Others</option>
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
              />
              <textarea
                placeholder="Comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
              ></textarea>
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-300 rounded-lg px-4 py-2 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddOrEditMaintenance}
                  className="bg-blue-500 text-white rounded-lg px-4 py-2 w-full sm:w-auto"
                >
                  {editingMaintenanceId ? "Save Changes" : "Add Maintenance"}
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
