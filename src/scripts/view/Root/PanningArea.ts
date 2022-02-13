import { Keyboard } from '../../utilities/Keyboard'
import { View } from '../View'

export class PanningArea {
    element: HTMLElement
    isDragging: boolean = false
    previousMouse: { x: number; y: number }
    view: View

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('panning-area')
        document.body.appendChild(this.element)

        this.bindMouseEvents()
    }

    bindMouseEvents() {
        // Bind mouse events to label
        const node = this.element

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        node.addEventListener('wheel', this.wheel.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    wheel(e: WheelEvent) {
        // Apply scale transform
        this.view.state.transform.scale += e.deltaY * -0.01
    }

    mousedown(e: MouseEvent) {
        if (Keyboard.instance.isPressed('Shift') || true) {
            this.isDragging = true
            this.previousMouse = { x: e.clientX, y: e.clientY }

            this.element.classList.add('dragging')
        }
    }

    mouseover(e: MouseEvent) {}

    mouseout(e: MouseEvent) {}

    mouseup(e: MouseEvent) {
        if (this.isDragging) {
            this.isDragging = false
            this.previousMouse = { x: e.clientX, y: e.clientY }
            this.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        if (this.isDragging) {
            if (this.view == null) return

            const dx = 0 // e.clientX - this.previousMouse.x
            const dy = e.clientY - this.previousMouse.y

            this.previousMouse = { x: e.clientX, y: e.clientY }

            this.view.state.transform.position.x += dx
            this.view.state.transform.position.y += dy
        }
    }
}
