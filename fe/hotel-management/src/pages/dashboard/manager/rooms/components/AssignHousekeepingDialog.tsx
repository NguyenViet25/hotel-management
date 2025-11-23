import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import userService, { type User } from "../../../../../api/userService";
import housekeepingTasksApi from "../../../../../api/housekeepingTasksApi";

type Props = {
  open: boolean;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  onClose: () => void;
  onAssigned?: () => void | Promise<void>;
};

export default function AssignHousekeepingDialog({ open, hotelId, roomId, roomNumber, onClose, onAssigned }: Props) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await userService.getUsers(1, 100);
        if (res.isSuccess) {
          const list = res.data.filter(u => (u.propertyRoles || []).some(pr => pr.hotelId === hotelId && pr.role?.toLowerCase() === "housekeeper") || (u.roles || []).some(r => r.toLowerCase() === "housekeeper"));
          setUsers(list);
        }
      } catch {}
    })();
  }, [open, hotelId]);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await housekeepingTasksApi.create({ hotelId, roomId, assignedToUserId: assigneeId || undefined, notes: notes || undefined });
      if (res.isSuccess) {
        if (onAssigned) await onAssigned();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Phân công dọn phòng {roomNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">Chọn nhân viên buồng phòng phụ trách và thêm ghi chú.</Typography>
          <Select size="small" value={assigneeId} onChange={(e) => setAssigneeId(String(e.target.value))} displayEmpty>
            <MenuItem value="">Không chỉ định</MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={u.id}>{u.fullname || u.userName}</MenuItem>
            ))}
          </Select>
          <TextField size="small" label="Ghi chú" multiline minRows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>Phân công</Button>
      </DialogActions>
    </Dialog>
  );
}