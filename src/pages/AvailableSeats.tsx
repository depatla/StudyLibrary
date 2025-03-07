import React, { useEffect } from "react";
import { useDatabase } from "../config/useDatabase";
import { Query } from "appwrite";

const databaseId = process.env.REACT_APP_DATABASE_ID
  ? process.env.REACT_APP_DATABASE_ID
  : "676f62930015946e6bb5"; // Replace with your Appwrite database ID
const collectionId = process.env.REACT_APP_SEATS_ID
  ? process.env.REACT_APP_SEATS_ID
  : "6771ff5e001204850a2f"; // Replace with your Appwrite collection ID

type Seat = {
  seat_no: string;
};

const SeatTable: React.FC = () => {
  const { list, fetchAllWithFilters, loading } = useDatabase(
    databaseId,
    collectionId
  );

  useEffect(() => {
    fetchAllWithFilters({ filters: [Query.equal("status", "Available")] });
  }, [fetchAllWithFilters]);

  // Group seats by room name, excluding those starting with "OPEN"
  const groupedSeats: Record<string, number[]> = list.reduce(
    (acc, seat: Seat) => {
      const [room, number] = seat.seat_no.split(" ");
      if (room.toUpperCase().startsWith("OPEN")) return acc; // Skip "OPEN" rooms
      if (!acc[room]) acc[room] = [];
      acc[room].push(parseInt(number, 10));
      return acc;
    },
    {} as Record<string, number[]>
  );

  // Sort seat numbers in each room
  Object.keys(groupedSeats).forEach((room) =>
    groupedSeats[room].sort((a, b) => a - b)
  );

  // Get unique room names and max seat count per row
  const roomNames = Object.keys(groupedSeats);
  const maxSeats = Math.max(
    ...Object.values(groupedSeats).map((seats) => seats.length),
    0
  );

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">
          Prajna Study Hall
        </h1>
        <div className="overflow-x-auto">
          <table className="table-auto border-collapse border border-gray-300 w-full text-sm sm:text-base">
            <thead>
              <tr className="bg-gray-200">
                {roomNames.map((room) => (
                  <th
                    key={room}
                    className="border border-gray-300 px-2 sm:px-4 py-2 text-left"
                  >
                    {room}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maxSeats > 0 ? (
                [...Array(maxSeats)].map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {roomNames.map((room) => (
                      <td
                        key={room + rowIndex}
                        className="border border-gray-300 px-2 sm:px-4 py-2"
                      >
                        {groupedSeats[room][rowIndex] || ""}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={roomNames.length}
                    className="border border-gray-300 px-4 py-2 text-center"
                  >
                    No available seats
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SeatTable;
