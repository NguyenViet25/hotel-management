import dayjs from "dayjs";

export const getExactVNDate = (date: string) => {
  return dayjs(date.split("T")[0]).format("YYYY-MM-DD");
};

export function formatDateTime(dateString: string | undefined): string {
  if (dateString === undefined) return "";
  const date = new Date(dateString!);
  if (isNaN(date.getTime())) return ""; // Handle invalid date

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
