import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useDatabase } from "./../../config/useDatabase"; // Adjust the path to your hook

interface Props {
  title: string;
  student: { id: string; name: string; seat: string };
  onClose: () => void;
  onSubmit: (bookingDetails: {
    studentId: string;
    studentName: string;
    seatNo: string;
    validFrom: string;
    validTo: string;
    amount: string;
    paymentType: string;
    comments?: string; // Optional comments field
  }) => void;
}
const databaseId = process.env.REACT_APP_DATABASE_ID
  ? process.env.REACT_APP_DATABASE_ID
  : ""; // Replace with your Appwrite database ID
const collectionId = process.env.REACT_APP_SEATS_ID
  ? process.env.REACT_APP_SEATS_ID
  : ""; // Replace with your Appwrite collection ID

const BookSeat: React.FC<Props> = ({ title, student, onClose, onSubmit }) => {
  const [seatNo, setSeatNo] = useState<{ value: string; label: string } | null>(
    student.seat !== "" ? { value: student.seat, label: student.seat } : null
  );
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [amount, setAmount] = useState("0");
  const [paymentType, setPaymentType] = useState<{
    value: string;
    label: string;
  } | null>({ value: "UPI", label: "UPI" });
  const [comments, setComments] = useState(""); // New optional field for comments
  const [errorMessage, setErrorMessage] = useState(""); // State to store error messages

  // Hook for fetching seats
  const { list, fetchAll, loading, error } = useDatabase(
    databaseId,
    collectionId
  );

  // Fetch available seats on mount
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Transform fetched seats into select options
  const seatOptions = list
    .filter(
      (seat) =>
        seat.status.toLowerCase() === "Available".toLowerCase() ||
        seat.seat_no === student.seat
    )
    .map((seat) => ({
      value: seat.seat_no,
      label: `${seat.seat_no} - (${seat.seat_type})`,
    }));

  const paymentOptions = [
    { value: "UPI", label: "UPI" },
    { value: "Cash", label: "Cash" },
  ];

  const handleSubmit = () => {
    // Validate all mandatory fields
    if (!seatNo) {
      setErrorMessage("Please select a seat.");
      return;
    }
    if (!validFrom) {
      setErrorMessage("Please select a valid 'From' date.");
      return;
    }
    if (!validTo) {
      setErrorMessage("Please select a valid 'To' date.");
      return;
    }
    if (new Date(validFrom) > new Date(validTo)) {
      setErrorMessage("'To' date must be the same or after the 'From' date.");
      return;
    }
    if (!amount) {
      setErrorMessage("Please enter the amount.");
      return;
    }
    if (!paymentType) {
      setErrorMessage("Please select a payment type.");
      return;
    }

    setErrorMessage(""); // Clear any previous error messages
    onSubmit({
      studentId: student.id,
      studentName: student.name,
      seatNo: seatNo.value,
      validFrom,
      validTo,
      amount,
      paymentType: paymentType.value,
      comments: comments.trim() || undefined, // Pass comments only if not empty
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-11/12 sm:w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">
          {title} Seat for {student.name}
        </h2>
        {/* Seat Selection */}
        {loading ? (
          <p>Loading seats...</p>
        ) : error ? (
          <p className="text-red-500">Failed to load seats: {error}</p>
        ) : (
          <Select
            options={seatOptions}
            value={seatNo}
            onChange={(selectedOption) => setSeatNo(selectedOption)}
            placeholder="Select Seat"
            className="mb-4"
          />
        )}

        {/* Valid From */}
        <input
          type="date"
          placeholder="Valid From"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />

        {/* Valid To */}
        <input
          type="date"
          placeholder="Valid To"
          value={validTo}
          onChange={(e) => setValidTo(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />

        {/* Amount */}
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />

        {/* Payment Type */}
        <Select
          options={paymentOptions}
          value={paymentType}
          onChange={(selectedOption) => setPaymentType(selectedOption)}
          placeholder="Select Payment Type"
          className="mb-4"
        />

        {/* Comments */}
        <textarea
          placeholder="Add a comment (optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />

        {/* Error Message */}
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 rounded-lg px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white rounded-lg px-4 py-2"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSeat;
