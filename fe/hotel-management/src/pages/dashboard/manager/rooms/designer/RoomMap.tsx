import React from "react";
import { Box, Card, CardContent, CardHeader, Chip, Grid, Stack, Typography } from "@mui/material";
import { useDesignerStore } from "./store";
import { ROOM_TYPE_META } from "./types";

const RoomMap: React.FC = () => {
  const floors = useDesignerStore((s) => s.floors);

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Room Map
      </Typography>
      <Stack spacing={2}>
        {floors.map((floor) => (
          <Card key={floor.id} sx={{ borderRadius: 2, boxShadow: 2, '&:hover': { boxShadow: 4 } }}>
            <CardHeader title={floor.title} sx={{ pb: 0.5 }} />
            <CardContent>
              <Grid container spacing={2}>
                {floor.rooms.map((r) => {
                  const meta = ROOM_TYPE_META[r.type];
                  return (
                    <Grid item key={r.id}>
                      <Card sx={{ width: 160, borderRadius: 2, boxShadow: 1 }}>
                        <CardContent sx={{ p: 1.5 }}>
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={meta.label} icon={meta.icon as any} size="small" sx={{ bgcolor: meta.color, color: 'white' }} />
                              <Typography variant="subtitle2" fontWeight={700}>#{r.number}</Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">{r.status}</Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default RoomMap;