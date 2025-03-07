import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store/store"; // Adjust path based on your project structure
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
// import { PublicPage } from "./pages/PublicPage"; // New page (outside auth)
import { UserProvider } from "./context/user";
import AvailableSeats from "./pages/AvailableSeats";

function App() {
  const username = useSelector((state: RootState) => state.user.username);

  return (
    <Router>
      <Routes>
        <Route path="/availabe-seats" element={<AvailableSeats />} />
        <Route
          path="/*"
          element={
            <UserProvider>
              <main>{username ? <Home /> : <Login />}</main>
            </UserProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
