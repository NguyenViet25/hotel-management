import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import React from "react";

export interface Option {
  value: string | number;
  label: string | React.ReactNode;
}

interface CustomSelectProps {
  name?: string;
  value: string | number;
  label: string;
  onChange: (event: any) => void;
  startIcon?: React.ReactNode;
  options?: Option[];
  placeholder?: string;
  size?: "small" | "medium";
}
const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  label,
  onChange,
  startIcon,
  options = [],
  placeholder,
  size = "medium",
}) => {
  return (
    <FormControl fullWidth variant="outlined" size={size}>
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        startAdornment={
          startIcon && <InputAdornment>{startIcon}</InputAdornment>
        }
        label={label}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CustomSelect;
