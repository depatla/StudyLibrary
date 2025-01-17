import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SeatType, Status } from "../../constants/enums";

interface Seat {
  id: number;
  seatNo: string;
  seatType: SeatType;
  status: Status;
}

interface SeatsState {
  seats: Seat[];
  filteredSeats: Seat[];
}

const initialState: SeatsState = {
  seats: [
    { id: 1, seatNo: "A1", seatType: SeatType.AC, status: Status.Available },
    { id: 2, seatNo: "A2", seatType: SeatType.NonAC, status: Status.Occupied },
    { id: 3, seatNo: "B1", seatType: SeatType.AC, status: Status.Available },
  ],
  filteredSeats: [
    { id: 1, seatNo: "A1", seatType: SeatType.AC, status: Status.Available },
    { id: 2, seatNo: "A2", seatType: SeatType.NonAC, status: Status.Occupied },
    { id: 3, seatNo: "B1", seatType: SeatType.AC, status: Status.Available },
  ],
};

const seatsSlice = createSlice({
  name: "seats",
  initialState,
  reducers: {
    addSeat: (state, action: PayloadAction<Seat>) => {
      state.seats.push(action.payload);
      state.filteredSeats = state.seats;
    },
    searchSeat: (state, action: PayloadAction<string>) => {
      const term = action.payload.toLowerCase();
      state.filteredSeats = state.seats.filter(
        (seat) =>
          seat.seatNo.toLowerCase().includes(term) ||
          seat.seatType.toLowerCase().includes(term) ||
          seat.status.toLowerCase().includes(term)
      );
    },
    sortSeatsByStatus: (state, action: PayloadAction<"asc" | "desc">) => {
      const sortOrder = action.payload;
      state.filteredSeats.sort((a, b) => {
        if (a.status < b.status) return sortOrder === "asc" ? -1 : 1;
        if (a.status > b.status) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    },
    addBulkSeats: (state, action: PayloadAction<Seat[]>) => {
      state.seats.push(...action.payload);
      state.filteredSeats = state.seats;
    },
    editSeat: (
      state,
      action: PayloadAction<{
        id: number;
        seatNo: string;
        seatType: SeatType;
        status: Status;
      }>
    ) => {
      const index = state.seats.findIndex(
        (seat) => seat.id === action.payload.id
      );
      if (index !== -1) {
        state.seats[index] = action.payload;
        state.filteredSeats = state.seats;
      }
    },
    deleteSeat: (state, action: PayloadAction<number>) => {
      state.seats = state.seats.filter((seat) => seat.id !== action.payload);
      state.filteredSeats = state.seats;
    },
  },
});

export const {
  addSeat,
  searchSeat,
  sortSeatsByStatus,
  addBulkSeats,
  editSeat,
  deleteSeat,
} = seatsSlice.actions;

export default seatsSlice.reducer;
