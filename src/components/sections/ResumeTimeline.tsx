"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { TextRotate } from "@/components/ui/text-rotate";
import type { PortfolioResumeSettings } from "@/lib/portfolio-settings";

const LIME = "#C8FF00";

// ─── Mobile Hook ─────────────────────────────────────────────────────────────
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return isMobile;
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 12px",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    background: "rgba(200,255,0,0.08)",
    color: LIME,
    border: "1px solid rgba(200,255,0,0.25)",
    borderRadius: "4px",
    marginBottom: "12px",
  }}>
    {children}
  </span>
);

const MetricCard = ({ metric, label }: { metric: string; label: string }) => (
  <div style={{
    background: "#0d0d0d",
    border: "1px solid #1f1f1f",
    borderRadius: "10px",
    padding: "14px 16px",
  }}>
    <p style={{ fontSize: "22px", fontWeight: 900, color: LIME, margin: 0, lineHeight: 1 }}>{metric}</p>
    <p style={{ fontSize: "11px", color: "#666", marginTop: "4px", margin: 0 }}>{label}</p>
  </div>
);

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <li style={{ display: "flex", gap: "8px", fontSize: "14px", color: "#aaa", listStyle: "none", alignItems: "flex-start" }}>
    <span style={{ color: LIME, marginTop: "2px", flexShrink: 0 }}>▸</span>
    {children}
  </li>
);

const Divider = () => (
  <div style={{ borderTop: "1px solid #1a1a1a", margin: "8px 0" }} />
);

// ─── Resume Data ──────────────────────────────────────────────────────────────
// NOTE: all gridTemplateColumns are now "repeat(auto-fit, minmax(90px, 1fr))"
// so metric cards reflow naturally on any screen width

const resumeData = [
  {
    title: "2024–Now",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <Badge>Current Role</Badge>
          <h4 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Performance Marketer</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Family Builders and Developers · Pakistan</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "10px" }}>
          {[
            { metric: "3.2×", label: "ROAS Delivered" },
            { metric: "+70%", label: "Qualified Inquiries" },
            { metric: "+14%", label: "Lead-to-Booking" },
            { metric: "CAPI", label: "FB Pixel Upgrade" },
          ].map(({ metric, label }) => <MetricCard key={label} metric={metric} label={label} />)}
        </div>
        <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          <Bullet>Organized sales pipelines improving lead-to-booking ratio by 14%</Bullet>
          <Bullet>Applied Facebook CAPI, enhancing conversion tracking and campaign efficiency</Bullet>
          <Bullet>Boosted qualified inquiries 70%+ via targeted SEO strategies</Bullet>
          <Bullet>Delivered 3.2× ROAS through optimized funnels and omni-channel campaigns</Bullet>
        </ul>
      </div>
    ),
  },
  {
    title: "2024",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <Badge>Jul 2024 – Jul 2025</Badge>
          <h4 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Digital Marketing Executive</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Alliance Shipping Pvt Ltd · UAE</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "10px" }}>
          {[
            { metric: "+40%", label: "Lead Gen" },
            { metric: "+35%", label: "ROAS Boost" },
            { metric: "−20%", label: "CPC Drop" },
          ].map(({ metric, label }) => <MetricCard key={label} metric={metric} label={label} />)}
        </div>
        <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          <Bullet>Achieved 40% increase in lead generation within first 6 months</Bullet>
          <Bullet>Boosted ROAS by 35% through data-driven ad strategies</Bullet>
          <Bullet>Improved CTR by 25% and reduced CPC by 20% through A/B testing</Bullet>
        </ul>
      </div>
    ),
  },
  {
    title: "2023",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <Badge>Feb 2023 – Mar 2024</Badge>
          <h4 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Google Ads Expert</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Digital District · USA</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "10px", marginTop: "14px" }}>
            {[
              { metric: "+40%", label: "ROAS" },
              { metric: "−15%", label: "CPA Reduction" },
              { metric: "+30%", label: "Ad Engagement" },
              { metric: "+20%", label: "eBook Sales" },
            ].map(({ metric, label }) => <MetricCard key={label} metric={metric} label={label} />)}
          </div>
        </div>
        <Divider />
        <div>
          <Badge>Jan 2023 – Jan 2024</Badge>
          <h4 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Google Ads Expert</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: "0 0 14px" }}>Aishco Solutions &amp; Consultancy · USA</p>
          <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <Bullet>Maintained consistent ROI of 250% by optimizing ad strategies</Bullet>
            <Bullet>Increased ad visibility by 30% through precise keyword targeting</Bullet>
            <Bullet>Managed Google Ads to promote software services and increase client acquisition</Bullet>
          </ul>
        </div>
      </div>
    ),
  },
  {
    title: "2021",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <Badge>Feb 2021 – Nov 2021</Badge>
          <h4 style={{ fontSize: "22px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Junior Google Ads Specialist</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Strada Imaging</p>
        </div>
        <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
          <Bullet>Assisted in planning PPC campaigns, increasing lead generation by 20%</Bullet>
          <Bullet>Conducted ad performance analysis to identify optimization opportunities</Bullet>
          <Bullet>Increased ad visibility by 15% through targeted keyword strategies</Bullet>
        </ul>
      </div>
    ),
  },
  {
    title: "2020",
    content: (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div>
          <Badge>May 2020 – Dec 2024</Badge>
          <h4 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>Digital Marketer</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Win Networks</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: "10px", marginTop: "14px" }}>
            <MetricCard metric="280%" label="Avg. ROI" />
            <MetricCard metric="+30%" label="Conversion Rate" />
          </div>
          <ul style={{ margin: "14px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
            <Bullet>Managed PPC campaigns for diverse clients achieving avg. ROI of 280%</Bullet>
            <Bullet>Increased conversion rates by 30% through optimized targeting</Bullet>
            <Bullet>Provided data-driven reports and strategic recommendations to stakeholders</Bullet>
          </ul>
        </div>

        <Divider />

        <div>
          <Badge>Jan 2020 – Jul 2024</Badge>
          <h4 style={{ fontSize: "20px", fontWeight: 800, color: "#fff", margin: "0 0 4px" }}>BSc Media Science</h4>
          <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>Indus University, Pakistan · GPA 3.3</p>
        </div>

        <Divider />

        <div>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: "12px" }}>
            Notable PPC Projects
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px" }}>
            {[
              { name: "Driveucar", country: "USA", url: "https://www.luxurycarrental.ae/" },
              { name: "Ask The Pantry", country: "UK", url: "https://askthepantry.co.uk/" },
              { name: "Perfume Price", country: "UK", url: "https://www.perfumeprice.co.uk/" },
              { name: "Vetoquinol", country: "USA", url: "https://www.vetoquinolusa.com/" },
            ].map(({ name, country, url }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#0d0d0d",
                  border: "1px solid #1f1f1f",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  textDecoration: "none",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = LIME; const p = e.currentTarget.querySelector(".pname") as HTMLElement | null; if (p) p.style.color = LIME; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f1f1f"; const p = e.currentTarget.querySelector(".pname") as HTMLElement | null; if (p) p.style.color = "#fff"; }}
              >
                <div>
                  <p className="pname" style={{ fontSize: "13px", fontWeight: 600, color: "#fff", margin: 0, transition: "color 0.2s" }}>{name}</p>
                  <p style={{ fontSize: "11px", color: "#444", margin: 0 }}>{country}</p>
                </div>
                <span style={{ color: "#333", fontSize: "12px" }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    ),
  },
];

// ─── Timeline Component ───────────────────────────────────────────────────────

type TimelineItem = { title: string; content: React.ReactNode };
type TimelineSettings = {
  heroBadge: string;
  heroTitle: string;
  heroPrefix: string;
  rotateWords: string[];
  contactLinks: { label: string; href: string }[];
  skills: string[];
  tools: string[];
};

export const Timeline = ({ data, settings }: { data: TimelineItem[]; settings: TimelineSettings }) => {
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setHeight(rect.height);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [data]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-black font-sans px-4 sm:px-6 md:px-10"
    >
      {/* ── Hero Header ── */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: isMobile ? "60px 0 32px" : "80px 0 40px" }}>

        {/* Top bar */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          flexDirection: isMobile ? "column" : "row",
          justifyContent: isMobile ? "flex-start" : "space-between",
          alignItems: isMobile ? "flex-start" : "flex-end",
          gap: isMobile ? "24px" : "32px",
          marginBottom: "48px",
        }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: LIME, margin: "0 0 12px" }}>
              {settings.heroBadge}
            </p>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 }}>
              {settings.heroTitle}
            </h1>
            <div style={{ marginTop: "16px", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.25em" }}>
              <span style={{ fontSize: "clamp(20px, 3vw, 32px)", color: "#fff", fontWeight: 300 }}>
                {settings.heroPrefix}{" "}
              </span>
              <TextRotate
                texts={settings.rotateWords}
                mainClassName="text-[#0F0F0F] text-[32px] sm:text-[38px] md:text-4xl lg:text-5xl font-extrabold px-1.5 sm:px-2 md:px-2.5 bg-[#AAFF00] overflow-hidden py-0.5 sm:py-0.5 md:py-1 justify-center rounded-lg leading-tight shadow-[0_0_25px_rgba(170,255,0,0.5),0_0_60px_rgba(170,255,0,0.2)]"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>
          </div>

          {/* Contact links */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: isMobile ? "10px 20px" : "8px",
          }}>
            {settings.contactLinks.map(({ label, href }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                style={{ color: "#555", fontSize: "13px", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = LIME}
                onMouseLeave={e => e.currentTarget.style.color = "#555"}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div style={{ marginBottom: "40px" }}>
          <a href="mailto:hassanonclouds@gmail.com" style={{
            display: "inline-block",
            padding: "14px 36px",
            background: LIME,
            color: "#000",
            fontWeight: 800,
            fontSize: "15px",
            borderRadius: "6px",
            textDecoration: "none",
            boxShadow: `0 0 30px ${LIME}66`,
            transition: "box-shadow 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 50px ${LIME}cc`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = `0 0 30px ${LIME}66`}
          >
            Get Started
          </a>
        </div>

        {/* Skills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "10px" }}>
          {settings.skills.map(s => (
            <span key={s} style={{
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 600,
              border: "1px solid #222",
              color: "#888",
              borderRadius: "4px",
              background: "#0a0a0a",
            }}>{s}</span>
          ))}
        </div>

        {/* Tools */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {settings.tools.map(t => (
            <span key={t} style={{
              padding: "4px 12px",
              fontSize: "11px",
              fontWeight: 600,
              border: `1px solid ${LIME}33`,
              color: LIME,
              borderRadius: "4px",
              background: `${LIME}08`,
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Timeline Header (Aceternity-style) ── */}
      <div className="max-w-7xl mx-auto py-12 md:py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-3xl lg:text-4xl mb-4 text-white dark:text-white max-w-4xl font-bold">
          Changelog from my journey
        </h2>
        <p className="text-neutral-400 dark:text-neutral-400 text-sm md:text-base max-w-sm">
          I&apos;ve been working in performance marketing for 5+ years. Here&apos;s
          a timeline of my journey.
        </p>
      </div>

      {/* ── Timeline ── */}
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row justify-start pt-10 md:pt-20 lg:pt-40 md:gap-10"
          >
            {/* Left: sticky year label + dot (Aceternity layout) */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-32 md:top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              <div
                className="h-10 absolute left-3 md:left-2 w-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#0a0a0a" }}
              >
                <div
                  className="h-4 w-4 rounded-full border shrink-0"
                  style={{
                    background: LIME,
                    borderColor: "rgba(200,255,0,0.3)",
                    boxShadow: `0 0 12px ${LIME}`,
                  }}
                />
              </div>
              <h3 className="hidden md:block text-xl md:pl-16 lg:pl-20 md:text-3xl lg:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            {/* Right: content */}
            <div className="relative pl-14 md:pl-4 pr-4 w-full min-w-0">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* Scrolling progress line */}
        <div
          className="absolute left-6 md:left-8 top-0 overflow-hidden w-[2px] rounded-full"
          style={{
            height: height + "px",
            background: "linear-gradient(to bottom, transparent 0%, #333 10%, #333 90%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
              background: `linear-gradient(to top, ${LIME}, ${LIME}99, transparent)`,
              boxShadow: `0 0 8px ${LIME}`,
            }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full"
          />
        </div>
      </div>
    </div>
  );
};

export default function ResumeTimeline({ settings }: { settings?: PortfolioResumeSettings }) {
  const safeSettings: TimelineSettings = {
    heroBadge: settings?.heroBadge ?? "Performance Marketer - 5+ Years",
    heroTitle: settings?.heroTitle ?? "Hassan Ahmed",
    heroPrefix: settings?.heroPrefix ?? "I build systems that",
    rotateWords: settings?.rotateWords?.length ? settings.rotateWords : ["Convert!", "Scale!", "Perform!", "Grow!", "Sell!", "Win!", "Deliver!"],
    contactLinks: settings?.contactLinks?.length
      ? settings.contactLinks
      : [
          { label: "Email", href: "mailto:hassanonclouds@gmail.com" },
          { label: "Phone", href: "tel:+923313317401" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/hassanahmed25/" },
          { label: "Portfolio", href: "https://shorturl.at/rxysa" },
        ],
    skills: settings?.skills?.length
      ? settings.skills
      : [
          "Keyword Research",
          "Technical SEO",
          "PPC Optimization",
          "Conversion Tracking",
          "A/B Testing",
          "Data Visualization",
          "Account Structuring",
          "AD Account Audit",
          "Content Semantics",
        ],
    tools: settings?.tools?.length
      ? settings.tools
      : ["SEMrush", "Ahrefs", "Moz", "Screaming Frog", "Google Analytics", "Looker Studio", "HubSpot", "Zoho", "monday.com", "Trello"],
  };
  return <Timeline data={resumeData} settings={safeSettings} />;
}
