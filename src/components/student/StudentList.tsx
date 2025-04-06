import React, { useEffect, useRef, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { MdEventAvailable, MdSwapHoriz } from "react-icons/md";
import DialogBox from "../common/DialogBox";
import { DateTime } from "luxon";
import { UpdateUser } from "../../pages/Students";

interface Student {
  $id: string;
  name: string;
  mobile: string;
  seat?: string;
  validFrom?: string;
  validTo?: string;
}

interface Props {
  students: Student[];
  onDelete: (id: string, seat: string) => void;
  onBook: (id: string, name: string, seat: string) => void;
  onchangeSeat: (id: string, name: string, seat: string) => void;
  onSelectStudents: (selected: string[]) => void;
  onEditStudent: (student: UpdateUser) => void;
}

const getDaysDifference = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const inputDate = DateTime.fromISO(dateStr);
  const diff = inputDate.diff(DateTime.now(), "days").days;
  return Math.floor(diff);
};

const isCurrentDateInRange = (fromDate?: string, toDate?: string) => {
  if (!fromDate || !toDate) return false;
  const today = new Date();
  return today >= new Date(fromDate) && today <= new Date(toDate);
};

const isPastDate = (toDate?: string) => {
  if (!toDate) return false;
  return new Date(toDate) < new Date();
};

const StudentList: React.FC<Props> = ({
  students,
  onDelete,
  onBook,
  onchangeSeat,
  onSelectStudents,
  onEditStudent,
}) => {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dialog, setDialog] = useState<{
    id?: string;
    seatId?: string;
    name?: string;
    type: "confirm" | "success";
  } | null>(null);
  const [menuStudentId, setMenuStudentId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMenuStudentId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCheckboxChange = (id: string) => {
    const updatedSelected = selectedStudents.includes(id)
      ? selectedStudents.filter((studentId) => studentId !== id)
      : [...selectedStudents, id];
    setSelectedStudents(updatedSelected);
    onSelectStudents(updatedSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    const allIds = checked ? students.map((s) => s.$id) : [];
    setSelectedStudents(allIds);
    onSelectStudents(allIds);
  };

  const confirmDelete = () => {
    if (dialog?.id) {
      onDelete(dialog.id, dialog.seatId || "");
      setDialog({ type: "success" });
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-auto h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <table className="w-full border-collapse border border-gray-200 text-sm min-w-[600px]">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">
              <input
                type="checkbox"
                checked={
                  selectedStudents.length === students.length &&
                  students.length > 0
                }
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </th>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2 text-left">Seat</th>
            <th className="border p-2 text-left hidden md:table-cell">From</th>
            <th className="border p-2 text-left hidden md:table-cell">To</th>
            <th className="border p-2 text-left hidden md:table-cell">
              Due Days
            </th>
            <th className="border p-2 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr
              key={student.$id}
              className={`hover:bg-gray-50 ${
                isPastDate(student.validTo) ? "bg-red-100" : ""
              }`}
            >
              <td className="border p-2 text-center">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.$id)}
                  onChange={() => handleCheckboxChange(student.$id)}
                />
              </td>
              <td className="border p-2">{student.name}</td>
              <td className="border p-2">{student.mobile}</td>
              <td className="border p-2">{student.seat}</td>
              <td className="border p-2 hidden md:table-cell">
                {student.validFrom &&
                  DateTime.fromISO(student.validFrom).toFormat("dd-MMM-yyyy")}
              </td>
              <td className="border p-2 hidden md:table-cell">
                {student.validTo &&
                  DateTime.fromISO(student.validTo).toFormat("dd-MMM-yyyy")}
              </td>
              <td className="border p-2 hidden md:table-cell">
                {getDaysDifference(student.validTo)}
              </td>
              <td className="relative border p-2 text-right">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuStudentId(
                      menuStudentId === student.$id ? null : student.$id
                    );
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <HiDotsVertical />
                </button>

                {menuStudentId === student.$id && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-10 bg-white border shadow-md rounded-md z-50 w-44 text-sm"
                  >
                    {isCurrentDateInRange(
                      student.validFrom,
                      student.validTo
                    ) ? (
                      <button
                        onClick={() => {
                          onchangeSeat(
                            student.$id,
                            student.name,
                            student.seat || ""
                          );
                          setMenuStudentId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <MdSwapHoriz className="text-blue-500" />
                        Change
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          onBook(student.$id, student.name, student.seat || "");
                          setMenuStudentId(null);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <MdEventAvailable className="text-green-600" />
                        Book
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onEditStudent({
                          $id: student.$id,
                          name: student.name,
                          mobile: student.mobile,
                        });
                        setMenuStudentId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaEdit className="text-yellow-500" />
                      Edit
                    </button>

                    <button
                      onClick={() => {
                        setDialog({
                          id: student.$id,
                          name: student.name,
                          seatId: student.seat || "",
                          type: "confirm",
                        });
                        setMenuStudentId(null);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <FaTrash className="text-red-500" />
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {dialog?.type === "confirm" && (
        <DialogBox
          isOpen={true}
          title="Confirm Delete"
          message={`Are you sure you want to delete ${dialog.name}?`}
          onClose={() => setDialog(null)}
          onConfirm={confirmDelete}
          confirmText="Delete"
          cancelText="Cancel"
          type="confirm"
        />
      )}
    </div>
  );
};

export default StudentList;
