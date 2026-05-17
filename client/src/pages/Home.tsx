/* ZENTRIX_TECH — Home Page
   Design: Obsidian Forge — cinematic hero + content rows + featured sections
   Data: TMDB trending + AniList trending
*/

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import {
  getTrendingAll, getTrendingMovies, getTopRatedMovies,
  getNowPlayingMovies, getTrendingTV, getTopRatedTV,
  getTrendingAnime, getPopularAnime, getTopRatedAnime,
  type TMDBMedia, type AniListMedia,
} from "@/lib/api";
import { Flame, Star, Clock, Sword, Film, Tv, TrendingUp } from "lucide-react";

export default function Home() {
  const [heroItems, setHeroItems] = useState<(TMDBMedia | AniListMedia)[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMedia[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMedia[]>([]);
  const [nowPlaying, setNowPlaying] = useState<TMDBMedia[]>([]);
  const [trendingTV, setTrendingTV] = useState<TMDBMedia[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<TMDBMedia[]>([]);
  const [trendingAnime, setTrendingAnime] = useState<AniListMedia[]>([]);
  const [popularAnime, setPopularAnime] = useState<AniListMedia[]>([]);
  const [topAnime, setTopAnime] = useState<AniListMedia[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    // Load hero items first
    Promise.allSettled([
      getTrendingAll(1),
      getTrendingAnime(1, 5),
    ]).then(([allRes, animeRes]) => {
      const tmdbItems = allRes.status === "fulfilled"
        ? allRes.value.results.filter((r) => r.backdrop_path).slice(0, 6)
        : [];
      const animeItems = animeRes.status === "fulfilled"
        ? animeRes.value.Page.media.filter((a) => a.bannerImage).slice(0, 3)
        : [];
      setHeroItems([...tmdbItems.slice(0, 5), ...animeItems.slice(0, 3)]);
      setHeroLoading(false);
    });

    // Load content rows
    Promise.allSettled([
      getTrendingMovies(1),
      getTopRatedMovies(1),
      getNowPlayingMovies(1),
      getTrendingTV(1),
      getTopRatedTV(1),
      getTrendingAnime(1, 20),
      getPopularAnime(1, 20),
      getTopRatedAnime(1, 20),
    ]).then(([tMovies, topMovies, nowP, tTV, topTV, tAnime, pAnime, topAnime]) => {
      if (tMovies.status === "fulfilled") setTrendingMovies(tMovies.value.results.slice(0, 20));
      if (topMovies.status === "fulfilled") setTopRatedMovies(topMovies.value.results.slice(0, 20));
      if (nowP.status === "fulfilled") setNowPlaying(nowP.value.results.slice(0, 20));
      if (tTV.status === "fulfilled") setTrendingTV(tTV.value.results.slice(0, 20));
      if (topTV.status === "fulfilled") setTopRatedTV(topTV.value.results.slice(0, 20));
      if (tAnime.status === "fulfilled") setTrendingAnime(tAnime.value.Page.media.slice(0, 20));
      if (pAnime.status === "fulfilled") setPopularAnime(pAnime.value.Page.media.slice(0, 20));
      if (topAnime.status === "fulfilled") setTopAnime(topAnime.value.Page.media.slice(0, 20));
      setContentLoading(false);
    });
  }, []);

  return (
    <div style={{ background: "#050816", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero */}
      <HeroSection items={heroItems} loading={heroLoading} />

      {/* Content Sections */}
      <div className="relative z-10" style={{ background: "#050816" }}>

        {/* Trending Movies */}
        <ContentRow
          title="Trending Movies"
          subtitle="This week's most watched films"
          items={trendingMovies}
          type="movie"
          loading={contentLoading}
          viewAllHref="/movies"
          accentColor="#00D4FF"
        />

        {/* Trending Anime */}
        <ContentRow
          title="Trending Anime"
          subtitle="Hot right now in the anime world"
          items={trendingAnime}
          type="anime"
          loading={contentLoading}
          viewAllHref="/anime"
          accentColor="#8B5CF6"
        />

        {/* Now Playing */}
        <ContentRow
          title="Now Playing"
          subtitle="Currently in cinemas"
          items={nowPlaying}
          type="movie"
          loading={contentLoading}
          viewAllHref="/movies"
          accentColor="#06FFA5"
        />

        {/* Trending TV */}
        <ContentRow
          title="Trending TV Shows"
          subtitle="Binge-worthy series right now"
          items={trendingTV}
          type="tv"
          loading={contentLoading}
          viewAllHref="/tv"
          accentColor="#00D4FF"
        />

        {/* Top Rated Anime */}
        <ContentRow
          title="All-Time Anime Classics"
          subtitle="Highest rated anime of all time"
          items={topAnime}
          type="anime"
          loading={contentLoading}
          viewAllHref="/anime"
          accentColor="#FF2D55"
        />

        {/* Top Rated Movies */}
        <ContentRow
          title="Top Rated Movies"
          subtitle="Cinema's greatest masterpieces"
          items={topRatedMovies}
          type="movie"
          loading={contentLoading}
          viewAllHref="/movies"
          accentColor="#8B5CF6"
        />

        {/* Popular Anime */}
        <ContentRow
          title="Most Popular Anime"
          subtitle="Fan favourites across all genres"
          items={popularAnime}
          type="anime"
          loading={contentLoading}
          viewAllHref="/anime"
          accentColor="#06FFA5"
        />

        {/* Top Rated TV */}
        <ContentRow
          title="Top Rated TV Shows"
          subtitle="The best television has to offer"
          items={topRatedTV}
          type="tv"
          loading={contentLoading}
          viewAllHref="/tv"
          accentColor="#00D4FF"
        />

        {/* Feature Banner */}
        <FeatureBanner />
      </div>

      <Footer />
    </div>
  );
}

function FeatureBanner() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative rounded-2xl overflow-hidden p-8 sm:p-12"
        style={{
          background: "linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(6, 255, 165, 0.06) 100%)",
          border: "1px solid rgba(0, 212, 255, 0.15)",
        }}
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #8B5CF6, transparent)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #00D4FF, transparent)" }} />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="zx-section-label mb-2">ZENTRIX_TECH PLATFORM</div>
            <h2 className="text-2xl sm:text-3xl font-800 mb-3"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                color: "#F0F4FF",
                letterSpacing: "-0.02em",
              }}>
              Movies, TV Shows & Anime
              <br />
              <span style={{
                background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                All in One Place
              </span>
            </h2>
            <p className="text-sm" style={{ color: "#8899AA", fontFamily: "'Inter', sans-serif", maxWidth: "400px" }}>
              Discover thousands of movies, binge-worthy TV series, and the best anime — with real-time metadata, ratings, and seamless playback.
            </p>
          </div>
          <div className="flex flex-col gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              {[
                { icon: Film, label: "Movies", color: "#00D4FF" },
                { icon: Tv, label: "TV Shows", color: "#06FFA5" },
                { icon: Sword, label: "Anime", color: "#8B5CF6" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span className="text-xs font-600"
                    style={{ color: "#F0F4FF", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
