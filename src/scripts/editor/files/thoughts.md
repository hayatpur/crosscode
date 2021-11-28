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
(3) symbol (i.e. 'y', '_ArrayExpression')

Access into data
(1) index (i.e. 0)

```javascript
// Examples

let left = [1, 4, 5];
let right = [1, 2, 3];
let arr = [];

// Break out of loop if any one of the array gets empty
while (left.length && right.length) {
    // Pick the smaller among the smallest element of left and right sub arrays
    if (left[0] < right[0]) {
        arr.push(left.shift());
    } else {
        arr.push(right.shift());
    }
}

// Concatenating the leftover elements
// (in case we didn't go through the entire left or right array)
let z = [...arr, ...left, ...right];


```
---
```javascript

function push(O, item) {
    let len = O.length;
    O[len] = item;
}

let left = [1, 4, 5];
{
  O = left;
  item = 5;

  let len = O.length;
  O[len] = item;
}


```

```javascript 
function push(O, item) {
    let len = O.length;
    O[len] = item;
}

function pushn(O, n, item) {
    for (let i = 0; i < n; i++) {
        push(O, item);
    }
}

let left = [1, 4, 5];
let y = 5;
pushn(left, 5, y);
```


> diff([1, 7, 2, 4]);
6
> diff([]);
0







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

function ack(m, n) {
    if (m === 0) {
        return n + 1
    }

    if (n === 0) {
        return ack((m - 1), 1);
    }

    if (m !== 0 && n !== 0) {
        return ack((m - 1), ack(m, (n - 1)))
    }
}

const y = ack(3, 4);




[X] For chunking, get the start and the end 

[ ] Transitions should not start from the post-condition and 
    then work backwards, they should describe the change.

[ ] Transitions should not contain items that do not change,
    representation will handle that.

[ ] Visualize scopes
[ ] Create hard scopes, not just block scopes. Might need to define a global scope.

Notes:
  - Do abstractions before granularity 