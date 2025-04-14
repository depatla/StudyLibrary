import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  username: string;
  studyhallId: string;
}

// Initial state for the user slice
const initialState: UserState = {
  username: "Venkatesh",
  studyhallId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUsername(state, action: PayloadAction<string>) {
      //state.username = action.payload;
    },
    updateStudyall(state, action: PayloadAction<string>) {
      state.studyhallId = action.payload;
    },
  }, // Add reducers here if needed
});
export const { updateUsername, updateStudyall } = userSlice.actions;
export default userSlice.reducer;
