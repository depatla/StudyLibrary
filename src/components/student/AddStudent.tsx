import React, { useState } from "react";

interface Props {
  onClose: () => void;
  onAdd: (student: {
    name: string;
    email: string;
    phone: string;
    join_date: string;
  }) => void;
}

const AddStudent: React.FC<Props> = ({ onClose, onAdd }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [registeredOn, setRegisteredOn] = useState(
    new Date().toISOString().split("T")[0]
  );

  const handleAdd = () => {
    const newStudent = {
      name,
      email,
      phone: phoneNumber,
      join_date: registeredOn,
    };
    onAdd(newStudent);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-11/12 sm:w-full max-w-lg">
        <h2 className="text-lg font-bold mb-4">Add Student</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />
        <input
          type="date"
          value={registeredOn}
          onChange={(e) => setRegisteredOn(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full mb-4"
        />
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
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
