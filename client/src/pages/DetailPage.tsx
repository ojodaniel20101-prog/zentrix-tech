/* ZENTRIX_TECH — Detail Page
   Shows full metadata for movie, TV show, or anime
   Features: backdrop hero, cast, trailers, seasons, related content, watchlist
*/

import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useWatchlist } from "@/contexts/WatchlistContext";
import {
  getMovieDetails, getTVDetails, getAnimeDetails,
  tmdbImg, tmdbBackdrop, getMediaTitle, getMediaYear, getMediaRuntime,
  type TMDBMedia, type AniListMedia,
} from "@/lib/api";
import {
  Play, Bookmark, BookmarkCheck, Star, Clock, Calendar,
  Globe, Tv, Film, Sword, ChevronRight, ExternalLink, Youtube,
  Users, Award, TrendingUp, Info,
} from "lucide-react";
import { Link } from "wouter";

type MediaType = "movie" | "tv" | "anime";

export default function DetailPage() {
  const params = useParams<{ type: string; id: string }>();
  const type = params.type as MediaType;
  const id = Number(params.id);
  const [, navigate] = useLocation();

  const [data, setData] = useState<TMDBMedia | AniListMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "seasons" | "related">("overview");
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    setLoading(true);
    setError(false);
    setData(null);

    const fetch = async () => {
      try {
        if (type === "movie") {
          const res = await getMovieDetails(id);
          setData(res);
          const trailer = res.videos?.results.find(
            (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
          );
          if (trailer) setTrailerKey(trailer.key);
        } else if (type === "tv") {
          const res = await getTVDetails(id);
          setData(res);
          const trailer = res.videos?.results.find(
            (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
          );
          if (trailer) setTrailerKey(trailer.key);
        } else {
          const res = await getAnimeDetails(id);
          setData(res.Media);
          if (res.Media.trailer?.site === "youtube") {
            setTrailerKey(res.Media.trailer.id);
          }
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    };
    fetch();
  }, [type, id]);

  if (loading) {
    return (
      <div style={{ background: "#050816", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full border-2 animate-spin mx-auto mb-4"
              style={{ borderColor: "rgba(0, 212, 255, 0.3)", borderTopColor: "#00D4FF" }} />
            <p className="text-sm" style={{ color: "#8899AA" }}>Loading details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: "#050816", minHeight: "100vh" }}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Info className="w-12 h-12 mx-auto mb-4" style={{ color: "#8899AA" }} />
            <h2 className="text-xl font-700 mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F0F4FF" }}>
              Content not found
            </h2>
            <button onClick={() => navigate("/")} className="mt-4 text-sm" style={{ color: "#00D4FF" }}>
              ← Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAnime = type === "anime";
  const tmdb = !isAnime ? (data as TMDBMedia) : null;
  const anime = isAnime ? (data as AniListMedia) : null;

  const title = isAnime
    ? (anime!.title.english || anime!.title.romaji)
    : getMediaTitle(tmdb!);
  const overview = isAnime
    ? (anime!.description?.replace(/<[^>]*>/g, "") || "")
    : tmdb!.overview;
  const backdrop = isAnime
    ? (anime!.bannerImage || anime!.coverImage.extraLarge)
    : tmdbBackdrop(tmdb!.backdrop_path);
  const poster = isAnime
    ? anime!.coverImage.extraLarge
    : tmdbImg(tmdb!.poster_path, "w500");
  const rating = isAnime
    ? (anime!.averageScore ? (anime!.averageScore / 10).toFixed(1) : null)
    : (tmdb!.vote_average ? tmdb!.vote_average.toFixed(1) : null);
  const year = isAnime
    ? String(anime!.seasonYear || "")
    : getMediaYear(tmdb!);
  const runtime = isAnime
    ? (anime!.duration ? `${anime!.duration}m/ep` : null)
    : getMediaRuntime(tmdb!);
  const genres = isAnime
    ? anime!.genres
    : (tmdb!.genres?.map((g) => g.name) || []);
  const status = isAnime ? anime!.status : tmdb!.status;
  const episodes = isAnime ? anime!.episodes : null;
  const seasons = !isAnime && type === "tv" ? tmdb!.number_of_seasons : null;
  const cast = !isAnime ? (tmdb!.credits?.cast?.slice(0, 12) || []) : [];
  const similar = !isAnime ? (tmdb!.similar?.results?.slice(0, 12) || []) : [];
  const recommendations = !isAnime ? (tmdb!.recommendations?.results?.slice(0, 12) || []) : [];
  const animeChars = isAnime ? (anime!.characters?.edges?.slice(0, 12) || []) : [];
  const animeRelated = isAnime ? (anime!.relations?.edges?.slice(0, 8) || []) : [];

  const inWatchlist = isInWatchlist(id, type);

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(id, type);
    } else {
      addToWatchlist({
        id,
        type,
        title,
        poster: poster || "",
        rating: parseFloat(rating || "0"),
        year,
        addedAt: Date.now(),
      });
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    ...(cast.length > 0 || animeChars.length > 0 ? [{ id: "cast", label: isAnime ? "Characters" : "Cast" }] : []),
    ...(type === "tv" && tmdb?.seasons ? [{ id: "seasons", label: "Seasons" }] : []),
    ...((similar.length > 0 || recommendations.length > 0 || animeRelated.length > 0) ? [{ id: "related", label: "Related" }] : []),
  ] as { id: typeof activeTab; label: string }[];

  return (
    <div style={{ background: "#050816", minHeight: "100vh" }}>
      <Navbar />

      {/* Hero Backdrop */}
      <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        {backdrop && (
          <img src={backdrop} alt={title} className="w-full h-full object-cover"
            style={{ filter: "brightness(0.4) saturate(1.2)" }} />
        )}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 30%, #050816 100%)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(90deg, rgba(5,8,22,0.6) 0%, transparent 60%)" }} />
      </div>

      {/* Content */}
      <div className="relative -mt-40 z-10 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto pb-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Poster */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <div className="w-48 sm:w-56 rounded-2xl overflow-hidden shadow-2xl"
              style={{ border: "1px solid rgba(0, 212, 255, 0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
              {poster ? (
                <img src={poster} alt={title} className="w-full aspect-[2/3] object-cover" />
              ) : (
                <div className="w-full aspect-[2/3] flex items-center justify-center"
                  style={{ background: "rgba(11, 18, 32, 0.8)" }}>
                  <Play className="w-10 h-10" style={{ color: "#8899AA" }} />
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 pt-4 sm:pt-16"
          >
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="zx-badge"
                style={{
                  background: type === "anime" ? "rgba(139, 92, 246, 0.15)" : type === "tv" ? "rgba(6, 255, 165, 0.12)" : "rgba(0, 212, 255, 0.12)",
                  color: type === "anime" ? "#8B5CF6" : type === "tv" ? "#06FFA5" : "#00D4FF",
                  border: `1px solid ${type === "anime" ? "rgba(139,92,246,0.3)" : type === "tv" ? "rgba(6,255,165,0.3)" : "rgba(0,212,255,0.3)"}`,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.65rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "0.25rem",
                }}>
                {type === "anime" ? "ANIME" : type === "tv" ? "TV SERIES" : "MOVIE"}
              </span>
              {status && (
                <span className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: status === "RELEASING" || status === "Released" ? "rgba(6,255,165,0.1)" : "rgba(255,255,255,0.06)",
                    color: status === "RELEASING" || status === "Released" ? "#06FFA5" : "#8899AA",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.65rem",
                  }}>
                  {status}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-800 mb-3 leading-tight"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 800,
                color: "#F0F4FF",
                letterSpacing: "-0.02em",
              }}>
              {title}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {rating && parseFloat(rating) > 0 && (
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-current" style={{ color: "#FFD700" }} />
                  <span className="font-700 text-sm" style={{ color: "#FFD700", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
                    {rating}
                  </span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: "#8899AA" }} />
                  <span className="text-sm" style={{ color: "#8899AA" }}>{year}</span>
                </div>
              )}
              {runtime && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" style={{ color: "#8899AA" }} />
                  <span className="text-sm" style={{ color: "#8899AA" }}>{runtime}</span>
                </div>
              )}
              {episodes && (
                <div className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" style={{ color: "#8899AA" }} />
                  <span className="text-sm" style={{ color: "#8899AA" }}>{episodes} episodes</span>
                </div>
              )}
              {seasons && (
                <div className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" style={{ color: "#8899AA" }} />
                  <span className="text-sm" style={{ color: "#8899AA" }}>{seasons} seasons</span>
                </div>
              )}
            </div>

            {/* Genres */}
            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {genres.map((g) => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      color: "#8899AA",
                      border: "1px solid rgba(255,255,255,0.08)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 600,
                    }}>
                    {g}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/watch/${type}/${id}`}>
                <motion.div
                  className="flex items-center gap-2 px-6 py-3 rounded-xl cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #00D4FF, #8B5CF6)",
                    color: "#050816",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    boxShadow: "0 8px 30px rgba(0, 212, 255, 0.25)",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </motion.div>
              </Link>

              {trailerKey && (
                <motion.button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    color: "#F0F4FF",
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                  whileHover={{ background: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Youtube className="w-4 h-4" style={{ color: "#FF2D55" }} />
                  Trailer
                </motion.button>
              )}

              <motion.button
                onClick={handleWatchlist}
                className="flex items-center gap-2 px-5 py-3 rounded-xl"
                style={{
                  background: inWatchlist ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.06)",
                  color: inWatchlist ? "#8B5CF6" : "#F0F4FF",
                  border: `1px solid ${inWatchlist ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.1)"}`,
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {inWatchlist ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {inWatchlist ? "Saved" : "Watchlist"}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mt-10 border-b" style={{ borderColor: "rgba(0, 212, 255, 0.1)" }}>
          <div className="flex items-center gap-1 overflow-x-auto pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-5 py-3 text-sm font-600 whitespace-nowrap transition-all relative"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: activeTab === tab.id ? "#00D4FF" : "#8899AA",
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="detail-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: "#00D4FF" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "overview" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl">
              <p className="text-base leading-relaxed" style={{ color: "rgba(240,244,255,0.8)", fontFamily: "'Inter', sans-serif" }}>
                {overview || "No overview available."}
              </p>

              {/* Extra info grid */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {isAnime && anime?.studios?.nodes && anime.studios.nodes.filter((s) => s.isAnimationStudio).length > 0 && (
                  <InfoBlock label="Studio" value={anime!.studios!.nodes.filter((s) => s.isAnimationStudio)[0]?.name ?? ""} />
                )}
                {isAnime && anime?.format && (
                  <InfoBlock label="Format" value={anime.format} />
                )}
                {isAnime && anime?.season && anime?.seasonYear && (
                  <InfoBlock label="Season" value={`${anime.season} ${anime.seasonYear}`} />
                )}
                {!isAnime && tmdb?.original_language && (
                  <InfoBlock label="Language" value={tmdb.original_language.toUpperCase()} />
                )}
                {!isAnime && tmdb?.status && (
                  <InfoBlock label="Status" value={tmdb.status} />
                )}
                {!isAnime && type === "tv" && tmdb?.number_of_episodes && (
                  <InfoBlock label="Episodes" value={String(tmdb.number_of_episodes)} />
                )}
                {!isAnime && tmdb?.credits?.crew?.find((c) => c.job === "Director") && (
                  <InfoBlock label="Director" value={tmdb!.credits!.crew!.find((c) => c.job === "Director")!.name} />
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "cast" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {!isAnime && cast.map((person) => (
                  <div key={person.id} className="text-center">
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2"
                      style={{ background: "rgba(11, 18, 32, 0.8)", border: "1px solid rgba(0,212,255,0.08)" }}>
                      {person.profile_path ? (
                        <img src={tmdbImg(person.profile_path, "w185") || ""} alt={person.name}
                          className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-8 h-8" style={{ color: "#8899AA" }} />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-600 truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#F0F4FF" }}>
                      {person.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "#8899AA" }}>{person.character}</p>
                  </div>
                ))}
                {isAnime && animeChars.map((edge) => (
                  <div key={edge.node.id} className="text-center">
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2"
                      style={{ background: "rgba(11, 18, 32, 0.8)", border: "1px solid rgba(139,92,246,0.12)" }}>
                      <img src={edge.node.image.large} alt={edge.node.name.full}
                        className="w-full h-full object-cover" />
                    </div>
                    <p className="text-xs font-600 truncate"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#F0F4FF" }}>
                      {edge.node.name.full}
                    </p>
                    <p className="text-xs truncate" style={{ color: "#8899AA" }}>{edge.role}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "seasons" && type === "tv" && tmdb?.seasons && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tmdb.seasons.filter((s) => s.season_number > 0).map((season) => (
                  <Link key={season.id} href={`/watch/tv/${id}?season=${season.season_number}&episode=1`}>
                    <motion.div
                      className="flex gap-3 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: "rgba(11, 18, 32, 0.6)",
                        border: "1px solid rgba(0, 212, 255, 0.08)",
                      }}
                      whileHover={{ borderColor: "rgba(0, 212, 255, 0.3)", background: "rgba(0, 212, 255, 0.05)" }}
                    >
                      <div className="w-16 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0"
                        style={{ background: "rgba(11, 18, 32, 0.8)" }}>
                        {season.poster_path ? (
                          <img src={tmdbImg(season.poster_path, "w185") || ""} alt={season.name}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv className="w-5 h-5" style={{ color: "#8899AA" }} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-600 text-sm truncate"
                          style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#F0F4FF" }}>
                          {season.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#8899AA" }}>
                          {season.episode_count} episodes
                        </p>
                        {season.air_date && (
                          <p className="text-xs mt-0.5" style={{ color: "#8899AA" }}>
                            {season.air_date.substring(0, 4)}
                          </p>
                        )}
                      </div>
                      <Play className="w-4 h-4 flex-shrink-0 self-center" style={{ color: "#00D4FF" }} />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "related" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {(recommendations.length > 0 || similar.length > 0) && (
                <ContentRow
                  title="Recommended"
                  items={recommendations.length > 0 ? recommendations : similar}
                  type={type === "anime" ? "anime" : type}
                  accentColor="#00D4FF"
                />
              )}
              {isAnime && animeRelated.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {animeRelated.map((edge) => (
                    <Link key={edge.node.id} href={`/detail/anime/${edge.node.id}`}>
                      <motion.div
                        className="rounded-xl overflow-hidden cursor-pointer"
                        style={{ border: "1px solid rgba(139,92,246,0.1)" }}
                        whileHover={{ borderColor: "rgba(139,92,246,0.4)", y: -2 }}
                      >
                        <img src={edge.node.coverImage.large} alt={edge.node.title.english || edge.node.title.romaji}
                          className="w-full aspect-[3/4] object-cover" />
                        <div className="p-2">
                          <p className="text-xs font-600 truncate"
                            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, color: "#F0F4FF" }}>
                            {edge.node.title.english || edge.node.title.romaji}
                          </p>
                          <p className="text-xs" style={{ color: "#8B5CF6" }}>{edge.relationType}</p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Trailer Modal */}
      {trailerOpen && trailerKey && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(5, 8, 22, 0.95)", backdropFilter: "blur(16px)" }}
          onClick={() => setTrailerOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden"
            style={{ border: "1px solid rgba(0, 212, 255, 0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl"
      style={{ background: "rgba(11, 18, 32, 0.6)", border: "1px solid rgba(0,212,255,0.08)" }}>
      <p className="text-xs font-700 uppercase tracking-wider mb-1"
        style={{ color: "#8899AA", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
        {label}
      </p>
      <p className="text-sm font-600"
        style={{ color: "#F0F4FF", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
        {value}
      </p>
    </div>
  );
}
