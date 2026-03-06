"use client";

import { useEffect, useState } from "react";

const PRELOADER_HIDE_DELAY_MS = 3200;

export default function Preloader() {
  const [hide, setHide] = useState(false);
  const [removed, setRemoved] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleTransitionEnd = () => {
    setRemoved(true);
  };

  if (removed) return null;

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
            src="/logo-icon.png"
            alt=""
            width={20}
            height={20}
            className="preloader-logo-img"
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
