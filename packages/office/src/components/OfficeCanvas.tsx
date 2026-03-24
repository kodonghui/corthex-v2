import { useEffect, useRef } from 'react'
import { Application, Graphics } from 'pixi.js'

export function OfficeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const app = new Application()

    const init = async () => {
      await app.init({
        background: '#1a1a2e',
        resizeTo: containerRef.current!,
      })
      containerRef.current!.appendChild(app.canvas)

      // Placeholder: draw a simple office floor
      const floor = new Graphics()
      floor.rect(50, 50, app.screen.width - 100, app.screen.height - 100)
      floor.fill({ color: 0x2d2d44 })
      floor.stroke({ color: 0x4a4a6a, width: 2 })
      app.stage.addChild(floor)
    }

    init()

    return () => {
      app.destroy(true)
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />
}
