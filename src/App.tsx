/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  CloudSun,
  ShieldAlert,
  Loader2,
  Heart,
  HelpCircle,
  Thermometer,
  Compass,
  ArrowUpRight,
  Info,
  Map,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { GeocodingResult, WeatherData, PinnedLocation } from "./types";
import SearchBox from "./components/SearchBox";
import CurrentWeather from "./components/CurrentWeather";
import HourlyChart from "./components/HourlyChart";
import DailyForecast from "./components/DailyForecast";
import FavoritesDashboard from "./components/FavoritesDashboard";

const DEFAULT_CITY: GeocodingResult = {
  id: 5128581,
  name: "New York",
  latitude: 40.71427,
  longitude: -74.00597,
  country: "United States",
  country_code: "US",
  admin1: "New York",
  timezone: "America/New_York",
};

const DEFAULT_PINNED: PinnedLocation[] = [
  {
    id: "london-gb",
    name: "London",
    country: "United Kingdom",
    countryCode: "GB",
    latitude: 51.50853,
    longitude: -0.12574,
  },
  {
    id: "tokyo-jp",
    name: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    latitude: 35.6895,
    longitude: 139.6917,
  },
  {
    id: "sydney-au",
    name: "Sydney",
    country: "Australia",
    countryCode: "AU",
    latitude: -33.86785,
    longitude: 151.20732,
  },
  {
    id: "cairo-eg",
    name: "Cairo",
    country: "Egypt",
    countryCode: "EG",
    latitude: 30.06263,
    longitude: 31.24967,
  },
];

export default function App() {
  const [activeCity, setActiveCity] = useState<GeocodingResult>(() => {
    const saved = localStorage.getItem("weather_active_city");
    return saved ? JSON.parse(saved) : DEFAULT_CITY;
  });

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isFahrenheit, setIsFahrenheit] = useState<boolean>(() => {
    const saved = localStorage.getItem("weather_unit_f");
    return saved ? JSON.parse(saved) : false;
  });

  const [pinnedLocations, setPinnedLocations] = useState<PinnedLocation[]>(() => {
    const saved = localStorage.getItem("weather_pinned_locations");
    return saved ? JSON.parse(saved) : DEFAULT_PINNED;
  });

  // Immersive dynamic clock state
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Save configurations to localStorage
  useEffect(() => {
    localStorage.setItem("weather_active_city", JSON.stringify(activeCity));
  }, [activeCity]);

  useEffect(() => {
    localStorage.setItem("weather_unit_f", JSON.stringify(isFahrenheit));
  }, [isFahrenheit]);

  useEffect(() => {
    localStorage.setItem("weather_pinned_locations", JSON.stringify(pinnedLocations));
  }, [pinnedLocations]);

  // Fetch full weather for the active city
  const fetchWeather = async (lat: number, lon: number, timezone: string = "auto") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_probability_max,wind_speed_10m_max&timezone=${timezone}`
      );
      if (!response.ok) {
        throw new Error("Unable to load weather details. Please try again.");
      }
      const data: WeatherData = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while loading weather forecast.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(activeCity.latitude, activeCity.longitude, activeCity.timezone || "auto");
  }, [activeCity]);

  // Background weather loader for the favorite stations list
  useEffect(() => {
    let active = true;

    const loadPinnedWeather = async () => {
      const updated = [...pinnedLocations];
      let changed = false;

      // Map promises
      const promises = pinnedLocations.map(async (loc) => {
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code&timezone=auto`
          );
          if (res.ok) {
            const data = await res.json();
            return {
              id: loc.id,
              temp: data.current.temperature_2m,
              weatherCode: data.current.weather_code,
            };
          }
        } catch (e) {
          console.error("Error loading pinned weather", e);
        }
        return null;
      });

      const results = await Promise.all(promises);

      results.forEach((res) => {
        if (!res) return;
        const target = updated.find((l) => l.id === res.id);
        if (target && (target.temp !== res.temp || target.weatherCode !== res.weatherCode)) {
          target.temp = res.temp;
          target.weatherCode = res.weatherCode;
          changed = true;
        }
      });

      if (active && changed) {
        setPinnedLocations(updated);
      }
    };

    loadPinnedWeather();

    // Refresh every 5 minutes
    const interval = setInterval(loadPinnedWeather, 5 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pinnedLocations.length]);

  // Use current geolocation
  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGeolocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Attempt reverse geocoding to find city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          );

          let geoCity: GeocodingResult = {
            id: Date.now(),
            name: "My Location",
            latitude,
            longitude,
            country: "Unknown",
            country_code: "LOC",
            timezone: "auto",
          };

          if (response.ok) {
            const data = await response.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "My Location";
            const country = data.address.country || "Unknown";
            const country_code = (data.address.country_code || "LOC").toUpperCase();
            const state = data.address.state || data.address.region;

            geoCity = {
              id: Date.now(),
              name: city,
              latitude,
              longitude,
              country,
              country_code,
              admin1: state,
              timezone: "auto",
            };
          }

          setActiveCity(geoCity);
        } catch (err) {
          console.error("Reverse geocoding failed, falling back", err);
          setActiveCity({
            id: Date.now(),
            name: "Your Location",
            latitude,
            longitude,
            country: "Coordinates",
            country_code: "GPS",
            timezone: "auto",
          });
        } finally {
          setIsGeolocating(false);
        }
      },
      (err) => {
        console.error(err);
        setIsGeolocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location permission denied. Please allow location access or search manually.");
        } else {
          setError("Could not retrieve your location. Please search manually.");
        }
      }
    );
  };

  // Select city from favorite/dashboard list
  const handleSelectFromDashboard = (
    lat: number,
    lon: number,
    name: string,
    country: string,
    countryCode: string,
    admin1?: string
  ) => {
    setActiveCity({
      id: lat + lon,
      name,
      latitude: lat,
      longitude: lon,
      country,
      country_code: countryCode,
      admin1,
      timezone: "auto",
    });
    // Scroll smoothly to top forecast
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle Pinned/Favorite Status
  const isPinned = pinnedLocations.some(
    (loc) =>
      loc.latitude.toFixed(3) === activeCity.latitude.toFixed(3) &&
      loc.longitude.toFixed(3) === activeCity.longitude.toFixed(3)
  );

  const handleTogglePin = () => {
    if (isPinned) {
      setPinnedLocations(
        pinnedLocations.filter(
          (loc) =>
            !(
              loc.latitude.toFixed(3) === activeCity.latitude.toFixed(3) &&
              loc.longitude.toFixed(3) === activeCity.longitude.toFixed(3)
            )
        )
      );
    } else {
      const newPin: PinnedLocation = {
        id: `custom-${Date.now()}`,
        name: activeCity.name,
        country: activeCity.country,
        countryCode: activeCity.country_code,
        latitude: activeCity.latitude,
        longitude: activeCity.longitude,
        admin1: activeCity.admin1,
        temp: weatherData?.current.temperature_2m,
        weatherCode: weatherData?.current.weather_code,
      };
      setPinnedLocations([...pinnedLocations, newPin]);
    }
  };

  const handleRemoveCity = (id: string) => {
    setPinnedLocations(pinnedLocations.filter((loc) => loc.id !== id));
  };

  // Quick preset clicks
  const presets = [
    { name: "New York", lat: 40.7128, lon: -74.006, cc: "US" },
    { name: "Tokyo", lat: 35.6762, lon: 139.6503, cc: "JP" },
    { name: "London", lat: 51.5074, lon: -0.1278, cc: "GB" },
    { name: "Sydney", lat: -33.8688, lon: 151.2093, cc: "AU" },
    { name: "Paris", lat: 48.8566, lon: 2.3522, cc: "FR" },
  ];

  return (
    <div id="weather-forecast-app" className="min-h-screen relative text-slate-50 flex flex-col justify-between overflow-x-hidden selection:bg-cyan-500/30 selection:text-white" style={{ background: "radial-gradient(circle at 0% 0%, #1e293b 0%, #0f172a 100%)" }}>
      {/* Atmospheric Ambient Glowing Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ background: "#38bdf8" }} />
      <div className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-10 pointer-events-none" style={{ background: "#818cf8" }} />

      {/* Main container */}
      <div className="container mx-auto px-4 md:px-12 py-8 max-w-7xl relative z-10 flex-1 flex flex-col">
        {/* App Title & Header */}
        <header id="app-header" className="flex items-center justify-between py-6 mb-8 relative z-10 flex-wrap gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] animate-pulse" />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase opacity-75 font-sans">Atmos Live</span>
          </div>

          {/* Quick preset locations / Nav Pill */}
          <div id="presets-container" className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 overflow-x-auto scrollbar-thin max-w-full">
            {presets.map((p) => {
              const isSelected =
                Math.abs(activeCity.latitude - p.lat) < 0.1 &&
                Math.abs(activeCity.longitude - p.lon) < 0.1;

              return (
                <button
                  key={p.name}
                  id={`preset-btn-${p.name.toLowerCase().replace(" ", "-")}`}
                  onClick={() =>
                    handleSelectFromDashboard(p.lat, p.lon, p.name, p.name, p.cc)
                  }
                  className={`text-[10px] uppercase tracking-widest font-bold transition-all duration-300 px-3 py-1.5 rounded-full ${
                    isSelected
                      ? "text-cyan-400 bg-white/10 font-extrabold shadow-sm"
                      : "opacity-50 hover:opacity-100"
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold tracking-wide font-mono">
              {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
            <div className="text-[10px] uppercase tracking-widest opacity-40">
              {currentTime.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        </header>

        {/* Search Engine Row */}
        <section id="search-section" className="mb-8">
          <SearchBox
            onSelectCity={setActiveCity}
            onGeolocate={handleGeolocate}
            isGeolocating={isGeolocating}
          />
        </section>

        {/* Global errors display */}
        <AnimatePresence>
          {error && (
            <motion.div
              id="error-banner"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-300 text-sm flex items-center gap-3"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400" />
              <div className="flex-1">{error}</div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-bold hover:underline font-sans ml-2"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-8">
          {isLoading ? (
            /* skeleton loader */
            <div id="loader-skeleton" className="flex-1 flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mb-4" />
              <p className="text-sm text-slate-400 dark:text-slate-500 font-mono tracking-widest uppercase">
                Gathering satellite telemetry...
              </p>
            </div>
          ) : weatherData ? (
            <div className="space-y-8">
              {/* Top Row: Hero and 7-day forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-7 h-full">
                  <CurrentWeather
                    city={activeCity}
                    weather={weatherData}
                    isFahrenheit={isFahrenheit}
                    onToggleUnit={() => setIsFahrenheit(!isFahrenheit)}
                    isPinned={isPinned}
                    onTogglePin={handleTogglePin}
                  />
                </div>
                <div className="lg:col-span-5 h-full">
                  <DailyForecast weather={weatherData} isFahrenheit={isFahrenheit} />
                </div>
              </div>

              {/* Hourly Flow Chart */}
              <div>
                <HourlyChart weather={weatherData} isFahrenheit={isFahrenheit} />
              </div>

              {/* Global Stations Dashboard */}
              <div>
                <FavoritesDashboard
                  pinnedLocations={pinnedLocations}
                  onSelectCity={handleSelectFromDashboard}
                  onRemoveCity={handleRemoveCity}
                  isFahrenheit={isFahrenheit}
                />
              </div>
            </div>
          ) : (
            <div id="no-weather-fallback" className="flex-1 flex flex-col items-center justify-center text-center py-16">
              <CloudSun className="w-16 h-16 text-slate-600 mb-4" />
              <p className="text-slate-400 text-base max-w-sm">
                No weather forecast details loaded. Try searching for a city above.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Humble Footer, clean margins, no larp credit */}
      <footer id="app-footer" className="py-6 border-t border-white/5 text-center text-xs text-slate-500 font-sans tracking-widest uppercase opacity-40">
        <p>© {new Date().getFullYear()} Atmos Live. Sourced via Open-Meteo & OpenStreetMap.</p>
      </footer>
    </div>
  );
}
