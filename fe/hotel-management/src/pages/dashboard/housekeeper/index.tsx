import { Box, Typography, Grid, Paper } from '@mui/material';

const HousekeeperDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Housekeeper Dashboard
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
            <Typography variant="h6" color="primary">Rooms to Clean</Typography>
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
            <Typography variant="h6" color="primary">Completed Today</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              24
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HousekeeperDashboard;