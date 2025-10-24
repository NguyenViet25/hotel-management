import { Grid, Paper, Typography } from "@mui/material";

export default function Dashboard() {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">Công suất (OCC)</Typography>
          <Typography variant="h4">72%</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">ADR</Typography>
          <Typography variant="h4">1.200.000₫</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">RevPAR</Typography>
          <Typography variant="h4">864.000₫</Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2">F&B sales</Typography>
          <Typography variant="h4">25.300.000₫</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
}
