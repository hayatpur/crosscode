import { Editor } from '../../../editor/Editor'
import { Executor } from '../../../executor/Executor'
import { catmullRomSolve } from '../../../utilities/math'
import { View } from '../../View'

export class CodeQuery {
    selectedView: View

    // Rendering
    element: HTMLElement
    labelElement: HTMLElement
    indicatorElement: HTMLElement
    codeSelectionElement: HTMLElement

    incomingConnection: SVGPathElement
    outgoingConnection: SVGPathElement

    isSelected: boolean = false

    constructor(selectedView: View) {
        this.selectedView = selectedView

        // Create element
        this.element = document.createElement('div')
        this.element.classList.add('code-query')

        // Create label
        this.labelElement = document.createElement('div')
        this.labelElement.classList.add('code-query-label')
        this.element.appendChild(this.labelElement)
        this.labelElement.innerText = ''

        // Create indicator
        this.indicatorElement = document.createElement('div')
        this.indicatorElement.classList.add('code-query-indicator')
        this.element.appendChild(this.indicatorElement)

        // Create code selection
        this.codeSelectionElement = document.createElement('div')
        this.codeSelectionElement.classList.add('code-selection')
        document.body.appendChild(this.codeSelectionElement)

        // Create incoming connection
        this.incomingConnection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.incomingConnection.classList.add('query-connection')
        document.getElementById('svg-canvas').append(this.incomingConnection)

        // Create outgoing connection
        this.outgoingConnection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.outgoingConnection.classList.add('query-connection')
        document.getElementById('svg-canvas').append(this.outgoingConnection)

        this.element.addEventListener('click', () => {
            if (this.isSelected) {
                this.deselect()
            } else {
                this.select()
            }
        })
    }

    tick(dt: number) {
        // Update code selection
        this.updateCodeSelection()

        // Update connection
        this.updateConnection()
    }

    updateCodeSelection() {
        const codeBbox = Editor.instance.computeBoundingBoxForLoc(
            this.selectedView.originalAnimation.nodeData.location
        )
        const padding = 4
        this.codeSelectionElement.style.left = `${codeBbox.x - padding}px`
        this.codeSelectionElement.style.top = `${codeBbox.y - padding / 2}px`
        this.codeSelectionElement.style.width = `${
            codeBbox.width + padding * 2
        }px`
        this.codeSelectionElement.style.height = `${
            codeBbox.height + padding
        }px`
    }

    updateConnection() {
        const codeSelectionBbox =
            this.codeSelectionElement.getBoundingClientRect()
        const indicatorBbox = this.indicatorElement.getBoundingClientRect()

        const points = [
            codeSelectionBbox.x + codeSelectionBbox.width,
            codeSelectionBbox.y + codeSelectionBbox.height / 2,

            indicatorBbox.x + indicatorBbox.width / 2,
            indicatorBbox.y + indicatorBbox.height / 2,
        ]

        if (this.selectedView.renderer?.element != null) {
            if (this.selectedView.state.isShowingSteps) {
                const viewBbox =
                    this.selectedView.renderer.stepsContainer.getBoundingClientRect()
                points.push(
                    viewBbox.x,
                    viewBbox.y + (0.5 * viewBbox.height) / 2
                )
            } else {
                const viewBbox =
                    this.selectedView.renderer.viewBody.getBoundingClientRect()
                points.push(
                    viewBbox.x,
                    viewBbox.y + (0.5 * viewBbox.height) / 2
                )
            }

            this.incomingConnection.classList.remove('dashed')
        } else {
            this.incomingConnection.classList.add('dashed')
        }

        const d = catmullRomSolve(points, 2) // SVGCatmullRomSpline.toPath(points, 4, true)
        this.incomingConnection.setAttribute('d', d)
        // this.perfectArrows()
    }

    select(pan = true) {
        if (this.isSelected) {
            return
        }

        // Deselect all other queries
        for (const group of Executor.instance.rootView.codeQueryGroups) {
            for (const query of group.queries) {
                if (query !== this) {
                    query.deselect()
                }
            }
        }

        this.element.classList.add('selected')

        this.incomingConnection.classList.add('selected')
        this.outgoingConnection.classList.add('selected')

        if (this.selectedView.controller != null) {
            this.selectedView.controller.select()
        }
        this.codeSelectionElement.classList.add('selected')

        // Find delta
        if (pan) {
            const indicatorBbox = this.indicatorElement.getBoundingClientRect()
            const viewBbox = this.selectedView.state.isShowingSteps
                ? this.selectedView.renderer.stepsContainer.getBoundingClientRect()
                : this.selectedView.renderer.viewBody.getBoundingClientRect()
            const delta =
                indicatorBbox.y +
                indicatorBbox.height / 2 -
                (viewBbox.y + viewBbox.height / 2)

            Executor.instance.rootView.parentView.state.transform.position.y +=
                delta
        }

        this.isSelected = true
    }

    deselect() {
        if (!this.isSelected) {
            return
        }

        this.element.classList.remove('selected')

        this.incomingConnection.classList.remove('selected')
        this.outgoingConnection.classList.remove('selected')

        if (this.selectedView.controller != null) {
            this.selectedView.controller.deselect()
        }
        this.codeSelectionElement.classList.remove('selected')
        this.isSelected = false
    }

    destroy() {
        if (this.isSelected) {
            this.deselect()
        }
        this.element.remove()
        this.incomingConnection.remove()
        this.outgoingConnection.remove()
        this.codeSelectionElement.remove()

        this.element = null
    }

    // perfectArrows() {
    //     const codeSelectionBbox =
    //         this.codeSelectionElement.getBoundingClientRect()
    //     const indicatorBbox = this.indicatorElement.getBoundingClientRect()
    //     const viewBbox =
    //         this.selectedView.renderer.viewBody.getBoundingClientRect()

    //     // Incoming connection goes from the code to the indicator
    //     {
    //         const [sx, sy, cx, cy, ex, ey, ae, as, sc] = getArrow(
    //             codeSelectionBbox.x + codeSelectionBbox.width,
    //             codeSelectionBbox.y + codeSelectionBbox.height / 2,
    //             indicatorBbox.x + indicatorBbox.width / 2,
    //             indicatorBbox.y + indicatorBbox.height / 2,
    //             {
    //                 stretchMax: 200,
    //                 padStart: 0,
    //                 padEnd: 0,
    //             }
    //         )
    //         this.incomingConnection.setAttribute(
    //             'd',
    //             `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
    //         )
    //     }

    //     // Outgoing connection goes from the indicator to the view
    //     {
    //         const [sx, sy, cx, cy, ex, ey, ae, as, sc] = getArrow(
    //             indicatorBbox.x + indicatorBbox.width / 2,
    //             indicatorBbox.y + indicatorBbox.height / 2,
    //             viewBbox.x,
    //             viewBbox.y + viewBbox.height / 2,
    //             {
    //                 bow: Executor.instance.PARAMS.a * 10,
    //                 stretch: Executor.instance.PARAMS.b,
    //                 stretchMin: Executor.instance.PARAMS.c * 100,
    //                 stretchMax: Executor.instance.PARAMS.d * 1000,
    //                 padStart: 0,
    //                 padEnd: 0,
    //                 flip: true,
    //                 straights: false,
    //             }
    //         )
    //         this.outgoingConnection.setAttribute(
    //             'd',
    //             `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
    //         )
    //     }
    // }

    // curvedArrows() {
    // const codeSelectionBbox = codeSelection.getBoundingClientRect()
    // const indicatorBbox = indicator.getBoundingClientRect()
    // const viewBbox = view.renderer.viewBody.getBoundingClientRect()
    // const labelBBox = this.labelElement.getBoundingClientRect()
    //     // Incoming connection goes from the code to the indicator
    //     {
    //         const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
    //             codeSelectionBbox.x,
    //             codeSelectionBbox.y,
    //             codeSelectionBbox.width,
    //             codeSelectionBbox.height,
    //             indicatorBbox.x,
    //             indicatorBbox.y,
    //             indicatorBbox.width,
    //             indicatorBbox.height,
    //             { padEnd: 0, padStart: 0 }
    //         )
    //         this.incomingConnection.setAttribute(
    //             'd',
    //             `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
    //         )
    //     }

    //     // Outgoing connection goes from the indicator to the view
    //     // {
    //     //     const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, ae] = getBoxToBoxArrow(
    //     //         indicatorBbox.x,
    //     //         indicatorBbox.y,
    //     //         indicatorBbox.width,
    //     //         indicatorBbox.height,
    //     //         viewBbox.x,
    //     //         viewBbox.y,
    //     //         viewBbox.width,
    //     //         viewBbox.height,
    //     //         { padEnd: 0, padStart: 0 }
    //     //     )
    //     //     this.outgoingConnection.setAttribute(
    //     //         'd',
    //     //         `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`
    //     //     )
    //     // }
    // }
}
