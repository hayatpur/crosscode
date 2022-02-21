import { getAllBranches } from '../../execution/graph/abstraction/Transition'
import { AnimationTraceChain, getTrace } from '../../execution/graph/graph'
import { instanceOfExecutionNode } from '../../execution/primitive/ExecutionNode'
import { View } from '../View'
import { Trace } from './Trace'

// A collection of traces
export class TraceCollection {
    view: View

    traces: Trace[] = []
    selection: Set<string> = new Set()
    traceChains: AnimationTraceChain[]

    constructor(view: View) {
        this.view = view
    }

    select(selection: Set<string>) {
        // Highlight data that was modified
        this.selection = new Set([...this.selection, ...selection])
        for (const trace of this.traces) {
            if (this.selection.has(trace.chain.value.id)) {
                trace.select()
            } else {
                trace.deselect()
            }
        }
    }

    deselect() {
        for (const trace of this.traces) {
            trace.deselect()
        }
    }

    show() {
        if (instanceOfExecutionNode(this.view.originalExecution)) {
            console.warn('Trying to create trace for animation node.')
            return
        }

        if (this.traceChains == null) {
            this.traceChains = getTrace(this.view.originalExecution)
        }

        for (const chain of this.traceChains) {
            const branches = getAllBranches(chain)
            for (const branch of branches) {
                const trace = new Trace(this.view, branch)
                this.traces.push(trace)
            }
        }

        for (const trace of this.traces) {
            trace.show()
        }
    }

    hide() {
        for (const trace of this.traces) {
            trace.destroy()
        }

        this.traces = []
    }

    tick(dt: number) {
        for (const trace of this.traces) {
            trace.tick(dt)
        }
    }
}
