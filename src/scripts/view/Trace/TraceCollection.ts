import { AnimationTraceChain } from '../../execution/graph/graph'
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

        if (instanceOfExecutionNode(this.view.originalAnimation)) {
            console.warn('Trying to create trace for animation node.')
            return
        }

        // this.traceChains = getChunkTrace(this.view.originalAnimation)
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

    deselect(deselection: Set<string>) {
        for (const toRemove of deselection) {
            this.selection.delete(toRemove)
        }
        for (const trace of this.traces) {
            if (this.selection.has(trace.chain.value.id)) {
                trace.select()
            } else {
                trace.deselect()
            }
        }
    }

    show() {
        // for (const chain of this.traceChains) {
        //     const trace = new Trace(this.view, chain)
        //     this.traces.push(trace)
        // }

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
