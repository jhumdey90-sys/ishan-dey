/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { WeatherData } from "../types";
import { getWeatherStyle, formatDay } from "../utils/weather";

interface DailyForecastProps {
  weather: WeatherData;
  isFahrenheit: boolean;
}

export default function DailyForecast({ weather, isFahrenheit }: DailyForecastProps) {
  const daily = weather.daily;

  // Compile daily items
  const dailyItems = daily.time.map((time, index) => {
    const code = daily.weather_code[index];
    const tempMax = daily.temperature_2m_max[index];
    const tempMin = daily.temperature_2m_min[index];
    const rainProb = daily.precipitation_probability_max[index];

    // Convert if Fahrenheit
    const maxVal = isFahrenheit ? Math.round((tempMax * 9) / 5 + 32) : Math.round(tempMax);
    const minVal = isFahrenheit ? Math.round((tempMin * 9) / 5 + 32) : Math.round(tempMin);

    return {
      time,
      code,
      maxVal,
      minVal,
      rainProb,
    };
  });

  // Calculate the weekly min and max to scale the horizontal capsules
  const weekMin = Math.min(...dailyItems.map((item) => item.minVal));
  const weekMax = Math.max(...dailyItems.map((item) => item.maxVal));
  const weekRange = weekMax - weekMin || 1;

  return (
    <motion.div
      id="daily-forecast-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl h-full flex flex-col justify-between hover:border-cyan-400/20 transition-all duration-500"
    >
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 id="daily-forecast-heading" className="text-xs uppercase tracking-[0.3em] font-semibold opacity-85">
            7-Day Outlook
          </h3>
        </div>

        {/* Forecast entries */}
        <div className="space-y-3.5">
          {dailyItems.map((item, index) => {
            const style = getWeatherStyle(item.code, 1); // standard day representation
            const Icon = style.icon;

            const isToday = index === 0;

            // Calculate capsule sizing percentages relative to weekly bounds
            const leftOffset = ((item.minVal - weekMin) / weekRange) * 100;
            const barWidth = ((item.maxVal - item.minVal) / weekRange) * 100;

            return (
              <div
                key={item.time}
                id={`daily-row-${index}`}
                className="flex items-center justify-between gap-4 py-2 hover:bg-white/5 px-2.5 rounded-2xl transition-all duration-300"
              >
                {/* Day name & date */}
                <div className="w-24 flex flex-col">
                  <span className={`text-sm font-sans font-bold ${isToday ? "text-cyan-400 font-extrabold" : "text-white"}`}>
                    {isToday ? "Today" : formatDay(item.time, true)}
                  </span>
                  <span className="text-[10px] text-white/40 font-medium">
                    {new Date(item.time).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>

                {/* Weather icon & rain chance */}
                <div className="flex items-center gap-1.5 w-14">
                  <Icon
                    className="w-4.5 h-4.5 stroke-[2] shrink-0"
                    style={{ color: style.themeColor }}
                  />
                  {item.rainProb > 0 ? (
                    <span className="text-[10px] font-mono font-bold text-sky-400">
                      {item.rainProb}%
                    </span>
                  ) : (
                    <span className="text-[10px] text-white/25">-</span>
                  )}
                </div>

                {/* Temperature capsule bar relative to the week's min/max */}
                <div className="flex-1 flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-white/30 w-7 text-right">
                    {item.minVal}°
                  </span>

                  {/* Horizontal gauge capsule */}
                  <div className="flex-1 h-1.5 rounded-full bg-white/10 relative overflow-hidden">
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 shadow-inner"
                      style={{
                        left: `${leftOffset}%`,
                        width: `${Math.max(barWidth, 6)}%`, // minimum width so capsule is visible
                      }}
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-white w-7 text-left">
                    {item.maxVal}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
