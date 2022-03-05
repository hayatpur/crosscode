import { Editor } from '../../../editor/Editor'
import { queryExecutionGraphPath } from '../../../execution/graph/graph'
import { Executor } from '../../../executor/Executor'
import { getViewElement } from '../../../utilities/math'
import { View } from '../../View'
import { ViewSelection, ViewSelectionType } from './CodeQueryGroup'

export class CodeQuery {
    type: ViewSelectionType
    view: View
    referenceView: View

    // Rendering
    element: HTMLElement
    labelElement: HTMLElement
    indicatorElement: HTMLElement
    codeSelectionElement: HTMLElement

    connection: SVGPathElement

    isSelected: boolean = false
    isHidden: boolean = false

    anchor: HTMLElement = null

    constructor(selection: ViewSelection, isTemporary: boolean = false) {
        this.type = selection.type
        this.view = selection.view
        this.referenceView = selection.referenceView

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

        if (selection.type == ViewSelectionType.CodeToView) {
            this.element.appendChild(this.indicatorElement)

            this.codeSelectionElement = document.createElement('div')
            this.codeSelectionElement.classList.add('code-selection')
            document.body.appendChild(this.codeSelectionElement)
        }

        // TODO: Set label correctly for query
        if (this.type == ViewSelectionType.ViewToView && this.view instanceof View) {
            const path = queryExecutionGraphPath(
                this.referenceView.originalExecution,
                (e) => e.id == this.view.originalExecution.id
            )

            const pathStr = path.map((e) => e.nodeData.type).join(' > ')

            this.view.renderer.label.innerText =
                pathStr + ' > ' + this.view.renderer.label.innerText
        }

        // Create connection
        this.connection = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.connection.classList.add('query-connection')
        document.getElementById('svg-canvas').append(this.connection)

        this.element.addEventListener('click', () => {
            if (this.isSelected) {
                this.deselect()
            } else {
                this.select()
            }
        })
    }

    setAnchor(element: HTMLElement) {
        this.anchor = element
    }

    removeAnchor() {
        this.anchor = null
    }

    tick(dt: number) {
        // Update code selection
        if (this.codeSelectionElement != null) {
            this.updateCodeSelection()
        }

        this.updateConnection()

        // Update connection

        // Update opacity
        // Scale
        // const dy = this.updateConnection() / 500.0
        // const factor = Math.exp(-(dy * dy))
        // if (
        //     this.selection.view.renderer?.element != null &&
        //     !this.selection.view.renderer?.element.parentElement.classList.contains('panning-area')
        // ) {
        //     // this.selectedView.state.transform.scale = factor
        // }
    }

    updateCodeSelection() {
        const codeBbox = Editor.instance.computeBoundingBoxForLoc(
            this.view.originalExecution.nodeData.location
        )
        const padding = 4
        this.codeSelectionElement.style.left = `${codeBbox.x - padding}px`
        this.codeSelectionElement.style.top = `${codeBbox.y - padding / 2}px`
        this.codeSelectionElement.style.width = `${codeBbox.width + padding * 2}px`
        this.codeSelectionElement.style.height = `${codeBbox.height + padding}px`
    }

    updateConnection() {
        const start =
            this.type == ViewSelectionType.CodeToView
                ? this.codeSelectionElement.getBoundingClientRect()
                : getViewElement(this.referenceView).getBoundingClientRect()

        let points = [start.x + start.width, start.y + start.height / 2]

        if (document.body.contains(this.indicatorElement)) {
            const indicatorBbox = this.indicatorElement.getBoundingClientRect()
            points.push(
                indicatorBbox.x + indicatorBbox.width / 2,
                indicatorBbox.y + indicatorBbox.height / 2
            )
        } else {
            if (this.type == ViewSelectionType.CodeToView) {
                const separatorX =
                    Executor.instance.rootView.separator.element.getBoundingClientRect().x
                points.push(separatorX, start.y + start.height / 2)
            }
        }

        if (this.anchor != null) {
            const bbox = this.anchor.getBoundingClientRect()
            points = [bbox.x + bbox.width / 2, bbox.y + bbox.height / 2]
        }

        if (this.view.renderer?.element != null) {
            const viewBbox = getViewElement(this.view).getBoundingClientRect()
            if (this.view.state.isEmbedded) {
                points.push(viewBbox.x + viewBbox.width / 2, viewBbox.y + viewBbox.height / 2)
            } else {
                points.push(viewBbox.x, viewBbox.y + (0.5 * viewBbox.height) / 2)
            }

            this.connection.classList.remove('dashed')
        } else {
            this.connection.classList.add('dashed')
        }

        if (this.type == ViewSelectionType.ViewToView) {
            const bbox = this.view.renderer.element.getBoundingClientRect()
            // points.push(bbox.x + bbox.width, bbox.y + bbox.height / 1.5)
            // // points.push(bbox.x + bbox.width + 10, bbox.y + bbox.height + 10)
            // points.push(start.x + start.width, start.y + start.height / 1.1)
        }

        // if (this.anchor != null) {
        //     const d = getCurvedArrow(points[0], points[1], points[2], points[3])
        //     this.connection.setAttribute('d', d)
        // } else {
        //     const d = catmullRomSolve(points, 0.8) // SVGCatmullRomSpline.toPath(points, 4, true)
        //     this.connection.setAttribute('d', d)
        // }

        return Math.abs(points[1] - points[points.length - 1])
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
        this.connection.classList.add('selected')
        this.codeSelectionElement.classList.add('selected')

        if (this.view instanceof View) {
            this.view.controller?.select()
        }

        // Find delta
        // if (pan) {
        //     const codeBbox = this.codeSelectionElement.getBoundingClientRect()
        //     const viewBbox = this.selectedView.state.isShowingSteps
        //         ? this.selectedView.renderer.stepsContainer.getBoundingClientRect()
        //         : this.selectedView.renderer.viewBody.getBoundingClientRect()
        //     const delta = codeBbox.y + codeBbox.height / 2 - (viewBbox.y + viewBbox.height / 2)

        //     Executor.instance.rootView.parentView.state.transform.position.y += delta
        // }

        this.isSelected = true
    }

    deselect() {
        if (!this.isSelected) {
            return
        }

        this.element.classList.remove('selected')

        this.connection.classList.remove('selected')
        this.connection.classList.remove('selected')
        this.codeSelectionElement.classList.remove('selected')

        if (this.view instanceof View) {
            this.view.controller?.deselect()
        }
        this.isSelected = false
    }

    hide() {
        this.element.classList.add('hidden')
        this.connection.classList.add('hidden')
        this.codeSelectionElement.classList.add('hidden')

        this.isHidden = true
    }

    show() {
        this.element.classList.remove('hidden')
        this.connection.classList.remove('hidden')
        this.codeSelectionElement.classList.remove('hidden')

        this.isHidden = false
    }

    destroy() {
        if (this.isSelected) {
            this.deselect()
        }
        this.element.remove()
        this.connection.remove()
        this.codeSelectionElement?.remove()

        Executor.instance.rootView.removeQuery(this)

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
