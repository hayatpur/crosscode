/* ------------------------------------------------------ */
/*     Camera controls current view position and scale    */
/* ------------------------------------------------------ */

import Panzoom, { PanzoomObject } from '@panzoom/panzoom'
import { createEl } from '../../utilities/dom'
import { Ticker } from '../../utilities/Ticker'

export interface CameraTransform {
    position: {
        x: number
        y: number
    }
    scale: number
}

export class Camera {
    element: HTMLElement
    // transform: CameraTransform

    private _tickerId: string
    panzoom: PanzoomObject

    constructor() {
        this.element = createEl('div', 'camera')

        // this.transform = {
        //     position: {
        //         x: 100,
        //         y: 0,
        //     },
        //     scale: 1,
        // }

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    onAddedToDom() {
        this.panzoom = Panzoom(this.element, {
            maxScale: 5,
            animate: true,
        })

        setTimeout(() => {
            this.panzoom.pan(500, 400)
            this.panzoom.zoom(1.2)
        }, 1000)
        // panzoom.zoom(2, { animate: false })

        this.element.parentElement.addEventListener('wheel', this.panzoom.zoomWithWheel)
    }

    tick(dt: number) {
        // Apply transform
        // this.element.style.transform = `translate(${this.transform.position.x}px, ${this.transform.position.y}px) scale(${this.transform.scale})`
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
