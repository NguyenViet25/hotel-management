import { Box, Typography, Grid, Paper } from '@mui/material';

const AdminDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" color="primary">Total Users</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              120
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" color="primary">Active Hotels</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              8
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" color="primary">Total Revenue</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              $45.2K
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography variant="h6" color="primary">System Status</Typography>
            <Typography variant="h5" component="div" sx={{ mt: 2, color: 'success.main' }}>
              Healthy
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;