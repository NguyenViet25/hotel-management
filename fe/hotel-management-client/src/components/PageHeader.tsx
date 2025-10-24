import { Stack, Typography, Box } from '@mui/material';

export default function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        {subtitle && <Typography variant="subtitle2">{subtitle}</Typography>}
      </Box>
      {actions}
    </Stack>
  );
}