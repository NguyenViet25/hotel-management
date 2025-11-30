import { Box, Chip } from "@mui/material";
import React, { useEffect, useState } from "react";
import type { Hotel } from "../../../api/hotelService";
import DataTable, { type Column } from "../../../components/common/DataTable";
import PageTitle from "../../../components/common/PageTitle";
import ChangeStatusModal from "../components/ChangeStatusModal";
import HotelFormModal from "../components/HotelFormModal";
import { useHotels } from "../hooks/useHotels";

const HotelsListPage: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { hotels, loading, pagination, fetchHotels } = useHotels();

  useEffect(() => {
    fetchHotels({
      page: 1,
      pageSize: 10,
      search: searchText,
    });
  }, [searchText, statusFilter, searchText]);

  const columns: Column<Hotel>[] = [
    {
      id: "code",
      label: "Mã cơ sở",
    },
    {
      id: "name",
      label: "Tên cơ sở",
      minWidth: 150,
    },
    {
      id: "address",
      label: "Địa chỉ",
    },
    {
      id: "phone",
      label: "Số điện thoại",
      minWidth: 150,
    },
    {
      id: "email",
      label: "Email",
    },
    {
      id: "isActive",
      label: "Trạng thái",
      format: (params: boolean) => (
        <Chip
          label={params ? "Đang hoạt động" : "Ngừng hoạt động"}
          color={params ? "primary" : "error"}
          size="small"
        />
      ),
    },
  ];

  const handleOpenCreateModal = () => {
    setIsCreateModalVisible(true);
  };

  const handleOpenEditModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsEditModalVisible(true);
  };

  const handleOpenStatusModal = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setIsStatusModalVisible(true);
  };

  const handlePageChange = (page: number) => {
    fetchHotels({
      page,
      pageSize: pagination.pageSize,
      search: searchText,
    });
  };

  const handleSort = (property: string) => {
    // Implement sorting logic here if needed
    console.log("Sort by", property);
  };

  return (
    <Box>
      <PageTitle
        title="Quản lý cơ sở"
        subtitle="Thêm, sửa và quản lý các cơ sở nhà nghỉ"
      />
      <DataTable<Hotel>
        columns={columns}
        data={hotels}
        title="Danh sách khách sạn"
        loading={loading}
        pagination={{
          page: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: handlePageChange,
        }}
        onAdd={handleOpenCreateModal}
        onEdit={handleOpenEditModal}
        // onLock={handleOpenStatusModal}
        getRowId={(row) => row.id}
        onSort={handleSort}
        onSearch={(e) => setSearchText(e)}
      />
      <HotelFormModal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSuccess={() => {
          setIsCreateModalVisible(false);
          fetchHotels();
        }}
      />
      {selectedHotel && (
        <>
          <HotelFormModal
            visible={isEditModalVisible}
            onCancel={() => {
              setIsEditModalVisible(false);
            }}
            onSuccess={() => {
              setIsEditModalVisible(false);
              fetchHotels();
            }}
            hotel={selectedHotel}
          />

          <ChangeStatusModal
            visible={isStatusModalVisible}
            onCancel={() => setIsStatusModalVisible(false)}
            onSuccess={() => {
              setIsStatusModalVisible(false);
              fetchHotels();
            }}
            hotel={selectedHotel}
          />
        </>
      )}
    </Box>
  );
};

export default HotelsListPage;
