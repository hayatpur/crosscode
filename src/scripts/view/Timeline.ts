import { remap } from '../utilities/math'
import { View } from './View'

export class Timeline {
    disabled: boolean = false

    // Rendering
    element: HTMLDivElement = null

    timelineBar: HTMLDivElement = null
    scrubber: HTMLDivElement = null

    playToggle: HTMLDivElement = null

    view: View = null

    constructor(view: View) {
        this.view = view

        this.element = document.createElement('div')
        this.element.classList.add('timeline')

        this.playToggle = document.createElement('div')
        this.playToggle.classList.add('timeline-button')
        this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
        this.element.appendChild(this.playToggle)

        this.timelineBar = document.createElement('div')
        this.timelineBar.classList.add('timeline-bar')
        this.element.appendChild(this.timelineBar)

        this.scrubber = document.createElement('div')
        this.scrubber.classList.add('timeline-scrubber')
        this.timelineBar.appendChild(this.scrubber)

        // Setup bindings
        this.playToggle.addEventListener('click', () => {
            this.view.state.isPaused = !this.view.state.isPaused

            if (this.view.state.isPaused) {
                this.playToggle.innerHTML = '<ion-icon name="play"></ion-icon>'
            } else {
                this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
            }
        })
    }

    destroy() {
        this.element.remove()
    }

    enable() {
        this.element.classList.remove('disabled')
        this.disabled = false
    }

    disable() {
        this.element.classList.add('disabled')
        this.disabled = true
    }

    tick(dt: number) {
        const bbox = this.timelineBar.getBoundingClientRect()

        // Move scrubber over
        const x = remap(
            this.view.state.time,
            0,
            this.view.getDuration(),
            0,
            bbox.width - 5
        )
        this.scrubber.style.left = `${x}px`
    }
}
