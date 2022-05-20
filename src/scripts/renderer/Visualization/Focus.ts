import { Editor } from '../../editor/Editor'
import { queryExecutionGraph, reads, writes } from '../../execution/execution'
import { ExecutionGraph } from '../../execution/graph/ExecutionGraph'
import { ExecutionNode } from '../../execution/primitive/ExecutionNode'
import { Action } from '../Action/Action'
import { View } from '../View/View'

export class Focus {
    currentFocus: (ExecutionNode | ExecutionGraph)[] = []
    dirty = false

    /* ----------------------- Create ----------------------- */
    constructor() {}

    /* ----------------------- Update ----------------------- */

    clearFocus(node: ExecutionNode | ExecutionGraph) {
        // Remove node from focus
        let index = this.currentFocus.indexOf(node)
        if (index != -1) {
            this.currentFocus.splice(index, 1)
        } else {
            console.warn('Trying to clear focus on a node that is not focused')
        }

        this.dirty = true

        setTimeout(() => this.updateFocus(), 200)
    }

    focusOn(node: ExecutionNode | ExecutionGraph) {
        if (this.currentFocus.includes(node)) {
            console.warn('Trying to focus on a node that is already focused')
            return
        }

        this.currentFocus.push(node)

        this.dirty = true

        if (this.currentFocus.length > 1) {
            setTimeout(() => this.updateFocus(), 200)
        } else {
            this.updateFocus()
        }
    }

    updateFocus() {
        if (!this.dirty) return

        /* --------------------- Clear focus -------------------- */
        if (this.currentFocus.length == 0) {
            for (const action of Object.values(Action.all)) {
                action.controller.clearFocus()
            }

            let views: View[] = []
            for (const action of Object.values(Action.all)) {
                if (action.steps.length > 0) {
                    views.push(action.view)
                }
            }

            for (const token of Editor.instance.getAllTokens()) {
                token.classList.remove('is-focused')
            }

            for (const view of views) {
                view.controller.clearFocus()
            }

            return
        }

        /* ------------------ Focus on actions ------------------ */
        let node = this.currentFocus[this.currentFocus.length - 1]

        for (const action of Object.values(Action.all)) {
            action.controller.unfocus()

            // If equals to node or node is a parent of the action
            if (
                action.execution.id == node.id ||
                queryExecutionGraph(node, (e) => e.id == action.execution.id)
            ) {
                action.controller.focus()
            }
            // If node is a child
            // else if (queryExecutionGraph(action.execution, (e) => e.id == node.id)) {
            //     if (
            //         !(
            //             action.execution.nodeData.type == 'ForStatement' &&
            //             node.nodeData.preLabel == 'Body'
            //         )
            //     ) {
            //         action.controller.focus(node)
            //     }
            // }
            // // If spatially related
            // else if (
            //     JSON.stringify(node.nodeData.location) ==
            //     JSON.stringify(action.execution.nodeData.location)
            // ) {
            //     action.controller.focus(null)
            // }
        }

        /* ------------------- Focus on tokens ------------------ */
        for (const token of Editor.instance.getAllTokens()) {
            token.classList.remove('is-focused')
        }

        const loc = node.nodeData.location

        const bbox = Editor.instance.computeBoundingBoxForLoc(loc)
        let padding = 20
        bbox.x -= padding
        bbox.y -= padding
        bbox.width += 2 * padding
        bbox.height += 2 * padding

        const els = Editor.instance.getContainedTokenElements(bbox)
        for (const el of els) {
            el.classList.add('is-focused')
        }

        /* ------------------- Focus on views ------------------- */
        let views: View[] = []
        for (const action of Object.values(Action.all)) {
            if (action.steps.length > 0) {
                views.push(action.view)
            }
        }

        // Unfocus all data in views and focus on writes
        const ws = new Set(writes(node).map((w) => w.id))
        const rs = new Set(reads(node).map((r) => r.id))

        for (const view of views) {
            view.controller.secondaryFocus(rs)
            view.controller.focus(ws)
        }
    }
}
