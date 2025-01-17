import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { SeatType, Status } from "../constants/enums";
import {
  addBulkSeats,
  addSeat,
  editSeat,
  deleteSeat,
  searchSeat,
  sortSeatsByStatus,
} from "../store/slice/seatsSlice";
import { RootState } from "../store/store";
import { FaEdit, FaTrash } from "react-icons/fa";

const Seats: React.FC = () => {
  const seats = useSelector((state: RootState) => state.seats.filteredSeats);
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeatId, setEditingSeatId] = useState<number | null>(null);

  const [seatNo, setSeatNo] = useState("");
  const [seatType, setSeatType] = useState<SeatType>(SeatType.AC);
  const [status, setStatus] = useState<Status>(Status.Available);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    dispatch(searchSeat(value));
  };

  const handleSortStatus = () => {
    const nextSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(nextSortOrder);
    dispatch(sortSeatsByStatus(nextSortOrder));
  };

  const handleAddOrEditSeat = () => {
    if (editingSeatId === null) {
      const newSeat = {
        id: seats.length + 1,
        seatNo,
        seatType,
        status,
      };
      dispatch(addSeat(newSeat));
    } else {
      dispatch(editSeat({ id: editingSeatId, seatNo, seatType, status }));
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (seatId: number) => {
    const seat = seats.find((s) => s.id === seatId);
    if (seat) {
      setEditingSeatId(seat.id);
      setSeatNo(seat.seatNo);
      setSeatType(seat.seatType);
      setStatus(seat.status);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (seatId: number) => {
    if (window.confirm("Are you sure you want to delete this seat?")) {
      dispatch(deleteSeat(seatId));
    }
  };

  const resetForm = () => {
    setEditingSeatId(null);
    setSeatNo("");
    setSeatType(SeatType.AC);
    setStatus(Status.Available);
  };

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const rows = text.split("\n").slice(1); // Skip headers
        const bulkSeats = rows
          .map((row, index) => {
            const [seatNo, seatType, status] = row.split(",");
            if (!seatNo || !seatType || !status) return null;
            return {
              id: seats.length + index + 1,
              seatNo: seatNo.trim(),
              seatType: seatType.trim() as SeatType,
              status: status.trim() as Status,
            };
          })
          .filter(Boolean) as {
          id: number;
          seatNo: string;
          seatType: SeatType;
          status: Status;
        }[];
        dispatch(addBulkSeats(bulkSeats));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search across all fields"
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none w-full sm:w-auto"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Add Seat Button */}
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white rounded-lg px-4 py-2"
          >
            + Add Seat
          </button>

          {/* Add Bulk Button */}
          <label className="bg-green-500 text-white rounded-lg px-4 py-2 cursor-pointer">
            Add Bulk
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleBulkUpload}
            />
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-200 p-2">ID</th>
              <th className="border border-gray-200 p-2">Seat No.</th>
              <th className="border border-gray-200 p-2">Seat Type</th>
              <th
                className="border border-gray-200 p-2 cursor-pointer hover:bg-gray-200"
                onClick={handleSortStatus}
              >
                Status{" "}
                {sortOrder === "asc" ? (
                  <span>&uarr;</span>
                ) : (
                  <span>&darr;</span>
                )}
              </th>
              <th className="border border-gray-200 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {seats.map((seat) => (
              <tr key={seat.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 p-2">{seat.id}</td>
                <td className="border border-gray-200 p-2">{seat.seatNo}</td>
                <td className="border border-gray-200 p-2">{seat.seatType}</td>
                <td className="border border-gray-200 p-2">{seat.status}</td>
                <td className="border border-gray-200 p-2 flex gap-4 justify-center items-center">
                  <FaEdit
                    onClick={() => handleEdit(seat.id)}
                    className="text-yellow-500 cursor-pointer text-lg"
                    title="Edit"
                  />
                  <FaTrash
                    onClick={() => handleDelete(seat.id)}
                    className="text-red-500 cursor-pointer text-lg"
                    title="Delete"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Seat */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-11/12 sm:w-1/3">
            <h2 className="text-lg font-bold mb-4">
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
              onChange={(e) => setSeatType(e.target.value as SeatType)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
            >
              {Object.values(SeatType).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
            >
              {Object.values(Status).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrEditSeat}
                className="bg-blue-500 text-white rounded-lg px-4 py-2"
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
