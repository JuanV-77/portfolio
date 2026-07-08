// ===================================================================
// Canvas scene engine — one rAF loop paints every <canvas data-scene>
// ===================================================================
import { useEffect } from 'react'

const A = '#E0A85C', C = '#6FD3E8', R = '#c05a68'
const fmt = n => Math.floor(n).toLocaleString('en-US')

// ---------- shared draw helpers ----------
function rr(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath()
}
function mtnRange(ctx, baseY, w, peakH, seed) {
  ctx.beginPath(); ctx.moveTo(0, baseY + 200); ctx.lineTo(0, baseY)
  const seg = w / 6
  for (let i = 0; i <= 6; i++) { const x = i * seg; const y = baseY - peakH * (0.3 + 0.6 * Math.abs(Math.sin(i * 1.7 + seed))); ctx.lineTo(x, y) }
  ctx.lineTo(w, baseY + 200); ctx.closePath(); ctx.fill()
}
function heartPath(ctx, cx, cy, s) {
  ctx.beginPath(); ctx.moveTo(cx, cy + s * 0.7)
  ctx.bezierCurveTo(cx + s * 1.1, cy, cx + s * 0.55, cy - s * 0.9, cx, cy - s * 0.35)
  ctx.bezierCurveTo(cx - s * 0.55, cy - s * 0.9, cx - s * 1.1, cy, cx, cy + s * 0.7)
  ctx.closePath()
}
function llama(ctx, x, y, t, col) {
  const bob = Math.sin(t * 0.18) * 1.2
  ctx.fillStyle = col
  ctx.fillRect(x - 10, y - 15 + bob, 20, 10)
  ctx.fillRect(x + 5, y - 26 + bob, 5, 14)
  ctx.fillRect(x + 3, y - 30 + bob, 9, 6)
  ctx.fillRect(x + 4, y - 34 + bob, 2, 4); ctx.fillRect(x + 9, y - 34 + bob, 2, 4)
  const l1 = Math.max(0, Math.sin(t * 0.18) * 3), l2 = Math.max(0, Math.sin(t * 0.18 + 3.14) * 3)
  ctx.fillRect(x - 8, y - 6, 3, 9 + l1); ctx.fillRect(x + 6, y - 6, 3, 9 + l2)
  ctx.fillRect(x - 3, y - 6, 3, 9 + l2); ctx.fillRect(x + 1, y - 6, 3, 9 + l1)
}
function glyphGear(ctx, x, y, rot, a) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
  ctx.strokeStyle = 'rgba(224,168,92,' + a + ')'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, 7); ctx.stroke()
  for (let i = 0; i < 6; i++) { const g = i / 6 * 6.283; ctx.beginPath(); ctx.moveTo(Math.cos(g) * 3.2, Math.sin(g) * 3.2); ctx.lineTo(Math.cos(g) * 5.4, Math.sin(g) * 5.4); ctx.stroke() }
  ctx.restore()
}
function glyphBrain(ctx, x, y, a) {
  ctx.strokeStyle = 'rgba(111,211,232,' + a + ')'; ctx.lineWidth = 1.3
  ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.quadraticCurveTo(x - 1.5, y - 2.5, x, y); ctx.quadraticCurveTo(x + 1.5, y + 2.5, x + 3, y); ctx.stroke()
}
function glyphEye(ctx, x, y, a) {
  ctx.strokeStyle = 'rgba(237,240,247,' + a + ')'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.ellipse(x, y, 6, 3.2, 0, 0, 7); ctx.stroke()
  ctx.fillStyle = 'rgba(237,240,247,' + a + ')'; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill()
}
function glyphShield(ctx, x, y, s, a, col) {
  ctx.strokeStyle = 'rgba(' + (col || '224,168,92') + ',' + a + ')'; ctx.lineWidth = 1.4
  ctx.beginPath(); ctx.moveTo(x, y - s)
  ctx.lineTo(x + s * 0.85, y - s * 0.55); ctx.lineTo(x + s * 0.85, y + s * 0.1)
  ctx.quadraticCurveTo(x + s * 0.85, y + s * 0.7, x, y + s)
  ctx.quadraticCurveTo(x - s * 0.85, y + s * 0.7, x - s * 0.85, y + s * 0.1)
  ctx.lineTo(x - s * 0.85, y - s * 0.55); ctx.closePath(); ctx.stroke()
  // check
  ctx.beginPath(); ctx.moveTo(x - s * 0.35, y); ctx.lineTo(x - s * 0.08, y + s * 0.3); ctx.lineTo(x + s * 0.4, y - s * 0.3); ctx.stroke()
}
function glyphDb(ctx, x, y, dw, dh, a, col) {
  ctx.strokeStyle = 'rgba(' + (col || '111,211,232') + ',' + a + ')'; ctx.lineWidth = 1.2
  ctx.beginPath(); ctx.ellipse(x, y - dh / 2, dw / 2, 3.5, 0, 0, 7); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(x - dw / 2, y - dh / 2); ctx.lineTo(x - dw / 2, y + dh / 2)
  ctx.moveTo(x + dw / 2, y - dh / 2); ctx.lineTo(x + dw / 2, y + dh / 2); ctx.stroke()
  ctx.beginPath(); ctx.ellipse(x, y + dh / 2, dw / 2, 3.5, 0, 0, 3.14); ctx.stroke()
}
function node(ctx, x, y, r, stroke, fill, label) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = fill; ctx.fill()
  ctx.strokeStyle = stroke; ctx.lineWidth = 1.3; ctx.stroke()
  if (label) {
    ctx.fillStyle = stroke; ctx.font = "bold 9px 'JetBrains Mono'"
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText(label, x, y + 0.5)
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
  }
}
function mono(ctx, txt, x, y, col, size) {
  ctx.fillStyle = col; ctx.font = (size || 9) + "px 'JetBrains Mono', monospace"; ctx.fillText(txt, x, y)
}
function snowflake(ctx, x, y, s, col) {
  ctx.strokeStyle = col; ctx.lineWidth = 1.4
  for (let i = 0; i < 6; i++) {
    const a = i / 6 * 6.283
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * s, y + Math.sin(a) * s); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.6)
    ctx.lineTo(x + Math.cos(a + 0.5) * s * 0.85, y + Math.sin(a + 0.5) * s * 0.85); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * s * 0.6, y + Math.sin(a) * s * 0.6)
    ctx.lineTo(x + Math.cos(a - 0.5) * s * 0.85, y + Math.sin(a - 0.5) * s * 0.85); ctx.stroke()
  }
}

// ===================================================================
// paintScene
// ===================================================================
export function paintScene(kind, ctx, w, h, st, t) {
  switch (kind) {

    // ==================== KOCH ====================
    case 'lambda': {
      if (!st.init) { st.init = 1; st.packets = []; st.rings = []; st.spawn = 0; st.fill = 0; st.total = 15000 }
      const cx0 = w * 0.26, cx1 = w * 0.64, cy0 = h * 0.14, cy1 = h * 0.86
      ctx.strokeStyle = 'rgba(224,168,92,0.35)'; ctx.lineWidth = 1.5; rr(ctx, cx0, cy0, cx1 - cx0, cy1 - cy0, 10); ctx.stroke()
      mono(ctx, 'FARGATE / ECS · STEP FUNCTIONS', cx0, cy0 - 8, 'rgba(224,168,92,0.6)', 10)
      const nodes = []
      for (let r2 = 0; r2 < 2; r2++) for (let c2 = 0; c2 < 3; c2++) nodes.push({ x: cx0 + (cx1 - cx0) * (0.2 + c2 * 0.3), y: cy0 + (cy1 - cy0) * (0.3 + r2 * 0.4) })
      nodes.forEach((n, i) => {
        const pr = 13 + Math.sin(t * 0.09 + i * 1.1) * 2.5
        ctx.beginPath(); ctx.arc(n.x, n.y, pr, 0, 7); ctx.fillStyle = 'rgba(111,211,232,0.12)'; ctx.fill()
        ctx.strokeStyle = C; ctx.lineWidth = 1.2; ctx.stroke()
        ctx.fillStyle = C; ctx.font = "bold 14px 'JetBrains Mono'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('λ', n.x, n.y + 1)
      })
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
      st.rings = st.rings.filter(rg => { rg.r += 1.2; rg.a -= 0.04; if (rg.a <= 0) return false; ctx.strokeStyle = 'rgba(111,211,232,' + rg.a + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(rg.x, rg.y, rg.r, 0, 7); ctx.stroke(); return true })
      // DynamoDB checkpoint strip
      const ckY = cy1 - 12, segs = 13
      for (let i = 0; i < segs; i++) {
        const on = (st.fill % (segs * 4)) / 4 > i
        ctx.fillStyle = on ? 'rgba(224,168,92,0.7)' : 'rgba(255,255,255,0.08)'
        ctx.fillRect(cx0 + 10 + i * ((cx1 - cx0 - 20) / segs), ckY, (cx1 - cx0 - 20) / segs - 3, 4)
      }
      mono(ctx, 'DYNAMODB CHECKPOINTS', cx0 + 10, ckY - 6, 'rgba(138,147,168,0.7)', 8)
      const sinkX = w * 0.85, sinkTop = cy0, sinkBot = cy1, cap = 46, level = (st.fill % cap) / cap
      ctx.fillStyle = 'rgba(224,168,92,0.12)'; ctx.fillRect(sinkX - 4, sinkTop, 26, sinkBot - sinkTop)
      ctx.fillStyle = A; ctx.fillRect(sinkX - 4, sinkBot - (sinkBot - sinkTop) * level, 26, (sinkBot - sinkTop) * level)
      ctx.strokeStyle = 'rgba(224,168,92,0.5)'; ctx.lineWidth = 1; ctx.strokeRect(sinkX - 4, sinkTop, 26, sinkBot - sinkTop)
      mono(ctx, 'SNOWFLAKE', sinkX - 12, sinkBot + 16, 'rgba(237,240,247,0.45)')
      st.spawn++; if (st.spawn % 4 === 0) st.packets.push({ phase: 0, p: 0, y: cy0 + Math.random() * (cy1 - cy0), node: nodes[Math.floor(Math.random() * nodes.length)] })
      st.packets = st.packets.filter(pk => {
        pk.p += 0.028
        if (pk.phase === 0) {
          const x = pk.node.x * pk.p, y = pk.y + (pk.node.y - pk.y) * pk.p
          ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fillStyle = C; ctx.fill()
          if (pk.p >= 1) { pk.phase = 1; pk.p = 0; st.rings.push({ x: pk.node.x, y: pk.node.y, r: 14, a: 0.5 }) }
          return true
        }
        const ey = sinkBot - (sinkBot - sinkTop) * ((st.fill % cap) / cap)
        const x = pk.node.x + (sinkX + 9 - pk.node.x) * pk.p, y = pk.node.y + (ey - pk.node.y) * pk.p
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fillStyle = A; ctx.fill()
        if (pk.p >= 1) { st.fill++; st.total += 7 + Math.floor(Math.random() * 30); return false }
        return true
      })
      mono(ctx, 'RECORDS ' + fmt(st.total), w * 0.02, h * 0.95, 'rgba(111,211,232,0.7)', 11)
      mono(ctx, '26 ENDPOINTS · 13 MO BACKFILL', w * 0.02, h * 0.1, 'rgba(138,147,168,0.8)', 10)
      break
    }

    case 'merge': {
      if (!st.init) { st.init = 1; st.packets = []; st.spawn = 0; st.fill = 0 }
      const s1 = { x: w * 0.1, y: h * 0.28 }, s2 = { x: w * 0.1, y: h * 0.66 }
      node(ctx, s1.x, s1.y, 16, C, 'rgba(111,211,232,0.12)', 'API')
      node(ctx, s2.x, s2.y, 16, A, 'rgba(224,168,92,0.12)', 'SFTP')
      mono(ctx, 'LAMBDA API', s1.x - 16, s1.y - 24, 'rgba(138,147,168,0.8)')
      mono(ctx, 'OPENFLOW', s2.x - 16, s2.y + 32, 'rgba(138,147,168,0.8)')
      const tb = { x: w * 0.68, y: h * 0.18, tw: w * 0.26, th: h * 0.52 }
      ctx.strokeStyle = 'rgba(237,240,247,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(tb.x, tb.y, tb.tw, tb.th)
      for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(tb.x, tb.y + tb.th * i / 5); ctx.lineTo(tb.x + tb.tw, tb.y + tb.th * i / 5); ctx.stroke() }
      ctx.beginPath(); ctx.moveTo(tb.x + tb.tw / 2, tb.y); ctx.lineTo(tb.x + tb.tw / 2, tb.y + tb.th); ctx.stroke()
      const cap = 30, lvl = (st.fill % cap) / cap
      ctx.fillStyle = 'rgba(224,168,92,0.25)'; ctx.fillRect(tb.x, tb.y + tb.th * (1 - lvl), tb.tw, tb.th * lvl)
      mono(ctx, 'UNIFIED TABLES', tb.x, tb.y - 8, 'rgba(224,168,92,0.6)', 10)
      st.spawn++; if (st.spawn % 7 === 0) st.packets.push({ src: st.spawn % 14 === 0 ? s2 : s1, p: 0 })
      const entry = { x: tb.x, y: tb.y + tb.th / 2 }
      st.packets = st.packets.filter(pk => {
        pk.p += 0.02
        const x = pk.src.x + (entry.x - pk.src.x) * pk.p
        const y = pk.src.y + (entry.y - pk.src.y) * (pk.p * pk.p * (3 - 2 * pk.p))
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fillStyle = pk.src === s1 ? C : A; ctx.fill()
        if (pk.p >= 1) { st.fill++; return false }
        return true
      })
      const by = h * 0.88
      ctx.fillStyle = 'rgba(138,147,168,0.25)'; ctx.fillRect(w * 0.1, by, w * 0.5, 6)
      ctx.fillStyle = A; ctx.fillRect(w * 0.1, by, w * 0.5 * 0.42, 6)
      mono(ctx, 'LATENCY −58%', w * 0.1 + w * 0.5 + 12, by + 7, 'rgba(224,168,92,0.8)', 11)
      break
    }

    // Doc-extraction pipeline: docs → regex gate → LLM ensemble vote → validated into Snowflake
    case 'docs': {
      if (!st.init) { st.init = 1; st.docs = []; st.spawn = 0; st.acc = 88; st.ok = 0 }
      const gateX = w * 0.36, ensX = w * 0.6, sinkX = w * 0.87
      // regex gate
      ctx.strokeStyle = 'rgba(224,168,92,0.6)'; ctx.lineWidth = 1.5
      ctx.strokeRect(gateX - 14, h * 0.3, 28, h * 0.4)
      ctx.fillStyle = 'rgba(224,168,92,0.85)'; ctx.font = "bold 12px 'JetBrains Mono'"; ctx.textAlign = 'center'
      ctx.fillText('.*', gateX, h * 0.52); ctx.textAlign = 'start'
      mono(ctx, 'REGEX', gateX - 16, h * 0.26, 'rgba(224,168,92,0.6)')
      // LLM ensemble — 3 brains that flash while voting
      mono(ctx, 'LLM ENSEMBLE', ensX - 34, h * 0.16, 'rgba(111,211,232,0.7)')
      for (let i = 0; i < 3; i++) {
        const by2 = h * (0.32 + i * 0.18)
        const hot = Math.sin(t * 0.15 + i * 2.1) > 0.3
        glyphBrain(ctx, ensX, by2, hot ? 1 : 0.25)
        if (hot) { ctx.strokeStyle = 'rgba(111,211,232,0.15)'; ctx.beginPath(); ctx.arc(ensX, by2, 9, 0, 7); ctx.stroke() }
      }
      // snowflake validation sink
      snowflake(ctx, sinkX, h * 0.5, 16, 'rgba(224,168,92,0.7)')
      mono(ctx, 'VALIDATED', sinkX - 26, h * 0.5 + 34, 'rgba(138,147,168,0.8)')
      // documents flowing
      st.spawn++; if (st.spawn % 34 === 0) st.docs.push({ x: -20, y: h * (0.35 + Math.random() * 0.3), stage: 0 })
      st.docs = st.docs.filter(d => {
        d.x += 1.8
        if (d.x > sinkX - 12) { st.ok++; st.acc = 88 + (Math.sin(t * 0.01 + st.ok) + 1) * 2; return false }
        if (d.x > gateX) d.stage = 1
        if (d.x > ensX + 10) d.stage = 2
        if (d.stage === 2) {
          // extracted: a green-ish check dot
          ctx.fillStyle = 'rgba(140,220,160,0.9)'; ctx.beginPath(); ctx.arc(d.x, d.y, 4, 0, 7); ctx.fill()
          ctx.strokeStyle = '#070A14'; ctx.lineWidth = 1.4
          ctx.beginPath(); ctx.moveTo(d.x - 2, d.y); ctx.lineTo(d.x - 0.5, d.y + 1.8); ctx.lineTo(d.x + 2.2, d.y - 1.8); ctx.stroke()
        } else {
          // little document with text lines
          ctx.strokeStyle = d.stage === 1 ? C : 'rgba(237,240,247,0.6)'; ctx.lineWidth = 1
          ctx.strokeRect(d.x - 7, d.y - 9, 14, 18)
          ctx.strokeStyle = d.stage === 1 ? 'rgba(111,211,232,0.6)' : 'rgba(237,240,247,0.3)'
          for (let l = 0; l < 3; l++) { ctx.beginPath(); ctx.moveTo(d.x - 4, d.y - 4 + l * 5); ctx.lineTo(d.x + 4, d.y - 4 + l * 5); ctx.stroke() }
        }
        return true
      })
      // accuracy meter
      const mx0 = w * 0.05, mw = w * 0.35, my = h * 0.88
      ctx.fillStyle = 'rgba(138,147,168,0.25)'; ctx.fillRect(mx0, my, mw, 6)
      ctx.fillStyle = A; ctx.fillRect(mx0, my, mw * (st.acc / 100), 6)
      mono(ctx, 'ACCURACY ' + st.acc.toFixed(1) + '% · GRAFANA TRACKED', mx0 + mw + 12, my + 7, 'rgba(224,168,92,0.8)', 10)
      break
    }

    // Cortex multi-agent routing v2: 1 main agent → governance mask → 3 specialist subs
    case 'cortex': {
      if (!st.init) { st.init = 1; st.packets = []; st.spawn = 0; st.act = { GOV: 0, ML: 0, SEM: 0 }; st.sem = Array.from({ length: 12 }, () => ({ jx: Math.random(), jy: Math.random() })) }
      const main = { x: w * 0.3, y: h * 0.5 }
      const srcs = [{ x: w * 0.06, y: h * 0.2, l: 'API' }, { x: w * 0.06, y: h * 0.5, l: 'LEGCY' }, { x: w * 0.06, y: h * 0.8, l: 'DOCS' }]
      srcs.forEach(sr => { node(ctx, sr.x, sr.y, 13, 'rgba(138,147,168,0.9)', 'rgba(138,147,168,0.08)', sr.l) })
      // main agent with orbit ring
      const mr = 22 + Math.sin(t * 0.08) * 2
      ctx.strokeStyle = 'rgba(224,168,92,0.25)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.arc(main.x, main.y, mr + 7, 0, 7); ctx.stroke()
      const oa = t * 0.04
      ctx.fillStyle = 'rgba(224,168,92,0.8)'; ctx.beginPath(); ctx.arc(main.x + Math.cos(oa) * (mr + 7), main.y + Math.sin(oa) * (mr + 7), 2, 0, 7); ctx.fill()
      node(ctx, main.x, main.y, mr, A, 'rgba(224,168,92,0.15)', 'AGENT')
      mono(ctx, 'CORTEX MAIN', main.x - 34, main.y + mr + 20, 'rgba(224,168,92,0.7)')
      // 3 specialist sub-agents — GOV owns the masking, so no extra shield line
      const subs = [{ x: w * 0.84, y: h * 0.17, l: 'GOV' }, { x: w * 0.84, y: h * 0.5, l: 'ML' }, { x: w * 0.84, y: h * 0.83, l: 'SEM' }]
      subs.forEach(sb => {
        st.act[sb.l] = Math.max(0, st.act[sb.l] - 0.02)
        const act = st.act[sb.l]
        ctx.strokeStyle = 'rgba(111,211,232,0.14)'; ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(main.x + mr, main.y); ctx.lineTo(sb.x - 15, sb.y); ctx.stroke()
        if (act > 0) { ctx.strokeStyle = 'rgba(111,211,232,' + act * 0.3 + ')'; ctx.beginPath(); ctx.arc(sb.x, sb.y, 19, 0, 7); ctx.stroke() }
        node(ctx, sb.x, sb.y, 14, C, 'rgba(111,211,232,' + (0.1 + act * 0.2) + ')', sb.l)
        const gx = sb.x + 34, ga = 0.3 + act * 0.7
        if (sb.l === 'GOV') { // shield over a data cylinder
          glyphDb(ctx, gx, sb.y + 6, 16, 14, ga)
          glyphShield(ctx, gx, sb.y - 10, 8, ga)
        } else if (sb.l === 'ML') { // mini neural net, edges flash
          const L1 = [-8, 0, 8], L2 = [-5, 5]
          L1.forEach((dy, i) => L2.forEach((dy2, j) => {
            const hot = Math.sin(t * 0.12 + i * 1.7 + j * 2.3) > 0.4
            ctx.strokeStyle = 'rgba(111,211,232,' + (hot ? ga : ga * 0.25) + ')'; ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(gx - 6, sb.y + dy); ctx.lineTo(gx + 8, sb.y + dy2); ctx.stroke()
          }))
          L1.forEach(dy => { ctx.fillStyle = 'rgba(111,211,232,' + ga + ')'; ctx.beginPath(); ctx.arc(gx - 6, sb.y + dy, 2, 0, 7); ctx.fill() })
          L2.forEach(dy => { ctx.fillStyle = 'rgba(224,168,92,' + ga + ')'; ctx.beginPath(); ctx.arc(gx + 8, sb.y + dy, 2, 0, 7); ctx.fill() })
        } else { // SEM: messy dots settling into a clean grid, cycling
          const p2 = (Math.sin(t * 0.02) + 1) / 2 // 0 messy → 1 aligned
          st.sem.forEach((d, i) => {
            const gxx = gx - 8 + (i % 4) * 7, gyy = sb.y - 8 + Math.floor(i / 4) * 8
            const jx = gx - 8 + d.jx * 22, jy = sb.y - 10 + d.jy * 22
            const x = jx + (gxx - jx) * p2, y = jy + (gyy - jy) * p2
            ctx.fillStyle = 'rgba(' + (p2 > 0.6 ? '224,168,92' : '138,147,168') + ',' + ga + ')'
            ctx.beginPath(); ctx.arc(x, y, 1.6, 0, 7); ctx.fill()
          })
        }
      })
      mono(ctx, 'STRUCTURE', subs[0].x - 110, subs[0].y + 3, 'rgba(138,147,168,0.55)', 8)
      mono(ctx, 'DISCOVER', subs[1].x - 110, subs[1].y + 3, 'rgba(138,147,168,0.55)', 8)
      mono(ctx, 'UNIFY', subs[2].x - 110, subs[2].y + 3, 'rgba(138,147,168,0.55)', 8)
      mono(ctx, 'PII · EHS · IP · OT MASKED AT GOV', w * 0.02, h * 0.96, 'rgba(224,168,92,0.55)', 9)
      // packets: source → main → (mask) → sub
      st.spawn++; if (st.spawn % 6 === 0) st.packets.push({ phase: 0, p: 0, src: srcs[Math.floor(Math.random() * 3)], sub: subs[Math.floor(Math.random() * 3)] })
      st.packets = st.packets.filter(pk => {
        pk.p += 0.024
        if (pk.phase === 0) {
          const x = pk.src.x + (main.x - pk.src.x) * pk.p, y = pk.src.y + (main.y - pk.src.y) * pk.p
          ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fillStyle = 'rgba(138,147,168,0.9)'; ctx.fill()
          if (pk.p >= 1) { pk.phase = 1; pk.p = 0 }
          return true
        }
        const x = main.x + (pk.sub.x - main.x) * pk.p, y = main.y + (pk.sub.y - main.y) * pk.p
        ctx.beginPath(); ctx.arc(x, y, 2.8, 0, 7); ctx.fillStyle = pk.p > 0.5 ? A : C; ctx.fill()
        if (pk.p >= 1) { st.act[pk.sub.l] = 1; return false }
        return true
      })
      break
    }

    // ==================== CITY OF WICHITA ====================
    case 'rpa': {
      if (!st.init) { st.init = 1; st.packets = []; st.spawn = 0 }
      const dep = [{ x: w * 0.14, y: h * 0.24, l: 'PERMITS' }, { x: w * 0.86, y: h * 0.24, l: 'FINANCE' }, { x: w * 0.14, y: h * 0.76, l: 'WORKS' }, { x: w * 0.86, y: h * 0.76, l: 'CLERK' }]
      const cx = w * 0.5, cy = h * 0.5
      dep.forEach(d => {
        ctx.strokeStyle = 'rgba(111,211,232,0.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(d.x - 34, d.y - 15, 68, 30)
        mono(ctx, d.l, d.x - 22, d.y + 3.5, 'rgba(237,240,247,0.7)')
        ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.beginPath(); ctx.moveTo(d.x, d.y); ctx.lineTo(cx, cy); ctx.stroke()
      })
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(0.785)
      const pulse = 15 + Math.sin(t * 0.1) * 2
      ctx.strokeStyle = A; ctx.lineWidth = 1.5; ctx.strokeRect(-pulse / 2, -pulse / 2, pulse, pulse); ctx.restore()
      mono(ctx, 'RPA CORE', cx - 24, cy + 30, 'rgba(224,168,92,0.7)')
      st.spawn++
      if (st.spawn % 12 === 0) {
        const a = dep[Math.floor(Math.random() * 4)]; let b = dep[Math.floor(Math.random() * 4)]
        if (b === a) b = dep[(dep.indexOf(a) + 1) % 4]
        st.packets.push({ a, b, p: 0 })
      }
      st.packets = st.packets.filter(pk => {
        pk.p += 0.02; let x, y
        if (pk.p < 0.5) { const q = pk.p * 2; x = pk.a.x + (cx - pk.a.x) * q; y = pk.a.y + (cy - pk.a.y) * q }
        else { const q = (pk.p - 0.5) * 2; x = cx + (pk.b.x - cx) * q; y = cy + (pk.b.y - cy) * q }
        ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fillStyle = pk.p < 0.5 ? C : A; ctx.fill()
        if (pk.p >= 1) return false
        return true
      })
      mono(ctx, '+99% EFFICIENCY · SYSTEM-TO-SYSTEM', w * 0.02, h * 0.95, 'rgba(138,147,168,0.8)', 10)
      break
    }

    case 'agents': {
      if (!st.init) { st.init = 1; st.tasks = []; st.spawn = 0 }
      const cx = w * 0.5, cy = h * 0.52, RR = Math.min(w, h) * 0.36, N = 8, ag = []
      for (let i = 0; i < N; i++) { const a = i / N * 6.283 - 1.57; ag.push({ x: cx + Math.cos(a) * RR * 1.35, y: cy + Math.sin(a) * RR * 0.85 }) }
      ag.forEach((a, i) => {
        ctx.strokeStyle = 'rgba(111,211,232,0.16)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(a.x, a.y); ctx.stroke()
        const pr = 11 + Math.sin(t * 0.1 + i) * 1.5
        ctx.beginPath(); ctx.arc(a.x, a.y, pr, 0, 7); ctx.fillStyle = 'rgba(111,211,232,0.12)'; ctx.fill(); ctx.strokeStyle = C; ctx.stroke()
        const gy = a.y - 22
        const act = k => Math.sin(t * 0.06 + i * 1.31 + k * 2.17) > 0.45
        const aT = act(0), aB = act(1), aE = act(2)
        glyphGear(ctx, a.x - 16, gy, t * 0.03 + i, aT ? 1 : 0.18)
        glyphBrain(ctx, a.x, gy, aB ? 1 : 0.18)
        glyphEye(ctx, a.x + 16, gy, aE ? 1 : 0.18)
        if (aT || aB || aE) { ctx.strokeStyle = 'rgba(237,240,247,0.12)'; ctx.beginPath(); ctx.arc(a.x, a.y, pr + 4, 0, 7); ctx.stroke() }
      })
      const mainR = 24 + Math.sin(t * 0.08) * 2
      ctx.beginPath(); ctx.arc(cx, cy, mainR + 6, 0, 7); ctx.strokeStyle = 'rgba(224,168,92,0.25)'; ctx.lineWidth = 1; ctx.stroke()
      node(ctx, cx, cy, mainR, A, 'rgba(224,168,92,0.15)', 'AGENT')
      mono(ctx, 'CLAUDE API · MCP · HUMAN-IN-THE-LOOP', w * 0.02, h * 0.95, 'rgba(138,147,168,0.8)', 10)
      mono(ctx, 'TOOLS', w * 0.02, h * 0.12, 'rgba(224,168,92,0.7)')
      mono(ctx, 'REASONING', w * 0.02, h * 0.19, 'rgba(111,211,232,0.7)')
      mono(ctx, 'VISION', w * 0.02, h * 0.26, 'rgba(237,240,247,0.7)')
      st.spawn++; if (st.spawn % 7 === 0) st.tasks.push({ a: ag[Math.floor(Math.random() * N)], p: 0, out: false })
      st.tasks = st.tasks.filter(tk => {
        tk.p += 0.035
        const from = tk.out ? tk.a : { x: cx, y: cy }, to = tk.out ? { x: cx, y: cy } : tk.a
        const x = from.x + (to.x - from.x) * tk.p, y = from.y + (to.y - from.y) * tk.p
        ctx.fillStyle = tk.out ? A : C; ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill()
        if (tk.p >= 1) { if (!tk.out) { tk.out = true; tk.p = 0; return true } return false }
        return true
      })
      break
    }

    case 'tracker': {
      if (!st.init) { st.init = 1; st.coins = []; st.spawn = 0; st.ping = 0 }
      st.spawn++; if (st.spawn % 22 === 0) st.coins.push({ x: w * (0.08 + Math.random() * 0.22), y: -8, v: 1.4 + Math.random() })
      const slotY = h * 0.82
      ctx.strokeStyle = 'rgba(224,168,92,0.5)'; ctx.lineWidth = 1.5; ctx.strokeRect(w * 0.06, slotY, w * 0.28, 12)
      mono(ctx, 'COST CAPTURE', w * 0.06, slotY + 28, 'rgba(138,147,168,0.8)')
      st.coins = st.coins.filter(c => {
        c.y += c.v; if (c.y > slotY) return false
        ctx.beginPath(); ctx.arc(c.x, c.y, 6, 0, 7); ctx.fillStyle = 'rgba(224,168,92,0.2)'; ctx.fill()
        ctx.strokeStyle = A; ctx.lineWidth = 1.2; ctx.stroke()
        ctx.fillStyle = A; ctx.font = "bold 8px 'JetBrains Mono'"; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        ctx.fillText('$', c.x, c.y + 0.5); ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic'
        return true
      })
      const bx = w * 0.46, bw = w * 0.48, by = h * 0.78, bh = h * 0.55
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1; ctx.strokeRect(bx - 10, by - bh - 10, bw + 20, bh + 20)
      for (let i = 0; i < 6; i++) {
        const bhh = bh * (0.25 + 0.65 * Math.abs(Math.sin(t * 0.012 + i * 1.2)))
        const bxx = bx + i * (bw / 6)
        ctx.fillStyle = i === 4 && Math.sin(t * 0.05) > 0.6 ? 'rgba(200,90,106,0.8)' : 'rgba(111,211,232,0.55)'
        ctx.fillRect(bxx, by - bhh, bw / 6 - 8, bhh)
      }
      if (Math.sin(t * 0.05) > 0.6) {
        const px = bx + 4 * (bw / 6) + (bw / 12); st.ping += 0.8; const pr = (st.ping % 20)
        ctx.strokeStyle = 'rgba(200,90,106,' + (1 - pr / 20) + ')'; ctx.beginPath(); ctx.arc(px, by - bh * 0.5, pr, 0, 7); ctx.stroke()
      }
      mono(ctx, 'FORECAST · TRENDS · ANOMALY', bx - 10, by + 24, 'rgba(138,147,168,0.8)')
      break
    }

    // ==================== NIAR ====================
    case 'swarm': {
      if (!st.init) {
        st.init = 1; st.cells = []
        for (let r2 = 0; r2 < 3; r2++) for (let c2 = 0; c2 < 4; c2++) st.cells.push({ cx: 0.36 + c2 * 0.165, cy: 0.18 + r2 * 0.3, pulse: 0 })
        st.packets = []; st.spawn = 0
      }
      const gate = { x: w * 0.13, y: h * 0.5 }
      node(ctx, gate.x, gate.y, 18, A, 'rgba(224,168,92,0.12)', 'TRFK')
      mono(ctx, 'TRAEFIK', gate.x - 20, gate.y + 36, 'rgba(138,147,168,0.8)')
      st.cells.forEach(cell => {
        cell.pulse = Math.max(0, cell.pulse - 0.02)
        const x = cell.cx * w - 26, y = cell.cy * h, cw = 52, ch = h * 0.2
        ctx.strokeStyle = 'rgba(111,211,232,' + (0.25 + cell.pulse * 0.7) + ')'; ctx.lineWidth = 1.2
        rr(ctx, x, y, cw, ch, 4); ctx.stroke()
        if (cell.pulse > 0) { ctx.fillStyle = 'rgba(111,211,232,' + cell.pulse * 0.15 + ')'; rr(ctx, x, y, cw, ch, 4); ctx.fill() }
        ctx.fillStyle = 'rgba(111,211,232,' + (0.3 + cell.pulse * 0.6) + ')'; ctx.fillRect(x + 6, y + ch - 8, cw - 12, 3)
      })
      st.spawn++; if (st.spawn % 6 === 0) st.packets.push({ p: 0, cell: st.cells[Math.floor(Math.random() * st.cells.length)] })
      st.packets = st.packets.filter(pk => {
        pk.p += 0.03
        const tx = pk.cell.cx * w, ty = pk.cell.cy * h + h * 0.1
        let x, y
        if (pk.p < 0.3) { const q = pk.p / 0.3; x = -6 + (gate.x + 6) * q; y = gate.y }
        else { const q = (pk.p - 0.3) / 0.7; x = gate.x + (tx - gate.x) * q; y = gate.y + (ty - gate.y) * q }
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fillStyle = pk.p < 0.3 ? 'rgba(237,240,247,0.8)' : C; ctx.fill()
        if (pk.p >= 1) { pk.cell.pulse = 1; return false }
        return true
      })
      mono(ctx, 'DOCKER SWARM · NIST 800-53/171', w * 0.02, h * 0.95, 'rgba(138,147,168,0.8)', 10)
      break
    }

    case 'graph': {
      if (!st.init) {
        st.init = 1
        st.nodes = Array.from({ length: 18 }, () => ({ x: Math.random() * 0.86 + 0.07, y: Math.random() * 0.72 + 0.1 }))
        st.edges = []
        for (let i = 0; i < st.nodes.length; i++) for (let j = i + 1; j < st.nodes.length; j++) if (Math.random() < 0.14) st.edges.push([i, j])
        st.pulses = []; st.q = 10000000 + Math.random() * 400000
      }
      st.edges.forEach(e => { const a = st.nodes[e[0]], b = st.nodes[e[1]]; ctx.strokeStyle = 'rgba(111,211,232,0.12)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke() })
      if (st.pulses.length < 16 && Math.random() < 0.5) st.pulses.push({ e: st.edges[Math.floor(Math.random() * st.edges.length)], p: 0, sp: 0.025 + Math.random() * 0.045, warm: Math.random() < 0.4 })
      st.pulses = st.pulses.filter(pl => {
        pl.p += pl.sp; if (pl.p >= 1) return false
        const a = st.nodes[pl.e[0]], b = st.nodes[pl.e[1]]
        ctx.strokeStyle = pl.warm ? 'rgba(224,168,92,0.35)' : 'rgba(111,211,232,0.35)'; ctx.lineWidth = 1.4
        ctx.beginPath(); ctx.moveTo(a.x * w, a.y * h); ctx.lineTo(b.x * w, b.y * h); ctx.stroke()
        const x = (a.x + (b.x - a.x) * pl.p) * w, y = (a.y + (b.y - a.y) * pl.p) * h
        ctx.fillStyle = pl.warm ? A : C; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill()
        return true
      })
      st.nodes.forEach((n, i) => {
        const flash = Math.sin(t * 0.12 + i * 2.3) > 0.86
        const pr = (flash ? 8 : 5.5) + Math.sin(t * 0.08 + i) * 1.2
        ctx.beginPath(); ctx.arc(n.x * w, n.y * h, pr, 0, 7)
        ctx.fillStyle = flash ? 'rgba(224,168,92,0.85)' : 'rgba(111,211,232,0.55)'; ctx.fill()
      })
      st.q += 28000 + Math.random() * 85000
      mono(ctx, 'RETRIEVALS ' + fmt(st.q), w * 0.02, h * 0.95, 'rgba(224,168,92,0.85)', 12)
      mono(ctx, 'POSTGRES + QDRANT + NEO4J', w * 0.02, h * 0.09, 'rgba(138,147,168,0.8)', 10)
      break
    }

    case 'firewall': {
      if (!st.init) { st.init = 1; st.packets = []; st.spawn = 0; st.blocked = [] }
      const wall = w * 0.52, gateY = h * 0.5
      for (let y = h * 0.08; y < h * 0.92; y += 14) {
        if (Math.abs(y - gateY) < 22) continue
        ctx.fillStyle = 'rgba(224,168,92,0.4)'; ctx.fillRect(wall - 3, y, 6, 9)
      }
      ctx.strokeStyle = A; ctx.lineWidth = 1.5; ctx.strokeRect(wall - 8, gateY - 20, 16, 40)
      mono(ctx, 'PFSENSE', wall - 20, h * 0.06, 'rgba(224,168,92,0.7)', 10)
      mono(ctx, '100% INSPECTED', wall + 16, gateY + 4, 'rgba(138,147,168,0.8)')
      st.spawn++; if (st.spawn % 4 === 0) st.packets.push({ x: -6, y0: h * (0.12 + Math.random() * 0.76), bad: Math.random() < 0.16 })
      st.packets = st.packets.filter(pk => {
        pk.x += 2.6
        let y
        if (pk.x < wall) { const q = Math.min(1, pk.x / wall); y = pk.y0 + (gateY - pk.y0) * (q * q) }
        else { const q = Math.min(1, (pk.x - wall) / (w - wall)); y = gateY + (pk.y0 - gateY) * Math.sqrt(q) }
        if (pk.bad && pk.x >= wall - 10) { st.blocked.push({ x: wall - 10, y, r: 2, a: 1 }); return false }
        ctx.beginPath(); ctx.arc(pk.x, y, 2.6, 0, 7); ctx.fillStyle = pk.x > wall ? C : 'rgba(237,240,247,0.75)'; ctx.fill()
        return pk.x < w + 6
      })
      st.blocked = st.blocked.filter(b => {
        b.r += 1.4; b.a -= 0.06; if (b.a <= 0) return false
        ctx.strokeStyle = 'rgba(200,90,106,' + b.a + ')'; ctx.lineWidth = 1.5
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke()
        return true
      })
      mono(ctx, 'AWS VPC · CENTRALIZED INSPECTION', w * 0.02, h * 0.95, 'rgba(138,147,168,0.8)', 10)
      break
    }

    // ==================== EQUITY BANK ====================
    case 'records': {
      if (!st.init) { st.init = 1; st.rows = []; st.spawn = 0; st.stack = 0 }
      const dbx = w * 0.8, dby = h * 0.5, dw = 46, dh = h * 0.56
      ctx.strokeStyle = 'rgba(224,168,92,0.5)'; ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.ellipse(dbx, dby - dh / 2, dw / 2, 7, 0, 0, 7); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(dbx - dw / 2, dby - dh / 2); ctx.lineTo(dbx - dw / 2, dby + dh / 2)
      ctx.moveTo(dbx + dw / 2, dby - dh / 2); ctx.lineTo(dbx + dw / 2, dby + dh / 2); ctx.stroke()
      ctx.beginPath(); ctx.ellipse(dbx, dby + dh / 2, dw / 2, 7, 0, 0, 3.14); ctx.stroke()
      const cap = 64, lvl = (st.stack % cap) / cap
      ctx.fillStyle = 'rgba(224,168,92,0.3)'; ctx.fillRect(dbx - dw / 2, dby + dh / 2 - dh * lvl, dw, dh * lvl)
      mono(ctx, 'LEGACY CRM', dbx - 30, dby + dh / 2 + 20, 'rgba(138,147,168,0.8)')
      st.spawn++; if (st.spawn % 10 === 0) st.rows.push({ p: 0, y: h * (0.16 + Math.random() * 0.68) })
      st.rows = st.rows.filter(r => {
        r.p += 0.022; const x = (dbx - dw) * r.p
        ctx.fillStyle = C; ctx.fillRect(x, r.y, 16, 3)
        if (r.p >= 1) { st.stack++; return false }
        return true
      })
      mono(ctx, '500+ RECORDS · ZERO LOSS', w * 0.02, h * 0.95, 'rgba(138,147,168,0.8)', 10)
      break
    }

    case 'retire': {
      if (!st.init) { st.init = 1; st.marked = []; st.tick = 0 }
      const cols = 6, rows = 3, total = cols * rows, maxMark = Math.round(total * 0.36)
      st.tick++
      if (st.tick % 70 === 0) {
        if (st.marked.length >= maxMark) st.marked = []
        else { let i; do { i = Math.floor(Math.random() * total) } while (st.marked.includes(i)); st.marked.push(i) }
      }
      for (let i = 0; i < total; i++) {
        const cx2 = w * 0.06 + (i % cols) * (w * 0.09), cy2 = h * 0.12 + Math.floor(i / cols) * (h * 0.28)
        const cw = w * 0.07, ch = h * 0.2, dead = st.marked.includes(i)
        ctx.globalAlpha = dead ? 0.3 : 1
        ctx.strokeStyle = 'rgba(237,240,247,0.4)'; ctx.lineWidth = 1; ctx.strokeRect(cx2, cy2, cw, ch)
        ctx.strokeStyle = 'rgba(111,211,232,0.4)'
        for (let l = 1; l < 4; l++) { ctx.beginPath(); ctx.moveTo(cx2 + 4, cy2 + ch * l / 4); ctx.lineTo(cx2 + cw - 4, cy2 + ch * l / 4); ctx.stroke() }
        ctx.globalAlpha = 1
        if (dead) {
          ctx.strokeStyle = 'rgba(200,90,106,0.8)'; ctx.lineWidth = 1.5
          ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2 + cw, cy2 + ch)
          ctx.moveTo(cx2 + cw, cy2); ctx.lineTo(cx2, cy2 + ch); ctx.stroke()
        }
      }
      const pct = st.marked.length / maxMark
      const bx = w * 0.72, by = h * 0.3
      mono(ctx, 'QUERY TIME', bx, by - 10, 'rgba(138,147,168,0.8)')
      ctx.fillStyle = 'rgba(138,147,168,0.25)'; ctx.fillRect(bx, by, w * 0.2, 8)
      ctx.fillStyle = A; ctx.fillRect(bx, by, w * 0.2 * (1 - pct * 0.55), 8)
      mono(ctx, 'REPORTS RETIRED ' + Math.round(pct * 36) + '%', bx, by + 28, 'rgba(224,168,92,0.8)', 10)
      break
    }

    case 'dash': {
      const p1x = w * 0.06, pw = w * 0.26, py = h * 0.16, ph2 = h * 0.66
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1;
      [0, 1, 2].forEach(i => ctx.strokeRect(p1x + i * (pw + w * 0.05), py, pw, ph2))
      for (let i = 0; i < 4; i++) {
        const bh2 = ph2 * 0.75 * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.015 + i)))
        ctx.fillStyle = 'rgba(111,211,232,0.55)'
        ctx.fillRect(p1x + 8 + i * (pw - 16) / 4, py + ph2 - 8 - bh2, (pw - 16) / 4 - 5, bh2)
      }
      const p2x = p1x + pw + w * 0.05; const prog = (t % 260) / 260
      ctx.strokeStyle = A; ctx.lineWidth = 1.6; ctx.beginPath()
      for (let q = 0; q <= prog; q += 0.02) {
        const x = p2x + 8 + (pw - 16) * q, y = py + ph2 * 0.5 - Math.sin(q * 9) * ph2 * 0.24 - q * ph2 * 0.14
        q === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      const p3cx = p1x + 2 * (pw + w * 0.05) + pw / 2, p3cy = py + ph2 / 2, dr = Math.min(pw, ph2) * 0.3
      ctx.strokeStyle = 'rgba(138,147,168,0.3)'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(p3cx, p3cy, dr, 0, 7); ctx.stroke()
      const sweep = 4.4 * (0.5 + 0.5 * Math.sin(t * 0.02))
      ctx.strokeStyle = C; ctx.beginPath(); ctx.arc(p3cx, p3cy, dr, -1.57, -1.57 + sweep); ctx.stroke()
      mono(ctx, 'IBM BUSINESS ANALYTICS', w * 0.06, h * 0.95, 'rgba(138,147,168,0.8)', 10)
      break
    }

    // ==================== PROJECTS & RESEARCH ====================
    // Retail IQ: medallion lakehouse — packets refine bronze → silver → gold, MLflow forecast
    case 'lakehouse': {
      if (!st.init) { st.init = 1; st.drops = []; st.spawn = 0 }
      const bands = [
        { y: h * 0.22, l: 'BRONZE', col: '205,127,50' },
        { y: h * 0.48, l: 'SILVER', col: '190,200,215' },
        { y: h * 0.74, l: 'GOLD', col: '224,168,92' },
      ]
      const bx0 = w * 0.06, bx1 = w * 0.56
      bands.forEach(b => {
        ctx.strokeStyle = 'rgba(' + b.col + ',0.45)'; ctx.lineWidth = 1
        ctx.strokeRect(bx0, b.y - 11, bx1 - bx0, 22)
        ctx.fillStyle = 'rgba(' + b.col + ',0.08)'; ctx.fillRect(bx0, b.y - 11, bx1 - bx0, 22)
        mono(ctx, b.l, bx1 + 8, b.y + 3, 'rgba(' + b.col + ',0.75)', 8)
      })
      st.spawn++; if (st.spawn % 14 === 0) st.drops.push({ x: bx0 + 10 + Math.random() * (bx1 - bx0 - 20), y: h * 0.04, stage: 0 })
      st.drops = st.drops.filter(d => {
        d.y += 1.3
        const b = bands[Math.min(2, d.stage)]
        if (d.y > b.y && d.stage < 3) { d.stage++; if (d.stage === 3) return false }
        const col = d.stage === 0 ? '138,147,168' : bands[d.stage - 1].col
        ctx.fillStyle = 'rgba(' + col + ',0.9)'
        ctx.beginPath(); ctx.arc(d.x, d.y, 3 - d.stage * 0.4, 0, 7); ctx.fill()
        return true
      })
      // MLflow forecast panel
      const fx = w * 0.7, fw = w * 0.25, fy = h * 0.18, fh = h * 0.55
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.strokeRect(fx, fy, fw, fh)
      const prog = (t % 220) / 220
      ctx.strokeStyle = C; ctx.lineWidth = 1.5; ctx.beginPath()
      for (let q = 0; q <= Math.min(prog, 0.6); q += 0.02) {
        const x = fx + 6 + (fw - 12) * q, y = fy + fh * 0.7 - Math.sin(q * 7) * fh * 0.15 - q * fh * 0.3
        q === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      if (prog > 0.6) {
        ctx.setLineDash([3, 4]); ctx.strokeStyle = A; ctx.beginPath()
        for (let q = 0.6; q <= prog; q += 0.02) {
          const x = fx + 6 + (fw - 12) * q, y = fy + fh * 0.7 - Math.sin(q * 7) * fh * 0.15 - q * fh * 0.3
          q === 0.6 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        }
        ctx.stroke(); ctx.setLineDash([])
      }
      mono(ctx, 'MLFLOW FORECAST', fx, fy - 6, 'rgba(224,168,92,0.6)', 8)
      const blink = Math.sin(t * 0.1) > 0
      mono(ctx, 'AI ANALYST: demand ↑ 12%' + (blink ? '_' : ''), fx, fy + fh + 16, 'rgba(111,211,232,0.75)', 9)
      mono(ctx, 'LAMBDA · S3 · DATABRICKS · DELTA', w * 0.06, h * 0.95, 'rgba(138,147,168,0.8)', 9)
      break
    }

    // Insight Forge: batch bursts + real-time stream converge on Snowflake, Streamlit ticks
    case 'forge': {
      if (!st.init) { st.init = 1; st.pk = []; st.spawn = 0; st.price = 412.5 }
      const b1 = { x: w * 0.09, y: h * 0.26 }, b2 = { x: w * 0.09, y: h * 0.68 }
      ctx.strokeStyle = 'rgba(111,211,232,0.5)'; ctx.lineWidth = 1.2; ctx.strokeRect(b1.x - 26, b1.y - 13, 52, 26)
      mono(ctx, 'BATCH', b1.x - 15, b1.y + 3, 'rgba(237,240,247,0.75)', 8)
      ctx.strokeStyle = 'rgba(224,168,92,0.5)'; ctx.strokeRect(b2.x - 26, b2.y - 13, 52, 26)
      mono(ctx, 'STREAM', b2.x - 17, b2.y + 3, 'rgba(237,240,247,0.75)', 8)
      const mid = { x: w * 0.45, y: h * 0.47 }
      node(ctx, mid.x, mid.y, 15, C, 'rgba(111,211,232,0.12)', 'λ')
      mono(ctx, 'GLUE · ATHENA · DYNAMO', mid.x - 52, mid.y + 34, 'rgba(138,147,168,0.7)', 8)
      const sf = { x: w * 0.72, y: h * 0.47 }
      snowflake(ctx, sf.x, sf.y, 15, 'rgba(111,211,232,' + (0.55 + Math.sin(t * 0.07) * 0.2) + ')')
      st.spawn++
      if (st.spawn % 80 === 0) for (let i = 0; i < 6; i++) st.pk.push({ src: b1, p: -i * 0.05, warm: 0 })
      if (st.spawn % 9 === 0) st.pk.push({ src: b2, p: 0, warm: 1 })
      st.pk = st.pk.filter(pk => {
        pk.p += 0.022; if (pk.p < 0) return true
        let x, y
        if (pk.p < 0.5) { const q = pk.p * 2; x = pk.src.x + 26 + (mid.x - pk.src.x - 26) * q; y = pk.src.y + (mid.y - pk.src.y) * q }
        else { const q = (pk.p - 0.5) * 2; x = mid.x + (sf.x - mid.x) * q; y = mid.y }
        ctx.fillStyle = pk.warm ? A : C; ctx.beginPath(); ctx.arc(x, y, 2.5, 0, 7); ctx.fill()
        return pk.p < 1
      })
      // streamlit mini chart
      const cx0 = w * 0.84, cw2 = w * 0.12, cy0 = h * 0.2, ch2 = h * 0.55
      ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.strokeRect(cx0, cy0, cw2, ch2)
      for (let i = 0; i < 4; i++) {
        const bh3 = ch2 * 0.7 * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.02 + i * 1.4)))
        ctx.fillStyle = 'rgba(224,168,92,0.55)'
        ctx.fillRect(cx0 + 4 + i * (cw2 - 8) / 4, cy0 + ch2 - 5 - bh3, (cw2 - 8) / 4 - 3, bh3)
      }
      mono(ctx, 'STREAMLIT', cx0 - 4, cy0 - 6, 'rgba(224,168,92,0.6)', 8)
      st.price += (Math.random() - 0.48) * 0.8
      mono(ctx, 'TICK ' + st.price.toFixed(2) + ' · BATCH + REAL-TIME', w * 0.06, h * 0.95, 'rgba(111,211,232,0.7)', 9)
      break
    }

    // Econometrics: Korea vs Japan diverging growth paths, drawn live
    case 'econ': {
      if (!st.init) { st.init = 1; st.prog = 0 }
      const x0 = w * 0.1, x1 = w * 0.92, y0 = h * 0.84, y1 = h * 0.12
      ctx.strokeStyle = 'rgba(237,240,247,0.25)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke()
      mono(ctx, '1980', x0 - 4, y0 + 14, 'rgba(138,147,168,0.6)', 8)
      mono(ctx, '2020', x1 - 18, y0 + 14, 'rgba(138,147,168,0.6)', 8)
      mono(ctx, 'GDP/CAP', x0 - 4, y1 - 6, 'rgba(138,147,168,0.6)', 8)
      st.prog = Math.min(1, st.prog + 0.004); if (st.prog >= 1 && t % 600 === 0) st.prog = 0
      const kor = q => y0 - (y0 - y1) * (0.06 + 0.9 * Math.pow(q, 1.6))
      const jpn = q => y0 - (y0 - y1) * (0.3 + 0.42 * (1 - Math.pow(1 - q, 2.2)))
      const drawLine = (fn, col, dash) => {
        if (dash) ctx.setLineDash([4, 4])
        ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.beginPath()
        for (let q = 0; q <= st.prog; q += 0.02) { const x = x0 + (x1 - x0) * q; q === 0 ? ctx.moveTo(x, fn(q)) : ctx.lineTo(x, fn(q)) }
        ctx.stroke(); ctx.setLineDash([])
      }
      drawLine(kor, C); drawLine(jpn, A)
      // scatter observations popping along the lines
      for (let q = 0.05; q < st.prog; q += 0.1) {
        const x = x0 + (x1 - x0) * q
        ctx.fillStyle = 'rgba(111,211,232,0.5)'; ctx.beginPath(); ctx.arc(x + Math.sin(q * 40) * 3, kor(q) + Math.cos(q * 30) * 4, 1.8, 0, 7); ctx.fill()
        ctx.fillStyle = 'rgba(224,168,92,0.5)'; ctx.beginPath(); ctx.arc(x + Math.cos(q * 37) * 3, jpn(q) + Math.sin(q * 33) * 4, 1.8, 0, 7); ctx.fill()
      }
      if (st.prog > 0.5) { // divergence gap
        const gx = x0 + (x1 - x0) * st.prog
        ctx.strokeStyle = 'rgba(200,90,106,0.5)'; ctx.setLineDash([2, 4]); ctx.lineWidth = 1
        ctx.beginPath(); ctx.moveTo(gx, kor(st.prog)); ctx.lineTo(gx, jpn(st.prog)); ctx.stroke(); ctx.setLineDash([])
      }
      mono(ctx, 'KOREA', x1 - 44, kor(Math.max(0.2, st.prog)) - 8, 'rgba(111,211,232,0.85)', 9)
      mono(ctx, 'JAPAN', x1 - 44, jpn(Math.max(0.2, st.prog)) + 16, 'rgba(224,168,92,0.85)', 9)
      mono(ctx, 'R² = 0.9961 · POOLED LONG-DIFFERENCE', x0 + 6, y1 + 8, 'rgba(237,240,247,0.6)', 9)
      break
    }


    // Dual-track RL: local LoRA/PPO vs frozen API harness, shared reward engine
    case 'dualtrack': {
      if (!st.init) { st.init = 1; st.pk = []; st.spawn = 0; st.wts = [0.5, 0.7, 0.4, 0.6]; st.cfg = 0; st.path = 0 }
      const L = { x: w * 0.24, y: h * 0.32 }, Rn = { x: w * 0.76, y: h * 0.32 }, RE = { x: w * 0.5, y: h * 0.8 }
      // divider
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(w * 0.5, h * 0.06); ctx.lineTo(w * 0.5, h * 0.6); ctx.stroke()
      // LOCAL track — weight bars that shuffle on gradient hit
      mono(ctx, 'LOCAL TRACK · GEMMA 4 26B', w * 0.06, h * 0.1, 'rgba(111,211,232,0.75)', 9)
      mono(ctx, 'LoRA + PPO · WEIGHTS MOVE', w * 0.06, h * 0.17, 'rgba(138,147,168,0.6)', 8)
      ctx.strokeStyle = C; ctx.lineWidth = 1.3; rr(ctx, L.x - 34, L.y - 24, 68, 48, 6); ctx.stroke()
      st.wts.forEach((v, i) => {
        const bh2 = 34 * v
        ctx.fillStyle = 'rgba(111,211,232,0.6)'; ctx.fillRect(L.x - 26 + i * 15, L.y + 18 - bh2, 9, bh2)
      })
      // API track — frozen node + cycling harness chips + mini MCTS
      mono(ctx, 'API TRACK · GEMINI 3.5 FLASH', w * 0.56, h * 0.1, 'rgba(224,168,92,0.75)', 9)
      mono(ctx, 'FROZEN WEIGHTS · HARNESS MOVES', w * 0.56, h * 0.17, 'rgba(138,147,168,0.6)', 8)
      ctx.strokeStyle = A; ctx.lineWidth = 1.3; rr(ctx, Rn.x - 34, Rn.y - 24, 68, 48, 6); ctx.stroke()
      // lock glyph = frozen
      ctx.strokeStyle = 'rgba(224,168,92,0.8)'; ctx.strokeRect(Rn.x - 5, Rn.y - 2, 10, 9)
      ctx.beginPath(); ctx.arc(Rn.x, Rn.y - 4, 4, 3.14, 0); ctx.stroke()
      if (t % 90 === 0) st.cfg = (st.cfg + 1) % 3
      const chips = ['PROMPT', 'TOOLS', 'DEPTH']
      chips.forEach((c2, i) => {
        const hot = i === st.cfg
        const cy2 = Rn.y - 16 + i * 16
        mono(ctx, c2, Rn.x + 44, cy2 + 3, hot ? 'rgba(224,168,92,0.95)' : 'rgba(138,147,168,0.4)', 8)
        if (hot) { ctx.strokeStyle = 'rgba(224,168,92,0.5)'; ctx.strokeRect(Rn.x + 40, cy2 - 6, 42, 12) }
      })
      // mini MCTS tree left of API node
      if (t % 70 === 0) st.path = Math.floor(Math.random() * 4)
      const tx = Rn.x - 78, ty = Rn.y - 14
      const kids = [[-14, 18], [0, 18], [14, 18]]
      const leaf = [[-20, 36], [-8, 36], [6, 36], [18, 36]]
      ctx.fillStyle = 'rgba(237,240,247,0.7)'; ctx.beginPath(); ctx.arc(tx, ty, 3, 0, 7); ctx.fill()
      kids.forEach((k, i) => {
        const on = Math.floor(st.path / 2) === Math.min(i, 1)
        ctx.strokeStyle = 'rgba(237,240,247,' + (on ? 0.6 : 0.15) + ')'
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + k[0], ty + k[1]); ctx.stroke()
        ctx.fillStyle = 'rgba(237,240,247,' + (on ? 0.8 : 0.25) + ')'; ctx.beginPath(); ctx.arc(tx + k[0], ty + k[1], 2.4, 0, 7); ctx.fill()
      })
      leaf.forEach((k, i) => {
        const on = i === st.path
        ctx.strokeStyle = 'rgba(224,168,92,' + (on ? 0.8 : 0.12) + ')'
        const from = kids[Math.min(2, Math.floor(i / 1.5))]
        ctx.beginPath(); ctx.moveTo(tx + from[0], ty + from[1]); ctx.lineTo(tx + k[0], ty + k[1]); ctx.stroke()
        ctx.fillStyle = 'rgba(224,168,92,' + (on ? 0.9 : 0.2) + ')'; ctx.beginPath(); ctx.arc(tx + k[0], ty + k[1], 2, 0, 7); ctx.fill()
      })
      mono(ctx, 'MCTS', tx - 14, ty - 10, 'rgba(138,147,168,0.5)', 8)
      // shared reward engine
      ctx.strokeStyle = 'rgba(237,240,247,0.4)'; ctx.lineWidth = 1.3; rr(ctx, RE.x - 62, RE.y - 16, 124, 32, 6); ctx.stroke()
      mono(ctx, 'REWARD ENGINE · MAE', RE.x - 50, RE.y + 4, 'rgba(237,240,247,0.8)', 9)
      mono(ctx, 'ONE SIGNAL, TWO PARADIGMS · WEEKLY', w * 0.06, h * 0.95, 'rgba(138,147,168,0.8)', 9)
      // packets: predictions down (track color), rewards back up (white)
      st.spawn++
      if (st.spawn % 26 === 0) st.pk.push({ from: L, to: RE, p: 0, col: C, kind: 0, home: L })
      if (st.spawn % 26 === 13) st.pk.push({ from: Rn, to: RE, p: 0, col: A, kind: 0, home: Rn })
      const born = []
      st.pk = st.pk.filter(pk => {
        pk.p += 0.025
        const x = pk.from.x + (pk.to.x - pk.from.x) * pk.p, y = pk.from.y + 24 + (pk.to.y - 16 - pk.from.y - 24) * pk.p
        ctx.fillStyle = pk.col; ctx.beginPath(); ctx.arc(x, y, 2.6, 0, 7); ctx.fill()
        if (pk.p >= 1) {
          if (pk.kind === 0) {
            born.push({ from: RE, to: pk.home, p: 0, col: 'rgba(237,240,247,0.85)', kind: 1, home: pk.home })
            return false
          }
          if (pk.home === L) st.wts = st.wts.map(v => Math.min(0.95, Math.max(0.15, v + (Math.random() - 0.5) * 0.3)))
          else st.cfg = (st.cfg + 1) % 3
          return false
        }
        return true
      })
      st.pk.push(...born)
      break
    }

    // Weekly rolling reward loop: predict → truth → reward → update, MAE trending down
    case 'rewardloop': {
      if (!st.init) { st.init = 1; st.ang = -1.57; st.week = 137; st.mae = []; st.m = 0.62 }
      const cx = w * 0.36, cy = h * 0.46, rx = w * 0.24, ry = h * 0.3
      const stations = [
        { a: -1.57, l: 'PREDICT', col: C },
        { a: 0, l: 'TRUTH T+1', col: '#EDF0F7' },
        { a: 1.57, l: 'REWARD · MAE', col: A },
        { a: 3.14, l: 'UPDATE', col: '#8ce0a0' },
      ]
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.stroke()
      stations.forEach(s2 => {
        const x = cx + Math.cos(s2.a) * rx, y = cy + Math.sin(s2.a) * ry
        node(ctx, x, y, 6, s2.col, 'rgba(7,10,20,0.9)')
        mono(ctx, s2.l, x - 24, y + (Math.sin(s2.a) > 0.5 ? 24 : -14), 'rgba(138,147,168,0.85)', 8)
      })
      st.ang += 0.022
      const dx = cx + Math.cos(st.ang) * rx, dy = cy + Math.sin(st.ang) * ry
      ctx.fillStyle = A; ctx.beginPath(); ctx.arc(dx, dy, 4.5, 0, 7); ctx.fill()
      ctx.strokeStyle = 'rgba(224,168,92,0.25)'; ctx.beginPath(); ctx.arc(dx, dy, 9, 0, 7); ctx.stroke()
      if (st.ang > 4.71) { st.ang -= 6.283; st.week = st.week >= 260 ? 1 : st.week + 1; st.m = Math.max(0.18, st.m - 0.012 + (Math.random() - 0.4) * 0.02); st.mae.push(st.m); if (st.mae.length > 40) st.mae.shift() }
      ctx.fillStyle = 'rgba(224,168,92,0.9)'; ctx.font = "bold 15px 'JetBrains Mono'"; ctx.textAlign = 'center'
      ctx.fillText('LOOP ' + st.week + ' / 260', cx, cy + 5); ctx.textAlign = 'start'
      // MAE sparkline
      const sx0 = w * 0.68, sw = w * 0.26, sy0 = h * 0.24, sh = h * 0.42
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.strokeRect(sx0, sy0, sw, sh)
      mono(ctx, 'MAE OVER TIME ↓', sx0, sy0 - 8, 'rgba(111,211,232,0.7)', 9)
      if (st.mae.length > 1) {
        ctx.strokeStyle = C; ctx.lineWidth = 1.5; ctx.beginPath()
        st.mae.forEach((v, i) => {
          const x = sx0 + 4 + (sw - 8) * i / 39, y = sy0 + 6 + (sh - 12) * v
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
        })
        ctx.stroke()
      }
      mono(ctx, 'PREDICT → WAIT → SCORE → UPDATE · 5 YEARS', w * 0.06, h * 0.95, 'rgba(138,147,168,0.8)', 9)
      break
    }

    // Merton/KMV: free public inputs → structural solver → Distance-to-Default
    case 'merton': {
      if (!st.init) { st.init = 1; st.tick = 0; st.co = 0; st.dd = 0.6 }
      const cos = ['AAPL', 'JPM', 'XOM', 'MSFT']
      st.tick++; if (st.tick % 160 === 0) { st.co = (st.co + 1) % 4; st.dd = 0.35 + Math.random() * 0.5 }
      const inputs = [
        { y: h * 0.2, l: 'EQUITY σ · YAHOO/STOOQ', col: C },
        { y: h * 0.5, l: 'DEBT · SEC EDGAR', col: A },
        { y: h * 0.8, l: 'RATE r · FRED', col: '#EDF0F7' },
      ]
      inputs.forEach((inp, k) => {
        mono(ctx, inp.l, w * 0.05, inp.y - 14, 'rgba(138,147,168,0.7)', 8)
        ctx.strokeStyle = inp.col; ctx.lineWidth = 1.3; ctx.beginPath()
        for (let x = 0; x <= w * 0.22; x += 4) {
          const y = inp.y + (k === 0 ? Math.sin(x * 0.09 + t * 0.06) * 7 : k === 1 ? (Math.floor(x / 18) % 2 ? -4 : 4) : Math.sin(x * 0.02 + t * 0.01) * 2)
          x === 0 ? ctx.moveTo(w * 0.05 + x, y) : ctx.lineTo(w * 0.05 + x, y)
        }
        ctx.stroke()
        // feed dots into solver
        ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(w * 0.29, inp.y); ctx.lineTo(w * 0.42, h * 0.5); ctx.stroke()
        const q = (t * 0.012 + k * 0.33) % 1
        const px = w * 0.29 + (w * 0.42 - w * 0.29) * q, py = inp.y + (h * 0.5 - inp.y) * q
        ctx.fillStyle = inp.col; ctx.beginPath(); ctx.arc(px, py, 2.4, 0, 7); ctx.fill()
      })
      // solver box with iteration spinner
      ctx.strokeStyle = 'rgba(224,168,92,0.6)'; ctx.lineWidth = 1.4; rr(ctx, w * 0.42, h * 0.34, w * 0.2, h * 0.32, 8); ctx.stroke()
      mono(ctx, 'MERTON / KMV', w * 0.445, h * 0.44, 'rgba(224,168,92,0.9)', 10)
      mono(ctx, 'ITERATIVE SOLVE', w * 0.44, h * 0.52, 'rgba(138,147,168,0.6)', 8)
      const sp = t * 0.1
      ctx.strokeStyle = C; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w * 0.52, h * 0.59, 6, sp, sp + 4.2); ctx.stroke()
      // DD gauge
      const gx = w * 0.82, gy = h * 0.52, gr = Math.min(w, h) * 0.2
      ctx.strokeStyle = 'rgba(138,147,168,0.3)'; ctx.lineWidth = 6
      ctx.beginPath(); ctx.arc(gx, gy, gr, 3.14, 0); ctx.stroke()
      ctx.strokeStyle = A; ctx.beginPath(); ctx.arc(gx, gy, gr, 3.14, 3.14 + 3.14 * st.dd); ctx.stroke()
      const na = 3.14 + 3.14 * st.dd
      ctx.strokeStyle = '#EDF0F7'; ctx.lineWidth = 1.6
      ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(na) * (gr - 8), gy + Math.sin(na) * (gr - 8)); ctx.stroke()
      mono(ctx, 'DISTANCE-TO-DEFAULT', gx - 52, gy + 20, 'rgba(138,147,168,0.8)', 8)
      ctx.fillStyle = 'rgba(224,168,92,0.95)'; ctx.font = "bold 13px 'JetBrains Mono'"; ctx.textAlign = 'center'
      ctx.fillText(cos[st.co], gx, gy - 10); ctx.textAlign = 'start'
      mono(ctx, 'IMPLIED SPREAD · WEEKLY · $0 DATA BUDGET', w * 0.05, h * 0.95, 'rgba(111,211,232,0.7)', 9)
      break
    }

    // Contamination control: 5-year window split at the training cutoff
    case 'cutoff': {
      if (!st.init) { st.init = 1; st.scan = 0 }
      const bx = w * 0.07, bw = w * 0.86, by = h * 0.3, bh = 26
      const split = 0.7
      // pre-cutoff — hatched risk zone
      ctx.fillStyle = 'rgba(111,211,232,0.08)'; ctx.fillRect(bx, by, bw * split, bh)
      ctx.strokeStyle = 'rgba(111,211,232,0.25)'; ctx.lineWidth = 1
      for (let x = 0; x < bw * split; x += 9) { ctx.beginPath(); ctx.moveTo(bx + x, by + bh); ctx.lineTo(bx + x + 6, by); ctx.stroke() }
      // post-cutoff — clean glow
      const g2 = 0.15 + Math.abs(Math.sin(t * 0.04)) * 0.15
      ctx.fillStyle = 'rgba(224,168,92,' + g2 + ')'; ctx.fillRect(bx + bw * split, by, bw * (1 - split), bh)
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.strokeRect(bx, by, bw, bh)
      // cutoff marker
      ctx.strokeStyle = R; ctx.lineWidth = 2
      ctx.beginPath(); ctx.moveTo(bx + bw * split, by - 14); ctx.lineTo(bx + bw * split, by + bh + 14); ctx.stroke()
      mono(ctx, 'TRAINING CUTOFF · JAN 2025', bx + bw * split - 66, by - 20, 'rgba(200,90,106,0.9)', 8)
      mono(ctx, 'PRE-CUTOFF · ~182 LOOPS · CONTAMINATION RISK', bx, by + bh + 18, 'rgba(111,211,232,0.7)', 8)
      mono(ctx, '~78 NOVEL', bx + bw * split + 8, by + bh + 18, 'rgba(224,168,92,0.85)', 8)
      // scanner sweep
      st.scan = (st.scan + 0.004) % 1
      const sx = bx + bw * st.scan
      ctx.strokeStyle = 'rgba(237,240,247,0.5)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(sx, by - 4); ctx.lineTo(sx, by + bh + 4); ctx.stroke()
      // improvement slopes, reported separately
      const py = h * 0.82, ph3 = h * 0.22
      mono(ctx, 'MAE TREND — REPORTED SEPARATELY', bx, h * 0.56, 'rgba(138,147,168,0.7)', 8)
      ctx.strokeStyle = C; ctx.lineWidth = 1.6; ctx.beginPath()
      for (let q = 0; q <= 1; q += 0.04) {
        const x = bx + bw * split * q, y = py - ph3 * (0.55 - q * 0.08 + Math.sin(q * 20 + t * 0.03) * 0.05)
        q === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.strokeStyle = A; ctx.beginPath()
      for (let q = 0; q <= 1; q += 0.04) {
        const x = bx + bw * split + bw * (1 - split) * q, y = py - ph3 * (0.5 - q * 0.3 + Math.sin(q * 14 + t * 0.03) * 0.04)
        q === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
      mono(ctx, 'FLAT = MEMORIZED', bx + 6, py + 14, 'rgba(111,211,232,0.6)', 8)
      mono(ctx, 'IMPROVING = LEARNING', bx + bw * split + 6, py + 14, 'rgba(224,168,92,0.8)', 8)
      break
    }

    // Econ regression: coefficient bars with signs and significance
    case 'econreg': {
      if (!st.init) { st.init = 1; st.grow = 0 }
      st.grow = Math.min(1, st.grow + 0.015)
      const coefs = [
        { l: 'INVESTMENT', v: 0.45, sig: false },
        { l: 'HUMAN CAPITAL', v: -0.8, sig: true },
        { l: 'POP GROWTH', v: 0.3, sig: false },
        { l: 'JAPAN DUMMY', v: -0.08, sig: false },
        { l: 'JPN × POPGROWTH', v: -0.6, sig: true },
      ]
      const zero = w * 0.52, span = w * 0.3
      ctx.strokeStyle = 'rgba(237,240,247,0.25)'; ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(zero, h * 0.08); ctx.lineTo(zero, h * 0.78); ctx.stroke()
      mono(ctx, '0', zero - 3, h * 0.85, 'rgba(138,147,168,0.6)', 9)
      coefs.forEach((c2, i) => {
        const y = h * (0.14 + i * 0.14), bh2 = 13
        const v = c2.v * st.grow
        const x0 = v >= 0 ? zero : zero + span * v, bw2 = Math.abs(span * v)
        ctx.fillStyle = v >= 0 ? 'rgba(111,211,232,0.6)' : 'rgba(200,90,106,0.65)'
        ctx.fillRect(x0, y - bh2 / 2, bw2, bh2)
        // whisker
        const wx = zero + span * v
        ctx.strokeStyle = 'rgba(237,240,247,0.4)'
        ctx.beginPath(); ctx.moveTo(wx - 12, y); ctx.lineTo(wx + 12, y); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(wx - 12, y - 4); ctx.lineTo(wx - 12, y + 4); ctx.moveTo(wx + 12, y - 4); ctx.lineTo(wx + 12, y + 4); ctx.stroke()
        mono(ctx, c2.l, w * 0.05, y + 3, 'rgba(237,240,247,0.75)', 8)
        if (c2.sig) {
          const pa = 0.5 + Math.abs(Math.sin(t * 0.08 + i)) * 0.5
          ctx.fillStyle = 'rgba(224,168,92,' + pa + ')'; ctx.font = "bold 12px 'JetBrains Mono'"
          ctx.fillText('*', wx + (v >= 0 ? 16 : -22), y + 4)
        }
      })
      mono(ctx, 'OLS · ROBUST SE · N = 8 DECADE-OBS · PWT 11.0', w * 0.05, h * 0.95, 'rgba(138,147,168,0.8)', 9)
      break
    }

    // Demographic penalty: Japan's working-age decline vs Korea, decade by decade
    case 'demog': {
      if (!st.init) { st.init = 1; st.pulse = 0 }
      const decades = ['80s', '90s', '00s', '10s']
      const kor = [0.62, 0.72, 0.8, 0.84], jpn = [0.78, 0.76, 0.66, 0.52]
      const bx0 = w * 0.08, gw2 = w * 0.62, by2 = h * 0.72, maxH = h * 0.5
      decades.forEach((d, i) => {
        const gx = bx0 + i * (gw2 / 4)
        const kh = maxH * kor[i] * (0.96 + Math.sin(t * 0.03 + i) * 0.04)
        const jh = maxH * jpn[i] * (0.96 + Math.sin(t * 0.03 + i + 2) * 0.04)
        ctx.fillStyle = 'rgba(111,211,232,0.6)'; ctx.fillRect(gx, by2 - kh, 18, kh)
        ctx.fillStyle = 'rgba(224,168,92,0.55)'; ctx.fillRect(gx + 24, by2 - jh, 18, jh)
        mono(ctx, d, gx + 10, by2 + 16, 'rgba(138,147,168,0.7)', 8)
        if (i === 3) {
          st.pulse = (st.pulse + 0.02) % 1
          ctx.strokeStyle = 'rgba(200,90,106,' + (1 - st.pulse) + ')'; ctx.lineWidth = 1.5
          ctx.strokeRect(gx + 24 - st.pulse * 6, by2 - jh - st.pulse * 6, 18 + st.pulse * 12, jh + st.pulse * 6)
          mono(ctx, '−25%', gx + 20, by2 - jh - 12, 'rgba(200,90,106,0.9)', 9)
        }
      })
      ctx.fillStyle = 'rgba(111,211,232,0.8)'; ctx.fillRect(w * 0.76, h * 0.16, 10, 10)
      mono(ctx, 'KOREA', w * 0.79, h * 0.2, 'rgba(237,240,247,0.75)', 9)
      ctx.fillStyle = 'rgba(224,168,92,0.75)'; ctx.fillRect(w * 0.76, h * 0.26, 10, 10)
      mono(ctx, 'JAPAN', w * 0.79, h * 0.3, 'rgba(237,240,247,0.75)', 9)
      mono(ctx, 'WORKING-AGE SHARE', w * 0.76, h * 0.42, 'rgba(138,147,168,0.6)', 8)
      mono(ctx, 'ADAPT EARLY: PARTICIPATION · IMMIGRATION · PRODUCTIVITY', w * 0.08, h * 0.95, 'rgba(138,147,168,0.8)', 8)
      mono(ctx, 'JPN × POPGROWTH < 0 — DECLINE HITS JAPAN HARDER', w * 0.08, h * 0.1, 'rgba(224,168,92,0.7)', 9)
      break
    }

    // The Dispatch: broadcast tower transmitting mail packets to subscriber nodes
    case 'beacon': {
      if (!st.init) {
        st.init = 1; st.rings = []; st.mail = []; st.spawn = 0
        st.subs = Array.from({ length: 6 }, (_, i) => ({ x: 0.52 + (i % 3) * 0.17, y: 0.24 + Math.floor(i / 3) * 0.42, lit: 0 }))
      }
      const tx = w * 0.16, tyTop = h * 0.18, tyBase = h * 0.82
      // mast
      ctx.strokeStyle = 'rgba(224,168,92,0.8)'; ctx.lineWidth = 1.6
      ctx.beginPath(); ctx.moveTo(tx, tyBase); ctx.lineTo(tx, tyTop); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(tx - 14, tyBase); ctx.lineTo(tx, h * 0.5); ctx.moveTo(tx + 14, tyBase); ctx.lineTo(tx, h * 0.5); ctx.stroke()
      // crossbars
      for (let i = 0; i < 3; i++) {
        const y = h * (0.56 + i * 0.09), s2 = 10 - i * 2.5
        ctx.beginPath(); ctx.moveTo(tx - s2, y); ctx.lineTo(tx + s2, y); ctx.stroke()
      }
      // blinking tip
      const tip = Math.sin(t * 0.15) > 0
      ctx.fillStyle = tip ? '#c05a68' : 'rgba(200,90,106,0.25)'
      ctx.beginPath(); ctx.arc(tx, tyTop, 3.5, 0, 7); ctx.fill()
      // expanding signal rings
      if (t % 40 === 0) st.rings.push({ r: 6, a: 0.6 })
      st.rings = st.rings.filter(rg => {
        rg.r += 1.1; rg.a -= 0.008
        if (rg.a <= 0) return false
        ctx.strokeStyle = 'rgba(224,168,92,' + rg.a + ')'; ctx.lineWidth = 1.2
        ctx.beginPath(); ctx.arc(tx, tyTop, rg.r, -1.2, 1.2); ctx.stroke()
        return true
      })
      // subscriber inbox nodes
      st.subs.forEach(sb => {
        sb.lit = Math.max(0, sb.lit - 0.015)
        const x = sb.x * w, y = sb.y * h
        ctx.strokeStyle = 'rgba(111,211,232,' + (0.35 + sb.lit * 0.65) + ')'; ctx.lineWidth = 1.3
        ctx.strokeRect(x - 11, y - 8, 22, 16)
        ctx.beginPath(); ctx.moveTo(x - 11, y - 8); ctx.lineTo(x, y + 1); ctx.lineTo(x + 11, y - 8); ctx.stroke()
        if (sb.lit > 0.5) {
          ctx.strokeStyle = 'rgba(111,211,232,' + sb.lit * 0.4 + ')'
          ctx.beginPath(); ctx.arc(x, y, 17 + (1 - sb.lit) * 10, 0, 7); ctx.stroke()
        }
      })
      // mail packets: tiny envelopes flying tower → subscriber
      st.spawn++
      if (st.spawn % 55 === 0) st.mail.push({ p: 0, sub: st.subs[Math.floor(Math.random() * st.subs.length)] })
      st.mail = st.mail.filter(ml => {
        ml.p += 0.016
        const x = tx + (ml.sub.x * w - tx) * ml.p
        const y = tyTop + (ml.sub.y * h - tyTop) * ml.p - Math.sin(ml.p * Math.PI) * 26
        ctx.strokeStyle = A; ctx.lineWidth = 1.1
        ctx.strokeRect(x - 6, y - 4, 12, 8)
        ctx.beginPath(); ctx.moveTo(x - 6, y - 4); ctx.lineTo(x, y + 1); ctx.lineTo(x + 6, y - 4); ctx.stroke()
        if (ml.p >= 1) { ml.sub.lit = 1; return false }
        return true
      })
      mono(ctx, 'BROADCASTING', tx - 34, tyBase + 16, 'rgba(224,168,92,0.6)', 8)
      mono(ctx, 'SUBSCRIBERS', w * 0.52, h * 0.92, 'rgba(138,147,168,0.6)', 8)
      break
    }

    // ==================== PERSONAL ====================
    case 'river': {
      if (!st.init) { st.init = 1; st.fish = []; st.spawn = 0 }
      const wy = h * 0.52
      ctx.fillStyle = 'rgba(111,211,232,0.08)'; ctx.fillRect(0, wy, w, h - wy)
      ctx.strokeStyle = 'rgba(111,211,232,0.4)'; ctx.lineWidth = 1.5
      for (let l = 0; l < 3; l++) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 6) { const y = wy + l * 9 + Math.sin(x * 0.03 + t * 0.05 + l) * 4; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
        ctx.stroke()
      }
      st.spawn++; if (st.spawn % 55 === 0) st.fish.push({ x: Math.random() * w * 0.7 + w * 0.15, p: 0, dir: Math.random() < 0.5 ? 1 : -1, span: 55 + Math.random() * 45 })
      st.fish = st.fish.filter(f => {
        f.p += 0.018; if (f.p >= 1) return false
        const arc = Math.sin(f.p * Math.PI), fx = f.x + f.dir * f.span * (f.p - 0.5), fy = wy - arc * 62
        if (f.p < 0.1 || f.p > 0.9) {
          ctx.strokeStyle = 'rgba(111,211,232,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath()
          ctx.arc(f.p < 0.5 ? f.x - f.dir * f.span * 0.4 : f.x + f.dir * f.span * 0.4, wy, 5 + arc * 4, 3.14, 0, true); ctx.stroke()
        }
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(f.dir * (f.p - 0.5) * 1.4)
        ctx.fillStyle = A; ctx.beginPath(); ctx.ellipse(0, 0, 9, 4.2, 0, 0, 7); ctx.fill()
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-15, -4); ctx.lineTo(-15, 4); ctx.closePath(); ctx.fill(); ctx.restore()
        return true
      })
      break
    }

    case 'peaks': {
      if (!st.init) { st.init = 1; st.lx = [w * 0.15, w * 0.55] }
      const ridge = h * 0.55, lakeTop = h * 0.58, landTop = h * 0.74
      ctx.fillStyle = 'rgba(237,240,247,0.85)'; ctx.beginPath(); ctx.arc(w * 0.82, h * 0.18, 11, 0, 7); ctx.fill()
      ctx.fillStyle = '#1a2540'; mtnRange(ctx, ridge, w, h * 0.42, 0.5)
      ctx.fillStyle = '#101728'; mtnRange(ctx, ridge + 10, w, h * 0.28, 2.3)
      // alpine lake
      ctx.fillStyle = 'rgba(111,211,232,0.12)'; ctx.fillRect(0, lakeTop, w, landTop - lakeTop)
      ctx.strokeStyle = 'rgba(111,211,232,0.3)'; ctx.lineWidth = 1
      for (let i = 0; i < 2; i++) {
        ctx.beginPath()
        for (let x = 0; x <= w; x += 8) { const y = lakeTop + 5 + i * 6 + Math.sin(x * 0.04 + t * 0.04) * 2; x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y) }
        ctx.stroke()
      }
      // solid foreground meadow — the llamas walk HERE, not on the lake
      ctx.fillStyle = '#111a2e'
      ctx.beginPath(); ctx.moveTo(0, landTop)
      ctx.quadraticCurveTo(w * 0.3, landTop - 6, w * 0.6, landTop + 2)
      ctx.quadraticCurveTo(w * 0.85, landTop + 8, w, landTop)
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath(); ctx.fill()
      // grass tufts
      ctx.strokeStyle = 'rgba(111,232,160,0.18)'; ctx.lineWidth = 1
      for (let i = 0; i < 9; i++) {
        const gx = (i * 0.117 + 0.03) * w, gy = landTop + 14 + (i % 3) * 8
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx - 2, gy - 5); ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 5); ctx.stroke()
      }
      st.lx = st.lx.map(x => { x += 0.35; return x > w + 30 ? -30 : x })
      st.lx.forEach((x, i) => llama(ctx, x, h * 0.93, t + i * 40, '#04070e'))
      break
    }

    case 'cosmos': {
      if (!st.init) { st.init = 1; st.stars = Array.from({ length: 55 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.2 + 0.3, ph: Math.random() * 6 })); st.shoot = null; st.sc = 0 }
      st.stars.forEach(sr => {
        const a = 0.4 + 0.6 * Math.abs(Math.sin(sr.ph + t * 0.03))
        ctx.fillStyle = 'rgba(220,228,244,' + a + ')'; ctx.beginPath(); ctx.arc(sr.x * w, sr.y * h, sr.r, 0, 7); ctx.fill()
      })
      ctx.fillStyle = 'rgba(224,168,92,0.5)'; ctx.beginPath(); ctx.arc(w * 0.76, h * 0.32, 15, 0, 7); ctx.fill()
      ctx.strokeStyle = 'rgba(224,168,92,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(w * 0.76, h * 0.32, 26, 8, 0.5, 0, 7); ctx.stroke()
      st.sc++; if (!st.shoot && st.sc % 130 === 0) st.shoot = { x: Math.random() * w * 0.5, y: Math.random() * h * 0.4, p: 0 }
      if (st.shoot) {
        st.shoot.p += 0.03
        const sx = st.shoot.x + st.shoot.p * w * 0.5, sy = st.shoot.y + st.shoot.p * h * 0.3
        const g = ctx.createLinearGradient(sx - 44, sy - 26, sx, sy)
        g.addColorStop(0, 'rgba(111,211,232,0)'); g.addColorStop(1, 'rgba(111,211,232,0.9)')
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(sx - 44, sy - 26); ctx.lineTo(sx, sy); ctx.stroke()
        if (st.shoot.p >= 1) st.shoot = null
      }
      break
    }

    case 'hoops': {
      if (!st.init) { st.init = 1; st.p = 0 }
      st.p += 0.012; if (st.p >= 1) st.p = 0
      const hx = w * 0.82, hy = h * 0.34
      ctx.strokeStyle = A; ctx.lineWidth = 3; ctx.strokeRect(hx, hy - 26, 3, 20)
      ctx.beginPath(); ctx.ellipse(hx - 16, hy, 14, 4, 0, 0, 7); ctx.stroke()
      ctx.strokeStyle = 'rgba(237,240,247,0.35)'; ctx.lineWidth = 1
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(hx - 16 + i * 4, hy); ctx.lineTo(hx - 16 + i * 2, hy + 14); ctx.stroke() }
      const bx = w * 0.14 + (hx - 16 - w * 0.14) * st.p, by = h * 0.72 - Math.sin(st.p * Math.PI) * h * 0.52
      ctx.fillStyle = A; ctx.beginPath(); ctx.arc(bx, by, 10, 0, 7); ctx.fill()
      ctx.strokeStyle = '#070A14'; ctx.lineWidth = 1.4
      ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.lineTo(bx + 10, by); ctx.moveTo(bx, by - 10); ctx.lineTo(bx, by + 10); ctx.stroke()
      break
    }

    // ==================== ALBUMS ====================
    case 'ballet': {
      for (let i = 0; i < 3; i++) {
        const bx = w * (0.24 + 0.26 * i), by = h * 0.66, spin = Math.sin(t * 0.05 + i * 2.1)
        ctx.fillStyle = 'rgba(224,168,92,0.85)'
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 15 * Math.abs(spin) - 4, by + 16); ctx.lineTo(bx + 15 * Math.abs(spin) + 4, by + 16); ctx.closePath(); ctx.fill()
        ctx.strokeStyle = '#EDE0D0'; ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx, by - 26); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(bx, by - 20); ctx.lineTo(bx + 11 * spin, by - 32); ctx.moveTo(bx, by - 20); ctx.lineTo(bx - 11 * spin, by - 32); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + 8, by + 18); ctx.moveTo(bx, by); ctx.lineTo(bx - 4, by + 18); ctx.stroke()
        ctx.beginPath(); ctx.arc(bx, by - 32, 5, 0, 7); ctx.fillStyle = '#EDE0D0'; ctx.fill()
      }
      break
    }

    case 'ascend': {
      if (!st.init) { st.init = 1; st.y = h }
      st.y -= 1.1; if (st.y < -34) st.y = h + 34
      const cx = w * 0.5, cy = st.y
      ctx.strokeStyle = 'rgba(111,211,232,0.22)'; ctx.lineWidth = 1
      for (let a = 0; a < 8; a++) { const ang = a / 8 * 6.28 + t * 0.01; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * 42, cy + Math.sin(ang) * 42); ctx.stroke() }
      ctx.fillStyle = A; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 12, cy - 12, 6, 0, 7); ctx.arc(cx + 12, cy - 12, 6, 0, 7); ctx.fill()
      ctx.fillStyle = '#070A14'; ctx.beginPath(); ctx.arc(cx - 5, cy - 2, 2, 0, 7); ctx.arc(cx + 5, cy - 2, 2, 0, 7); ctx.fill()
      for (let i = 0; i < 6; i++) {
        const sx = cx + Math.sin(t * 0.05 + i) * 52, sy = cy + 42 + i * 12
        ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(sx, sy, 2, 2)
      }
      break
    }

    case 'heart': {
      const beat = 1 + Math.sin(t * 0.13) * 0.09, cx = w * 0.5, cy = h * 0.5, sc = 20 * beat
      ctx.fillStyle = R; heartPath(ctx, cx, cy - sc * 0.15, sc); ctx.fill()
      ctx.strokeStyle = '#0b0d16'; ctx.lineWidth = 2.4
      ctx.beginPath(); ctx.moveTo(cx, cy - sc * 0.9); ctx.lineTo(cx - 5, cy - sc * 0.1); ctx.lineTo(cx + 5, cy + sc * 0.15); ctx.lineTo(cx - 2, cy + sc * 0.75); ctx.stroke()
      break
    }

    case 'pablo': {
      const words = ['GOSPEL', 'CHAOS', 'FAMILY', 'FAITH', 'FASHION']
      ctx.font = "bold 16px 'JetBrains Mono'"; ctx.fillStyle = A; ctx.textAlign = 'center'
      for (let i = 0; i < 5; i++) {
        const a = 0.25 + 0.75 * Math.abs(Math.sin(t * 0.03 - i * 0.6))
        ctx.globalAlpha = a; ctx.fillText(words[i], w / 2, h * 0.26 + i * (h * 0.14))
      }
      ctx.globalAlpha = 1; ctx.textAlign = 'start'
      break
    }

    case 'bully': {
      const cx = w * 0.5, cy = h * 0.5, jab = Math.sin(t * 0.2)
      ctx.strokeStyle = '#EDF0F7'; ctx.lineWidth = 4; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 16); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy - 22, 9, 0, 7); ctx.fillStyle = '#EDF0F7'; ctx.fill()
      ctx.strokeStyle = '#EDF0F7'
      ctx.beginPath(); ctx.moveTo(cx, cy + 16); ctx.lineTo(cx + 9, cy + 32); ctx.moveTo(cx, cy + 16); ctx.lineTo(cx - 9, cy + 32); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx + 14 + jab * 10, cy - 2); ctx.moveTo(cx, cy - 6); ctx.lineTo(cx - 14 - jab * 10, cy - 2); ctx.stroke()
      ctx.fillStyle = A
      ctx.beginPath(); ctx.arc(cx + 16 + jab * 10, cy - 2, 7, 0, 7); ctx.fill()
      ctx.beginPath(); ctx.arc(cx - 16 - jab * 10, cy - 2, 7, 0, 7); ctx.fill()
      ctx.lineCap = 'butt'
      break
    }
  }
}

// ===================================================================
// Hook: one global loop that rescans canvases each frame
// ===================================================================
export function useSceneLoop() {
  useEffect(() => {
    const DPR = Math.min(window.devicePixelRatio || 1, 2)
    const states = new WeakMap()
    let t = 0, raf
    const loop = () => {
      t += 1
      const vh = window.innerHeight
      document.querySelectorAll('canvas[data-scene]').forEach(cv => {
        const r = cv.getBoundingClientRect()
        if (r.bottom < -40 || r.top > vh + 40) return
        const w = cv.clientWidth, h = cv.clientHeight
        if (!w || !h) return
        if (cv.width !== Math.round(w * DPR) || cv.height !== Math.round(h * DPR)) {
          cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR)
        }
        const ctx = cv.getContext('2d')
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0)
        let all = states.get(cv)
        if (!all) { all = {}; states.set(cv, all) }
        const kind = cv.getAttribute('data-scene')
        if (!all[kind]) all[kind] = {}
        ctx.clearRect(0, 0, w, h)
        try { paintScene(kind, ctx, w, h, all[kind], t) } catch (e) { /* keep loop alive */ }
      })
      raf = requestAnimationFrame(loop)
    }
    loop()
    return () => cancelAnimationFrame(raf)
  }, [])
}
