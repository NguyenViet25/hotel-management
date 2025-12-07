import { styled, Typography, type TypographyProps } from "@mui/material";

interface IProps extends TypographyProps {
  content: string;
}

const STypography = styled(Typography)`
  border-left: 1px solid #f44336;
  background-color: #f5f5f5;
  color: #333333;
  border-left-width: 2px;
  padding: 5px 10px;
  display: inline-block;
  font-weight: 500;
  line-height: 1.5384616;
  text-transform: uppercase;
  font-size: 10px;
`;

export default function LabelStriped({ content, ...props }: IProps) {
  return <STypography {...props}>{content}</STypography>;
}
