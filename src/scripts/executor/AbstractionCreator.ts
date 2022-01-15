import {
    AnimationGraph,
    instanceOfAnimationGraph,
} from '../animation/graph/AnimationGraph'
import {
    queryAllAnimationGraph,
    queryAnimationGraph,
} from '../animation/graph/graph'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../animation/primitive/AnimationNode'
import { Mouse } from '../utilities/Mouse'
import { Ticker } from '../utilities/Ticker'
import { Executor } from './Executor'

export enum AbstractionCreatorState {
    Inactive,
    Active,
    Pressed,
}

export class AbstractionCreator {
    cursor: HTMLDivElement

    state: AbstractionCreatorState

    selectionBounds: { x1: number; y1: number; x2: number; y2: number } = null
    selectionIndicator: HTMLDivElement
    selectionChunks: Set<string> = new Set()

    constructor() {
        this.cursor = document.createElement('div')
        this.cursor.classList.add('abstraction-cursor')
        document.body.appendChild(this.cursor)

        this.selectionIndicator = document.createElement('div')
        this.selectionIndicator.classList.add('abstraction-selection')
        document.body.appendChild(this.selectionIndicator)

        this.state = AbstractionCreatorState.Inactive

        Ticker.instance.registerTick(this.tick.bind(this))

        document.addEventListener('keydown', (e) => {
            if (e.key != 'Control') return

            if (this.state == AbstractionCreatorState.Inactive) {
                this.state = AbstractionCreatorState.Active
            }
        })

        document.addEventListener('keyup', (e) => {
            if (e.key != 'Control') return

            if (this.state == AbstractionCreatorState.Active) {
                this.state = AbstractionCreatorState.Inactive
            }
        })

        document.addEventListener('mousedown', (e) => {
            if (this.state == AbstractionCreatorState.Active) {
                this.state = AbstractionCreatorState.Pressed

                this.selectionBounds = {
                    x1: Mouse.instance.position.x,
                    y1: Mouse.instance.position.y,
                    x2: Mouse.instance.position.x,
                    y2: Mouse.instance.position.y,
                }
            }
        })

        document.addEventListener('mouseup', (e) => {
            if (this.state == AbstractionCreatorState.Pressed) {
                this.createAbstraction()

                this.state = AbstractionCreatorState.Active

                this.selectionBounds = null
            }
        })

        document.addEventListener('mousemove', (e) => {
            if (this.state == AbstractionCreatorState.Pressed) {
                this.selectionBounds.x2 = Mouse.instance.position.x
                this.selectionBounds.y2 = Mouse.instance.position.y

                e.preventDefault()

                return false
            } else {
                return true
            }
        })
    }

    tick(dt: number) {
        this.cursor.style.left = `${Mouse.instance.position.x - 5}px`
        this.cursor.style.top = `${Mouse.instance.position.y - 5}px`

        if (this.state == AbstractionCreatorState.Active) {
            this.cursor.classList.add('active')
        } else {
            this.cursor.classList.remove('active')
        }

        if (this.state == AbstractionCreatorState.Pressed) {
            this.selectionIndicator.classList.add('active')
            this.cursor.classList.add('pressed')

            const bbox = getBoundingBoxOfStartAndEnd(this.selectionBounds)

            this.selectionIndicator.style.width = `${bbox.width}px`
            this.selectionIndicator.style.height = `${bbox.height}px`
            this.selectionIndicator.style.left = `${bbox.x}px`
            this.selectionIndicator.style.top = `${bbox.y}px`
        } else {
            this.selectionIndicator.classList.remove('active')
            this.cursor.classList.remove('pressed')
        }

        const animation = Executor.instance.animation
        const editor = Executor.instance.editor

        if (animation != null) {
            const indicators = queryAllAnimationGraph(
                Executor.instance.animation,
                (animation) => instanceOfAnimationNode(animation)
            )

            for (const indicator of indicators) {
                if (indicator.isChunk) continue

                const location = indicator.nodeData.location
                const bbox = editor.computeBoundingBoxForLoc(location)

                const contains =
                    this.state == AbstractionCreatorState.Pressed &&
                    bboxContains(
                        this.selectionIndicator.getBoundingClientRect(),
                        bbox
                    )

                if (contains && !this.selectionChunks.has(indicator.id)) {
                    this.selectionChunks.add(indicator.id)
                } else if (
                    !contains &&
                    this.selectionChunks.has(indicator.id)
                ) {
                    this.selectionChunks.delete(indicator.id)
                }
            }
        }
    }

    createAbstraction() {
        let chunks = getDeepestChunks(
            Executor.instance.animation,
            this.selectionChunks
        )
        chunks = chunks.map((chunk) => stripChunk(chunk))
        console.log(chunks)

        for (const chunk of chunks) {
            Executor.instance.createAbstraction(chunk)
        }
    }
}

export function getBoundingBoxOfStartAndEnd(selection: {
    x1: number
    y1: number
    x2: number
    y2: number
}): { x: number; y: number; width: number; height: number } {
    const x = Math.min(selection.x1, selection.x2)
    const y = Math.min(selection.y1, selection.y2)
    const width = Math.abs(selection.x2 - selection.x1)
    const height = Math.abs(selection.y2 - selection.y1)

    return { x, y, width, height }
}

export function bboxContains(
    bbox1: {
        x: number
        y: number
        width: number
        height: number
    },
    bbox2: {
        x: number
        y: number
        width: number
        height: number
    }
): boolean {
    return (
        bbox1.x <= bbox2.x &&
        bbox1.y <= bbox2.y &&
        bbox1.x + bbox1.width >= bbox2.x + bbox2.width &&
        bbox1.y + bbox1.height >= bbox2.y + bbox2.height
    )
}

export function getDeepestChunks(
    animation: AnimationGraph | AnimationNode,
    selection: Set<string>
): (AnimationGraph | AnimationNode)[] {
    // Base cases
    if (selection.size == 0) {
        return []
    }

    if (instanceOfAnimationNode(animation)) {
        if (selection.has(animation.id) && selection.size == 1) {
            return [animation]
        } else {
            return []
        }
    }

    if (animation.vertices.length == 0) {
        return []
    } else if (animation.vertices.length == 1) {
        const deepestChunks = getDeepestChunks(animation.vertices[0], selection)
        if (
            deepestChunks.length == 1 &&
            deepestChunks[0].id == animation.vertices[0].id
        ) {
            return [animation]
        } else {
            return deepestChunks
        }
    }

    const childrenContains: Set<string>[] = []

    for (const child of animation.vertices) {
        const contains: Set<string> = new Set()
        for (const id of selection) {
            if (queryAnimationGraph(child, (node) => node.id == id) != null) {
                contains.add(id)
            }
        }

        if (contains.size == selection.size) {
            // Found a node that contains the selection, return the deepest chunk
            // in that node
            return getDeepestChunks(child, selection)
        } else {
            childrenContains.push(contains)
        }
    }

    // Selection is contained partially in every animation
    const allArePartiallyContained = childrenContains.every(
        (set) => set.size > 0
    )

    // Each of those partial containments are deepest chunks
    let allAreDeepestChunks = true
    let allDeepestChunks: (AnimationGraph | AnimationNode)[] = []
    for (let i = 0; i < childrenContains.length; i++) {
        const deepestChunks = getDeepestChunks(
            animation.vertices[i],
            childrenContains[i]
        )
        allDeepestChunks.push(...deepestChunks)

        if (
            deepestChunks.length != 1 ||
            deepestChunks[0].id != animation.vertices[i].id
        ) {
            allAreDeepestChunks = false
        }
    }

    if (allArePartiallyContained && allAreDeepestChunks) {
        return [animation]
    } else {
        return allDeepestChunks
    }
}

export function stripChunk(chunk: AnimationGraph | AnimationNode) {
    if (instanceOfAnimationGraph(chunk) && chunk.vertices.length == 1) {
        return stripChunk(chunk.vertices[0])
    }

    return chunk
}
