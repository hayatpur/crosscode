**TODO**:
[X] Global traces
[X] Animations
[ ] How to deal with traces that show on the same state but at multiple points in time
[ ] Animations should be derived from branches not a heuristic
[ ] Trace should be automatically shown when animation is played (global & local)
[ ] Traces should fade out over time after playing
[ ] Build tree structure for recursive call
[ ] User interactions for what they want to see
[ ] Different models: look at data, look at events, looking at source code
[ ] Live programming
[ ] Hover to show trace
[ ] Animations for trace
[ ] Source code as label
[ ] Tree view
[ ] Peak into queries
[ ] Routes
[ ] Routes should be expandable, collapsible.
[ ] Collapse (abstract) over space
[ ] Collapse (abstract) over trace operations
[ ] Combine into chunks, let user expand to lower level operations if they want
[ ] If layout is different can't attach trace to post / pre renderers :(
[ ] Animation UI
[ ] Replay, seek, pause animation
[ ] Objects
[ ] References
[ ] Linked List example
[ ] Multiple references to same object overlap
[ ] Passive writes view
[ ] Code selection and queries
[ ] Temporary queries from code
[ ] Fix normal queries
[ ] Traces for control flow
[ ] Different types of trace: additions, deletions of data
[ ] Polish animations
[ ] Polish traces
[ ] Methods
[ ] Logical operator trace
[ ] Global animations
[ ] Second layer on top
[ ] Search and filter
[ ] Crossroads
[ ] Just find the same animation node
[ ] Fix traces only going from times they were modified, can be done in post
[ ] Combine code selections into one
[ ] Cleanup mouse bindings
[ ] Hide reads until expanded - global trace should not show extraneous data
[ ] Select things that are there instead of always temp'ing
[ ] Max depth doesn't update so connections look out of place
[ ] Good defaults
[ ] Unexecuted control flow.
[ ] Maintaining continuity with traces when changing structure.
[ ] Specialized representations.
[ ] Out not at correct place if multiple temporary values
[ ] Jump to next level if empty
[ ] Lane analogy
[ ] Progressively show information
[ ] Long identifiers don't have space
[ ] Layout of visual should match code (i.e. horizontal vs. vertical)
[ ] Zooming out tree when navigating by data

**TODO**
[ ] Trails
[ ] So basically refractor the existing get global traces and should be good! (currently working on the contain function w/ Environment renderer def of "good" data)
[ ] Focused navigation
[ ] Animations between navigation states
[ ] Navigation from source code on same level of abstraction
[ ] Navigation from data (using trail?)
[ ] Navigation from source code on new level of abstraction
[ ] In-place animations on one level of abstraction lower
[ ] C/D gain on longer executions / mouse movement proportional to height of the thing navigating
[ ] There is an "explored" _area_, over which variables can be distributed - not necessarily isolated in panels
[ ] Single child graphs don't have an outgoing connection
[ ] Navigation should not be just the current state, but the current state _and_ previous state

**TODO** (real)
_Implementation_
[~] If you hit a hard scope, don't look past it!
[ ] Show data renderers that are in scope!
Use the earliest hard scope from identifiers to get the right frames for data renderers.

[~] Expansion

-   Normally <-- do this first!
    Inline, just show each sub-step
    Spatially apart
    Some steps collapsed, replace those steps with a "..." (1D collapsing)
-   In-context, shows a single step (not always possible), timeline stems from location of that step
    Selecting another step opens a stacked timeline, based on the temporal order

[ ] Specialized representations
If statements
Function calls
For statements
While statements

[ ] Use timeline and execution to determine what goes in the views _and_ when to show views
Hide / show appropriate views

[ ] Animation and traces
Environments should exist at a point in time

[ ] Collapse across levels of abstraction (2D collapsing)
Inline
Spatially
Work backwards from a deeper level of abstraction

[ ] Data queries

[ ] Code queries

[ ] Minimap

[ ] "Interest events" should be the only ones that are highlighted and interactable

[ ] Cursor can't exist "at" a node, it has to be before or after

[ ] Traces that indicate which instruction data was modified from AND traces that indicate what data modified it
Traces between instructions and data
Traces between data and data

[ ] Expanding for loops?

[ ] Maintaining context when skipping in depth

[ ] Context, the thing that happens before _and_ after

[ ] Add a view button in between the others

[~] Dynamic representations

-   Call Expression:

    -   A: Show Step(call expression)
    -   B: Show Step(call expression) and View(return value)
    -   C: Show Step(call expression) and View(return value) and View(arguments)

-   Function Call:

    -   A: Show Step(function call)
    -   B: Show Step(function call, expanded) and Step(return statement)
    -   C: Show Step(function call, expanded) and Step(return statement) and Step(block statement)

-   Block Statement:

    -   A: Show Step(block statement)
    -   B: Show Step(block statement) and View(after)
    -   C: Show Step(block statement) and View(before) and View(after)
    -   D: Show Step(block statement, expanded) and for each statement: Step(statement)
    -   E: Show Step(block statement, expanded) and for each statement: Step(statement), and for chunks: View(statement)
    -   F: Show Step(block statement, expanded) and for each statement: Step(statement) and View(statement)

-   If Statement:
    -   A: Show Step(if statement)
    -   B: Show Step(if statement) and View(conditional, inline)
    -   C: Show Step(if statement) and View(before) and View(after)

Three big things left to implement:

[~] Dynamic representations

Goals of a dynamic representation:

-   Summarize information at varying levels of abstraction
-   Interactions for accessing lower levels of abstraction

[~] Collapsing and expanding
[ ] Incrementally showing information (i.e., tracing part by part)

_Meeting_

-   Dynamic representation:
    -   For Statement
    -   If Statement
    -   Goals
        -   Summarize information at that level abstraction
        -   Interactions for accessing the lower level of abstraction
-   Managing complexity:

    -   Tracing and views

-   Be able to loop at any point in time
-   Be able to create views at any point in time / move views to any point in time
    -   Bookmark
-   Be able to collapse
-   Be able to expand back (backtrack / add context)
-   Be able to see if / else if in place
-   Be able to see traces of data
-   Be able to see traces of data and instruction
-   Be able to see traces of source code to dynamic execution

    Views vs. point in time

Animations:

-   Only move if the data is a "move" function of inputs, otherwise just highlight them, raise them or something and create the data

-   Header -> Body
-   Spatial moving and polish that up
-   Adding context: go up a level of abstraction, go up in the same level of abstraction, go down in the same level of abstraction
-   Traces
-   Animations

_Writing_
[ ] Finish related work (ddl: this week)
[ ] Formative study (ddl: Feb 25)
[ ] System design (ddl: this week)
[ ] Draft (ddl: Apr 1)

_Study_
[ ] Outline of procedure
[ ] Questionnaire
[ ] Script
[ ] Have the study done by end of next week

_Video_
[ ] After paper outline

**Feedback**
[ ] Which views to show?
[ ] What to show in the views?
[ ] Spatial positioning of layout
[ ] Connections between origin and steps
[ ] Punch card blocks
[ ] Minimap
[ ] Traces? Animations?

[ ] Call expression: inputs, outputs
[ ] If statement condition

**Mechanisms**

-   Data trace / Data flow
-   Animation
-   Route (navigation)
-   Query from code
-   Query from data
-   Search and filter
-   Hierarchical abstraction / control flow
-   Symmetrical abstraction (e.g., for loop and recursive calls)
-   Event
    -   Aggregation of sequential low level events or a low level event
-   Timeline
    -   Collection of events
-   Visual encoding
-   Event layout
    -   Nesting
    -   Skipping
    -   Non-linear

**Intro**

-   Inferring abstract relationships from code (aggregate).
-   Multiple level representation is a key contribution, another is that user select data/code they are interested (filter).
-   What are interaction techniques to build, how to visualize them, how to interact with the data.

**Related work**

-   Program comprehension / understanding
-   Notional machine
-   Conceptual Visualizations in Computer Science
-   Program / algorithm visualizations
-   Debugging tools
-   Visualization techniques / representational techniques that our work is based on
-   Used somewhere else how we apply concepts in programming

**Formative study**

-   What are the key differences between conceptual diagrams and existing visualizations?
-   Don't show all information, show _key steps_

**System Design**

-   Two aspects: visualize multiple levels of representation, and user interactions to make that possible.
-   How different levels of abstraction manifest in space and time
    -   Program execution is temporal (higher level representation but lower level representation)
    -   Nesting, branching
    -   Data trace
-   Filtering relevant information
    -   Queries
    -   Searching structure, navigating between levels of abstraction
-   Timeline
-   Reduction from actual execution

**User Study**

-   Extract key features and ask users to use it? Undergraduate CS students? Expert CS students? People with lack of experience. (e.g. people who don't know how to use a computer).
-   Usefulness / usability

**Discussion**

**Conclusion**

**Exam Questions**
