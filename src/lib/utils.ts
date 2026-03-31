import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const MONTH_NAMES_DE: Record<string, string> = {
  "01": "Januar",
  "02": "Februar",
  "03": "Maerz",
  "04": "April",
  "05": "Mai",
  "06": "Juni",
  "07": "Juli",
  "08": "August",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Dezember",
};

export function formatDateDE(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const monthName = MONTH_NAMES_DE[month] || month;
  return `${parseInt(day)}. ${monthName} ${year}`;
}
