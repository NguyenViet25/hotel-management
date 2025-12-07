import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Enable plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Default timezone = Vietnam
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

export default dayjs;
