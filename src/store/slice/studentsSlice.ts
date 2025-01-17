import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SeatBooking {
  seat_no: string;
  valid_from: string;
  valid_to: string;
  amount: string;
}

interface Student {
  _id: string;
  name: string;
  email: string;
  phone_number: string;
  registered_on: string;
  seat_booking?: SeatBooking;
}

interface StudentsState {
  students: Student[];
  filteredStudents: Student[];
}

const initialState: StudentsState = {
  students: [
    {
      _id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone_number: "1234567890",
      registered_on: "2023-01-01",
      seat_booking: {
        seat_no: "A1",
        valid_from: "2023-01-01",
        valid_to: "2023-12-31",
        amount: "1000",
      },
    },
  ],
  filteredStudents: [],
};

const studentsSlice = createSlice({
  name: "students",
  initialState: {
    ...initialState,
    filteredStudents: initialState.students, // Initialize filtered list
  },
  reducers: {
    addStudent: (state, action: PayloadAction<Student>) => {
      state.students.push(action.payload);
      state.filteredStudents = state.students; // Update filtered list
    },
    editStudent: (state, action: PayloadAction<Student>) => {
      const index = state.students.findIndex(
        (s) => s._id === action.payload._id
      );
      if (index !== -1) {
        state.students[index] = action.payload;
        state.filteredStudents = state.students; // Update filtered list
      }
    },
    deleteStudent: (state, action: PayloadAction<string>) => {
      state.students = state.students.filter((s) => s._id !== action.payload);
      state.filteredStudents = state.students; // Update filtered list
    },
    searchStudent: (state, action: PayloadAction<string>) => {
      const term = action.payload.toLowerCase();
      state.filteredStudents = state.students.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          student.phone_number.includes(term) ||
          student.registered_on.includes(term) ||
          (student.seat_booking?.seat_no || "").toLowerCase().includes(term) ||
          (student.seat_booking?.amount || "").includes(term)
      );
    },
  },
});

export const { addStudent, editStudent, deleteStudent, searchStudent } =
  studentsSlice.actions;

export default studentsSlice.reducer;
