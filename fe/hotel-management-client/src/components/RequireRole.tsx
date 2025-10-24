import { Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../context/AuthContext';

export default function RequireRole({ allowed, children }: { allowed: Role[]; children: React.ReactNode }) {
  const { role } = useAuth();
  if (!allowed.includes(role)) {
    return <Alert severity="warning">Bạn không có quyền truy cập trang này.</Alert>;
  }
  return <>{children}</>;
}