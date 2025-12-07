import React, { useRef } from "react";
import { Box, Button, Stack, Typography, Card, CardContent, IconButton } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import mediaApi from "../../../../../api/mediaApi";

type Props = {
  label: string;
  value?: string;
  onChange?: (url?: string) => void;
};

const UploadCCCD: React.FC<Props> = ({ label, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const pickFile = () => {
    inputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const res = await mediaApi.upload(f);
    if (res.isSuccess && res.data) onChange?.(res.data.fileUrl);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={700}>{label}</Typography>
          {!value ? (
            <Box
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
                bgcolor: "action.hover",
              }}
            >
              <Stack spacing={1} alignItems="center">
                <Typography variant="body2">Tải ảnh CCCD</Typography>
                <Button variant="contained" onClick={pickFile}>Tải CCCD</Button>
                <input type="file" ref={inputRef} style={{ display: "none" }} onChange={handleFile} accept="image/*" />
              </Stack>
            </Box>
          ) : (
            <Box sx={{ position: "relative" }}>
              <img src={value} alt={label} style={{ width: "100%", borderRadius: 8 }} />
              <IconButton size="small" color="error" onClick={() => onChange?.(undefined)} sx={{ position: "absolute", top: 8, right: 8 }}>
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UploadCCCD;