import LabelStriped from "./LabelStriped";
import { Box, Stack } from "@mui/material";
import { type PropsWithChildren } from "react";

interface IProps extends PropsWithChildren {
  label: string;
}

export default function StripedLabelWrapper({ label, children }: IProps) {
  return (
    <Stack gap={1}>
      <Box>
        <LabelStriped content={label} />
      </Box>
      {children}
    </Stack>
  );
}
