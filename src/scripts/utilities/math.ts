export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + t * b
}

export function lerp2(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
    }
}

export function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x))
}

export function solveLP(data: string, mip = true) {
    let logs = []

    function log(value: any) {
        logs.push({ action: 'log', message: value })
    }

    glp_set_print_func(log)

    var lp: any

    var result = {},
        objective: any,
        i: number
    try {
        lp = glp_create_prob()
        glp_read_lp_from_string(lp, null, data)

        glp_scale_prob(lp, GLP_SF_AUTO)

        var smcp = new SMCP({ presolve: GLP_ON })
        glp_simplex(lp, smcp)

        if (mip) {
            glp_intopt(lp)
            objective = glp_mip_obj_val(lp)
            for (i = 1; i <= glp_get_num_cols(lp); i++) {
                result[glp_get_col_name(lp, i)] = glp_mip_col_val(lp, i)
            }
        } else {
            objective = glp_get_obj_val(lp)
            for (i = 1; i <= glp_get_num_cols(lp); i++) {
                result[glp_get_col_name(lp, i)] = glp_get_col_prim(lp, i)
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
 * @param {Number} [x]
 * @param {Number} [a] input range start
 * @param {Number} [b] input range end
 * @param {Number} [c] output range start
 * @param {Number} [d] output range end
 */
export function remap(x: number, a: number, b: number, c: number, d: number) {
    return c + ((d - c) / (b - a)) * (x - a)
}
