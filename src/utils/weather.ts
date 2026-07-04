/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Snowflake,
  Wind,
  Droplets,
  Eye,
  Sunset,
  Sunrise,
  Gauge,
  HelpCircle,
  LucideIcon,
} from "lucide-react";

export interface WeatherStyle {
  description: string;
  icon: LucideIcon;
  bgGradient: string; // Tailwind gradient classes
  textAccent: string;  // Color accent for visual elements
  themeColor: string; // Color for icons/header
}

/**
 * Maps WMO Weather Interpretation Codes (0-99) to human-readable text,
 * an appropriate Lucide icon, and an elegant background gradient.
 */
export function getWeatherStyle(code: number, isDay: number = 1): WeatherStyle {
  const isNight = isDay === 0;

  switch (code) {
    // 0: Clear Sky
    case 0:
      return {
        description: isNight ? "Clear Night" : "Sunny",
        icon: isNight ? Moon : Sun,
        bgGradient: isNight
          ? "from-slate-950 via-indigo-950 to-slate-900 text-slate-100"
          : "from-amber-400 via-orange-400 to-amber-500 text-amber-950",
        textAccent: isNight ? "text-indigo-400" : "text-orange-950",
        themeColor: isNight ? "#818cf8" : "#d97706",
      };

    // 1, 2, 3: Mainly Clear, Partly Cloudy, and Overcast
    case 1:
    case 2:
      return {
        description: isNight ? "Partly Cloudy" : "Partly Cloudy",
        icon: isNight ? CloudMoon : CloudSun,
        bgGradient: isNight
          ? "from-slate-900 via-slate-950 to-indigo-950 text-slate-200"
          : "from-sky-400 via-blue-400 to-sky-300 text-sky-950",
        textAccent: isNight ? "text-blue-400" : "text-blue-900",
        themeColor: isNight ? "#60a5fa" : "#1d4ed8",
      };
    case 3:
      return {
        description: "Overcast",
        icon: Cloud,
        bgGradient: isNight
          ? "from-slate-800 via-slate-900 to-slate-950 text-slate-300"
          : "from-slate-400 via-slate-500 to-slate-600 text-slate-50",
        textAccent: isNight ? "text-slate-400" : "text-slate-200",
        themeColor: isNight ? "#94a3b8" : "#475569",
      };

    // 45, 48: Fog and depositing rime fog
    case 45:
    case 48:
      return {
        description: "Foggy",
        icon: Eye,
        bgGradient: isNight
          ? "from-zinc-900 via-stone-950 to-zinc-950 text-zinc-300"
          : "from-stone-300 via-stone-400 to-stone-500 text-stone-900",
        textAccent: isNight ? "text-stone-400" : "text-stone-700",
        themeColor: isNight ? "#a8a29e" : "#57534e",
      };

    // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
    case 51:
    case 53:
    case 55:
      return {
        description: "Drizzle",
        icon: CloudDrizzle,
        bgGradient: isNight
          ? "from-slate-900 via-indigo-950 to-sky-950 text-sky-200"
          : "from-cyan-400 via-sky-500 to-blue-500 text-cyan-950",
        textAccent: isNight ? "text-cyan-400" : "text-sky-900",
        themeColor: isNight ? "#22d3ee" : "#0369a1",
      };

    // 56, 57: Freezing Drizzle: Light and dense intensity
    // 66, 67: Freezing Rain: Light and heavy intensity
    case 56:
    case 57:
    case 66:
    case 67:
      return {
        description: "Freezing Rain",
        icon: CloudSnow,
        bgGradient: isNight
          ? "from-indigo-950 via-slate-900 to-zinc-950 text-blue-200"
          : "from-indigo-300 via-sky-400 to-blue-400 text-indigo-950",
        textAccent: isNight ? "text-indigo-400" : "text-blue-900",
        themeColor: isNight ? "#818cf8" : "#1d4ed8",
      };

    // 61, 63, 65: Rain: Slight, moderate and heavy intensity
    // 80, 81, 82: Rain showers: Slight, moderate, and violent
    case 61:
    case 63:
    case 65:
    case 80:
    case 81:
    case 82:
      return {
        description: code === 65 || code === 82 ? "Heavy Rain" : "Rainy",
        icon: CloudRain,
        bgGradient: isNight
          ? "from-slate-950 via-blue-950 to-indigo-950 text-blue-200"
          : "from-blue-600 via-indigo-500 to-sky-600 text-blue-50",
        textAccent: isNight ? "text-sky-400" : "text-sky-100",
        themeColor: isNight ? "#38bdf8" : "#ffffff",
      };

    // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
    // 77: Snow grains
    // 85, 86: Snow showers slight and heavy
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return {
        description: "Snowy",
        icon: Snowflake,
        bgGradient: isNight
          ? "from-sky-950 via-slate-900 to-slate-950 text-sky-100"
          : "from-teal-300 via-cyan-200 to-sky-300 text-sky-950",
        textAccent: isNight ? "text-sky-300" : "text-teal-900",
        themeColor: isNight ? "#7dd3fc" : "#0d9488",
      };

    // 95: Thunderstorm: Slight or moderate
    // 96, 99: Thunderstorm with slight and heavy hail
    case 95:
    case 96:
    case 99:
      return {
        description: "Thunderstorm",
        icon: CloudLightning,
        bgGradient: isNight
          ? "from-stone-950 via-zinc-900 to-indigo-950 text-amber-200"
          : "from-slate-800 via-indigo-900 to-violet-950 text-amber-300",
        textAccent: "text-amber-400",
        themeColor: "#fbbf24",
      };

    default:
      return {
        description: "Unknown",
        icon: HelpCircle,
        bgGradient: "from-slate-500 to-slate-700 text-white",
        textAccent: "text-slate-300",
        themeColor: "#cbd5e1",
      };
  }
}

/**
 * Converts Celsius to Fahrenheit.
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Format hourly label. E.g., "14:00" or "02:00 PM"
 */
export function formatHour(isoString: string, is12Hour: boolean = true): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  if (is12Hour) {
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours} ${ampm}`;
  } else {
    const hours = String(date.getHours()).padStart(2, "0");
    return `${hours}:00`;
  }
}

/**
 * Format day of the week label. E.g., "Mon", "Tue" or "Today" if matching current day
 */
export function formatDay(isoString: string, isTodayCheck: boolean = true): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  if (isTodayCheck) {
    const today = new Date();
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return "Today";
    }
  }

  return date.toLocaleDateString("en-US", { weekday: "short" });
}

/**
 * Format full date. E.g. "Saturday, July 4, 2026"
 */
export function formatFullDate(isoString: string): string {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Maps wind direction degree to a cardinal direction (N, NE, E, SE, etc.)
 */
export function getWindDirection(degree: number): string {
  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(((degree % 360) / 22.5)) % 16;
  return directions[index];
}
