import { Chip } from '@mui/material';

export default function RoomStatusChip({ status }: { status: string }) {
  const color =
    status === 'Cleaned' ? 'success' :
    status === 'Dirty' ? 'error' :
    status === 'In-progress' ? 'warning' :
    status === 'Inspected' ? 'primary' : 'default';
  return <Chip label={status} color={color as any} size="small" variant="outlined" />;
}