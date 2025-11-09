import { Box, Typography, Grid, Paper } from '@mui/material';

const AccountantDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Accountant Dashboard
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
            <Typography variant="h6" color="primary">Monthly Revenue</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              $85.4K
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
            <Typography variant="h6" color="primary">Expenses</Typography>
            <Typography variant="h3" component="div" sx={{ mt: 2 }}>
              $42.1K
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AccountantDashboard;