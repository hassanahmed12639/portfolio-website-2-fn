"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const PRELOADER_HIDE_DELAY_MS = 3200;

/** Routes where the TrackHive preloader should show (not the portfolio). */
function isTrackHiveRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/trackhive" ||
    pathname.startsWith("/trackhive/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}

export default function Preloader() {
  const pathname = usePathname();
  const [hide, setHide] = useState(false);
  const [removed, setRemoved] = useState(false);

  const showPreloader = isTrackHiveRoute(pathname);

  useEffect(() => {
    if (!showPreloader) return;

    const onLoad = () => {
      setTimeout(() => {
        setHide(true);
      }, PRELOADER_HIDE_DELAY_MS);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, [showPreloader]);

  const handleTransitionEnd = () => {
    setRemoved(true);
  };

  if (!showPreloader || removed) return null;

  return (
    <div
      id="preloader"
      className={`preloader-wrap ${hide ? "preloader-hide" : ""}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
    >
      <div className="preloader-logo-wrap">
        <div className="preloader-logo-icon">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-new-1.png"
            alt="TrackHive"
            width={24}
            height={24}
            className="preloader-logo-img"
            fetchPriority="high"
          />
        </div>
        <span className="preloader-logo-name">TrackHive</span>
      </div>

      <div className="preloader-track-container">
        <div className="preloader-track-bar">
          <div className="preloader-track-fill" />
        </div>
        <span className="preloader-track-label">Initializing event pipeline</span>
      </div>

      <div className="preloader-events-wrap">
        <div className="preloader-event-pill preloader-p1">
          <span className="preloader-event-dot preloader-dot-blue" />
          Connecting to Meta CAPI…
          <span className="preloader-event-tag preloader-tag-meta">Meta</span>
        </div>
        <div className="preloader-event-pill preloader-p2">
          <span className="preloader-event-dot preloader-dot-green" />
          Google Ads server ready
          <span className="preloader-event-tag preloader-tag-google">Google</span>
        </div>
        <div className="preloader-event-pill preloader-p3">
          <span className="preloader-event-dot preloader-dot-orange" />
          TikTok Events API synced
          <span className="preloader-event-tag preloader-tag-tiktok">TikTok</span>
        </div>
      </div>

      <p className="preloader-tagline">Track for fast ⚡</p>

      <div className="preloader-corner-deco">
        <span /><span /><span /><span />
        <span /><span /><span /><span />
        <span /><span /><span /><span />
      </div>
    </div>
  );
}
