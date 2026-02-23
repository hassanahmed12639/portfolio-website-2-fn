"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const T = {
  bg:       "#0d0d0d",
  card:     "#141414",
  border:   "#252525",
  green:    "#aaff00",
  greenDim: "#5a8800",
  white:    "#ffffff",
  grey:     "#555555",
  dim:      "#2a2a2a",
};

const JOURNEY = [
  {
    step:"01", title:"Meta Ads Campaign",
    nodes:["meta","website","pixel","capi","events_mgr","audience_seg","campaign_mgr"],
    what:"Meta Ads drive traffic to the website. Meta Pixel + CAPI track browser & server-side events. Events Manager validates signal quality and deduplicates.",
    why:"Meta's algorithm needs clean signal (Pixel + CAPI together). Without CAPI, iOS14+ kills 30–40% of conversion data.",
    output:"Accurate purchase/lead events in Ads Manager. Algorithm trains on real data. ROAS improves.",
  },
  {
    step:"02", title:"Google Ads Campaign",
    nodes:["google","website","gtm","ga4","gads_conv","audience_seg","campaign_mgr"],
    what:"Google Ads send traffic to the website. GTM fires conversion tags + GA4 events. Conversion data is imported back to Google Ads for Smart Bidding.",
    why:"Smart Bidding (tCPA, tROAS) only works with accurate conversion data. No proper tracking = wasted spend.",
    output:"Google Smart Bidding optimises toward real conversions. Quality Score improves. CPA drops.",
  },
  {
    step:"03", title:"TikTok Ads Campaign",
    nodes:["tiktok","website","tiktok_pixel","campaign_mgr"],
    what:"TikTok Ads drive top-of-funnel traffic. TikTok Pixel fires PageView, AddToCart, and Purchase events for conversion optimisation.",
    why:"TikTok's algorithm optimises for events. Without pixel setup you can only optimise for clicks — wasting budget.",
    output:"Event-optimised TikTok campaigns. Algorithm finds buyers, not just clickers.",
  },
  {
    step:"04", title:"Snapchat Ads Campaign",
    nodes:["snapchat","website","snap_pixel","campaign_mgr"],
    what:"Snapchat Story and Collection Ads drive traffic. Snap Pixel fires purchase and lead events for conversion campaigns.",
    why:"Snap's audience skews young and mobile-first. Pixel data enables retargeting and lookalike audiences.",
    output:"Snap campaigns optimised for purchases or leads. Retargeting audiences built from pixel data.",
  },
  {
    step:"05", title:"Email & SMS Flows",
    nodes:["email","website","gtm","ga4"],
    what:"Klaviyo email/SMS flows bring back existing leads and customers. GTM + GA4 track which email links convert.",
    why:"Email has the highest ROI of any channel. Tracking email-attributed conversions in GA4 informs flow optimisation.",
    output:"Revenue attributed to email. Flow performance data. Segment-based send optimisation.",
  },
  {
    step:"06", title:"Audience Building",
    nodes:["website","pixel","capi","events_mgr","gtm","ga4","audience_seg"],
    what:"All conversion data from Pixel, CAPI, and GA4 feeds into audience pools. Lookalike audiences built from best buyers.",
    why:"Warm retargeting audiences convert 3–5× cheaper than cold traffic. Lookalikes scale proven results.",
    output:"Custom and Lookalike audiences synced to Meta, Google, TikTok, and Snap.",
  },
  {
    step:"07", title:"Creative & A/B Testing",
    nodes:["campaign_mgr","creative","ab_test"],
    what:"Multiple ad creatives (UGC videos, statics, carousels) launched simultaneously. Landing page variants A/B tested.",
    why:"Creative is the #1 performance lever. One winning creative can cut CPA by 50%. Data decides, not opinion.",
    output:"Winning creative identified. Budget concentrated on winners. Losers paused immediately.",
  },
  {
    step:"08", title:"Reporting & Optimisation",
    nodes:["campaign_mgr","reporting","optimise","ga4"],
    what:"Weekly reports: ROAS, CPA, CTR, CVR per channel. GA4 shows assisted conversions and user paths.",
    why:"Data without action is noise. Weekly optimisation compounds into major monthly improvement.",
    output:"Winners scaled. Losers cut. Budget reallocated. Month-over-month ROAS growth.",
  },
];

// Nodes with desktop x/y positions (viewBox 1100×640)
const NODES = [
  { id:"meta",         label:"Meta Ads",          sub:"FB · IG · Reels",               col:"source",   x:18,  y:28,  w:152, h:62 },
  { id:"google",       label:"Google Ads",         sub:"Search · PMax · Shopping",      col:"source",   x:18,  y:116, w:152, h:62 },
  { id:"tiktok",       label:"TikTok Ads",         sub:"In-Feed · Spark · TopView",     col:"source",   x:18,  y:204, w:152, h:62 },
  { id:"snapchat",     label:"Snapchat Ads",       sub:"Story · Collection Ads",        col:"source",   x:18,  y:292, w:152, h:62 },
  { id:"email",        label:"Email / SMS",        sub:"Klaviyo · Flows",               col:"source",   x:18,  y:380, w:152, h:62 },
  { id:"website",      label:"Client Website",     sub:"Landing Page · Store",          col:"hub",      x:228, y:208, w:162, h:70, isCenter:true },
  { id:"pixel",        label:"Meta Pixel",         sub:"PageView · ATC · Purchase",     col:"tracking", x:458, y:28,  w:152, h:62 },
  { id:"capi",         label:"CAPI",               sub:"Server-Side · Hashed Data",     col:"tracking", x:458, y:116, w:152, h:62 },
  { id:"gtm",          label:"Google Tag Manager", sub:"Tags · Triggers · GA4",         col:"tracking", x:458, y:204, w:152, h:62 },
  { id:"tiktok_pixel", label:"TikTok Pixel",       sub:"Events · ATC · Purchase",       col:"tracking", x:458, y:292, w:152, h:62 },
  { id:"snap_pixel",   label:"Snap Pixel",         sub:"Purchase · Lead Events",        col:"tracking", x:458, y:380, w:152, h:62 },
  { id:"events_mgr",   label:"Events Manager",     sub:"Meta · Signal · Dedup",         col:"analytics",x:678, y:28,  w:152, h:62 },
  { id:"ga4",          label:"Google Analytics 4", sub:"Sessions · Goals · Paths",      col:"analytics",x:678, y:138, w:152, h:62 },
  { id:"gads_conv",    label:"Google Ads Conv.",   sub:"Smart Bidding · tCPA · ROAS",   col:"analytics",x:678, y:248, w:152, h:62 },
  { id:"audience_seg", label:"Audience Builder",   sub:"Custom · Lookalike · Retarget", col:"analytics",x:678, y:358, w:152, h:62 },
  { id:"campaign_mgr", label:"Campaign Manager",   sub:"Bid · Budget · Schedule",       col:"output",   x:898, y:78,  w:152, h:62 },
  { id:"creative",     label:"Ad Creative",        sub:"Copy · Visuals · UGC",          col:"output",   x:898, y:196, w:152, h:62 },
  { id:"ab_test",      label:"A/B Testing",        sub:"Ads · Landing Pages",           col:"output",   x:898, y:304, w:152, h:62 },
  { id:"reporting",    label:"Reporting",          sub:"ROAS · CPA · CTR · CVR",        col:"output",   x:898, y:412, w:152, h:62 },
  { id:"optimise",     label:"Optimisation",       sub:"Scale · Pause · Iterate",       col:"output",   x:898, y:520, w:152, h:62 },
];

const EDGES = [
  {from:"meta",to:"website"},{from:"google",to:"website"},{from:"tiktok",to:"website"},
  {from:"snapchat",to:"website"},{from:"email",to:"website"},
  {from:"website",to:"pixel"},{from:"website",to:"capi"},{from:"website",to:"gtm"},
  {from:"website",to:"tiktok_pixel"},{from:"website",to:"snap_pixel"},
  {from:"pixel",to:"events_mgr"},{from:"pixel",to:"audience_seg"},
  {from:"capi",to:"events_mgr"},{from:"gtm",to:"ga4"},{from:"gtm",to:"gads_conv"},
  {from:"tiktok_pixel",to:"audience_seg"},{from:"snap_pixel",to:"audience_seg"},
  {from:"events_mgr",to:"audience_seg"},{from:"events_mgr",to:"campaign_mgr"},
  {from:"ga4",to:"gads_conv"},{from:"ga4",to:"audience_seg"},
  {from:"gads_conv",to:"campaign_mgr"},{from:"audience_seg",to:"campaign_mgr"},
  {from:"campaign_mgr",to:"creative"},{from:"campaign_mgr",to:"ab_test"},
  {from:"campaign_mgr",to:"reporting"},{from:"creative",to:"ab_test"},
  {from:"ab_test",to:"reporting"},{from:"reporting",to:"optimise"},
];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

const COL_LABELS = {
  source:"Traffic Sources", hub:"Website Hub",
  tracking:"Tracking", analytics:"Analytics", output:"Output",
};

// ── Icon component ───────────────────────────────────────────
function NodeIcon({ id, cx, cy, color, size = 13 }: { id: string; cx: number; cy: number; color: string; size?: number }) {
  const s = size, x = cx - s/2, y = cy - s/2, c = color;
  switch(id) {
    case "meta":         return <><rect x={x} y={y} width={s} height={s} rx={2.5} fill={c} opacity={0.18}/><text x={cx} y={cy+4} textAnchor="middle" fill={c} fontSize={s*0.7} fontWeight="900" fontFamily="Arial,sans-serif">f</text></>;
    case "google":       return <text x={cx} y={cy+4} textAnchor="middle" fill={c} fontSize={s*0.7} fontWeight="900" fontFamily="Arial,sans-serif">G</text>;
    case "tiktok":       return <><rect x={x} y={y} width={s} height={s} rx={2} fill={c} opacity={0.15}/><text x={cx} y={cy+3.5} textAnchor="middle" fill={c} fontSize={s*0.46} fontWeight="800" fontFamily="monospace">TT</text></>;
    case "snapchat":     return <><circle cx={cx} cy={cy} r={s/2.2} fill={c} opacity={0.15}/><text x={cx} y={cy+3.5} textAnchor="middle" fill={c} fontSize={s*0.46} fontWeight="800" fontFamily="monospace">SC</text></>;
    case "email":        return <><rect x={x} y={y+2} width={s} height={s-4} rx={2} stroke={c} strokeWidth={1.2} fill="none" opacity={0.8}/><path d={`M${x},${y+4} L${cx},${cy} L${x+s},${y+4}`} stroke={c} strokeWidth={1} fill="none"/></>;
    case "website":      return <><rect x={x} y={y+1} width={s} height={s-2} rx={2} stroke={c} strokeWidth={1.2} fill="none"/><line x1={x} y1={y+5} x2={x+s} y2={y+5} stroke={c} strokeWidth={0.9}/><circle cx={x+2.5} cy={y+3} r={0.9} fill={c}/><circle cx={x+5} cy={y+3} r={0.9} fill={c}/></>;
    case "pixel":        return <><circle cx={cx} cy={cy} r={s/2.2} stroke={c} strokeWidth={1.2} fill="none" opacity={0.7}/><circle cx={cx} cy={cy} r={s/6} fill={c}/></>;
    case "capi":         return <><rect x={x+1} y={y+1} width={s-2} height={s-2} rx={2} stroke={c} strokeWidth={1.1} fill="none" opacity={0.7}/><path d={`M${x+3},${cy} L${cx},${y+3} L${x+s-3},${cy} L${cx},${y+s-3}Z`} fill={c} opacity={0.3}/></>;
    case "gtm":          return <><rect x={x} y={y} width={s} height={s} rx={2} fill={c} opacity={0.15}/><text x={cx} y={cy+3} textAnchor="middle" fill={c} fontSize={s*0.42} fontWeight="700" fontFamily="monospace">GTM</text></>;
    case "tiktok_pixel": return <><rect x={x} y={y} width={s} height={s} rx={2} fill={c} opacity={0.15}/><text x={cx} y={cy+3} textAnchor="middle" fill={c} fontSize={s*0.38} fontWeight="700" fontFamily="monospace">TT·PX</text></>;
    case "snap_pixel":   return <><rect x={x} y={y} width={s} height={s} rx={2} fill={c} opacity={0.15}/><text x={cx} y={cy+3} textAnchor="middle" fill={c} fontSize={s*0.38} fontWeight="700" fontFamily="monospace">SN·PX</text></>;
    case "events_mgr":   return <path d={`M${cx},${y+1} L${x+s-1},${y+s-1} L${x+1},${y+s-1}Z`} stroke={c} strokeWidth={1.2} fill={c} fillOpacity={0.2}/>;
    case "ga4":          return <><rect x={x} y={y} width={s} height={s} rx={2} fill={c} opacity={0.15}/><text x={cx} y={cy+3.5} textAnchor="middle" fill={c} fontSize={s*0.42} fontWeight="700" fontFamily="monospace">GA4</text></>;
    case "gads_conv":    return <><circle cx={cx} cy={cy} r={s/2.5} stroke={c} strokeWidth={1.2} fill="none" opacity={0.65}/><text x={cx} y={cy+3.5} textAnchor="middle" fill={c} fontSize={s*0.42} fontWeight="800" fontFamily="Arial,sans-serif">G</text></>;
    case "audience_seg": return <><circle cx={cx-3} cy={cy-1} r={3.5} stroke={c} strokeWidth={1} fill="none"/><circle cx={cx+3.5} cy={cy-1} r={2.5} stroke={c} strokeWidth={0.9} fill="none" opacity={0.6}/><path d={`M${cx-6.5},${cy+6} Q${cx-6.5},${cy+2} ${cx-3},${cy+2} Q${cx},${cy+2} ${cx},${cy+6}`} stroke={c} strokeWidth={1} fill="none"/></>;
    case "campaign_mgr": return <><path d={`M${cx},${y+1} L${x+s},${y+s} L${x},${y+s}Z`} stroke={c} strokeWidth={1.1} fill={c} fillOpacity={0.15}/><line x1={cx} y1={y+5} x2={cx} y2={y+s-3} stroke={c} strokeWidth={1.3}/></>;
    case "creative":     return <><rect x={x+1} y={y+2} width={s-2} height={s-3} rx={1.5} stroke={c} strokeWidth={1} fill="none" opacity={0.6}/><circle cx={x+4} cy={y+6} r={1.8} fill={c} opacity={0.5}/><path d={`M${x+1},${y+s-2} L${x+5},${y+8} L${x+10},${y+s-2}`} stroke={c} strokeWidth={0.9} fill="none"/></>;
    case "ab_test":      return <><line x1={cx} y1={y+1} x2={x+3} y2={y+s-1} stroke={c} strokeWidth={1.2}/><line x1={cx} y1={y+1} x2={x+s-3} y2={y+s-1} stroke={c} strokeWidth={1.2}/><circle cx={cx} cy={y+2.5} r={2} fill={c}/></>;
    case "reporting":    return <><rect x={x+1} y={y+7} width={3} height={s-8} rx={1} fill={c} opacity={0.6}/><rect x={x+5} y={y+3} width={3} height={s-4} rx={1} fill={c} opacity={0.8}/><rect x={x+9} y={y} width={3} height={s} rx={1} fill={c}/></>;
    case "optimise":     return <><circle cx={cx} cy={cy} r={s/2.5} stroke={c} strokeWidth={1.2} fill="none" opacity={0.6}/><path d={`M${cx-2.5},${cy+2} L${cx},${cy-3} L${cx+2.5},${cy+2}`} stroke={c} strokeWidth={1.3} fill="none"/><line x1={cx} y1={cy-3} x2={cx} y2={cy+4} stroke={c} strokeWidth={1.3}/></>;
    default:             return null;
  }
}

function MarketingArchitecture() {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag   = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const [pos, setPos] = useState(() =>
    Object.fromEntries(NODES.map(n => [n.id, { x:n.x, y:n.y }]))
  );
  const [hov,         setHov]         = useState<string | null>(null);
  const [showJourney, setShowJourney] = useState(false);
  const [activeStep,  setActiveStep]  = useState(0);
  const [screenW,     setScreenW]     = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setScreenW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isMobile = screenW < 640;
  const isTablet = screenW >= 640 && screenW < 1024;

  const svgPt = (e: React.MouseEvent | React.TouchEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt  = svg.createSVGPoint();
    const ev  = (e as React.TouchEvent).touches ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
    pt.x = ev.clientX; pt.y = ev.clientY;
    return pt.matrixTransform(svg.getScreenCTM()?.inverse());
  };

  const onDown = useCallback((e: React.MouseEvent | React.TouchEvent, id: string) => {
    e.preventDefault();
    const p = svgPt(e);
    drag.current = { id, ox: p.x - pos[id].x, oy: p.y - pos[id].y };
  }, [pos]);

  const onMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drag.current) return;
    const p = svgPt(e);
    const { id, ox, oy } = drag.current;
    setPos(prev => ({ ...prev, [id]: { x: p.x - ox, y: p.y - oy } }));
  }, []);

  const onUp = () => { drag.current = null; };

  const step      = JOURNEY[activeStep];
  const activeSet = showJourney ? new Set(step.nodes) : null;

  const edgeVisible = (from: string, to: string) => {
    if (!activeSet) return true;
    return activeSet.has(from) && activeSet.has(to);
  };

  // ── SHARED: header + journey panel ──────────────────────────
  const header = (
    <div style={{
      display:"flex", alignItems:"center", gap:10, flexWrap:"wrap",
      padding: isMobile ? "11px 14px" : "12px 20px",
      background:"#0f0f0f", borderBottom:`1px solid ${T.border}`,
    }}>
      <span style={{
        width:7,height:7,borderRadius:"50%",flexShrink:0,
        background:T.green,boxShadow:`0 0 10px ${T.green}`,display:"inline-block",
      }}/>
      <span style={{
        fontSize: isMobile ? 12 : 14,
        fontWeight:700,color:T.white,letterSpacing:"0.01em",flex:1,
      }}>
        Performance Marketing — Customer Journey
      </span>
      <button
        onClick={() => { setShowJourney(v => !v); setActiveStep(0); }}
        style={{
          display:"flex",alignItems:"center",gap:6,
          padding: isMobile ? "5px 12px" : "6px 15px",
          background:showJourney ? T.green : "transparent",
          border:`1.5px solid ${T.green}`,borderRadius:7,
          color:showJourney?"#000":T.green,
          fontSize: isMobile ? 10 : 11,
          fontWeight:700,cursor:"pointer",
          letterSpacing:"0.05em",fontFamily:"'DM Sans',sans-serif",
          transition:"all 0.15s", flexShrink:0,
        }}
      >
        <svg width={9} height={9} viewBox="0 0 10 10">
          {showJourney
            ? <><rect x={1} y={1} width={3} height={8} rx={1} fill="currentColor"/><rect x={6} y={1} width={3} height={8} rx={1} fill="currentColor"/></>
            : <path d="M1,0.5 L9.5,5 L1,9.5Z" fill="currentColor"/>
          }
        </svg>
        {showJourney ? "CLOSE" : "VIEW JOURNEY"}
      </button>
      {isMobile ? (
        <span style={{fontSize:10,color:T.dim,letterSpacing:"0.1em",fontWeight:500}}>SWIPE →</span>
      ) : (
        <span style={{fontSize:10,color:T.dim,letterSpacing:"0.1em",fontWeight:500}}>DRAG NODES</span>
      )}
    </div>
  );

  const journeyPanel = showJourney && (
    <div style={{
      background:"#0a0a0a",borderBottom:`1px solid ${T.border}`,
      padding: isMobile ? "14px 14px" : "16px 20px",
      display:"flex",flexDirection:"column",gap:12,
    }}>
      {/* Step pills — horizontal scroll on mobile */}
      <div style={{
        display:"flex",gap:6,
        overflowX:"auto",
        paddingBottom:4,
        scrollbarWidth:"none",
        msOverflowStyle:"none",
      }}>
        {JOURNEY.map((j,i) => (
          <button key={i} onClick={() => setActiveStep(i)} style={{
            padding: isMobile ? "4px 10px" : "4px 11px",
            borderRadius:20, flexShrink:0,
            border:`1.5px solid ${i===activeStep ? T.green : T.border}`,
            background: i===activeStep ? T.green : "transparent",
            color: i===activeStep ? "#000" : T.grey,
            fontSize: isMobile ? 9 : 10,
            fontWeight:700,cursor:"pointer",
            letterSpacing:"0.04em",fontFamily:"'DM Sans',sans-serif",
            transition:"all 0.12s",
          }}>
            {j.step} · {j.title}
          </button>
        ))}
      </div>

      {/* Info cards — stack on mobile, 3-col on tablet+ */}
      <div style={{
        display:"grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
        gap:8,
      }}>
        {[
          {label:"WHAT WE DO",    text:step.what,   accent:T.green  },
          {label:"WHY IT MATTERS",text:step.why,    accent:"#55ffaa"},
          {label:"OUTPUT",        text:step.output, accent:"#ccff55"},
        ].map(({label,text,accent}) => (
          <div key={label} style={{
            background:T.card,border:`1px solid ${T.border}`,
            borderTop:`2px solid ${accent}`,borderRadius:8,
            padding: isMobile ? "10px 12px" : "10px 13px",
          }}>
            <div style={{fontSize:8,fontWeight:700,color:accent,letterSpacing:"0.15em",marginBottom:5}}>{label}</div>
            <div style={{fontSize: isMobile ? 11 : 11,color:"#bbb",lineHeight:1.6}}>{text}</div>
          </div>
        ))}
      </div>

      {/* Prev/Next */}
      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
        <button onClick={() => setActiveStep(s => Math.max(0,s-1))} disabled={activeStep===0}
          style={{
            padding:"5px 13px",borderRadius:6,
            border:`1px solid ${T.border}`,background:"transparent",
            color:activeStep===0?T.dim:T.white,
            fontSize:11,fontWeight:600,cursor:activeStep===0?"default":"pointer",
            fontFamily:"'DM Sans',sans-serif",
          }}>← Prev</button>
        <button onClick={() => setActiveStep(s => Math.min(JOURNEY.length-1,s+1))}
          disabled={activeStep===JOURNEY.length-1}
          style={{
            padding:"5px 13px",borderRadius:6,
            border:`1.5px solid ${T.green}`,
            background:activeStep===JOURNEY.length-1?"transparent":T.green,
            color:activeStep===JOURNEY.length-1?T.grey:"#000",
            fontSize:11,fontWeight:700,
            cursor:activeStep===JOURNEY.length-1?"default":"pointer",
            fontFamily:"'DM Sans',sans-serif",
          }}>Next →</button>
      </div>
    </div>
  );

  // ── SVG diagram: same canvas for all; mobile = scroll wrapper + fixed width ──
  const svgCanvas = (
    <div
      className={isMobile ? "svg-scroll-wrap" : undefined}
      style={{
        overflowX: isMobile || isTablet ? "auto" : "visible",
        overflowY: "hidden",
        WebkitOverflowScrolling: "touch",
        ...(isMobile && {
          scrollbarWidth: "none",
          position: "relative",
        }),
      }}
    >
      {isMobile && (
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(13,13,13,0.88)",
            border: "1px solid #252525",
            borderRadius: 20,
            padding: "3px 14px",
            color: "#555",
            fontSize: 9,
            pointerEvents: "none",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            gap: 4,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#aaff00" }}>←</span>
          <span>SWIPE TO EXPLORE</span>
          <span style={{ color: "#aaff00" }}>→</span>
        </div>
      )}
      <svg
        ref={svgRef}
        width={isMobile ? 1100 : isTablet ? 1100 : "100%"}
        viewBox="0 0 1100 640"
        style={{
          display: "block",
          touchAction: isMobile ? "pan-x" : "pan-y",
          minHeight: isTablet ? 500 : 480,
          minWidth: isTablet || isMobile ? 1100 : undefined,
        }}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        onTouchMove={e=>{if(drag.current){e.preventDefault();onMove(e);}}}
        onTouchEnd={onUp}
      >
        <defs>
          <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="13" cy="13" r="0.85" fill="#1a1a1a"/>
          </pattern>
          <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="9" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {NODES.map(n => (
            <clipPath key={`cp-${n.id}`} id={`cp-${n.id}`}>
              <rect x={5} y={n.isCenter ? 25 : 5} width={n.w-10} height={n.isCenter ? n.h-28 : n.h-10} rx={4}/>
            </clipPath>
          ))}
          <marker id="arr" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
            <path d="M0,0.5 L0,6.5 L7,3.5Z" fill={T.green} opacity="0.9"/>
          </marker>
          <marker id="arr-dim" markerWidth="6" markerHeight="6" refX="4.5" refY="3" orient="auto">
            <path d="M0,0.5 L0,5.5 L6,3Z" fill="#2e2e2e" opacity="0.9"/>
          </marker>
        </defs>

        <rect width="100%" height="100%" fill={T.bg}/>
        <rect width="100%" height="100%" fill="url(#dots)"/>

        {/* Column labels */}
        {[
          {t:"TRAFFIC SOURCES",x:94},{t:"WEBSITE HUB",x:309},
          {t:"TRACKING LAYER",x:534},{t:"ANALYTICS",x:754},{t:"OUTPUT",x:974},
        ].map(({t,x}) => (
          <text key={t} x={x} y={14} textAnchor="middle"
            fill={T.green} fontSize={7.5} fontWeight={700}
            fontFamily="'DM Sans',sans-serif" letterSpacing="0.18em" opacity={0.3}>{t}</text>
        ))}

        {/* Edges */}
        {EDGES.map(({from,to}) => {
          const n1=nodeMap[from],n2=nodeMap[to];
          if(!n1||!n2) return null;
          const p1=pos[from],p2=pos[to];
          const x1=p1.x+n1.w/2,y1=p1.y+n1.h/2;
          const x2=p2.x+n2.w/2,y2=p2.y+n2.h/2;
          const cpx=(x1+x2)/2+(y2-y1)*0.06;
          const cpy=(y1+y2)/2-(x2-x1)*0.06;
          const vis=edgeVisible(from,to);
          if(showJourney&&!vis) return null;
          return (
            <g key={`${from}-${to}`}>
              {vis&&showJourney&&(
                <path d={`M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`}
                  stroke={T.green} strokeWidth={7} fill="none" opacity={0.06} strokeLinecap="round"/>
              )}
              <path
                d={`M${x1},${y1} Q${cpx},${cpy} ${x2},${y2}`}
                stroke={showJourney?T.green:"#2e2e2e"}
                strokeWidth={showJourney?1.7:1}
                strokeDasharray="5 4"
                fill="none"
                opacity={showJourney?0.8:0.6}
                markerEnd={showJourney?"url(#arr)":"url(#arr-dim)"}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {NODES.map(node => {
          const p=pos[node.id];
          const isHov=hov===node.id;
          const isActive=activeSet?activeSet.has(node.id):false;
          const isDimmed=activeSet?!activeSet.has(node.id):false;
          const isCenter=!!node.isCenter;
          const W=node.w,H=node.h;
          const iconCY=isCenter?H/2+12:H/2-3;
          const labelY=isCenter?H/2+9:H/2-7;
          const subY=isCenter?H/2+22:H/2+9;

          return (
            <g key={node.id} transform={`translate(${p.x},${p.y})`}
              style={{cursor:"grab"}} opacity={isDimmed?0.12:1}
              onMouseDown={e=>onDown(e,node.id)}
              onTouchStart={e=>{e.preventDefault();onDown(e,node.id);}}
              onMouseEnter={()=>setHov(node.id)}
              onMouseLeave={()=>setHov(null)}
            >
              {(isActive||isHov)&&(
                <rect x={-8} y={-8} width={W+16} height={H+16} rx={13}
                  fill={T.green} opacity={isActive?0.09:0.05} filter="url(#glow)"/>
              )}
              <rect x={0} y={0} width={W} height={H} rx={8}
                fill={isActive||isHov?"#191919":T.card}
                stroke={T.green}
                strokeWidth={isCenter?2:isActive?1.6:0.9}
                strokeOpacity={isActive||isHov?1:isCenter?0.6:0.3}
              />
              <rect x={10} y={0} width={W-20} height={2.5} rx={1.5}
                fill={T.green} opacity={isActive||isHov?1:isCenter?0.5:0.2}/>

              {isCenter&&(
                <>
                  <rect x={8} y={7} width={W-16} height={13} rx={3}
                    fill="#181818" stroke={T.dim} strokeWidth={0.7}/>
                  <circle cx={16} cy={13.5} r={2.2} fill="#ff5f57" opacity={0.8}/>
                  <circle cx={23} cy={13.5} r={2.2} fill="#febc2e" opacity={0.8}/>
                  <circle cx={30} cy={13.5} r={2.2} fill={T.green} opacity={0.85}/>
                  <rect x={38} y={9} width={W-50} height={9} rx={2} fill="#1f1f1f"/>
                  <text x={W/2+8} y={15.5} textAnchor="middle"
                    fill={T.grey} fontSize={4.8} fontFamily="monospace">yourwebsite.com</text>
                </>
              )}

              <g clipPath={`url(#cp-${node.id})`}>
                <NodeIcon id={node.id} cx={18} cy={iconCY} color={T.green}/>
                <text x={34} y={labelY}
                  fill={T.white} fontSize={11.5} fontWeight="700"
                  fontFamily="'DM Sans',sans-serif" dominantBaseline="hanging">
                  {node.label}
                </text>
                <text x={34} y={subY}
                  fill={T.greenDim} fontSize={8.5}
                  fontFamily="'DM Sans',sans-serif" dominantBaseline="hanging" opacity={0.85}>
                  {node.sub}
                </text>
              </g>

              {isActive&&activeSet&&(
                <>
                  <rect x={W-25} y={5} width={20} height={12} rx={4}
                    fill={T.green} opacity={0.95}/>
                  <text x={W-15} y={13.5} textAnchor="middle"
                    fill="#000" fontSize={7.5} fontWeight="800"
                    fontFamily="'DM Sans',sans-serif">{step.step}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div style={{
      width:"100%",background:T.bg,borderRadius:14,overflow:"hidden",
      border:`1px solid ${T.border}`,
      boxShadow:"0 24px 80px rgba(0,0,0,0.75)",
      fontFamily:"'DM Sans',sans-serif",
    }}>
      {header}
      {journeyPanel}
      {svgCanvas}

      {/* Legend */}
      <div style={{
        padding: isTablet ? "8px 16px" : "8px 20px",
        borderTop:`1px solid ${T.border}`,background:"#0f0f0f",
        display:"flex",gap:16,flexWrap:"wrap",alignItems:"center",
      }}>
        {[
          [T.green,"Active node"],
          ["#333","Inactive (dimmed)"],
        ].map(([col,lbl])=>(
          <span key={String(lbl)} style={{display:"flex",alignItems:"center",gap:5}}>
            <span style={{width:10,height:7,borderRadius:2,border:`1.5px solid ${col}`,
              background:T.card,display:"inline-block",opacity:col==="#333"?0.4:1}}/>
            <span style={{fontSize:9.5,color:T.grey,fontWeight:600}}>{lbl}</span>
          </span>
        ))}
        <span style={{display:"flex",alignItems:"center",gap:5}}>
          <svg width={26} height={8}>
            <line x1={0} y1={4} x2={26} y2={4} stroke={T.green} strokeWidth={1.6} strokeDasharray="5 4"/>
          </svg>
          <span style={{fontSize:9.5,color:T.grey,fontWeight:600}}>Active connection</span>
        </span>
        {isTablet&&(
          <span style={{fontSize:9.5,color:T.grey,fontWeight:600,fontStyle:"italic"}}>
            ← scroll diagram →
          </span>
        )}
        <span style={{marginLeft:"auto",fontSize:9.5,color:T.grey,fontWeight:600}}>
          <span style={{color:T.green}}>VIEW JOURNEY</span> to highlight flows
        </span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        button:focus{outline:none;}
        div::-webkit-scrollbar{display:none;}
        .svg-scroll-wrap::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}

export default function MyProcessPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-designBg">
      <Header />
      <section className="w-full m-0 py-12 md:py-16 lg:py-20 px-6 md:px-[5%]">
        <MarketingArchitecture />
      </section>
      <Footer />
    </main>
  );
}
