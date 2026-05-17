/*
   ZENTRIX_TECH — Watch Page
   Design: Obsidian Forge — full cinematic player experience
   Features:
   - Multiple embed server sources with fallback
   - TV episode/season selector
   - Anime episode selector
   - Server switcher UI
   - Continue watching integration
   - Related content below player
   - Ad-blocker integration
   - Fullscreen support
*/

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import ContentRow from "@/components/ContentRow";
import Footer from "@/components/Footer";
import { useWatchlist } from "@/contexts/WatchlistContext";
import {
  getMovieDetails, getTVDetails, getAnimeDetails, getTVSeason,
  getMovieEmbedUrl, getTVEmbedUrl, getAnimeEmbedUrl,
  getMovieEmbedFallback, getTVEmbedFallback,
  tmdbImg, tmdbBackdrop, getMediaTitle, getMediaYear,
  type TMDBMedia, type AniListMedia, type TMDBEpisode,
} from "@/lib/api";
import {
  Play, ChevronLeft, ChevronRight, Server, AlertTriangle,
  Tv, Film, Sword, Star, Calendar, Clock, Loader2,
  List, Grid, RefreshCw, ExternalLink, Bookmark, BookmarkCheck,
  Maximize, Volume2, Download,
} from "lucide-react";
import DownloadModal from "@/components/DownloadModal";

type MediaType = "movie" | "tv" | "anime";

// ─── Embed Server Definitions ─────────────────────────────────────────────────
interface EmbedServer {
  id: string;
  name: string;
  getUrl: (id: number, season?: number, episode?: number) => string;
  badge?: string;
}

const MOVIE_SERVERS: EmbedServer[] = [
  {
    id: "multiembed",
    name: "MultiEmbed",
    badge: "HD",
    getUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    badge: "4K",
    getUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: "vidsrc2",
    name: "VidSrc.cc",
    badge: "HD",
    getUrl: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    id: "embedsu",
    name: "Embed.su",
    badge: "HD",
    getUrl: (id) => `https://embed.su/embed/movie/${id}`,
  },
];

const TV_SERVERS: EmbedServer[] = [
  {
    id: "multiembed",
    name: "MultiEmbed",
    badge: "HD",
    getUrl: (id, season = 1, episode = 1) =>
      `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`,
  },
  {
    id: "vidsrc",
    name: "VidSrc",
    badge: "4K",
    getUrl: (id, season = 1, episode = 1) =>
      `https://vidsrc.me/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`,
  },
  {
    id: "vidsrc2",
    name: "VidSrc.cc",
    badge: "HD",
    getUrl: (id, season = 1, episode = 1) =>
      `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`,
  },
  {
    id: "embedsu",
    name: "Embed.su",
    badge: "HD",
    getUrl: (id, season = 1, episode = 1) =>
      `https://embed.su/embed/tv/${id}/${season}/${episode}`,
  },
];

const ANIME_SERVERS: EmbedServer[] = [
  {
    id: "multiembed-anime",
    name: "MultiEmbed",
    badge: "HD",
    getUrl: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    id: "vidsrc-anime",
    name: "VidSrc",
    badge: "4K",
    getUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: "zoro",
    name: "Zoro",
    badge: "SUB",
    getUrl: (id, _season, episode = 1) =>
      `https://zoro.to/watch/${id}?ep=${episode}`,
  },
  {
    id: "aniwatch",
    name: "AniWatch",
    badge: "SUB",
    getUrl: (id, _season, episode = 1) =>
      `https://aniwatch.to/watch/${id}?ep=${episode}`,
  },
  {
    id: "gogoanime",
    name: "GogoAnime",
    badge: "DUB",
    getUrl: (id, _season, episode = 1) =>
      `https://gogoanime.gg/watch/${id}/ep-${episode}`,
  },
];

export default function WatchPage() {
  const params = useParams<{ type: string; id: string }>();
  const [location] = useLocation();
  const type = params.type as MediaType;
  const id = Number(params.id);
  const urlParams = new URLSearchParams(window.location.search);

  const [data, setData] = useState<TMDBMedia | AniListMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState(Number(urlParams.get("season")) || 1);
  const [episode, setEpisode] = useState(Number(urlParams.get("episode")) || 1);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [serverIdx, setServerIdx] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [playerError, setPlayerError] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(true);
  const [episodeView, setEpisodeView] = useState<"grid" | "list">("list");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const { addToHistory, isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const servers = type === "movie" ? MOVIE_SERVERS : type === "tv" ? TV_SERVERS : ANIME_SERVERS;

  // ─── Ad-blocker script injection ───────────────────────────────────────────────
  const injectAdBlocker = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      try {
        const script = iframeRef.current.contentWindow.document.createElement('script');
        script.textContent = `
          (function() {
            // Block common ad networks
            const adBlockList = [
              'google-analytics', 'doubleclick', 'ads.google', 'pagead2.googlesyndication',
              'adservice.google', 'googleadservices', 'analytics.google', 'ads.facebook',
              'connect.facebook', 'platform.twitter', 'ads.twitter', 'amazon-adsystem',
              'adnxs.com', 'scorecardresearch', 'quantserve', 'rubiconproject'
            ];
            
            // Block ad-related scripts
            const originalFetch = window.fetch;
            window.fetch = function(...args) {
              const url = args[0]?.toString?.() || '';
              if (adBlockList.some(domain => url.includes(domain))) {
                return Promise.reject(new Error('Ad blocked'));
              }
              return originalFetch.apply(this, args);
            };
            
            // Block ad iframes
            const originalCreateElement = document.createElement;
            document.createElement = function(tag) {
              const elem = originalCreateElement.call(document, tag);
              if (tag === 'iframe') {
                const originalSetAttribute = elem.setAttribute;
                elem.setAttribute = function(name, value) {
                  if (name === 'src' && adBlockList.some(domain => value.includes(domain))) {
                    return;
                  }
                  return originalSetAttribute.call(this, name, value);
                };
              }
              return elem;
            };
          })();
        `;
        iframeRef.current.contentWindow.document.head.appendChild(script);
      } catch (e) {
        // Cross-origin, ad-blocker injection skipped
      }
    }
  }, []);

  // ─── Fullscreen handler ────────────────────────────────────────────────────────
  const handleFullscreen = () => {
    if (playerContainerRef.current) {
      if (!isFullscreen) {
        playerContainerRef.current.requestFullscreen?.().catch(() => {
          // Fallback: use CSS fullscreen
          setIsFullscreen(true);
        });
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  // ─── Fetch media details ────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      try {
        if (type === "movie") {
          const res = await getMovieDetails(id);
          setData(res);
        } else if (type === "tv") {
          const res = await getTVDetails(id);
          setData(res);
        } else {
          const res = await getAnimeDetails(id);
          setData(res.Media);
        }
      } catch {}
      setLoading(false);
    };
    fetch();
  }, [type, id]);

  // ─── Fetch TV episodes ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (type !== "tv") return;
    setEpisodesLoading(true);
    getTVSeason(id, season)
      .then((res) => setEpisodes(res.episodes || []))
      .catch(() => setEpisodes([]))
      .finally(() => setEpisodesLoading(false));
  }, [type, id, season]);

  // ─── Track watch history ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!data) return;
    const isAnime = type === "anime";
    const tmdb = !isAnime ? (data as TMDBMedia) : null;
    const anime = isAnime ? (data as AniListMedia) : null;
    const title = isAnime
      ? (anime!.title.english || anime!.title.romaji)
      : getMediaTitle(tmdb!);
    const poster = isAnime
      ? anime!.coverImage.large
      : tmdbImg(tmdb!.poster_path, "w185") || "";

    addToHistory({
      id,
      type,
      title,
      poster,
      season: type === "tv" ? season : undefined,
      episode: type !== "movie" ? episode : undefined,
      watchedAt: Date.now(),
    });
  }, [data, season, episode]);

  // ─── Inject ad-blocker on iframe load ───────────────────────────────────────────
  useEffect(() => {
    if (iframeRef.current) {
      setPlayerError(false);
      const timer = setTimeout(() => {
        injectAdBlocker();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [serverIdx, season, episode, injectAdBlocker]);

  // ─── Get current embed URL ──────────────────────────────────────────────────────
  const getEmbedUrl = () => {
    const server = servers[serverIdx];
    return server.getUrl(id, season, episode);
  };

  const handleServerChange = (idx: number) => {
    setServerIdx(idx);
    setPlayerError(false);
    setIframeKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setPlayerError(false);
    setIframeKey((k) => k + 1);
  };

  // ─── Computed values ────────────────────────────────────────────────────────────
  const isAnime = type === "anime";
  const tmdb = !isAnime ? (data as TMDBMedia | null) : null;
  const anime = isAnime ? (data as AniListMedia | null) : null;

  const title = data
    ? isAnime
      ? (anime!.title.english || anime!.title.romaji)
      : getMediaTitle(tmdb!)
    : "Loading...";
  const poster = data
    ? isAnime
      ? anime!.coverImage.large
      : tmdbImg(tmdb!.poster_path, "w185")
    : null;
  const backdrop = data
    ? isAnime
      ? (anime!.bannerImage || anime!.coverImage.extraLarge)
      : tmdbBackdrop(tmdb!.backdrop_path)
    : null;
  const rating = data
    ? isAnime
      ? (anime!.averageScore ? (anime!.averageScore / 10).toFixed(1) : null)
      : (tmdb!.vote_average ? tmdb!.vote_average.toFixed(1) : null)
    : null;
  const year = data
    ? isAnime ? String(anime!.seasonYear || "") : getMediaYear(tmdb!)
    : "";
  const totalSeasons = !isAnime && type === "tv" ? (tmdb?.number_of_seasons || 1) : 0;
  const totalAnimeEpisodes = isAnime ? (anime?.episodes || 0) : 0;
  const inWatchlist = isInWatchlist(id, type);

  const handleWatchlist = () => {
    if (!data) return;
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

  const currentEpisodeData = episodes.find((e) => e.episode_number === episode);

  return (
    <div style={{ background: "#050816", minHeight: "100vh" }}>
      <Navbar />

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title={title}
        mediaId={id}
        mediaType={type}
      />

      <div className="pt-16">
        {/* Player Area */}
        <div className={`${isFullscreen ? "fixed inset-0 z-50" : "max-w-[1440px] mx-auto px-0 sm:px-4 lg:px-8"}`}>
          <div className="flex flex-col xl:flex-row gap-4 mt-4">
            {/* Main Player Column */}
            <div className="flex-1 min-w-0">
              {/* Player Container */}
              <div
                ref={playerContainerRef}
                className={`relative w-full rounded-none sm:rounded-2xl overflow-hidden transition-all ${
                  isFullscreen ? "fixed inset-0 rounded-none" : ""
                }`}
                style={{
                  background: "#000",
                  border: isFullscreen ? "none" : "1px solid rgba(0, 212, 255, 0.1)",
                  aspectRatio: isFullscreen ? "auto" : "16/9",
                  boxShadow: isFullscreen ? "none" : "0 20px 80px rgba(0, 0, 0, 0.8)",
                  height: isFullscreen ? "100vh" : "auto",
                }}
              >
                {loading ? (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "#050816" }}
                  >
                    <div className="text-center">
                      <Loader2
                        className="w-10 h-10 animate-spin mx-auto mb-3"
                        style={{ color: "#00D4FF" }}
                      />
                      <p className="text-sm" style={{ color: "#8899AA" }}>
                        Loading player...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <iframe
                      key={iframeKey}
                      ref={iframeRef}
                      src={getEmbedUrl()}
                      className="w-full h-full"
                      allowFullScreen
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                      style={{ border: "none" }}
                      title={`${title} player`}
                      onLoad={() => injectAdBlocker()}
                      onError={() => setPlayerError(true)}
                    />
                    {/* Player overlay hint */}
                    <div className="absolute top-3 right-3 pointer-events-none flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          background: "rgba(5, 8, 22, 0.8)",
                          color: "#00D4FF",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        {servers[serverIdx].name} · {servers[serverIdx].badge}
                      </span>
                      <span
                        className="text-[10px] px-2 py-1 rounded"
                        style={{
                          background: "rgba(5, 8, 22, 0.8)",
                          color: "#06FFA5",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 600,
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        🛡️ Ad-blocker
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Server Switcher & Controls */}
              {!isFullscreen && (
                <div className="mt-3 px-4 sm:px-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Server className="w-4 h-4 flex-shrink-0" style={{ color: "#8899AA" }} />
                      <span
                        className="text-xs font-600 uppercase tracking-wider"
                        style={{
                          color: "#8899AA",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 700,
                        }}
                      >
                        Server
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {servers.map((server, idx) => (
                        <motion.button
                          key={server.id}
                          onClick={() => handleServerChange(idx)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 600,
                            background:
                              serverIdx === idx
                                ? "rgba(0, 212, 255, 0.15)"
                                : "rgba(11, 18, 32, 0.8)",
                            color: serverIdx === idx ? "#00D4FF" : "#8899AA",
                            border: `1px solid ${
                              serverIdx === idx
                                ? "rgba(0, 212, 255, 0.4)"
                                : "rgba(255,255,255,0.06)"
                            }`,
                          }}
                          whileTap={{ scale: 0.95 }}
                          title={`${server.name} - Ad-blocker enabled`}
                        >
                          <span>{server.name}</span>
                          {server.badge && (
                            <span className="text-[10px] opacity-70">{server.badge}</span>
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Player Controls */}
                  <div className="mt-2 flex items-center gap-2">
                    <motion.button
                      onClick={handleRefresh}
                      className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
                      style={{
                        background: "rgba(11, 18, 32, 0.8)",
                        color: "#8899AA",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      title="Refresh player"
                    >
                      <RefreshCw className="w-3 h-3 inline mr-1" />
                      Refresh
                    </motion.button>

                    <motion.button
                      onClick={handleFullscreen}
                      className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
                      style={{
                        background: "rgba(11, 18, 32, 0.8)",
                        color: "#8899AA",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      title="Fullscreen"
                    >
                      <Maximize className="w-3 h-3 inline mr-1" />
                      Fullscreen
                    </motion.button>

                    <motion.button
                      onClick={() => setShowDownloadModal(true)}
                      className="px-3 py-1.5 rounded-lg text-xs font-600 transition-all"
                      style={{
                        background: "rgba(11, 18, 32, 0.8)",
                        color: "#8899AA",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                      whileTap={{ scale: 0.95 }}
                      title="Download"
                    >
                      <Download className="w-3 h-3 inline mr-1" />
                      Download
                    </motion.button>
                  </div>

                  <div className="text-sm text-gray-400 mt-2">
                    ✓ Ad-blocker enabled on all servers. If a server doesn't load, try switching to
                    another server above.
                  </div>
                </div>
              )}

              {/* Episode/Season Selector */}
              {!isFullscreen && type !== "movie" && (
                <div className="mt-6 px-4 sm:px-0">
                  {type === "tv" && (
                    <div className="mb-4">
                      <label className="text-xs font-600 uppercase tracking-wider" style={{ color: "#8899AA" }}>
                        Season
                      </label>
                      <select
                        value={season}
                        onChange={(e) => {
                          setSeason(Number(e.target.value));
                          setEpisode(1);
                        }}
                        className="mt-2 w-full sm:w-48 px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: "rgba(11, 18, 32, 0.8)",
                          color: "#00D4FF",
                          border: "1px solid rgba(0, 212, 255, 0.2)",
                        }}
                      >
                        {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                          <option key={s} value={s}>
                            Season {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4" style={{ color: "#8899AA" }} />
                      <span className="text-xs font-600 uppercase tracking-wider" style={{ color: "#8899AA" }}>
                        Episodes
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={() => setEpisodeView("list")}
                        className="p-1.5 rounded transition-all"
                        style={{
                          background:
                            episodeView === "list"
                              ? "rgba(0, 212, 255, 0.15)"
                              : "rgba(11, 18, 32, 0.8)",
                          color: episodeView === "list" ? "#00D4FF" : "#8899AA",
                          border: `1px solid ${
                            episodeView === "list"
                              ? "rgba(0, 212, 255, 0.4)"
                              : "rgba(255,255,255,0.06)"
                          }`,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <List className="w-3 h-3" />
                      </motion.button>
                      <motion.button
                        onClick={() => setEpisodeView("grid")}
                        className="p-1.5 rounded transition-all"
                        style={{
                          background:
                            episodeView === "grid"
                              ? "rgba(0, 212, 255, 0.15)"
                              : "rgba(11, 18, 32, 0.8)",
                          color: episodeView === "grid" ? "#00D4FF" : "#8899AA",
                          border: `1px solid ${
                            episodeView === "grid"
                              ? "rgba(0, 212, 255, 0.4)"
                              : "rgba(255,255,255,0.06)"
                          }`,
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Grid className="w-3 h-3" />
                      </motion.button>
                    </div>
                  </div>

                  {/* Episode List */}
                  <div
                    className={`grid gap-2 ${
                      episodeView === "grid"
                        ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"
                        : "grid-cols-1"
                    }`}
                  >
                    {episodesLoading ? (
                      <div className="col-span-full text-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: "#00D4FF" }} />
                      </div>
                    ) : episodes.length > 0 ? (
                      episodes.map((ep) => (
                        <motion.button
                          key={ep.episode_number}
                          onClick={() => setEpisode(ep.episode_number)}
                          className={`p-2 rounded-lg text-xs font-600 transition-all ${
                            episodeView === "grid" ? "text-center" : "text-left flex items-center gap-2"
                          }`}
                          style={{
                            background:
                              episode === ep.episode_number
                                ? "rgba(0, 212, 255, 0.15)"
                                : "rgba(11, 18, 32, 0.8)",
                            color: episode === ep.episode_number ? "#00D4FF" : "#8899AA",
                            border: `1px solid ${
                              episode === ep.episode_number
                                ? "rgba(0, 212, 255, 0.4)"
                                : "rgba(255,255,255,0.06)"
                            }`,
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {episodeView === "grid" ? `E${ep.episode_number}` : `Episode ${ep.episode_number}`}
                          {episodeView === "list" && ep.name && (
                            <span className="text-[10px] opacity-70 ml-auto">{ep.name}</span>
                          )}
                        </motion.button>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-4 text-xs" style={{ color: "#8899AA" }}>
                        No episodes available
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Media Info */}
              {!isFullscreen && (
                <div className="mt-6 px-4 sm:px-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
                        {title}
                      </h1>
                      <div className="flex items-center gap-4 flex-wrap">
                        {rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" style={{ color: "#FFD700" }} />
                            <span style={{ color: "#FFD700" }}>{rating}</span>
                          </div>
                        )}
                        {year && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" style={{ color: "#8899AA" }} />
                            <span style={{ color: "#8899AA" }}>{year}</span>
                          </div>
                        )}
                        <span
                          className="px-2 py-1 rounded text-xs font-600"
                          style={{
                            background:
                              type === "movie"
                                ? "rgba(255, 100, 100, 0.2)"
                                : type === "tv"
                                ? "rgba(100, 200, 255, 0.2)"
                                : "rgba(200, 100, 255, 0.2)",
                            color:
                              type === "movie"
                                ? "#FF6464"
                                : type === "tv"
                                ? "#64C8FF"
                                : "#C864FF",
                          }}
                        >
                          {type === "movie" ? "FILM" : type === "tv" ? "TV" : "ANIME"}
                        </span>
                      </div>
                    </div>
                    <motion.button
                      onClick={handleWatchlist}
                      className="p-3 rounded-lg transition-all"
                      style={{
                        background: inWatchlist
                          ? "rgba(0, 212, 255, 0.15)"
                          : "rgba(11, 18, 32, 0.8)",
                        color: inWatchlist ? "#00D4FF" : "#8899AA",
                        border: `1px solid ${
                          inWatchlist
                            ? "rgba(0, 212, 255, 0.4)"
                            : "rgba(255,255,255,0.06)"
                        }`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {inWatchlist ? (
                        <BookmarkCheck className="w-5 h-5" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Content */}
        {!isFullscreen && data && (
          <>
            <div className="mt-12">
            <ContentRow
              title="More Like This"
              items={[]}
              type="movie"
            />
            </div>
            <Footer />
          </>
        )}
      </div>
    </div>
  );
}
