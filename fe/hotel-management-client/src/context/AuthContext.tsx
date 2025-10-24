import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";

export type Role =
  | "Admin"
  | "Quản lý cơ sở"
  | "Lễ tân"
  | "HK"
  | "Bếp"
  | "Thu ngân"
  | "Kế toán";

export type UserProfile = { name: string; email: string; picture?: string };

interface AuthState {
  role: Role;
  propertyId?: string;
  user?: UserProfile;
  token?: string;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  setPropertyId: (id?: string) => void;
  loginWithGoogle: (credential: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function decodeJwtPayload<T = any>(jwt: string): T | undefined {
  try {
    const parts = jwt.split(".");
    if (parts.length < 2) return undefined;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return undefined;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>("Admin");
  const [propertyId, setPropertyId] = useState<string | undefined>(() => {
    const raw = localStorage.getItem("hm_property");
    return raw ? raw : undefined;
  });
  const [user, setUser] = useState<UserProfile | undefined>(() => {
    const raw = localStorage.getItem("hm_user");
    return raw ? JSON.parse(raw) : undefined;
  });
  const [token, setToken] = useState<string | undefined>(
    () => localStorage.getItem("hm_token") || undefined
  );

  useEffect(() => {
    if (user) localStorage.setItem("hm_user", JSON.stringify(user));
    else localStorage.removeItem("hm_user");
  }, [user]);

  useEffect(() => {
    if (token) localStorage.setItem("hm_token", token);
    else localStorage.removeItem("hm_token");
  }, [token]);

  useEffect(() => {
    if (propertyId) localStorage.setItem("hm_property", propertyId);
    else localStorage.removeItem("hm_property");
  }, [propertyId]);

  const loginWithGoogle = (credential: string) => {
    const payload = decodeJwtPayload<any>(credential);
    if (!payload) return;
    const profile: UserProfile = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    };
    setUser(profile);
    setToken(credential);
  };

  const logout = () => {
    setUser(undefined);
    setToken(undefined);
  };

  const value = useMemo(
    () => ({
      role,
      propertyId,
      user,
      token,
      isAuthenticated: !!user,
      setRole,
      setPropertyId,
      loginWithGoogle,
      logout,
    }),
    [role, propertyId, user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
