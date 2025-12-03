import { createContext } from "react";

interface AuthContextType {
  isAutheticated: boolean;
  setIsAutheticated: (isAutheticated: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAutheticated: false,
  setIsAutheticated: () => {},
});

export default AuthContext;
