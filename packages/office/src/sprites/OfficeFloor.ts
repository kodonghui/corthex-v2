import { Container, Graphics, Text, TextStyle } from 'pixi.js'

const GRID_SPACING = 60
const FLOOR_COLOR = 0x1a1a2e
const GRID_COLOR = 0x2a2a45
const BORDER_COLOR = 0x4a4a6a

const labelStyle = new TextStyle({
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  fill: 0x6b7280,
  fontWeight: 'bold',
})

export class OfficeFloor extends Container {
  private bg: Graphics
  private floorWidth: number
  private floorHeight: number

  constructor(width: number, height: number) {
    super()
    this.floorWidth = width
    this.floorHeight = height

    this.bg = new Graphics()
    this.draw()
    this.addChild(this.bg)
  }

  private draw(): void {
    const w = this.floorWidth
    const h = this.floorHeight

    this.bg.clear()

    // Floor background
    this.bg.rect(0, 0, w, h)
    this.bg.fill({ color: FLOOR_COLOR })

    // Grid lines (subtle)
    for (let x = GRID_SPACING; x < w; x += GRID_SPACING) {
      this.bg.moveTo(x, 0)
      this.bg.lineTo(x, h)
      this.bg.stroke({ color: GRID_COLOR, width: 1, alpha: 0.3 })
    }
    for (let y = GRID_SPACING; y < h; y += GRID_SPACING) {
      this.bg.moveTo(0, y)
      this.bg.lineTo(w, y)
      this.bg.stroke({ color: GRID_COLOR, width: 1, alpha: 0.3 })
    }

    // Border
    this.bg.rect(0, 0, w, h)
    this.bg.stroke({ color: BORDER_COLOR, width: 2 })
  }

  /** Add a department zone label at a position */
  addDepartmentLabel(name: string, x: number, y: number): void {
    const label = new Text({ text: name, style: labelStyle })
    label.anchor.set(0.5)
    label.x = x
    label.y = y
    this.addChild(label)
  }

  resize(width: number, height: number): void {
    this.floorWidth = width
    this.floorHeight = height
    this.draw()
  }
}
