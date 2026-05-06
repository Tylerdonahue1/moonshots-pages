/* Gemini Moonshot XPRIZE — section components */
const { useEffect, useState, useRef } = React;

/* ─────────── NAV ─────────── */
function Nav() {
  const links = [
  ["Categories", "#categories"],
  ["Tools", "#google-stack"],
  ["About", "#about-xprize"],
  ["Prize & dates", "#prize"],
  ["FAQ", "#faq"]];

  const [active, setActive] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Scroll-spy: track which section is in view
  useEffect(() => {
    const ids = links.map(([, h]) => h.replace("#", ""));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    let visibleMap = new Map();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visibleMap.set(e.target.id, e.intersectionRatio);
          else visibleMap.delete(e.target.id);
        });
        if (!visibleMap.size) { setActive(null); return; }
        // Pick the highest-ratio visible section, in document order on tie
        let best = null, bestRatio = -1;
        for (const id of ids) {
          if (visibleMap.has(id) && visibleMap.get(id) > bestRatio) {
            best = id; bestRatio = visibleMap.get(id);
          }
        }
        setActive(best ? "#" + best : null);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Close sheet on resize back to desktop, and on Escape
  useEffect(() => {
    if (!sheetOpen) return;
    const onResize = () => { if (window.innerWidth > 720) setSheetOpen(false); };
    const onKey = (e) => { if (e.key === "Escape") setSheetOpen(false); };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  return (
    <>
    <nav className="site-nav">
      <div className="container site-nav__row">
        <a href="#top" className="site-nav__logo" aria-label="Gemini Moonshot XPRIZE — home">
          <img src="assets/logo-lockup-new.png" alt="Gemini Moonshot XPRIZE" />
        </a>

        <ul className="nav-links">
          {links.map(([l, href]) =>
          <li key={href}>
            <a href={href} className={active === href ? "is-active" : ""}>{l}</a>
          </li>
          )}
          <li className="nav-links__divider" aria-hidden="true" />
          <li>
            <a href="/hackathon-rules" className="nav-links__rules">
              Rules <span aria-hidden="true" className="nav-links__arrow">↗</span>
            </a>
          </li>
        </ul>

        <a className="btn btn-primary nav-register" href="https://xprize.devpost.com/" target="_blank" rel="noopener">
          Register →
        </a>

        <button
          type="button"
          className="nav-hamburger"
          aria-label={sheetOpen ? "Close menu" : "Open menu"}
          aria-expanded={sheetOpen}
          aria-controls="nav-sheet"
          onClick={() => setSheetOpen((v) => !v)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>

    {/* Mobile full-screen sheet — sibling of <nav>, NOT nested inside.
        The nav uses backdrop-filter, which creates a containing block for
        position:fixed descendants and would clamp this sheet to the nav's
        bounding box. Keeping it outside the nav lets the sheet cover the viewport. */}
    <div
      id="nav-sheet"
      className={"nav-sheet" + (sheetOpen ? " is-open" : "")}
      role="dialog"
      aria-modal="true"
      aria-hidden={!sheetOpen}>
      <div className="nav-sheet__head">
        <button
          type="button"
          className="nav-sheet__close"
          aria-label="Close menu"
          onClick={() => setSheetOpen(false)}>×</button>
      </div>
      <ul className="nav-sheet__list">
        {links.map(([l, href]) =>
        <li key={href}>
          <a href={href} onClick={() => setSheetOpen(false)}>{l}</a>
        </li>
        )}
        <li className="nav-sheet__rules">
          <a href="/hackathon-rules" onClick={() => setSheetOpen(false)}>
            Rules <span aria-hidden="true">↗</span>
          </a>
        </li>
      </ul>
      <a
        className="btn btn-primary nav-sheet__cta"
        href="https://xprize.devpost.com/"
        target="_blank"
        rel="noopener"
        onClick={() => setSheetOpen(false)}>
        Register →
      </a>
    </div>
    </>);

}

function Glyph({ size = 36, color = "var(--cyan)" }) {
  return (
    <span style={{
      display: "inline-block",
      width: size, height: size,
      background: color,
      WebkitMask: "radial-gradient(circle at 30% 30%, transparent " + size * 0.28 + "px, #000 " + size * 0.30 + "px)",
      mask: "radial-gradient(circle at 30% 30%, transparent " + size * 0.28 + "px, #000 " + size * 0.30 + "px)",
      flexShrink: 0
    }} />);

}

/* Subtle Gemini-style 4-point spark */
function GeminiSpark({ size = 16, color = "var(--cyan)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: "inline-block" }}>
      <path d="M12 2 C12 8, 16 12, 22 12 C16 12, 12 16, 12 22 C12 16, 8 12, 2 12 C8 12, 12 8, 12 2 Z" fill={color} />
    </svg>);

}

/* ─────────── HERO ─────────── */
function AuroraShader() {
  const canvasRef = useRef(null);
  useEffect(() => {
    let raf, renderer, mesh, material, scene, camera, ro;
    let cancelled = false;

    function start(THREE) {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const parent = canvas.parentElement;
      const isMobile = window.matchMedia("(max-width: 720px)").matches;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, powerPreference: "high-performance" });
      } catch (err) {
        // WebGL unavailable / blocked — leave the CSS gradient fallback on the parent
        console.warn("AuroraShader: WebGL unavailable", err);
        canvas.style.display = "none";
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
      const w = parent.clientWidth, h = parent.clientHeight;
      renderer.setSize(w, h, false);

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      material = new THREE.ShaderMaterial({
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new THREE.Vector2(w, h) }
        },
        vertexShader: `void main(){ gl_Position = vec4(position,1.0); }`,
        fragmentShader: `
          uniform float iTime;
          uniform vec2 iResolution;
          #define NUM_OCTAVES 3
          #define LOOPS_INT ${isMobile ? "20" : "35"}
          #define LOOPS ${isMobile ? "20.0" : "35.0"}
          // tanh polyfill: tanh() is GLSL ES 3.0; not available in ES 1.0 (mobile WebGL 1).
          // CRITICAL: mobile fragment shaders run at mediump (16-bit float, max ~65504).
          // exp(40) ≈ 2.35e17 overflows mediump → NaN → garbage colors on mobile.
          // Real tanh saturates by x≈3, so clamping x*2.0 to 10 (exp(10)≈22026) stays
          // safely in range with zero visual loss.
          vec4 tanh4(vec4 x){
            vec4 e2x = exp(min(x*2.0, vec4(10.0)));
            return (e2x - 1.0) / (e2x + 1.0);
          }
          float rand(vec2 n){return fract(sin(dot(n,vec2(12.9898,4.1414)))*43758.5453);}
          float noise(vec2 p){vec2 ip=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);
            float r=mix(mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),
              mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);return r*r;}
          float fbm(vec2 x){float v=0.0;float a=0.3;vec2 sh=vec2(100);
            mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.5));
            for(int i=0;i<NUM_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+sh;a*=0.4;}return v;}
          void main(){
            vec2 shake=vec2(sin(iTime*1.2)*0.005,cos(iTime*2.1)*0.005);
            vec2 p=((gl_FragCoord.xy+shake*iResolution.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6.0,-4.0,4.0,6.0);
            vec2 v;vec4 o=vec4(0.0);
            float f=2.0+fbm(p+vec2(iTime*5.0,0.0))*0.5;
            // Integer loop counter — required for GLSL ES 1.0 conformance on iOS/Android.
            for(int idx=0; idx<LOOPS_INT; idx++){
              float i = float(idx);
              v=p+cos(i*i+(iTime+p.x*0.08)*0.025+i*vec2(13.0,11.0))*3.5
                +vec2(sin(iTime*3.0+i)*0.003,cos(iTime*3.5-i)*0.003);
              float tn=fbm(v+vec2(iTime*0.5,i))*0.3*(1.0-(i/LOOPS));
              vec4 c=vec4(0.05+0.08*sin(i*0.2+iTime*0.4),
                          0.5+0.3*cos(i*0.3+iTime*0.5),
                          0.7+0.3*sin(i*0.4+iTime*0.3),1.0);
              vec4 cc=c*exp(sin(i*i+iTime*0.8))/length(max(v,vec2(v.x*f*0.015,v.y*1.5)));
              float th=smoothstep(0.0,1.0,i/LOOPS)*0.6;
              o+=cc*(1.0+tn*0.8)*th;
            }
            o=tanh4(pow(o/100.0,vec4(1.6)));
            gl_FragColor=o*1.5;
          }
        `
      });
      mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
      scene.add(mesh);

      // The aurora is a slow, ambient effect — no strobe / parallax / motion-sickness risk.
      // Many mobile users have "Reduce Motion" enabled by default; respecting it would
      // freeze the hero on frame 1, which looks broken. We always animate.
      function resize() {
        const w = parent.clientWidth, h = parent.clientHeight;
        renderer.setSize(w, h, false);
        material.uniforms.iResolution.value.set(w, h);
      }
      ro = new ResizeObserver(resize);
      ro.observe(parent);

      function tick() {
        if (cancelled) return;
        material.uniforms.iTime.value += 0.016;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      }
      tick();
    }

    if (window.THREE) start(window.THREE);
    else window.addEventListener("three-ready", () => start(window.THREE), { once: true });

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (renderer) renderer.dispose();
      if (material) material.dispose();
      if (mesh) mesh.geometry.dispose();
    };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

function Hero() {
  return (
    <header id="top" className="hero-shell" style={{
      position: "relative", overflow: "hidden",
      height: "100vh", minHeight: 720,
      background: "var(--near-black)"
    }}>
      <AuroraShader />
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", alignItems: "center", pointerEvents: "none"
      }}>
        <div className="container" style={{ position: "relative", width: "100%" }}>

        <div className="hero-eyebrow">
          <span className="hero-pill">
            <span className="hero-pill__dot" aria-hidden="true" />
            <span className="hero-pill__amount">$2,000,000 in prizes</span>
            <span className="hero-pill__rest">
              <span aria-hidden="true"> · </span>The Gemini Moonshot XPRIZE
              <span aria-hidden="true"> · </span>Launching at Google I/O · May 19, 2026
            </span>
          </span>
          <span className="hero-eyebrow__sub">Launching at Google I/O · May 19, 2026</span>
        </div>

        <h1 className="display-xl" style={{ maxWidth: "22ch", marginBottom: 28, fontSize: "clamp(36px, 7vw, 70px)", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
           <span className="accent" style={{ fontSize: "clamp(36px, 7vw, 70px)" }}>15 weeks</span> to build a profitable business with AI that solves a real problem. <span className="accent"></span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.92)", maxWidth: "60ch", lineHeight: 1.4, marginBottom: 36, fontWeight: 500, fontSize: "clamp(18px, 3vw, 30px)", textShadow: "0 2px 14px rgba(0,0,0,0.5)" }}>
          <strong style={{ color: "var(--cyan)", fontSize: "clamp(18px, 3vw, 30px)" }}>$2M</strong> in prizes. Build in whatever language you think in.
        </p>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 64, pointerEvents: "auto" }}>
          <a className="btn btn-primary" href="https://xprize.devpost.com/" target="_blank" rel="noopener">Register →</a>
          <a className="btn btn-ghost" href="/hackathon-rules">Read the rules</a>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24, maxWidth: 720,
          paddingTop: 28, borderTop: "1px solid var(--border-dark)"
        }}>
          {[
          ["Total prize", "$2,000,000"],
          ["Build window", "~15 weeks"],
          ["Finals", "Sept 25 · LA"]].
          map(([k, v]) =>
          <div key={k}>
              <div style={{
              fontFamily: "var(--font-pixel)",
              color: "rgba(255,255,255,0.5)", textTransform: "uppercase", marginBottom: 6, fontSize: "18px"
            }}>{k}</div>
              <div style={{
              fontFamily: "var(--font-sans)", fontWeight: 600,
              letterSpacing: "var(--tracking-tight)", fontSize: "22px"
            }}>{v}</div>
            </div>
          )}
        </div>
        </div>
      </div>
    </header>);

}

/* ─────────── DEMO (was inside Challenge) ─────────── */
function Demo() {
  return (
    <section id="demo" data-screen-label="02 Demo">
      <div className="container">
        <span className="eyebrow"><span className="dot" /> The Constraint</span>
        <h2>Build software in your <span className="accent">natural language.</span></h2>
        <p className="lead" style={{ marginBottom: 32, maxWidth: "62ch" }}>
          One rule, the same for everyone: your business has to be operated by AI agents reading plain English. No special syntax. No CS degree required. The constraint is the equalizer — it's how a teacher in Detroit competes head-to-head with a Stanford engineer.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0,
          border: "1px solid var(--border-dark)", borderRadius: 14, overflow: "hidden",
          marginBottom: 56
        }}>
          {[
          ["01", "Write the rules", "Pricing, support, hiring — in plain English documents."],
          ["02", "AI runs operations", "Agents read your docs and act in real time. Real customers, real money."],
          ["03", "Edit to iterate", "Change a paragraph. The business behaves differently by morning."]].
          map(([n, t, d], i) =>
          <div key={n} style={{
            padding: 24, background: "rgba(255,255,255,0.02)",
            borderLeft: i === 0 ? "none" : "1px solid var(--border-dark)",
            display: "flex", flexDirection: "column", gap: 8
          }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 22, color: "var(--cyan)" }}>{n}</div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>{t}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>{d}</div>
            </div>
          )}
        </div>

        <div style={{
          display: "flex", alignItems: "stretch",
          border: "1px solid var(--border-dark)", borderRadius: 14, overflow: "hidden",
          marginBottom: 56, background: "rgba(255,255,255,0.02)"
        }}>
          <div style={{
            padding: "20px 28px", display: "flex", alignItems: "center",
            fontFamily: "var(--font-pixel)", fontSize: 36, color: "var(--cyan)",
            borderRight: "1px solid var(--border-dark)", minWidth: 130, justifyContent: "center"
          }}>
            5 / 12
          </div>
          <div style={{
            padding: "20px 28px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 6
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>
              Minimum operational playbooks every project must include.
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              Pick at least five from: Sales · Onboarding · Support · Pricing · Delivery · HR · Ops/Logistics · Finance · Marketing · Analytics · Compliance · Partnerships.
            </div>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          fontFamily: "var(--font-pixel)", fontSize: 17,
          color: "var(--cyan)", textTransform: "uppercase",
          marginBottom: 20
        }}>
          <span style={{ width: 24, height: 1, background: "var(--cyan)" }} />
          See it run
        </div>
        <h3 style={{ fontSize: 28, marginBottom: 32, maxWidth: "24ch" }}>
          Edit a paragraph on the left. The agent <span className="accent">behaves differently</span> on the right.
        </h3>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          border: "1px solid var(--border-dark)", borderRadius: 18, overflow: "hidden"
        }}>
          <DocPane />
          <AgentPane />
        </div>
      </div>
    </section>);

}

function DocPane() {
  return (
    <div style={{ padding: 36, background: "var(--white)", color: "var(--near-black)" }}>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--mid-gray)", marginBottom: 18, textTransform: "uppercase" }}>
        ▢ pricing.md
      </div>
      <div style={{ fontSize: 17, lineHeight: 1.55 }}>
        <p style={{ marginBottom: 14 }}>
          We charge <mark style={{ background: "var(--cyan)", color: "var(--near-black)", padding: "1px 6px", borderRadius: 3, fontWeight: 600 }}>$29/month</mark> for the standard tier. Annual gets two months free.
        </p>
        <p style={{ marginBottom: 14 }}>
          If a customer mentions a competitor by name and asks for a discount, offer 15% off for three months. Don't go lower without escalation.
        </p>
        <p style={{ marginBottom: 14 }}>
          Refunds within 30 days, no questions. After 30 days, only if the agent failed to deliver a feature we promised.
        </p>
        <p style={{ color: "var(--mid-gray)" }}>
          Schools and nonprofits pay half. Verify with a .edu or .org email; if the domain is unusual, ask politely for proof.
        </p>
      </div>
    </div>);

}

function AgentPane() {
  const [step, setStep] = useState(0);
  const lines = [
  { t: "▶", text: "ticket #4821 — \"can you match Linear's price?\"" },
  { t: "▸", text: "reading pricing.md ..." },
  { t: "✓", text: "rule matched: competitor mention → 15% / 3mo" },
  { t: "→", text: "applied discount, replied to customer" },
  { t: "$", text: "MRR delta +$24.65 · margin retained" }];

  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % (lines.length + 2)), 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      padding: 36, background: "var(--near-black)", color: "var(--white)",
      borderLeft: "1px solid var(--border-dark)",
      display: "flex", flexDirection: "column", gap: 16, minHeight: 320
    }}>
      <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--cyan)", textTransform: "uppercase" }}>
        ▢ AGENT · LIVE
      </div>
      <div style={{ flex: 1, fontFamily: "var(--font-pixel)", fontSize: 18, lineHeight: 1.7 }}>
        {lines.map((l, i) =>
        <div key={i} style={{
          opacity: i < step ? 1 : 0.18,
          transition: "opacity .35s ease",
          display: "grid", gridTemplateColumns: "20px 1fr", gap: 8,
          color: i === step - 1 ? "var(--cyan)" : "var(--white)"
        }}>
            <span>{l.t}</span><span>{l.text}</span>
          </div>
        )}
      </div>
      <div style={{
        fontFamily: "var(--font-pixel)", fontSize: 14,
        color: "var(--mid-gray)", textTransform: "uppercase",
        borderTop: "1px solid var(--border-dark)", paddingTop: 14
      }}>
        EDIT pricing.md → BEHAVIOR CHANGES BY MORNING
      </div>
    </div>);

}

/* ─────────── ABOUT XPRIZE ─────────── */
function AboutXPRIZE() {
  const milestones = [
  ["1996", "Ansari XPRIZE", "$10M for the first private spaceflight. Sparked the commercial space industry."],
  ["2010", "Progressive Insurance", "$10M for a 100 MPGe production-capable car. Fueled the EV economy."],
  ["2020", "IBM Watson AI", "$5M to use AI to address humanity's grand challenges."],
  ["2024", "Carbon Removal", "$100M — the largest incentive prize in history."],
  ["2026", "Gemini Moonshot XPRIZE", "$2M to prove anyone can build a profitable AI business."]];

  return (
    <section id="about-xprize" className="light" data-screen-label="03 About XPRIZE">
      <div className="container">
        <span className="eyebrow" style={{ color: "var(--near-black)" }}>
          <span className="dot" style={{ background: "var(--near-black)" }} /> About XPRIZE
        </span>
        <h2 style={{ marginBottom: 28, color: "var(--near-black)" }}>
          30 years of <span className="accent">moonshots that worked.</span>
        </h2>
        <p className="lead" style={{ marginBottom: 56, maxWidth: "62ch", fontSize: 21, color: "var(--dark-gray)" }}>
          XPRIZE designs and runs large-scale incentive competitions — public challenges with clear, verifiable goals that pull entire industries forward. From private spaceflight to carbon removal, we've used prize money to turn what looked impossible into what's now obvious.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24,
          marginBottom: 64
        }}>
          {[
          ["$300M+", "Awarded to teams across 30 years"],
          ["27", "Competitions launched globally"],
          ["1B+", "Lives impacted by XPRIZE-backed innovation"]].
          map(([n, d]) =>
          <div key={n} style={{
            padding: 28,
            border: "1px solid var(--border)",
            borderRadius: 14,
            background: "var(--off-white)"
          }}>
              <div style={{
              fontSize: 48, fontWeight: 700, color: "var(--cyan)",
              letterSpacing: "var(--tracking-tight)", lineHeight: 1, marginBottom: 12
            }}>{n}</div>
              <div style={{ fontSize: 15, color: "var(--dark-gray)", lineHeight: 1.5 }}>{d}</div>
            </div>
          )}
        </div>

        <div style={{
          fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--cyan)",
          textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 20
        }}>
          ▢ A short history of moonshots
        </div>
        <div style={{
          border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden",
          background: "var(--off-white)"
        }}>
          {milestones.map(([year, name, desc], i) =>
          <div key={year} style={{
            display: "grid", gridTemplateColumns: "120px 1.2fr 2fr",
            gap: 24, padding: "24px 28px",
            borderTop: i === 0 ? "none" : "1px solid var(--border)",
            alignItems: "baseline",
            background: i === milestones.length - 1 ? "rgba(27,191,224,0.08)" : "transparent"
          }}>
              <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 22,
              color: i === milestones.length - 1 ? "var(--cyan)" : "var(--mid-gray)"
            }}>{year}</div>
              <div style={{
              fontSize: 19, fontWeight: 700, letterSpacing: "var(--tracking-tight)",
              color: i === milestones.length - 1 ? "var(--cyan)" : "var(--near-black)"
            }}>{name}</div>
              <div style={{ fontSize: 15, color: "var(--dark-gray)", lineHeight: 1.5 }}>{desc}</div>
            </div>
          )}
        </div>

        <div style={{
          marginTop: 56, padding: "32px 36px",
          border: "1px solid var(--border)", borderRadius: 14,
          background: "var(--near-black)", color: "var(--white)",
          display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center"
        }}>
          <div>
            <div style={{
              fontSize: 22, fontWeight: 600, letterSpacing: "var(--tracking-tight)",
              lineHeight: 1.3, marginBottom: 8
            }}>
              The pattern: <span className="accent">a clear technical hurdle, a verifiable result, a public race.</span>
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, maxWidth: "62ch" }}>
              The Gemini Moonshot XPRIZE follows the same playbook. The hurdle: build a profitable business operated by AI agents reading plain English. The race: ~15 weeks. The proof: profit, opportunity created, AI running the operations.
            </div>
          </div>
          <a className="btn btn-primary" href="https://www.xprize.org" target="_blank" rel="noopener">
            Learn about XPRIZE →
          </a>
        </div>
      </div>
    </section>);

}

/* ─────────── MOONSHOT (manifesto) ─────────── */
function Moonshot() {
  return (
    <section id="moonshot" className="light" data-screen-label="03 The Moonshot">
      <div className="container">
        <span className="eyebrow"><span className="dot" /> The Moonshot</span>
        <h2 style={{ marginBottom: 28 }}>
          15 weeks. <span className="accent">Ideate. Build. Ship. Sell.</span>
        </h2>
        <p className="lead" style={{ marginBottom: 48, fontSize: 21, maxWidth: "64ch" }}>
          Real product. Real revenue. <strong style={{ color: "var(--near-black)" }}>Or you don't qualify.</strong>
        </p>

        <div className="moonshot-steps">
          {[
          ["01", "Ideate", "Pick a real problem worth solving. AI helps you scope it."],
          ["02", "Build", "Prompt your way to a working prototype. No engineering team required."],
          ["03", "Ship", "Deploy the business. Real customers transacting in production."],
          ["04", "Sell", "Market it. Grow it. Show the revenue."]].
          map(([n, t, d]) =>
          <div key={n} className="moonshot-step">
              <div className="moonshot-step__num">{n}</div>
              <div className="moonshot-step__title">{t}</div>
              <div className="moonshot-step__desc">{d}</div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ─────────── CATEGORIES ─────────── */
function Categories() {
  const cats = [
  { n: "01", t: "Education & Human Potential", d: "Workforce upskilling, alternative credentialing, personalized learning." },
  { n: "02", t: "Entrepreneurship & Job Creation", d: "Solo founder enablement, AI-assisted company creation, job matching." },
  { n: "03", t: "Small Business Services", d: "AI-native operations, cashflow, customer acquisition, compliance navigation." },
  { n: "04", t: "Money & Financial Access", d: "Credit access, remittances, micro-lending, financial literacy." },
  { n: "05", t: "Professional Services Access", d: "Legal tools, immigration navigation, mental health support." }];

  return (
    <section id="categories" data-screen-label="06 Categories">
      <div className="container">
        <span className="eyebrow"><span className="dot" /> The Categories</span>
        <h2 style={{ marginBottom: 56 }}>Five categories. <span className="accent">Real problems.</span> Real communities.</h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {cats.map((c) =>
          <div key={c.n} style={{
            border: "1px solid var(--border-dark)", borderRadius: 14,
            padding: 32, background: "rgba(255,255,255,0.02)",
            display: "flex", flexDirection: "column", gap: 14, minHeight: 220,
            transition: "border-color .2s, transform .2s"
          }}
          onMouseEnter={(e) => {e.currentTarget.style.borderColor = "var(--cyan)";e.currentTarget.style.transform = "translateY(-4px)";}}
          onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--border-dark)";e.currentTarget.style.transform = "none";}}>
            
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 28, color: "var(--cyan)" }}>{c.n}</div>
              <h3 style={{ marginBottom: 0 }}>{c.t}</h3>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.5, marginTop: "auto" }}>{c.d}</p>
            </div>
          )}
          <div style={{
            border: "1px solid var(--cyan)", borderRadius: 14,
            padding: 32, background: "linear-gradient(135deg, rgba(27,191,224,0.05), rgba(27,191,224,0.18))",
            display: "flex", flexDirection: "column", gap: 12, minHeight: 220
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 18, color: "var(--cyan)", textTransform: "uppercase" }}>
              ▢ The Meta-Theme
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "var(--tracking-tight)", lineHeight: 1.1 }}>
              Accessibility & Agency.
            </div>
            <p style={{ color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 1.5 }}>
              Communities get solutions to problems ignored for years. Builders get the tools to deliver them.
            </p>
          </div>
        </div>
      </div>
    </section>);

}

/* ─────────── GOOGLE STACK ─────────── */
function GoogleStack() {
  const tools = [
  { name: "Gemini app", use: "Think out loud. Develop your spec.", phase: "Idea" },
  { name: "AI Studio", use: "Prompt your way to a working prototype.", phase: "Prototype" },
  { name: "Antigravity", use: "Agent-native development environment.", phase: "Build" },
  { name: "Cloud Run / GCP", use: "Deploy the business to production.", phase: "Ship" },
  { name: "Stitch", use: "Design what your customers see.", phase: "Design" },
  { name: "Flow", use: "Make the marketing video.", phase: "Launch" },
  { name: "Gemini Ads", use: "Take it to market.", phase: "Grow" }];

  return (
    <section id="google-stack" className="light" data-screen-label="08 Google Stack">
      <div className="container">
        <span className="eyebrow" style={{ color: "var(--near-black)" }}>
          <span className="dot" style={{ background: "var(--near-black)" }} /> Presenting Sponsor · Google
        </span>
        <h2 style={{ color: "var(--near-black)", marginBottom: 56 }}>
          One stack. Idea to revenue. <span className="accent">Solo.</span>
        </h2>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(7, 1fr)",
          fontFamily: "var(--font-pixel)", fontSize: 15, color: "var(--mid-gray)",
          marginBottom: 8, textTransform: "uppercase"
        }}>
          {tools.map((t) => <div key={t.phase} style={{ padding: "0 4px" }}>{t.phase}</div>)}
        </div>
        <div style={{
          height: 4, background: "linear-gradient(90deg, var(--near-black), var(--cyan))",
          borderRadius: 2, marginBottom: 24
        }} />

        <div className="grid grid-4">
          {tools.map((t, i) =>
          <div key={t.name} style={{
            border: "1px solid var(--border)", borderRadius: 14,
            padding: 24, background: "var(--white)",
            display: "flex", flexDirection: "column", gap: 10, minHeight: 160,
            transition: "border-color .2s, transform .2s"
          }}
          onMouseEnter={(e) => {e.currentTarget.style.borderColor = "var(--cyan)";e.currentTarget.style.transform = "translateY(-3px)";}}
          onMouseLeave={(e) => {e.currentTarget.style.borderColor = "var(--border)";e.currentTarget.style.transform = "none";}}>
            
              <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 14,
              color: "var(--cyan)", textTransform: "uppercase"
            }}>0{i + 1} · {t.phase}</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "var(--tracking-tight)", lineHeight: 1.1 }}>
                {t.name}
              </div>
              <div style={{ fontSize: 14, color: "var(--dark-gray)", lineHeight: 1.5, marginTop: "auto" }}>
                {t.use}
              </div>
            </div>
          )}
          <div style={{
            border: "1px solid var(--cyan)", borderRadius: 14,
            padding: 24, background: "var(--near-black)", color: "var(--white)",
            display: "flex", flexDirection: "column", gap: 8, minHeight: 160, justifyContent: "center"
          }}>
            <div style={{ fontFamily: "var(--font-pixel)", color: "var(--cyan)", fontSize: 14, textTransform: "uppercase" }}>RESULT</div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "var(--tracking-tight)", lineHeight: 1.1 }}>
              Idea → revenue, <span className="accent">solo.</span>
            </div>
          </div>
        </div>

        {/* Ultra access CTA */}
        <div style={{
          marginTop: 32, padding: "32px 40px", borderRadius: 16,
          background: "var(--near-black)", color: "var(--white)",
          display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "center",
          border: "1px solid var(--cyan)"
        }}>
          <div>
            <div style={{
              fontFamily: "var(--font-pixel)", fontSize: 16,
              color: "var(--cyan)", textTransform: "uppercase", marginBottom: 10,
              display: "inline-flex", alignItems: "center", gap: 10
            }}>
              <span style={{ width: 8, height: 8, background: "var(--cyan)", borderRadius: "50%", boxShadow: "0 0 12px var(--cyan)" }} />
              Registrant Perk · Limited
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "var(--tracking-tight)", lineHeight: 1.15, marginBottom: 8 }}>
              Get <span className="accent">~15 weeks of Gemini Ultra</span>, on us.
            </div>
            <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 1.5, maxWidth: "60ch" }}>
              Every registered team gets the full Google stack — Gemini Ultra, AI Studio, Antigravity — free for the entire build window. Plus the option to request $100 in Google Cloud credits via the registration form. The whole point is that the tools shouldn't be the gatekeeper.
            </div>
          </div>
          <a className="btn btn-primary" href="https://xprize.devpost.com/" target="_blank" rel="noopener" style={{ whiteSpace: "nowrap" }}>
            Claim Ultra access →
          </a>
        </div>
      </div>
    </section>);

}
/* ─────────── PRIZE & SCHEDULE ─────────── */
function Prize() {
  const grand = [
  ["1st place", "$1,000,000"],
  ["2nd place", "$500,000"],
  ["3rd place", "$200,000"]];

  const cats = [
  "Education & Human Potential",
  "Entrepreneurship & Job Creation",
  "Small Business Services",
  "Money & Financial Access",
  "Professional Services Access"];

  const schedule = [
  ["Launch", "May 19, 2026", "Google I/O"],
  ["Build window", "May 19 – September 1, 2026", "~15 weeks"],
  ["Submission deadline", "September 1, 2026", "1:00 pm PT"],
  ["Top 100 finalists announced", "September 14, 2026", "—"],
  ["Top 5 finalists announced", "September 22, 2026", "—"],
  ["Live finals at Moonshot Summit", "September 25, 2026", "Los Angeles"]];

  return (
    <section id="prize" data-screen-label="09 Prize">
      <div className="container">
        <span className="eyebrow"><span className="dot" /> The Prize</span>
        <h2>The largest hackathon prize pool...ever <span className="accent"></span></h2>
        <p className="lead" style={{ marginBottom: 32, maxWidth: "62ch" }}>
          Four things count, equally weighted: profit, opportunity, AI-native operations, category impact.
        </p>

        <div style={{
          marginTop: 32, padding: 48, borderRadius: 18,
          background: "linear-gradient(135deg, rgba(27,191,224,0.08), rgba(27,191,224,0.18))",
          border: "1px solid var(--cyan)",
          display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32, alignItems: "end"
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 16 }}>
              ▢ TOTAL PRIZE POOL
            </div>
            <div style={{ fontSize: "clamp(80px, 14vw, 180px)", fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 0.9 }}>
              $2M
            </div>
          </div>
          <div style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.5, maxWidth: 420 }}>
            Top 5 finalists pitch live at the Moonshot Summit on September 25 in Los Angeles. The winning team takes <strong style={{ color: "var(--cyan)" }}>$1,000,000</strong> — and proves that the next billion companies will be written, not coded.
          </div>
        </div>

        {/* Prize breakdown */}
        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{ border: "1px solid var(--border-dark)", borderRadius: 14, padding: 32 }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 12 }}>
              Grand Prize Pool · $1,700,000
            </div>
            <div>
              {grand.map(([k, v]) =>
              <div key={k} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "16px 0", borderBottom: "1px solid var(--border-dark)"
              }}>
                  <span style={{ fontSize: 17 }}>{k}</span>
                  <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>{v}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ border: "1px solid var(--border-dark)", borderRadius: 14, padding: 32 }}>
            <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--cyan)", textTransform: "uppercase", marginBottom: 12 }}>
              Category Prizes · $300,000
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
              Highest-grossing team in each category · $60,000 each
            </div>
            <div>
              {cats.map((c) =>
              <div key={c} style={{
                display: "flex", justifyContent: "space-between", alignItems: "baseline",
                padding: "12px 0", borderBottom: "1px solid var(--border-dark)",
                fontSize: 15
              }}>
                  <span>{c}</span>
                  <span style={{ fontFamily: "var(--font-pixel)", color: "var(--cyan)" }}>$60,000</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.6)",
          fontFamily: "var(--font-pixel)", textTransform: "uppercase", letterSpacing: "0.02em"
        }}>
          Each project is eligible for a maximum of one prize.
        </div>

        {/* Schedule */}
        <h3 style={{ marginTop: 64, marginBottom: 24, fontSize: 24 }}>Schedule</h3>
        <div style={{ borderTop: "1px solid var(--border-dark)" }}>
          {schedule.map(([k, v, sub]) =>
          <div key={k} style={{
            display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 24,
            padding: "20px 0", borderBottom: "1px solid var(--border-dark)",
            alignItems: "baseline"
          }}>
              <div style={{ fontFamily: "var(--font-pixel)", fontSize: 16, color: "var(--mid-gray)", textTransform: "uppercase" }}>{k}</div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "var(--tracking-tight)" }}>{v}</div>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>{sub}</div>
            </div>
          )}
        </div>
      </div>
    </section>);

}

/* ─────────── FAQ ─────────── */
function Faq() {
  // Grouped FAQ. Each group: { title, items: [[q, a], ...] }
  const groups = [
  {
    title: "Who can compete",
    items: [
    ["Who is eligible to enter?", "The Hackathon is open to: individuals who are at least the age of majority where they reside as of the time of entry; teams made up of those eligible individuals; and small organizations under 25 employees (corporations, nonprofits, LLCs, partnerships) that exist and have been organized or incorporated at the time of entry."],
    ["Who is not eligible?", "Individuals who are residents of, or organizations domiciled in, a country, state, province, or territory where U.S. or local law prohibits participating or receiving a prize. This includes Russia, Crimea, Cuba, Iran, North Korea, and any other country designated by the U.S. Treasury's Office of Foreign Assets Control. Organizations with 25 or more employees are not eligible."],
    ["Can I enter on a team and as an individual?", "Yes. An eligible individual may join more than one team or organization, and an individual who is part of a team or organization may also enter on an individual basis."],
    ["If I'm representing a team or company, what do I need to do?", "If a team or organization is entering, they must appoint and authorize one individual — the Representative — to represent, act, and submit on their behalf. By entering on behalf of a team or organization you represent and warrant that you are the Representative authorized to act for them."],
    ["Can I submit more than one project?", "Yes. An entrant or specific individual may submit more than one entry — but each submission must be unique and substantially different from the others, as determined by the Sponsor and Devpost in their sole discretion."]]

  },
  {
    title: "What you're building",
    items: [
    ["What exactly are we supposed to build?", "A profitable business whose operations are written in plain English and executed by AI agents. Write how your business works in plain English documents. Use AI to build an agent that reads and follows those documents. The agent runs your operations based on what you wrote. Change the English, change how the business works."],
    ["Why this format? Isn't \"use AI\" already obvious in 2026?", "Every XPRIZE rewards a specific, verifiable technical feat. \"Use AI\" is table stakes now. The hurdle here is different: a company's operational logic must live in readable English that AI agents execute in real time. Pricing, customer support, hiring — all in plain documents anyone can read. That's what makes this an XPRIZE."],
    ["What's a \"playbook\"?", "A playbook is one of the plain-English documents that describes how a piece of your business runs. Your refund policy, your outbound email cadence, your hiring rubric, your pricing logic — each one a playbook. Your AI agent reads them and acts on them. Litmus test: if a non-technical person can read the document and understand what your business will do — and if changing the document changes the behavior — it's a playbook."]]

  },
  {
    title: "The five categories",
    items: [
    ["What can my business be about?", "Five categories spanning economic opportunity and professional access: Education & Human Potential (workforce upskilling, alternative credentialing, personalized learning); Entrepreneurship & Job Creation (solo founder enablement, AI-assisted company creation, job matching); Small Business Services (AI-native operations, cashflow, customer acquisition, compliance); Money & Financial Access (credit access, remittances, micro-lending, financial literacy); Professional Services Access (legal tools, immigration navigation, mental health support)."],
    ["Do I have to pick one category?", "Yes — your submission should map clearly to one of the five. If your project arguably fits more than one, choose the category that best represents the primary value your business creates."],
    ["Is there required tooling or hosting?", "Yes — every project must have at least one function or agent hosted on Google Cloud Platform. Every registered team gets ~15 weeks of Gemini Ultra access free for the build window, plus the option to request $100 in Google Cloud credits via a sign-up form. Use of credits beyond $100 is at the team's expense."],
    ["How many playbooks does my project need?", "At least 5 of these 12: Sales · Onboarding · Support · Pricing · Delivery · HR · Ops/Logistics · Finance · Marketing · Analytics · Compliance · Partnerships. Each one is one plain-English document running one part of the business. Minimum five — pick the ones that match how your business actually works."]]

  },
  {
    title: "What to submit",
    items: [
    ["What goes in a submission?", "GitHub repo (public or private) containing your code, a /playbooks folder, and your agent configuration. A manifest file listing each playbook, the operational category it covers, and one sentence describing what breaks if it's deleted. A 3-minute video showing one live playbook change and the resulting behavior change in production. A 500–1,000 word written narrative on how the team uses playbooks day to day, what humans do versus agents, and the story of building this way. Revenue and profit evidence (Stripe export, bank statement, or simple P&L; corporate ID if available). And marketing/customer acquisition spend disclosed as a separate line item, even if zero."],
    ["What's optional but worth including?", "Additional product evidence — agent execution logs, API usage records, dashboard screenshots — anything strengthening the case that your playbooks are running in production continuously. Customer evidence — contact info of real customers (name, email, phone) and any testimonials or feedback they've provided."],
    ["What questions will the submission form ask?", "Targeted questions about what you built, how it creates value, what role humans play, and how your playbooks evolved during the competition. Your responses feed into both automated screening and human review."],
    ["Are there technical requirements my project has to meet?", "The project must be newly created by the entrant. It must install successfully and function as depicted in the video and described in writing. It must run on the platform specified in the Submission Requirements. The entrant must make the project available free of charge and without restriction. All submission materials must be in English."]]

  },
  {
    title: "Judging & criteria",
    items: [
    ["How does judging work?", "Two stages. Stage One — Pass/fail viability check: Devpost confirms the project fits the theme and reasonably applies the required APIs/SDKs. Stage Two — Official judging: a panel rates the surviving submissions from 1 to 5 stars on each criterion."],
    ["What are the judging criteria?", "Four criteria, equally weighted: Profitability — real business, real customers, sustainable margins. Opportunities Created — jobs and economic opportunities the business creates beyond the founding team. AI-Native Operations — AI agents genuinely running operations, with playbooks live in production. Category Impact — does the project meaningfully move the needle in its chosen category."],
    ["Who are the judges?", "Judging combines expert panels, peer review, and AI-driven analysis. Full panel announced at launch."],
    ["What are the prizes?", "$2M total prize pool. Grand prize pool of $1,700,000 — 1st: $1M, 2nd: $500K, 3rd: $200K. Plus $300,000 in category prizes ($60K to the highest-scoring team in each of five categories). Each project is eligible for one prize."]]

  },
  {
    title: "Integrity & verification",
    items: [
    ["Will my submission be verified?", "Yes. The Administrator and Sponsor reserve the right to verify any submission and disqualify entries that don't meet requirements. Verification requests sent via email must be responded to within 2 business days. Verification may include a live call to demonstrate your project and answer questions about your build and your business, plus additional financial documentation such as revenue records, expense statements, or proof of customer relationships."],
    ["What are the anti-gaming checks?", "Three things we look at carefully: review of customer concentration to confirm revenue is broadly distributed; disclosure of any related-party transactions; and disclosure of any pre-existing audiences used. Profitability is one of four equally-weighted ranking factors — these checks make sure the revenue you're reporting reflects a real business, not a friend buying $50,000 of credits and not your existing newsletter quietly carrying the launch."]]

  },
  {
    title: "Logistics",
    items: [
    ["When does the hackathon run?", "Launch May 19, 2026 at Google I/O. ~15-week build window (May 19 to September 1). Live finals at the Moonshot Summit on September 25, 2026 in Los Angeles."],
    ["What language do submissions need to be in?", "All submission materials must be in English."],
    ["Does my project need to be free?", "Yes — entrants must make the submitted project available free of charge and without restriction for judges and reviewers. This doesn't mean your business can't charge customers — in fact, it must, because profitability is one of the four equally-weighted ranking factors."],
    ["I still have questions. Who do I ask?", "A dedicated support channel will be published at launch."]]

  }];


  // Flatten with group headers as virtual items
  const flat = [];
  groups.forEach((g) => {
    flat.push({ kind: "header", title: g.title });
    g.items.forEach(([q, a]) => flat.push({ kind: "item", q, a }));
  });

  const [open, setOpen] = useState(null);
  let qIndex = 0;

  return (
    <section id="faq" className="light" data-screen-label="10 FAQ">
      <div className="container">
        <span className="eyebrow" style={{ color: "var(--near-black)" }}>
          <span className="dot" style={{ background: "var(--near-black)" }} /> FAQ
        </span>
        <h2 style={{ color: "var(--near-black)" }}>Questions, briefly.</h2>
        <p className="lead" style={{ color: "var(--dark-gray)", marginTop: 16, maxWidth: "60ch" }}>
          Build a profitable business whose operations live in plain English and run on AI agents.
        </p>

        <div style={{ marginTop: 48 }}>
          {flat.map((row, i) => {
            if (row.kind === "header") {
              return (
                <div key={"h-" + i} style={{
                  marginTop: i === 0 ? 0 : 48, marginBottom: 4,
                  paddingBottom: 12, borderBottom: "1px solid var(--border)"
                }}>
                  <span style={{
                    fontFamily: "var(--font-pixel)", fontSize: 16,
                    color: "var(--cyan)", textTransform: "uppercase",
                    letterSpacing: "0.04em"
                  }}>
                    ▢ {row.title}
                  </span>
                </div>);

            }
            const myKey = "q-" + i;
            const isOpen = open === myKey;
            qIndex += 1;
            const num = String(qIndex).padStart(2, "0");
            return (
              <div key={myKey} style={{ borderBottom: "1px solid var(--border)" }}>
                <button onClick={() => setOpen(isOpen ? null : myKey)} style={{
                  width: "100%", textAlign: "left", background: "transparent",
                  border: "none", cursor: "pointer", padding: "20px 0",
                  display: "grid", gridTemplateColumns: "56px 1fr 40px",
                  gap: 16, alignItems: "center", color: "var(--near-black)",
                  fontFamily: "var(--font-sans)", letterSpacing: "var(--tracking-tight)"
                }}>
                  <span style={{ fontFamily: "var(--font-pixel)", fontSize: 14, color: "var(--mid-gray)", textTransform: "uppercase" }}>{num}</span>
                  <span style={{ fontSize: "clamp(17px, 1.6vw, 21px)", fontWeight: 600, lineHeight: 1.3 }}>{row.q}</span>
                  <span style={{ fontSize: 22, color: "var(--cyan)", textAlign: "right", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform .25s ease" }}>+</span>
                </button>
                <div style={{
                  display: "grid", gridTemplateColumns: "56px 1fr 40px", gap: 16,
                  maxHeight: isOpen ? 600 : 0, overflow: "hidden",
                  transition: "max-height .4s ease, padding .25s ease",
                  paddingBottom: isOpen ? 24 : 0
                }}>
                  <span />
                  <span style={{ fontSize: 16, color: "var(--dark-gray)", lineHeight: 1.6, maxWidth: 760 }}>{row.a}</span>
                  <span />
                </div>
              </div>);

          })}
        </div>
      </div>
    </section>);

}

/* ─────────── CTA ─────────── */
function CTA() {
  return (
    <section id="register" data-screen-label="11 Register" style={{
      background: "var(--near-black)", position: "relative", overflow: "hidden",
      padding: "140px 0"
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: `
          radial-gradient(circle at 20% 30%, rgba(27,191,224,0.18), transparent 45%),
          radial-gradient(circle at 80% 70%, rgba(27,191,224,0.10), transparent 50%)
        `
      }} />
      <div className="container" style={{ position: "relative" }}>
        <h2 className="display-xl" style={{ maxWidth: "20ch", marginBottom: 32, fontSize: "clamp(40px, 9vw, 80px)" }}>
          The barrier to creating real impact <span className="accent" style={{ fontSize: "clamp(40px, 9vw, 80px)" }}>has collapsed.</span>
        </h2>
        <p style={{ fontSize: 24, color: "rgba(255,255,255,0.85)", maxWidth: "50ch", lineHeight: 1.4, marginBottom: 40, fontWeight: 500 }}>
          Show us.
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a className="btn btn-primary" href="https://xprize.devpost.com/" target="_blank" rel="noopener">Register on Devpost →</a>
          <a className="btn btn-ghost" href="#prize">See the prize</a>
        </div>
      </div>
    </section>);

}

/* ─────────── FOOTER ─────────── */
function Footer() {
  return (
    <footer style={{
      background: "var(--black)", color: "rgba(255,255,255,0.55)",
      padding: "48px 0", fontFamily: "var(--font-pixel)",
      fontSize: 18, textTransform: "uppercase",
      borderTop: "1px solid var(--border-dark)"
    }}>
      <div className="container" style={{
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16
      }}>
        <span><Glyph size={16} color="var(--cyan)" /> &nbsp; Gemini Moonshot XPRIZE · Presented by XPRIZE × Google</span>
        <span>v.1 · Apr 2026</span>
      </div>
    </footer>);

}

Object.assign(window, {
  Nav, Hero, Demo, AboutXPRIZE, Moonshot, Categories, GoogleStack, Prize, Faq, CTA, Footer
});