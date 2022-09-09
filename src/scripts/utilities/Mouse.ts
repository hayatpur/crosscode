export class Mouse {
    // Singleton
    static instance: Mouse

    // List of tick callbacks
    position: { x: number; y: number } = { x: 0, y: 0 }

    held: boolean = false

    element: HTMLElement

    static _initialize() {
        if (Mouse.instance) return
        Mouse.instance = new Mouse()
    }

    constructor() {
        document.addEventListener('mousemove', (e) => {
            this.position = { x: e.clientX, y: e.clientY }

            this.element.style.left = `${this.position.x}px`
            this.element.style.top = `${this.position.y}px`
        })

        document.addEventListener('mousedown', (e) => {
            this.held = true
        })

        document.addEventListener('mouseup', (e) => {
            this.held = false
        })

        this.element = document.createElement('div')
        this.element.classList.add('mouse-indicator')
        document.body.appendChild(this.element)
    }
}

Mouse._initialize()
