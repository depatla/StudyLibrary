// import React, { useState } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import * as XLSX from "xlsx"; // Correctly import XLSX
// import { RootState } from "../store/store";
// import {
//   addStudent,
//   deleteStudent,
//   searchStudent,
// } from "../store/slice/studentsSlice";
// import StudentList from "../components/student/StudentList";
// import AddStudent from "../components/student/AddStudent";
// import BookSeat from "../components/student/BookSeat";

// const Students: React.FC = () => {
//   const students = useSelector(
//     (state: RootState) => state.students.filteredStudents
//   );
//   const dispatch = useDispatch();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
//   const [isBookSeatOpen, setIsBookSeatOpen] = useState(false);
//   const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState<null | {
//     id: string;
//     name: string;
//   }>(null);

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     dispatch(searchStudent(value));
//   };

//   const handleAddStudent = (newStudent: {
//     _id: string;
//     name: string;
//     email: string;
//     phone_number: string;
//     registered_on: string;
//   }) => {
//     dispatch(addStudent(newStudent));
//     setIsAddStudentOpen(false);
//   };

//   const handleDeleteStudent = (studentId: string) => {
//     dispatch(deleteStudent(studentId));
//   };

//   const handleBookSeat = (bookingDetails: {
//     studentId: string;
//     seatNo: string;
//     validFrom: string;
//     validTo: string;
//     amount: string;
//   }) => {
//     console.log("Booking Details Submitted:", bookingDetails);
//     setIsBookSeatOpen(false);
//   };

//   const handleBulkUpload = (file: File) => {
//     const reader = new FileReader();

//     reader.onload = (e) => {
//       const data = e.target?.result;
//       if (data) {
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const students = XLSX.utils.sheet_to_json(sheet);
//         console.log(students);
//         // Dispatch each student from the parsed data
//         students.forEach((student: any) => {
//           const newStudent = {
//             _id: student.ID || "", // Replace 'ID' with actual column header in .xlsx
//             name: student.Name || "", // Replace 'Name' with actual column header in .xlsx
//             email: student.Email || "", // Replace 'Email' with actual column header in .xlsx
//             phone_number: student.Phone || "", // Replace 'Phone' with actual column header in .xlsx
//             registered_on: student.RegisteredOn || "", // Replace 'RegisteredOn' with actual column header in .xlsx
//           };
//           dispatch(addStudent(newStudent));
//         });

//         setIsBulkUploadOpen(false);
//         alert("Bulk upload successful!");
//       }
//     };

//     reader.readAsArrayBuffer(file);
//   };

//   return (
//     <div className="p-4">
//       {/* Search Input */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
//         <input
//           type="text"
//           placeholder="Search across all fields"
//           value={searchTerm}
//           onChange={handleSearch}
//           className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none w-full sm:w-auto"
//         />
//         <div className="flex gap-2">
//           <button
//             onClick={() => setIsAddStudentOpen(true)}
//             className="bg-blue-500 text-white rounded-lg px-4 py-2"
//           >
//             + Add Student
//           </button>
//           <button
//             onClick={() => setIsBulkUploadOpen(true)}
//             className="bg-green-500 text-white rounded-lg px-4 py-2"
//           >
//             Bulk Upload
//           </button>
//         </div>
//       </div>

//       {/* Student List */}
//       <StudentList
//         students={students}
//         onDelete={handleDeleteStudent}
//         onBook={(id, name) => {
//           setSelectedStudent({ id, name });
//           setIsBookSeatOpen(true);
//         }}
//       />

//       {/* Add Student Modal */}
//       {/* {isAddStudentOpen && (
//         <AddStudent
//           onClose={() => setIsAddStudentOpen(false)}
//           onAdd={handleAddStudent}
//         />
//       )} */}

//       {/* Bulk Upload Modal */}
//       {isBulkUploadOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
//           <div className="bg-white p-4 rounded-lg shadow-lg">
//             <h2 className="text-lg font-semibold mb-4">Bulk Upload Students</h2>
//             <input
//               type="file"
//               accept=".xlsx"
//               onChange={(e) =>
//                 e.target.files?.[0] && handleBulkUpload(e.target.files[0])
//               }
//               className="mb-4"
//             />
//             <button
//               onClick={() => setIsBulkUploadOpen(false)}
//               className="bg-red-500 text-white rounded-lg px-4 py-2"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Book Seat Modal */}
//       {isBookSeatOpen && selectedStudent && (
//         <BookSeat
//           student={selectedStudent}
//           onClose={() => setIsBookSeatOpen(false)}
//           onSubmit={handleBookSeat}
//         />
//       )}
//     </div>
//   );
// };

// export default Students;

import React from "react";

function Students_copy() {
  return <div>Students copy</div>;
}

export default Students_copy;
