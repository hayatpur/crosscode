// import { AnimationGraph } from "../AnimationGraph";

// export function dissolve(graph) {
//     if (options.getSectionData == null && this.isSection) {
//         options.getSectionData = this.getData.bind(this);

//         if (this.isSection) {
//             this.hidden = false;
//         }
//     }

//     // Remove starting and ending edges
//     if (this.isSection || (this.node?.constructor.name == 'BlockStatement' && !this.isSequence)) {
//         for (let j = this.edges.length - 1; j >= 0; j--) {
//             if (this.edges[j].from == 0 || this.edges[j].to == 0) {
//                 this.edges.splice(j, 1);
//             } else if (this.edges[j].from == this.vertices.length - 1 || this.edges[j].to == this.vertices.length - 1) {
//                 this.edges.splice(j, 1);
//             }
//         }
//     }

//     for (let i = this.vertices.length - 1; i >= 0; i--) {
//         this.dissolveAt(i, options);
//     }

//     this.computeEdges();
//     this.computeStartAndEnd();
// }

// export function dissolveAt(i: number, options = {}) {
//     let vertex = this.vertices[i];

//     if (vertex instanceof AnimationGraph) {
//         vertex.dissolve(options);
//     }

//     // @ts-ignore
//     console.log('Dissolving...', vertex.node?.constructor.name ?? vertex.constructor.name);

//     if (vertex instanceof AnimationGraph && vertex.isSection) {
//         // Remove section start animation, and section end animation
//         vertex.removeVertex(vertex.vertices.length - 1);
//         vertex.removeVertex(0);
//         vertex.hidden = true;
//     } else if (
//         vertex instanceof AnimationGraph &&
//         !vertex.isSequence &&
//         vertex.node?.constructor.name == 'BlockStatement'
//     ) {
//         // Remove create and pop scope animations
//         vertex.removeVertex(vertex.vertices.length - 1);
//         vertex.removeVertex(0);
//     }

//     // Gut out the animations and edges from vertex and place them infront of this vertex
//     if (vertex instanceof AnimationGraph && !vertex.isSequence) {
//         console.log('Vertex Edges', JSON.parse(JSON.stringify(vertex.edges)));
//         console.log('Edges', JSON.parse(JSON.stringify(this.edges)));

//         // Mark the start and end vertices of the graph
//         for (let j = 0; j < vertex.vertices.length; j++) {
//             const outgoing_flow = getOutgoingFlow(j, vertex.edges);
//             const incoming_flow = getIncomingFlow(j, vertex.edges);

//             if (outgoing_flow.length == 0) {
//                 // @ts-ignore
//                 vertex.vertices[j].isEndNode = true;
//                 console.log('Setting end node!', j);
//             }

//             if (incoming_flow.length == 0) {
//                 // @ts-ignore
//                 vertex.vertices[j].isStartNode = true;
//                 console.log('Setting start node!', j);
//             }
//         }

//         // Store the edges coming into 'i'
//         /**@type{Edge[]} */
//         const incoming_edges: Edge[] = [];

//         /**@type{Edge[]} */
//         const outgoing_edges: Edge[] = [];

//         for (const edge of this.edges) {
//             if (edge.to == i) {
//                 console.log('Incoming edge!', JSON.parse(JSON.stringify(edge)));
//                 incoming_edges.push(edge);
//             }

//             if (edge.from == i) {
//                 console.log('Outgoing edge!', JSON.parse(JSON.stringify(edge)));
//                 outgoing_edges.push(edge);
//             }
//         }

//         for (let j = vertex.vertices.length - 1; j >= 0; j--) {
//             this.addVertexAt(vertex.vertices[j], i + 1);
//         }

//         for (let j = 0; j < vertex.edges.length; j++) {
//             vertex.edges[j].from += i + 1;
//             vertex.edges[j].to += i + 1;

//             this.edges.push(vertex.edges[j]);
//         }

//         // Redirect edges that were coming into 'i' to all of its start nodes
//         for (const edge of incoming_edges) {
//             for (let k = this.vertices.length - 1; k >= 0; k--) {
//                 // @ts-ignore
//                 if (this.vertices[k].isStartNode) {
//                     // @ts-ignore
//                     const copy = new edge.constructor(edge.from, k, edge.getData);
//                     this.addEdge(copy);
//                 }
//             }
//         }

//         // Redirect edges that were outgoing from 'i' to all of its end nodes
//         for (const edge of outgoing_edges) {
//             console.log('Now at ...', JSON.parse(JSON.stringify(edge)));
//             for (let k = this.vertices.length - 1; k >= 0; k--) {
//                 // @ts-ignore
//                 if (this.vertices[k].isEndNode) {
//                     // @ts-ignore
//                     const copy = new edge.constructor(k, edge.to, edge.getData);
//                     this.addEdge(copy);
//                 }
//             }
//         }

//         for (const vertex of this.vertices) {
//             // @ts-ignore
//             vertex.isEndNode = undefined;
//             // @ts-ignore
//             vertex.isStartNode = undefined;
//         }

//         // Remove all old edges
//         for (let k = this.edges.length - 1; k >= 0; k--) {
//             if (this.edges[k].from == i || this.edges[k].to == i) {
//                 console.log('Removing edge!');
//                 this.edges.splice(k, 1);
//             }
//         }

//         // Remove vertex
//         this.removeVertex(i);

//         console.log('AFTER --- Vertex Edges', JSON.parse(JSON.stringify(vertex.edges)));
//         console.log('AFTER --- Edges', JSON.parse(JSON.stringify(this.edges)));

//         // Re-wire it to use this statement's section data
//         for (const vertex of this.vertices) {
//             if (vertex.hasOwnProperty('getSectionData')) {
//                 // @ts-ignore
//                 vertex.getSectionData = options.getSectionData;

//                 if (vertex instanceof AnimationSequence) {
//                     vertex.vertices = vertex.generateSequence();
//                 }
//             }
//         }
//     }
// }
