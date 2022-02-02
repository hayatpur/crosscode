import { Cursor } from './Cursor/Cursor'
import { Query } from './Query/Query'
import { Timeline } from './Timeline/Timeline'
import { View } from './View'

export class RootView {
    // Rendering
    views: View[] = []
    cursor: Cursor = new Cursor()
    rootTimeline: Timeline

    queries: Query[] = []

    constructor() {
        this.rootTimeline = new Timeline()
        this.rootTimeline.transform.position.x = 600
        this.rootTimeline.transform.position.y = 100

        document.body.appendChild(this.rootTimeline.element)
    }

    tick(dt: number) {
        // Render views
        for (const child of this.views) {
            child.tick(dt)
        }

        // Render cursor
        this.cursor.tick()

        // Render timeline
        this.rootTimeline.tick(dt)
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
