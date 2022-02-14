import { ExecutionNode } from '../../primitive/ExecutionNode'
import { DataInfo, ExecutionGraph } from '../ExecutionGraph'

export enum EdgeType {
    FlowEdge = 'FlowEdge',
    OutputEdge = 'OutputEdge',
    AntiEdge = 'AntiEdge',
}

export class Edge {
    // From, to vertex indices
    from: number
    to: number

    // Data it carries
    data: DataInfo

    type: EdgeType
    id: string
}

export function createEdge(type: EdgeType, from: number, to: number, data = null): Edge {
    this.id = 0
    return {
        from,
        to,
        data,
        type,
        id: `Edge(${++this.id})`,
    }
}

export function getEdgeConstraint(
    edge: Edge,
    vertices: (ExecutionGraph | ExecutionNode)[]
): string {
    const { to, from } = edge
    const toVertex = vertices[to]
    const fromVertex = vertices[from]

    return 'EDGES NOT SUPPORTED YET'

    // switch (edge.type) {
    //     case EdgeType.FlowEdge:
    //         return `V${to} - V${from} >= ${duration(fromVertex) + toVertex.delay}`
    //     case EdgeType.OutputEdge:
    //         return `V${to} - V${from} >= ${duration(fromVertex) + toVertex.delay}`
    //     case EdgeType.AntiEdge:
    //         return `V${from} - V${to} <= ${duration(toVertex) - fromVertex.delay}`
    // }
}
