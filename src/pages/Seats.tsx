import React, { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import * as XLSX from "xlsx";
import { useDatabase } from "./../config/useDatabase";

const databaseId = "676f62930015946e6bb5"; // Replace with your Appwrite database ID
const collectionId = "6771ff5e001204850a2f"; // Replace with your Appwrite collection ID

const Seats: React.FC = () => {
  const { list, fetchAll, create, update, remove, loading, error } =
    useDatabase(databaseId, collectionId);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeatId, setEditingSeatId] = useState<string | null>(null);
  const [seatNo, setSeatNo] = useState("");
  const [seatType, setSeatType] = useState("AC");
  const [status, setStatus] = useState("Available");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [sortedList, setSortedList] = useState(list);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    handleSort("status", sortOrder);
  }, [list, sortOrder]);

  const handleAddOrEditSeat = async () => {
    if (editingSeatId === null) {
      await create({ seat_no: seatNo, seat_type: seatType, status });
    } else {
      await update(editingSeatId, {
        seat_no: seatNo,
        seat_type: seatType,
        status,
      });
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (seatId: string) => {
    const seat = list.find((s) => s.$id === seatId);
    if (seat) {
      setEditingSeatId(seat.$id);
      setSeatNo(seat.seat_no);
      setSeatType(seat.seat_type);
      setStatus(seat.status);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (seatId: string) => {
    if (window.confirm("Are you sure you want to delete this seat?")) {
      await remove(seatId);
    }
  };

  const handleBulkUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const binaryStr = e.target?.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        const bulkSeats = (data as any[]).map((row) => ({
          seat_no: row["seat_no"],
          seat_type: row["seat_type"],
          status: row["status"],
        }));

        bulkSeats.forEach(async (seat) => {
          await create(seat);
        });
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleSort = (key: string, order: "asc" | "desc" | null) => {
    if (order === null) {
      setSortedList(list); // Reset to original list if no sort order
      return;
    }

    const sorted = [...list].sort((a, b) => {
      if (a[key] < b[key]) return order === "asc" ? -1 : 1;
      if (a[key] > b[key]) return order === "asc" ? 1 : -1;
      return 0;
    });

    setSortedList(sorted);
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => {
      if (prevOrder === "asc") return "desc";
      if (prevOrder === "desc") return null;
      return "asc";
    });
  };

  const resetForm = () => {
    setEditingSeatId(null);
    setSeatNo("");
    setSeatType("AC");
    setStatus("available");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-center sm:text-left">
        Seats Management
      </h1>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white rounded-lg px-4 py-2 w-full sm:w-auto"
        >
          + Add Seat
        </button>

        <label className="bg-green-500 text-white rounded-lg px-4 py-2 w-full sm:w-auto cursor-pointer text-center">
          Add Bulk
          <input
            type="file"
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleBulkUpload}
          />
        </label>
      </div>

      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">Error: {error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead>
            <tr className="bg-gray-100">
              {/* <th className="border border-gray-200 p-2 hidden md:table-cell">
                ID
              </th> */}
              <th className="border border-gray-200 p-2">Seat No.</th>
              <th className="border border-gray-200 p-2">Seat Type</th>
              <th
                className="border border-gray-200 p-2 cursor-pointer flex items-center justify-center gap-2"
                onClick={toggleSortOrder}
              >
                Status
                {sortOrder === "asc" && <FaSortUp />}
                {sortOrder === "desc" && <FaSortDown />}
                {sortOrder === null && <FaSort />}
              </th>
              <th className="border border-gray-200 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedList.map((seat) => (
              <tr key={seat.$id} className="hover:bg-gray-50">
                {/* <td className="border border-gray-200 p-2 hidden md:table-cell">
                  {seat.$id}
                </td> */}
                <td className="border border-gray-200 p-2">{seat.seat_no}</td>
                <td className="border border-gray-200 p-2">{seat.seat_type}</td>
                <td className="border border-gray-200 p-2">{seat.status}</td>
                <td className="border border-gray-200 p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => handleEdit(seat.$id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(seat.$id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-center">
              {editingSeatId ? "Edit Seat" : "Add Seat"}
            </h2>
            <input
              type="text"
              placeholder="Seat No."
              value={seatNo}
              onChange={(e) => setSeatNo(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
            />
            <select
              value={seatType}
              onChange={(e) => setSeatType(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
            >
              <option value="AC">AC</option>
              <option value="NON_AC">Non-AC</option>
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
            </select>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 rounded-lg px-4 py-2 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditSeat}
                className="bg-blue-500 text-white rounded-lg px-4 py-2 w-full sm:w-auto"
              >
                {editingSeatId ? "Save Changes" : "Add Seat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Seats;
