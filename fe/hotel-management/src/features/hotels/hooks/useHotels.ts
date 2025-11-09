import { useState, useCallback } from "react";
import hotelService, {
  type Hotel,
  type HotelsQueryParams,
  type CreateHotelRequest,
  type UpdateHotelRequest,
  type ChangeHotelStatusRequest,
} from "../../../api/hotelService";
import { toast } from "react-toastify";

export const useHotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchHotels = useCallback(
    async (params: HotelsQueryParams = {}) => {
      setLoading(true);
      try {
        const response = await hotelService.getHotels({
          page: pagination.current,
          pageSize: pagination.pageSize,
          ...params,
        });

        console.log("response", response);

        if (response.isSuccess) {
          setHotels(response.data);
          setPagination({
            ...pagination,
            total: response.meta.total,
          });
        } else {
          toast.error(response.message || "Không thể tải danh sách khách sạn");
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách sạn:", error);
        toast.error("Không thể tải danh sách khách sạn");
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize, pagination]
  );

  const createHotel = async (data: CreateHotelRequest) => {
    try {
      const response = await hotelService.createHotel(data);
      if (response.isSuccess) {
        toast.success("Tạo khách sạn thành công");
        return response.data;
      } else {
        toast.error(response.message || "Không thể tạo khách sạn");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi tạo khách sạn:", error);
      toast.error("Không thể tạo khách sạn");
      return null;
    }
  };

  const updateHotel = async (id: string, data: UpdateHotelRequest) => {
    try {
      const response = await hotelService.updateHotel(id, data);
      if (response.isSuccess) {
        toast.success("Cập nhật khách sạn thành công");
        return response.data;
      } else {
        toast.error(response.message || "Không thể cập nhật khách sạn");
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật khách sạn:", error);
      toast.error("Không thể cập nhật khách sạn");
      return null;
    }
  };

  const changeHotelStatus = async (
    id: string,
    data: ChangeHotelStatusRequest
  ) => {
    try {
      const response = await hotelService.changeHotelStatus(id, data);
      if (response.isSuccess) {
        toast.success("Thay đổi trạng thái khách sạn thành công");
        return response.data;
      } else {
        toast.error(
          response.message || "Không thể thay đổi trạng thái khách sạn"
        );
        return null;
      }
    } catch (error) {
      console.error("Lỗi khi thay đổi trạng thái khách sạn:", error);
      toast.error("Không thể thay đổi trạng thái khách sạn");
      return null;
    }
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      ...pagination,
      current: page,
      pageSize,
    });
  };

  return {
    hotels,
    loading,
    pagination,
    fetchHotels,
    createHotel,
    updateHotel,
    changeHotelStatus,
    handleTableChange,
  };
};
