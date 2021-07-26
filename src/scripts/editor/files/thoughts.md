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



```

Access into memory
(1) id (i.e. 0x42313)
(2) index (i.e. 0)
(3) symbol (i.e. 'y', '_ArrayExpression')

Access into data
(1) index (i.e. 0)