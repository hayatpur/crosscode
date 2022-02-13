import './glpk'

export interface Vector {
    x: number
    y: number
    z?: number
}

export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + t * b
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

export function getNumericalValueOfStyle(
    styleValue: string,
    fallback: number = 0
): number {
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
                result[solver.glp_get_col_name(lp, i)] = solver.glp_mip_col_val(
                    lp,
                    i
                )
            }
        } else {
            objective = solver.glp_get_obj_val(lp)
            for (i = 1; i <= solver.glp_get_num_cols(lp); i++) {
                result[solver.glp_get_col_name(lp, i)] =
                    solver.glp_get_col_prim(lp, i)
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
