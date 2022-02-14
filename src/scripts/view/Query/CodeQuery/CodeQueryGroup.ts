import { Editor } from '../../../editor/Editor'
import { ExecutionGraph } from '../../../execution/graph/ExecutionGraph'
import { queryAllExecutionGraph, queryExecutionGraph } from '../../../execution/graph/graph'
import { ExecutionNode, instanceOfExecutionNode } from '../../../execution/primitive/ExecutionNode'
import { Executor } from '../../../executor/Executor'
import { View } from '../../View'
import { CodeQuery } from './CodeQuery'
import { bboxContains, getDeepestChunks, stripChunk } from './CodeQueryCreator'

export interface CodeQueryGroupState {
    selection: { x: number; y: number; width: number; height: number }
}

export class CodeQueryGroup {
    state: CodeQueryGroupState

    animationSelection: (ExecutionGraph | ExecutionNode)[]
    viewSelection: View[] = []

    // Query element
    element: HTMLElement
    // labelElement: HTMLElement

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

        // Expand the view to show the query
        for (const selection of this.animationSelection) {
            let parent: View = Executor.instance.rootView.parentView

            while (parent.originalAnimation.id !== selection.id) {
                if (instanceOfExecutionNode(parent.originalAnimation)) {
                    console.warn('Animation not found - reached end')
                    break
                }

                // Create steps
                if (!parent.state.isShowingSteps) {
                    parent.controller.createSteps(true)

                    for (const step of parent.stepsTimeline.views) {
                        // step.state.transform.scale = 0.5
                        // step.controller.goToStart()
                        step.controller.hide()
                    }
                }

                let foundMatch = false
                for (const step of parent.stepsTimeline.views) {
                    const contains =
                        queryExecutionGraph(
                            step.originalAnimation,
                            (animation) => animation.id == selection.id
                        ) != null

                    if (contains) {
                        // step.controller.expand()
                        step.controller.show()
                        // step.controller.goToEnd()
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

            this.viewSelection.push(parent)
        }

        // Create queries
        for (const view of this.viewSelection) {
            const query = new CodeQuery(view)
            this.queries.push(query)

            // Add query to element
            this.element.appendChild(query.element)
        }

        // this.queries[0].select()
    }

    tick(dt: number) {
        // Update position
        const location = this.animationSelection[0].nodeData.location
        const bbox = Editor.instance.computeBoundingBoxForLoc(location)
        this.element.style.top = `${bbox.y}px`

        // Update queries
        for (const query of this.queries) {
            query.tick(dt)
        }
    }

    destroy() {
        this.element.remove()
        this.element = null
        for (const query of this.queries) {
            query.destroy()
        }
        this.queries = null

        Executor.instance.rootView.removeQueryGroup(this)
    }
}
