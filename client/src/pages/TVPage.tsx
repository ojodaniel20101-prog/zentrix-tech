/* ZENTRIX_TECH — TV Shows Page */

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import MediaCard from "@/components/MediaCard";
import Footer from "@/components/Footer";
import {
  getPopularTV, getTopRatedTV, getAiringTodayTV,
  getTrendingTV, getTVsByGenre, TV_GENRES, type TMDBMedia,
} from "@/lib/api";
import { Tv, ChevronDown, Loader2 } from "lucide-react";

const CATEGORIES = [
  { id: "popular", label: "Popular" },
  { id: "top_rated", label: "Top Rated" },
  { id: "trending", label: "Trending" },
  { id: "airing", label: "Airing Today" },
];

const GENRE_LIST = Object.entries(TV_GENRES).map(([id, name]) => ({ id: Number(id), name }));

export default function TVPage() {
  const [category, setCategory] = useState("popular");
  const [genreFilter, setGenreFilter] = useState<number | null>(null);
  const [shows, setShows] = useState<TMDBMedia[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchShows = useCallback(async (p: number, reset = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      let res: { results: TMDBMedia[]; total_pages: number };
      if (genreFilter) {
        res = await getTVsByGenre(genreFilter, p);
      } else {
        switch (category) {
          case "top_rated": res = await getTopRatedTV(p); break;
          case "trending": res = await getTrendingTV(p); break;
          case "airing": res = await getAiringTodayTV(p); break;
          default: res = await getPopularTV(p);
        }
      }
      setShows((prev) => reset ? res.results : [...prev, ...res.results]);
      setTotalPages(res.total_pages);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [category, genreFilter]);

  useEffect(() => {
    setPage(1);
    fetchShows(1, true);
  }, [category, genreFilter]);

  const loadMore = () => {
    if (page < totalPages && !loadingMore) {
      const next = page + 1;
      setPage(next);
      fetchShows(next, false);
    }
  };

  return (
    <div style={{ background: "#050816", minHeight: "100vh" }}>
      <Navbar />
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="w-6 h-6" style={{ color: "#06FFA5" }} />
            <h1 className="text-3xl font-800"
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 800, color: "#F0F4FF", letterSpacing: "-0.02em" }}>
              TV Shows
            </h1>
          </div>
          <p className="text-sm" style={{ color: "#8899AA" }}>
            Binge-worthy series from every network and streaming platform
          </p>
        </motion.div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 rounded-xl overflow-x-auto"
            style={{ background: "rgba(11, 18, 32, 0.8)", border: "1px solid rgba(6, 255, 165, 0.1)" }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setGenreFilter(null); }}
                className="px-4 py-2 rounded-lg text-sm font-600 whitespace-nowrap transition-all"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  background: category === cat.id && !genreFilter ? "rgba(6, 255, 165, 0.12)" : "transparent",
                  color: category === cat.id && !genreFilter ? "#06FFA5" : "#8899AA",
                  border: category === cat.id && !genreFilter ? "1px solid rgba(6, 255, 165, 0.3)" : "1px solid transparent",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <select
              value={genreFilter || ""}
              onChange={(e) => setGenreFilter(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none pl-4 pr-10 py-2.5 rounded-xl text-sm font-600 outline-none cursor-pointer"
              style={{
                background: "rgba(11, 18, 32, 0.8)",
                border: "1px solid rgba(6, 255, 165, 0.1)",
                color: genreFilter ? "#06FFA5" : "#8899AA",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
              }}
            >
              <option value="">All Genres</option>
              {GENRE_LIST.map((g) => (
                <option key={g.id} value={g.id} style={{ background: "#0B1220" }}>{g.name}</option>
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
              {shows.map((show, i) => (
                <div key={show.id} className="flex justify-center">
                  <MediaCard item={show} type="tv" index={i % 12} size="md" />
                </div>
              ))}
            </div>
            {page < totalPages && (
              <div className="flex justify-center mt-10">
                <motion.button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-600 text-sm"
                  style={{
                    background: "rgba(6, 255, 165, 0.08)",
                    border: "1px solid rgba(6, 255, 165, 0.2)",
                    color: "#06FFA5",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                  }}
                  whileHover={{ background: "rgba(6, 255, 165, 0.15)" }}
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
