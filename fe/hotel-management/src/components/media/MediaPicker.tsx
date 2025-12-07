import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  ImageList,
  ImageListItem,
  Checkbox,
} from "@mui/material";
import mediaApi, { type MediaDto } from "../../api/mediaApi";

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selected: MediaDto[]) => void;
  maxSelect?: number;
  initialSelectedIds?: number[];
}

const MediaPicker: React.FC<MediaPickerProps> = ({
  open,
  onClose,
  onConfirm,
  maxSelect,
  initialSelectedIds = [],
}) => {
  const [items, setItems] = useState<MediaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>(initialSelectedIds);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await mediaApi.list(1, 200);
      if (res.isSuccess) setItems(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((i) => i.fileName.toLowerCase().includes(s));
  }, [items, search]);

  const toggle = (id: number) => {
    const exists = selectedIds.includes(id);
    if (exists) setSelectedIds(selectedIds.filter((x) => x !== id));
    else {
      if (maxSelect && selectedIds.length >= maxSelect) return;
      setSelectedIds([...selectedIds, id]);
    }
  };

  const confirm = () => {
    const selected = items.filter((i) => selectedIds.includes(i.id));
    onConfirm(selected);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Chọn media</Typography>
          <Typography variant="body2">{selectedIds.length} đã chọn</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack gap={2} sx={{ mt: 1 }}>
          <TextField
            placeholder="Tìm kiếm theo tên tệp"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Box sx={{ position: "relative", minHeight: 200 }}>
            <ImageList cols={4} gap={12} sx={{ m: 0 }}>
              {filtered.map((item) => (
                <ImageListItem key={item.id} sx={{ position: "relative" }}>
                  <Box
                    onClick={() => toggle(item.id)}
                    sx={{
                      width: "100%",
                      height: 160,
                      borderRadius: 2,
                      overflow: "hidden",
                      cursor: "pointer",
                      border: selectedIds.includes(item.id)
                        ? "2px solid #1976d2"
                        : "1px solid rgba(224,224,224,1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#fafafa",
                    }}
                  >
                    {item.contentType.startsWith("image") ? (
                      <img
                        src={item.fileUrl}
                        alt={item.fileName}
                        loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <Typography variant="caption">{item.fileName}</Typography>
                    )}
                  </Box>
                  <Checkbox
                    checked={selectedIds.includes(item.id)}
                    size="small"
                    sx={{ position: "absolute", top: 6, right: 6, background: "white", borderRadius: 1 }}
                    onChange={() => toggle(item.id)}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                    {item.fileName}
                  </Typography>
                </ImageListItem>
              ))}
            </ImageList>
            {loading && (
              <Typography variant="body2">Đang tải...</Typography>
            )}
            {!loading && filtered.length === 0 && (
              <Typography variant="body2">Không có dữ liệu</Typography>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>Đóng</Button>
        <Button variant="contained" onClick={confirm} disabled={selectedIds.length === 0}>Chọn</Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaPicker;