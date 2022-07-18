import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { createElement } from '../../../utilities/dom'
import { Ticker } from '../../../utilities/Ticker'
import { ActionProxy } from './ActionProxy'

export interface VesselEdge {
    path: (ExecutionGraph | ExecutionNode)[]
}

export class Vessel {
    element: HTMLElement
    labelElement: HTMLElement

    vertices: Vessel[] = []
    edges: VesselEdge[] = []

    proxies: ActionProxy[] = []

    execution: ExecutionGraph | ExecutionNode

    _tickerId: string

    constructor(execution: ExecutionGraph | ExecutionNode) {
        this.execution = execution

        this.element = createElement('div', 'vessel')
        this.labelElement = createElement('div', 'vessel-label', this.element)
        this.labelElement.innerText = `${execution.nodeData.type}`

        this._tickerId = Ticker.instance.registerTick(this.tick.bind(this))
    }

    tick(_dt: number) {
        let bbox = this.proxies[0].element.getBoundingClientRect()

        let altBbox = {
            minX: bbox.x,
            minY: bbox.y,
            maxX: bbox.x + bbox.width,
            maxY: bbox.y + bbox.height,
        }

        for (let i = 1; i < this.proxies.length; i++) {
            const pBbox = this.proxies[i].element.getBoundingClientRect()
            altBbox.minX = Math.min(altBbox.minX, pBbox.x)
            altBbox.minY = Math.min(altBbox.minY, pBbox.y)
            altBbox.maxX = Math.max(altBbox.maxX, pBbox.x + pBbox.width)
            altBbox.maxY = Math.max(altBbox.maxY, pBbox.y + pBbox.height)
        }

        bbox.x = altBbox.minX
        bbox.y = altBbox.minY
        bbox.width = altBbox.maxX - altBbox.minX
        bbox.height = altBbox.maxY - altBbox.minY

        this.element.style.width = `${bbox.width + 30}px`
        this.element.style.height = `${bbox.height + 35}px`
    }

    addVertex(vertex: Vessel, edge: VesselEdge) {
        this.vertices.push(vertex)
        this.edges.push(edge)
    }

    addProxy(proxy: ActionProxy) {
        this.element.appendChild(proxy.element)
        this.proxies.push(proxy)
    }

    destroy() {
        this.vertices.forEach((vessel) => vessel.destroy())

        Ticker.instance.removeTickFrom(this._tickerId)
        this.element.remove()
    }
}
