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

My CHI reading list:

Causality-preserving Asynchronous Reality
https://programs.sigchi.org/chi/2022/index/content/68789

ComputableViz: Mathematical Operators as a Formalism for Visualization Processing and Analysis
https://programs.sigchi.org/chi/2022/index/content/71875

Computational Rationality as a Theory of Interaction
https://programs.sigchi.org/chi/2022/index/content/72064

Design Guidelines for Prompt Engineering Text-to-Image Generative Models
https://programs.sigchi.org/chi/2022/index/content/68919

Discovering the Syntax and Strategies of Natural Language Programming with Generative Language Models
https://programs.sigchi.org/chi/2022/index/content/68967

Do You See What You Mean? Using Predictive Visualizations to Reduce Optimism in Duration Estimates
https://programs.sigchi.org/chi/2022/index/content/68894

Does Dynamically Drawn Text Improve Learning? Investigating the Effect of Text Presentation Styles in Video Learning
https://programs.sigchi.org/chi/2022/index/content/72133

Embodied Geometric Reasoning with a Robot: The Impact of Robot Gestures on Student Reasoning about Geometrical Conjectures
https://programs.sigchi.org/chi/2022/index/content/71908

Exploring Technical Reasoning in Digital Tool Use
https://programs.sigchi.org/chi/2022/index/content/68768

FluidMeet: Enabling Frictionless Transitions Between In-Group, Between-Group, and Private Conversations During Virtual Breakout Meetings
https://programs.sigchi.org/chi/2022/index/content/71885

From Who You Know to What You Read: Augmenting Scientific Recommendations with Implicit Social Networks
https://programs.sigchi.org/chi/2022/index/content/72122

Gesture Elicitation as a Computational Optimization Problem
https://programs.sigchi.org/chi/2022/index/content/68832

Hand Interfaces: Using Hands to Imitate Objects in AR/VR for Expressive Interactions
https://programs.sigchi.org/chi/2022/index/content/68766

Hidden Interfaces for Ambient Computing: Enabling Interaction in Everyday Materials through High-brightness Visuals on Low-cost Matrix Displays
https://programs.sigchi.org/chi/2022/index/content/71976

HydroMod: Constructive Modules for Prototyping Hydraulic Physical Interfaces
https://programs.sigchi.org/chi/2022/index/content/68755

i-LaTeX: Manipulating Transitional Representations between LaTeX Code and Generated Documents
https://programs.sigchi.org/chi/2022/index/content/71977

ImageExplorer: Multi-Layered Touch Exploration to Encourage Skepticism Towards Imperfect AI-Generated Image Captions
https://programs.sigchi.org/chi/2022/index/content/69011

Jury Learning: Integrating Dissenting Voices into Machine Learning Models
https://programs.sigchi.org/chi/2022/index/content/68851

Math Augmentation: How Authors Enhance the Readability of Formulas using Novel Visual Design Practices
https://programs.sigchi.org/chi/2022/index/content/68734

Methodological Reflections on Ways of Seeing
https://programs.sigchi.org/chi/2022/index/content/71960

Mixplorer: Scaffolding Design Space Exploration through Genetic Recombination of Multiple Peoples' Designs to Support Novices' Creativity
https://programs.sigchi.org/chi/2022/index/content/68939

More Errors vs. Longer Commands: The Effects of Repetition and Reduced Expressiveness on Input Interpretation Error, Learning, and User Preference
https://programs.sigchi.org/chi/2022/index/content/68995

Neo: Generalizing Confusion Matrix Visualization to Hierarchical and Multi-Output Labels
https://programs.sigchi.org/chi/2022/index/content/68791

Paper Trail: An Immersive Authoring System for Augmented Reality Instructional Experiences
https://programs.sigchi.org/chi/2022/index/content/71897

Passages: Interacting with Text Across Documents
https://programs.sigchi.org/chi/2022/index/content/68840

Probability Weighting in Interactive Decisions: Evidence for Overuse of Bad Assistance, Underuse of Good Assistance
https://programs.sigchi.org/chi/2022/index/content/72158

Promptiverse: Scalable Generation of Scaffolding Prompts Through Human-AI Hybrid Knowledge Graph Annotation
https://programs.sigchi.org/chi/2022/index/content/68937

Put a Label On It! Approaches for Constructing and Contextualizing Bar Chart Physicalizations
https://programs.sigchi.org/chi/2022/index/content/69014

Putting scientific results in perspective: Improving the communication of standardized effect sizes
https://programs.sigchi.org/chi/2022/index/content/68802

Predicting and Explaining Mobile UI Tappability with Vision Modeling and Saliency Analysis
https://programs.sigchi.org/chi/2022/index/content/71845

Recruiting Participants With Programming Skills: A Comparison of Four Crowdsourcing Platforms and a CS Student Mailing List
https://programs.sigchi.org/chi/2022/index/content/68827

Rediscovering Affordance: A Reinforcement Learning Perspective
https://programs.sigchi.org/chi/2022/index/content/68968

Solving Separation-of-Concerns Problems in Collaborative Design of Human-AI Systems through Leaky Abstractions
https://programs.sigchi.org/chi/2022/index/content/71868

Shared Interest: Measuring Human-AI Alignment to Identify Recurring Patterns in Model Behavior
https://programs.sigchi.org/chi/2022/index/content/68960

Structure-aware Visualization Retrieval
https://programs.sigchi.org/chi/2022/index/content/68743

Style Blink: Exploring Digital Inking of Structured Information via Handcrafted Styling as a First-Class Object
https://programs.sigchi.org/chi/2022/index/content/68953

Stylette: Styling the Web with Natural Language
https://programs.sigchi.org/chi/2022/index/content/68932

Symphony: Composing Interactive Interfaces for Machine Learning
https://programs.sigchi.org/chi/2022/index/content/68746

Tisane: Authoring Statistical Models via Formal Reasoning from Conceptual and Data Relationships
https://programs.sigchi.org/chi/2022/index/content/68888

Towards Relatable Explainable AI with the Perceptual Process
https://programs.sigchi.org/chi/2022/index/content/68763

Understanding How Programmers Can Use Annotations on Documentation
https://programs.sigchi.org/chi/2022/index/content/68723

Varv: Reprogrammable Interactive Software as a Declarative Data Structure
https://programs.sigchi.org/chi/2022/index/content/68790

VisGuide: User-Oriented Recommendations for Data Event Extraction
https://programs.sigchi.org/chi/2022/index/content/72046

VRception: Rapid Prototyping of Cross-Reality Systems in Virtual Reality
https://programs.sigchi.org/chi/2022/index/content/68885

Weaving Stories: Toward Repertoires for Designing Things
https://programs.sigchi.org/chi/2022/index/content/68910

Zoom Obscura: Counterfunctional Design for Video-Conferencing
https://programs.sigchi.org/chi/2022/index/content/68808

(Dis)Appearables: A Concept and Method for Actuated Tangible UIs to Appear and Disappear based on Stages
https://programs.sigchi.org/chi/2022/index/content/68770

Introduction

Attention is the core idea that some stimulus are treated different than others for processes, representation, and/or learning.

Attention is common to a lot of observable effects.

Range of experiments hav ecases for where different locations are contrasted against nothing or against another stimulli at another location.

Starting point: build a model where competition is a natural consequence of the computational task.

E.g., multiple conditioned stimmuli (CSs) such as lights and tones have to be used to predict unconditioned stimuli (USs) such as rewards and punishments.

What does it mean for a collection of CSs to learn?

Previous: seperated two underlying components of attention competion, one governing representation, based on how realiable a CS is at predicting a US, and one genering learning, based on how uncertain to the quatnaative prediction made of a US by a (reliable or unrealiable) CS.

Goal: provide rational accounts for sensory attention



---

```{javascript}

```