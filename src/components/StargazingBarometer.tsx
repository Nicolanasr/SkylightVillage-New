"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles, Moon, Sun, Compass, Thermometer, Calendar,
  ArrowRight, Cloud, Orbit, Camera, BookOpen, X,
  MapPin, Zap, ChevronRight, Waves, Satellite,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the 3D Moon (Three.js) — no SSR
const Moon3D = dynamic(() => import("./Moon3D"), { ssr: false });

// Jaj, Mount Lebanon Coordinates
const LATITUDE = 34.1483;
const LONGITUDE = 35.7925;

// ── Rich planet knowledge base (used to enrich API data) ──────────────────────
const PLANET_LORE: Record<string, { icon: string; whatToLookFor: string; funFact: string; equipment: string; bestHours: string }> = {
  mercury: {
    icon: "☿",
    whatToLookFor: "Look for a fast-moving, slightly pinkish-grey dot low on the horizon just after sunset or before sunrise. Mercury never strays far from the Sun — scan the twilight glow carefully.",
    funFact: "Mercury completes a full orbit around the Sun in just 88 days. It has almost no atmosphere, so surface temperatures swing from −180 °C at night to 430 °C in the day.",
    equipment: "Naked Eyes / Binoculars",
    bestHours: "Dusk or Dawn (within 2 hrs of Sun)",
  },
  venus: {
    icon: "♀",
    whatToLookFor: "Impossible to miss — Venus is the brightest object in the night sky after the Moon. Look for a brilliant white 'star' near the horizon. Through a small telescope you can see it cycle through crescent phases, just like the Moon.",
    funFact: "Venus shines at magnitude −4.7 and is so bright it can cast faint shadows on Earth. Its thick CO₂ atmosphere traps heat, making it the hottest planet at 465 °C — hotter than Mercury.",
    equipment: "Naked Eyes (brilliant!)",
    bestHours: "Early Evening or Pre-Dawn",
  },
  mars: {
    icon: "♂",
    whatToLookFor: "Mars glows with an unmistakeable orange-red tint — it literally looks like a smouldering ember among the stars. At opposition it can rival Jupiter in brightness. Try to spot the polar ice caps through a telescope.",
    funFact: "Mars has the tallest volcano in the Solar System — Olympus Mons stands 21 km high, nearly 3× the height of Mount Everest. Dust storms can engulf the entire planet for months.",
    equipment: "Naked Eyes / Telescope (for surface detail)",
    bestHours: "Midnight–3 AM (best near opposition)",
  },
  jupiter: {
    icon: "♃",
    whatToLookFor: "Jupiter is the second-brightest planet, appearing as a steady cream-yellow 'star'. Even binoculars reveal the four Galilean moons (Io, Europa, Ganymede, Callisto) lined up like tiny pearls. A telescope shows the famous cloud belts.",
    funFact: "Jupiter is so massive it could swallow all other planets combined — twice over. Its Great Red Spot is a storm that has raged for at least 350 years, wide enough to fit three Earths inside.",
    equipment: "Binoculars (moons) / Telescope (cloud belts)",
    bestHours: "All Night When Above Horizon",
  },
  saturn: {
    icon: "♄",
    whatToLookFor: "Saturn looks like a steady golden 'star', slightly dimmer than Jupiter. The moment you point even a 60mm telescope at it, the iconic rings snap into view — one of the most jaw-dropping sights in astronomy. The rings are inclined ~25° and beautifully detailed.",
    funFact: "Saturn's rings are made of billions of ice and rock particles ranging from grains of sand to house-sized boulders. The rings span 282,000 km across but are only about 10–100 m thick — thinner relative to their width than a sheet of paper.",
    equipment: "Telescope 60mm+ (rings clearly visible)",
    bestHours: "Late Evening (rises in the east after dark)",
  },
  uranus: {
    icon: "⛢",
    whatToLookFor: "Uranus sits right on the edge of naked-eye visibility (mag 5.7) — find it using a star chart, then confirm with binoculars. It appears as a tiny, distinctly blue-green disc, unlike any star. A telescope reveals its faint ring system.",
    funFact: "Uranus rotates on its side — its axial tilt is 98°, so its poles face the Sun for 42-year 'summers'. It also rotates in the opposite direction to most planets (retrograde), meaning the Sun rises in the west there.",
    equipment: "Binoculars (faint disc) / Telescope (colour)",
    bestHours: "Late Night, When High Above Horizon",
  },
  neptune: {
    icon: "♆",
    whatToLookFor: "Neptune is invisible to the naked eye (mag 7.8) but easy in binoculars once you know exactly where to look. Through a telescope it appears as a tiny, deep-blue point — almost indistinguishable from a star, but its colour gives it away.",
    funFact: "Neptune has the fastest winds in the Solar System — clocking up to 2,100 km/h. Its largest moon Triton orbits backwards and is slowly spiralling inward; in ~3.6 billion years it will be torn apart into a new ring system.",
    equipment: "Telescope 100mm+ (needed to spot)",
    bestHours: "Midnight, When at Highest Point",
  },
  moon: {
    icon: "🌕",
    whatToLookFor: "The Moon's surface is full of detail even with naked eyes. Look for the dark flat 'maria' (ancient lava plains) and the bright highland craters. Binoculars reveal crater walls, mountain ranges, and the dramatic 'terminator' (shadow line) that shows terrain in extreme relief.",
    funFact: "The Moon moves about 12° eastward per night relative to the stars. Its gravity drives Earth's tides, slows our rotation slightly, and stabilises our axial tilt — making stable seasons possible. Without the Moon, Earth's axis could wobble chaotically.",
    equipment: "Naked Eyes / Binoculars / Telescope",
    bestHours: "When Above Horizon",
  },
  sun: {
    icon: "☀",
    whatToLookFor: "NEVER look at the Sun without certified solar filters (ISO 12312-2). With proper solar glasses you can spot sunspot groups — darker regions where intense magnetic fields suppress convection. A solar telescope reveals prominences leaping from the edge.",
    funFact: "The Sun converts 600 million tonnes of hydrogen into helium every second via nuclear fusion. It will continue for another ~5 billion years before expanding into a red giant that may engulf Earth.",
    equipment: "Solar Filters REQUIRED / H-Alpha Telescope",
    bestHours: "Daylight Only (with proper filters)",
  },
};

function getPlanetLore(name: string) {
  const key = name.toLowerCase();
  // exact match first
  if (PLANET_LORE[key]) return PLANET_LORE[key];
  // partial match
  for (const k of Object.keys(PLANET_LORE)) {
    if (key.includes(k) || k.includes(key)) return PLANET_LORE[k];
  }
  // fallback
  return {
    icon: "✨",
    whatToLookFor: `Look for ${name} as a steady non-twinkling point of light (planets don't twinkle like stars). Track its position night-to-night — it will drift against the background stars.`,
    funFact: `${name} is one of the planets in our Solar System visible from Jaj at your current coordinates (34.1483° N, 35.7925° E).`,
    equipment: "Binoculars / Telescope",
    bestHours: "Night Hours",
  };
}

// ── Moon phase calculator ──────────────────────────────────────────────────────
interface MoonPhaseInfo {
  name: string;
  illumination: number;
  phaseValue: number;
  description: string;
  stargazingScore: number;
  vibes: string;
}

function getDynamicMoonPhase(date: Date): MoonPhaseInfo {
  const refNewMoon = new Date(2024, 0, 11, 11, 57).getTime();
  const synodicMonth = 29.53058867 * 24 * 60 * 60 * 1000;
  const diff = date.getTime() - refNewMoon;
  const cycles = (diff % synodicMonth) / synodicMonth;
  const phaseValue = cycles < 0 ? cycles + 1 : cycles;
  const illumination = Math.round((1 - Math.cos(phaseValue * 2 * Math.PI)) * 50);

  let name = "New Moon 🌑";
  let description = "Zero moon glare! Pitch-dark sky — optimal for deep space objects and the Milky Way core.";
  let stargazingScore = 98;
  let vibes = "Deep Sky Stargazing Window";

  if (phaseValue < 0.04 || phaseValue > 0.96) {
    name = "New Moon 🌑"; description = "Zero moon glare! Pitch-dark sky — optimal for deep space objects and the Milky Way core."; stargazingScore = 98; vibes = "Deep Sky Stargazing Window";
  } else if (phaseValue < 0.22) {
    name = "Waxing Crescent 🌒"; description = "Slender crescent sets early. Dark skies during late-night hours — great for galaxies and nebulae."; stargazingScore = 92; vibes = "Crescent Moon & Dark Sky Evening";
  } else if (phaseValue < 0.28) {
    name = "First Quarter 🌓"; description = "Half-moon rises at noon, sets at midnight. Crisp crater detail along the lunar terminator line."; stargazingScore = 82; vibes = "Lunar Crater Observation Night";
  } else if (phaseValue < 0.46) {
    name = "Waxing Gibbous 🌔"; description = "Moon dominates the early night. Still excellent for bright stars, planets, and open clusters."; stargazingScore = 70; vibes = "Moonlit Evening & Campfire Vibe";
  } else if (phaseValue < 0.54) {
    name = "Full Moon 🌕"; description = "Radiant moonlight illuminates the whole landscape. Perfect for hiking, photography and lunar detail."; stargazingScore = 58; vibes = "Full Moon Mountain Landscape";
  } else if (phaseValue < 0.72) {
    name = "Waning Gibbous 🌖"; description = "Moon rises after 9 PM. Dark evening skies before moonrise — good window for galaxies."; stargazingScore = 76; vibes = "Evening Stargazing Window";
  } else if (phaseValue < 0.78) {
    name = "Last Quarter 🌗"; description = "Half-moon rises around midnight. Pristine early-evening sky for prime stargazing until midnight."; stargazingScore = 86; vibes = "Midnight Moonrise & Stargazing";
  } else {
    name = "Waning Crescent 🌘"; description = "Thin crescent rises before dawn. Entire night is dark and ideal for deep sky viewing."; stargazingScore = 95; vibes = "Late Night Dark Sky Viewing";
  }

  return { name, illumination, phaseValue, description, stargazingScore, vibes };
}

// ── Interfaces ─────────────────────────────────────────────────────────────────
interface ApiCelestialObject {
  id: string;
  name: string;
  icon: string;
  visibility: string;
  aboveHorizon: boolean;
  nakedEyeObject: boolean;
  equipmentNeeded: string;
  bestHours: string;
  whatToLookFor: string;
  funFact: string;
}

interface LiveData {
  temperature: number | null;
  cloudCover: number | null;
  humidity: number | null;
  windSpeed: number | null;
  surfacePressure: number | null;
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  daylightHours: string;
  astroPhotoRating: string;
  seaCondition: string;
  waveHeight: number | null;
  spaceWeather: string;
  /** true when the moon rises AND sets during daytime (not visible at night) */
  moonDaytimeOnly: boolean;
  isLive: boolean;
  loading: boolean;
  lastUpdated: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function StargazingBarometer() {
  const [daysOffset, setDaysOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);

  // Moon3D handles its own internal drag/rotation

  const [data, setData] = useState<LiveData>({
    temperature: null,
    cloudCover: null,
    humidity: null,
    windSpeed: null,
    surfacePressure: null,
    sunrise: "--:--",
    sunset: "--:--",
    moonrise: "--:--",
    moonset: "--:--",
    daylightHours: "--h",
    astroPhotoRating: "--",
    seaCondition: "--",
    waveHeight: null,
    spaceWeather: "--",
    moonDaytimeOnly: false,
    isLive: false,
    loading: true,
    lastUpdated: "",
  });

  const [dynamicCelestialTargets, setDynamicCelestialTargets] = useState<ApiCelestialObject[]>([]);
  const [activeTarget, setActiveTarget] = useState<ApiCelestialObject | null>(null);

  const fetchAllOnlineApiData = async (targetOffset: number) => {
    try {
      setData((prev) => ({ ...prev, loading: true }));

      const formatTimeStr = (isoStr?: string) => {
        if (!isoStr) return "--:--";
        const d = new Date(isoStr);
        return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      };

      // ── 1. Open-Meteo: Weather + Solar/Lunar ephemeris ──────────────────────
      let weatherJson: any = null;
      try {
        const wRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
          `&current=temperature_2m,relative_humidity_2m,cloud_cover,wind_speed_10m,surface_pressure` +
          `&daily=sunrise,sunset,moonrise,moonset,daylight_duration` +
          `&hourly=temperature_2m,cloud_cover,relative_humidity_2m,wind_speed_10m` +
          `&timezone=Asia%2FBeirut&forecast_days=7`
        );
        if (wRes.ok) weatherJson = await wRes.json();
      } catch (e) { console.error("Open-Meteo error:", e); }

      // ── 2. Visible Planets API (free, no key) ────────────────────────────────
      try {
        const pRes = await fetch(`https://api.visibleplanets.dev/v1?latitude=${LATITUDE}&longitude=${LONGITUDE}`);
        if (pRes.ok) {
          const pJson = await pRes.json();
          const raw: any[] = Array.isArray(pJson.val) ? pJson.val : Array.isArray(pJson) ? pJson : [];

          const mapped: ApiCelestialObject[] = raw.map((p: any) => {
            const lore = getPlanetLore(p.name);
            const isAbove = !!p.aboveHorizon;
            const isNaked = !!p.nakedEyeObject;
            return {
              id: p.name.toLowerCase(),
              name: `${p.name} ${isAbove ? (isNaked ? "(Naked-Eye 🌟)" : "(Above Horizon 🪐)") : "(Below Horizon)"}`,
              icon: lore.icon,
              visibility: isAbove ? (isNaked ? "Naked-Eye Target" : "Binocular/Telescopic Target") : "Below Horizon",
              aboveHorizon: isAbove,
              nakedEyeObject: isNaked,
              equipmentNeeded: lore.equipment,
              bestHours: lore.bestHours,
              whatToLookFor: lore.whatToLookFor,
              funFact: lore.funFact,
            };
          });

          setDynamicCelestialTargets(mapped);
          if (mapped.length > 0) {
            setActiveTarget((prev) => (prev ? mapped.find((t) => t.id === prev.id) || mapped[0] : mapped[0]));
          }
        }
      } catch (e) { console.error("Visible Planets API error:", e); }

      // ── 3. Open-Meteo Marine: Sea conditions (free, no key) ─────────────────
      let seaCondition = "Calm Mediterranean";
      let waveHeight: number | null = null;
      try {
        const mRes = await fetch(
          `https://marine-api.open-meteo.com/v1/marine?latitude=${LATITUDE}&longitude=${LONGITUDE}` +
          `&hourly=wave_height,wave_direction,wave_period&timezone=Asia%2FBeirut&forecast_days=1`
        );
        if (mRes.ok) {
          const mJson = await mRes.json();
          // Get current hour index
          const now = new Date();
          const hourIdx = now.getHours();
          const waves: number[] = mJson.hourly?.wave_height ?? [];
          if (waves.length > hourIdx) {
            waveHeight = Math.round(waves[hourIdx] * 10) / 10;
            if (waveHeight <= 0.3) seaCondition = "Flat / Calm";
            else if (waveHeight <= 0.8) seaCondition = "Light Ripples";
            else if (waveHeight <= 1.5) seaCondition = "Moderate Swell";
            else seaCondition = "Rough Seas";
          }
        }
      } catch (e) { console.error("Open-Meteo Marine error:", e); }

      // ── 4. NASA DONKI: Space weather summary (free, requires key) ───────────
      let spaceWeather = "No active alerts";
      try {
        const nasaKey = process.env.NEXT_PUBLIC_NASA_KEY;
        if (nasaKey) {
          const nRes = await fetch(
            `https://api.nasa.gov/DONKI/notifications?type=all&api_key=${nasaKey}`
          );
          if (nRes.ok) {
            const nJson = await nRes.json();
            if (Array.isArray(nJson) && nJson.length > 0) {
              // Find most recent relevant alert (CME, GST, FLR, SEP)
              const priorityTypes = ["CME", "GST", "FLR", "SEP", "RBE"];
              const alert = nJson.find((n: any) =>
                priorityTypes.some((t) => n.messageType?.includes(t) || n.messageID?.includes(t))
              ) || nJson[0];
              // Extract a short summary from the body
              const body: string = alert.messageBody || "";
              const summaryMatch = body.match(/##\s*Summary[:\s]*([\s\S]{0,300})/i);
              if (summaryMatch) {
                let raw = summaryMatch[1].replace(/\n+/g, " ").trim();
                // Truncate at a sentence boundary within ~280 chars
                const MAX = 280;
                if (raw.length > MAX) {
                  // Try to find the last sentence-ending punctuation before MAX
                  const sentenceEnd = raw.slice(0, MAX).search(/[.!?][^.!?]*$/);
                  if (sentenceEnd > 60) {
                    raw = raw.slice(0, sentenceEnd + 1).trim();
                  } else {
                    // Fall back to last word boundary
                    const lastSpace = raw.lastIndexOf(" ", MAX);
                    raw = raw.slice(0, lastSpace > 0 ? lastSpace : MAX) + "…";
                  }
                }
                spaceWeather = raw;
              } else if (alert.messageType) {
                spaceWeather = `${alert.messageType} — ${alert.messageIssueTime?.split("T")[0] ?? "Recent"}`;
              }
            }
          }
        }
      } catch (e) { console.error("NASA DONKI error:", e); }

      // ── 5. Compose weather state ─────────────────────────────────────────────
      if (weatherJson) {
        const current = weatherJson.current || {};
        const daily = weatherJson.daily || {};
        const hourly = weatherJson.hourly || {};
        const idx = Math.min(targetOffset, (daily.time?.length || 1) - 1);

        let temp = current.temperature_2m !== undefined ? Math.round(current.temperature_2m) : null;
        let cloud = current.cloud_cover !== undefined ? Math.round(current.cloud_cover) : null;
        let humidity = current.relative_humidity_2m !== undefined ? Math.round(current.relative_humidity_2m) : null;
        let wind = current.wind_speed_10m !== undefined ? Math.round(current.wind_speed_10m) : null;
        let pressure = current.surface_pressure !== undefined ? Math.round(current.surface_pressure) : null;

        // For future days use average nightly values from hourly forecast
        if (targetOffset > 0 && hourly.time) {
          const startIdx = idx * 24 + 20;
          const endIdx = Math.min(startIdx + 8, hourly.time.length);
          if (startIdx < hourly.time.length) {
            const temps = hourly.temperature_2m?.slice(startIdx, endIdx) ?? [];
            const clouds = hourly.cloud_cover?.slice(startIdx, endIdx) ?? [];
            const humis = hourly.relative_humidity_2m?.slice(startIdx, endIdx) ?? [];
            const winds = hourly.wind_speed_10m?.slice(startIdx, endIdx) ?? [];
            const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
            temp = avg(temps);
            cloud = avg(clouds);
            humidity = avg(humis);
            wind = avg(winds);
          }
        }

        const daylightSec = daily.daylight_duration?.[idx] || 0;
        const daylightHoursStr = daylightSec > 0 ? `${(daylightSec / 3600).toFixed(1)} hrs` : "--h";

        const astroRating =
          cloud === null ? "--" :
          cloud < 10 ? "10/10 — Perfect" :
          cloud < 25 ? "8/10 — Excellent" :
          cloud < 45 ? "6/10 — Good" :
          cloud < 65 ? "4/10 — Fair" : "2/10 — Poor";

        const sunriseISO  = daily.sunrise?.[idx]  ?? "";
        const sunsetISO   = daily.sunset?.[idx]   ?? "";
        const moonriseISO = daily.moonrise?.[idx] ?? "";
        const moonsetISO  = daily.moonset?.[idx]  ?? "";

        // Detect "daytime moon": moon rises AND sets between sunrise and sunset
        // This happens around New Moon — the moon tracks the sun and is not visible at night.
        let moonDaytimeOnly = false;
        if (sunriseISO && sunsetISO && moonriseISO && moonsetISO) {
          const srMs = new Date(sunriseISO).getTime();
          const ssMs = new Date(sunsetISO).getTime();
          const mrMs = new Date(moonriseISO).getTime();
          const msMs = new Date(moonsetISO).getTime();
          // Moon is daytime-only if it rises after sunrise and sets before sunset
          moonDaytimeOnly = mrMs >= srMs && msMs <= ssMs + 30 * 60 * 1000; // +30min tolerance
        }

        setData({
          temperature: temp,
          cloudCover: cloud,
          humidity,
          windSpeed: wind,
          surfacePressure: pressure,
          sunrise:  formatTimeStr(sunriseISO),
          sunset:   formatTimeStr(sunsetISO),
          moonrise: formatTimeStr(moonriseISO),
          moonset:  formatTimeStr(moonsetISO),
          daylightHours: daylightHoursStr,
          astroPhotoRating: astroRating,
          seaCondition,
          waveHeight,
          spaceWeather,
          moonDaytimeOnly,
          isLive: true,
          loading: false,
          lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        });
      } else {
        // Still update even if weather failed
        setData((prev) => ({ ...prev, seaCondition, waveHeight, spaceWeather, loading: false }));
      }
    } catch (err) {
      console.error("fetchAllOnlineApiData error:", err);
      setData((prev) => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => { fetchAllOnlineApiData(daysOffset); }, [daysOffset]);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setSelectedDate(d);
  }, [daysOffset]);

  const moonInfo = getDynamicMoonPhase(selectedDate);
  const currentCloud = data.cloudCover ?? 0;
  const cloudPenalty = Math.min(60, Math.round(currentCloud * 0.75));
  const stargazingScore = Math.max(20, Math.min(100, moonInfo.stargazingScore - cloudPenalty));

  const dateFormatted = selectedDate.toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  // Drag is handled internally by Moon3D (Three.js pointer events)

  return (
    <section className="py-20 px-4 md:px-8 bg-[#040812] text-slate-100 relative overflow-hidden select-none">
      {/* Ambient Background */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.2px,transparent_1.2px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Live — Open-Meteo · Visible Planets · NASA DONKI</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-display font-black tracking-tight text-white">
            Live Stargazing &amp; Night Sky Guide
          </h2>
          <p className="text-xs md:text-sm text-slate-400 font-light leading-relaxed max-w-xl mx-auto">
            All solar, lunar, weather, planet positions and space weather fetched{" "}
            <span className="text-amber-400 font-semibold">100% in real-time</span> for Jaj observatory (34.1483° N, 35.7925° E).
            {data.isLive && (
              <span className="ml-2 text-emerald-400 font-semibold">
                ✓ Updated {data.lastUpdated}
              </span>
            )}
          </p>

          {/* Date stepper */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { label: "✨ Tonight (Live)", offset: 0 },
              { label: "🌙 Tomorrow", offset: 1 },
              { label: "⛺ +2 Days", offset: 2 },
            ].map(({ label, offset }) => (
              <button
                key={offset}
                onClick={() => setDaysOffset(offset)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  daysOffset === offset
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md scale-105"
                    : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => setShowGuideModal(true)}
              className="px-4 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stargazing Guide ↗</span>
            </button>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl shadow-black/90 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* ── LEFT COLUMN: Moon + Solar/Lunar Times ── */}
          <div className="lg:col-span-5 flex flex-col items-center justify-between p-6 bg-slate-950/80 rounded-2xl border border-slate-800 text-center relative gap-4">

            {/* Date nav */}
            <div className="w-full flex items-center justify-between bg-slate-900/90 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setDaysOffset((p) => Math.max(0, p - 1))}
                disabled={daysOffset === 0}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 font-bold text-slate-300 transition cursor-pointer"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1.5 font-extrabold text-amber-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>{daysOffset === 0 ? "Tonight (Live)" : dateFormatted}</span>
              </div>
              <button
                onClick={() => setDaysOffset((p) => Math.min(6, p + 1))}
                disabled={daysOffset >= 6}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 font-bold text-slate-300 transition cursor-pointer disabled:opacity-30"
              >
                Next →
              </button>
            </div>

            {/* Real 3D Moon — NASA texture + Three.js */}
            <div className="relative group">
              {/* Ambient glow ring */}
              <div className="absolute inset-0 rounded-full bg-amber-300/15 blur-2xl group-hover:bg-amber-300/25 transition-all duration-500 pointer-events-none" />
              <Moon3D
                phaseValue={moonInfo.phaseValue}
                className="w-52 h-52 rounded-full overflow-hidden shadow-2xl shadow-black/80"
              />
              <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-amber-500/40 text-amber-400 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ⇄ Drag to Rotate
              </span>
            </div>

            {/* Moon info */}
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white tracking-tight">{moonInfo.name}</h3>
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                {moonInfo.illumination}% Illumination
              </p>
              <div className="inline-block mt-1 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold rounded-lg">
                ✨ {moonInfo.vibes}
              </div>
              <p className="text-xs text-slate-400 font-light max-w-xs mt-2 leading-relaxed">
                {moonInfo.description}
              </p>
            </div>

            {/* Solar & Lunar times (from Open-Meteo) */}
            <div className="grid grid-cols-2 gap-2 w-full pt-4 border-t border-slate-800 text-xs">
              {[
                { icon: <Sun className="w-3.5 h-3.5 text-amber-400" />, label: "Sunrise", value: data.sunrise },
                { icon: <Sun className="w-3.5 h-3.5 text-orange-400" />, label: "Sunset",  value: data.sunset  },
                { icon: <Moon className="w-3.5 h-3.5 text-indigo-400" />, label: "Moonrise", value: data.moonrise },
                { icon: <Moon className="w-3.5 h-3.5 text-indigo-500" />, label: "Moonset",  value: data.moonset  },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1 text-[10px] font-semibold">
                    {icon} {label}
                  </span>
                  <span className={`font-black text-[11px] ${data.loading ? "text-slate-600 animate-pulse" : "text-white"}`}>
                    {data.loading ? "···" : value}
                  </span>
                </div>
              ))}
            </div>

            {/* Daytime moon explanation badge */}
            {data.moonDaytimeOnly && !data.loading && (
              <div className="w-full flex items-start gap-2 bg-amber-500/8 border border-amber-500/20 rounded-xl px-3 py-2 text-[10px] text-amber-300 leading-relaxed">
                <span className="text-base leading-none mt-0.5">☀️</span>
                <span>
                  <strong>Daytime Moon</strong> — tonight the Moon rises and sets with the Sun (typical during New Moon).
                  The sky will be <strong>pitch-dark all night</strong> — ideal for deep-sky viewing!
                </span>
              </div>
            )}

            {/* Sea Conditions (Open-Meteo Marine — free, no key) */}
            <div className="w-full bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-400 flex items-center gap-1 font-semibold">
                <Waves className="w-3.5 h-3.5 text-cyan-400" /> Sea Conditions
              </span>
              <div className="text-right">
                <span className={`font-black text-[11px] ${data.loading ? "text-slate-600 animate-pulse" : "text-white"}`}>
                  {data.loading ? "···" : data.seaCondition}
                </span>
                {data.waveHeight !== null && !data.loading && (
                  <span className="text-slate-500 ml-1.5">({data.waveHeight}m swell)</span>
                )}
              </div>
            </div>

            {/* Space Weather (NASA DONKI) */}
            <div className="w-full bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-[10px]">
              <div className="flex items-center gap-1 text-slate-400 font-semibold mb-1">
                <Satellite className="w-3.5 h-3.5 text-violet-400" /> Space Weather (NASA DONKI)
              </div>
              <p className={`text-[10px] leading-relaxed ${data.loading ? "text-slate-600 animate-pulse" : "text-slate-300"}`}>
                {data.loading ? "Fetching NASA data..." : data.spaceWeather}
              </p>
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">

            {/* Rating banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-950/40 p-5 rounded-2xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                  Stargazing &amp; Dark Sky Clarity
                </span>
                <span className="text-2xl font-black text-white">
                  {stargazingScore}% Pitch-Dark Visibility
                </span>
              </div>
              <div className="text-right">
                <span className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-lg">
                  {stargazingScore >= 85 ? "Optimal 🌟" : stargazingScore >= 65 ? "Good ✨" : "Fair 🌓"}
                </span>
              </div>
            </div>

            {/* Weather metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: <Thermometer className="w-3.5 h-3.5" />,
                  label: "Night Temp",
                  value: data.temperature !== null ? `${data.temperature}°C` : "···",
                  sub: "1,200m Mountain Air",
                },
                {
                  icon: <Cloud className="w-3.5 h-3.5" />,
                  label: "Cloud Cover",
                  value: data.cloudCover !== null ? `${data.cloudCover}%` : "···",
                  sub: data.cloudCover !== null
                    ? data.cloudCover < 15 ? "Clear Sky ✓" : data.cloudCover < 40 ? "Partly Clear" : "Overcast"
                    : "--",
                },
                {
                  icon: <Compass className="w-3.5 h-3.5" />,
                  label: "Light Pollution",
                  value: "Bortle 3",
                  sub: "Rural Dark Sky",
                },
                {
                  icon: <Camera className="w-3.5 h-3.5" />,
                  label: "Astro Photo",
                  value: data.astroPhotoRating.split("—")[0].trim() || "···",
                  sub: data.astroPhotoRating.split("—")[1]?.trim() || "Milky Way Shots",
                },
              ].map(({ icon, label, value, sub }) => (
                <div key={label} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-center space-y-1">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    {icon} <span>{label}</span>
                  </div>
                  <div className={`text-base font-black ${data.loading && value === "···" ? "text-slate-600 animate-pulse" : "text-white"}`}>
                    {value}
                  </div>
                  <div className="text-[9px] text-slate-400 font-medium">{sub}</div>
                </div>
              ))}
            </div>

            {/* Live Planets feed */}
            <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                  <Orbit className="w-3.5 h-3.5 text-amber-400" />
                  Live Visible Planets &amp; Deep Sky — Jaj Observatory:
                </span>
                <button
                  onClick={() => setShowGuideModal(true)}
                  className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Stargazing Guide</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Planet tabs */}
              {dynamicCelestialTargets.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {dynamicCelestialTargets.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTarget(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                        activeTarget?.id === t.id
                          ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black"
                          : t.aboveHorizon
                          ? "bg-slate-900 text-slate-200 border-slate-700 hover:border-amber-500/50"
                          : "bg-slate-900/50 text-slate-500 border-slate-800"
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span>{t.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic py-2 animate-pulse">
                  Querying live visible planets API…
                </div>
              )}

              {/* Active planet detail */}
              {activeTarget && (
                <div className="bg-slate-900/95 p-4 rounded-xl border border-slate-800 text-xs space-y-3 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <span className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                      <span className="text-xl">{activeTarget.icon}</span>
                      <span>{activeTarget.name}</span>
                    </span>
                    <span className={`font-black text-[10px] uppercase px-2.5 py-0.5 rounded-md border ${
                      activeTarget.aboveHorizon
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                        : "bg-slate-800 text-slate-500 border-slate-700"
                    }`}>
                      {activeTarget.visibility}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-slate-800/40 rounded-lg p-3">
                      <p className="text-slate-200 leading-relaxed">
                        🔭 <strong className="text-white">What to Look For:</strong>{" "}
                        {activeTarget.whatToLookFor}
                      </p>
                    </div>
                    <div className="bg-indigo-950/30 rounded-lg p-3 border border-indigo-900/30">
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        🌌 <strong className="text-indigo-300">Astronomy Fact:</strong>{" "}
                        {activeTarget.funFact}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <div>
                      🛠️ <strong>Equipment:</strong>{" "}
                      <span className="text-white">{activeTarget.equipmentNeeded}</span>
                    </div>
                    <div>
                      ⏰ <strong>Best Viewing:</strong>{" "}
                      <span className="text-amber-400 font-bold">{activeTarget.bestHours}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Photo tip */}
            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/60 text-xs text-slate-300 flex items-center gap-3">
              <Camera className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <span>
                <strong className="text-amber-400">Smartphone Photo Tip:</strong> Set your phone to{" "}
                <strong>Night Mode (10s exposure)</strong>, lean it against a table or tripod, and snap breathtaking Milky Way photos!
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowGuideModal(true)}
                className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 font-display font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Read Stargazing Guide</span>
              </button>
              <Link
                href="/stay"
                className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Reserve Your Stargazing Stay in Jaj</span>
                <ArrowRight className="w-4 h-4 text-slate-950 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stargazing Guide Modal ── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative text-slate-200 text-xs leading-relaxed">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-display font-black text-lg text-white">
                  Mount Lebanon Stargazing &amp; Dark Sky Guide
                </h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  Why Jaj (1,200m) is Lebanon's Top Stargazing Sanctuary
                </h4>
                <p className="text-slate-300">
                  At 1,200 metres above sea level in the Jaj mountain range, Skylight Village sits above 90% of coastal
                  humidity and urban light pollution. The crisp mountain air gives{" "}
                  <strong>Bortle Class 3 Rural Dark Sky clarity</strong> — the Milky Way arch is vividly visible to the
                  naked eye. The Mediterranean climate means clear skies on 260+ nights per year.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  5 Essential Tips for Stargazers &amp; First-Time Campers:
                </h4>
                <ul className="space-y-2.5 text-slate-300 pl-2">
                  {[
                    ["Give Your Eyes 20 Minutes to Dark-Adapt", "Avoid phone screens for 15–20 minutes before stargazing. Your pupils will dilate fully, revealing 10× more dim stars, galaxy dust lanes, and faint nebulae invisible to the light-polluted eye."],
                    ["Use a Red-Light Torch Only", "White flashlights destroy night vision in seconds. Use a red-light mode or cover your torch with a red cloth — red light has minimal impact on dark adaptation."],
                    ["Download a Free Star Chart App", "Stellarium, SkyView, or Star Walk 2 are free and outstanding. Point your phone camera at any bright dot to instantly reveal its name, constellation, and distance in light-years."],
                    ["Layer Up — Mountain Temperatures Drop Fast", "Jaj is 8–12°C cooler than Beirut at night, even in summer. Bring a fleece jacket and a blanket. Lying flat on a reclined chair gives a panoramic sky view while staying warm."],
                    ["Milky Way Photography with Your Smartphone", "Set Night Mode to 10–15 seconds, rest the phone on a solid surface or a small tripod, and shoot toward the south. ISO 1600–3200, widest lens — you'll capture the galactic core!"],
                  ].map(([title, text], i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-black">{i + 1}.</span>
                      <div>
                        <strong className="text-white">{title}:</strong> {text}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-2 text-amber-200">
                <strong className="text-amber-300 block font-bold text-xs uppercase tracking-wider">
                  🌌 Best Stargazing Nights — Moon Phase Calendar
                </strong>
                <p className="text-[11px] leading-relaxed">
                  Book your stay during a <strong>New Moon</strong> or <strong>Waxing/Waning Crescent</strong> phase for
                  maximum pitch-dark sky contrast — the Milky Way core literally fills the entire sky. Full Moons offer
                  romantic landscape illumination perfect for evening campfires and long-exposure landscape photography.
                </p>
              </div>

              <div className="bg-indigo-950/40 border border-indigo-800/30 p-4 rounded-xl space-y-2">
                <strong className="text-indigo-300 block font-bold text-xs uppercase tracking-wider">
                  🔭 What Can You Actually See from Jaj?
                </strong>
                <ul className="text-[11px] text-slate-300 space-y-1 leading-relaxed">
                  <li>• <strong className="text-white">Milky Way core</strong> — visible to naked eye May–September</li>
                  <li>• <strong className="text-white">Andromeda Galaxy (M31)</strong> — 2.5 million light-years away, visible as a fuzzy patch</li>
                  <li>• <strong className="text-white">Saturn's rings</strong> — visible through any 60mm telescope</li>
                  <li>• <strong className="text-white">Jupiter's moons</strong> — 4 Galilean moons visible in binoculars</li>
                  <li>• <strong className="text-white">Perseid meteor shower</strong> — August 11–13, up to 100 meteors/hour</li>
                  <li>• <strong className="text-white">Orion Nebula (M42)</strong> — glowing gas cloud visible even to naked eye</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex justify-between items-center">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition cursor-pointer"
              >
                Close Guide
              </button>
              <Link
                href="/stay"
                onClick={() => setShowGuideModal(false)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg inline-flex items-center gap-1.5"
              >
                <span>Book Stargazing Stay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
