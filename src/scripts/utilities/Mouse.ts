export class Mouse {
    // Singleton
    static instance: Mouse

    // List of tick callbacks
    position: { x: number; y: number } = { x: 0, y: 0 }

    held: boolean = false

    static _initialize() {
        if (Mouse.instance) return
        Mouse.instance = new Mouse()
    }

    constructor() {
        document.addEventListener('mousemove', (e) => {
            this.position = { x: e.clientX, y: e.clientY }
        })

        document.addEventListener('mousedown', (e) => {
            this.held = true
        })

        document.addEventListener('mouseup', (e) => {
            this.held = false
        })
    }
}

Mouse._initialize()
