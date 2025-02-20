import React from "react";
import { FaTrash } from "react-icons/fa";

interface Student {
  $id: string;
  name: string;
  email: string;
  phone: string;
  join_date: string;
  seat_id?: string;
  from_date?: string;
  to_date?: string;
}

interface Props {
  students: Student[];
  onDelete: (id: string, seat: string) => void;
  onBook: (id: string, name: string, seat: string) => void;
  onchangeSeat: (id: string, name: string, seat: string) => void;
  onSelectStudents: (selected: string[]) => void;
}

const StudentList: React.FC<Props> = ({
  students,
  onDelete,
  onBook,
  onchangeSeat,
  onSelectStudents,
}) => {
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);

  const isCurrentDateInRange = (fromDate?: string, toDate?: string) => {
    if (!fromDate || !toDate) return false;
    const today = new Date();
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return today >= from && today <= to;
  };

  const isPastDate = (toDate?: string) => {
    if (!toDate) return false;
    const today = new Date();
    const to = new Date(toDate);
    return to < today;
  };

  const handleCheckboxChange = (id: string) => {
    const updatedSelected = selectedStudents.includes(id)
      ? selectedStudents.filter((studentId) => studentId !== id)
      : [...selectedStudents, id];

    setSelectedStudents(updatedSelected);
    onSelectStudents(updatedSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const allStudentIds = students.map((student) => student.$id);
    const updatedSelected = checked ? allStudentIds : [];
    setSelectedStudents(updatedSelected);
    onSelectStudents(updatedSelected);
  };

  return (
    <div className="overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <table className="w-full border-collapse border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-200 p-2 text-left">
              <input
                type="checkbox"
                onChange={(e) => handleSelectAll(e.target.checked)}
                checked={
                  selectedStudents.length === students.length &&
                  students.length > 0
                }
                className="cursor-pointer"
              />
            </th>
            <th className="border border-gray-200 p-2 text-left">Name</th>
            <th className="border border-gray-200 p-2 text-left">Phone</th>
            <th className="border border-gray-200 p-2 text-left">Seat</th>
            <th className="border border-gray-200 p-2 text-left hidden md:table-cell">
              From
            </th>
            <th className="border border-gray-200 p-2 text-left hidden md:table-cell">
              To
            </th>
            <th className="border border-gray-200 p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.$id}
              className={`hover:bg-gray-50 ${
                isPastDate(student.to_date) ? "bg-red-100" : ""
              }`}
            >
              <td className="border border-gray-200 p-2 text-center">
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(student.$id)}
                  checked={selectedStudents.includes(student.$id)}
                  className="cursor-pointer"
                />
              </td>
              <td className="border border-gray-200 p-2">{student.name}</td>
              <td className="border border-gray-200 p-2">{student.phone}</td>
              <td className="border border-gray-200 p-2">{student?.seat_id}</td>
              <td className="border border-gray-200 p-2 hidden md:table-cell">
                {student.from_date &&
                  new Date(student.from_date).toLocaleDateString()}
              </td>
              <td className="border border-gray-200 p-2 hidden md:table-cell">
                {student.to_date &&
                  new Date(student.to_date).toLocaleDateString()}
              </td>
              <td className="border border-gray-200 p-2 flex flex-wrap gap-2 justify-center items-center">
                {isCurrentDateInRange(student.from_date, student.to_date) ? (
                  <button
                    onClick={() =>
                      onchangeSeat(
                        student.$id,
                        student.name,
                        student.seat_id || ""
                      )
                    }
                    className="bg-blue-500 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    Change Seat
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      onBook(student.$id, student.name, student.seat_id || "")
                    }
                    className="bg-green-500 text-white rounded-lg px-3 py-1 text-sm"
                  >
                    Book Seat
                  </button>
                )}
                <FaTrash
                  onClick={() => onDelete(student.$id, student.seat_id || "")}
                  className="text-red-500 cursor-pointer text-lg"
                  title="Delete"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentList;
