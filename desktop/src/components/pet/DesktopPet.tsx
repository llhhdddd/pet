import { useState, useEffect, useRef, useCallback } from 'react'

type PetMood = 'idle' | 'happy' | 'excited' | 'sleeping' | 'walking'
type PetAction = 'none' | 'bounce' | 'spin' | 'heart' | 'patted' | 'surprised'

function DesktopPet() {
  const [mood, setMood] = useState<PetMood>('idle')
  const [action, setAction] = useState<PetAction>('none')
  const [showSparkles, setShowSparkles] = useState(false)

  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, moved: false })
  const petRef = useRef<HTMLDivElement>(null)
  const wanderTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTauri = '__TAURI_INTERNALS__' in window

  // --- 触发动作 ---
  const triggerAction = useCallback((act: PetAction) => {
    setAction(act)
    if (act === 'bounce' || act === 'heart' || act === 'patted') setShowSparkles(true)
    setTimeout(() => { setAction('none'); setShowSparkles(false) }, act === 'spin' ? 800 : 600)
  }, [])

  const getPetFace = (): string => {
    switch (mood) {
      case 'happy': return '😸'
      case 'excited': return '😻'
      case 'sleeping': return '😴'
      case 'walking': return '🐱'
      default: return '🐱'
    }
  }

  const getPetAnimClass = (): string => {
    if (action === 'bounce') return 'animate-[bounce_0.5s_ease-out] scale-125'
    if (action === 'patted') return 'scale-90'
    if (action === 'heart') return 'scale-110 animate-[happyFloat_1s_ease-in-out_infinite]'
    if (action === 'spin') return 'animate-[spin_0.6s_ease-in-out]'
    if (mood === 'walking') return 'animate-[wiggle_0.5s_ease-in-out_infinite]'
    if (mood === 'sleeping') return 'animate-[sleepFloat_4s_ease-in-out_infinite]'
    if (mood === 'happy') return 'animate-[happyFloat_1.5s_ease-in-out_infinite]'
    return 'animate-[float_3s_ease-in-out_infinite]'
  }

  // --- 鼠标拖拽 ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { isDragging: true, startX: e.clientX, startY: e.clientY, moved: false }

    if (isTauri) {
      import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
        getCurrentWindow().startDragging()
      }).catch(() => {})
      return
    }

    // 浏览器模式: 手动拖拽
    const container = petRef.current?.parentElement
    if (!container) return
    const rect = container.getBoundingClientRect()
    const startLeft = rect.left
    const startTop = rect.top

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true
      container.style.left = (startLeft + dx) + 'px'
      container.style.top = (startTop + dy) + 'px'
      container.style.bottom = 'auto'
      container.style.right = 'auto'
    }
    const onMouseUp = () => {
      dragRef.current.isDragging = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      if (!dragRef.current.moved) {
        triggerAction('bounce')
        setMood('happy')
        setTimeout(() => setMood('idle'), 2000)
      }
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [isTauri, triggerAction])

  // --- 触摸拖拽 ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    dragRef.current = { isDragging: true, startX: touch.clientX, startY: touch.clientY, moved: false }

    const container = petRef.current?.parentElement
    if (!container || isTauri) return
    const rect = container.getBoundingClientRect()
    const startLeft = rect.left
    const startTop = rect.top

    const onTouchMove = (ev: TouchEvent) => {
      const t = ev.touches[0]
      const dx = t.clientX - dragRef.current.startX
      const dy = t.clientY - dragRef.current.startY
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) dragRef.current.moved = true
      container.style.left = (startLeft + dx) + 'px'
      container.style.top = (startTop + dy) + 'px'
      container.style.bottom = 'auto'
      container.style.right = 'auto'
    }
    const onTouchEnd = () => {
      dragRef.current.isDragging = false
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
      if (!dragRef.current.moved) {
        triggerAction('bounce')
        setMood('happy')
        setTimeout(() => setMood('idle'), 2000)
      }
    }
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
  }, [isTauri, triggerAction])

  // --- 右键摸头 ---
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    triggerAction('patted')
    setMood('happy')
    setTimeout(() => setMood('idle'), 2500)
  }, [triggerAction])

  // --- 边缘漫游 ---
  useEffect(() => {
    let active = true

    const doWander = async () => {
      if (!active) return
      setMood('walking')

      if (isTauri) {
        try {
          const { getCurrentWindow, PhysicalPosition } = await import('@tauri-apps/api/window')
          const win = getCurrentWindow()
          const sw = window.screen.width
          const sh = window.screen.height
          const pw = 200; const ph = 220

          const edge = Math.floor(Math.random() * 4)
          let tx: number, ty: number
          switch (edge) {
            case 0: tx = Math.random() * (sw - pw); ty = 0; break
            case 1: tx = sw - pw; ty = Math.random() * (sh - ph); break
            case 2: tx = Math.random() * (sw - pw); ty = sh - ph - 48; break
            default: tx = 0; ty = Math.random() * (sh - ph); break
          }
          await win.setPosition(new PhysicalPosition(Math.max(0, tx), Math.max(0, ty)))
        } catch { /* ignore */ }
      } else {
        const container = petRef.current?.parentElement
        if (container) {
          const maxX = window.innerWidth - 200
          const maxY = window.innerHeight - 220
          const tx = Math.random() * maxX
          const ty = Math.random() * maxY
          container.style.transition = 'left 3s ease-in-out, top 3s ease-in-out'
          container.style.left = tx + 'px'
          container.style.top = ty + 'px'
          container.style.bottom = 'auto'
          container.style.right = 'auto'
          setTimeout(() => { container.style.transition = '' }, 3000)
        }
      }

      setTimeout(() => { if (active) setMood('idle') }, 2500)
    }

    const schedule = () => {
      if (!active) return
      const delay = 8000 + Math.random() * 15000
      wanderTimer.current = setTimeout(() => { doWander().then(() => schedule()) }, delay)
    }

    // 首次漫游 5-10 秒后
    const init = setTimeout(() => { doWander().then(() => schedule()) }, 5000 + Math.random() * 5000)

    return () => { active = false; clearTimeout(init); if (wanderTimer.current) clearTimeout(wanderTimer.current) }
  }, [isTauri])

  // --- 定期心情变化 ---
  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.random()
      if (r < 0.12) { setMood('sleeping'); setTimeout(() => setMood('idle'), 5000) }
      else if (r < 0.22) { setMood('happy'); setTimeout(() => setMood('idle'), 2000) }
    }, 18000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      ref={petRef}
      className="absolute inset-0 flex items-center justify-center select-none"
      style={{ cursor: dragRef.current.isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onContextMenu={handleContextMenu}
    >
      {/* 睡觉 Zzz */}
      {mood === 'sleeping' && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-lg opacity-80 animate-[float_2s_ease-in-out_infinite]">
          💤
        </div>
      )}

      {/* 互动特效 */}
      {showSparkles && (
        <>
          <div className="absolute top-2 left-6 text-base animate-[popUp_0.6s_ease-out_forwards]">✨</div>
          <div className="absolute top-4 right-4 text-base animate-[popUp_0.6s_ease-out_0.15s_forwards]">💕</div>
          {action === 'patted' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xl animate-[popUp_0.8s_ease-out_forwards]">🫳</div>
          )}
        </>
      )}

      {/* 宠物主体 */}
      <div
        className={`relative transition-transform duration-300 ${getPetAnimClass()}`}
        style={{ fontSize: '96px', lineHeight: 1 }}
      >
        {/* 阴影 */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm transition-all duration-500"
          style={{
            transform: action === 'bounce' ? 'translate(-50%, 20px) scale(0.6)' : '',
          }}
        />

        {/* 宠物表情 */}
        <span className="relative z-10 block drop-shadow-lg select-none">
          {getPetFace()}
        </span>
      </div>

      {/* ❤️ 特效 */}
      {action === 'heart' && (
        <div className="absolute top-8 right-2 text-2xl animate-[popUp_0.8s_ease-out_forwards]">❤️</div>
      )}
    </div>
  )
}

export default DesktopPet
