import React from "react";
import {
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";

export interface Option {
  value: string | number;
  label: string;
}

interface CustomSelectProps {
  name?: string;
  value: string | number;
  label: string;
  onChange: (event: any) => void;
  startIcon?: React.ReactNode;
  options?: Option[];
  placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  name,
  value,
  label,
  onChange,
  startIcon,
  options = [],
  placeholder,
}) => {
  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel>{label}</InputLabel>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        startAdornment={
          startIcon && (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          )
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
