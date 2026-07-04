/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { motion } from "motion/react";
import { CloudRain } from "lucide-react";
import { WeatherData } from "../types";
import { getWeatherStyle, formatHour } from "../utils/weather";

interface HourlyChartProps {
  weather: WeatherData;
  isFahrenheit: boolean;
}

export default function HourlyChart({ weather, isFahrenheit }: HourlyChartProps) {
  const hourly = weather.hourly;
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current hour index or start from now
  const now = new Date();
  const currentHourString = now.toISOString().substring(0, 14) + "00";
  let startIndex = hourly.time.findIndex((t) => t.startsWith(currentHourString));
  if (startIndex === -1) startIndex = 0;

  // Take the next 24 hours
  const next24Hours = hourly.time.slice(startIndex, startIndex + 24);
  const temperatures = hourly.temperature_2m.slice(startIndex, startIndex + 24);
  const weatherCodes = hourly.weather_code.slice(startIndex, startIndex + 24);
  const rainProbs = hourly.precipitation_probability.slice(startIndex, startIndex + 24);

  // Convert temperatures if Fahrenheit
  const displayTemps = temperatures.map((temp) =>
    isFahrenheit ? Math.round((temp * 9) / 5 + 32) : Math.round(temp)
  );

  const minTemp = Math.min(...displayTemps);
  const maxTemp = Math.max(...displayTemps);
  const tempRange = maxTemp - minTemp || 1;

  // Chart layout parameters
  const hourWidth = 72; // width of each hourly column
  const chartHeight = 80; // height allocated for the line
  const paddingY = 15; // padding top and bottom inside the chart area
  const totalWidth = hourWidth * next24Hours.length;

  // Calculate coordinates for the temperature points
  const points = displayTemps.map((temp, index) => {
    const x = index * hourWidth + hourWidth / 2;
    // Map temperature to Y coordinate (inverted because Y=0 is the top)
    const y = chartHeight - paddingY - ((temp - minTemp) / tempRange) * (chartHeight - 2 * paddingY);
    return { x, y, temp };
  });

  // Construct SVG line path (smooth bezier curve)
  let linePath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      // Midpoint control points for smooth cubic bezier
      const cpX1 = curr.x + hourWidth / 2;
      const cpY1 = curr.y;
      const cpX2 = next.x - hourWidth / 2;
      const cpY2 = next.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${next.x} ${next.y}`;
    }
  }

  // Path for gradient area underneath the temperature line
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`
    : "";

  return (
    <motion.div
      id="hourly-forecast-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl hover:border-cyan-400/20 transition-all duration-500"
    >
      {/* Immersive Header matching mockup */}
      <div className="flex items-center justify-between mb-6">
        <h3 id="hourly-forecast-heading" className="text-xs uppercase tracking-[0.3em] font-semibold opacity-85">
          Hourly Conditions
        </h3>
        <div className="h-px flex-1 mx-8 bg-white/10 hidden sm:block"></div>
        <span className="text-[10px] uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full font-semibold select-none">
          Next 24 Hours
        </span>
      </div>

      {/* Horizontal Scroll Wrapper */}
      <div
        id="hourly-scroll-container"
        ref={containerRef}
        className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-3 touch-pan-x cursor-grab active:cursor-grabbing"
      >
        <div className="relative" style={{ width: `${totalWidth}px` }}>
          {/* Hour info columns */}
          <div className="flex relative z-10 select-none">
            {next24Hours.map((time, index) => {
              const code = weatherCodes[index];
              const isDay = new Date(time).getHours() >= 6 && new Date(time).getHours() < 18 ? 1 : 0;
              const style = getWeatherStyle(code, isDay);
              const Icon = style.icon;
              const isCurrent = index === 0;

              return (
                <div
                  key={time}
                  id={`hourly-item-${index}`}
                  className={`flex flex-col items-center justify-between text-center shrink-0 py-3.5 ${
                    isCurrent
                      ? "bg-white/10 rounded-[20px] border border-cyan-400/30 text-cyan-400 font-bold"
                      : "opacity-80"
                  }`}
                  style={{ width: `${hourWidth}px` }}
                >
                  {/* Time */}
                  <span className={`text-[10px] font-sans font-bold uppercase ${isCurrent ? "text-cyan-400" : "opacity-50"}`}>
                    {isCurrent ? "Now" : formatHour(time)}
                  </span>

                  {/* Icon */}
                  <div className="my-2.5">
                    <Icon
                      className="w-7 h-7 stroke-[1.8]"
                      style={{ color: isCurrent ? "#22d3ee" : style.themeColor }}
                    />
                  </div>

                  {/* Precipitation Prob */}
                  <div className="h-4 flex items-center justify-center mb-1">
                    {rainProbs[index] > 0 ? (
                      <span className="text-[9px] font-mono font-bold text-sky-400 flex items-center gap-0.5">
                        <CloudRain className="w-2.5 h-2.5" />
                        {rainProbs[index]}%
                      </span>
                    ) : (
                      <span className="text-[9px] text-transparent">-</span>
                    )}
                  </div>

                  {/* Space for the temperature value above the chart */}
                  <span className="text-sm font-sans font-medium text-white z-20 mt-1">
                    {points[index]?.temp}°
                  </span>
                </div>
              );
            })}
          </div>

          {/* Connected SVG Sparkline chart overlay */}
          <div className="absolute left-0 bottom-0 pointer-events-none select-none w-full" style={{ height: `${chartHeight}px` }}>
            <svg
              className="w-full h-full overflow-visible"
              viewBox={`0 0 ${totalWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <defs>
                {/* Gradient for area fill under the line */}
                <linearGradient id="chart-temp-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </linearGradient>

                {/* Glow filter for line path */}
                <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#22d3ee" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Area path */}
              {areaPath && (
                <path
                  d={areaPath}
                  fill="url(#chart-temp-gradient)"
                />
              )}

              {/* Line path */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#line-glow)"
                />
              )}

              {/* Individual points on the line */}
              {points.map((p, index) => (
                <circle
                  key={index}
                  cx={p.x}
                  cy={p.y}
                  r="3"
                  className="fill-slate-900 stroke-cyan-400 stroke-[2]"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
