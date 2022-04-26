import { Action } from '../Action'
import { ActionMapping } from './ActionMapping'

/* ------------------------------------------------------ */
/*                      Control flow                      */
/* ------------------------------------------------------ */
export class ControlFlow {
    steps: Action[] = []

    connectionsContainer: SVGElement
    connections: SVGPathElement[] = []

    constructor(mapping: ActionMapping) {
        this.connectionsContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.connectionsContainer.classList.add('connections-svg')

        mapping.element.appendChild(this.connectionsContainer)

        this.update()
    }

    update() {
        this.connections.forEach((connection) => {
            connection.remove()
        })

        this.connections = []

        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i]
            const connection = this.createConnection(step)

            if (i > 0) {
                const previousStep = this.steps[i - 1]
                const previousConnection = this.createConnection(previousStep)

                this.connections.push(previousConnection)
                this.connections.push(connection)
            }
        }
    }
}
