import { Home } from "./pages/Home";
import { UserProvider } from "./context/user";
import { Login } from "./pages/Login";

function App() {
  const isLoginPage = window.location.pathname === "/login";

  return (
    <div>
      <UserProvider>
        <main>{isLoginPage ? <Login /> : <Home />}</main>
      </UserProvider>
    </div>
  );
}

export default App;
