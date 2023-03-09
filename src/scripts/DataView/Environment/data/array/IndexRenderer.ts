export class IndexRenderer {
    element: HTMLDivElement

    constructor() {
        this.element = document.createElement('div')
        this.element.classList.add('data-array-index')
    }

    setState(index: number, dataElement: HTMLElement, environmentElement: HTMLElement) {
        this.element.innerText = `${index}`

        const dataBbox = dataElement.getBoundingClientRect()
        const environmentBbox = environmentElement.getBoundingClientRect()
        const delta = dataBbox.x - environmentBbox.x

        let ratio = 1
        this.element.style.top = `${18}px`
        this.element.style.left = `${(1 / ratio) * delta}px`
    }

    destroy() {
        this.element.remove()
    }
}
