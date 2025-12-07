const DIGITS = [
  "không",
  "một",
  "hai",
  "ba",
  "bốn",
  "năm",
  "sáu",
  "bảy",
  "tám",
  "chín",
];

function readTriple(n: number, full: boolean): string {
  const h = Math.floor(n / 100);
  const t = Math.floor((n % 100) / 10);
  const u = n % 10;
  let s = "";

  // Hundreds
  if (full || h > 0) {
    s += `${DIGITS[h]} trăm`;
    if (t === 0 && u > 0) s += " lẻ";
  }

  // Tens
  if (t > 0) {
    if (s) s += " ";
    if (t === 1) s += "mười";
    else s += `${DIGITS[t]} mươi`;
  }

  // Units
  if (u > 0) {
    if (s) s += " ";

    if (t === 0 || t === 1) {
      // Case: 15 => "mười lăm"
      if (t === 1 && u === 5) s += "lăm";
      else s += DIGITS[u];
    } else {
      // Case: >= 20
      if (u === 1) s += "mốt";
      else if (u === 4) s += "tư";
      else if (u === 5) s += "lăm";
      else s += DIGITS[u];
    }
  }

  return s.trim();
}

export function moneyToVietnameseWords(amount: number): string {
  const negative = amount < 0;
  let n = Math.floor(Math.abs(amount));

  if (n === 0) return "không đồng";

  const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ", "tỷ tỷ"];

  const groups: number[] = [];
  while (n > 0 && groups.length < units.length) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  let s = "";
  for (let j = groups.length - 1; j >= 0; j--) {
    const group = groups[j];
    if (group === 0) continue;
    const full = j !== groups.length - 1;
    const part = readTriple(group, full);
    const unit = units[j];
    s = s
      ? `${s} ${part}${unit ? " " + unit : ""}`
      : `${part}${unit ? " " + unit : ""}`;
  }

  s = `${negative ? "âm " : ""}${s} đồng`;

  return s.replace(/\s+/g, " ").trim();
}

export function formatDateVN(date: Date): string {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  return `Ngày ${d} tháng ${m} năm ${y}`;
}
