import dayjs from "dayjs";

export const getExactVNDate = (date: string) => {
  return dayjs(date.split("T")[0]).format("YYYY-MM-DD");
};
