import { useEffect, useRef, useState } from 'react'

const SAMPLE_FRAMES = 60

export function FPSMeter() {
  const [fps, setFps] = useState(0)
  const [minFps, setMinFps] = useState(0)
  const samples = useRef<number[]>([])
  const last = useRef(performance.now())
  const raf = useRef<number>(0)

  useEffect(() => {
    const tick = () => {
      const now = performance.now()
      const delta = now - last.current
      last.current = now
      if (delta > 0 && delta < 1000) {
        const instant = 1000 / delta
        samples.current.push(instant)
        if (samples.current.length > SAMPLE_FRAMES) samples.current.shift()
        const avg = samples.current.reduce((a, b) => a + b, 0) / samples.current.length
        setFps(Math.round(avg))
        if (samples.current.length === SAMPLE_FRAMES) {
          setMinFps(Math.round(Math.min(...samples.current)))
        }
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  const color = fps >= 55 ? 'text-green-400' : fps >= 30 ? 'text-yellow-400' : 'text-red-400'

  return (
    <div className={`font-mono text-xs ${color}`}>
      FPS {fps} (min {minFps || '-'})
    </div>
  )
}
