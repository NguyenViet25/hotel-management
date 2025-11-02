import { Box, Typography, Grid, Paper } from '@mui/material';

const ManagerDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Facility Manager Dashboard
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
            <Typography variant="h6" color="primary">Room Occupancy</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              78%
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
            <Typography variant="h6" color="primary">Today's Revenue</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              $5.8K
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
            <Typography variant="h6" color="primary">Maintenance Requests</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              12
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
            <Typography variant="h6" color="primary">Staff on Duty</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              24
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerDashboard;