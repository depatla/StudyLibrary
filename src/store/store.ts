import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userSlice"; // Import the reducer
import seatsReducer from "./slice/seatsSlice";
import studentsReducer from "./slice/studentsSlice";
export const store = configureStore({
  reducer: {
    user: userReducer,
    seats: seatsReducer,
    students: studentsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>; // Add this to infer the state type
export type AppDispatch = typeof store.dispatch; // Add this for dispatch type
