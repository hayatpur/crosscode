import './glpk';

export interface Vector {
    x: number;
    y: number;
    z?: number;
}

export function lerp(a: number, b: number, t: number) {
    return a * (1 - t) + t * b;
}

export function lerp2(a: Vector, b: Vector, t: number) {
    return {
        x: lerp(a.x, b.x, t),
        y: lerp(a.y, b.y, t),
    };
}

export function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

export function getRelativeLocation(point: Vector, parent: Vector) {
    return {
        x: point.x - parent.x,
        y: point.y - parent.y,
    };
}

export function getNumericalValueOfStyle(styleValue: string, fallback: number = 0): number {
    let parsed = parseFloat(styleValue ?? fallback.toString());

    if (isNaN(parsed)) {
        return fallback;
    } else {
        return parsed;
    }
}

/**
 * @param {Number} [x]
 * @param {Number} [a] input range start
 * @param {Number} [b] input range end
 * @param {Number} [c] output range start
 * @param {Number} [d] output range end
 */
export function remap(x: number, a: number, b: number, c: number, d: number) {
    return c + ((d - c) / (b - a)) * (x - a);
}

export function solveLP(data, mip = true) {
    const solver = window['__GLP'];
    let logs = [];

    function log(value) {
        logs.push({ action: 'log', message: value });
    }

    solver.glp_set_print_func(log);

    var lp;

    var result = {},
        objective,
        i;
    try {
        lp = solver.glp_create_prob();
        solver.glp_read_lp_from_string(lp, null, data);

        solver.glp_scale_prob(lp, solver.GLP_SF_AUTO);

        var smcp = new solver.SMCP({ presolve: solver.GLP_ON });
        solver.glp_simplex(lp, smcp);

        if (mip) {
            solver.glp_intopt(lp);
            objective = solver.glp_mip_obj_val(lp);
            for (i = 1; i <= solver.glp_get_num_cols(lp); i++) {
                result[solver.glp_get_col_name(lp, i)] = solver.glp_mip_col_val(lp, i);
            }
        } else {
            objective = solver.glp_get_obj_val(lp);
            for (i = 1; i <= solver.glp_get_num_cols(lp); i++) {
                result[solver.glp_get_col_name(lp, i)] = solver.glp_get_col_prim(lp, i);
            }
        }
        lp = null;
    } catch (err) {
        log(err.message);
    } finally {
        console.log({ action: 'done', result: result, objective: objective });
    }

    return { logs, result, objective };
}
