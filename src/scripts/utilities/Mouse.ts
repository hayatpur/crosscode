export class Mouse {
    // Singleton
    static instance: Mouse

    // List of tick callbacks
    position: { x: number; y: number } = { x: 0, y: 0 }

    static _initialize() {
        if (Mouse.instance) return
        Mouse.instance = new Mouse()
    }

    constructor() {
        const mouse = this

        document.addEventListener('mousemove', (e) => {
            mouse.position = { x: e.clientX, y: e.clientY }
        })
    }
}

Mouse._initialize()
