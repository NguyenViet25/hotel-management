import dayjs from "dayjs";

export const getExactVNDate = (date: string) => {
  return dayjs(date.split("T")[0]).format("YYYY-MM-DD");
};

export function toLocalIso(
  date?: Date | dayjs.Dayjs | null
): string | undefined {
  if (!date) return undefined;
  const d = dayjs(date);
  if (!d.isValid()) return undefined;
  return d.format("YYYY-MM-DDTHH:mm:ss");
}

export function formatDateTime(dateString: string | undefined): string {
  if (dateString === undefined) return "";
  const date = new Date(dateString!);
  if (isNaN(date.getTime())) return ""; // Handle invalid date

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDate(dateString: string | undefined): string {
  if (dateString === undefined) return "";
  const date = new Date(dateString!);
  if (isNaN(date.getTime())) return ""; // Handle invalid date

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatTime(dateString: string | undefined): string {
  if (dateString === undefined) return "";
  const date = new Date(dateString!);
  if (isNaN(date.getTime())) return ""; // Handle invalid date

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}
