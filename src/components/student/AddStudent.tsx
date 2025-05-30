import React, { useState } from "react";
import { UpdateUser } from "../../pages/Students";

interface Props {
  onClose: () => void;
  onAdd: (student: { name: string; mobile: string }) => void;
  onUpdate: (student: { $id: string; name: string; mobile: string }) => void;
  studentData: UpdateUser | null;
}

const AddStudent: React.FC<Props> = ({
  onClose,
  onAdd,
  studentData,
  onUpdate,
}) => {
  const [name, setName] = useState(studentData?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(studentData?.mobile || "");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }
    setError("");
    const student = {
      name,
      mobile: phoneNumber,
    };
    if (studentData && studentData?.$id) {
      const updateStudent = { $id: studentData.$id, ...student };
      onUpdate(updateStudent);
      return;
    }
    onAdd(student);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-11/12 sm:w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">
          {studentData && studentData.$id ? "Update" : "Add"} Student
        </h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-2"
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-gray-300 rounded-lg px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="bg-blue-500 text-white rounded-lg px-4 py-2"
          >
            {studentData && studentData.$id ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
