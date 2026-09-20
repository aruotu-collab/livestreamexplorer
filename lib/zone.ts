const ZONE_COUNTRY: Record<string, string> = {
  "Europe/London": "UK",
  "Europe/Belfast": "UK",
  "Europe/Guernsey": "UK",
  "Europe/Isle_of_Man": "UK",
  "Europe/Jersey": "UK",
  "Europe/Dublin": "Ireland",
  "Europe/Paris": "France",
  "Europe/Berlin": "Germany",
  "Europe/Amsterdam": "Netherlands",
  "Europe/Brussels": "Belgium",
  "Europe/Madrid": "Spain",
  "Europe/Rome": "Italy",
  "Europe/Lisbon": "Portugal",
  "Europe/Zurich": "Switzerland",
  "Europe/Vienna": "Austria",
  "Europe/Stockholm": "Sweden",
  "Europe/Oslo": "Norway",
  "Europe/Copenhagen": "Denmark",
  "Europe/Helsinki": "Finland",
  "Europe/Warsaw": "Poland",
  "Europe/Prague": "Czechia",
  "Europe/Budapest": "Hungary",
  "Europe/Athens": "Greece",
  "Europe/Bucharest": "Romania",
  "Europe/Sofia": "Bulgaria",
  "Europe/Kiev": "Ukraine",
  "Europe/Kyiv": "Ukraine",
  "Europe/Moscow": "Russia",
  "Europe/Istanbul": "Turkey",
  "Atlantic/Reykjavik": "Iceland",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Phoenix": "US",
  "America/Anchorage": "US",
  "Pacific/Honolulu": "US",
  "America/Toronto": "Canada",
  "America/Vancouver": "Canada",
  "America/Edmonton": "Canada",
  "America/Winnipeg": "Canada",
  "America/Halifax": "Canada",
  "America/St_Johns": "Canada",
  "America/Mexico_City": "Mexico",
  "America/Cancun": "Mexico",
  "America/Tijuana": "Mexico",
  "America/Sao_Paulo": "Brazil",
  "America/Argentina/Buenos_Aires": "Argentina",
  "America/Bogota": "Colombia",
  "America/Lima": "Peru",
  "America/Santiago": "Chile",
  "Africa/Lagos": "Nigeria",
  "Africa/Accra": "Ghana",
  "Africa/Nairobi": "Kenya",
  "Africa/Johannesburg": "South Africa",
  "Africa/Cairo": "Egypt",
  "Africa/Casablanca": "Morocco",
  "Asia/Dubai": "UAE",
  "Asia/Riyadh": "Saudi Arabia",
  "Asia/Qatar": "Qatar",
  "Asia/Kolkata": "India",
  "Asia/Calcutta": "India",
  "Asia/Karachi": "Pakistan",
  "Asia/Dhaka": "Bangladesh",
  "Asia/Colombo": "Sri Lanka",
  "Asia/Bangkok": "Thailand",
  "Asia/Singapore": "Singapore",
  "Asia/Hong_Kong": "Hong Kong",
  "Asia/Shanghai": "China",
  "Asia/Taipei": "Taiwan",
  "Asia/Seoul": "South Korea",
  "Asia/Tokyo": "Japan",
  "Asia/Jakarta": "Indonesia",
  "Asia/Manila": "Philippines",
  "Asia/Ho_Chi_Minh": "Vietnam",
  "Australia/Sydney": "Australia",
  "Australia/Melbourne": "Australia",
  "Australia/Brisbane": "Australia",
  "Australia/Perth": "Australia",
  "Australia/Adelaide": "Australia",
  "Pacific/Auckland": "New Zealand",
};

export const DEFAULT_TIME_ZONE = "Europe/London";

export function detectTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

export function countryForTimeZone(timeZone: string) {
  if (ZONE_COUNTRY[timeZone]) return ZONE_COUNTRY[timeZone];
  if (timeZone.startsWith("America/Argentina")) return "Argentina";
  if (timeZone.startsWith("America/Indiana") || timeZone.startsWith("America/Kentucky") || timeZone.startsWith("America/North_Dakota") || timeZone.startsWith("America/Boise") || timeZone.startsWith("America/Detroit")) {
    return "US";
  }
  if (timeZone.startsWith("America/")) return "US";
  if (timeZone.startsWith("Australia/")) return "Australia";
  if (timeZone.startsWith("Europe/")) return "Europe";
  if (timeZone.startsWith("Africa/")) return "Africa";
  if (timeZone.startsWith("Asia/")) return "Asia";
  const city = timeZone.split("/").pop()?.replace(/_/g, " ");
  return city || timeZone;
}

export function formatZoneClock(date: Date, timeZone: string) {
  return date.toLocaleTimeString("en-GB", {
    timeZone,
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function formatZoneDate(date: Date, timeZone: string) {
  return date.toLocaleDateString("en-GB", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
