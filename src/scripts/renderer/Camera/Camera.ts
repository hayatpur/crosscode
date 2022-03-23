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
            }
        })

        vis.element.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.state.position.x += e.x - this.prevMouse.x
                this.state.position.y += e.y - this.prevMouse.y
            }
            this.prevMouse = { x: e.x, y: e.y }
        })

        document.body.addEventListener('mouseup', () => {
            this.isDragging = false
        })
    }

    onAddedToDom() {
        // this.panzoom = Panzoom(this.element, {
        //     maxScale: 5,
        //     animate: true,
        //     canvas: true,
        // })
        // setTimeout(() => {
        //     this.panzoom.pan(500, 400)
        //     this.panzoom.zoom(1.2)
        // }, 1000)
        // panzoom.zoom(2, { animate: false })
        // this.element.parentElement.addEventListener('wheel', this.panzoom.zoomWithWheel)
    }

    tick(dt: number) {
        // Apply transform
        this.element.style.transform = `translate(${this.state.position.x}px, ${this.state.position.y}px)`

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
