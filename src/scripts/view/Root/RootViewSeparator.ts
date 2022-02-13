import { Editor } from '../../editor/Editor'

export class RootViewSeparator {
    element: HTMLElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('root-view-separator')

        document.body.appendChild(this.element)
    }

    tick(dt: number) {
        const maxWidth = Editor.instance.getMaxWidth()
        const padding = 100
        this.element.style.left = `${maxWidth + padding}px`
        // this.element.style.top = `${Mouse.instance.position.y}px`
    }
}
