import React, { useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useDesignerStore } from "./store";
import FloorCard from "./FloorCard";
import AddFloorDialog from "./AddFloorDialog";

const RoomDesigner: React.FC = () => {
  const {
    floors,
    reorderFloors,
    moveRoomBetweenFloors,
    reorderRoomsWithinFloor,
  } = useDesignerStore();

  const [openAddFloor, setOpenAddFloor] = useState(false);

  // Handle drag end for floors and rooms
  const handleDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;
    if (!destination) return;

    // Reordering floors in the vertical list
    if (type === "FLOOR") {
      if (source.index === destination.index) return;
      reorderFloors(source.index, destination.index);
      return;
    }

    // Moving rooms within/among floors
    if (type === "ROOM") {
      const sourceFloorId = source.droppableId.replace("floor-", "");
      const destFloorId = destination.droppableId.replace("floor-", "");
      const sameFloor = sourceFloorId === destFloorId;
      if (sameFloor) {
        if (source.index === destination.index) return;
        reorderRoomsWithinFloor(sourceFloorId, source.index, destination.index);
      } else {
        moveRoomBetweenFloors(
          sourceFloorId,
          destFloorId,
          source.index,
          destination.index
        );
      }
    }
  };

  const floorsWithKeys = useMemo(
    () => floors.map((f) => ({ ...f })),
    [floors]
  );

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Hotel Room Designer</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenAddFloor(true)}>
          Add New Floor
        </Button>
      </Stack>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="floors-list" type="FLOOR">
          {(provided) => (
            <Stack spacing={2} ref={provided.innerRef} {...provided.droppableProps}>
              {floorsWithKeys.map((floor, index) => (
                <Draggable draggableId={`floor-${floor.id}`} index={index} key={floor.id}>
                  {(dragProvided) => (
                    <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}>
                      <FloorCard floor={floor} index={index} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      <AddFloorDialog open={openAddFloor} onClose={() => setOpenAddFloor(false)} />
    </Box>
  );
};

export default RoomDesigner;