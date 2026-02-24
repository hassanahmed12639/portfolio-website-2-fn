"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const LIME = "#AAFF00";
const LIME_GLOW = "0 0 24px #AAFF0066, 0 0 8px #AAFF0033";

const times = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
const meetingTypes = [
  { id: "discovery", label: "Discovery Call", duration: "30 min", desc: "Let's explore how I can grow your brand" },
  { id: "strategy", label: "Strategy Session", duration: "60 min", desc: "Deep-dive into your marketing funnel" },
  { id: "audit", label: "Free Audit", duration: "45 min", desc: "I'll audit your current campaigns live" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const ROTATING_WORDS = ["Grow?", "Win!", "Scale?", "Launch!"];

function ContactContent() {
  const today = new Date();
  const [activeTab, setActiveTab] = useState<"form" | "calendar">("form");
  const [rotatingIndex, setRotatingIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setRotatingIndex((i) => (i + 1) % ROTATING_WORDS.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const [form, setForm] = useState({ name:"", email:"", company:"", budget:"", message:"" });
  const [formSent, setFormSent] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("discovery");
  const [calName, setCalName] = useState("");
  const [calEmail, setCalEmail] = useState("");
  const [booked, setBooked] = useState(false);
  const [bookLoading, setBookLoading] = useState(false);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const isDisabled = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t || d.getDay() === 0 || d.getDay() === 6;
  };

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
    setSelectedDate(null); setSelectedTime(null);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
    setSelectedDate(null); setSelectedTime(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setFormLoading(false);
    setFormSent(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    setBookLoading(true);
    await new Promise(r => setTimeout(r, 1400));
    setBookLoading(false);
    setBooked(true);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground font-sans" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0a; }
        input, textarea, select { font-family: 'DM Sans', sans-serif; }
        ::placeholder { color: #555; }
        ::-webkit-scrollbar { width: 4px; } 
        ::-webkit-scrollbar-thumb { background: #AAFF0033; border-radius: 2px; }

        .tab-btn {
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500;
          padding: 10px 28px; border-radius: 100px;
          transition: all 0.2s;
          color: #888;
        }
        .tab-btn.active {
          background: #AAFF00;
          color: #000;
          font-weight: 700;
          box-shadow: 0 0 20px #AAFF0055;
        }
        .form-input {
          width: 100%; background: #111; border: 1px solid #222;
          border-radius: 12px; padding: 14px 18px;
          color: #fff; font-size: 15px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus { border-color: #AAFF00; box-shadow: 0 0 0 3px #AAFF0022; }
        .lime-btn {
          background: #AAFF00; color: #000; border: none;
          border-radius: 100px; padding: 14px 36px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s; box-shadow: 0 0 0 0 #AAFF0055;
          letter-spacing: 0.3px;
        }
        .lime-btn:hover { box-shadow: 0 0 28px #AAFF0066; transform: translateY(-1px); }
        .lime-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .day-btn {
          width: 38px; height: 38px; border-radius: 10px;
          border: none; background: #161616; color: #aaa;
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          cursor: pointer; transition: all 0.15s;
          display: flex; align-items: center; justify-content: center;
        }
        .day-btn:hover:not(:disabled) { background: #222; color: #fff; }
        .day-btn.selected { background: #AAFF00; color: #000; font-weight: 700; box-shadow: 0 0 16px #AAFF0066; }
        .day-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .time-chip {
          padding: 8px 16px; border-radius: 8px;
          border: 1px solid #222; background: #111; color: #aaa;
          font-size: 13px; font-family: 'DM Sans', sans-serif;
          cursor: pointer; transition: all 0.15s;
        }
        .time-chip:hover { border-color: #AAFF0066; color: #fff; }
        .time-chip.selected { border-color: #AAFF00; background: #AAFF0015; color: #AAFF00; }
        .type-card {
          padding: 16px; border-radius: 14px; border: 1px solid #222;
          background: #111; cursor: pointer; transition: all 0.2s;
          text-align: left;
        }
        .type-card:hover { border-color: #AAFF0044; }
        .type-card.selected { border-color: #AAFF00; background: #AAFF0010; box-shadow: 0 0 20px #AAFF0022; }
        .noise-bg::after {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; border-radius: inherit;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div style={{ textAlign:"center", padding:"80px 24px 48px", position:"relative" }}>
        <div style={{
          position:"absolute", top:40, left:"50%", transform:"translateX(-50%)",
          width:400, height:200, background:"#AAFF0012",
          filter:"blur(80px)", borderRadius:"50%", pointerEvents:"none"
        }}/>
        <p style={{ fontFamily:"'Syne', sans-serif", fontSize:13, letterSpacing:4, color:LIME, textTransform:"uppercase", marginBottom:16, fontWeight:700 }}>
          Let's Work Together
        </p>
        <h1 style={{ fontFamily:"'Syne', sans-serif", fontSize:"clamp(36px,6vw,72px)", fontWeight:800, lineHeight:1.05, letterSpacing:"-1px" }}>
          Ready to{" "}
          <span
            style={{
              display: "inline-block",
              background: LIME,
              color: "#0a0a0a",
              fontWeight: 800,
              padding: "4px 14px",
              borderRadius: 12,
              boxShadow: LIME_GLOW,
              textShadow: "0.5px 0 0 rgba(255,80,80,0.4), -0.5px 0 0 rgba(80,150,255,0.4)",
              transition: "opacity 0.25s ease",
            }}
          >
            {ROTATING_WORDS[rotatingIndex]}
          </span>
        </h1>
        <p style={{ color:"#777", fontSize:16, maxWidth:480, margin:"20px auto 0", lineHeight:1.7 }}>
          Whether you have a project in mind or just want to explore — I'm here. Drop a message or book a call directly.
        </p>
      </div>

      <div style={{ display:"flex", justifyContent:"center", marginBottom:48 }}>
        <div style={{ background:"#111", border:"1px solid #222", borderRadius:100, padding:4, display:"flex", gap:4 }}>
          <button className={`tab-btn ${activeTab==="form"?"active":""}`} onClick={()=>setActiveTab("form")}>
            ✉️ Send Message
          </button>
          <button className={`tab-btn ${activeTab==="calendar"?"active":""}`} onClick={()=>setActiveTab("calendar")}>
            📅 Book a Meeting
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 100px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, alignItems:"start" }} className="grid-container">
        <style>{`@media(max-width:768px){ .grid-container{ grid-template-columns:1fr !important; } }`}</style>

        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:20, padding:32, position:"relative", overflow:"hidden" }} className="noise-bg">
            <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, background:LIME, borderRadius:"50%", opacity:0.06, filter:"blur(30px)" }}/>
            <p style={{ fontFamily:"'Syne', sans-serif", fontSize:11, letterSpacing:3, color:LIME, textTransform:"uppercase", marginBottom:20 }}>Contact Info</p>
            {[
              { icon:"📧", label:"Email", val:"hassan@example.com" },
              { icon:"📍", label:"Location", val:"Remote · Worldwide" },
              { icon:"⚡", label:"Response Time", val:"Within 24 hours" },
            ].map(item => (
              <div key={item.label} style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                <div style={{ width:40, height:40, background:"#191919", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:11, color:"#555", textTransform:"uppercase", letterSpacing:1, marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:14, color:"#ccc" }}>{item.val}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:20, padding:32 }}>
            <p style={{ fontFamily:"'Syne', sans-serif", fontSize:11, letterSpacing:3, color:LIME, textTransform:"uppercase", marginBottom:16 }}>What I Help With</p>
            {["Paid Social & Paid Search","Funnel Strategy & CRO","Marketing Automation","Analytics & Attribution","Campaign Audits"].map(s => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:LIME, boxShadow:LIME_GLOW, flexShrink:0 }}/>
                <span style={{ fontSize:14, color:"#bbb" }}>{s}</span>
              </div>
            ))}
          </div>

          <div style={{ background:`linear-gradient(135deg, ${LIME}22 0%, #0a0a0a 100%)`, border:`1px solid ${LIME}33`, borderRadius:20, padding:28 }}>
            <div style={{ fontSize:28, marginBottom:8 }}>🚀</div>
            <p style={{ fontFamily:"'Syne', sans-serif", fontSize:18, fontWeight:700, marginBottom:8 }}>Free Campaign Audit</p>
            <p style={{ fontSize:13, color:"#999", lineHeight:1.6, marginBottom:16 }}>Book a free 45-min audit call and I'll review your existing campaigns live — no strings attached.</p>
            <button className="lime-btn" style={{ padding:"10px 22px", fontSize:13 }} type="button" onClick={()=>{ setActiveTab("calendar"); setSelectedType("audit"); }}>
              Claim Free Audit →
            </button>
          </div>
        </div>

        <div>
          {activeTab === "form" && (
            <div className="fade-up" style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:20, padding:36 }}>
              {formSent ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div style={{ fontSize:56, marginBottom:16 }}>✅</div>
                  <h3 style={{ fontFamily:"'Syne', sans-serif", fontSize:24, marginBottom:8 }}>Message Sent!</h3>
                  <p style={{ color:"#777", fontSize:14 }}>I'll get back to you within 24 hours.</p>
                  <button className="lime-btn" style={{ marginTop:24 }} type="button" onClick={()=>{ setFormSent(false); setForm({ name:"",email:"",company:"",budget:"",message:"" }); }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  <p style={{ fontFamily:"'Syne', sans-serif", fontSize:11, letterSpacing:3, color:LIME, textTransform:"uppercase", marginBottom:4 }}>Send a Message</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div>
                      <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Full Name *</label>
                      <input required className="form-input" placeholder="Hassan Ahmed" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Email *</label>
                      <input required type="email" className="form-input" placeholder="you@company.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Company / Brand</label>
                    <input className="form-input" placeholder="Your Company" value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} />
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Monthly Ad Budget</label>
                    <select className="form-input" value={form.budget} onChange={e=>setForm(f=>({...f,budget:e.target.value}))}>
                      <option value="">Select range...</option>
                      <option>Under $1,000</option>
                      <option>$1,000 – $5,000</option>
                      <option>$5,000 – $20,000</option>
                      <option>$20,000+</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Message *</label>
                    <textarea required className="form-input" rows={5} placeholder="Tell me about your goals, current campaigns, and what you're looking to achieve..." value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} style={{ resize:"vertical" }} />
                  </div>
                  <button className="lime-btn" type="submit" disabled={formLoading} style={{ alignSelf:"flex-end", display:"flex", alignItems:"center", gap:8 }}>
                    {formLoading ? <><span style={{ width:14,height:14,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spinRing 0.7s linear infinite" }}/> Sending...</> : "Send Message →"}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === "calendar" && (
            <div className="fade-up" style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:20, padding:32 }}>
              {booked ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
                  <h3 style={{ fontFamily:"'Syne', sans-serif", fontSize:24, marginBottom:8 }}>Meeting Booked!</h3>
                  <p style={{ color:"#777", fontSize:14, marginBottom:4 }}>
                    {meetingTypes.find(t=>t.id===selectedType)?.label} on
                  </p>
                  <p style={{ color:LIME, fontSize:16, fontWeight:700 }}>
                    {monthNames[calMonth]} {selectedDate}, {calYear} at {selectedTime}
                  </p>
                  <p style={{ color:"#555", fontSize:13, marginTop:8 }}>A calendar invite will be sent to {calEmail}</p>
                  <button className="lime-btn" style={{ marginTop:24 }} type="button" onClick={()=>{ setBooked(false); setSelectedDate(null); setSelectedTime(null); setCalName(""); setCalEmail(""); }}>Book Another</button>
                </div>
              ) : (
                <form onSubmit={handleBook} style={{ display:"flex", flexDirection:"column", gap:22 }}>
                  <p style={{ fontFamily:"'Syne', sans-serif", fontSize:11, letterSpacing:3, color:LIME, textTransform:"uppercase" }}>Book a Meeting</p>

                  <div>
                    <p style={{ fontSize:12, color:"#555", marginBottom:10 }}>Meeting Type</p>
                    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                      {meetingTypes.map(t=>(
                        <button type="button" key={t.id} className={`type-card ${selectedType===t.id?"selected":""}`} onClick={()=>setSelectedType(t.id)}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                            <span style={{ fontSize:14, fontWeight:600, color: selectedType===t.id ? LIME : "#ddd" }}>{t.label}</span>
                            <span style={{ fontSize:11, color:"#555", background:"#1a1a1a", padding:"3px 8px", borderRadius:6 }}>{t.duration}</span>
                          </div>
                          <p style={{ fontSize:12, color:"#666", marginTop:4 }}>{t.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p style={{ fontSize:12, color:"#555", marginBottom:10 }}>Select Date</p>
                    <div style={{ background:"#0e0e0e", borderRadius:14, padding:18 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
                        <button type="button" onClick={prevMonth} style={{ background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:18,padding:"0 8px" }}>‹</button>
                        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:15 }}>{monthNames[calMonth]} {calYear}</span>
                        <button type="button" onClick={nextMonth} style={{ background:"none",border:"none",color:"#666",cursor:"pointer",fontSize:18,padding:"0 8px" }}>›</button>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:8 }}>
                        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=>(
                          <div key={d} style={{ textAlign:"center", fontSize:11, color:"#444", paddingBottom:4 }}>{d}</div>
                        ))}
                        {Array.from({length:firstDay}).map((_,i)=><div key={`e${i}`}/>)}
                        {Array.from({length:daysInMonth}).map((_,i)=>{
                          const day = i+1;
                          return (
                            <button type="button" key={day} disabled={isDisabled(day)}
                              className={`day-btn ${selectedDate===day?"selected":""}`}
                              onClick={()=>{ setSelectedDate(day); setSelectedTime(null); }}
                            >{day}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {selectedDate && (
                    <div>
                      <p style={{ fontSize:12, color:"#555", marginBottom:10 }}>Select Time (EST)</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                        {times.map(t=>(
                          <button type="button" key={t} className={`time-chip ${selectedTime===t?"selected":""}`} onClick={()=>setSelectedTime(t)}>{t}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                    <div>
                      <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Your Name *</label>
                      <input required className="form-input" placeholder="Hassan Ahmed" value={calName} onChange={e=>setCalName(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:"#555", display:"block", marginBottom:6 }}>Email *</label>
                      <input required type="email" className="form-input" placeholder="you@company.com" value={calEmail} onChange={e=>setCalEmail(e.target.value)} />
                    </div>
                  </div>

                  <button className="lime-btn" type="submit" disabled={bookLoading || !selectedDate || !selectedTime} style={{ alignSelf:"flex-end", display:"flex", alignItems:"center", gap:8 }}>
                    {bookLoading ? <><span style={{ width:14,height:14,border:"2px solid #000",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",animation:"spinRing 0.7s linear infinite" }}/> Booking...</> : "Confirm Booking →"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background">
      <Header />
      <ContactContent />
      <Footer />
    </main>
  );
}
