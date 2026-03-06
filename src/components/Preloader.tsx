"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Longer so Meta, Google Ads, TikTok, GA4 labels all get time on the visible side of the globe */
const PRELOADER_HIDE_DELAY_MS = 13000;

/** Routes where the TrackHive preloader should show */
function isTrackHiveRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return (
    pathname === "/trackhive" ||
    pathname.startsWith("/trackhive/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/")
  );
}

// Ping points: all in front hemisphere (lng -80..80) so every label shows like Meta CAPI
const EVENTS: [number, number, string, string][] = [
  [40, -65, "Meta CAPI", "#2B5BFF"],
  [50, 8, "Google Ads (GA4)", "#22C55E"],
  [38, 55, "TikTok", "#FB923C"],
  [-28, 45, "Snapchat", "#A855F7"],
  [22, 52, "Meta", "#2B5BFF"],
  [52, 12, "GA4", "#22C55E"],
];

export default function Preloader() {
  const pathname = usePathname();
  const [hide, setHide] = useState(false);
  const [removed, setRemoved] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);

  const showPreloader = isTrackHiveRoute(pathname);

  useEffect(() => {
    if (!showPreloader) return;

    const onLoad = () => {
      setTimeout(() => setHide(true), PRELOADER_HIDE_DELAY_MS);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, [showPreloader]);

  useEffect(() => {
    if (!showPreloader || !canvasRef.current || !labelsRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R = 110;

    let angle = 0;
    const SPEED = 0.005;

    const pingSchedule = [1.2, 2.8, 4.2, 5.5, 6.8, 8.0];
    const pings = EVENTS.map(() => ({ t: 0, active: false }));

    const labelEls: HTMLDivElement[] = [];
    EVENTS.forEach((ev) => {
      const el = document.createElement("div");
      el.className = "preloader-ping-label";
      el.textContent = ev[2];
      el.style.color = ev[3];
      el.style.borderColor = ev[3] + "30";
      labelsRef.current!.appendChild(el);
      labelEls.push(el);
    });

    function project(
      latDeg: number,
      lngDeg: number,
      rot: number
    ): { x: number; y: number; z: number; visible: boolean } {
      const lat = (latDeg * Math.PI) / 180;
      const lng = (lngDeg * Math.PI) / 180 + rot;
      const x3 = Math.cos(lat) * Math.sin(lng);
      const y3 = Math.sin(lat);
      const z3 = Math.cos(lat) * Math.cos(lng);
      return {
        x: cx + R * x3,
        y: cy - R * y3,
        z: z3,
        visible: z3 > 0,
      };
    }

    function drawGrid(rot: number) {
      ctx.strokeStyle = "rgba(43,91,255,0.09)";
      ctx.lineWidth = 0.8;

      for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
        const lat = (latDeg * Math.PI) / 180;
        const r2 = R * Math.cos(lat);
        const yOff = -R * Math.sin(lat);
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, r2, r2 * 0.18, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let lngDeg = 0; lngDeg < 180; lngDeg += 30) {
        for (let side = 0; side < 2; side++) {
          const lng = ((lngDeg + side * 180) * Math.PI) / 180 + rot;
          ctx.beginPath();
          let started = false;
          for (let lat = -90; lat <= 90; lat += 3) {
            const latR = (lat * Math.PI) / 180;
            const x3 = Math.cos(latR) * Math.sin(lng);
            const y3 = Math.sin(latR);
            const z3 = Math.cos(latR) * Math.cos(lng);
            if (z3 < -0.1) {
              started = false;
              continue;
            }
            const px = cx + R * x3;
            const py = cy - R * y3;
            if (!started) {
              ctx.moveTo(px, py);
              started = true;
            } else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }
    }

    function drawPing(px: number, py: number, t: number, color: string) {
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      for (let r = 0; r < 2; r++) {
        const prog = Math.min(1, (t - r * 0.3) * 2.2);
        if (prog <= 0) continue;
        const rr = prog * 22;
        const alpha = (1 - prog) * 0.45;
        const hex = (alpha * 255).toString(16).padStart(2, "0");
        const colorHex =
          color.length === 7 ? color + hex : color.slice(0, 7) + hex;
        ctx.beginPath();
        ctx.arc(px, py, rr, 0, Math.PI * 2);
        ctx.strokeStyle = colorHex;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }

    function frame(ts: number) {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = (ts - startTimeRef.current) / 1000;

      ctx.clearRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(
        cx,
        cy,
        R * 0.2,
        cx,
        cy,
        R * 1.1
      );
      grd.addColorStop(0, "rgba(43,91,255,0.04)");
      grd.addColorStop(1, "rgba(43,91,255,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, W, H);

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(43,91,255,0.13)";
      ctx.lineWidth = 1;
      ctx.stroke();

      angle += SPEED;
      drawGrid(angle);

      pingSchedule.forEach((sec, i) => {
        if (!pings[i].active && elapsed >= sec) {
          pings[i].active = true;
          pings[i].t = 0;
        }
      });

      EVENTS.forEach((ev, i) => {
        if (!pings[i].active) return;
        pings[i].t += 0.016;

        const pt = project(ev[0], ev[1], angle);
        if (!pt.visible) {
          labelEls[i].style.opacity = "0";
          return;
        }

        drawPing(pt.x, pt.y, pings[i].t, ev[3]);

        const rect = canvas.getBoundingClientRect();
        const lx = rect.left + pt.x + 10;
        const ly = rect.top + pt.y - 14;
        labelEls[i].style.left = `${lx}px`;
        labelEls[i].style.top = `${ly}px`;

        const labelAlpha = Math.min(1, (pings[i].t - 0.2) * 4);
        labelEls[i].style.opacity = String(Math.max(0, labelAlpha));
      });

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      labelEls.forEach((l) => l.remove());
    };
  }, [showPreloader]);

  const handleTransitionEnd = () => {
    setRemoved(true);
  };

  if (!showPreloader || removed) return null;

  return (
    <div
      id="preloader"
      className={`preloader-wrap preloader-globe ${hide ? "preloader-hide" : ""}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
    >
      <div className="preloader-globe-logo">
        <div className="preloader-globe-logo-mark">
          <svg
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <polyline
              points="2,13 6,8 10,11 16,4"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="12,4 16,4 16,8"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="preloader-globe-logo-name">TrackHive</span>
      </div>

      <canvas
        ref={canvasRef}
        id="preloader-globe-canvas"
        width={280}
        height={280}
        className="preloader-globe-canvas"
      />

      <div className="preloader-globe-status">
        <div className="preloader-globe-bar-track">
          <div className="preloader-globe-bar-fill" />
        </div>
        <span className="preloader-globe-status-text">
          Connecting event streams
        </span>
      </div>

      <div ref={labelsRef} className="preloader-ping-labels" />
    </div>
  );
}
