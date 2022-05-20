/* ------------------------------------------------------ */
/*     Camera controls current view position and scale    */
/* ------------------------------------------------------ */

import { createEl } from '../../utilities/dom'
import { Keyboard } from '../../utilities/Keyboard'
import { Ticker } from '../../utilities/Ticker'
import { Visualization } from '../Visualization/Visualization'

export interface CameraState {
    position: {
        x: number
        y: number
    }
    // scale: number
}

export class Camera {
    element: HTMLElement
    state: CameraState

    private _tickerId: string
    // panzoom: PanzoomObject
    private isDragging: boolean = false
    private prevMouse: { x: number; y: number } = { x: 0, y: 0 }

    vis: Visualization

    constructor(vis: Visualization) {
        this.element = createEl('div', 'camera')

        this.vis = vis

        this.state = {
            position: {
                x: 0,
                y: 0,
            },
            // scale: 1,
        }

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))

        vis.element.addEventListener('mousedown', (e) => {
            if (Keyboard.instance.isPressed('Shift')) {
                this.isDragging = true
                this.prevMouse = { x: e.clientX, y: e.clientY }
                e.preventDefault()
            }
        })

        vis.element.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.state.position.x += e.x - this.prevMouse.x
                this.state.position.y += e.y - this.prevMouse.y
                e.preventDefault()
            }
            this.prevMouse = { x: e.x, y: e.y }
        })

        document.body.addEventListener('mouseup', () => {
            this.isDragging = false
        })
    }

    onAddedToDom() {}

    tick(dt: number) {
        // Apply transform
        this.element.style.marginLeft = `${this.state.position.x}px`
        this.element.style.marginTop = `${this.state.position.y}px`

        // Background shift
        this.vis.element.style.backgroundPosition = `${this.state.position.x}px ${
            this.state.position.y
        }px, ${this.state.position.x + 15}px ${this.state.position.y + 15}px`

        // Shift
        if (Keyboard.instance.isPressed('Shift')) {
            this.vis.element.classList.add('camera-shift')
        } else {
            this.vis.element.classList.remove('camera-shift')
            this.isDragging = false
        }
    }

    add(element: HTMLElement) {
        this.element.appendChild(element)
    }

    destroy() {
        Ticker.instance.removeTickFrom(this._tickerId)

        this.element.remove()
        this.element = null
    }
}
