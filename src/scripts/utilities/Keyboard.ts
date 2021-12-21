export class Keyboard {
    // Singleton
    static instance: Keyboard

    // List of tick callbacks
    private pressed: { [key: string]: boolean } = {}

    static _initialize() {
        if (Keyboard.instance) return
        Keyboard.instance = new Keyboard()
    }

    constructor() {
        const keyboard = this

        document.addEventListener('keydown', (e) => {
            keyboard.pressed[e.key] = true
        })

        document.addEventListener('keyup', (e) => {
            keyboard.pressed[e.key] = false
        })
    }

    isPressed(key: string) {
        return key in this.pressed && this.pressed[key]
    }
}

Keyboard._initialize()
