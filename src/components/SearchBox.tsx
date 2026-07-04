/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GeocodingResult } from "../types";

interface SearchBoxProps {
  onSelectCity: (city: GeocodingResult) => void;
  onGeolocate: () => void;
  isGeolocating: boolean;
}

export default function SearchBox({ onSelectCity, onGeolocate, isGeolocating }: SearchBoxProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced geocoding fetch
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setError(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
            query
          )}&count=6&language=en&format=json`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch location suggestions.");
        }
        const data = await response.json();
        setSuggestions(data.results || []);
        setShowDropdown(true);
      } catch (err: any) {
        console.error(err);
        setError("Error finding cities.");
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (city: GeocodingResult) => {
    onSelectCity(city);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setError(null);
  };

  return (
    <div id="search-box-container" ref={containerRef} className="relative w-full max-w-lg mx-auto z-50">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-white/40">
            {isLoading ? (
              <Loader2 className="w-4.5 h-4.5 animate-spin text-cyan-400" />
            ) : (
              <Search className="w-4.5 h-4.5" />
            )}
          </div>
          <input
            id="search-input"
            type="text"
            className="w-full pl-10 pr-10 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/30 shadow-lg transition-all text-sm font-sans"
            placeholder="Search city (e.g. Paris, Tokyo, New York...)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
          />
          {query && (
            <button
              id="clear-search-btn"
              onClick={handleClear}
              className="absolute inset-y-0 right-3.5 flex items-center text-white/40 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          id="geolocate-btn"
          onClick={onGeolocate}
          disabled={isGeolocating}
          className="p-3 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:bg-white/10 disabled:opacity-50 text-cyan-400 hover:text-cyan-300 shadow-lg transition-all flex items-center justify-center active:scale-95 shrink-0"
          title="Use current location"
        >
          {isGeolocating ? (
            <Loader2 className="w-4.5 h-4.5 animate-spin text-cyan-400" />
          ) : (
            <MapPin className="w-4.5 h-4.5" />
          )}
        </button>
      </div>

      <AnimatePresence>
        {showDropdown && (suggestions.length > 0 || error) && (
          <motion.div
            id="search-suggestions"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute w-full mt-2 rounded-[24px] bg-[#0f172a]/95 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto"
          >
            {error && (
              <div className="p-4 text-sm text-rose-400 text-center">
                {error}
              </div>
            )}
            {!error && suggestions.length > 0 && (
              <ul className="divide-y divide-white/5">
                {suggestions.map((city) => (
                  <li key={city.id}>
                    <button
                      id={`suggestion-city-${city.id}`}
                      onClick={() => handleSelect(city)}
                      className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between transition-colors text-white/85 group"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-cyan-400 transition-colors">
                          {city.name}
                        </span>
                        <span className="text-xs text-white/40 font-medium">
                          {city.admin1 ? `${city.admin1}, ` : ""}{city.country}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-white/40 uppercase">
                        {city.country_code}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
