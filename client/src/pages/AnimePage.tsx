/* ZENTRIX_TECH — Anime Page */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import Footer from "@/components/Footer";
import {
  getTrendingAnime, getPopularAnime, getTopRatedAnime,
  getSeasonalAnime, getAnimeByGenre, ANIME_GENRES, type AniListMedia,
} from "@/lib/api";
import { Sword, ChevronDown, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "trending", label: "Trending" },
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
  { id: "seasonal", label: "This Season" },
];

function getCurrentSeason(): { season: string; year: number } {
  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  if (month <= 3) return { season: "WINTER", year };
  if (month <= 6) return { season: "SPRING", year };
  if (month <= 9) return { season: "SUMMER", year };
  return { season: "FALL", year };
}

export default function AnimePage() {
  const [category, setCategory] = useState("trending");
  const [genreFilter, setGenreFilter] = useState<string | null>(null);
  const [anime, setAnime] = useState<AniListMedia[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchAnime = useCallback(async (p: number, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      let items: AniListMedia[] = [];
      if (genreFilter) {
        const res = await getAnimeByGenre(genreFilter, p, 24);
        items = res.Page.media;
      } else {
        const { season, year } = getCurrentSeason();
        switch (category) {
          case "popular": {
            const res = await getPopularAnime(p, 24);
            items = res.Page.media;
            break;
          }
          case "top_rated": {
            const res = await getTopRatedAnime(p, 24);
            items = res.Page.media;
            break;
          }
          case "seasonal": {
            const res = await getSeasonalAnime(season, year, p, 24);
            items = res.Page.media;
            break;
          }
          default: {
            const res = await getTrendingAnime(p, 24);
            items = res.Page.media;
          }
        }
      }
      setAnime((prev) => reset ? items : [...prev, ...items]);
      setHasMore(items.length === 24);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [category, genreFilter]);

  useEffect(() => {
    setPage(1);
    fetchAnime(1, true);
  }, [category, genreFilter]);

  const loadMore = () => {
    if (hasMore && !loadingMore) {
      const next = page + 1;
      setPage(next);
      fetchAnime(next, false);
    }
  };

  return (
    <div style={{ background: "#050816", minHeight: "100vh" }}>
      <Navbar />
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sword className="w-6 h-6" style={{ color: "#8B5CF6" }} />
            <h1 className="text-3xl font-800"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: "#F0F4FF", letterSpacing: "-0.02em" }}>
              Anime
            </h1>
          </div>
          <p className="text-sm" style={{ color: "#8899AA" }}>
            From shonen epics to slice-of-life masterpieces — all genres covered
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto"
            style={{ background: "rgba(11, 18, 32, 0.8)", border: "1px solid rgba(139, 92, 246, 0.15)" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setGenreFilter(null); }}
                className="px-4 py-2 rounded-lg text-sm font-600 whitespace-nowrap transition-all"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  background: category === cat.id && !genreFilter ? "rgba(139, 92, 246, 0.15)" : "transparent",
                  color: category === cat.id && !genreFilter ? "#8B5CF6" : "#8899AA",
                  border: category === cat.id && !genreFilter ? "1px solid rgba(139, 92, 246, 0.35)" : "1px solid transparent",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={genreFilter || ""}
              onChange={(e) => setGenreFilter(e.target.value || null)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-600 outline-none cursor-pointer"
              style={{
                background: "rgba(11, 18, 32, 0.8)",
                border: "1px solid rgba(139, 92, 246, 0.15)",
                color: genreFilter ? "#8B5CF6" : "#8899AA",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              <option value="">All Genres</option>
              {ANIME_GENRES.map((g) => (
                <option key={g} value={g} style={{ background: "#0B1220" }}>{g}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#8899AA" }} />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i}>
                <div className="h-[240px] rounded-xl zx-skeleton" />
                <div className="mt-2 h-4 rounded zx-skeleton w-4/5" />
                <div className="mt-1 h-3 rounded zx-skeleton w-2/5" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {anime.map((item, i) => (
                <div key={item.id} className="flex justify-center">
                  <MediaCard item={item} type="anime" index={i % 12} size="md" />
                </div>
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-10">
                <motion.button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-600 text-sm"
                  style={{
                    background: "rgba(139, 92, 246, 0.08)",
                    border: "1px solid rgba(139, 92, 246, 0.2)",
                    color: "#8B5CF6",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                  }}
                  whileHover={{ background: "rgba(139, 92, 246, 0.15)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loadingMore ? "Loading..." : "Load More"}
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
