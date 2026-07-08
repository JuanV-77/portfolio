import React, { useEffect, useRef, useState } from 'react'
import { useSceneLoop } from './scenes.js'
import { SECTIONS, NAV_LABELS, JOBS, PROJECT_BLOCKS, SKILLS, CERTS, INTERESTS, ALBUMS } from './data.js'

// ------------------------------------------------------------------
// Hooks & small components
// ------------------------------------------------------------------
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) { setOn(true); return }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setOn(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, on]
}

function Reveal({ children, delay = 0, style, ...rest }) {
  const [ref, on] = useInView()
  return (
    <div ref={ref} className={'reveal' + (on ? ' on' : '')} style={{ transitionDelay: delay + 'ms', ...style }} {...rest}>
      {children}
    </div>
  )
}

function Count({ to, run = true, dur = 1300 }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!run) return
    let raf
    const start = performance.now()
    const ease = x => 1 - Math.pow(1 - x, 3)
    const tick = n => {
      const p = Math.min(1, (n - start) / dur)
      if (ref.current) ref.current.textContent = Math.round(to * ease(p)).toLocaleString('en-US')
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, run, dur])
  return <span ref={ref}>0</span>
}

// ------------------------------------------------------------------
// Starfield (fixed background) — stars fade in as you climb out of the
// sunset; rockets and a satellite pass by once you reach space.
// ------------------------------------------------------------------
function Starfield() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    let w, h, stars = [], t = 0, raf, shoot = null, sat = null, rocket = null, depth = 0
    const onScroll = () => { depth = Math.min(1, window.scrollY / (window.innerHeight * 1.1)) }
    const makeStars = () => {
      const count = Math.floor(w * h / 8500)
      stars = []
      for (let i = 0; i < count; i++) stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + 0.2, ph: Math.random() * Math.PI * 2, sp: Math.random() * 0.02 + 0.004, warm: Math.random() < 0.16 })
    }
    const resize = () => { w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * DPR; canvas.height = h * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); makeStars() }

    const drawSatellite = () => {
      if (!sat) {
        if (depth > 0.4 && t % 1500 === 0) sat = { x: -40, y: h * (0.08 + Math.random() * 0.4), v: 0.35 }
        return
      }
      sat.x += sat.v
      ctx.save(); ctx.translate(sat.x, sat.y); ctx.rotate(-0.12); ctx.globalAlpha = Math.min(1, depth * 1.5)
      ctx.fillStyle = 'rgba(190,200,220,0.85)'; ctx.fillRect(-6, -4, 12, 8)
      ctx.fillStyle = 'rgba(111,211,232,0.55)'
      ctx.fillRect(-24, -3, 14, 6); ctx.fillRect(10, -3, 14, 6)
      ctx.strokeStyle = 'rgba(7,10,20,0.6)'; ctx.lineWidth = 1
      ctx.strokeRect(-24, -3, 14, 6); ctx.strokeRect(10, -3, 14, 6)
      ctx.beginPath(); ctx.moveTo(-17, -3); ctx.lineTo(-17, 3); ctx.moveTo(17, -3); ctx.lineTo(17, 3); ctx.stroke()
      if (Math.sin(t * 0.2) > 0.5) { ctx.fillStyle = '#c05a68'; ctx.beginPath(); ctx.arc(0, -6, 1.5, 0, 7); ctx.fill() }
      ctx.restore()
      if (sat.x > w + 40) sat = null
    }

    const drawRocket = () => {
      if (!rocket) {
        if (depth > 0.5 && t % 1100 === 0) rocket = { p: 0, x0: -30, y0: h * (0.7 + Math.random() * 0.25), x1: w + 60, y1: h * (0.05 + Math.random() * 0.2), trail: [] }
        return
      }
      rocket.p += 0.0038
      const q = rocket.p
      const x = rocket.x0 + (rocket.x1 - rocket.x0) * q
      const y = rocket.y0 + (rocket.y1 - rocket.y0) * q - Math.sin(q * Math.PI) * 40
      rocket.trail.push({ x, y }); if (rocket.trail.length > 26) rocket.trail.shift()
      ctx.save(); ctx.globalAlpha = Math.min(1, depth * 1.5)
      rocket.trail.forEach((pt, i) => {
        const a = i / rocket.trail.length * 0.35
        ctx.fillStyle = 'rgba(224,168,92,' + a + ')'; ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.4, 0, 7); ctx.fill()
      })
      const ang = Math.atan2((rocket.y1 - rocket.y0) - Math.cos(q * Math.PI) * Math.PI * 40, rocket.x1 - rocket.x0)
      ctx.translate(x, y); ctx.rotate(ang)
      const fl = 6 + Math.random() * 5
      ctx.fillStyle = 'rgba(224,168,92,0.9)'
      ctx.beginPath(); ctx.moveTo(-9, -2.5); ctx.lineTo(-9 - fl, 0); ctx.lineTo(-9, 2.5); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(230,236,248,0.95)'
      ctx.beginPath(); ctx.moveTo(-9, -3.5); ctx.lineTo(5, -3.5); ctx.quadraticCurveTo(12, 0, 5, 3.5); ctx.lineTo(-9, 3.5); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(200,90,106,0.95)'
      ctx.beginPath(); ctx.moveTo(-9, -3.5); ctx.lineTo(-13, -7); ctx.lineTo(-6, -3.5); ctx.closePath(); ctx.fill()
      ctx.beginPath(); ctx.moveTo(-9, 3.5); ctx.lineTo(-13, 7); ctx.lineTo(-6, 3.5); ctx.closePath(); ctx.fill()
      ctx.fillStyle = 'rgba(111,211,232,0.95)'; ctx.beginPath(); ctx.arc(1, 0, 1.8, 0, 7); ctx.fill()
      ctx.restore()
      if (rocket.p >= 1) rocket = null
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h); t += 1
      const starGlobal = 0.12 + 0.88 * depth
      for (const s of stars) {
        const a = (0.35 + 0.65 * Math.abs(Math.sin(s.ph + t * s.sp))) * starGlobal
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = s.warm ? 'rgba(224,168,92,' + a + ')' : 'rgba(220,228,244,' + a + ')'
        ctx.fill()
      }
      if (!shoot && depth > 0.5 && t % 420 === 0) shoot = { x: Math.random() * w * 0.6, y: Math.random() * h * 0.35, p: 0 }
      if (shoot) {
        shoot.p += 0.025
        const sx = shoot.x + shoot.p * w * 0.35, sy = shoot.y + shoot.p * h * 0.22
        const g = ctx.createLinearGradient(sx - 60, sy - 34, sx, sy)
        g.addColorStop(0, 'rgba(220,228,244,0)'); g.addColorStop(1, 'rgba(220,228,244,0.85)')
        ctx.strokeStyle = g; ctx.lineWidth = 1.6
        ctx.beginPath(); ctx.moveTo(sx - 60, sy - 34); ctx.lineTo(sx, sy); ctx.stroke()
        if (shoot.p >= 1) shoot = null
      }
      drawSatellite()
      drawRocket()
      raf = requestAnimationFrame(draw)
    }
    resize(); onScroll(); draw()
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('scroll', onScroll) }
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 0, pointerEvents: 'none' }} />
}

// ------------------------------------------------------------------
// Section kicker with altitude marker — the page is an ascent
// ------------------------------------------------------------------
function Kicker({ children, alt, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 30 }}>
      <div className="kicker" style={{ marginBottom: 0, ...(color ? { color } : {}) }}>{children}</div>
      {alt && <div className="mono alt-tag">{alt}</div>}
    </div>
  )
}

// ------------------------------------------------------------------
// Scroll progress bar
// ------------------------------------------------------------------
function ScrollProgress() {
  const ref = useRef(null)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (ref.current) ref.current.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%'
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [])
  return <div ref={ref} className="scroll-progress" style={{ width: 0 }} />
}

// ------------------------------------------------------------------
// Nav with scroll-spy
// ------------------------------------------------------------------
function Nav() {
  const [active, setActive] = useState('hero')
  useEffect(() => {
    const ratios = {}
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { ratios[e.target.id] = e.intersectionRatio })
      let best = null, br = 0
      for (const id of SECTIONS) { const r = ratios[id] || 0; if (r > br) { br = r; best = id } }
      if (best) setActive(best)
    }, { threshold: [0, 0.15, 0.3, 0.5, 0.7, 0.9], rootMargin: '-15% 0px -55% 0px' })
    SECTIONS.forEach(id => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '18px 6vw', pointerEvents: 'none' }}>
      <div className="nav-pill">
        {SECTIONS.map(id => (
          <a key={id} href={'#' + id} className={'nav-link' + (active === id ? ' active' : '')}>{NAV_LABELS[id]}</a>
        ))}
      </div>
    </nav>
  )
}

// ------------------------------------------------------------------
// Hero
// ------------------------------------------------------------------
function Hero() {
  const farRef = useRef(null), nearRef = useRef(null)
  useEffect(() => {
    let mx = 0
    const apply = () => {
      const y = window.scrollY
      if (farRef.current) farRef.current.style.transform = 'translate(' + (mx * 10) + 'px,' + (y * 0.12) + 'px)'
      if (nearRef.current) nearRef.current.style.transform = 'translate(' + (mx * 20) + 'px,' + (y * 0.22) + 'px)'
    }
    const onScroll = () => apply()
    const onMouse = e => { mx = e.clientX / window.innerWidth - 0.5; apply() }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMouse, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMouse) }
  }, [])
  return (
    <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
      {/* Sunset sky — the journey starts at golden hour and climbs into space */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'linear-gradient(180deg, #0a0c20 0%, #1c1838 26%, #3b2350 44%, #6e3a52 57%, #b06048 66%, #d99a5e 73%, #52304a 84%, #12101f 93%, #070A14 100%)' }} />
      <div className="sun-disk" style={{ position: 'absolute', right: '8%', bottom: '26vh', width: 110, height: 110, borderRadius: '50%', zIndex: 1, pointerEvents: 'none', background: 'radial-gradient(circle, #ffe0ae 0%, #f2ab60 42%, rgba(242,171,96,0.35) 62%, transparent 72%)' }} />
      <div style={{ position: 'absolute', left: '50%', bottom: '12%', transform: 'translateX(-50%)', width: '140%', height: '55vh', background: 'radial-gradient(ellipse at 50% 100%, rgba(224,168,92,0.28), rgba(224,168,92,0.06) 40%, transparent 68%)', zIndex: 1, pointerEvents: 'none' }} />
      <div ref={farRef} style={{ position: 'absolute', left: '-4%', right: '-4%', bottom: 0, height: '46vh', background: 'linear-gradient(180deg,#141C33,#0E1526)', clipPath: 'polygon(0 62%, 9% 40%, 18% 55%, 27% 30%, 38% 52%, 48% 26%, 58% 50%, 68% 34%, 79% 56%, 88% 42%, 100% 60%, 100% 100%, 0 100%)', zIndex: 2, pointerEvents: 'none', opacity: 0.85, willChange: 'transform' }} />
      <div ref={nearRef} style={{ position: 'absolute', left: '-4%', right: '-4%', bottom: 0, height: '34vh', background: 'linear-gradient(180deg,#0B1120,#070A14)', clipPath: 'polygon(0 70%, 12% 44%, 22% 64%, 33% 38%, 45% 62%, 55% 40%, 66% 66%, 77% 46%, 87% 68%, 100% 50%, 100% 100%, 0 100%)', zIndex: 3, pointerEvents: 'none', willChange: 'transform' }} />
      <div style={{ position: 'relative', zIndex: 4, maxWidth: 1120, width: '100%', margin: '0 auto', padding: '0 6vw' }}>
        <div className="mono" style={{ fontSize: 13, letterSpacing: '.28em', textTransform: 'uppercase', color: '#6FD3E8', marginBottom: 26, animation: 'riseIn .8s ease both' }}>Data Engineer · Wichita, KS</div>
        <h1 style={{ margin: 0, fontWeight: 900, fontStretch: '118%', letterSpacing: '-0.02em', lineHeight: 0.9, fontSize: 'clamp(52px, 12vw, 172px)', animation: 'riseIn .9s ease .05s both' }}>JUAN<br />VAZQUEZ</h1>
        <p style={{ maxWidth: 640, margin: '34px 0 0', fontSize: 'clamp(17px, 2.2vw, 22px)', lineHeight: 1.5, color: '#B9C1D6', fontWeight: 400, animation: 'riseIn 1s ease .15s both' }}>
          I build serverless data pipelines and multi-agent AI systems in production. Off the clock I'm chasing mountain lakes, casting lines, and running the Ye discography back.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 40, animation: 'riseIn 1.1s ease .25s both' }}>
          <a href="#contact" className="btn btn-solid">Get in touch</a>
          <a href="#work" className="btn btn-ghost">See the work</a>
        </div>
        <div className="mono" style={{ marginTop: 34, fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8A93A8', animation: 'riseIn 1.2s ease .35s both' }}>
          <span className="status-dot" />all pipelines nominal · 4 orgs shipped · currently at Koch
        </div>
      </div>
      <div className="mono" style={{ position: 'absolute', left: '50%', bottom: 26, transform: 'translateX(-50%)', zIndex: 4, fontSize: 11, letterSpacing: '.3em', color: '#8a8298', textTransform: 'uppercase', animation: 'floatCue 2.4s ease-in-out infinite', whiteSpace: 'nowrap' }}>begin ascent ↓</div>
    </section>
  )
}

// ------------------------------------------------------------------
// About
// ------------------------------------------------------------------
function About() {
  const [ref, on] = useInView()
  const stats = [
    { to: 4, suf: '', label: 'Eng internships' },
    { to: 99, suf: '%', label: 'Efficiency gain, RPA' },
    { to: 13, suf: 'mo', label: 'Historical data recovered' },
    { to: 4, suf: '×', label: 'Certs (AWS · CompTIA)' },
  ]
  return (
    <section id="about" ref={ref} className={'section reveal' + (on ? ' on' : '')} style={{ padding: 'clamp(90px,12vh,150px) 6vw' }}>
      <Kicker alt="ELEV 1,299 FT — WICHITA, KS">01 — About</Kicker>
      <p style={{ margin: 0, fontSize: 'clamp(24px, 3.6vw, 40px)', lineHeight: 1.32, fontWeight: 500, letterSpacing: '-0.01em', maxWidth: 940, textWrap: 'pretty' }}>
        A <span style={{ color: '#6FD3E8' }}>Data Engineer</span> and MIS &amp; Economics student at Wichita State, shipping production systems across serverless AWS, Snowflake, and LLM-based agents. I like problems where the data is messy, the stakes are real, and the fix has to actually scale.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px,1fr))', gap: 14, marginTop: 56 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'linear-gradient(180deg,#101830,#0A0E1A)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '26px 24px' }}>
            <div className="mono" style={{ fontSize: 34, fontWeight: 700, color: '#E0A85C' }}><Count to={s.to} run={on} />{s.suf}</div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8A93A8', marginTop: 8 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------------
// Work — jobs with tabbed live scenes + per-tab stats
// ------------------------------------------------------------------
function JobBlock({ job }) {
  const [ref, on] = useInView()
  const [tab, setTab] = useState(0)
  const cur = job.tabs[tab]
  return (
    <div ref={ref} className={'reveal' + (on ? ' on' : '')} style={{ padding: '44px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'baseline', marginBottom: 14 }}>
        <div className="mono" style={{ fontSize: 12, letterSpacing: '.1em', color: '#6FD3E8' }}>{job.dates} · <span style={{ color: '#8A93A8' }}>{job.org}</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.stack.map(s => <span key={s} className="chip">{s}</span>)}
        </div>
      </div>
      <h3 style={{ margin: '0 0 22px', fontSize: 'clamp(26px,4vw,44px)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{job.role}</h3>

      <div className="screen">
        <div style={{ position: 'relative' }}>
          <canvas data-scene={cur.scene} className="scene" style={{ height: 300 }} />
          <div className="corner" style={{ top: 10, left: 10, borderTop: '2px solid rgba(224,168,92,0.55)', borderLeft: '2px solid rgba(224,168,92,0.55)' }} />
          <div className="corner" style={{ top: 10, right: 10, borderTop: '2px solid rgba(224,168,92,0.55)', borderRight: '2px solid rgba(224,168,92,0.55)' }} />
          <div className="corner" style={{ bottom: 10, left: 10, borderBottom: '2px solid rgba(224,168,92,0.55)', borderLeft: '2px solid rgba(224,168,92,0.55)' }} />
          <div className="corner" style={{ bottom: 10, right: 10, borderBottom: '2px solid rgba(224,168,92,0.55)', borderRight: '2px solid rgba(224,168,92,0.55)' }} />
        </div>
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {job.tabs.map((tb, k) => (
            <button key={tb.scene} className={'tab-btn' + (k === tab ? ' active' : '')} onClick={() => setTab(k)}>{tb.label}</button>
          ))}
        </div>
        <div key={'cap' + tab} className="mono swap" style={{ padding: '10px 16px', fontSize: 11, letterSpacing: '.08em', color: '#7d879e', borderTop: '1px solid rgba(255,255,255,0.06)', minHeight: 38 }}>▸ {cur.caption}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(160px,260px) 1fr', gap: 30, marginTop: 30, alignItems: 'center' }}>
        <div key={'stat' + tab} className="swap">
          <div className="mono" style={{ fontWeight: 700, color: '#E0A85C', fontSize: 'clamp(40px,6.5vw,64px)', lineHeight: 0.9, letterSpacing: '-0.02em' }}>
            {cur.pre}<Count to={cur.num} run={on} />{cur.suf}
          </div>
          <div className="mono" style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: '#8A93A8', marginTop: 10 }}>{cur.numLabel}</div>
        </div>
        <p key={'det' + tab} className="swap" style={{ margin: 0, fontSize: 'clamp(16px,2.1vw,20px)', lineHeight: 1.5, color: '#D2D8E6', fontWeight: 500, textWrap: 'pretty' }}>{cur.detail}</p>
      </div>
    </div>
  )
}

function Work() {
  return (
    <section id="work" className="section">
      <Kicker alt="ALT 12 KM — CRUISING">02 — Experience</Kicker>
      <h2 style={{ margin: '0 0 8px', fontWeight: 900, fontStretch: '112%', letterSpacing: '-0.02em', fontSize: 'clamp(34px,6vw,68px)', lineHeight: 0.95 }}>The work, running</h2>
      <p className="mono" style={{ margin: '0 0 20px', fontSize: 15, color: '#8A93A8' }}>Every project in every role, playing back live. Switch channels below each screen — the numbers follow.</p>
      {JOBS.map(job => <JobBlock key={job.id} job={job} />)}
    </section>
  )
}

// ------------------------------------------------------------------
// Projects & Research — same live-screen treatment as the jobs
// ------------------------------------------------------------------
function Projects() {
  return (
    <section id="projects" className="section">
      <Kicker alt="ALT 100 KM — KÁRMÁN LINE">03 — Projects &amp; Research</Kicker>
      <h2 style={{ margin: '0 0 8px', fontWeight: 900, fontStretch: '112%', letterSpacing: '-0.02em', fontSize: 'clamp(34px,6vw,68px)', lineHeight: 0.95 }}>Built on my own clock</h2>
      <p className="mono" style={{ margin: '0 0 20px', fontSize: 15, color: '#8A93A8' }}>Two production-style builds and two research papers — same screens, same rules: switch channels, the numbers follow.</p>
      {PROJECT_BLOCKS.map(block => <JobBlock key={block.id} job={block} />)}
    </section>
  )
}

// ------------------------------------------------------------------
// Skills
// ------------------------------------------------------------------
function Skills() {
  const [ref, on] = useInView()
  return (
    <section id="skills" ref={ref} className={'section reveal' + (on ? ' on' : '')}>
      <Kicker alt="ALT 400 KM — LOW EARTH ORBIT">04 — Toolbox</Kicker>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 40 }}>
        {SKILLS.map(grp => (
          <div key={grp.label}>
            <h4 className="mono" style={{ margin: '0 0 16px', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8A93A8', fontWeight: 500 }}>{grp.label}</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {grp.items.map(it => <span key={it} className="skill-pill">{it}</span>)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 48, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <span className="mono" style={{ fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: '#8A93A8', marginRight: 6 }}>Certs:</span>
        {CERTS.map(c => (
          <span key={c} className="mono" style={{ fontSize: 12, color: '#C4CCDE', border: '1px solid rgba(224,168,92,0.35)', padding: '6px 14px', borderRadius: 999 }}>{c}</span>
        ))}
      </div>
    </section>
  )
}

// ------------------------------------------------------------------
// Personal — interests, albums, then the Ye thesis
// ------------------------------------------------------------------
function Personal() {
  const [ref, on] = useInView()
  return (
    <section id="personal" ref={ref} className={'reveal' + (on ? ' on' : '')} style={{ position: 'relative', zIndex: 4, marginTop: 40, padding: 'clamp(90px,12vh,150px) 0', background: 'linear-gradient(180deg, transparent, rgba(224,168,92,0.05) 30%, rgba(111,211,232,0.05) 70%, transparent)', scrollMarginTop: 40 }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 6vw' }}>
        <Kicker color="#6FD3E8" alt="ALT 36,000 KM — GEOSTATIONARY">05 — Off the clock</Kicker>
        <h2 style={{ margin: '0 0 20px', fontWeight: 900, fontStretch: '112%', letterSpacing: '-0.02em', fontSize: 'clamp(38px,8vw,96px)', lineHeight: 0.9 }}>The human<br />behind the<br /><span style={{ color: '#E0A85C' }}>pipelines</span></h2>
        <p style={{ maxWidth: 620, margin: '0 0 56px', fontSize: 18, lineHeight: 1.55, color: '#B9C1D6' }}>When I'm not orchestrating Lambdas, I'm probably outside — or arguing that 808s is underrated.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))', gap: 18 }}>
          {INTERESTS.map((it, i) => (
            <Reveal key={it.title} delay={i * 80}>
              <div className="card" style={{ background: 'linear-gradient(180deg,#0E1730,#080B14)', height: '100%' }}>
                <canvas data-scene={it.scene} className="scene" style={{ height: 180 }} />
                <div style={{ padding: '24px 26px 28px' }}>
                  <div className="mono" style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#6FD3E8' }}>{it.tag}</div>
                  <h3 style={{ margin: '10px 0 8px', fontSize: 23, fontWeight: 800 }}>{it.title}</h3>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, color: '#9FA8BE' }}>{it.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Ye gallery */}
        <div style={{ marginTop: 56 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
            <h3 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>The discography, decoded</h3>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#8A93A8' }}>on rotation</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
            {ALBUMS.map((al, i) => (
              <Reveal key={al.title} delay={i * 70}>
                <div className="card card-amber" style={{ background: al.bg, height: '100%' }}>
                  <canvas data-scene={al.scene} className="scene" style={{ height: 150 }} />
                  <div style={{ padding: '20px 20px 24px', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                      <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, lineHeight: 1.1 }}>{al.title}</h4>
                      <span className="mono" style={{ fontSize: 11, color: '#8A93A8', whiteSpace: 'nowrap' }}>{al.year}</span>
                    </div>
                    <p style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.55, color: '#9FA8BE' }}>{al.meaning}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* The Ye thesis — after the records, where it belongs */}
        <Reveal delay={120}>
          <div style={{ marginTop: 42, background: 'linear-gradient(135deg,#141225,#080B14)', border: '1px solid rgba(224,168,92,0.2)', borderRadius: 22, padding: '44px 40px' }}>
            <div className="mono" style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#E0A85C', marginBottom: 20 }}>So why is Ye on my portfolio?</div>
            <p style={{ margin: '0 0 28px', fontSize: 'clamp(21px,2.8vw,30px)', fontWeight: 600, lineHeight: 1.32, letterSpacing: '-0.01em', maxWidth: 840, textWrap: 'pretty' }}>
              I keep Ye here because he stands for unbreakable self-belief, creative courage, and choosing love instead of repeating hate.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 760 }}>
              <blockquote style={{ margin: 0, padding: '4px 0 4px 20px', borderLeft: '2px solid rgba(224,168,92,0.5)', fontSize: 16, lineHeight: 1.6, color: '#D2D8E6', fontStyle: 'italic' }}>
                "I always felt like I could do anything. That's the main thing. People are controlled by thoughts, their perception of themselves. They're slowed down by their perception of themselves."
              </blockquote>
              <blockquote style={{ margin: 0, padding: '4px 0 4px 20px', borderLeft: '2px solid rgba(224,168,92,0.5)', fontSize: 16, lineHeight: 1.6, color: '#D2D8E6', fontStyle: 'italic' }}>
                "No matter how many people tell me, 'Stop believing in yourself!' … I refuse to follow those rules that society has set up."
              </blockquote>
              <blockquote style={{ margin: 0, padding: '4px 0 4px 20px', borderLeft: '2px solid rgba(111,211,232,0.5)', fontSize: 16, lineHeight: 1.6, color: '#D2D8E6', fontStyle: 'italic' }}>
                "So we keep on saying, 'I hate you, I hate you, fuck you, fuck you…' How are we gonna get a different result out of hate? Why don't we just try love?"
              </blockquote>
            </div>
            <p style={{ margin: '28px 0 0', fontSize: 16, lineHeight: 1.65, color: '#B9C1D6', maxWidth: 760 }}>
              His mother, Donda West, captured it perfectly when she told him: <span style={{ color: '#E0A85C', fontWeight: 600 }}>"You can't be a star and not be a star."</span> A reminder to stay grounded while still carrying that giant energy everyone else could see.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------
// The Dispatch — email subscribers for blog / project updates
// ------------------------------------------------------------------
// To wire a real list: create a form on formspree.io (or Buttondown /
// Mailchimp) and paste its POST URL here. Until then, submissions fall
// back to opening the visitor's mail client addressed to Juan.
const SUBSCRIBE_ENDPOINT = ''

function Dispatch() {
  const [ref, on] = useInView()
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | busy | sent | error
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const submit = async e => {
    e.preventDefault()
    if (!valid) { setState('error'); return }
    if (SUBSCRIBE_ENDPOINT) {
      setState('busy')
      try {
        const res = await fetch(SUBSCRIBE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email }),
        })
        setState(res.ok ? 'sent' : 'error')
      } catch { setState('error') }
    } else {
      window.location.href = 'mailto:jdvazqueze3@gmail.com?subject=' +
        encodeURIComponent('Subscribe me to The Dispatch') +
        '&body=' + encodeURIComponent('Add ' + email + ' to the list.')
      setState('sent')
    }
  }

  return (
    <section id="dispatch" ref={ref} className={'section reveal' + (on ? ' on' : '')} style={{ scrollMarginTop: 100 }}>
      <Kicker alt="DEEP SPACE — RELAY STATION">06 — The Dispatch</Kicker>
      <div className="dispatch-box">
        <canvas data-scene="beacon" className="scene" style={{ height: 210 }} />
        <div style={{ padding: 'clamp(28px, 4vw, 44px)', paddingTop: 24 }}>
          <h2 style={{ margin: '0 0 12px', fontWeight: 900, fontStretch: '112%', letterSpacing: '-0.02em', fontSize: 'clamp(28px,5vw,52px)', lineHeight: 0.95 }}>
            Signals from<br />the <span style={{ color: '#E0A85C' }}>pipeline</span>
          </h2>
          <p style={{ maxWidth: 560, margin: '0 0 28px', fontSize: 16, lineHeight: 1.55, color: '#B9C1D6' }}>
            Occasional write-ups on what I'm building — pipeline post-mortems, agent experiments, research updates. No spam, no schedule, just signal when there's something worth transmitting.
          </p>
          {state !== 'sent' ? (
            <form onSubmit={submit} style={{ maxWidth: 560 }}>
              <div className="dispatch-form">
                <span className="dispatch-prompt">$ subscribe --email</span>
                <input
                  className="dispatch-input"
                  type="email"
                  placeholder="you@domain.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); if (state === 'error') setState('idle') }}
                  aria-label="Email address"
                />
                <button className="dispatch-btn" type="submit" disabled={state === 'busy'}>
                  {state === 'busy' ? '···' : 'Transmit'}
                </button>
              </div>
              <div className="mono" style={{ marginTop: 12, fontSize: 11, letterSpacing: '.08em', minHeight: 16, color: state === 'error' ? '#c05a68' : '#5b6480' }}>
                {state === 'error' ? '✗ signal rejected — check that address and retransmit' : '▸ one-click unsubscribe, always'}
              </div>
            </form>
          ) : (
            <div className="dispatch-msg mono" style={{ maxWidth: 560, border: '1px solid rgba(140,224,160,0.4)', borderRadius: 2, padding: '16px 18px', fontSize: 13, letterSpacing: '.06em', color: '#8ce0a0' }}>
              ✓ TRANSMISSION LOCKED — {email} is on the list. First dispatch lands when there's something worth your inbox.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ------------------------------------------------------------------
// Contact
// ------------------------------------------------------------------
function Contact() {
  const [ref, on] = useInView()
  return (
    <section id="contact" ref={ref} className={'section reveal' + (on ? ' on' : '')} style={{ padding: 'clamp(90px,12vh,160px) 6vw clamp(80px,10vh,120px)' }}>
      <Kicker alt="MISSION CONTROL — COME IN">07 — Contact</Kicker>
      <h2 style={{ margin: '0 0 40px', fontWeight: 900, fontStretch: '118%', letterSpacing: '-0.02em', fontSize: 'clamp(40px,10vw,120px)', lineHeight: 0.88 }}>LET'S<br />TALK</h2>
      <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <a href="mailto:jdvazqueze3@gmail.com" className="contact-row">
          <span style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 700 }}>Email</span>
          <span className="mono" style={{ fontSize: 14, color: '#8A93A8' }}>jdvazqueze3@gmail.com</span>
        </a>
        <a href="https://www.linkedin.com/in/juan-vazquez-e" target="_blank" rel="noopener noreferrer" className="contact-row">
          <span style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 700 }}>LinkedIn</span>
          <span className="mono" style={{ fontSize: 14, color: '#8A93A8' }}>/in/juan-vazquez-e</span>
        </a>
      </div>
      <div className="mono" style={{ marginTop: 50, fontSize: 12, color: '#5b6480', letterSpacing: '.1em' }}>© 2026 Juan D. Vazquez · Wichita, KS · MIS &amp; Economics, WSU '26</div>
    </section>
  )
}

// ------------------------------------------------------------------
// App
// ------------------------------------------------------------------
export default function App() {
  useSceneLoop()
  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <Starfield />
      <ScrollProgress />
      <Nav />
      <Hero />
      <About />
      <Work />
      <Projects />
      <Skills />
      <Personal />
      <Dispatch />
      <Contact />
    </div>
  )
}
