import { AnimationData, AnimationGraph } from '../animation/graph/AnimationGraph';
import { Edge } from '../animation/graph/edges/Edge';
import FlowEdge from '../animation/graph/edges/FlowEdge';
import CopyDataAnimation from '../animation/primitive/Data/CopyDataAnimation';
import MoveAndPlaceAnimation from '../animation/primitive/Data/MoveAndPlaceAnimation';

// Of type ......... Move(A, B) ---B--> Copy(B, C) ---C--> Move(C, D)
// Simplifies to ... Move(A, D)
interface Type1Movement {
    // Animations
    move0: MoveAndPlaceAnimation;
    copy: CopyDataAnimation;
    move1: MoveAndPlaceAnimation;

    // Edges
    edge0: Edge;
    edge1: Edge;
}

// Type 1 Movement
// can be simplified to: Move(A,D)
export function findMovementSubgraph(graph: AnimationGraph): Type1Movement {
    // Data Ids
    let A: AnimationData, B: AnimationData, C: AnimationData, D: AnimationData;

    // Movement
    const movement: Type1Movement = {
        // Animations
        move0: null,
        copy: null,
        move1: null,

        // Edges
        edge0: null,
        edge1: null,
    };

    // Find all flow edges that go from Movement(A, B) to Movement(B, C)
    for (const edge of graph.edges) {
        if (!(edge instanceof FlowEdge)) continue;

        if (!(graph.vertices[edge.from] instanceof MoveAndPlaceAnimation)) continue;
        if (!(graph.vertices[edge.to] instanceof CopyDataAnimation)) continue;

        movement.move0 = graph.vertices[edge.from] as MoveAndPlaceAnimation;
        movement.copy = graph.vertices[edge.to] as CopyDataAnimation;
        movement.edge0 = edge;

        A = movement.move0.reads()[0];
        B = movement.copy.reads()[0];

        if (B.id != edge.data.id || B.id != movement.move0.writes()[0].id) continue;

        C = movement.copy.writes()[0];

        for (const other of graph.edges) {
            if (!(other instanceof FlowEdge) || other.from != edge.to || other.data.id != C.id) continue;
            if (!(graph.vertices[other.to] instanceof MoveAndPlaceAnimation)) continue;

            movement.move1 = graph.vertices[other.to] as MoveAndPlaceAnimation;
            movement.edge1 = other;

            D = movement.move1.writes()[0];

            // TODO: Other dependency checks
            return movement;
        }
    }

    return null;
}

export function simplifyMovement(graph: AnimationGraph, movement: Type1Movement) {
    const move0Index = graph.vertices.findIndex((v) => v.id == movement.move0.id);

    // Redirect outgoing edges into start vertex
    for (const edge of graph.edges) {
        if (graph.vertices[edge.from] == movement.move1) {
            edge.from = move0Index;
        }
    }

    // Reconfigure move
    movement.move0.outputSpecifier = movement.move1.outputSpecifier;

    // Remove second move
    graph.removeVertex(movement.move1);
    // Remove copy vertex
    graph.removeVertex(movement.copy);

    // Remove both edges
    graph.removeEdge(movement.edge0);
    graph.removeEdge(movement.edge1);
}
