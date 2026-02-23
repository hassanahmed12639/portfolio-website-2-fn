"use client";
import {
  useScroll,
  useTransform,
  motion,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

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

const Badge = ({ children }) => (
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

const MetricCard = ({ metric, label }) => (
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

const Bullet = ({ children }) => (
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
                onMouseEnter={e => { e.currentTarget.style.borderColor = LIME; const p = e.currentTarget.querySelector(".pname"); if (p) p.style.color = LIME; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#1f1f1f"; const p = e.currentTarget.querySelector(".pname"); if (p) p.style.color = "#fff"; }}
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

export const Timeline = ({ data }) => {
  const isMobile = useIsMobile();
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        background: "#000",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        padding: isMobile ? "0 12px" : "0 20px",
      }}
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
              Performance Marketer · 5+ Years
            </p>
            <h1 style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1 }}>
              Hassan Ahmed
            </h1>
            <div style={{ marginTop: "16px" }}>
              <span style={{ fontSize: "clamp(20px, 3vw, 32px)", color: "#fff", fontWeight: 300 }}>
                I build systems that{" "}
              </span>
              <span style={{
                fontSize: "clamp(20px, 3vw, 32px)",
                fontWeight: 900,
                color: "#000",
                background: LIME,
                padding: "2px 14px",
                borderRadius: "6px",
                boxShadow: `0 0 24px ${LIME}88`,
                display: "inline-block",
              }}>
                Grow!
              </span>
            </div>
          </div>

          {/* Contact links */}
          <div style={{
            display: "flex",
            flexDirection: isMobile ? "row" : "column",
            flexWrap: isMobile ? "wrap" : "nowrap",
            gap: isMobile ? "10px 20px" : "8px",
          }}>
            {[
              { label: "✉ hassanonclouds@gmail.com", href: "mailto:hassanonclouds@gmail.com" },
              { label: "☏ +92-331-3317401", href: "tel:+923313317401" },
              { label: "in LinkedIn", href: "https://www.linkedin.com/in/hassanahmed25/" },
              { label: "⬡ Portfolio", href: "https://shorturl.at/rxysa" },
            ].map(({ label, href }) => (
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
          {["Keyword Research","Technical SEO","PPC Optimization","Conversion Tracking","A/B Testing","Data Visualization","Account Structuring","AD Account Audit","Content Semantics"].map(s => (
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
          {["SEMrush","Ahrefs","Moz","Screaming Frog","Google Analytics","Looker Studio","HubSpot","Zoho","monday.com","Trello"].map(t => (
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

      {/* ── Timeline ── */}
      <div ref={ref} style={{ position: "relative", maxWidth: "1200px", margin: "0 auto", paddingBottom: "80px" }}>
        {data.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "flex-start",
              paddingTop: isMobile ? "40px" : "clamp(40px, 8vw, 160px)",
              gap: isMobile ? "0" : "40px",
            }}
          >

            {/* Left: year label */}
            <div style={{
              position: isMobile ? "relative" : "sticky",
              top: "160px",
              alignSelf: "flex-start",
              display: "flex",
              alignItems: "center",
              minWidth: isMobile ? "auto" : "160px",
              flexShrink: 0,
              marginBottom: isMobile ? "16px" : 0,
            }}>
              <div style={{
                position: "absolute",
                left: "0",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
              }}>
                <div style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: LIME,
                  boxShadow: `0 0 12px ${LIME}`,
                }} />
              </div>
              <h3 style={{
                paddingLeft: "56px",
                fontSize: isMobile ? "32px" : "clamp(24px, 4vw, 48px)",
                fontWeight: 900,
                color: "#1f1f1f",
                margin: 0,
                lineHeight: 1,
              }}>
                {item.title}
              </h3>
            </div>

            {/* Right: content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {item.content}
            </div>
          </div>
        ))}

        {/* Scrolling line */}
        <div style={{
          position: "absolute",
          left: isMobile ? "8px" : "20px",
          top: 0,
          width: "2px",
          height: height + "px",
          background: "linear-gradient(to bottom, transparent 0%, #1f1f1f 10%, #1f1f1f 90%, transparent 100%)",
          maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          overflow: "hidden",
        }}>
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              width: "2px",
              background: `linear-gradient(to bottom, ${LIME}, ${LIME}66, transparent)`,
              boxShadow: `0 0 8px ${LIME}`,
              borderRadius: "9999px",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default function ResumeTimeline() {
  return <Timeline data={resumeData} />;
}
