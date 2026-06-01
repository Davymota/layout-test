import { useState, useRef, useLayoutEffect } from 'react'

// C1 — navbar de seções (ícones). Cada seção tem opções de texto que alimentam a C2.
const SECTIONS = [
  { id: 'square', label: 'Bloco', icon: <rect x="5" y="5" width="14" height="14" rx="2" />,
    options: ['Aparência', 'Espaçamento', 'Borda'] },
  { id: 'circle', label: 'Círculo', icon: <circle cx="12" cy="12" r="7" />,
    options: ['Raio', 'Preenchimento', 'Sombra'] },
  { id: 'text', label: 'Texto', icon: <><line x1="6" y1="8" x2="18" y2="8" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="6" y1="16" x2="13" y2="16" /></>,
    options: ['Fonte', 'Tamanho', 'Alinhamento', 'Cor'] },
  { id: 'image', label: 'Imagem', icon: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.6" /><path d="M5 17l4-4 3 3 3-3 4 4" /></>,
    options: ['Origem', 'Ajuste', 'Filtro'] },
  { id: 'grid', label: 'Grade', icon: <><rect x="4" y="4" width="6" height="6" /><rect x="14" y="4" width="6" height="6" /><rect x="4" y="14" width="6" height="6" /><rect x="14" y="14" width="6" height="6" /></>,
    options: ['Colunas', 'Gap', 'Alinhamento'] },
  { id: 'list', label: 'Lista', icon: <><circle cx="6" cy="7" r="1.4" /><line x1="10" y1="7" x2="19" y2="7" /><circle cx="6" cy="12" r="1.4" /><line x1="10" y1="12" x2="19" y2="12" /><circle cx="6" cy="17" r="1.4" /><line x1="10" y1="17" x2="19" y2="17" /></>,
    options: ['Marcador', 'Espaço', 'Ordem'] },
  { id: 'tune', label: 'Ajustes', icon: <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="12" r="2" /><circle cx="8" cy="17" r="2" /></>,
    options: ['Global', 'Colunas', 'Itens', 'Efeitos'] },
]

// colunas (superfície) editáveis na aba "Colunas"
const TARGETS = [
  { id: 'c1', label: 'C1 · Ícones' },
  { id: 'c2', label: 'C2 · Menu' },
  { id: 'c3', label: 'C3 · Central' },
  { id: 'c4', label: 'C4 · Cards' },
  { id: 'c5', label: 'C5 · Atalhos' },
]

// propriedades de superfície por coluna (aba "Colunas")
const PROPS = [
  { key: 'amt',     label: 'Intensidade da cor', min: 0, max: 100, unit: '%' },
  { key: 'opacity', label: 'Opacidade',          min: 0, max: 100, unit: '%' },
  { key: 'radius',  label: 'Raio dos cantos',    min: 0, max: 28,  unit: 'px' },
  { key: 'blur',    label: 'Desfoque',           min: 0, max: 24,  unit: 'px' },
  { key: 'border',  label: 'Espessura da borda', min: 0, max: 4,   unit: 'px' },
  { key: 'shadow',  label: 'Sombra',             min: 0, max: 40,  unit: 'px' },
  { key: 'padding', label: 'Recuo interno',      min: 0, max: 28,  unit: 'px' },
]

// colunas que têm "itens" internos editáveis (aba "Itens"); C3 não tem itens repetidos
const ITEM_TARGETS = [
  { id: 'c1', label: 'C1 · Ícones', kind: 'icon' },
  { id: 'c2', label: 'C2 · Opções', kind: 'nav' },
  { id: 'c4', label: 'C4 · Cards', kind: 'card' },
  { id: 'c5', label: 'C5 · Atalhos', kind: 'icon' },
]

// C5 — opções que adicionam cards na C4
const CARD_TYPES = [
  { id: 'note', label: 'Nota', icon: <><rect x="5" y="4" width="14" height="16" rx="2" /><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="13" x2="14" y2="13" /></> },
  { id: 'media', label: 'Mídia', icon: <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="M10 9l5 3-5 3z" /></> },
  { id: 'chart', label: 'Gráfico', icon: <><line x1="5" y1="19" x2="19" y2="19" /><rect x="7" y="11" width="3" height="6" /><rect x="13" y="7" width="3" height="10" /></> },
  { id: 'table', label: 'Tabela', icon: <><rect x="4" y="5" width="16" height="14" rx="1.5" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="12" y1="5" x2="12" y2="19" /></> },
  { id: 'quote', label: 'Citação', icon: <><path d="M8 7c-2 0-3 1.5-3 3.5S6.5 14 8 14" /><path d="M16 7c-2 0-3 1.5-3 3.5S14.5 14 16 14" /></> },
]

let uid = 0
const nextId = () => `i${++uid}`

export default function App() {
  const [dark, setDark] = useState(false)
  const [secId, setSecId] = useState(SECTIONS[0].id)   // seção ativa (C1)
  const [opt, setOpt] = useState(SECTIONS[0].options[0]) // opção ativa (C2 → C3)
  const [c4w, setC4w] = useState(320)
  const [resizing, setResizing] = useState(false)
  const [tab, setTab] = useState('c4')   // coluna ativa nas abas "Colunas"/"Itens"
  // superfície de cada coluna
  const [theme, setTheme] = useState({
    c1: { color: '#888888', amt: 0, opacity: 100, radius: 0,  blur: 0, border: 0, shadow: 0,  padding: 12, borderColor: null },
    c2: { color: '#888888', amt: 0, opacity: 0,   radius: 0,  blur: 0, border: 0, shadow: 0,  padding: 12, borderColor: null },
    c3: { color: '#888888', amt: 0, opacity: 72,  radius: 14, blur: 6, border: 1, shadow: 16, padding: 16, borderColor: null },
    c4: { color: '#888888', amt: 0, opacity: 72,  radius: 14, blur: 6, border: 1, shadow: 16, padding: 12, borderColor: null },
    c5: { color: '#888888', amt: 0, opacity: 0,   radius: 0,  blur: 0, border: 0, shadow: 0,  padding: 12, borderColor: null },
  })
  const setProp = (t, k, v) => setTheme((th) => ({ ...th, [t]: { ...th[t], [k]: v } }))
  // global (paleta + espaçamento)
  const [glob, setGlobState] = useState({ bg: null, ink: null, muted: null, line: null, gap: 12 })
  const setGlob = (k, v) => setGlobState((g) => ({ ...g, [k]: v }))
  // itens internos por coluna (estados não-selecionado/hover/selecionado)
  const [items, setItems] = useState({
    c1: { size: 40, icon: 20, radius: 11, border: 0, bgIdle: null, bgHover: null, bgSel: null, fgIdle: null, fgSel: null, bordSel: null },
    c2: { ipad: 9, radius: 10, border: 1, bgIdle: null, bgHover: null, bgSel: null, fgIdle: null, fgSel: null, bordSel: null, ind: null },
    c4: { titleBg: null, fgIdle: null },
    c5: { size: 40, icon: 20, radius: 11, border: 1, bgIdle: null, bgHover: null, bgSel: null, fgIdle: null, fgSel: null, bordSel: null, badgeBg: null, badgeFg: null },
  })
  const setItem = (t, k, v) => setItems((it) => ({ ...it, [t]: { ...it[t], [k]: v } }))
  // efeitos de movimento (globais)
  const [fx, setFxState] = useState({ hoverLift: 1, hoverScale: 1, pressScale: 0.92, iconScale: 1.08, tFast: 0.18, tMed: 0.32 })
  const setFx = (k, v) => setFxState((f) => ({ ...f, [k]: v }))
  // tokens do tema atual (fallback de exibição dos color pickers quando o valor é "auto")
  const tokens = dark
    ? { ink: '#f4f4f5', muted: '#6f6f74', line: '#2a2a2d', bg: '#131315', raised: '#1e1e21', hover: '#242427' }
    : { ink: '#1d1d20', muted: '#a6a6ac', line: '#e3e3e6', bg: '#ececed', raised: '#fbfbfc', hover: '#e6e6e8' }
  const [cards, setCards] = useState([
    { id: nextId(), type: 'note', label: 'Nota 1', h: 200, col: 0 },
    { id: nextId(), type: 'chart', label: 'Gráfico 1', h: 240, col: 0 },
  ])
  const drag = useRef(null)              // { id, offX, offY, w }
  const [dragId, setDragId] = useState(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const section = SECTIONS.find((s) => s.id === secId) ?? SECTIONS[0]

  // C1 → seleciona seção e ajusta a C2 para a 1ª opção dela
  const selectSection = (s) => { setSecId(s.id); setOpt(s.options[0]) }

  // colunas da C4 derivadas dos próprios cards (sem controles; nascem ao arrastar)
  const colVals = [...new Set(cards.map((c) => c.col))].sort((a, b) => a - b)

  // geometria do quadro de cards
  const GAP = 12, PAD = theme.c4.padding, MINCOL = 110
  const boardRef = useRef(null)
  const [boardW, setBoardW] = useState(296)
  useLayoutEffect(() => {
    const measure = () => { if (boardRef.current) setBoardW(boardRef.current.clientWidth) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [c4w, cards.length])

  // quantas colunas cabem na largura atual; abaixo disso elas empilham (colapso responsivo, não-destrutivo)
  const nCols = colVals.length || 1
  const fitCols = Math.max(1, Math.floor((boardW - PAD * 2 + GAP) / (MINCOL + GAP)))
  const dispCols = Math.min(nCols, fitCols)
  const colW = (boardW - PAD * 2 - GAP * (dispCols - 1)) / dispCols
  // coluna lógica → coluna exibida (quando colapsa, várias lógicas caem na mesma exibida)
  const dispOf = (ci) => Math.floor((ci * dispCols) / nCols)
  const layout = {}
  const colY = Array(dispCols).fill(PAD)
  colVals.forEach((cv, ci) => {
    const dc = dispOf(ci)
    cards.filter((c) => c.col === cv).forEach((c) => {
      layout[c.id] = { x: PAD + dc * (colW + GAP), y: colY[dc], w: colW }
      colY[dc] += c.h + GAP
    })
  })
  const boardH = Math.max(PAD * 2, ...colY.map((y) => y - GAP + PAD))

  // assinatura da disposição (por coluna, em ordem) → não re-renderiza sem mudança real
  const sigOf = (list) => {
    const order = [...new Set(list.map((c) => c.col))].sort((a, b) => a - b)
    return order.map((cv) => list.filter((c) => c.col === cv).map((c) => c.id).join('>')).join('|')
  }

  // remapeia col (fracionário → inteiro contíguo); colunas vazias somem
  const normalize = (list) => {
    const order = [...new Set(list.map((c) => c.col))].sort((a, b) => a - b)
    const map = new Map(order.map((v, i) => [v, i]))
    return list.map((c) => (map.get(c.col) === c.col ? c : { ...c, col: map.get(c.col) }))
  }

  // C5 → C4 (adiciona na coluna mais curta para equilibrar)
  const addCard = (t) =>
    setCards((cs) => {
      const n = cs.filter((c) => c.type === t.id).length + 1
      const cols = [...new Set(cs.map((c) => c.col))]
      let col = 0
      if (cols.length) {
        col = cols[0]
        cols.forEach((cv) => {
          if (cs.filter((c) => c.col === cv).length < cs.filter((c) => c.col === col).length) col = cv
        })
      }
      return [...cs, { id: nextId(), type: t.id, label: `${t.label} ${n}`, h: 180, col }]
    })
  const removeCard = (id) => setCards((cs) => normalize(cs.filter((c) => c.id !== id)))

  // recoloca o card arrastado por geometria (nada remonta; só muda o transform)
  const reorderAt = (cx, cy) => {
    const id = drag.current?.id
    if (!id || !boardRef.current) return
    const b = drag.current.board
    const bx = cx - b.left
    const by = cy - b.top + boardRef.current.scrollTop
    setCards((list) => {
      const cur = [...new Set(list.map((c) => c.col))].sort((p, q) => p - q)
      const nc = cur.length || 1
      const cw = Math.max(MINCOL, (boardW - PAD * 2 - GAP * (nc - 1)) / nc)
      const card = list.find((c) => c.id === id)
      if (!card) return list

      // coluna alvo (ou coluna nova nas calhas / bordas)
      let targetCol, isNew = false
      const unit = cw + GAP
      if (bx < PAD * 0.6) { targetCol = cur[0] - 0.5; isNew = true }
      else {
        const ci = Math.floor((bx - PAD) / unit)
        if (ci >= nc) { targetCol = cur[nc - 1] + 0.5; isNew = true }
        else if ((bx - PAD) - ci * unit > cw) { targetCol = cur[ci] + 0.5; isNew = true }
        else targetCol = cur[ci]
      }

      const next = list.filter((c) => c.id !== id)
      if (isNew) {
        if (card.col === targetCol && list.filter((c) => c.col === targetCol).length === 1) return list
        next.push({ ...card, col: targetCol })
      } else {
        const colCards = next.filter((c) => c.col === targetCol)
        let yAcc = PAD, insertK = colCards.length
        for (let k = 0; k < colCards.length; k++) {
          if (by < yAcc + colCards[k].h / 2) { insertK = k; break }
          yAcc += colCards[k].h + GAP
        }
        const before = colCards[insertK]
        if (before) next.splice(next.findIndex((c) => c.id === before.id), 0, { ...card, col: targetCol })
        else {
          let last = -1
          next.forEach((c, i) => { if (c.col === targetCol) last = i })
          next.splice(last + 1, 0, { ...card, col: targetCol })
        }
      }
      return sigOf(next) === sigOf(list) ? list : next
    })
  }

  // drag por ponteiro: clone flutuante + placeholder que desliza para o destino
  const onCardDown = (c) => (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    const rect = e.currentTarget.getBoundingClientRect()
    const board = boardRef.current.getBoundingClientRect()
    drag.current = {
      id: c.id, offX: e.clientX - rect.left, offY: e.clientY - rect.top,
      w: rect.width, board: { left: board.left, top: board.top },
    }
    setDragId(c.id)
    setPos({ x: e.clientX, y: e.clientY })
    document.body.style.cursor = 'grabbing'
    document.body.style.userSelect = 'none'
    const move = (ev) => { setPos({ x: ev.clientX, y: ev.clientY }); reorderAt(ev.clientX, ev.clientY) }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      drag.current = null
      setDragId(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      setCards((list) => normalize(list))
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const cardInner = (c) => (
    <>
      <div className="card-title">
        <span className="grip">⠿</span>
        <span>{c.label}</span>
        <button className="x" onPointerDown={(e) => e.stopPropagation()} onClick={() => removeCard(c.id)}>×</button>
      </div>
      <div className="card-fill muted">{Math.round(c.h)}px</div>
    </>
  )

  // redimensionar largura de coluna (C4)
  const startColResize = (setter, current, min, dir = 1) => (e) => {
    e.preventDefault()
    setResizing(true)
    const startX = e.clientX
    const startW = current
    const onMove = (ev) => setter(Math.max(min, startW + (ev.clientX - startX) * dir))
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
      setResizing(false)
    }
    document.body.style.cursor = 'col-resize'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  // redimensionar altura de card (C4)
  const startCardResize = (id, current) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    const startY = e.clientY
    const startH = current
    const onMove = (ev) => {
      const h = Math.max(80, startH + (ev.clientY - startY))
      setCards((cs) => cs.map((c) => (c.id === id ? { ...c, h } : c)))
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      document.body.style.cursor = ''
    }
    document.body.style.cursor = 'row-resize'
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  // --- helpers de controle (funções, não componentes: inputs não remontam) ---
  const rangeCtrl = (label, value, min, max, onChange, unit = 'px', step = 1, fmt = (x) => x) => (
    <div className="ctrl-row" key={label}>
      <label>{label} <span className="ctrl-val">{fmt(value)}{unit}</span></label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)} />
    </div>
  )
  const colorCtrl = (label, value, fallback, onChange, nullable = true) => (
    <div className="ctrl-row" key={label}>
      <label>{label} <span className="ctrl-val">{value ?? 'auto'}</span></label>
      <div className="color-row">
        <input type="color" value={value ?? fallback} onChange={(e) => onChange(e.target.value)} />
        {nullable && value != null && (
          <button className="reset" onClick={() => onChange(null)}>auto</button>
        )}
      </div>
    </div>
  )
  const tabsRow = (list) => (
    <div className="tabs">
      {list.map((t) => (
        <button key={t.id} className={`tab ${t.id === tab ? 'active' : ''}`} onClick={() => setTab(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )

  // --- aba Global ---
  const renderGlobal = () => (
    <div className="ctrl">
      {colorCtrl('Fundo do app', glob.bg, tokens.bg, (v) => setGlob('bg', v))}
      {colorCtrl('Cor do texto', glob.ink, tokens.ink, (v) => setGlob('ink', v))}
      {colorCtrl('Cor secundária', glob.muted, tokens.muted, (v) => setGlob('muted', v))}
      {colorCtrl('Cor das linhas', glob.line, tokens.line, (v) => setGlob('line', v))}
      {rangeCtrl('Espaço entre colunas', glob.gap, 0, 32, (v) => setGlob('gap', v))}
      <p className="muted">"auto" segue o tema claro/escuro. Uma cor fixa vale nos dois.</p>
    </div>
  )

  // --- aba Colunas (superfície) ---
  const renderColunas = () => {
    const tg = TARGETS.find((t) => t.id === tab) ?? TARGETS[0]
    const v = theme[tg.id]
    return (
      <div className="ctrl">
        {tabsRow(TARGETS)}
        {colorCtrl('Cor de fundo', v.color, v.color, (val) => setProp(tg.id, 'color', val), false)}
        {PROPS.map((p) => rangeCtrl(p.label, v[p.key], p.min, p.max, (val) => setProp(tg.id, p.key, val), p.unit))}
        {colorCtrl('Cor da borda', v.borderColor, tokens.line, (val) => setProp(tg.id, 'borderColor', val))}
        <p className="muted">Editando superfície: <strong>{tg.label}</strong>.</p>
      </div>
    )
  }

  // --- aba Itens (elementos internos) ---
  const renderItens = () => {
    const tg = ITEM_TARGETS.find((t) => t.id === tab) ?? ITEM_TARGETS[0]
    const id = tg.id
    const v = items[id]
    const set = (k) => (val) => setItem(id, k, val)
    return (
      <div className="ctrl">
        {tabsRow(ITEM_TARGETS)}
        {(tg.kind === 'icon') && <>
          {rangeCtrl('Tamanho do botão', v.size, 28, 56, set('size'))}
          {rangeCtrl('Tamanho do ícone', v.icon, 12, 32, set('icon'))}
          {rangeCtrl('Raio do item', v.radius, 0, 24, set('radius'))}
          {rangeCtrl('Espessura da borda', v.border, 0, 3, set('border'))}
          {colorCtrl('Fundo (normal)', v.bgIdle, tokens.bg, set('bgIdle'))}
          {colorCtrl('Fundo (hover)', v.bgHover, tokens.hover, set('bgHover'))}
          {colorCtrl('Fundo (selecionado)', v.bgSel, tokens.raised, set('bgSel'))}
          {colorCtrl('Ícone (normal)', v.fgIdle, tokens.ink, set('fgIdle'))}
          {colorCtrl('Ícone (selecionado)', v.fgSel, tokens.ink, set('fgSel'))}
          {colorCtrl('Borda (selecionado)', v.bordSel, tokens.line, set('bordSel'))}
          {id === 'c5' && <>
            {colorCtrl('Badge — fundo', v.badgeBg, tokens.ink, set('badgeBg'))}
            {colorCtrl('Badge — texto', v.badgeFg, tokens.bg, set('badgeFg'))}
          </>}
        </>}
        {(tg.kind === 'nav') && <>
          {rangeCtrl('Altura do item', v.ipad, 4, 20, set('ipad'))}
          {rangeCtrl('Raio do item', v.radius, 0, 20, set('radius'))}
          {rangeCtrl('Espessura da borda', v.border, 0, 3, set('border'))}
          {colorCtrl('Fundo (normal)', v.bgIdle, tokens.bg, set('bgIdle'))}
          {colorCtrl('Fundo (hover)', v.bgHover, tokens.hover, set('bgHover'))}
          {colorCtrl('Fundo (selecionado)', v.bgSel, tokens.raised, set('bgSel'))}
          {colorCtrl('Texto (normal)', v.fgIdle, tokens.ink, set('fgIdle'))}
          {colorCtrl('Texto (selecionado)', v.fgSel, tokens.ink, set('fgSel'))}
          {colorCtrl('Borda (selecionado)', v.bordSel, tokens.line, set('bordSel'))}
          {colorCtrl('Marca do ativo', v.ind, tokens.ink, set('ind'))}
        </>}
        {(tg.kind === 'card') && <>
          {colorCtrl('Fundo do título', v.titleBg, tokens.raised, set('titleBg'))}
          {colorCtrl('Texto do título', v.fgIdle, tokens.ink, set('fgIdle'))}
        </>}
        <p className="muted">Editando itens: <strong>{tg.label}</strong>.</p>
      </div>
    )
  }

  // --- aba Efeitos (movimento) ---
  const pct = (x) => Math.round(x * 100)
  const renderEfeitos = () => (
    <div className="ctrl">
      {rangeCtrl('Elevação no hover', fx.hoverLift, 0, 6, (v) => setFx('hoverLift', v))}
      {rangeCtrl('Escala no hover', fx.hoverScale, 1, 1.15, (v) => setFx('hoverScale', v), '%', 0.01, pct)}
      {rangeCtrl('Escala ao clicar', fx.pressScale, 0.85, 1, (v) => setFx('pressScale', v), '%', 0.01, pct)}
      {rangeCtrl('Escala do ícone (hover)', fx.iconScale, 1, 1.25, (v) => setFx('iconScale', v), '%', 0.01, pct)}
      {rangeCtrl('Velocidade rápida', fx.tFast, 0.05, 0.4, (v) => setFx('tFast', v), 's', 0.01, (x) => x.toFixed(2))}
      {rangeCtrl('Velocidade média', fx.tMed, 0.1, 0.7, (v) => setFx('tMed', v), 's', 0.01, (x) => x.toFixed(2))}
      <p className="muted">Vale para todas as microinterações.</p>
    </div>
  )

  const renderTune = () => {
    if (opt === 'Global') return renderGlobal()
    if (opt === 'Itens') return renderItens()
    if (opt === 'Efeitos') return renderEfeitos()
    return renderColunas()
  }

  // --- todas as vars → CSS, aplicadas ao vivo ---
  const themeVars = {}
  const px = (n) => `${n}px`
  // superfícies
  Object.entries(theme).forEach(([k, v]) => {
    themeVars[`--${k}-tint`] = v.color
    themeVars[`--${k}-amt`] = `${v.amt}%`
    themeVars[`--${k}-a`] = `${v.opacity}%`
    themeVars[`--${k}-rad`] = px(v.radius)
    themeVars[`--${k}-blur`] = px(v.blur)
    themeVars[`--${k}-bord`] = px(v.border)
    themeVars[`--${k}-shadow`] = px(v.shadow)
    themeVars[`--${k}-pad`] = px(v.padding)
    if (v.borderColor) themeVars[`--${k}-bordc`] = v.borderColor
  })
  // itens — ícones (C1/C5)
  ;['c1', 'c5'].forEach((k) => {
    const v = items[k]
    themeVars[`--${k}-isize`] = px(v.size)
    themeVars[`--${k}-iconsize`] = px(v.icon)
    themeVars[`--${k}-irad`] = px(v.radius)
    themeVars[`--${k}-ibord`] = px(v.border)
    if (v.bgIdle) themeVars[`--${k}-bg-idle`] = v.bgIdle
    if (v.bgHover) themeVars[`--${k}-bg-hover`] = v.bgHover
    if (v.bgSel) themeVars[`--${k}-bg-sel`] = v.bgSel
    if (v.fgIdle) themeVars[`--${k}-fg-idle`] = v.fgIdle
    if (v.fgSel) themeVars[`--${k}-fg-sel`] = v.fgSel
    if (v.bordSel) themeVars[`--${k}-bord-sel`] = v.bordSel
  })
  if (items.c5.badgeBg) themeVars['--c5-badge-bg'] = items.c5.badgeBg
  if (items.c5.badgeFg) themeVars['--c5-badge-fg'] = items.c5.badgeFg
  // itens — opções (C2)
  themeVars['--c2-ipad'] = px(items.c2.ipad)
  themeVars['--c2-irad'] = px(items.c2.radius)
  themeVars['--c2-ibord'] = px(items.c2.border)
  if (items.c2.bgIdle) themeVars['--c2-bg-idle'] = items.c2.bgIdle
  if (items.c2.bgHover) themeVars['--c2-bg-hover'] = items.c2.bgHover
  if (items.c2.bgSel) themeVars['--c2-bg-sel'] = items.c2.bgSel
  if (items.c2.fgIdle) themeVars['--c2-fg-idle'] = items.c2.fgIdle
  if (items.c2.fgSel) themeVars['--c2-fg-sel'] = items.c2.fgSel
  if (items.c2.bordSel) themeVars['--c2-bord-sel'] = items.c2.bordSel
  if (items.c2.ind) themeVars['--c2-ind'] = items.c2.ind
  // itens — cards (C4)
  if (items.c4.titleBg) themeVars['--c4-title-bg'] = items.c4.titleBg
  if (items.c4.fgIdle) themeVars['--c4-fg-idle'] = items.c4.fgIdle
  // efeitos
  themeVars['--t-fast'] = `${fx.tFast}s`
  themeVars['--t-med'] = `${fx.tMed}s`
  themeVars['--hover-lift'] = px(fx.hoverLift)
  themeVars['--hover-scale'] = fx.hoverScale
  themeVars['--press-scale'] = fx.pressScale
  themeVars['--icon-scale'] = fx.iconScale
  // global
  if (glob.bg) themeVars['--bg'] = glob.bg
  if (glob.ink) themeVars['--ink'] = glob.ink
  if (glob.muted) themeVars['--muted'] = glob.muted
  if (glob.line) themeVars['--line'] = glob.line
  themeVars['--gap'] = px(glob.gap)

  return (
    <div className={`app ${dark ? 'dark' : 'light'}`} style={themeVars}>
      {/* C1 — navbar de seções (fixa, não cresce) */}
      <nav className="rail">
        <button className="rail-btn" onClick={() => setDark((d) => !d)} title="Tema">
          {dark ? '☀' : '☾'}
        </button>
        <div className="rail-tools">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`rail-btn ${s.id === secId ? 'active' : ''}`}
              title={s.label}
              onClick={() => selectSection(s)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">{s.icon}</svg>
            </button>
          ))}
        </div>
      </nav>

      {/* C2 — navbar secundária: segue a C1, lista de opções de texto que trocam o meio */}
      <section className="subnav">
        <div className="subnav-title muted">{section.label}</div>
        {section.options.map((o) => (
          <button
            key={o}
            className={`nav-item ${o === opt ? 'active' : ''}`}
            onClick={() => setOpt(o)}
          >
            {o}
          </button>
        ))}
      </section>

      {/* C3 — central, flutuante; conteúdo definido pela opção da C2 */}
      <section className="mid">
        <header className="col-head">
          <span>{section.label} › {opt}</span>
          <span className="muted">flutuante</span>
        </header>
        <div className="mid-body">
          <h2 className="mid-h">{opt}</h2>
          {secId === 'tune' ? renderTune() : (
            <p className="muted">Conteúdo de “{section.label} › {opt}”. Selecione outra opção na coluna ao lado para trocar.</p>
          )}
        </div>
      </section>

      {/* C4 — superfície única; posições por transform (fluido); colunas nascem ao arrastar.
          Sem card aberto (nenhuma opção da C5 ativa) ela colapsa: não reserva largura. */}
      <section className={`zone side ${resizing ? 'resizing' : ''}`} style={{ width: cards.length ? c4w : 0, padding: cards.length ? undefined : 0 }}>
        {cards.length > 0 && <div className="resizer-x left" onPointerDown={startColResize(setC4w, c4w, 200, -1)} />}
        <div className="side-cols" ref={boardRef}>
          <div className="board" style={{ height: boardH }}>
            {cards.map((c) => {
              const L = layout[c.id]
              if (!L) return null
              return (
                <article
                  key={c.id}
                  data-id={c.id}
                  className={`card ${dragId === c.id ? 'placeholder' : ''}`}
                  style={{ width: L.w, height: c.h, transform: `translate(${L.x}px, ${L.y}px)` }}
                  onPointerDown={onCardDown(c)}
                >
                  {cardInner(c)}
                  <div className="resizer-y" onPointerDown={startCardResize(c.id, c.h)} />
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* C5 — rail de opções; cada uma adiciona um card na C4 (badge = quantos abertos) */}
      <aside className="edge">
        {CARD_TYPES.map((t) => {
          const count = cards.filter((c) => c.type === t.id).length
          return (
            <button
              key={t.id}
              className={`edge-btn ${count ? 'active' : ''}`}
              title={count ? `${t.label}: ${count} aberto(s)` : `Adicionar ${t.label}`}
              onClick={() => addCard(t)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">{t.icon}</svg>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          )
        })}
      </aside>

      {/* clone flutuante do card sendo arrastado */}
      {dragId && (() => {
        const c = cards.find((x) => x.id === dragId)
        if (!c) return null
        const d = drag.current
        return (
          <article
            className="card drag-clone"
            style={{
              height: c.h,
              width: colW,
              transform: `translate(${pos.x - (d?.offX || 0)}px, ${pos.y - (d?.offY || 0)}px) rotate(-2deg) scale(1.02)`,
            }}
          >
            {cardInner(c)}
          </article>
        )
      })()}
    </div>
  )
}
