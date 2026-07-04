/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Trash2, Globe, ArrowUpRight } from "lucide-react";
import { PinnedLocation } from "../types";
import { getWeatherStyle } from "../utils/weather";

interface FavoritesDashboardProps {
  pinnedLocations: PinnedLocation[];
  onSelectCity: (latitude: number, longitude: number, name: string, country: string, countryCode: string, admin1?: string) => void;
  onRemoveCity: (id: string) => void;
  isFahrenheit: boolean;
}

export default function FavoritesDashboard({
  pinnedLocations,
  onSelectCity,
  onRemoveCity,
  isFahrenheit,
}: FavoritesDashboardProps) {
  return (
    <motion.div
      id="favorites-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-[32px] bg-white/5 backdrop-blur-2xl border border-white/10 p-6 shadow-xl hover:border-cyan-400/20 transition-all duration-500"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 id="favorites-dashboard-heading" className="text-xs uppercase tracking-[0.3em] font-semibold opacity-85">
          Saved Stations
        </h3>
        <span className="text-[10px] uppercase tracking-widest opacity-40 font-bold">
          {pinnedLocations.length} active stations
        </span>
      </div>

      {pinnedLocations.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-[24px] border border-dashed border-white/10 bg-white/5">
          <Heart className="w-8 h-8 mx-auto text-white/30 mb-2 animate-pulse" />
          <p className="text-sm text-white/60 font-sans font-medium">
            No saved weather stations. Save locations using the heart button above to view live feeds simultaneously!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {pinnedLocations.map((loc) => {
              // Get style of city if weather is cached
              const hasWeather = loc.temp !== undefined && loc.weatherCode !== undefined;
              const style = hasWeather
                ? getWeatherStyle(loc.weatherCode!, 1)
                : {
                    description: "Loading...",
                    icon: Globe,
                    bgGradient: "from-slate-800 to-slate-900",
                    themeColor: "#94a3b8",
                  };
              const Icon = style.icon;

              const displayTemp = hasWeather
                ? isFahrenheit
                  ? `${Math.round((loc.temp! * 9) / 5 + 32)}°`
                  : `${Math.round(loc.temp!)}°`
                : "--";

              return (
                <motion.div
                  key={loc.id}
                  id={`favorite-card-${loc.id}`}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="group relative rounded-[24px] overflow-hidden bg-white/5 backdrop-blur-md p-5 border border-white/5 hover:border-cyan-400/40 hover:bg-white/10 cursor-pointer flex flex-col justify-between h-36 transition-all duration-300 shadow-lg"
                  onClick={() => onSelectCity(loc.latitude, loc.longitude, loc.name, loc.country, loc.countryCode, loc.admin1)}
                >
                  {/* Floating decorative light flare */}
                  <div className="absolute -right-6 -top-6 w-16 h-16 rounded-full bg-white/5 blur-xl group-hover:bg-cyan-400/10 transition-all duration-500 pointer-events-none" />

                  {/* Top: City info & delete button */}
                  <div className="flex items-start justify-between gap-2 z-10">
                    <div className="overflow-hidden">
                      <h4 className="font-sans font-extrabold text-base leading-tight truncate text-white">
                        {loc.name}
                      </h4>
                      <p className="text-[10px] opacity-40 font-sans truncate font-medium">
                        {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      id={`remove-favorite-btn-${loc.id}`}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent select trigger
                        onRemoveCity(loc.id);
                      }}
                      className="p-1.5 rounded-full bg-white/5 hover:bg-rose-500/15 text-slate-300 hover:text-rose-400 transition-all duration-300"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom: Temp & Icon */}
                  <div className="flex items-end justify-between mt-auto z-10">
                    <div>
                      <div className="text-3xl font-sans font-light tracking-tight text-white leading-none">
                        {displayTemp}
                      </div>
                      <div className="text-[10px] opacity-40 mt-1 font-bold uppercase tracking-wider truncate max-w-[120px]">
                        {style.description}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Icon
                        className="w-8 h-8 stroke-[1.8]"
                        style={{ color: style.themeColor }}
                      />
                      <span className="text-[8px] font-extrabold tracking-widest uppercase opacity-35 flex items-center gap-0.5 group-hover:opacity-100 group-hover:text-cyan-400 transition-all">
                        VIEW <ArrowUpRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
