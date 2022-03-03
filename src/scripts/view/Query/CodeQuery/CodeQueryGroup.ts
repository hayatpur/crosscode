import { Editor } from '../../../editor/Editor'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { queryAllExecutionGraph, queryExecutionGraph } from '../../../execution/graph/graph'
import { ExecutionNode, instanceOfExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { Executor } from '../../../executor/Executor'
import { bboxContains, getDeepestChunks, stripChunk } from '../../../utilities/math'
import { View } from '../../View'
import { CodeQuery } from './CodeQuery'

export interface CodeQueryGroupState {
    selection: { x: number; y: number; width: number; height: number } | null
    executionIds: string[] | null
}

export enum ViewSelectionType {
    CodeToView,
    ViewToView,
}

export interface ViewSelection {
    type: ViewSelectionType
    view: View
    referenceView?: View // Only for view to view
}

export class CodeQueryGroup {
    state: CodeQueryGroupState

    animationSelection: (ExecutionGraph | ExecutionNode)[]
    viewSelection: ViewSelection[] = []

    // Query element
    element: HTMLElement
    labelElement: HTMLElement

    queries: CodeQuery[] = []

    constructor(state: CodeQueryGroupState) {
        this.state = state

        // Create element
        this.element = document.createElement('div')
        this.element.classList.add('code-query-group')
        document.querySelector('.code-query-container').appendChild(this.element)

        // Create label
        // this.labelElement = document.createElement('div')
        // this.labelElement.classList.add('code-query-label')
        // this.labelElement.innerText = 'Query'
        // this.element.appendChild(this.labelElement)

        if (this.state.executionIds != null) {
            this.animationSelection = queryAllExecutionGraph(
                Executor.instance.execution,
                (animation) => this.state.executionIds.includes(animation.id)
            )
        } else {
            // List of base nodes
            const nodes = queryAllExecutionGraph(Executor.instance.execution, (animation) =>
                instanceOfExecutionNode(animation)
            )

            // Find nodes that are inside the selection
            const selectedNodeIds: Set<string> = new Set()

            for (const node of nodes) {
                const location = node.nodeData.location
                const bbox = Editor.instance.computeBoundingBoxForLoc(location)

                const contains = bboxContains(this.state.selection, bbox)

                if (contains) {
                    selectedNodeIds.add(node.id)
                }
            }

            // Group nodes into chunks
            this.animationSelection = getDeepestChunks(Executor.instance.execution, selectedNodeIds)
            this.animationSelection = this.animationSelection.map((chunk) => stripChunk(chunk))
        }

        // Expand the view to show the query
        for (const selection of this.animationSelection) {
            this.viewSelection.push(...expandViewAlt(selection))
        }

        // Create queries
        for (const selection of this.viewSelection) {
            const query = new CodeQuery(selection)
            this.queries.push(query)
            // Add query to element
            this.element.appendChild(query.element)
        }

        // setTimeout(() => {
        //     this.queries[0]?.select(true)
        // }, 100)
        // setTimeout(() => {
        //     this.queries[0]?.deselect()
        // }, 1500)
    }

    tick(dt: number) {
        // Update position
        if (this.animationSelection.length > 0) {
            const location = this.animationSelection[0].nodeData.location
            const bbox = Editor.instance.computeBoundingBoxForLoc(location)
            this.element.style.top = `${bbox.y}px`

            // Update queries
            for (const query of this.queries) {
                query.tick(dt)
            }
        }
    }

    destroy() {
        this.element.remove()
        this.element = null

        for (const query of this.queries) {
            query.destroy()
        }
        for (const selection of this.viewSelection) {
            if (selection.type == ViewSelectionType.ViewToView && selection.view instanceof View) {
                selection.view.destroy()
            }
        }
        this.queries = null

        Executor.instance.rootView.removeQueryGroup(this)
    }
}

// Expand the root view to include the selection
export function expandView(selection: ExecutionNode | ExecutionGraph) {
    let parent: View = Executor.instance.rootView.parentView
    let views = []

    while (parent.originalExecution.id !== selection.id) {
        if (instanceOfExecutionNode(parent.originalExecution)) {
            console.warn('Animation not found - reached end')
            break
        }

        // Create steps
        if (!parent.state.isShowingSteps) {
            parent.controller.createSteps(true)
        }

        let foundMatch = false
        for (const step of parent.stepsTimeline.views) {
            const contains =
                queryExecutionGraph(
                    step.originalExecution,
                    (animation) => animation.id == selection.id
                ) != null

            if (contains) {
                parent = step
                foundMatch = true
                break
            }
        }

        if (!foundMatch) {
            console.warn('Animation not found - no match')
            break
        }
    }

    views.push(parent)
    return views
}

// Expand view alternate
export function expandViewAlt(
    selection: ExecutionNode | ExecutionGraph,
    onlyFromView = false
): ViewSelection[] {
    let parent: View = Executor.instance.rootView.parentView
    let viewSelections: ViewSelection[] = []
    let buffer: View[] = []
    let bufferView: View = null

    while (parent.originalExecution.id !== selection.id) {
        if (instanceOfExecutionNode(parent.originalExecution)) {
            console.warn('Animation not found - reached end')
            break
        }

        // Create steps
        if (!parent.state.isShowingSteps) {
            if (bufferView == null) {
                bufferView = parent
                break
            }
            buffer.push(parent)
            parent.controller.createSteps(true)
        }

        let foundMatch = false
        for (const step of parent.stepsTimeline.views) {
            const contains =
                queryExecutionGraph(
                    step.originalExecution,
                    (animation) => animation.id == selection.id
                ) != null

            if (contains) {
                parent = step
                foundMatch = true
                break
            }
        }

        if (!foundMatch) {
            console.warn('Animation not found - no match')
            break
        }
    }

    if (bufferView != null) {
        const childView = Executor.instance.rootView.createView(selection, {
            expand: true,
            temporary: true,
        })
        document.body.appendChild(childView.renderer.element)
        childView.renderer.element.classList.add('temporary')

        bufferView.controller.destroySteps()
        childView.controller.attachTo(bufferView.renderer.element)

        viewSelections = [
            { type: ViewSelectionType.ViewToView, view: childView, referenceView: bufferView },
        ]
    } else {
        viewSelections.push({ type: ViewSelectionType.CodeToView, view: parent })
    }

    return viewSelections
}

// export function expandViewAlt(selection: ExecutionNode | ExecutionGraph) {
//     let parent: View = Executor.instance.rootView.parentView
//     let views = []
//     let buffer: View[] = []
//     let bufferView: View = null

//     while (parent.originalExecution.id !== selection.id) {
//         if (instanceOfExecutionNode(parent.originalExecution)) {
//             console.warn('Animation not found - reached end')
//             break
//         }

//         // Create steps
//         if (!parent.state.isShowingSteps) {
//             if (bufferView == null) {
//                 bufferView = parent
//             }
//             buffer.push(parent)
//             parent.controller.createSteps(true)
//         }

//         let foundMatch = false
//         for (const step of parent.stepsTimeline.views) {
//             const contains =
//                 queryExecutionGraph(
//                     step.originalExecution,
//                     (animation) => animation.id == selection.id
//                 ) != null

//             if (contains) {
//                 parent = step
//                 foundMatch = true
//                 break
//             }
//         }

//         if (!foundMatch) {
//             console.warn('Animation not found - no match')
//             break
//         }
//     }

//     if (bufferView != null) {
//         const label = buffer.map((view) => view.renderer.label.innerText).join(' > ')

//         bufferView.controller.destroySteps()
//         const childView = Executor.instance.rootView.createView(selection, {
//             expand: true,
//         })
//         bufferView.controller.createStepsEmptySteps()
//         bufferView.stepsTimeline.addView(childView)

//         bufferView.renderer.label.innerText = label

//         bufferView.controller.expand()

//         views = [bufferView, childView]
//     } else {
//         views.push(parent)
//     }

//     return views
// }
