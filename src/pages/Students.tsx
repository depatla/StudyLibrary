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
import DialogBox from "../components/common/DialogBox";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getDaysDifference } from "./../components/student/StudentList";

type User = {
  name: string;
  phone: string;
  [key: string]: any;
};

const isUserFound = (users: User[], name: string, phone: string): boolean => {
  return users.some((user) => user.name === name && user.phone === phone);
};

const databaseId = process.env.REACT_APP_DATABASE_ID
  ? process.env.REACT_APP_DATABASE_ID
  : "676f62930015946e6bb5"; // Replace with your Appwrite database ID

const Students: React.FC = () => {
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dialog, setDialog] = useState<{
    message: string | null;
    type?: string;
  }>({ message: null, type: "Success" });

  const isFetched = useRef(false);

  useEffect(() => {
    if (!isFetched.current) {
      isFetched.current = true; // Prevent further calls
      students.fetchAll();
      seats.fetchAll();
    }
  }, [students, seats]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

  const handleFilter = (filterType: string) => {
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
    } else {
      setFilteredStudents(students.list);
    }
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
    setDialog({ message: `Message sent to: \n${selectedNumbers.join(", ")}` });
    setIsBulkWhatsAppOpen(false);
  };

  const handleAddStudent = async (newStudent: {
    name: string;
    email: string;
    phone: string;
    join_date: string;
  }) => {
    try {
      if (isUserFound(students.list, newStudent.name, newStudent.phone)) {
        setDialog({ type: "Warning", message: "Student already exists" });
        return false;
      }
      await students.create({ ...newStudent, hall_code: "PRAJNA" });
      setIsAddStudentOpen(false);
      setDialog({ message: "Student created sucessfully" });
    } catch (error) {
      console.error("Error during booking:", error);
      alert("An error occurred while creating the student. Please try again.");
    }
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
    comments?: string;
  }) => {
    try {
      await bookings.create({
        seat_id: bookingDetails.seatNo,
        from_date: bookingDetails.validFrom,
        to_date: bookingDetails.validTo,
        payment_type: bookingDetails.paymentType,
        amount: bookingDetails.amount,
        comment: bookingDetails.comments || "",
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
      setDialog({ message: "Booking successfully created!" });
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
        setDialog({ message: "Bulk upload successful!" });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownload = () => {
    const dataToExport = filteredStudents.map((student) => [
      student.name,
      student.phone,
      getDaysDifference(student.to_date),
    ]);

    // Initialize jsPDF
    const doc = new jsPDF();

    // Add a title
    doc.setFontSize(18);
    doc.text("Seats Data", 14, 22);

    // Define table columns
    const tableColumnHeaders = ["Student Name", "Phone", "Due Days"];

    // Add the table to the PDF
    autoTable(doc, {
      head: [tableColumnHeaders], // Table headers
      body: dataToExport, // Table rows
      startY: 30, // Start after the title
      theme: "grid", // Table style
    });

    // Save the PDF
    doc.save("Students.pdf");
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
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search students"
          value={searchTerm}
          onChange={handleSearch}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none w-full sm:w-auto text-base"
        />

        {/* Total Students */}
        <p className="text-lg font-semibold whitespace-nowrap">
          (Total Students {filteredStudents.length})
        </p>

        {/* Filter, Actions, and Download */}
        <div className="flex flex-wrap gap-4 justify-start sm:justify-end items-center">
          {/* Filter Dropdown */}
          <select
            onChange={(e) => handleFilter(e.target.value)}
            className="px-4 py-2 bg-white border rounded-md text-sm sm:text-base font-medium shadow-sm hover:bg-gray-100 focus:outline-none"
          >
            <option value="all">All</option>
            <option value="due">Payment Pending</option>
            <option value="paid">Payment Completed</option>
          </select>

          {/* Actions Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="px-4 py-2 bg-white border rounded-md text-sm sm:text-base font-medium shadow-sm hover:bg-gray-100"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
            >
              Actions ▾
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md p-2 text-sm z-50">
                <button
                  onClick={() => {
                    setIsAddStudentOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  Add Student
                </button>
                <button
                  onClick={() => {
                    setIsBulkUploadOpen(true);
                    setIsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  Bulk Upload
                </button>
                <button
                  onClick={() => {
                    handleSendWhatsApp();
                    setIsDropdownOpen(false);
                  }}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                >
                  Send WhatsApp
                </button>
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="bg-yellow-500 text-white rounded-lg px-4 py-2 w-full sm:w-auto"
          >
            Download
          </button>
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
          setTitle("Book");
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

      {/* Modals */}
      {isAddStudentOpen && (
        <AddStudent
          onClose={() => setIsAddStudentOpen(false)}
          onAdd={handleAddStudent}
        />
      )}

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

      {isBookSeatOpen && selectedStudent && (
        <BookSeat
          title={title}
          student={selectedStudent}
          onClose={() => setIsBookSeatOpen(false)}
          onSubmit={handleBookSeat}
        />
      )}

      {/* Success Dialog */}
      {dialog.message && (
        <DialogBox
          isOpen={true}
          title={dialog?.type || "Success"}
          message={dialog.message}
          onClose={() => setDialog({ message: null, type: "Success" })}
          confirmText="OK"
          type="success"
        />
      )}
    </div>
  );
};

export default Students;
