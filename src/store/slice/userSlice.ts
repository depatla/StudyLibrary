import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  username: string;
}

// Initial state for the user slice
const initialState: UserState = {
  username: "John Doe",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUsername(state, action: PayloadAction<string>) {
      state.username = action.payload;
    },
  }, // Add reducers here if needed
});
export const { updateUsername } = userSlice.actions;
export default userSlice.reducer; // Export only the reducer
