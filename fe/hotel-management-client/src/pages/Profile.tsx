import { Avatar, Box, Paper, Stack, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, maxWidth: 640, mx: 'auto' }}>
        <Stack spacing={2} alignItems="center">
          <Avatar src={user?.picture} sx={{ width: 72, height: 72 }}>
            {user?.name?.[0] ?? 'U'}
          </Avatar>
          <Typography variant="h6">{user?.name}</Typography>
          <Typography color="text.secondary">{user?.email}</Typography>
          <Button variant="outlined" color="error" onClick={onLogout} sx={{ mt: 1 }}>
            Đăng xuất
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}