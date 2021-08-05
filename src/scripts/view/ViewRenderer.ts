import { Accessor, Data, DataType } from '../environment/Data'
import { Environment } from '../environment/Environment'

export interface ViewRendererOptions {
    position?: { x: number; y: number }
}

export class ViewRenderer {
    // View's HTML DOM Element
    element: HTMLDivElement

    dataElements: { [id: string]: HTMLDivElement } = {}
    identifierElements: { [id: string]: HTMLDivElement } = {}

    position: { x: number; y: number }
    draggable: boolean = false

    constructor(options: ViewRendererOptions = {}) {
        // DOM elements
        this.element = document.createElement('div')
        this.element.classList.add('view')
        document.body.append(this.element)

        this.position = options.position ?? { x: 0, y: 0 }

        this.element.style.top = `${this.position.y}px`
        this.element.style.left = `${this.position.x}px`

        let px = 0
        let py = 0
        let mousedown = false

        document.addEventListener('keydown', (e) => {
            if (e.shiftKey) {
                this.draggable = true
                this.element.classList.add('draggable')
            }
        })

        document.addEventListener('keyup', (e) => {
            if (e.key == 'Shift') {
                this.draggable = false
                this.element.classList.remove('draggable')
            }
        })

        document.addEventListener('mousedown', (e) => {
            mousedown = true
        })

        document.addEventListener('mouseup', (e) => {
            mousedown = false
        })

        document.addEventListener('mousemove', (e) => {
            if (this.draggable && mousedown) {
                const bbox = this.element.getBoundingClientRect()
                if (e.x >= bbox.left && e.x <= bbox.right && e.y >= bbox.top && e.y <= bbox.bottom) {
                    let dx = e.x - px
                    let dy = e.y - py

                    this.position.x += dx
                    this.position.y += dy

                    this.element.style.left = `${this.position.x}px`
                    this.element.style.top = `${this.position.y}px`
                }
            }

            px = e.x
            py = e.y
        })
    }

    setState(environment: Environment) {
        // Clear memory
        let memory = environment.flattenedMemory()
        memory = memory.filter((data) => data && data.type == DataType.Number)
        memory.reverse()

        let ids = new Set([...memory.map((data) => data.id)])

        // Add any missing elements
        for (const data of memory) {
            if (this.dataElements[data.id] == null) {
                // Create element
                const el = document.createElement('div')
                el.classList.add('view-element')
                this.element.append(el)

                this.dataElements[data.id] = el
            }
        }

        // Remove any un-needed elements
        for (const [id, el] of Object.entries(this.dataElements)) {
            if (!ids.has(id)) {
                el.remove()
                delete this.dataElements[id]
            }
        }

        for (const data of memory) {
            const element = this.dataElements[data.id]

            if (data.type != DataType.Number) {
                continue
            }

            const transform = data.transform
            const value = data.value

            element.style.marginLeft = `${transform.x}px`
            element.style.marginTop = `${transform.y}px`
            element.style.opacity = `${transform.opacity}`
            element.innerHTML = `${value} <tiny>[${data.frame}]</tiny>`
            element.style.width = `${transform.width}px`
            element.style.height = `${transform.height}px`

            if (transform.floating) {
                element.classList.add('floating')
            } else {
                element.classList.remove('floating')
            }
        }

        let bindings: [string, Accessor[]][] = []
        for (const scope of environment.bindingFrames) {
            for (const binding of Object.entries(scope)) {
                bindings.push(binding)
            }
        }
        bindings = bindings.filter((item) => !item[0].startsWith('_'))
        let names = new Set(bindings.map((pair) => pair[0]))

        // Add any missing elements
        for (const [identifier, path] of bindings) {
            if (this.identifierElements[identifier] == null) {
                // Create element
                const el = document.createElement('div')
                el.classList.add('view-identifier')
                this.element.append(el)

                this.identifierElements[identifier] = el
            }
        }

        // Remove any un-needed elements
        for (const [name, el] of Object.entries(this.identifierElements)) {
            if (!names.has(name)) {
                el.remove()
                delete this.dataElements[name]
            }
        }

        // Setup identifiers
        for (const [identifier, path] of bindings) {
            const element = this.identifierElements[identifier]

            const data = environment.resolvePath(path) as Data
            const { x, y } = data.transform

            element.innerText = identifier

            element.style.left = `${x}px`
            element.style.top = `${y - 25}px`
        }
    }

    updateState(environment: Environment) {}

    reset() {
        Object.values(this.identifierElements).forEach((el) => el.remove())
        this.identifierElements = {}

        Object.values(this.dataElements).forEach((el) => el.remove())
        this.dataElements = {}
    }

    destroy() {
        this.reset()
        this.element.remove()
    }
}
