```typescript

// Data describes all program variables and literals
interface Data: {
    name: string; // Name of variable, i.e. `arr[i]`
    type: DataType;
    reference?: Reference; // Reference in memory (does not exist for non-mutable objects)
    symbolic_reference: SymbolicReference; // Location of variable w.r.t others, i.e. `arr[0]`
    value: Data[] | Primitive;
    ast: ESTree.AST;
    path: any; // Call stack path
    member?: {parent: Data, index: number}; // Reference to parent if this is a member of an object
}

// Memory that describes state of declared variables with their scope
interface Scope: {
  /* e.g: [Program_0: {x: Data(...)},
          ForStatement_0: {i: Data(...)}] */
  static stack: Scope[];
  state: WeakMap<Reference, Data>;
}

// A container describes the DOM visual or visual layout
interface Container {
   element: HTMLElement,
   children: Container[]
}
interface ArrayContainer extends Container { ... }
interface LiteralContainer extends Container { ... }

// A view is a visual that can be placed in the canvas and is meant to describe visuals within a certain range of call stack
interface View {
  containers: Container[],
  range: [...],
}

// An animation is a set of rules / animations that are applied to a view to go from state A to state B
interface Animation {
  animations: (Animation | AnimationPrimitive)[];

  begin(view: View, initState?: Scope) {
    // Initializes view to contain everything in `initState`
  }

  seek(view, t) { ... }
  end(view) { ... }
}

// Example animation
class MoveAnimation(specifierA: SymbolicReference, specifierB: SymbolicReference) implements AnimationPrimitive {
  begin(view: View) {
    a: Data = view.find(specifierA)
    b: Data = view.find(specifierB)
    // ...
  }
  seek(t, view: View) {
    a: Data = view.find(specifierA)
    b: Data = view.find(specifierB)
    move(a, b, t);
    // ...
  }
  end(view: View) {
    // ...
  }
}

// What does the scope/state look like?

// example.js
let y = 2;
let x = [1, 2, y];

// t = 0
Stack: [2]
Heap: [0x5132: Stack[0]]

Environment<string, number>: {y: 2}
{ Global: {y: 2} }

class Environment {
  constructor() {}

  constructor(enclosing) {

  }
}


let z = 5; // reads: [], writes: [z]
let y = [z, 2, 3]; // reads: [z], writes: [y_0, y_2, y_3, y]
let temp = y[0]; // reads: [y_0], writes: [temp]


[z, 2, 3] // ['z', y_2, y_3]


```

Access into memory
(1) id (i.e. 0x42313)
(2) index (i.e. 0)
(3) symbol (i.e. 'y', '\_ArrayExpression')

Access into data
(1) index (i.e. 0)

```javascript
// Examples

let left = [1, 4, 5]
let right = [1, 2, 3]
let arr = []

// Break out of loop if any one of the array gets empty
while (left.length && right.length) {
    // Pick the smaller among the smallest element of left and right sub arrays
    if (left[0] < right[0]) {
        arr.push(left.shift())
    } else {
        arr.push(right.shift())
    }
}

// Concatenating the leftover elements
// (in case we didn't go through the entire left or right array)
let z = [...arr, ...left, ...right]
```

---

```javascript
function push(O, item) {
    let len = O.length
    O[len] = item
}

let left = [1, 4, 5]
{
    O = left
    item = 5

    let len = O.length
    O[len] = item
}
```

```javascript
function push(O, item) {
    let len = O.length
    O[len] = item
}

function pushn(O, n, item) {
    for (let i = 0; i < n; i++) {
        push(O, item)
    }
}

let left = [1, 4, 5]
let y = 5
pushn(left, 5, y)
```

> diff([1, 7, 2, 4]);
> 6
> diff([]);
> 0

    // Find all writes
    for (const vertex of animation.vertices) {
        for (const write of vertex.writes()) {
            if (trace[write.id] == null) {
                trace[write.id] = new Set();
            }

            const reads = vertex.reads();
            for (const read of reads) {
                trace[write.id].add(read.id);
            }
        }
    }

    // Propagate trace once
    for (const id of Object.keys(trace)) {
        const extra_writes = [];
        for (const write of trace[id]) {
            if (trace[write] != null) {
                extra_writes.push(...trace[write]);
            }
        }

        for (const write of extra_writes) {
            trace[id].add(write);
        }
    }

    // Filter out writes that are temporary (i.e. not in the endState)
    for (const id of Object.keys(trace)) {
        const value = endState.resolve({ type: AccessorType.ID, value: id }, null);
        if (value == null) delete trace[id];
    }
    for (const ids of Object.values(trace)) {
        for (const id of ids) {
            const value = endState.resolve({ type: AccessorType.ID, value: id }, null);
            if (value == null) ids.delete(id);
        }
    }

//@TODO

0. Fix animationToString of recursive functions

1. Record pre-condition, and post-condition

2. Clean up registers

3. Complete view renderer

4. Record reads & writes

// // Bubble-sort:
// // Maybe it's hard to move from low-level to high-level.
// // Easier to see the high-level first, and then move to the low-level.
// // Or, connection between animation and code is not very strong

// // Do you see visual feedback on if you're moving down?
// // These visual feedbacks are important during
// // "orient" user

// // Gradually dictate animations they want to see. Combine them, let user combine them in a way that fits their workflow.

TODO:

1. Get rid of memory as a list (so diffs become simpler)
2. Write a createDiffAnimation(diff) - SHOULD BE RECURSIVE - IE FOR RECURSIVE MEMORY function, which, for each diff, converts it to an animation
3. Construct an in-parallel graph of animations, and then animate them all at once
4. The problem is, you probably want separate animations, because these ones are not in dependency order.
   UNLESS YOU SET TO THE END STATE FIRST (SO THE DEPENDENCY ORDER DOES NOT MATTER, and THEN YOU CAN JUST PLAY A EASE-IN ANIMATION )

```javascript
function ack(m, n) {
    if (m === 0) {
        return n + 1
    }

    if (n === 0) {
        return ack(m - 1, 1)
    }

    if (m !== 0 && n !== 0) {
        return ack(m - 1, ack(m, n - 1))
    }
}

ack(2, 3)
```

const y = ack(3, 4);

[X] For chunking, get the start and the end

[ ] Transitions should not start from the post-condition and
then work backwards, they should describe the change.

[ ] Transitions should not contain items that do not change,
representation will handle that.

[ ] Visualize scopes
[ ] Create hard scopes, not just block scopes. Might need to define a global scope.

Notes:

-   Do abstractions before granularity

[ ] ALL animations should be post-effects, i.e. the state has already changed, the animation is just an offset

Abstraction: [G_1, <G_2, G_3>]

Lowest Abstraction: [AG2, AG8, AG13, AG20]
Highest Abstraction: [[AG2, AG8, AG13, AG20]]

Default Abstraction: [[AG2], [AG8, AG13, AG20]]

Down([[AG2], [AG8, AG13, AG20]], [AG8, AG13, AG20]): [[AG2], [AG8], [AG13], [AG20]]
Down([[AG2], [AG8, AG13, AG20]], [AG2]): [AG2*, [AG8, AG13, AG20]] *AG2 should be at its highest level of abstraction

[<AG(2)>]

[<AG(2)>, <AG(8), AG(13), AG(20)>]

Down([<AG(2)>, <AG(8), AG(13), AG(20)>], 2) => [<AG(2)>, <AG(8)>, <AG(13)>, <AG(20)>]
Up([<AG(2)>, <AG(8), AG(13), AG(20)>], <1, 2>) => [<AG(2), AG(8), AG(13), AG(20)>]

abstract([['AG(2)', 'AG(5)'], ['AG(8)']])

```javascript
let list = [1, 2, 3, 4]
let n = 4

for (let i = 0; i < n; i++) {
    let temp = list[i]
    list[i] = list[n - 1 - i]
    list[n - 1 - i] = temp
}
```

```javascript
function f(x) {
    if (x == 1) {
        return x
    } else {
        return x * f(x - 1)
    }
}

let y = f(5)
```

A view is independent of the animation. It is initially derived from the animation. They are inherently different data structures.

Program

-   Variable Declaration
    -   Variable Declarator
        -   Literal
        -   Move
        -   Bind
-   Variable Declaration

is the same as

['Program', ['VariableDeclaration', ['VariableDeclarator', ['Literal', 'x'], ['Literal', 1]]], 'VariableDeclaration']

```javascript
import { begin, duration, end, reset } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import { remap } from '../utilities/math'
import { clone } from '../utilities/objects'
import { AnimationRenderer } from './AnimationRenderer'

export class TimelineRenderer {
    // State
    time: number = 0
    paused: boolean = false
    speed: number = 1 / 48

    disabled: boolean = false

    animation: AnimationGraph | AnimationNode
    animationRenderer: AnimationRenderer

    // Rendering
    element: HTMLDivElement = null

    timelineBar: HTMLDivElement = null
    scrubber: HTMLDivElement = null

    playToggle: HTMLDivElement = null
    resetButton: HTMLDivElement = null

    constructor(
        animation: AnimationGraph | AnimationNode,
        animationRenderer: AnimationRenderer
    ) {
        this.element = document.createElement('div')
        this.element.classList.add('timeline')

        this.playToggle = document.createElement('div')
        this.playToggle.classList.add('timeline-button')
        this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
        this.element.appendChild(this.playToggle)

        this.resetButton = document.createElement('div')
        this.resetButton.classList.add('timeline-button')
        this.resetButton.innerHTML = '<ion-icon name="refresh"></ion-icon>'
        this.element.appendChild(this.resetButton)

        this.timelineBar = document.createElement('div')
        this.timelineBar.classList.add('timeline-bar')
        this.element.appendChild(this.timelineBar)

        this.scrubber = document.createElement('div')
        this.scrubber.classList.add('timeline-scrubber')
        this.timelineBar.appendChild(this.scrubber)

        this.animation = animation
        this.animationRenderer = animationRenderer

        // Setup bindings
        this.playToggle.addEventListener('click', () => {
            this.paused = !this.paused

            if (this.paused) {
                this.playToggle.innerHTML = '<ion-icon name="play"></ion-icon>'
            } else {
                this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
            }
        })

        this.resetButton.addEventListener('click', () => {
            reset(this.animation)
            this.time = 0

            this.animationRenderer.environment = clone(
                this.animation.precondition
            )
            this.animationRenderer.paths = {}
        })

        begin(this.animation, this.animationRenderer.environment)
        this.animation.isPlaying = true
    }

    destroy() {
        this.element.remove()
    }

    enable() {
        this.element.classList.remove('disabled')
        this.disabled = false
    }

    disable() {
        this.element.classList.add('disabled')
        this.disabled = true
    }

    tick(dt: number) {
        if (this.time >= duration(this.animation)) {
            if (this.animation.isPlaying) {
                end(this.animation, this.animationRenderer.environment)
                this.animation.isPlaying = false
            }

            // this.animationRenderer.showingFinalRenderers = true
        } else {
            this.animationRenderer.seek(this.time)
            if (!this.paused) this.time += dt * this.speed
        }

        const bbox = this.timelineBar.getBoundingClientRect()

        // Move scrubber over
        const x = remap(
            this.time,
            0,
            duration(this.animation),
            0,
            bbox.width - 5
        )
        this.scrubber.style.left = `${x}px`
    }

    updateAnimation(animation: AnimationGraph | AnimationNode) {
        this.animation = animation

        // Loop
        this.time = 0
        reset(this.animation)

        this.animationRenderer.updateAnimation(animation)

        begin(this.animation, this.animationRenderer.environment)
        this.animation.isPlaying = true
    }
}
```

```javascript
import { getBoxToBoxArrow } from 'perfect-arrows'
import { reset } from '../animation/animation'
import { GlobalAnimationCallbacks } from '../animation/GlobalAnimationCallbacks'
import { AbstractionSelection } from '../animation/graph/abstraction/Abstractor'
import {
    createTransition,
    createTransitionAnimationFromSelection,
} from '../animation/graph/abstraction/Transition'
import {
    AnimationGraph,
    instanceOfAnimationGraph,
} from '../animation/graph/AnimationGraph'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { TimelineRenderer } from '../environment/TimelineRenderer'
import { Executor } from '../executor/Executor'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { clone } from '../utilities/objects'

export interface ViewTransform {
    dragging: boolean
    position: {
        x: number
        y: number
    }
}

// A group view is a collection of leaf views
export interface ViewState {
    _type: 'ViewState'
    transform: ViewTransform

    collapsed: boolean
    showingSteps: boolean
    attached: boolean
    anchoredToCode: boolean
}

export class View {
    // State
    state: ViewState

    // Renderer
    element: HTMLDivElement // View element

    header: HTMLDivElement
    label: HTMLDivElement

    interactable: HTMLDivElement

    // Steps
    steps: View[] = []
    stepsContainer: HTMLDivElement

    // Controls
    controlElement: HTMLDivElement
    stepsToggle: HTMLDivElement
    collapseToggle: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Misc
    private previousMouse: { x: number; y: number }
    private compiledAnimation: AnimationGraph | AnimationNode = null
    private animationRenderer: AnimationRenderer = null
    private timelineRenderer: TimelineRenderer = null
    private previousAbstractionSelection: string = null

    animation: AnimationGraph | AnimationNode

    // Start, end, and connection
    startNode: HTMLDivElement
    endNode: HTMLDivElement
    connection: SVGPathElement

    // Global animation callbacks
    private beginId: string
    private seekId: string
    private endId: string

    constructor(
        animation: AnimationGraph | AnimationNode,
        collapsed: boolean = false,
        attached: HTMLDivElement = null,
        anchoredToCode: boolean = true
    ) {
        // Initial state
        this.state = {
            _type: 'ViewState',
            transform: { dragging: false, position: { x: 0, y: 0 } },
            collapsed: collapsed,
            showingSteps: false,
            attached: false,
            anchoredToCode: anchoredToCode,
        }

        // Complete animation
        this.animation = animation

        // Default transition animation
        this.compiledAnimation = createTransition(clone(animation))

        // Element
        this.element = document.createElement('div')
        this.element.classList.add('view')

        // Attach
        if (attached !== null) {
            this.attach(attached)
        } else {
            this.detach()
        }

        // Header
        this.header = document.createElement('div')
        this.header.classList.add('view-header')
        this.element.appendChild(this.header)

        this.setupConnection()

        this.label = document.createElement('div')
        this.label.classList.add('view-label')
        this.header.appendChild(this.label)

        this.stepsContainer = document.createElement('div')
        this.stepsContainer.classList.add('view-steps-container')
        this.element.appendChild(this.stepsContainer)

        this.setupStepsToggle()
        this.setupCollapseToggle()

        // Bind mouse events
        this.bindMouseEvents()

        this.label.innerHTML = (
            instanceOfAnimationNode(animation)
                ? animation.name
                : animation.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()

        if (this.state.showingSteps) {
            this.createSteps()
        }

        // Body
        this.viewBody = document.createElement('div')
        this.viewBody.classList.add('view-body')
        this.element.appendChild(this.viewBody)

        // Setup the controls
        this.setupControls()

        if (this.state.collapsed) {
            this.collapse()
        } else {
            this.expand()
        }

        // Global animation callbacks
        this.setupGlobalAnimationCallbacks()
    }

    attach(parent: HTMLDivElement) {
        this.state.attached = true
        parent.appendChild(this.element)
        this.element.classList.add('attached')
    }

    detach() {
        this.state.attached = false
        this.element.classList.remove('attached')
        document.body.appendChild(this.element)
    }

    expand() {
        reset(this.compiledAnimation)

        this.state.collapsed = false

        this.animationRenderer = new AnimationRenderer(this.compiledAnimation)
        this.viewBody.appendChild(this.animationRenderer.element)

        this.timelineRenderer = new TimelineRenderer(
            this.compiledAnimation,
            this.animationRenderer
        )

        this.timelineRenderer.disable()
        this.viewBody.appendChild(this.timelineRenderer.element)

        this.element.classList.remove('collapsed')
        this.controlElement.classList.remove('disabled')

        this.endNode.classList.add('expanded')
        this.stepsContainer.classList.add('expanded')
    }

    collapse() {
        this.state.collapsed = true

        this.timelineRenderer?.destroy()
        this.animationRenderer?.destroy()

        this.timelineRenderer = null
        this.animationRenderer = null

        this.element.classList.add('collapsed')
        this.controlElement.classList.add('disabled')

        this.endNode.classList.remove('expanded')
        this.stepsContainer.classList.remove('expanded')
    }

    tick(dt: number) {
        // Update left
        const left = lerp(
            getNumericalValueOfStyle(this.element.style.left),
            this.state.transform.position.x,
            0.2
        )

        // Update right
        const top = lerp(
            getNumericalValueOfStyle(this.element.style.top),
            this.state.transform.position.y,
            0.2
        )

        // Update top
        this.element.style.left = `${left}px`
        this.element.style.top = `${top}px`

        if (this.state.anchoredToCode) {
            this.updateConnection()
        }

        // Update animation
        // TODO: Make this part of an animation layer

        this.updateEndNode()

        if (!this.state.collapsed) {
            this.timelineRenderer.tick(dt)
        }

        if (
            this.previousAbstractionSelection !=
            JSON.stringify(this.getAbstractionSelection())
        ) {
            this.previousAbstractionSelection = JSON.stringify(
                this.getAbstractionSelection()
            )
            this.updateAnimation()
        }
    }

    updateEndNode() {
        if (this.state.collapsed) {
            this.endNode.style.left = `${-9}px`
            this.endNode.style.top = `${13}px`
            this.endNode.style.width = `${5}px`
            this.endNode.style.height = `${5}px`
        } else {
            const bodyBBox = this.viewBody.getBoundingClientRect()
            const bbox = this.element.getBoundingClientRect()

            this.endNode.style.left = `${bodyBBox.x - bbox.x}px`
            this.endNode.style.top = `${bodyBBox.y - bbox.y}px`
            this.endNode.style.width = `${bodyBBox.width}px`
            this.endNode.style.height = `${bodyBBox.height}px`
        }
    }

    updateConnection() {
        const start = this.startNode.getBoundingClientRect()
        const end = this.endNode.getBoundingClientRect()

        // Arrow
        const arrow = getBoxToBoxArrow(
            start.x,
            start.y,
            start.width,
            start.height,
            end.x,
            end.y,
            end.width,
            end.height,
            { padEnd: 0 }
        )

        const [sx, sy, cx, cy, ex, ey, ae, as, sc] = arrow

        this.connection.setAttribute(
            'd',
            `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
        )
    }

    bindMouseEvents() {
        // Bind mouse events
        const node = this.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    mousedown(e: MouseEvent) {
        this.state.transform.dragging = true
        this.element.classList.add('dragging')

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseup(e: MouseEvent) {
        if (this.state.transform.dragging) {
            this.state.transform.dragging = false
            this.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        const mouse = { x: e.x, y: e.y }

        if (this.state.transform.dragging) {
            this.state.transform.position.x += mouse.x - this.previousMouse.x
            this.state.transform.position.y += mouse.y - this.previousMouse.y
        }

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseover(e: MouseEvent) {}

    mouseout(e: MouseEvent) {}

    setupControls() {
        this.controlElement = document.createElement('div')
        this.controlElement.classList.add('view-controls')
        this.element.appendChild(this.controlElement)

        this.viewBody.addEventListener('mouseenter', (e) => {
            if (!this.state.collapsed && this.timelineRenderer.disabled) {
                this.timelineRenderer.enable()
            }
        })

        this.viewBody.addEventListener('mouseleave', (e) => {
            if (!this.state.collapsed && !this.timelineRenderer.disabled) {
                this.timelineRenderer.disable()
            }
        })

        // Timing toggle
        // const timingToggle = document.createElement('div')
        // timingToggle.classList.add('view-control-button')
        // timingToggle.innerHTML = '<ion-icon name="time-outline"></ion-icon>'

        // timingToggle.addEventListener('click', () => {
        //     if (this.timelineRenderer.disabled) {
        //         this.timelineRenderer.enable()
        //         timingToggle.classList.add('active')
        //     } else {
        //         this.timelineRenderer.disable()
        //         timingToggle.classList.remove('active')
        //     }
        // })

        // this.controlElement.appendChild(timingToggle)
    }

    setupStepsToggle() {
        this.stepsToggle = document.createElement('div')
        this.stepsToggle.classList.add('view-control-button')
        this.stepsToggle.innerHTML =
            '<ion-icon name="chevron-forward"></ion-icon>'
        this.header.appendChild(this.stepsToggle)

        this.stepsToggle.addEventListener('click', () => {
            if (this.state.showingSteps) {
                this.destroySteps()
                this.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-forward"></ion-icon>'
            } else {
                this.createSteps()
                this.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-down"></ion-icon>'
            }
            this.stepsToggle.classList.toggle('active')
        })
    }

    setupCollapseToggle() {
        this.collapseToggle = document.createElement('div')
        this.collapseToggle.classList.add('view-control-button')
        this.collapseToggle.innerHTML = '<ion-icon name="add"></ion-icon>'
        this.header.appendChild(this.collapseToggle)
        this.collapseToggle.addEventListener('click', () => {
            if (!this.state.collapsed) {
                this.collapse()
                this.collapseToggle.innerHTML =
                    '<ion-icon name="add"></ion-icon>'
            } else {
                this.expand()
                this.collapseToggle.innerHTML =
                    '<ion-icon name="remove"></ion-icon>'
            }
            this.collapseToggle.classList.toggle('active')
        })
    }

    setupConnection() {
        this.startNode = document.createElement('div')
        this.startNode.classList.add('view-start-node')

        if (this.state.anchoredToCode) {
            const location = this.animation.nodeData.location
            const bbox = Editor.instance.computeBoundingBoxForLoc(location)

            this.state.transform.position.x = bbox.x + bbox.width + 100
            this.state.transform.position.y = bbox.y - 30
            this.element.style.left = `${this.state.transform.position.x}px`
            this.element.style.top = `${this.state.transform.position.y}px`

            const indicatorBbox =
                Editor.instance.computeBoundingBoxForLoc(location)
            indicatorBbox.x -= 5
            indicatorBbox.width += 10

            this.startNode.style.top = `${indicatorBbox.y}px`
            this.startNode.style.left = `${indicatorBbox.x}px`
            this.startNode.style.width = `${indicatorBbox.width}px`
            this.startNode.style.height = `${indicatorBbox.height}px`

            this.startNode.classList.add('code')

            document.body.appendChild(this.startNode)
        } else {
            this.element.appendChild(this.startNode)
        }

        this.endNode = document.createElement('div')
        this.endNode.classList.add('view-end-node')
        this.element.appendChild(this.endNode)

        // The connection path
        this.connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.connection.classList.add('connection-path')

        // Add them to global svg canvas
        const svg = document.getElementById('svg-canvas')
        svg.append(this.connection)
    }

    createSteps() {
        this.state.showingSteps = true
        this.stepsContainer.classList.remove('hidden')

        if (instanceOfAnimationGraph(this.animation)) {
            for (const child of this.animation.vertices) {
                const step = new View(child, true, this.stepsContainer, false)
                this.steps.push(step)

                Executor.instance.view.addView(step)
            }
        } else {
            // TODO: Add steps for other types of animations
        }

        this.element.classList.add('showing-steps')
    }

    destroySteps() {
        this.state.showingSteps = false
        this.stepsContainer.classList.add('hidden')

        this.steps.forEach((step) => {
            step.destroy()
        })

        this.steps = []

        this.element.classList.remove('showing-steps')
    }

    destroy() {
        this.removeGlobalAnimationCallbacks()

        this.collapse()
        this.destroySteps()

        this.element.remove()
        this.element = null

        Executor.instance.view.removeView(this)
    }

    getAbstractionSelection(): AbstractionSelection {
        if (
            !this.state.showingSteps ||
            instanceOfAnimationNode(this.animation)
        ) {
            return {
                id: this.animation.id,
                selection: null,
            }
        }

        const selection: AbstractionSelection = {
            id: this.animation.id,
            selection: [],
        }

        for (const step of this.steps) {
            selection.selection.push(step.getAbstractionSelection())
        }

        return selection
    }

    updateAnimation() {
        const selection = this.getAbstractionSelection()
        const animation = createTransitionAnimationFromSelection(
            clone(this.animation),
            selection
        )

        this.compiledAnimation = animation

        this.timelineRenderer?.updateAnimation(animation)
    }

    setupGlobalAnimationCallbacks() {
        this.beginId = GlobalAnimationCallbacks.instance.registerBeginCallback(
            (animation) => {
                // console.log(
                //     'Begin',
                //     this.label.innerText,
                //     this.compiledAnimation.id,
                //     animation.id
                // )
                if (this.compiledAnimation.id == animation.id) {
                    this.element.classList.add('playing')
                }
            }
        )

        this.endId = GlobalAnimationCallbacks.instance.registerEndCallback(
            (animation) => {
                // console.log(
                //     'End',
                //     this.label.innerText,
                //     this.compiledAnimation.id,
                //     animation.id
                // )
                if (this.compiledAnimation.id == animation.id) {
                    this.element.classList.remove('playing')
                }
            }
        )
    }

    removeGlobalAnimationCallbacks() {
        GlobalAnimationCallbacks.instance.removeBeginCallback(this.beginId)
        GlobalAnimationCallbacks.instance.removeEndCallback(this.endId)
    }
}
```

```javascript
import { reads, seek, writes } from '../animation/animation'
import { AnimationGraph } from '../animation/graph/AnimationGraph'
import { AnimationNode } from '../animation/primitive/AnimationNode'
import {
    beginConcretePath,
    ConcretePath,
    createConcretePath,
    endConcretePath,
    seekConcretePath,
} from '../path/path'
import { getPathFromEnvironmentRepresentation } from '../representation/representation'
import { clone } from '../utilities/objects'
import { EnvironmentRenderer } from './EnvironmentRenderer'
import { PrototypicalEnvironmentState } from './EnvironmentState'

export interface AnimationRendererRepresentation {
    exclude: string[] | null // List of data ids to exclude from the representation, or null to include all
    include: string[] | null // List of data ids to include in the representation, or null to include all, prioritized over exclude
}

export class AnimationRenderer {
    // State
    animation: AnimationGraph | AnimationNode
    representation: AnimationRendererRepresentation = null

    paths: { [id: string]: ConcretePath } = {}

    // Rendering
    environmentRenderers: EnvironmentRenderer[] = []
    finalEnvironmentRenderers: EnvironmentRenderer[] = []

    environment: PrototypicalEnvironmentState = null
    element: HTMLDivElement = null

    finalRenderersElement: HTMLDivElement = null

    showingFinalRenderers: boolean = false

    constructor(animation: AnimationGraph | AnimationNode) {
        this.element = document.createElement('div')
        this.element.classList.add('animation-renderer')

        this.finalRenderersElement = document.createElement('div')
        this.finalRenderersElement.classList.add('animation-renderers-final')
        this.element.appendChild(this.finalRenderersElement)

        this.environmentRenderers.push(new EnvironmentRenderer())
        this.environmentRenderers.forEach((r) =>
            this.element.appendChild(r.element)
        )

        this.finalEnvironmentRenderers.push(new EnvironmentRenderer())
        this.finalEnvironmentRenderers.forEach((r) =>
            this.finalRenderersElement.appendChild(r.element)
        )

        this.animation = animation
        this.environment = clone(this.animation.precondition)

        // Create representations
        this.updateRepresentation()
    }

    updateRepresentation() {
        this.representation = {
            exclude: null,
            include: [
                ...reads(this.animation).map((r) => r.id),
                ...writes(this.animation).map((w) => w.id),
            ],
        }
    }

    updateAnimation(animation: AnimationGraph | AnimationNode) {
        this.animation = animation

        this.environment = clone(this.animation.precondition)
        this.paths = {}
        this.updateRepresentation()
    }

    destroy() {
        this.environmentRenderers.forEach((r) => r.destroy())
        this.finalEnvironmentRenderers.forEach((r) => r.destroy())
        this.element.remove()
    }

    seek(t: number) {
        // Apply animation
        seek(this.animation, this.environment, t)

        for (const r of this.environmentRenderers) {
            r.setState(this.environment, this.representation)
            this.propagateEnvironmentPaths(this.environment, r)
        }

        if (this.showingFinalRenderers) {
            for (const r of this.finalEnvironmentRenderers) {
                r.setState(this.animation.postcondition, this.representation)
            }

            const bbox = this.finalRenderersElement.getBoundingClientRect()
            this.element.style.minWidth = `${bbox.width}px`
        }
    }

    propagateEnvironmentPaths(
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) {
        // Hit test
        const hits = new Set()

        for (const id of Object.keys(environment.paths)) {
            const prototype = environment.paths[id]
            let concrete = this.paths[id]

            if (concrete == null) {
                // Need to create a path in the concrete environment
                concrete = createConcretePath(prototype)
                this.paths[id] = concrete
            }

            hits.add(id)
            this.propagatePath(concrete, environment, renderer)
        }

        // Remove paths that are no longer in the view
        for (const id in Object.keys(environment.paths)) {
            if (!hits.has(id)) {
                delete environment.paths[id]
            }
        }
    }

    propagatePath(
        path: ConcretePath,
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) {
        const representation = getPathFromEnvironmentRepresentation(
            this.representation,
            path.prototype
        )

        path.onBegin = representation.onBegin
        path.onEnd = representation.onEnd
        path.onSeek = representation.onSeek

        // Sync the timings of prototype path and concrete path
        if (!path.meta.isPlaying && path.prototype.meta.isPlaying) {
            beginConcretePath(path, environment, renderer)
            path.meta.isPlaying = true
        } else if (path.prototype.meta.isPlaying) {
            seekConcretePath(path, environment, renderer, path.prototype.meta.t)
        }

        if (!path.meta.hasPlayed && path.prototype.meta.hasPlayed) {
            endConcretePath(path, environment, renderer)
            path.meta.hasPlayed = true
        }
    }
}

```

NEW

```javascript
import { getBoxToBoxArrow } from 'perfect-arrows'
import { begin, duration, end, reset, seek } from '../animation/animation'
import { GlobalAnimationCallbacks } from '../animation/GlobalAnimationCallbacks'
import { AbstractionSelection } from '../animation/graph/abstraction/Abstractor'
import { createTransition } from '../animation/graph/abstraction/Transition'
import {
    AnimationGraph,
    instanceOfAnimationGraph,
} from '../animation/graph/AnimationGraph'
import {
    AnimationNode,
    instanceOfAnimationNode,
} from '../animation/primitive/AnimationNode'
import { Editor } from '../editor/Editor'
import { AnimationRenderer } from '../environment/AnimationRenderer'
import { Timeline } from '../environment/Timeline'
import { Executor } from '../executor/Executor'
import { getNumericalValueOfStyle, lerp } from '../utilities/math'
import { clone } from '../utilities/objects'

export interface ViewTransform {
    dragging: boolean
    position: {
        x: number
        y: number
    }
}

// A group view is a collection of leaf views
export interface ViewState {
    _type: 'ViewState'
    transform: ViewTransform

    collapsed: boolean
    showingSteps: boolean
    attached: boolean
    anchoredToCode: boolean
}

export class View {
    // State
    state: ViewState

    // Renderer
    element: HTMLDivElement // View element

    header: HTMLDivElement
    label: HTMLDivElement

    interactable: HTMLDivElement

    // Steps
    steps: View[] = []
    stepsContainer: HTMLDivElement

    // Controls
    controlElement: HTMLDivElement
    stepsToggle: HTMLDivElement
    collapseToggle: HTMLDivElement

    // Body
    viewBody: HTMLDivElement

    // Misc
    private previousMouse: { x: number; y: number }

    private previousAbstractionSelection: string = null

    // Original animation, only used to derive compiled animation
    originalAnimation: AnimationGraph | AnimationNode

    // Transition animation, used when this view's steps are not shown
    transitionAnimation: AnimationGraph | AnimationNode = null

    // Start, end, and connection
    startNode: HTMLDivElement
    endNode: HTMLDivElement
    connection: SVGPathElement

    // Global animation callbacks
    private beginId: string
    private seekId: string
    private endId: string

    // Time
    private timelineRenderer: Timeline = null
    private resetButton: HTMLDivElement
    time: number = 0
    paused: boolean = false
    speed: number = 1 / 48
    isPlaying: boolean = false
    hasPlayed: boolean = false

    // Animation
    private animationRenderer: AnimationRenderer

    constructor(
        originalAnimation: AnimationGraph | AnimationNode,
        collapsed: boolean = false,
        attached: HTMLDivElement = null,
        anchoredToCode: boolean = true
    ) {
        // Initial state
        this.state = {
            _type: 'ViewState',
            transform: { dragging: false, position: { x: 0, y: 0 } },
            collapsed: collapsed,
            showingSteps: false,
            attached: false,
            anchoredToCode: anchoredToCode,
        }

        // Complete animation
        this.originalAnimation = originalAnimation

        // Default transition animation
        this.transitionAnimation = createTransition(clone(originalAnimation))

        // Element
        this.element = document.createElement('div')
        this.element.classList.add('view')

        // Attach
        if (attached !== null) {
            this.attach(attached)
        } else {
            this.detach()
        }

        // Header
        this.header = document.createElement('div')
        this.header.classList.add('view-header')
        this.element.appendChild(this.header)

        this.setupConnection()

        this.label = document.createElement('div')
        this.label.classList.add('view-label')
        this.header.appendChild(this.label)

        this.stepsContainer = document.createElement('div')
        this.stepsContainer.classList.add('view-steps-container')
        this.element.appendChild(this.stepsContainer)

        this.setupStepsToggle()
        this.setupCollapseToggle()
        this.setupResetButton()

        // Bind mouse events
        this.bindMouseEvents()

        this.label.innerHTML = (
            instanceOfAnimationNode(originalAnimation)
                ? originalAnimation.name
                : originalAnimation.nodeData.type
        )
            .replace(/([A-Z])/g, ' $1')
            .trim()

        if (this.state.showingSteps) {
            this.createSteps()
        }

        // Body
        this.viewBody = document.createElement('div')
        this.viewBody.classList.add('view-body')
        this.element.appendChild(this.viewBody)

        // Setup the controls
        this.setupControls()

        this.timelineRenderer = new Timeline(this)

        if (this.state.collapsed) {
            this.collapse()
        } else {
            this.expand()
        }

        // Global animation callbacks
        this.setupGlobalAnimationCallbacks()
    }

    attach(parent: HTMLDivElement) {
        this.state.attached = true
        parent.appendChild(this.element)
        this.element.classList.add('attached')
    }

    detach() {
        this.state.attached = false
        this.element.classList.remove('attached')
        document.body.appendChild(this.element)
    }

    expand() {
        this.state.collapsed = false

        this.animationRenderer = new AnimationRenderer(this)
        this.viewBody.appendChild(this.animationRenderer.element)
        this.viewBody.appendChild(this.timelineRenderer.element)

        this.element.classList.remove('collapsed')
        this.controlElement.classList.remove('disabled')

        this.endNode.classList.add('expanded')
        this.stepsContainer.classList.add('expanded')
    }

    collapse() {
        this.state.collapsed = true

        this.animationRenderer?.destroy()
        this.animationRenderer = null

        this.timelineRenderer.element.remove()

        this.element.classList.add('collapsed')
        this.controlElement.classList.add('disabled')

        this.endNode.classList.remove('expanded')
        this.stepsContainer.classList.remove('expanded')
    }

    updatePosition() {
        // Update left
        const left = lerp(
            getNumericalValueOfStyle(this.element.style.left),
            this.state.transform.position.x,
            0.2
        )

        // Update right
        const top = lerp(
            getNumericalValueOfStyle(this.element.style.top),
            this.state.transform.position.y,
            0.2
        )

        // Update top
        this.element.style.left = `${left}px`
        this.element.style.top = `${top}px`

        if (this.state.anchoredToCode) {
            this.updateConnection()
        }
    }

    tick(dt: number) {
        this.updatePosition()

        // Update animation
        // TODO: Make this part of an animation layer
        this.updateEndNode()

        // If steps were changed
        if (
            this.previousAbstractionSelection !=
            JSON.stringify(this.getAbstractionSelection())
        ) {
            this.previousAbstractionSelection = JSON.stringify(
                this.getAbstractionSelection()
            )
            this.resetAnimation([])
        }

        // Update time
        this.timelineRenderer.tick(dt)

        // Seek into animation
        if (this.time > this.getDuration()) {
            if (this.isPlaying) {
                this.endAnimation([])
            }
            // this.animationRenderer.showingFinalRenderers = true
        } else {
            if (this.state.anchoredToCode) {
                this.seekAnimation(this.time, [])

                if (!this.paused) {
                    this.time += dt * this.speed
                }
            }
        }
    }

    getDuration() {
        if (this.getAbstractionSelection().selection == null) {
            return duration(this.transitionAnimation)
        } else {
            let duration = 0
            for (const step of this.steps) {
                duration += step.getDuration()
            }
            return duration
        }
    }

    updateEndNode() {
        if (this.state.collapsed) {
            this.endNode.style.left = `${-9}px`
            this.endNode.style.top = `${13}px`
            this.endNode.style.width = `${5}px`
            this.endNode.style.height = `${5}px`
        } else {
            const bodyBBox = this.viewBody.getBoundingClientRect()
            const bbox = this.element.getBoundingClientRect()

            this.endNode.style.left = `${bodyBBox.x - bbox.x}px`
            this.endNode.style.top = `${bodyBBox.y - bbox.y}px`
            this.endNode.style.width = `${bodyBBox.width}px`
            this.endNode.style.height = `${bodyBBox.height}px`
        }
    }

    updateConnection() {
        const start = this.startNode.getBoundingClientRect()
        const end = this.endNode.getBoundingClientRect()

        // Arrow
        const arrow = getBoxToBoxArrow(
            start.x,
            start.y,
            start.width,
            start.height,
            end.x,
            end.y,
            end.width,
            end.height,
            { padEnd: 0 }
        )

        const [sx, sy, cx, cy, ex, ey, ae, as, sc] = arrow

        this.connection.setAttribute(
            'd',
            `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`
        )
    }

    bindMouseEvents() {
        // Bind mouse events
        const node = this.label

        node.addEventListener('mousedown', this.mousedown.bind(this))
        node.addEventListener('mouseover', this.mouseover.bind(this))
        node.addEventListener('mouseout', this.mouseout.bind(this))

        document.body.addEventListener('mouseup', this.mouseup.bind(this))
        document.body.addEventListener('mousemove', this.mousemove.bind(this))
    }

    mousedown(e: MouseEvent) {
        this.state.transform.dragging = true
        this.element.classList.add('dragging')

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseup(e: MouseEvent) {
        if (this.state.transform.dragging) {
            this.state.transform.dragging = false
            this.element.classList.remove('dragging')
        }
    }

    mousemove(e: MouseEvent) {
        const mouse = { x: e.x, y: e.y }

        if (this.state.transform.dragging) {
            this.state.transform.position.x += mouse.x - this.previousMouse.x
            this.state.transform.position.y += mouse.y - this.previousMouse.y
        }

        this.previousMouse = {
            x: e.x,
            y: e.y,
        }
    }

    mouseover(e: MouseEvent) {}

    mouseout(e: MouseEvent) {}

    setupControls() {
        this.controlElement = document.createElement('div')
        this.controlElement.classList.add('view-controls')
        this.element.appendChild(this.controlElement)

        this.viewBody.addEventListener('mouseenter', (e) => {
            if (!this.state.collapsed && this.timelineRenderer.disabled) {
                this.timelineRenderer.enable()
            }
        })

        this.viewBody.addEventListener('mouseleave', (e) => {
            if (!this.state.collapsed && !this.timelineRenderer.disabled) {
                this.timelineRenderer.disable()
            }
        })

        // Timing toggle
        // const timingToggle = document.createElement('div')
        // timingToggle.classList.add('view-control-button')
        // timingToggle.innerHTML = '<ion-icon name="time-outline"></ion-icon>'

        // timingToggle.addEventListener('click', () => {
        //     if (this.timelineRenderer.disabled) {
        //         this.timelineRenderer.enable()
        //         timingToggle.classList.add('active')
        //     } else {
        //         this.timelineRenderer.disable()
        //         timingToggle.classList.remove('active')
        //     }
        // })

        // this.controlElement.appendChild(timingToggle)
    }

    setupStepsToggle() {
        this.stepsToggle = document.createElement('div')
        this.stepsToggle.classList.add('view-control-button')
        this.stepsToggle.innerHTML =
            '<ion-icon name="chevron-forward"></ion-icon>'
        this.header.appendChild(this.stepsToggle)

        this.stepsToggle.addEventListener('click', () => {
            if (this.state.showingSteps) {
                this.destroySteps()
                this.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-forward"></ion-icon>'
            } else {
                this.createSteps()
                this.stepsToggle.innerHTML =
                    '<ion-icon name="chevron-down"></ion-icon>'
            }
            this.stepsToggle.classList.toggle('active')
        })
    }

    setupCollapseToggle() {
        this.collapseToggle = document.createElement('div')
        this.collapseToggle.classList.add('view-control-button')
        this.collapseToggle.innerHTML = '<ion-icon name="add"></ion-icon>'
        this.header.appendChild(this.collapseToggle)
        this.collapseToggle.addEventListener('click', () => {
            if (!this.state.collapsed) {
                this.collapse()
                this.collapseToggle.innerHTML =
                    '<ion-icon name="add"></ion-icon>'
            } else {
                this.expand()
                this.collapseToggle.innerHTML =
                    '<ion-icon name="remove"></ion-icon>'
            }
            this.collapseToggle.classList.toggle('active')
        })
    }

    setupResetButton() {
        this.resetButton = document.createElement('div')
        this.resetButton.classList.add('view-control-button')
        this.resetButton.innerHTML = '<ion-icon name="refresh"></ion-icon>'
        this.header.appendChild(this.resetButton)

        this.resetButton.addEventListener('click', () => {
            this.resetAnimation([])
        })
    }

    setupConnection() {
        this.startNode = document.createElement('div')
        this.startNode.classList.add('view-start-node')

        if (this.state.anchoredToCode) {
            const location = this.transitionAnimation.nodeData.location
            const bbox = Editor.instance.computeBoundingBoxForLoc(location)

            this.state.transform.position.x = bbox.x + bbox.width + 100
            this.state.transform.position.y = bbox.y - 30
            this.element.style.left = `${this.state.transform.position.x}px`
            this.element.style.top = `${this.state.transform.position.y}px`

            const indicatorBbox =
                Editor.instance.computeBoundingBoxForLoc(location)
            indicatorBbox.x -= 5
            indicatorBbox.width += 10

            this.startNode.style.top = `${indicatorBbox.y}px`
            this.startNode.style.left = `${indicatorBbox.x}px`
            this.startNode.style.width = `${indicatorBbox.width}px`
            this.startNode.style.height = `${indicatorBbox.height}px`

            this.startNode.classList.add('code')

            document.body.appendChild(this.startNode)
        } else {
            this.element.appendChild(this.startNode)
        }

        this.endNode = document.createElement('div')
        this.endNode.classList.add('view-end-node')
        this.element.appendChild(this.endNode)

        // The connection path
        this.connection = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'path'
        )
        this.connection.classList.add('connection-path')

        // Add them to global svg canvas
        const svg = document.getElementById('svg-canvas')
        svg.append(this.connection)
    }

    createSteps() {
        this.state.showingSteps = true
        this.stepsContainer.classList.remove('hidden')

        if (instanceOfAnimationGraph(this.originalAnimation)) {
            for (const child of this.originalAnimation.vertices) {
                const step = new View(child, true, this.stepsContainer, false)
                this.steps.push(step)

                Executor.instance.view.addView(step)
            }
        } else {
            // TODO: Add steps for other types of animations
        }

        this.element.classList.add('showing-steps')
    }

    destroySteps() {
        this.state.showingSteps = false
        this.stepsContainer.classList.add('hidden')

        this.steps.forEach((step) => {
            step.destroy()
        })

        this.steps = []

        this.element.classList.remove('showing-steps')
    }

    destroy() {
        this.removeGlobalAnimationCallbacks()

        this.collapse()
        this.destroySteps()

        this.element.remove()
        this.element = null

        Executor.instance.view.removeView(this)
    }

    getAbstractionSelection(): AbstractionSelection {
        if (
            !this.state.showingSteps ||
            instanceOfAnimationNode(this.originalAnimation)
        ) {
            return {
                id: this.originalAnimation.id,
                selection: null,
            }
        }

        const selection: AbstractionSelection = {
            id: this.originalAnimation.id,
            selection: [],
        }

        for (const step of this.steps) {
            selection.selection.push(step.getAbstractionSelection())
        }

        return selection
    }

    setupGlobalAnimationCallbacks() {
        // this.beginId = GlobalAnimationCallbacks.instance.registerBeginCallback(
        //     (animation) => {
        //         // console.log(
        //         //     'Begin',
        //         //     this.label.innerText,
        //         //     this.compiledAnimation.id,
        //         //     animation.id
        //         // )
        //         if (this.compiledAnimation.id == animation.id) {
        //             this.element.classList.add('playing')
        //         }
        //     }
        // )
        // this.endId = GlobalAnimationCallbacks.instance.registerEndCallback(
        //     (animation) => {
        //         // console.log(
        //         //     'End',
        //         //     this.label.innerText,
        //         //     this.compiledAnimation.id,
        //         //     animation.id
        //         // )
        //         if (this.compiledAnimation.id == animation.id) {
        //             this.element.classList.remove('playing')
        //         }
        //     }
        // )
    }

    removeGlobalAnimationCallbacks() {
        GlobalAnimationCallbacks.instance.removeBeginCallback(this.beginId)
        GlobalAnimationCallbacks.instance.removeEndCallback(this.endId)
    }

    resetAnimation(renderers: AnimationRenderer[]) {
        if (this.animationRenderer != null) {
            renderers = [...renderers, this.animationRenderer]
        }

        this.time = 0

        if (this.getAbstractionSelection().selection == null) {
            reset(this.transitionAnimation)

            for (const renderer of renderers) {
                // renderer.environment = clone(
                //     this.transitionAnimation.precondition
                // )
                renderer.paths = {}
            }
        } else {
            for (const step of this.steps) {
                step.resetAnimation(renderers)
            }
        }
    }

    beginAnimation(renderers: AnimationRenderer[]) {
        if (this.animationRenderer != null) {
            renderers = [...renderers, this.animationRenderer]
        }

        if (this.getAbstractionSelection().selection == null) {
            for (const renderer of renderers) {
                renderer.environment = clone(
                    this.transitionAnimation.precondition
                )
                begin(this.transitionAnimation, renderer.environment)
            }
            this.transitionAnimation.isPlaying = true
            this.transitionAnimation.hasPlayed = false
        }

        this.element.classList.add('playing')

        // TODO: Begin expanded steps
    }

    endAnimation(renderers: AnimationRenderer[]) {
        if (this.animationRenderer != null) {
            renderers = [...renderers, this.animationRenderer]
        }

        if (this.getAbstractionSelection().selection == null) {
            for (const renderer of renderers) {
                end(this.transitionAnimation, renderer.environment)
            }
            this.transitionAnimation.isPlaying = false
            this.transitionAnimation.hasPlayed = true
        }

        for (const step of this.steps) {
            step.endAnimation(renderers)
        }

        this.isPlaying = false
        this.element.classList.remove('playing')
    }

    seekAnimation(time: number, renderers: AnimationRenderer[]) {
        if (this.animationRenderer != null) {
            renderers = [...renderers, this.animationRenderer]
        }

        this.time = time

        if (this.getAbstractionSelection().selection == null) {
            for (const renderer of renderers) {
                // Apply transition
                seek(this.transitionAnimation, renderer.environment, time)
            }
        } else {
            // Seek into appropriate step and seek
            // Keep track of the start time (for sequential animations)
            let start = 0

            for (const step of this.steps) {
                // If the animation should be playing
                const shouldBePlaying =
                    time >= start && time < start + step.getDuration()

                // End animation
                if (step.isPlaying && !shouldBePlaying) {
                    // Before ending, seek into the animation at it's end time
                    step.seekAnimation(step.getDuration(), renderers)
                    step.endAnimation(renderers)
                    step.hasPlayed = true
                    step.isPlaying = false
                }

                let begunThisFrame = false

                // Begin animation
                if (!step.isPlaying && shouldBePlaying) {
                    step.beginAnimation(renderers)
                    step.isPlaying = true
                    begunThisFrame = true
                }

                // Skip over this animation
                if (
                    time >= start + step.getDuration() &&
                    !step.isPlaying &&
                    !step.hasPlayed
                ) {
                    step.beginAnimation(renderers)
                    step.isPlaying = true
                    step.seekAnimation(step.getDuration(), renderers)
                    step.endAnimation(renderers)
                    step.isPlaying = false
                    step.hasPlayed = true
                }

                // Seek into animation
                if (step.isPlaying && shouldBePlaying && !begunThisFrame) {
                    step.seekAnimation(time - start, renderers)
                }

                start += step.getDuration()
            }
        }

        if (this.animationRenderer != null) {
            this.animationRenderer.update()
        }

        // TODO: Seek in expanded steps
    }
}
```

```javascript
import { remap } from '../utilities/math'
import { View } from '../view/View'

export class Timeline {
    disabled: boolean = false

    // Rendering
    element: HTMLDivElement = null

    timelineBar: HTMLDivElement = null
    scrubber: HTMLDivElement = null

    playToggle: HTMLDivElement = null

    view: View = null

    constructor(view: View) {
        this.view = view

        this.element = document.createElement('div')
        this.element.classList.add('timeline')

        this.playToggle = document.createElement('div')
        this.playToggle.classList.add('timeline-button')
        this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
        this.element.appendChild(this.playToggle)

        this.timelineBar = document.createElement('div')
        this.timelineBar.classList.add('timeline-bar')
        this.element.appendChild(this.timelineBar)

        this.scrubber = document.createElement('div')
        this.scrubber.classList.add('timeline-scrubber')
        this.timelineBar.appendChild(this.scrubber)

        // Setup bindings
        this.playToggle.addEventListener('click', () => {
            this.view.paused = !this.view.paused

            if (this.view.paused) {
                this.playToggle.innerHTML = '<ion-icon name="play"></ion-icon>'
            } else {
                this.playToggle.innerHTML = '<ion-icon name="pause"></ion-icon>'
            }
        })
    }

    destroy() {
        this.element.remove()
    }

    enable() {
        this.element.classList.remove('disabled')
        this.disabled = false
    }

    disable() {
        this.element.classList.add('disabled')
        this.disabled = true
    }

    tick(dt: number) {
        const bbox = this.timelineBar.getBoundingClientRect()

        // Move scrubber over
        const x = remap(
            this.view.time,
            0,
            this.view.getDuration(),
            0,
            bbox.width - 5
        )
        this.scrubber.style.left = `${x}px`
    }
}
```

```javascript
import { reads, writes } from '../animation/animation'
import {
    beginConcretePath,
    ConcretePath,
    createConcretePath,
    endConcretePath,
    seekConcretePath,
} from '../path/path'
import { getPathFromEnvironmentRepresentation } from '../representation/representation'
import { clone } from '../utilities/objects'
import { View } from '../view/View'
import { EnvironmentRenderer } from './EnvironmentRenderer'
import { PrototypicalEnvironmentState } from './EnvironmentState'

export interface AnimationRendererRepresentation {
    exclude: string[] | null // List of data ids to exclude from the representation, or null to include all
    include: string[] | null // List of data ids to include in the representation, or null to include all, prioritized over exclude
}

export class AnimationRenderer {
    // State
    view: View
    representation: AnimationRendererRepresentation = null

    paths: { [id: string]: ConcretePath } = {}

    // Rendering
    environmentRenderers: EnvironmentRenderer[] = []
    finalEnvironmentRenderers: EnvironmentRenderer[] = []

    environment: PrototypicalEnvironmentState = null
    element: HTMLDivElement = null

    finalRenderersElement: HTMLDivElement = null

    showingFinalRenderers: boolean = false

    constructor(view: View) {
        this.element = document.createElement('div')
        this.element.classList.add('animation-renderer')

        this.finalRenderersElement = document.createElement('div')
        this.finalRenderersElement.classList.add('animation-renderers-final')
        this.element.appendChild(this.finalRenderersElement)

        this.environmentRenderers.push(new EnvironmentRenderer())
        this.environmentRenderers.forEach((r) =>
            this.element.appendChild(r.element)
        )

        this.finalEnvironmentRenderers.push(new EnvironmentRenderer())
        this.finalEnvironmentRenderers.forEach((r) =>
            this.finalRenderersElement.appendChild(r.element)
        )

        this.view = view
        this.environment = clone(this.view.transitionAnimation.precondition)

        // Create representations
        this.updateRepresentation()
    }

    updateRepresentation() {
        this.representation = {
            exclude: null,
            include: [
                ...reads(this.view.transitionAnimation).map((r) => r.id),
                ...writes(this.view.transitionAnimation).map((w) => w.id),
            ],
        }
    }

    destroy() {
        this.environmentRenderers.forEach((r) => r.destroy())
        this.finalEnvironmentRenderers.forEach((r) => r.destroy())
        this.element.remove()
    }

    update() {
        for (const r of this.environmentRenderers) {
            r.setState(this.environment, this.representation)
            this.propagateEnvironmentPaths(this.environment, r)
        }

        if (this.showingFinalRenderers) {
            for (const r of this.finalEnvironmentRenderers) {
                r.setState(
                    this.view.transitionAnimation.postcondition,
                    this.representation
                )
            }

            const bbox = this.finalRenderersElement.getBoundingClientRect()
            this.element.style.minWidth = `${bbox.width}px`
        }
    }

    propagateEnvironmentPaths(
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) {
        // Hit test
        const hits = new Set()

        for (const id of Object.keys(environment.paths)) {
            const prototype = environment.paths[id]
            let concrete = this.paths[id]

            if (concrete == null) {
                // Need to create a path in the concrete environment
                concrete = createConcretePath(prototype)
                this.paths[id] = concrete
            }

            hits.add(id)
            this.propagatePath(concrete, environment, renderer)
        }

        // Remove paths that are no longer in the view
        for (const id in Object.keys(environment.paths)) {
            if (!hits.has(id)) {
                delete environment.paths[id]
            }
        }
    }

    propagatePath(
        path: ConcretePath,
        environment: PrototypicalEnvironmentState,
        renderer: EnvironmentRenderer
    ) {
        const representation = getPathFromEnvironmentRepresentation(
            this.representation,
            path.prototype
        )

        path.onBegin = representation.onBegin
        path.onEnd = representation.onEnd
        path.onSeek = representation.onSeek

        // Sync the timings of prototype path and concrete path
        if (!path.meta.isPlaying && path.prototype.meta.isPlaying) {
            beginConcretePath(path, environment, renderer)
            path.meta.isPlaying = true
        } else if (path.prototype.meta.isPlaying) {
            seekConcretePath(path, environment, renderer, path.prototype.meta.t)
        }

        if (!path.meta.hasPlayed && path.prototype.meta.hasPlayed) {
            endConcretePath(path, environment, renderer)
            path.meta.hasPlayed = true
        }
    }
}
```
