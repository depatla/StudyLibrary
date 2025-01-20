import { ID } from "appwrite";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  FC,
} from "react";
import { account } from "../config/config";
import { useDispatch } from "react-redux";
import { updateUsername } from "../store/slice/userSlice";
import Loader from "../components/common/Loader";

interface User {
  $id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

interface UserContextValue {
  current: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // <-- Loading state
  const dispatch = useDispatch();

  async function login(email: string, password: string) {
    const loggedIn = await account.createEmailPasswordSession(email, password);
    setUser(loggedIn);
    console.log(loggedIn);
    //dispatch(updateUsername(loggedIn.)); // Sync username to Redux store
    window.location.replace("/");
  }

  async function logout() {
    await account.deleteSession("current");
    setUser(null);
    dispatch(updateUsername("")); // Clear username in Redux store
  }

  async function register(email: string, password: string) {
    await account.create(ID.unique(), email, password);
    await login(email, password);
  }

  async function init() {
    try {
      const loggedIn = await account.get();
      setUser(loggedIn);
      dispatch(updateUsername(loggedIn.name)); // Sync username to Redux store
    } catch (err) {
      setUser(null);
      dispatch(updateUsername("")); // Clear username in Redux store
    } finally {
      setLoading(false); // Mark initialization as complete
    }
  }

  useEffect(() => {
    init();
  }, []);

  // Render a centered loader while the app is initializing
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <UserContext.Provider value={{ current: user, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
};
