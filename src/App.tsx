import { useSelector } from "react-redux";
import { RootState } from "./store/store"; // Adjust the path based on your project structure
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { UserProvider } from "./context/user";

function App() {
  // Access the username from the Redux store
  const username = useSelector((state: RootState) => state.user.username);

  return (
    <div>
      <UserProvider>
        <main>{username ? <Home /> : <Login />}</main>
      </UserProvider>
    </div>
  );
}

export default App;
