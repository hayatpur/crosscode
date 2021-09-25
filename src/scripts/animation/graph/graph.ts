import { AnimationNode, instanceOfAnimationNode, NodeData } from '../primitive/AnimationNode';
import { AnimationGraph, instanceOfAnimationGraph } from './AnimationGraph';
import { Edge, EdgeType } from './edges/Edge';

/**
 * Adds a vertex to the end of an animation graph. If shouldDissolve is true (and the vertex is an animation graph),
 * then the children of the vertex are directly added, rather than the vertex itself.
 *
 * @param graph - Animation graph to add vertex to
 * @param vertex - Vertex to add
 * @param nodeData - Data of AST node for vertex
 * @param shouldDissolve - If vertex should dissolve or not
 */
export function addVertex(
  graph: AnimationGraph,
  vertex: AnimationGraph | AnimationNode,
  nodeData: NodeData = null,
  shouldDissolve = false
) {
  if (instanceOfAnimationNode(vertex) || (instanceOfAnimationGraph(vertex) && !shouldDissolve)) {
    vertex.nodeData = nodeData;
    graph.vertices.push(vertex);
  } else {
    // Offset all the edges
    const offset = graph.vertices.length + 1;

    // Add all the vertices
    const vertices = [...vertex.vertices];
    vertices.forEach((vertex) => addVertex(graph, vertex, nodeData));

    // Add all the edges
    for (let j = 0; j < vertex.edges.length; j++) {
      vertex.edges[j].from += offset;
      vertex.edges[j].to += offset;

      graph.edges.push(vertex.edges[j]);
    }
  }
}

/**
 * Removes a vertex from an animation graph at the given index.
 * @param graph - Animation graph to remove from
 * @param i - Vertex to remove at
 */
export function removeVertexAt(graph: AnimationGraph, i: number) {
  // Remove vertex
  graph.vertices.splice(i, 1);

  // Shift over all edges
  for (let j = graph.edges.length - 1; j >= 0; j--) {
    if (graph.edges[j].from == i || graph.edges[j].to == i) {
      graph.edges.splice(j, 1);
      continue;
    }

    if (graph.edges[j].from > i) graph.edges[j].from -= 1;
    if (graph.edges[j].to > i) graph.edges[j].to -= 1;
  }
}

/**
 * Removes a vertex from an animation graph. Warns if vertex was not found in the animation graph.
 * @param graph - Animation graph to remove vertex from
 * @param vertex - Vertex to remove
 */
export function removeVertex(graph: AnimationGraph, vertex: AnimationGraph | AnimationNode) {
  const index = graph.vertices.indexOf(vertex);
  if (index == -1) {
    console.warn('Attempting to remove non-existent vertex', vertex);
    return;
  }

  removeVertexAt(graph, index);
}

/**
 *
 * @param index
 * @param edges
 * @returns
 */
export function getNeighbours(index: number, edges: Edge[]): { neighbour: number; road: Edge }[] {
  const neighbours = [];

  for (const edge of edges) {
    if (edge.from == index) {
      neighbours.push({ neighbour: edge.to, road: edge });
    }
  }

  return neighbours;
}

export function getOutgoingNeighbours(
  index: number,
  edges: Edge[]
): { neighbour: number; road: Edge }[] {
  const neighbours = [];

  for (const edge of edges) {
    if (edge.to == index) {
      neighbours.push({ neighbour: edge.from, road: edge });
    }
  }

  return neighbours;
}

export function getOutgoingFlow(
  index: number,
  edges: Edge[],
  mask: Set<number> = new Set()
): number[] {
  const outgoing: number[] = [];

  const visited = new Set([index]);
  const queue = [index];

  while (queue.length != 0) {
    // Vertex that'll be visited now
    const vertex = queue.shift();

    const neighbours = getNeighbours(vertex, edges);

    for (const { neighbour, road } of neighbours) {
      if (mask.has(neighbour)) continue;

      if (road.type == EdgeType.FlowEdge) {
        outgoing.push(neighbour);
      }

      if (!visited.has(neighbour)) {
        queue.push(neighbour);
        visited.add(neighbour);
      }
    }
  }

  return outgoing;
}

export function getIncomingFlow(
  index: number,
  edges: Edge[],
  mask: Set<number> = new Set()
): number[] {
  const incoming: number[] = [];

  const visited = new Set([index]);
  const queue = [index];

  while (queue.length != 0) {
    // Vertex that'll be visited now
    const vertex = queue.shift();

    const neighbours = getOutgoingNeighbours(vertex, edges);

    for (const { neighbour, road } of neighbours) {
      if (mask.has(neighbour)) continue;

      if (road.type == EdgeType.FlowEdge) {
        incoming.push(neighbour);
      }

      if (!visited.has(neighbour)) {
        queue.push(neighbour);
        visited.add(neighbour);
      }
    }
  }
  return incoming;
}

// /**
//  * @param {number} index
//  * @param {Edge[]} edges
//  * @returns {number[]}
//  */
// export function getIncomingFlow(index: number, edges: Edge[], mask = new Set()): number[] {
//     const incoming = [];

//     const visited = new Set([index]);
//     const queue = [index];

//     while (queue.length != 0) {
//         // Vertex that'll be visited now
//         const vertex = queue.shift();

//         const neighbours = getOutgoingNeighbours(vertex, edges);

//         for (const { neighbour, road } of neighbours) {
//             if (mask.has(neighbour)) continue;

//             if (road instanceof FlowEdge) {
//                 incoming.push(neighbour);
//             }

//             if (!visited.has(neighbour)) {
//                 queue.push(neighbour);
//                 visited.add(neighbour);
//             }
//         }
//     }
//     return incoming;
// }

// export function computeStartAndEnd() {
//     if (
//         !this.isSection &&
//         !(this.node.constructor.name == 'BlockStatement') &&
//         !(this.node.constructor.name == 'Program')
//     )
//         return;

//     const start = this.vertices[0];
//     const end = this.vertices[this.vertices.length - 1];

//     // If this is a section, then mark the vertices where it can start, and the vertices where it ends
//     for (let j = 1; j < this.vertices.length - 1; j++) {
//         const outgoing_flow = getOutgoingFlow(j, this.edges, new Set([0, this.vertices.length - 1]));
//         const incoming_flow = getIncomingFlow(j, this.edges, new Set([0, this.vertices.length - 1]));

//         if (outgoing_flow.length == 0) {
//             this.addEdge(
//                 new FlowEdge(
//                     j,
//                     this.vertices.length - 1,
//                     // @ts-ignore
//                     end.getData.bind(end)
//                 )
//             );
//         }

//         if (incoming_flow.length == 0) {
//             // @ts-ignore
//             this.addEdge(new FlowEdge(0, j, start.getData.bind(start)));
//         }
//     }
// }

// export function collapseTimes() {
//     // Construct the graph into a LP problem
//     const variables = this.vertices.map((vertex, i) => `V${i}`);

//     // Limits
//     let limits = [];
//     for (let i = 0; i < this.edges.length; i++) {
//         const limit = `E${i}: ${this.edges[i].getConstraint(this.vertices)}`;
//         limits.push(limit);
//     }

//     // Bounds
//     let bounds = [];
//     for (let i = 0; i < this.vertices.length; i++) {
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

//     const solution = solveLP(data);

//     this.collapsedStarts = [];
//     for (let i = 0; i < this.vertices.length; i++) {
//         const start = solution.result[`V${i}`];
//         this.collapsedStarts.push(start);
//     }

//     console.log(this.collapsedStarts);
// }

/**
 * Returns set of dependency edges from vertices[index] to all other vertices.
 * TODO: either direct comparison, or item in an object (i.e. a write to the entire object)
 */
// export function computeEdges(index: number, graph: AnimationGraph, masks: Set<string>[] = []): Edge[] {
//     let edges: Edge[] = [];

//     let reads = graph.vertices[index].reads();
//     let writes = graph.vertices[index].writes();

//     console.log(reads, graph.vertices[index]);

//     // if (reads == null || writes == null || vertices[index].constructor.name == 'CursorLineAnimation') return new Set();

//     const flow_added: AnimationData[] = [];
//     const anti_added: AnimationData[] = [];
//     const output_added: AnimationData[] = [];
//     // const conditional_added = new Set();

//     // let candidates = [];

//     // candidates = graph.vertices.slice(0, index - 1);
//     // candidates.reverse();

//     // Look at all vertices 'before' this one, starting from the closest one

//     for (let i = index - 1; i >= 0; i--) {
//         let other = graph.vertices[i];

//         let other_reads = other.reads();
//         let other_writes = other.writes();

//         // If this statement read something that the other statement writes to
//         const flow: AnimationData[] = intersection(reads, other_writes);

//         // If this statement writes something that the other statement reads from
//         const anti = intersection(writes, other_reads);

//         // If this statement writes something that the other statement writes to
//         const output = intersection(writes, other_writes);

//         const fromId = graph.vertices[i].id;
//         const toId = graph.vertices[index].id;

//         if (masks.some((group) => group.has(fromId) && group.has(toId))) {
//             continue;
//         }

//         // Add flow edges
//         for (const data of flow) {
//             if (flow_added.some((existing) => existing.id == data.id)) continue;
//             edges.push(new FlowEdge(i, index, data));
//             flow_added.push(data);
//         }

//         // Add anti edges
//         for (const data of anti) {
//             if (anti_added.some((existing) => existing.id == data.id)) continue;
//             edges.push(new AntiEdge(i, index, data));
//             anti_added.push(data);
//         }

//         // Add output edges
//         for (const data of output) {
//             if (output_added.some((existing) => existing.id == data.id) || i == index) continue;
//             edges.push(new OutputEdge(i, index, data));
//             output_added.push(data);
//         }
//     }

//     return edges;
// }

// export function computeAllEdges(graph: AnimationGraph, masks: Set<string>[] = []) {
//     let edges: Set<Edge> = new Set();

//     for (let i = 0; i < graph.vertices.length; i++) {
//         edges = new Set([...edges, ...computeEdges(i, graph, masks)]);
//     }

//     edges.forEach((edge) => {
//         graph.addEdge(edge);
//     });
// }

// export function computeAllGraphEdges(animation: AnimationGraph) {
//     if (animation instanceof AnimationGraph) {
//         for (const node of animation.vertices) {
//             if (node instanceof AnimationGraph) {
//                 computeAllGraphEdges(node);
//             }
//         }
//     }

//     computeAllEdges(animation);
// }
// function intersection(A: AnimationData[], B: AnimationData[]) {
//     // Intersection between two sets A, B
//     // let intersection = (A, B) => new Set([...A].filter(value => B.has(value)));

//     let intersection = [];

//     const satisfier = (a: AnimationData, b: AnimationData) => {
//         const b_location = b.location.map((item) => item.value);
//         const a_location = a.location.map((item) => item.value);

//         if (
//             JSON.stringify(b_location.slice(0, -1)) == JSON.stringify(a_location) ||
//             JSON.stringify(b_location) == JSON.stringify(a_location.slice(0, -1))
//         ) {
//             return true;
//         }

//         return b.id == a.id || JSON.stringify(b_location) == JSON.stringify(a_location);
//     };

//     for (const a of A) {
//         if (B.some((b) => satisfier(a, b))) {
//             intersection.push(a);
//         }
//     }

//     return intersection;
// }

// export function animationDataToString(data: AnimationData) {
//     // return `D(${data.id})`;
//     return `D(${data.location.map((acc) => `${acc.value.toString()}`).join('#')})`;
// }

/*
#fontSize: 8
#spacing: 16
#padding: 0
#ranker: longest-path
#lineWidth: 1

#.box: fill=#454442 stroke=#FDF6E3
*/

export function animationToString(
  animation: AnimationGraph | AnimationNode,
  indent = 0,
  options = { first: false },
  logUrl = false
) {
  if (animation == null) return;

  if (instanceOfAnimationNode(animation)) {
    const space = `${'\t'.repeat(options.first ? 0 : indent)}`;
    return space + `[<box> ${animation.name} --- ${animation.id} ]`;
  }

  let output = '';

  let visited_vertices = new Set();
  let visited_edges = new Set();

  // Edges
  // for (const edge of animation.edges) {
  //     visited_vertices.add(edge.to);
  //     visited_vertices.add(edge.from);
  //     visited_edges.add(`${edge.to}_${edge.from}`);

  //     let v1 = animationToString(animation.vertices[edge.from], indent + 1, {
  //         first: false,
  //     });
  //     let v2 = animationToString(animation.vertices[edge.to], indent + 1, {
  //         first: true,
  //     });

  //     output += `${v1}${edge.data} ->${v2}\n`;
  // }

  const lookup = {};

  // Sequential edges
  for (let i = animation.vertices.length - 1; i >= 1; i--) {
    const from = i - 1;
    const to = i;

    if (visited_edges.has(`${to}_${from}`)) continue;

    visited_vertices.add(to);
    visited_vertices.add(from);
    visited_edges.add(`${to}_${from}`);

    // console.log(animation.id, from, to);

    // if (animation.vertices[from] == animation) console.log('CIRCULAR');

    if (!(from in lookup)) {
      let v1 = animation.vertices[from]
        ? animationToString(animation.vertices[from], indent + 1, { first: true })
        : `[${from}_Null]`;
      lookup[from] = v1;
    }

    if (!(to in lookup)) {
      let v2 = animation.vertices[to]
        ? animationToString(animation.vertices[to], indent + 1, { first: true })
        : `[${to}_Null]`;
      lookup[to] = v2;
    }

    output = `${'\t'.repeat(indent + 1)}${lookup[from]}--${lookup[to]}\n${output}`;
  }

  // Left out vertices
  for (let i = 0; i < animation.vertices.length; i++) {
    if (animation.vertices[i] == null) continue;
    if (i in lookup) continue;

    if (!visited_vertices.has(i)) {
      output += `${animationToString(animation.vertices[i], indent + 1, {
        first: false,
      })}\n`;
    }
  }

  output = `${'\t'.repeat(options.first ? 0 : indent)}[<package> ${animation.nodeData?.type} ${
    animation.id
  } |\n${output}`;

  output += `${'\t'.repeat(indent)}]`;

  if (logUrl) {
    const config = `#fontSize: 8
#spacing: 16
#.box: fill=#454442 stroke=#FDF6E3
#padding: 0
#ranker: longest-path
#lineWidth: 1`;

    console.log(
      `https://nomnoml.com/image.svg?source=${encodeURIComponent(`${config}\n${output}`)}`
    );
  }

  return output;
}

// export function computeParentIds(animation: AnimationGraph | AnimationNode, parentIds: Set<string> = new Set()) {
//     animation.parentIds = parentIds;

//     if (animation instanceof AnimationGraph) {
//         for (const node of animation.vertices) {
//             computeParentIds(node, new Set([animation.id, ...parentIds]));
//         }
//     }
// }

// export function dissolve(animation: AnimationGraph) {
//     let masks: Set<string>[] = [];

//     // Dissolve all children
//     for (let i = animation.vertices.length - 1; i >= 0; i--) {
//         const group = dissolveAt(animation, i);
//         masks.push(new Set(group));
//     }

//     if (
//         animation.vertices[0] instanceof CreateScopeAnimation &&
//         animation.vertices[animation.vertices.length - 1] instanceof PopScopeAnimation
//     ) {
//         // Remove create and pop scope animations
//         animation.removeVertexAt(animation.vertices.length - 1);
//         animation.removeVertexAt(0);
//     }

//     computeAllEdges(animation);
// }

// export function dissolveAt(parent: AnimationGraph, i: number) {
//     let vertex = parent.vertices[i];
//     if (vertex instanceof AnimationNode) {
//         return;
//     }

//     dissolve(vertex);

//     // Dissolve all children
//     // for (let i = vertex.vertices.length - 1; i >= 0; i--) {
//     //   const group = dissolveAt(vertex, i);
//     //   // masks.push(new Set(group));
//     // }

//     let ids = vertex.vertices.map((v) => v.id);

//     if (
//         vertex.vertices[0] instanceof CreateScopeAnimation &&
//         vertex.vertices[vertex.vertices.length - 1] instanceof PopScopeAnimation
//     ) {
//         // Remove create and pop scope animations
//         vertex.removeVertexAt(vertex.vertices.length - 1);
//         vertex.removeVertexAt(0);
//     }

//     // Gut out the animations and edges from vertex and place them in front of this vertex

//     // Mark the start and end vertices of the graph
//     // const startIds: Set<string> = new Set();
//     // const endIds: Set<string> = new Set();
//     // for (let j = 0; j < vertex.vertices.length; j++) {
//     //     const outgoing_flow = getOutgoingFlow(j, vertex.edges);
//     //     const incoming_flow = getIncomingFlow(j, vertex.edges);

//     //     if (incoming_flow.length == 0) {
//     //         startIds.add(vertex.vertices[j].id);
//     //     }

//     //     if (outgoing_flow.length == 0) {
//     //         endIds.add(vertex.vertices[j].id);
//     //     }
//     // }

//     // const incoming_edges: Edge[] = [];
//     // const outgoing_edges: Edge[] = [];

//     // for (const edge of parent.edges) {
//     //     if (edge.to == i) {
//     //         incoming_edges.push(edge);
//     //     }

//     //     if (edge.from == i) {
//     //         outgoing_edges.push(edge);
//     //     }
//     // }

//     // Remove all old edges
//     for (let k = parent.edges.length - 1; k >= 0; k--) {
//         if (parent.edges[k].from == i || parent.edges[k].to == i) {
//             parent.edges.splice(k, 1);
//         }
//     }

//     for (let j = vertex.vertices.length - 1; j >= 0; j--) {
//         parent.addVertexAt(vertex.vertices[j], i + 1);
//     }

//     for (let j = 0; j < vertex.edges.length; j++) {
//         vertex.edges[j].from += i + 1;
//         vertex.edges[j].to += i + 1;

//         parent.edges.push(vertex.edges[j]);
//     }

//     // Redirect edges that were coming into 'i' to all of its start nodes
//     // for (const edge of incoming_edges) {
//     //     for (let k = parent.vertices.length - 1; k >= 0; k--) {
//     //         if (startIds.has(parent.vertices[k].id)) {
//     //             const copy: Edge = new (<any>edge.constructor)(edge.from, k, edge.data);
//     //             parent.addEdge(copy);
//     //         }
//     //     }
//     // }

//     // // Redirect edges that were outgoing from 'i' to all of its end nodes
//     // for (const edge of outgoing_edges) {
//     //     for (let k = parent.vertices.length - 1; k >= 0; k--) {
//     //         if (endIds.has(parent.vertices[k].id)) {
//     //             const copy: Edge = new (<any>edge.constructor)(k, edge.to, edge.data);
//     //             parent.addEdge(copy);
//     //         }
//     //     }
//     // }

//     // Remove vertex
//     parent.removeVertexAt(i);

//     return ids;
// }
