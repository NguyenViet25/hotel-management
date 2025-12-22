import { Stack, Typography } from "@mui/material";

interface IProps {
  title?: string;
  subtitle: string;
}

export default function PageTitle({ title, subtitle }: IProps) {
  return (
    <Stack mb={2}>
      {title && (
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      )}
      {/* <Typography variant="subtitle2" color="text.secondary">
        {subtitle}
      </Typography> */}
    </Stack>
  );
}
