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

// Define the types for the user object and context value
interface User {
  $id: string;
  name?: string;
  email?: string;
  [key: string]: any; // Adjust based on your app's user object structure
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
  const dispatch = useDispatch();
  async function login(email: string, password: string) {
    const loggedIn = await account.createEmailPasswordSession(email, password);
    setUser(loggedIn);
    window.location.replace("/");
  }

  async function logout() {
    await account.deleteSession("current");
    setUser(null);
  }

  async function register(email: string, password: string) {
    await account.create(ID.unique(), email, password);
    await login(email, password);
  }

  async function init() {
    try {
      const loggedIn = await account.get();
      dispatch(updateUsername(loggedIn.name));
      setUser(loggedIn);
    } catch (err) {
      setUser(null);
    }
  }

  useEffect(() => {
    init();
  }, []);

  return (
    <UserContext.Provider value={{ current: user, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
};
