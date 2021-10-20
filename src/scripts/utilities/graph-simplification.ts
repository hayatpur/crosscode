// import { AnimationData, AnimationGraph } from '../animation/graph/AnimationGraph';
// import { Edge } from '../animation/graph/edges/Edge';
// import { AnimationNode } from '../animation/primitive/AnimationNode';
// import { solveLP } from './math';

// // Of type ......... Move(A, B) ---B--> Copy(B, C) ---C--> Move(C, D)
// // Simplifies to ... Move(A, D)
// interface Type1Movement {
//     // Animations
//     move0: MoveAndPlaceAnimation;
//     copy: CopyDataAnimation;
//     move1: MoveAndPlaceAnimation;

//     // Edges
//     edge0: Edge;
//     edge1: Edge;
// }

// // Type 1 Movement, can be simplified to: Move(A,D)
// export function findType1Movement(graph: AnimationGraph, edge: Edge): Type1Movement {
//     // Data Ids
//     let A: AnimationData, B: AnimationData, C: AnimationData, D: AnimationData;

//     // Movement
//     const movement: Type1Movement = {
//         // Animations
//         move0: null,
//         copy: null,
//         move1: null,

//         // Edges
//         edge0: null,
//         edge1: null,
//     };

//     // Find all flow edges that go from Movement(A, B) to Movement(B, C)
//     if (!(edge instanceof FlowEdge)) return;

//     if (!(graph.vertices[edge.from] instanceof MoveAndPlaceAnimation)) return;
//     if (!(graph.vertices[edge.to] instanceof CopyDataAnimation)) return;

//     movement.move0 = graph.vertices[edge.from] as MoveAndPlaceAnimation;
//     movement.copy = graph.vertices[edge.to] as CopyDataAnimation;
//     movement.edge0 = edge;

//     A = movement.move0.reads()[0];
//     B = movement.copy.reads()[0];

//     if (B.id != edge.data.id || B.id != movement.move0.writes()[0].id) return;
//     C = movement.copy.writes()[0];

//     for (const other of graph.edges) {
//         if (!(other instanceof FlowEdge) || other.from != edge.to || other.data.id != C.id) continue;
//         if (!(graph.vertices[other.to] instanceof MoveAndPlaceAnimation)) continue;

//         movement.move1 = graph.vertices[other.to] as MoveAndPlaceAnimation;
//         movement.edge1 = other;

//         D = movement.move1.writes()[0];

//         let incompatible = false;

//         // Other dependency checks
//         for (const e of graph.edges) {
//             if (!(e instanceof FlowEdge)) continue;

//             const fromId = graph.vertices[e.from].id;
//             const toId = graph.vertices[e.to].id; // TODO

//             if (
//                 (e.data.id == B.id || e.data.id == C.id) &&
//                 e.id != movement.edge1.id &&
//                 e.id != movement.edge0.id &&
//                 (fromId == movement.copy.id || fromId == movement.move0.id)
//             ) {
//                 console.log('Incompatible edge', e.id, movement.edge0.id, movement.edge1.id);
//                 console.log(fromId, movement.copy.id, movement.move0.id);
//                 incompatible = true;
//                 break;
//             }
//         }

//         if (incompatible) continue;
//         return movement;
//     }

//     return null;
// }

// // Of type ......... Copy(A, B) ---FLOW--B--> Move(B, C)
// //                              ---ANTI--C--> Move(D, A)
// // Simplifies to ... Move(A, C) ---Move(D, A)
// interface DirectMovement {
//     // Animations
//     copy: CopyDataAnimation;
//     move0: MoveAndPlaceAnimation;
//     move1: MoveAndPlaceAnimation;

//     // Edges
//     edge0: Edge;
//     edge1: Edge;
// }

// export function findDirectMovement(graph: AnimationGraph, edge: Edge): DirectMovement {
//     // Data Ids
//     let A: AnimationData, B: AnimationData, C: AnimationData, D: AnimationData;

//     // Movement
//     const movement: DirectMovement = {
//         // Animations
//         copy: null,
//         move0: null,
//         move1: null,

//         // Edges
//         edge0: null,
//         edge1: null,
//     };

//     // Find all flow edges that go from Movement(A, B) to Movement(B, C)
//     if (!(edge instanceof FlowEdge)) return;

//     if (!(graph.vertices[edge.from] instanceof CopyDataAnimation)) return;
//     if (!(graph.vertices[edge.to] instanceof MoveAndPlaceAnimation)) return;

//     movement.copy = graph.vertices[edge.from] as CopyDataAnimation;

//     if (movement.copy.hardCopy) return;

//     movement.move0 = graph.vertices[edge.to] as MoveAndPlaceAnimation;
//     movement.edge0 = edge;

//     A = movement.copy.reads()[0];
//     B = movement.move0.reads()[0];

//     if (B.id != edge.data.id || B.id != movement.copy.writes()[0].id) return;
//     C = movement.move0.writes()[0];

//     for (const other of graph.edges) {
//         if (!(other instanceof AntiEdge) || other.from != edge.from || other.data.id != A.id) continue;
//         if (!(graph.vertices[other.to] instanceof MoveAndPlaceAnimation)) continue;

//         movement.move1 = graph.vertices[other.to] as MoveAndPlaceAnimation;
//         movement.edge1 = other;

//         D = movement.move1.reads()[0];

//         let incompatible = false;

//         // Other dependency checks
//         // for (const e of graph.edges) {
//         //     if (!(e instanceof FlowEdge)) continue;

//         //     const fromId = graph.vertices[e.from].id;
//         //     const toId = graph.vertices[e.to].id; // TODO

//         //     if (
//         //         (e.data.id == B.id || e.data.id == C.id) &&
//         //         e.id != movement.edge1.id &&
//         //         e.id != movement.edge0.id &&
//         //         (fromId == movement.copy.id || fromId == movement.move0.id)
//         //     ) {
//         //         console.log('Incompatible edge', e.id, movement.edge0.id, movement.edge1.id);
//         //         console.log(fromId, movement.copy.id, movement.move0.id);
//         //         incompatible = true;
//         //         break;
//         //     }
//         // }

//         if (incompatible) continue;
//         return movement;
//     }

//     return null;
// }

// export function findMovementsInSubgraph(graph: AnimationGraph): { type1: Type1Movement[]; direct: DirectMovement[] } {
//     const movements: { type1: Type1Movement[]; direct: DirectMovement[] } = { type1: [], direct: [] };

//     for (const edge of graph.edges) {
//         const type1 = findType1Movement(graph, edge);
//         if (type1) {
//             movements.type1.push(type1);
//         }

//         const direct = findDirectMovement(graph, edge);
//         if (direct) {
//             movements.direct.push(direct);
//         }
//     }

//     // If temp is only defined in smaller scope

//     movements.type1.sort((a, b) => graph.vertices.indexOf(a.move0) - graph.vertices.indexOf(b.move0));

//     return movements;
// }

// export function simplifyType1Movement(graph: AnimationGraph, movement: Type1Movement) {
//     const move0Index = graph.vertices.findIndex((v) => v.id == movement.move0.id);

//     // Redirect outgoing edges and incoming edges into start vertex
//     for (const edge of graph.edges) {
//         if (graph.vertices[edge.from] == movement.move1) {
//             edge.from = move0Index;
//         }

//         if (graph.vertices[edge.to] == movement.move1) {
//             edge.to = move0Index;
//         }
//     }

//     // Reconfigure move
//     movement.move0.outputSpecifier = movement.move1.outputSpecifier;
//     movement.move0._writes[0] = movement.move1._writes[0];

//     // Remove second move
//     graph.removeVertex(movement.move1);
//     // Remove copy vertex
//     graph.removeVertex(movement.copy);

//     // Remove both edges
//     graph.removeEdge(movement.edge0);
//     graph.removeEdge(movement.edge1);
// }

// export function simplifyDirectMovement(graph: AnimationGraph, movement: DirectMovement) {
//     // const move0Index = graph.vertices.findIndex((v) => v.id == movement.move0.id);

//     movement.copy.hardCopy = true;

//     // TODO: Add edge back

//     // Redirect outgoing edges and incoming edges into start vertex
//     // for (const edge of graph.edges) {
//     //     if (graph.vertices[edge.from] == movement.copy) {
//     //         if (edge.to == move0Index && edge instanceof OutputEdge) {
//     //             continue;
//     //         }
//     //         edge.from = move0Index;
//     //     }

//     //     if (graph.vertices[edge.to] == movement.copy) {
//     //         if (edge.from == move0Index && edge instanceof OutputEdge) {
//     //             continue;
//     //         }
//     //         edge.to = move0Index;
//     //     }
//     // }

//     // // Reconfigure move
//     // movement.move0.inputSpecifier = movement.copy.dataSpecifier;
//     // movement.move0._reads = movement.copy._reads;
//     // movement.move0._writes[1] = movement.move0._reads[0];

//     // // Remove copy
//     // graph.removeVertex(movement.copy);

//     // // Remove flow edge
//     // graph.removeEdge(movement.edge0);
// }

// export function collapseAnimation(graph: AnimationGraph) {
//     if (graph.vertices.length == 0) {
//         graph.collapsedStarts = [];
//         return;
//     }

//     if (graph.vertices.length == 1) {
//         graph.collapsedStarts = [0];
//         return;
//     }

//     // Construct the graph into a LP problem
//     const variables = graph.vertices.map((vertex, i) => `V${i}`);

//     // Limits
//     let limits = [];
//     for (let i = 0; i < graph.edges.length; i++) {
//         const limit = `E${i}: ${graph.edges[i].getConstraint(graph.vertices)}`;
//         limits.push(limit);
//     }

//     // Bounds
//     let bounds = [];
//     for (let i = 0; i < graph.vertices.length; i++) {
//         const bound = `V${i} >= 0`;
//         bounds.push(bound);
//     }

//     const data = `
// Minimize
// obj: ${variables.join('+')}

// Subject To
// ${limits.join('\n')}

// Bounds
// ${bounds.join('\n')}

// General
// ${variables.join(' ')}

// End`;
//     console.log(data);
//     const solution = solveLP(data);

//     graph.collapsedStarts = [];

//     for (let i = 0; i < graph.vertices.length; i++) {
//         const start = solution.result[`V${i}`];
//         graph.collapsedStarts.push(start);
//     }

//     // graph.collapsedStarts[1] = 500;
//     // graph.collapsedStarts[3] = 500;

//     console.log(graph.collapsedStarts);
// }

// export function simplify(graph: AnimationGraph | AnimationNode, options: { depth: number } = { depth: 0 }) {
//     if (graph instanceof AnimationNode) return;

//     // Simplify all children
//     for (let i = graph.vertices.length - 1; i >= 0; i--) {
//         simplify(graph.vertices[i], { ...options, depth: options.styles.elevation + 1 });
//     }

//     dissolve(graph);
//     while (true && options.styles.elevation >= 0) {
//         const movements = findMovementsInSubgraph(graph);
//         if (movements.type1.length == 0) break;
//         simplifyType1Movement(graph, movements.type1[0]);
//     }
//     collapseAnimation(graph);
// }
