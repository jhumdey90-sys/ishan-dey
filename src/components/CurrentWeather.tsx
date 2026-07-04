/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  Wind,
  Droplets,
  Gauge,
  Sunrise,
  Sunset,
  Umbrella,
  Heart,
  Thermometer,
  Compass,
  Sun,
  MapPin,
} from "lucide-react";
import { motion } from "motion/react";
import { GeocodingResult, WeatherData } from "../types";
import { getWeatherStyle, getWindDirection, formatFullDate } from "../utils/weather";

interface CurrentWeatherProps {
  city: GeocodingResult;
  weather: WeatherData;
  isFahrenheit: boolean;
  onToggleUnit: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
}

export default function CurrentWeather({
  city,
  weather,
  isFahrenheit,
  onToggleUnit,
  isPinned,
  onTogglePin,
}: CurrentWeatherProps) {
  const current = weather.current;
  const daily = weather.daily;

  const style = getWeatherStyle(current.weather_code, current.is_day);
  const Icon = style.icon;

  // Unit conversions
  const tempC = Math.round(current.temperature_2m);
  const tempF = Math.round((current.temperature_2m * 9) / 5 + 32);
  const displayTempNum = isFahrenheit ? tempF : tempC;
  const unitLabel = isFahrenheit ? "f" : "c";

  const feelsLikeC = Math.round(current.apparent_temperature);
  const feelsLikeF = Math.round((current.apparent_temperature * 9) / 5 + 32);
  const displayFeelsLike = isFahrenheit ? `${feelsLikeF}°` : `${feelsLikeC}°`;

  // Get UV Index for today
  const uvIndex = Math.round(daily.uv_index_max[0] || 0);
  const getUVCategory = (uv: number) => {
    if (uv <= 2) return { text: "Low", color: "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" };
    if (uv <= 5) return { text: "Moderate", color: "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]" };
    if (uv <= 7) return { text: "High", color: "bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.5)]" };
    return { text: "Very High", color: "bg-rose-400 shadow-[0_0_10px_rgba(248,113,113,0.5)]" };
  };
  const uvCategory = getUVCategory(uvIndex);

  const windDir = getWindDirection(current.wind_direction_10m);

  return (
    <motion.div
      id="current-weather-hero"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-[32px] p-6 md:p-8 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col justify-between h-full hover:border-white/15 transition-all duration-500"
    >
      {/* Soft integrated ambient visual element mapping the current weather style */}
      <div className={`absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[90px] opacity-15 pointer-events-none bg-current`} style={{ color: style.themeColor }} />

      {/* Top Bar Location & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <MapPin className="w-4 h-4 text-cyan-400 opacity-85" />
            <span className="text-xs uppercase tracking-[0.2em] opacity-60 font-semibold">
              {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
            </span>
            <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-400 uppercase">
              {city.country_code}
            </span>
          </div>
          <h2 id="current-city-name" className="text-3xl md:text-4xl font-display font-bold tracking-tight text-white mt-1">
            {city.name}
          </h2>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Favorite pin action */}
          <button
            id="favorite-toggle-btn"
            onClick={onTogglePin}
            className={`p-2.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
              isPinned
                ? "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.15)]"
                : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-300"
            }`}
            title={isPinned ? "Remove Location" : "Save Location"}
          >
            <Heart className={`w-4 h-4 ${isPinned ? "fill-rose-400" : ""}`} />
          </button>

          {/* Unit Switch metric toggle */}
          <button
            id="unit-toggle-btn"
            onClick={onToggleUnit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 text-xs font-bold font-sans tracking-widest text-slate-200 transition-all duration-300 uppercase"
          >
            <Thermometer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unit: °{unitLabel}</span>
          </button>
        </div>
      </div>

      {/* Main Hero Temperature display */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 z-10 relative mb-8">
        <div>
          <h1 id="hero-temp-value" className="text-[90px] md:text-[130px] leading-none font-extralight tracking-tighter text-white -ml-1">
            {displayTempNum}°
            <span className="text-3xl md:text-5xl align-top mt-5 inline-block text-cyan-400 font-light select-none uppercase">
              {unitLabel}
            </span>
          </h1>

          <div className="flex flex-col mt-2">
            <span id="hero-weather-desc" className="text-2xl md:text-3xl font-light text-white tracking-wide flex items-center gap-2">
              <Icon className="w-8 h-8 inline-block stroke-[1.5]" style={{ color: style.themeColor }} />
              {style.description}
            </span>
            <span id="hero-feels-like" className="text-xs opacity-60 mt-1.5 tracking-wide">
              Feels like <span className="font-semibold text-white">{displayFeelsLike}</span> • Winds coming from {windDir}
            </span>
          </div>
        </div>

        {/* Sunrise / Sunset visual element */}
        <div className="flex gap-4 bg-white/5 border border-white/10 px-5 py-4 rounded-[24px] backdrop-blur-md shrink-0 w-full md:w-auto">
          <div className="flex items-center gap-2.5 flex-1 md:flex-none">
            <Sunrise className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-40 font-bold">Sunrise</span>
              <span className="text-sm font-mono font-bold text-white">
                {new Date(daily.sunrise[0] || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
          <div className="w-px bg-white/10 self-stretch" />
          <div className="flex items-center gap-2.5 flex-1 md:flex-none">
            <Sunset className="w-5 h-5 text-indigo-300 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider opacity-40 font-bold">Sunset</span>
              <span className="text-sm font-mono font-bold text-white">
                {new Date(daily.sunset[0] || "").toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid details (Micro-Metrics with custom progress lines) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 z-10 relative">
        {/* Wind Speed */}
        <div id="metric-wind" className="bg-white/5 p-4 rounded-[24px] border border-white/5 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-2 font-bold flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-cyan-400" />
              <span>Wind Speed</span>
            </div>
            <div className="text-xl font-light text-white">
              {current.wind_speed_10m} <span className="text-xs opacity-50">km/h</span>
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all duration-500"
              style={{ width: `${Math.min((current.wind_speed_10m / 60) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Humidity */}
        <div id="metric-humidity" className="bg-white/5 p-4 rounded-[24px] border border-white/5 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-2 font-bold flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-indigo-400" />
              <span>Humidity</span>
            </div>
            <div className="text-xl font-light text-white">
              {current.relative_humidity_2m}%
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-400 transition-all duration-500"
              style={{ width: `${current.relative_humidity_2m}%` }}
            />
          </div>
        </div>

        {/* Rain Prob */}
        <div id="metric-rain" className="bg-white/5 p-4 rounded-[24px] border border-white/5 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-2 font-bold flex items-center gap-1.5">
              <Umbrella className="w-3.5 h-3.5 text-sky-400" />
              <span>Precipitation</span>
            </div>
            <div className="text-xl font-light text-white">
              {daily.precipitation_probability_max[0] || 0}%
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-400 transition-all duration-500"
              style={{ width: `${daily.precipitation_probability_max[0] || 0}%` }}
            />
          </div>
        </div>

        {/* UV Index */}
        <div id="metric-uv" className="bg-white/5 p-4 rounded-[24px] border border-white/5 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-2 font-bold flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>UV Index</span>
            </div>
            <div className="text-xl font-light text-white">
              {uvIndex}
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full ${uvCategory.color} transition-all duration-500`}
              style={{ width: `${Math.min((uvIndex / 12) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Pressure */}
        <div id="metric-pressure" className="bg-white/5 p-4 rounded-[24px] border border-white/5 hover:border-cyan-400/30 transition-all duration-300 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-[9px] uppercase tracking-[0.2em] opacity-40 mb-2 font-bold flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pressure</span>
            </div>
            <div className="text-xl font-light text-white">
              {current.pressure_msl} <span className="text-xs opacity-50">hPa</span>
            </div>
          </div>
          <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(Math.max(((current.pressure_msl - 950) / 100) * 100, 5), 100)}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
