import React, { useEffect, useState } from "react";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import type { Option } from "../../../../../components/common/CustomSelect";
import CustomSelect from "../../../../../components/common/CustomSelect";
import type { HotelSummaryDto } from "../../../../../types";
import axiosInstance from "../../../../../api/axios";
import { Hotel, HotelClass, House, LocalHotel } from "@mui/icons-material";

interface HotelSelectProps {
  value: string;
  onChange: (event: React.ChangeEvent<{ value: unknown }>) => void;
  name?: string;
}

const HotelSelect: React.FC<HotelSelectProps> = ({ value, onChange, name }) => {
  const [hotels, setHotels] = useState<HotelSummaryDto[]>([]);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await axiosInstance.get<HotelSummaryDto[]>(
          "/auth/hotels"
        );
        setHotels(response.data);
      } catch (err: any) {
        console.error("Failed to fetch hotels:", err);
      } finally {
      }
    };

    fetchHotels();
  }, []);

  const options: Option[] = Object.entries(hotels).map(([key, info]) => ({
    value: info.id,
    label: info.name,
  }));

  return (
    <CustomSelect
      name={name}
      value={value}
      onChange={onChange}
      label="Chọn cơ sở"
      startIcon={<HotelClass />}
      options={options}
      placeholder="Chọn cơ sở"
    />
  );
};

export default HotelSelect;
