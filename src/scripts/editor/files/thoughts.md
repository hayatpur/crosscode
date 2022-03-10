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

**Concepts**

-   Data
-   Data trace / Data flow

-   Animation

-   Route

-   Query from code
-   Query from data

-   Search and filter

-   Hierarchical abstraction / control flow
-   Symmetrical abstraction (e.g., for loop and recursive calls)
-   Asymmetrical abstraction (e.g., if statements)

-   Event

    -   Aggregation of sequential low level events or a low level event

-   Timeline

    -   Collection of events

-   Lanes

-   Visual encoding

-   Event layout
    -   Nested
    -   Branching

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

-   Two aspects: multiple levels of representation, user interaction.

-   How different levels of abstraction manifest in space and time

    -   Program execution is temporal (higher level representation but lower level representation)
    -   Nesting, branching
    -   Data trace

-   Filtering relevant information

    -   Queries
    -   Searching structure, navigating between levels of abstraction

-   Timeline

**User Study**

-   Extract key features and ask users to use it? Undergraduate CS students? Expert CS students? People with lack of experience. (e.g. people who don't know how to use a computer).
-   Usefulness / usability

**Discussion**

**Conclusion**
