import * as ESTree from 'estree'
import { queryAllExecutionGraph, queryExecutionGraph } from '../execution/execution'
import { ExecutionGraph, instanceOfExecutionGraph } from '../execution/graph/ExecutionGraph'
import { ExecutionNode, instanceOfExecutionNode } from '../execution/primitive/ExecutionNode'
import { Executor } from '../executor/Executor'
import { DataState, instanceOfObjectData } from '../renderer/View/Environment/data/DataState'

export interface Vector {
    x: number
    y: number
    z?: number
}

export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + t * b
}

export function overLerp(a: number, b: number, t: number, over: number = 5) {
    // const sign = Math.sign(b - a)
    if (a < b) {
        return Math.min(lerp(a, b + over, t), b)
    } else {
        return Math.max(lerp(a, b - over, t), b)
    }
}

export function lerp2(a: Vector, b: Vector, t: number) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
    }
}

export function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x))
}

export function getRelativeLocation(point: Vector, parent: Vector) {
    return {
        x: point.x - parent.x,
        y: point.y - parent.y,
    }
}

export function getNumericalValueOfStyle(styleValue: string, fallback: number = 0): number {
    let parsed = parseFloat(styleValue ?? fallback.toString())

    if (isNaN(parsed)) {
        return fallback
    } else {
        return parsed
    }
}

/**
 * @param {number} [x]
 * @param {number} [a] input range start
 * @param {number} [b] input range end
 * @param {number} [c] output range start
 * @param {number} [d] output range end
 */
export function remap(x: number, a: number, b: number, c: number, d: number) {
    return c + ((d - c) / (b - a)) * (x - a)
}

export function solveLP(data, mip = true) {
    const solver = window['__GLP']
    let logs = []

    function log(value) {
        logs.push({ action: 'log', message: value })
    }

    solver.glp_set_print_func(log)

    var lp

    var result = {},
        objective,
        i
    try {
        lp = solver.glp_create_prob()
        solver.glp_read_lp_from_string(lp, null, data)

        solver.glp_scale_prob(lp, solver.GLP_SF_AUTO)

        var smcp = new solver.SMCP({ presolve: solver.GLP_ON })
        solver.glp_simplex(lp, smcp)

        if (mip) {
            solver.glp_intopt(lp)
            objective = solver.glp_mip_obj_val(lp)
            for (i = 1; i <= solver.glp_get_num_cols(lp); i++) {
                result[solver.glp_get_col_name(lp, i)] = solver.glp_mip_col_val(lp, i)
            }
        } else {
            objective = solver.glp_get_obj_val(lp)
            for (i = 1; i <= solver.glp_get_num_cols(lp); i++) {
                result[solver.glp_get_col_name(lp, i)] = solver.glp_get_col_prim(lp, i)
            }
        }
        lp = null
    } catch (err) {
        log(err.message)
    } finally {
        console.log({ action: 'done', result: result, objective: objective })
    }

    return { logs, result, objective }
}

/**
 *
 * @param data flattened points
 * @param k tension
 * @returns
 */
export function catmullRomSolve(data: number[], k: number) {
    if (k == null) k = 1

    const size = data.length
    const last = size - 4

    let path = 'M' + [data[0], data[1]]

    for (let i = 0; i < size - 2; i += 2) {
        const x0 = i ? data[i - 2] : data[0]
        const y0 = i ? data[i - 1] : data[1]

        const x1 = data[i + 0]
        const y1 = data[i + 1]

        const x2 = data[i + 2]
        const y2 = data[i + 3]

        const x3 = i !== last ? data[i + 4] : x2
        const y3 = i !== last ? data[i + 5] : y2

        const cp1x = x1 + ((x2 - x0) / 6) * k
        const cp1y = y1 + ((y2 - y0) / 6) * k

        const cp2x = x2 - ((x3 - x1) / 6) * k
        const cp2y = y2 - ((y3 - y1) / 6) * k

        path += 'C' + [cp1x, cp1y, cp2x, cp2y, x2, y2]
    }

    return path
}

/**
 * @returns true iff query is included in data or is data itself
 */
export function includes(data: DataState, query: string) {
    if (data.id === query) {
        return true
    }

    if (instanceOfObjectData(data)) {
        if (Array.isArray(data.value)) {
            return (data.value as DataState[]).some((d) => includes(d, query))
        } else if (data.value.constructor === Object) {
            return Object.values(data.value).some((v) => includes(v, query))
        }
    }

    return false

    // if (data.type != DataType.Array) {
    //     return data.id == query
    // } else {
    //     return data.id == query || (data.value as DataState[]).some((d) => includes(d, query))
    // }
}

export function bboxContains(
    bbox1: {
        x: number
        y: number
        width: number
        height: number
    },
    bbox2: {
        x: number
        y: number
        width: number
        height: number
    }
): boolean {
    return (
        bbox1.x <= bbox2.x &&
        bbox1.y <= bbox2.y &&
        bbox1.x + bbox1.width >= bbox2.x + bbox2.width &&
        bbox1.y + bbox1.height >= bbox2.y + bbox2.height
    )
}

// export function growChunk(chunk: Set<string>) {
//     // Base cases

//     // Empty chunk
//     if (chunk.size === 0) {
//         return []
//     }

//     // Single chunk
//     if (chunk.size == 1) {
//         return queryExecutionGraph(Executor.instance.execution, (node) => node.id == [...chunk][0])
//     }

//     // Find a candidate parent (if any) by backtracking through each child

//     for (const child of chunk) {
//         const parent = queryExecutionGraph(
//             Executor.instance.execution,
//             (node) =>
//                 instanceOfExecutionGraph(node) && node.vertices.map((v) => v.id).includes(child)
//         )

//         // Is the root
//         if (parent == null) {
//             continue
//         }
//     }
// }

export function getDeepestChunks(
    parentExecution: ExecutionGraph | ExecutionNode,
    selection: Set<string>
): (ExecutionGraph | ExecutionNode)[] {
    // Base cases
    if (selection.size == 0) {
        return []
    }

    if (instanceOfExecutionNode(parentExecution)) {
        if (selection.has(parentExecution.id) && selection.size == 1) {
            return [parentExecution]
        } else {
            return []
        }
    }

    if (parentExecution.vertices.length == 0) {
        return []
    } else if (parentExecution.vertices.length == 1) {
        const deepestChunks = getDeepestChunks(parentExecution.vertices[0], selection)
        if (deepestChunks.length == 1 && deepestChunks[0].id == parentExecution.vertices[0].id) {
            return [parentExecution]
        } else {
            return deepestChunks
        }
    }

    // Which vertex of parent contains what bits of the chunk
    const childrenContains: Set<string>[] = []

    for (const c of parentExecution.vertices) {
        let child = c

        const contains: Set<string> = new Set()
        for (const id of selection) {
            if (queryExecutionGraph(child, (node) => node.id == id) != null) {
                contains.add(id)
            }
        }

        if (contains.size == selection.size) {
            // Found a vertex that contains the whole chunk, return the deepest chunk in that node
            return getDeepestChunks(child, selection)
        } else {
            childrenContains.push(contains)
        }
    }

    // Selection is contained partially in every animation
    const allArePartiallyContained = childrenContains.every((set) => set.size > 0)

    // Each of those partial containments are deepest chunks
    let allAreDeepestChunks = true
    let allDeepestChunks: (ExecutionGraph | ExecutionNode)[] = []
    for (let i = 0; i < childrenContains.length; i++) {
        const deepestChunks = getDeepestChunks(parentExecution.vertices[i], childrenContains[i])
        allDeepestChunks.push(...deepestChunks)

        if (deepestChunks.length != 1 || deepestChunks[0].id != parentExecution.vertices[i].id) {
            allAreDeepestChunks = false
        }
    }

    // console.log(allDeepestChunks, parentExecution.nodeData.type)
    const parent = queryExecutionGraph(
        Executor.instance.execution,
        (node) =>
            instanceOfExecutionGraph(node) &&
            node.vertices.map((v) => v.id).includes(parentExecution.id)
    )
    // console.log(parent)

    if (allArePartiallyContained && allAreDeepestChunks) {
        console.log(parentExecution.nodeData.type, 'A')
        return [parentExecution]
    } else {
        console.log(allDeepestChunks, 'B')
        return allDeepestChunks
    }
}

export function stripChunk(chunk: ExecutionGraph | ExecutionNode) {
    let blacklist = new Set<string>([
        'IfStatement',
        'ForStatement',
        'ReturnStatement',
        'CallExpression',
    ])
    if (
        instanceOfExecutionGraph(chunk) &&
        chunk.vertices.length == 1 &&
        !blacklist.has(chunk.nodeData.type)
    ) {
        return stripChunk(chunk.vertices[0])
    }

    return chunk
}

export function getClosestMatch(target: ESTree.SourceLocation) {
    const allNodes = queryAllExecutionGraph(Executor.instance.execution, (node) => true)
    const allDistances = allNodes.map((node) =>
        tokenDistanceFromTarget(node.nodeData.location, target)
    )
    // const minDistance = Math.min(...allDistances)

    let minNodes: (ExecutionGraph | ExecutionNode)[] = []

    const blacklist = new Set<string>([
        'BinaryExpressionEvaluate',
        'ForStatementIteration',
        'BlockStatement',
    ])
    for (let i = 0; i < allNodes.length; i++) {
        if (allDistances[i] == 0 && !blacklist.has(allNodes[i].nodeData.type)) {
            minNodes.push(allNodes[i])
        }
    }

    let toRemove = new Set<string>()
    for (let i = 0; i < minNodes.length; i++) {
        if (minNodes[i].nodeData.type == 'Arguments') {
            const children = (minNodes[i] as ExecutionGraph).vertices.map((v) => v.id)
            for (const other of minNodes) {
                if (children.includes(other.id)) {
                    toRemove.add(minNodes[i].id)
                }
            }
        }
    }

    minNodes = minNodes.filter((node) => !toRemove.has(node.id))

    console.log(minNodes.map((n) => [n.nodeData.type, n.id]))

    return minNodes

    // const minDistanceIndex = allDistances.indexOf(minDistance)
    // // console.log(minDistance, allNodes[minDistanceIndex].nodeData.type)
    // // console.log(allNodes[minDistanceIndex].nodeData.location, target)

    // if (minDistance == 0) {
    //     return [allNodes[minDistanceIndex]]
    // } else {
    //     return null
    // }
}

export function tokenDistanceFromTarget(
    node: ESTree.SourceLocation,
    target: ESTree.SourceLocation
) {
    // Multiline selection
    if (target.end.line - target.start.line > 0) {
        return (
            Math.abs(node.start.line - target.start.line) +
            Math.abs(node.end.line - target.end.line)
        )
    }

    return (
        Math.abs(node.start.line - target.start.line) +
        Math.abs(node.start.column - target.start.column + 1) +
        Math.abs(node.end.line - target.end.line) +
        Math.abs(node.end.column - target.end.column + 1)
    )
}
