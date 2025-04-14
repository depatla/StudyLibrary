import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import { useDatabase } from "./../../config/useDatabase";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import Loader from "../common/Loader";

interface Props {
  title: string;
  student: { id: string; name: string; seat: string };
  onClose: () => void;
  refresh: () => void;
}

const databaseId = process.env.REACT_APP_DATABASE_ID || "676f62930015946e6bb5";
const collectionId = process.env.REACT_APP_SEATS_ID || "6771ff5e001204850a2f";

const BookSeat: React.FC<Props> = ({ title, student, onClose, refresh }) => {
  const { username, studyhallId } = useSelector(
    (state: RootState) => state.user
  );
  const isFetched = useRef(false);
  const students = useDatabase(
    databaseId,
    process.env.REACT_APP_STUDENTS_ID
      ? process.env.REACT_APP_STUDENTS_ID
      : "67734d7e002ad7b37a2b"
  );
  const seats = useDatabase(
    databaseId,
    process.env.REACT_APP_SEATS_ID
      ? process.env.REACT_APP_SEATS_ID
      : "6771ff5e001204850a2f"
  );
  const bookings = useDatabase(
    databaseId,
    process.env.REACT_APP_BOOKINGS_ID
      ? process.env.REACT_APP_BOOKINGS_ID
      : "6775433b0022fae7ea28"
  );

  const [seatNo, setSeatNo] = useState<{ value: string; label: string } | null>(
    student.seat !== "" ? { value: student.seat, label: student.seat } : null
  );
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [months, setMonths] = useState(1);
  const [amount, setAmount] = useState("0");
  const [paymentType, setPaymentType] = useState<{
    value: string;
    label: string;
  } | null>({
    value: "UPI",
    label: "UPI",
  });
  const [comments, setComments] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingPreview, setBookingPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const { list, fetchAll, loading, error } = useDatabase(
    databaseId,
    collectionId
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);
  useEffect(() => {
    if (!isFetched.current) {
      isFetched.current = true; // Prevent further calls
      seats.fetchAll();
    }
  }, [seats]);

  useEffect(() => {
    if (validFrom && months) {
      const from = new Date(validFrom);
      const to = new Date(from);
      to.setMonth(to.getMonth() + months);
      to.setDate(to.getDate() - 1);
      setValidTo(to.toISOString().split("T")[0]);
    }
  }, [validFrom, months]);

  const seatOptions = list
    .filter(
      (seat) =>
        seat.status.toLowerCase() === "available" ||
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

  const handleVerify = () => {
    if (!seatNo || !validFrom || !amount || !paymentType) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    const perMonthAmount = (parseFloat(amount) / months).toFixed(2);
    const bookings = [];
    let startDate = new Date(validFrom);

    for (let i = 0; i < months; i++) {
      const from = new Date(startDate);
      const to = new Date(from);
      to.setMonth(to.getMonth() + 1);
      to.setDate(to.getDate() - 1);

      bookings.push({
        month: from.toLocaleString("default", { month: "short" }),
        seatNo: seatNo.value,
        fromDate: from.toISOString().split("T")[0],
        amount: `${perMonthAmount}`,
      });

      startDate.setMonth(startDate.getMonth() + 1);
    }

    setBookingPreview(bookings);
    setShowPreview(true);
  };
  const updateSeat = async (status: string, seatNo: string) => {
    // Update seat status
    const seatToUpdate = seats.list.find((seat) => seat.seat_no === seatNo);

    if (seatToUpdate) {
      await seats.update(seatToUpdate.$id, { status });
    } else {
      console.error("Seat not found.");
    }
  };
  const handleBookSeat = async () => {
    if (!seatNo || !validFrom || !paymentType || !amount) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const perMonthAmount = Math.round(parseFloat(amount) / months);
      const bookingList = [];
      let startDate = new Date(validFrom);

      for (let i = 0; i < months; i++) {
        const from = new Date(startDate);
        const to = new Date(from);
        to.setMonth(to.getMonth() + 1);
        to.setDate(to.getDate() - 1);

        bookingList.push({
          studentId: student.id,
          seat: seatNo.value,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
          paymentType: paymentType.value,
          amount: perMonthAmount.toString(),
          comment: comments.trim() || "",
          studentName: student.name,
          receivedBy: username,
          createdBy: username,
          studyhallId: studyhallId,
        });

        startDate.setMonth(startDate.getMonth() + 1);
      }

      // 1. Create multiple bookings
      for (const booking of bookingList) {
        await bookings.create(booking);
      }

      // 2. Update student
      await students.update(student.id, {
        seat: seatNo.value,
        validFrom: bookingList[0].from,
        validTo: bookingList[bookingList.length - 1].to,
      });

      // // 3. Update seat status
      // if (changeSeat !== "") {
      //   await updateSeat("Available", changeSeat);
      // }
      await updateSeat("Occupied", seatNo.value);

      // 4. Success
      setShowPreview(false);
      onClose();
      refresh();
      alert("Booking successfully created!");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to create booking. Please try again.");
    }
  };

  const handleChangeSeat = async () => {
    // Update student with seat ID
    await students.update(student.id, {
      seat: seatNo?.value,
    });
    await updateSeat("Available", student.seat);

    seatNo && (await updateSeat("Occupied", seatNo?.value));
    onClose();
    refresh();
  };

  // Conditional rendering based on loading states
  if (students.loading || seats.loading || bookings.loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
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
        {title !== "Change" ? (
          <>
            {/* Months Dropdown */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Months</label>
              <select
                className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                value={months}
                onChange={(e) => setMonths(parseInt(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} Month{num > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

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
              disabled
              className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4 bg-gray-100 cursor-not-allowed"
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
            {errorMessage && (
              <p className="text-red-500 mb-4">{errorMessage}</p>
            )}
          </>
        ) : (
          ""
        )}
        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 rounded-lg px-4 py-2"
          >
            Cancel
          </button>
          {title !== "Change" ? (
            <button
              onClick={handleVerify}
              className="bg-blue-500 text-white rounded-lg px-4 py-2"
            >
              Verify
            </button>
          ) : (
            <button
              onClick={handleChangeSeat}
              className="bg-black text-white rounded-lg px-4 py-2"
            >
              Change Seat
            </button>
          )}
        </div>
      </div>

      {/* Preview Popup */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">
              Please confirm your bookings below
            </h2>
            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="border-b font-medium">
                  <th className="text-left py-2">Month</th>
                  <th className="text-left py-2">Seat No.</th>
                  <th className="text-left py-2">From Date</th>
                  <th className="text-left py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookingPreview.map((booking, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2">{booking.month}</td>
                    <td className="py-2">{booking.seatNo}</td>
                    <td className="py-2">{booking.fromDate}</td>
                    <td className="py-2">{booking.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-gray-300 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleBookSeat}
                className="bg-black text-white rounded-lg px-4 py-2"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSeat;
