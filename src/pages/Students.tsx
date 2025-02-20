import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx"; // For Excel file handling
import { DateTime } from "luxon"; // For date handling
import { useDatabase } from "./../config/useDatabase"; // Your custom database hook
import AddStudent from "../components/student/AddStudent";
import BookSeat from "../components/student/BookSeat";
import StudentList from "../components/student/StudentList";
import { RootState } from "../store/store";
import { useSelector } from "react-redux";
import Loader from "../components/common/Loader";

const databaseId = process.env.REACT_APP_DATABASE_ID
  ? process.env.REACT_APP_DATABASE_ID
  : "676f62930015946e6bb5"; // Replace with your Appwrite database ID

const Students: React.FC = () => {
  const students = useDatabase(
    databaseId,
    process.env.REACT_APP_STUDENTS_ID ? process.env.REACT_APP_STUDENTS_ID : "67734d7e002ad7b37a2b"
  );
  const seats = useDatabase(
    databaseId,
    process.env.REACT_APP_SEATS_ID ? process.env.REACT_APP_SEATS_ID : "6771ff5e001204850a2f"
  );
  const bookings = useDatabase(
    databaseId,
    process.env.REACT_APP_BOOKINGS_ID ? process.env.REACT_APP_BOOKINGS_ID : "6775433b0022fae7ea28"
  );

  const username = useSelector((state: RootState) => state.user.username);

  const [searchTerm, setSearchTerm] = useState("");
  const [title, setTitle] = useState<string>("Book");
  const [changeSeat, setChangeSeat] = useState<string>("");
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isBookSeatOpen, setIsBookSeatOpen] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [isBulkWhatsAppOpen, setIsBulkWhatsAppOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<null | {
    id: string;
    name: string;
    seat: string;
  }>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const isFetched = useRef(false);

  useEffect(() => {
    if (!isFetched.current) {
      isFetched.current = true; // Prevent further calls
      students.fetchAll();
      seats.fetchAll();
    }
  }, [students, seats]);

  useEffect(() => {
    const filtered = students.list.filter((student) =>
      Object.values(student)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students.list, searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (filterType: "due" | "paid") => {
    const now = DateTime.now();

    if (filterType === "due") {
      const filtered = students.list.filter((student) => {
        const toDate = DateTime.fromISO(student.to_date);
        return toDate < now;
      });
      setFilteredStudents(filtered);
    } else if (filterType === "paid") {
      const filtered = students.list.filter((student) => {
        const fromDate = DateTime.fromISO(student.from_date);
        const toDate = DateTime.fromISO(student.to_date);
        return fromDate <= now && now <= toDate;
      });
      setFilteredStudents(filtered);
    }

    setIsFilterDropdownOpen(false);
    setIsDropdownOpen(false);
  };

  const handleSendWhatsApp = () => {
    setIsBulkWhatsAppOpen(true);
     setIsDropdownOpen(false);
  };

  const handleSendMessage = () => {
    const selectedNumbers = students.list
      .filter((student) => selectedStudents.includes(student.$id))
      .map((student) => student.phone);

    console.log("Sending WhatsApp message:", {
      message,
      numbers: selectedNumbers,
    });

    alert(`Message sent to: \n${selectedNumbers.join(", ")}`);
    setIsBulkWhatsAppOpen(false);
  };

  const handleAddStudent = async (newStudent: {
    name: string;
    email: string;
    phone: string;
    join_date: string;
  }) => {
    await students.create({ ...newStudent, hall_code: "PRAJNA" });
    setIsAddStudentOpen(false);
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

  const handleBookSeat = async (bookingDetails: {
    studentId: string;
    studentName: string;
    seatNo: string;
    validFrom: string;
    validTo: string;
    amount: string;
    paymentType: string;
    comment?: string;
  }) => {
    try {
      await bookings.create({
        seat_id: bookingDetails.seatNo,
        from_date: bookingDetails.validFrom,
        to_date: bookingDetails.validTo,
        payment_type: bookingDetails.paymentType,
        amount: bookingDetails.amount,
        comment: bookingDetails.comment || "",
        student_name: bookingDetails.studentName,
        received_by: username,
        hall_code: "PRAJNA",
      });

      // Update student with seat ID
      await students.update(bookingDetails.studentId, {
        seat_id: bookingDetails.seatNo,
        from_date: bookingDetails.validFrom,
        to_date: bookingDetails.validTo,
      });

      if (changeSeat !== "") {
        await updateSeat("Available", changeSeat);
      }

      await updateSeat("Occupied", bookingDetails.seatNo);

      setIsBookSeatOpen(false);
      alert("Booking successfully created!");
    } catch (error) {
      console.error("Error during booking:", error);
      alert("An error occurred while creating the booking. Please try again.");
    }
  };

  const handleBulkUpload = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = e.target?.result;
      if (data) {
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const studentsData: any[] = XLSX.utils.sheet_to_json(sheet);

        for (const student of studentsData) {
          const newStudent = {
            name: student.Name.toString() || "",
            email: "",
            phone: student.Phone.toString() || "",
            join_date: student.RegisteredOn.toString() || "",
            hall_code: "PRAJNA",
          };
          await students.create(newStudent);
        }

        setIsBulkUploadOpen(false);
        alert("Bulk upload successful!");
      }
    };

    reader.readAsArrayBuffer(file);
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
    <div className="p-4">
      {/* Search Input */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
        <input
          type="text"
          placeholder="Search students"
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none w-full sm:w-auto"
        />

        {/* Dropdowns Row */}
        <div className="flex gap-4 flex-wrap justify-start sm:justify-end">
          {/* Filter Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsDropdownOpen(false);
              }}
            >
              Filter
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm-4 3a1 1 0 100 2h8a1 1 0 100-2H6zm-2 3a1 1 0 100 2h12a1 1 0 100-2H4zm2 3a1 1 0 100 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isFilterDropdownOpen && (
              <div
                className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-auto max-h-60 z-50"
                role="menu"
              >
                <div className="py-1" role="none">
                  <button
                    onClick={() => handleFilter("due")}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                  >
                    Due Amount
                  </button>
                  <button
                    onClick={() => handleFilter("paid")}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                  >
                    Complete
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setIsFilterDropdownOpen(false);
              }}
            >
              Actions
              <svg
                className="-mr-1 ml-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm-4 3a1 1 0 100 2h8a1 1 0 100-2H6zm-2 3a1 1 0 100 2h12a1 1 0 100-2H4zm2 3a1 1 0 100 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div
                className="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                role="menu"
              >
                <button
  onClick={() => {
    setIsAddStudentOpen(true);
    setIsDropdownOpen(false);
  }}
  className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
>
  Add Student
</button>
                  <button
                    onClick={() => {
                      setIsBulkUploadOpen(true); 
                      setIsDropdownOpen(false);
                    }}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                  >
                    Bulk Upload
                  </button>
                  <button
                    onClick={handleSendWhatsApp}
                    className="text-gray-700 block px-4 py-2 text-sm w-full text-left hover:bg-gray-100"
                  >
                    Send WhatsApp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Student List */}
      <StudentList
        students={filteredStudents}
        onDelete={async (id, seat) => {
          if (seat !== "") {
            await updateSeat("Available", seat);
          }
          students.remove(id);
        }}
        onBook={(id, name, seat) => {
          setChangeSeat("");
          setSelectedStudent({ id, name, seat });
          setIsBookSeatOpen(true);
        }}
        onchangeSeat={async (id, name, seat) => {
          setChangeSeat(seat);
          setTitle("Change");
          setSelectedStudent({ id, name, seat });
          setIsBookSeatOpen(true);
        }}
        onSelectStudents={(selected) => setSelectedStudents(selected)}
      />

      {/* Add Student Modal */}
      {isAddStudentOpen && (
        <AddStudent
          onClose={() => setIsAddStudentOpen(false)}
          onAdd={handleAddStudent}
        />
      )}

      {/* Bulk Upload Modal */}
      {isBulkUploadOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full sm:max-w-md">
            <h2 className="text-lg font-semibold mb-4">Bulk Upload Students</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) =>
                e.target.files?.[0] && handleBulkUpload(e.target.files[0])
              }
              className="mb-4 w-full border border-gray-300 rounded-lg px-4 py-2"
            />
            <button
              onClick={() => setIsBulkUploadOpen(false)}
              className="bg-gray-300 rounded-lg px-4 py-2 w-full sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Bulk WhatsApp Modal */}
      {isBulkWhatsAppOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 p-4">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full sm:max-w-md">
            <h2 className="text-lg font-semibold mb-4">
              Send WhatsApp Message
            </h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message here"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"
              rows={5}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsBulkWhatsAppOpen(false)}
                className="bg-gray-300 rounded-lg px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                className="bg-green-500 text-white rounded-lg px-4 py-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Seat Modal */}
      {isBookSeatOpen && selectedStudent && (
        <BookSeat
          title={title}
          student={selectedStudent}
          onClose={() => setIsBookSeatOpen(false)}
          onSubmit={handleBookSeat}
        />
      )}
    </div>
  );
};

export default Students;
