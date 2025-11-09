import { Box, Typography, Grid, Paper } from '@mui/material';

const FrontDeskDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Front Desk Dashboard
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
            <Typography variant="h6" color="primary">Check-ins Today</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              24
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
            <Typography variant="h6" color="primary">Check-outs Today</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              18
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
            <Typography variant="h6" color="primary">Available Rooms</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              42
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
            <Typography variant="h6" color="primary">Pending Requests</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              7
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FrontDeskDashboard;