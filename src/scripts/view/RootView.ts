import { Cursor } from './Cursor'
import { View } from './View'

export class RootView {
    // Rendering
    views: View[] = []
    cursor: Cursor = new Cursor()

    constructor() {}

    tick(dt: number) {
        // Render views
        for (const child of this.views) {
            child.tick(dt)
        }

        // Render cursor
        this.cursor.tick()
    }

    addView(view: View) {
        this.views.push(view)
    }

    removeView(view: View) {
        const index = this.views.indexOf(view)
        if (index === -1) return
        this.views.splice(index, 1)
    }
}
