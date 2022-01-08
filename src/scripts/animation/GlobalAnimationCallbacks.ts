import { AnimationGraph } from './graph/AnimationGraph'
import { AnimationNode } from './primitive/AnimationNode'

export class GlobalAnimationCallbacks {
    // Singleton
    static instance: GlobalAnimationCallbacks

    // List of callbacks

    private seekCallbacks: {
        [id: string]: (
            animation: AnimationNode | AnimationGraph,
            t: number
        ) => any
    } = {}
    private beginCallbacks: {
        [id: string]: (animation: AnimationNode | AnimationGraph) => any
    } = {}
    private endCallbacks: {
        [id: string]: (animation: AnimationNode | AnimationGraph) => any
    } = {}
    private currId = 0

    static _initialize() {
        if (GlobalAnimationCallbacks.instance) return
        GlobalAnimationCallbacks.instance = new GlobalAnimationCallbacks()
    }

    constructor() {}

    registerSeekCallback(
        callback: (animation: AnimationNode | AnimationGraph, t: number) => any
    ) {
        this.currId++
        this.seekCallbacks[`GlobalSeekCallback_${this.currId}`] = callback
        return `GlobalSeekCallback_${this.currId}`
    }

    removeSeekCallback(from: string) {
        delete this.seekCallbacks[from]
    }

    registerBeginCallback(
        callback: (animation: AnimationNode | AnimationGraph) => any
    ) {
        this.currId++
        this.beginCallbacks[`GlobalBeginCallback_${this.currId}`] = callback
        return `GlobalBeginCallback_${this.currId}`
    }

    removeBeginCallback(from: string) {
        delete this.beginCallbacks[from]
    }

    registerEndCallback(
        callback: (animation: AnimationNode | AnimationGraph) => any
    ) {
        this.currId++
        this.endCallbacks[`GlobalEndCallback_${this.currId}`] = callback
        return `GlobalEndCallback_${this.currId}`
    }

    removeEndCallback(from: string) {
        delete this.endCallbacks[from]
    }

    seek(animation: AnimationGraph | AnimationNode, t: number) {
        for (const id of Object.keys(this.seekCallbacks)) {
            this.seekCallbacks[id](animation, t)
        }
    }

    begin(animation: AnimationGraph | AnimationNode) {
        for (const id of Object.keys(this.beginCallbacks)) {
            this.beginCallbacks[id](animation)
        }
    }

    end(animation: AnimationGraph | AnimationNode) {
        for (const id of Object.keys(this.endCallbacks)) {
            this.endCallbacks[id](animation)
        }
    }
}

GlobalAnimationCallbacks._initialize()
