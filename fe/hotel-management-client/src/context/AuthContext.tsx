import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

export type Role = 'Admin' | 'Quản lý cơ sở' | 'Lễ tân' | 'HK' | 'Bếp' | 'Thu ngân' | 'Kế toán';

interface AuthState {
  role: Role;
  propertyId?: string;
  setRole: (role: Role) => void;
  setPropertyId: (id?: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('Admin');
  const [propertyId, setPropertyId] = useState<string | undefined>(undefined);

  const value = useMemo(() => ({ role, propertyId, setRole, setPropertyId }), [role, propertyId]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};