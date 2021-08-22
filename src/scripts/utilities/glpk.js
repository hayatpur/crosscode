/*! glpk.js - v4.49.0
 * https://github.com/hgourvest/glpk.js
 * Copyright (c) 2013 Henri Gourvest; Licensed GPLv2 */
window['__GLP'] = {};
var t = Number.MAX_VALUE,
    fa = Number.MIN_VALUE;
function x(a) {
    throw Error(a);
}
function y() { }
window['__GLP'].glp_get_print_func = function () {
    return y;
};
window['__GLP'].glp_set_print_func = function (a) {
    y = a;
};
function ga(a, b) {
    for (var c in b) a[c] = b[c];
}
function ha(a, b, c, d, e) {
    for (; 0 < e; b++, d++, e--) a[b] = c[d];
}
function ja(a, b, c, d) {
    for (; 0 < d; b++, d--) a[b] = c;
}
function ka(a, b, c) {
    for (; 0 < c; b++, c--) a[b] = {};
}
function la() {
    return new Date().getTime();
}
function ma(a) {
    return (la() - a) / 1e3;
}
function na(a, b, c) {
    var d = Array(b);
    ha(d, 0, a, 1, b);
    d.sort(c);
    ha(a, 1, d, 0, b);
}
var pa = {},
    sa = (window['__GLP'].glp_version = function () {
        return qa + "." + ra;
    });
function ta(a) {
    a = "string" == typeof a ? a.charCodeAt(0) : -1;
    return (0 <= a && 31 >= a) || 127 == a;
}
function ua(a) {
    a = "string" == typeof a ? a.charCodeAt(0) : -1;
    return (65 <= a && 90 >= a) || (97 <= a && 122 >= a);
}
function va(a) {
    a = "string" == typeof a ? a.charCodeAt(0) : -1;
    return (65 <= a && 90 >= a) || (97 <= a && 122 >= a) || (48 <= a && 57 >= a);
}
function wa(a) {
    a = "string" == typeof a ? a.charCodeAt(0) : -1;
    return 48 <= a && 57 >= a;
}
function xa() {
    function a(a, d, e, h, l, n, m) {
        a = a >>> 0;
        e = (e && a && { 2: "0b", 8: "0", 16: "0x" }[d]) || "";
        a = e + c(a.toString(d), n || 0, "0", !1);
        return b(a, e, h, l, m);
    }
    function b(a, b, d, e, l, n) {
        var m = e - a.length;
        0 < m && (a = d || !l ? c(a, e, n, d) : a.slice(0, b.length) + c("", m, "0", !0) + a.slice(b.length));
        return a;
    }
    function c(a, b, c, d) {
        c || (c = " ");
        b = a.length >= b ? "" : Array((1 + b - a.length) >>> 0).join(c);
        return d ? a + b : b + a;
    }
    var d = arguments,
        e = 0;
    return d[e++].replace(
        /%%|%(\d+\$)?([-+\'#0 ]*)(\*\d+\$|\*|\d+)?(\.(\*\d+\$|\*|\d+))?([scboxXuideEfFgG])/g,
        function (f, g, k, h, l, n, m) {
            var q, r;
            if ("%%" == f) return "%";
            var p = !1;
            r = "";
            var u = (l = !1);
            q = " ";
            for (var v = k.length, H = 0; k && H < v; H++)
                switch (k.charAt(H)) {
                    case " ":
                        r = " ";
                        break;
                    case "+":
                        r = "+";
                        break;
                    case "-":
                        p = !0;
                        break;
                    case "'":
                        q = k.charAt(H + 1);
                        break;
                    case "0":
                        l = !0;
                        break;
                    case "#":
                        u = !0;
                }
            h = h ? ("*" == h ? +d[e++] : "*" == h.charAt(0) ? +d[h.slice(1, -1)] : +h) : 0;
            0 > h && ((h = -h), (p = !0));
            if (!isFinite(h)) throw Error("sprintf: (minimum-)width must be finite");
            n
                ? (n = "*" == n ? +d[e++] : "*" == n.charAt(0) ? +d[n.slice(1, -1)] : +n)
                : (n = -1 < "fFeE".indexOf(m) ? 6 : "d" == m ? 0 : void 0);
            g = g ? d[g.slice(0, -1)] : d[e++];
            switch (m) {
                case "s":
                    return (m = String(g)), null != n && (m = m.slice(0, n)), b(m, "", p, h, l, q);
                case "c":
                    return (
                        (m = String.fromCharCode(+g)), null != n && (m = m.slice(0, n)), b(m, "", p, h, l, void 0)
                    );
                case "b":
                    return a(g, 2, u, p, h, n, l);
                case "o":
                    return a(g, 8, u, p, h, n, l);
                case "x":
                    return a(g, 16, u, p, h, n, l);
                case "X":
                    return a(g, 16, u, p, h, n, l).toUpperCase();
                case "u":
                    return a(g, 10, u, p, h, n, l);
                case "i":
                case "d":
                    return (
                        (q = +g || 0),
                        (q = Math.round(q - (q % 1))),
                        (f = 0 > q ? "-" : r),
                        (g = f + c(String(Math.abs(q)), n, "0", !1)),
                        b(g, f, p, h, l)
                    );
                case "e":
                case "E":
                case "f":
                case "F":
                case "g":
                case "G":
                    return (
                        (q = +g),
                        (f = 0 > q ? "-" : r),
                        (r = ["toExponential", "toFixed", "toPrecision"]["efg".indexOf(m.toLowerCase())]),
                        (m = ["toString", "toUpperCase"]["eEfFgG".indexOf(m) % 2]),
                        (g = f + Math.abs(q)[r](n)),
                        b(g, f, p, h, l)[m]()
                    );
                default:
                    return f;
            }
        }
    );
}
function ya(a) {
    a.Ad = 3621377730;
    a.ie = null;
    a.$ = null;
    a.name = null;
    a.ib = null;
    a.dir = za;
    a.la = 0;
    a.kb = 100;
    a.N = 200;
    a.h = a.n = 0;
    a.O = 0;
    a.o = Array(1 + a.kb);
    a.g = Array(1 + a.N);
    a.gc = {};
    a.Kc = {};
    a.valid = 0;
    a.head = new Int32Array(1 + a.kb);
    a.Pd = null;
    a.Y = null;
    a.ra = a.wa = Aa;
    a.ea = 0;
    a.da = 0;
    a.some = 0;
    a.bf = Aa;
    a.Zd = 0;
    a.Da = Aa;
    a.xa = 0;
}
var Ba = (window['__GLP'].glp_create_prob = function () {
    var a = {};
    ya(a);
    return a;
}),
    Ca = (window['__GLP'].glp_set_prob_name = function (a, b) {
        var c = a.$;
        null != c && 0 != c.reason && x("glp_set_prob_name: operation not allowed");
        a.name = b;
    }),
    Da = (window['__GLP'].glp_set_obj_name = function (a, b) {
        var c = a.$;
        null != c && 0 != c.reason && x("glp_set_obj_name: operation not allowed");
        a.ib = b;
    }),
    Fa = (window['__GLP'].glp_set_obj_dir = function (a, b) {
        var c = a.$;
        null != c && 0 != c.reason && x("glp_set_obj_dir: operation not allowed");
        b != za && b != Ea && x("glp_set_obj_dir: dir = " + b + "; invalid direction flag");
        a.dir = b;
    }),
    La = (window['__GLP'].glp_add_rows = function (a, b) {
        var c = a.$,
            d;
        1 > b && x("glp_add_rows: nrs = " + b + "; invalid number of rows");
        b > 1e8 - a.h && x("glp_add_rows: nrs = " + b + "; too many rows");
        var e = a.h + b;
        if (a.kb < e) {
            for (; a.kb < e;) a.kb += a.kb;
            a.o.length = 1 + a.kb;
            a.head = new Int32Array(1 + a.kb);
        }
        for (var f = a.h + 1; f <= e; f++) {
            a.o[f] = d = {};
            d.ia = f;
            d.name = null;
            d.node = null;
            d.level = 0;
            d.origin = 0;
            d.qc = 0;
            if (null != c)
                switch (c.reason) {
                    case Ga:
                        d.level = c.R.level;
                        d.origin = Ha;
                        break;
                    case Ia:
                        (d.level = c.R.level), (d.origin = Ja);
                }
            d.type = Ka;
            d.c = d.f = 0;
            d.l = null;
            d.qa = 1;
            d.stat = A;
            d.bind = 0;
            d.w = d.M = 0;
            d.Tb = d.nc = 0;
            d.Va = 0;
        }
        a.h = e;
        a.valid = 0;
        null != c && 0 != c.reason && (c.ne = 1);
        return e - b + 1;
    }),
    Oa = (window['__GLP'].glp_add_cols = function (a, b) {
        var c = a.$;
        null != c && 0 != c.reason && x("glp_add_cols: operation not allowed");
        1 > b && x("glp_add_cols: ncs = " + b + "; invalid number of columns");
        b > 1e8 - a.n && x("glp_add_cols: ncs = " + b + "; too many columns");
        var d = a.n + b;
        if (a.N < d) {
            for (; a.N < d;) a.N += a.N;
            a.g.length = 1 + a.N;
        }
        for (var e = a.n + 1; e <= d; e++)
            (a.g[e] = c = {}),
                (c.H = e),
                (c.name = null),
                (c.node = null),
                (c.kind = Ma),
                (c.type = C),
                (c.c = c.f = 0),
                (c.B = 0),
                (c.l = null),
                (c.za = 1),
                (c.stat = Na),
                (c.bind = 0),
                (c.w = c.M = 0),
                (c.Tb = c.nc = 0),
                (c.Va = 0);
        a.n = d;
        return d - b + 1;
    }),
    Pa = (window['__GLP'].glp_set_row_name = function (a, b, c) {
        (1 <= b && b <= a.h) || x("glp_set_row_name: i = " + b + "; row number out of range");
        b = a.o[b];
        null != b.name && (delete a.gc[b.name], (b.name = null));
        null != c && ((b.name = c), (a.gc[b.name] = b));
    }),
    Qa = (window['__GLP'].glp_set_col_name = function (a, b, c) {
        var d = a.$;
        null != d && 0 != d.reason && x("glp_set_col_name: operation not allowed");
        (1 <= b && b <= a.n) || x("glp_set_col_name: j = " + b + "; column number out of range");
        b = a.g[b];
        null != b.name && (delete a.Kc[b.name], (b.name = null));
        null != c && ((b.name = c), (a.Kc[b.name] = b));
    }),
    Ua = (window['__GLP'].glp_set_row_bnds = function (a, b, c, d, e) {
        (1 <= b && b <= a.h) || x("glp_set_row_bnds: i = " + b + "; row number out of range");
        a = a.o[b];
        a.type = c;
        switch (c) {
            case Ka:
                a.c = a.f = 0;
                a.stat != A && (a.stat = Ra);
                break;
            case Sa:
                a.c = d;
                a.f = 0;
                a.stat != A && (a.stat = M);
                break;
            case Ta:
                a.c = 0;
                a.f = e;
                a.stat != A && (a.stat = P);
                break;
            case Q:
                a.c = d;
                a.f = e;
                a.stat != A && a.stat != M && a.stat != P && (a.stat = Math.abs(d) <= Math.abs(e) ? M : P);
                break;
            case C:
                a.c = a.f = d;
                a.stat != A && (a.stat = Na);
                break;
            default:
                x("glp_set_row_bnds: i = " + b + "; type = " + c + "; invalid row type");
        }
    }),
    Va = (window['__GLP'].glp_set_col_bnds = function (a, b, c, d, e) {
        (1 <= b && b <= a.n) || x("glp_set_col_bnds: j = " + b + "; column number out of range");
        a = a.g[b];
        a.type = c;
        switch (c) {
            case Ka:
                a.c = a.f = 0;
                a.stat != A && (a.stat = Ra);
                break;
            case Sa:
                a.c = d;
                a.f = 0;
                a.stat != A && (a.stat = M);
                break;
            case Ta:
                a.c = 0;
                a.f = e;
                a.stat != A && (a.stat = P);
                break;
            case Q:
                a.c = d;
                a.f = e;
                a.stat != A && a.stat != M && a.stat != P && (a.stat = Math.abs(d) <= Math.abs(e) ? M : P);
                break;
            case C:
                a.c = a.f = d;
                a.stat != A && (a.stat = Na);
                break;
            default:
                x("glp_set_col_bnds: j = " + b + "; type = " + c + "; invalid column type");
        }
    }),
    Xa = (window['__GLP'].glp_set_obj_coef = function (a, b, c) {
        var d = a.$;
        null != d && 0 != d.reason && x("glp_set_obj_coef: operation not allowed");
        (0 <= b && b <= a.n) || x("glp_set_obj_coef: j = " + b + "; column number out of range");
        0 == b ? (a.la = c) : (a.g[b].B = c);
    }),
    Ya = (window['__GLP'].glp_set_mat_row = function (a, b, c, d, e) {
        var f, g, k;
        (1 <= b && b <= a.h) || x("glp_set_mat_row: i = " + b + "; row number out of range");
        for (var h = a.o[b]; null != h.l;)
            (g = h.l),
                (h.l = g.G),
                (f = g.g),
                null == g.va ? (f.l = g.L) : (g.va.L = g.L),
                null != g.L && (g.L.va = g.va),
                a.O--,
                f.stat == A && (a.valid = 0);
        (0 <= c && c <= a.n) || x("glp_set_mat_row: i = " + b + "; len = " + c + "; invalid row length ");
        c > 5e8 - a.O && x("glp_set_mat_row: i = " + b + "; len = " + c + "; too many constraint coefficients");
        for (k = 1; k <= c; k++)
            (g = d[k]),
                (1 <= g && g <= a.n) ||
                x("glp_set_mat_row: i = " + b + "; ind[" + k + "] = " + g + "; column index out of range"),
                (f = a.g[g]),
                null != f.l &&
                f.l.o.ia == b &&
                x(
                    "glp_set_mat_row: i = " +
                    b +
                    "; ind[" +
                    k +
                    "] = " +
                    g +
                    "; duplicate column indices not allowed"
                ),
                (g = {}),
                a.O++,
                (g.o = h),
                (g.g = f),
                (g.j = e[k]),
                (g.ya = null),
                (g.G = h.l),
                (g.va = null),
                (g.L = f.l),
                null != g.G && (g.G.ya = g),
                null != g.L && (g.L.va = g),
                (h.l = f.l = g),
                f.stat == A && 0 != g.j && (a.valid = 0);
        for (g = h.l; null != g; g = b)
            (b = g.G),
                0 == g.j &&
                (null == g.ya ? (h.l = b) : (g.ya.G = b),
                    null != b && (b.ya = g.ya),
                    (g.g.l = g.L),
                    null != g.L && (g.L.va = null),
                    a.O--);
    }),
    Za = (window['__GLP'].glp_set_mat_col = function (a, b, c, d, e) {
        var f = a.$,
            g,
            k,
            h;
        null != f && 0 != f.reason && x("glp_set_mat_col: operation not allowed");
        (1 <= b && b <= a.n) || x("glp_set_mat_col: j = " + b + "; column number out of range");
        for (f = a.g[b]; null != f.l;)
            (k = f.l),
                (f.l = k.L),
                (g = k.o),
                null == k.ya ? (g.l = k.G) : (k.ya.G = k.G),
                null != k.G && (k.G.ya = k.ya),
                a.O--;
        (0 <= c && c <= a.h) || x("glp_set_mat_col: j = " + b + "; len = " + c + "; invalid column length");
        c > 5e8 - a.O && x("glp_set_mat_col: j = " + b + "; len = " + c + "; too many constraint coefficients");
        for (h = 1; h <= c; h++)
            (k = d[h]),
                (1 <= k && k <= a.h) ||
                x("glp_set_mat_col: j = " + b + "; ind[" + h + "] = " + k + "; row index out of range"),
                (g = a.o[k]),
                null != g.l &&
                g.l.g.H == b &&
                x(
                    "glp_set_mat_col: j = " +
                    b +
                    "; ind[" +
                    h +
                    "] = " +
                    k +
                    "; duplicate row indices not allowed"
                ),
                (k = {}),
                a.O++,
                (k.o = g),
                (k.g = f),
                (k.j = e[h]),
                (k.ya = null),
                (k.G = g.l),
                (k.va = null),
                (k.L = f.l),
                null != k.G && (k.G.ya = k),
                null != k.L && (k.L.va = k),
                (g.l = f.l = k);
        for (k = f.l; null != k; k = b)
            (b = k.L),
                0 == k.j &&
                ((k.o.l = k.G),
                    null != k.G && (k.G.ya = null),
                    null == k.va ? (f.l = b) : (k.va.L = b),
                    null != b && (b.va = k.va),
                    a.O--);
        f.stat == A && (a.valid = 0);
    });
window['__GLP'].glp_load_matrix = function (a, b, c, d, e) {
    var f = a.$,
        g,
        k,
        h,
        l;
    null != f && 0 != f.reason && x("glp_load_matrix: operation not allowed");
    for (h = 1; h <= a.h; h++) for (f = a.o[h]; null != f.l;) (k = f.l), (f.l = k.G), a.O--;
    for (k = 1; k <= a.n; k++) a.g[k].l = null;
    0 > b && x("glp_load_matrix: ne = " + b + "; invalid number of constraint coefficients");
    5e8 < b && x("glp_load_matrix: ne = " + b + "; too many constraint coefficients");
    for (l = 1; l <= b; l++)
        (h = c[l]),
            (k = d[l]),
            (1 <= h && h <= a.h) || x("glp_load_matrix: ia[" + l + "] = " + h + "; row index out of range"),
            (f = a.o[h]),
            (1 <= k && k <= a.n) || x("glp_load_matrix: ja[" + l + "] = " + k + "; column index out of range"),
            (g = a.g[k]),
            (k = {}),
            a.O++,
            (k.o = f),
            (k.g = g),
            (k.j = e[l]),
            (k.ya = null),
            (k.G = f.l),
            null != k.G && (k.G.ya = k),
            (f.l = k);
    for (h = 1; h <= a.h; h++)
        for (k = a.o[h].l; null != k; k = k.G) {
            g = k.g;
            if (null != g.l && g.l.o.ia == h) {
                for (l = 1; l <= b && (c[l] != h || d[l] != g.H); l++);
                x(
                    "glp_load_mat: ia[" +
                    l +
                    "] = " +
                    h +
                    "; ja[" +
                    l +
                    "] = " +
                    g.H +
                    "; duplicate indices not allowed"
                );
            }
            k.va = null;
            k.L = g.l;
            null != k.L && (k.L.va = k);
            g.l = k;
        }
    for (h = 1; h <= a.h; h++)
        for (f = a.o[h], k = f.l; null != k; k = b)
            (b = k.G),
                0 == k.j &&
                (null == k.ya ? (f.l = b) : (k.ya.G = b),
                    null != b && (b.ya = k.ya),
                    null == k.va ? (k.g.l = k.L) : (k.va.L = k.L),
                    null != k.L && (k.L.va = k.va),
                    a.O--);
    a.valid = 0;
};
window['__GLP'].glp_check_dup = function (a, b, c, d, e) {
    var f, g, k, h, l;
    0 > a && x("glp_check_dup: m = %d; invalid parameter");
    0 > b && x("glp_check_dup: n = %d; invalid parameter");
    0 > c && x("glp_check_dup: ne = %d; invalid parameter");
    0 < c && null == d && x("glp_check_dup: ia = " + d + "; invalid parameter");
    0 < c && null == e && x("glp_check_dup: ja = " + e + "; invalid parameter");
    for (k = 1; k <= c; k++) if (((f = d[k]), (g = e[k]), !(1 <= f && f <= a && 1 <= g && g <= b))) return (a = -k);
    if (0 == a || 0 == b) return 0;
    h = new Int32Array(1 + a);
    l = new Int32Array(1 + c);
    b = new Int8Array(1 + b);
    for (k = 1; k <= c; k++) (f = d[k]), (l[k] = h[f]), (h[f] = k);
    for (f = 1; f <= a; f++) {
        for (k = h[f]; 0 != k; k = l[k]) {
            g = e[k];
            if (b[g]) {
                for (k = 1; k <= c && (d[k] != f || e[k] != g); k++);
                for (k++; k <= c && (d[k] != f || e[k] != g); k++);
                return (a = +k);
            }
            b[g] = 1;
        }
        for (k = h[f]; 0 != k; k = l[k]) b[e[k]] = 0;
    }
    return 0;
};
var $a = (window['__GLP'].glp_sort_matrix = function (a) {
    var b, c, d;
    (null != a && 3621377730 == a.Ad) || x("glp_sort_matrix: P = " + a + "; invalid problem object");
    for (c = a.h; 1 <= c; c--) a.o[c].l = null;
    for (d = a.n; 1 <= d; d--)
        for (b = a.g[d].l; null != b; b = b.L)
            (c = b.o.ia), (b.ya = null), (b.G = a.o[c].l), null != b.G && (b.G.ya = b), (a.o[c].l = b);
    for (d = a.n; 1 <= d; d--) a.g[d].l = null;
    for (c = a.h; 1 <= c; c--)
        for (b = a.o[c].l; null != b; b = b.G)
            (d = b.g.H), (b.va = null), (b.L = a.g[d].l), null != b.L && (b.L.va = b), (a.g[d].l = b);
}),
    ab = (window['__GLP'].glp_del_rows = function (a, b, c) {
        var d = a.$,
            e,
            f,
            g;
        (1 <= b && b <= a.h) || x("glp_del_rows: nrs = " + b + "; invalid number of rows");
        for (g = 1; g <= b; g++)
            (f = c[g]),
                (1 <= f && f <= a.h) || x("glp_del_rows: num[" + g + "] = " + f + "; row number out of range"),
                (e = a.o[f]),
                null != d &&
                0 != d.reason &&
                (d.reason != Ga && d.reason != Ia && x("glp_del_rows: operation not allowed"),
                    e.level != d.R.level &&
                    x(
                        "glp_del_rows: num[" +
                        g +
                        "] = " +
                        f +
                        "; invalid attempt to delete row created not in current subproblem"
                    ),
                    e.stat != A &&
                    x(
                        "glp_del_rows: num[" +
                        g +
                        "] = " +
                        f +
                        "; invalid attempt to delete active row (constraint)"
                    ),
                    (d.pf = 1)),
                0 == e.ia && x("glp_del_rows: num[" + g + "] = " + f + "; duplicate row numbers not allowed"),
                Pa(a, f, null),
                Ya(a, f, 0, null, null),
                (e.ia = 0);
        b = 0;
        for (f = 1; f <= a.h; f++) (e = a.o[f]), 0 != e.ia && ((e.ia = ++b), (a.o[e.ia] = e));
        a.h = b;
        a.valid = 0;
    });
window['__GLP'].glp_del_cols = function (a, b, c) {
    var d = a.$,
        e,
        f;
    null != d && 0 != d.reason && x("glp_del_cols: operation not allowed");
    (1 <= b && b <= a.n) || x("glp_del_cols: ncs = " + b + "; invalid number of columns");
    for (f = 1; f <= b; f++)
        (d = c[f]),
            (1 <= d && d <= a.n) || x("glp_del_cols: num[" + f + "] = " + d + "; column number out of range"),
            (e = a.g[d]),
            0 == e.H && x("glp_del_cols: num[" + f + "] = " + d + "; duplicate column numbers not allowed"),
            Qa(a, d, null),
            Za(a, d, 0, null, null),
            (e.H = 0),
            e.stat == A && (a.valid = 0);
    b = 0;
    for (d = 1; d <= a.n; d++) (e = a.g[d]), 0 != e.H && ((e.H = ++b), (a.g[e.H] = e));
    a.n = b;
    if (a.valid) for (c = a.h, e = a.head, d = 1; d <= b; d++) (f = a.g[d].bind), 0 != f && (e[f] = c + d);
};
var hb = (window['__GLP'].glp_copy_prob = function (a, b, c) {
    var d = a.$,
        e = {},
        f,
        g,
        k,
        h;
    null != d && 0 != d.reason && x("glp_copy_prob: operation not allowed");
    a == b && x("glp_copy_prob: copying problem object to itself not allowed");
    c != bb && c != cb && x("glp_copy_prob: names = " + c + "; invalid parameter");
    db(a);
    c && null != b.name && Ca(a, b.name);
    c && null != b.ib && Da(a, b.ib);
    a.dir = b.dir;
    a.la = b.la;
    0 < b.h && La(a, b.h);
    0 < b.n && Oa(a, b.n);
    eb(b, e);
    fb(a, e);
    a.ra = b.ra;
    a.wa = b.wa;
    a.ea = b.ea;
    a.some = b.some;
    a.bf = b.bf;
    a.Zd = b.Zd;
    a.Da = b.Da;
    a.xa = b.xa;
    for (f = 1; f <= b.h; f++)
        (d = a.o[f]),
            (e = b.o[f]),
            c && null != e.name && Pa(a, f, e.name),
            (d.type = e.type),
            (d.c = e.c),
            (d.f = e.f),
            (d.qa = e.qa),
            (d.stat = e.stat),
            (d.w = e.w),
            (d.M = e.M),
            (d.Tb = e.Tb),
            (d.nc = e.nc),
            (d.Va = e.Va);
    k = new Int32Array(1 + b.h);
    h = new Float64Array(1 + b.h);
    for (f = 1; f <= b.n; f++)
        (d = a.g[f]),
            (e = b.g[f]),
            c && null != e.name && Qa(a, f, e.name),
            (d.kind = e.kind),
            (d.type = e.type),
            (d.c = e.c),
            (d.f = e.f),
            (d.B = e.B),
            (g = gb(b, f, k, h)),
            Za(a, f, g, k, h),
            (d.za = e.za),
            (d.stat = e.stat),
            (d.w = e.w),
            (d.M = e.M),
            (d.Tb = e.Tb),
            (d.nc = e.nc),
            (d.Va = e.Va);
}),
    db = (window['__GLP'].glp_erase_prob = function (a) {
        var b = a.$;
        null != b && 0 != b.reason && x("glp_erase_prob: operation not allowed");
        a.Ad = 1061109567;
        a.ie = null;
        a.o = null;
        a.g = null;
        a.gc = null;
        a.Kc = null;
        a.head = null;
        a.Pd = null;
        a.Y = null;
        ya(a);
    });
window['__GLP'].glp_get_prob_name = function (a) {
    return a.name;
};
var ib = (window['__GLP'].glp_get_obj_name = function (a) {
    return a.ib;
}),
    jb = (window['__GLP'].glp_get_obj_dir = function (a) {
        return a.dir;
    }),
    kb = (window['__GLP'].glp_get_num_rows = function (a) {
        return a.h;
    }),
    lb = (window['__GLP'].glp_get_num_cols = function (a) {
        return a.n;
    }),
    mb = (window['__GLP'].glp_get_row_name = function (a, b) {
        (1 <= b && b <= a.h) || x("glp_get_row_name: i = " + b + "; row number out of range");
        return a.o[b].name;
    }),
    nb = (window['__GLP'].glp_get_col_name = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_col_name: j = " + b + "; column number out of range");
        return a.g[b].name;
    }),
    pb = (window['__GLP'].glp_get_row_type = function (a, b) {
        (1 <= b && b <= a.h) || x("glp_get_row_type: i = " + b + "; row number out of range");
        return a.o[b].type;
    }),
    qb = (window['__GLP'].glp_get_row_lb = function (a, b) {
        var c;
        (1 <= b && b <= a.h) || x("glp_get_row_lb: i = " + b + "; row number out of range");
        switch (a.o[b].type) {
            case Ka:
            case Ta:
                c = -t;
                break;
            case Sa:
            case Q:
            case C:
                c = a.o[b].c;
        }
        return c;
    }),
    rb = (window['__GLP'].glp_get_row_ub = function (a, b) {
        var c;
        (1 <= b && b <= a.h) || x("glp_get_row_ub: i = " + b + "; row number out of range");
        switch (a.o[b].type) {
            case Ka:
            case Sa:
                c = +t;
                break;
            case Ta:
            case Q:
            case C:
                c = a.o[b].f;
        }
        return c;
    }),
    sb = (window['__GLP'].glp_get_col_type = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_col_type: j = " + b + "; column number out of range");
        return a.g[b].type;
    }),
    tb = (window['__GLP'].glp_get_col_lb = function (a, b) {
        var c;
        (1 <= b && b <= a.n) || x("glp_get_col_lb: j = " + b + "; column number out of range");
        switch (a.g[b].type) {
            case Ka:
            case Ta:
                c = -t;
                break;
            case Sa:
            case Q:
            case C:
                c = a.g[b].c;
        }
        return c;
    }),
    ub = (window['__GLP'].glp_get_col_ub = function (a, b) {
        var c;
        (1 <= b && b <= a.n) || x("glp_get_col_ub: j = " + b + "; column number out of range");
        switch (a.g[b].type) {
            case Ka:
            case Sa:
                c = +t;
                break;
            case Ta:
            case Q:
            case C:
                c = a.g[b].f;
        }
        return c;
    });
window['__GLP'].glp_get_obj_coef = function (a, b) {
    (0 <= b && b <= a.n) || x("glp_get_obj_coef: j = " + b + "; column number out of range");
    return 0 == b ? a.la : a.g[b].B;
};
window['__GLP'].glp_get_num_nz = function (a) {
    return a.O;
};
var vb = (window['__GLP'].glp_get_mat_row = function (a, b, c, d) {
    var e;
    (1 <= b && b <= a.h) || x("glp_get_mat_row: i = " + b + "; row number out of range");
    e = 0;
    for (a = a.o[b].l; null != a; a = a.G) e++, null != c && (c[e] = a.g.H), null != d && (d[e] = a.j);
    return e;
}),
    gb = (window['__GLP'].glp_get_mat_col = function (a, b, c, d) {
        var e;
        (1 <= b && b <= a.n) || x("glp_get_mat_col: j = " + b + "; column number out of range");
        e = 0;
        for (a = a.g[b].l; null != a; a = a.L) e++, null != c && (c[e] = a.o.ia), null != d && (d[e] = a.j);
        return e;
    }),
    wb = (window['__GLP'].glp_create_index = function (a) {
        var b, c;
        if (null == a.gc) for (a.gc = {}, c = 1; c <= a.h; c++) (b = a.o[c]), null != b.name && (a.gc[b.name] = b);
        if (null == a.Kc) for (a.Kc = {}, c = 1; c <= a.n; c++) (b = a.g[c]), null != b.name && (a.Kc[b.name] = b);
    }),
    xb = (window['__GLP'].glp_find_row = function (a, b) {
        var c = 0;
        null == a.gc && x("glp_find_row: row name index does not exist");
        var d = a.gc[b];
        d && (c = d.ia);
        return c;
    }),
    yb = (window['__GLP'].glp_find_col = function (a, b) {
        var c = 0;
        null == a.Kc && x("glp_find_col: column name index does not exist");
        var d = a.Kc[b];
        d && (c = d.H);
        return c;
    }),
    zb = (window['__GLP'].glp_delete_index = function (a) {
        a.gc = null;
        a.gc = null;
    }),
    Ab = (window['__GLP'].glp_set_rii = function (a, b, c) {
        (1 <= b && b <= a.h) || x("glp_set_rii: i = " + b + "; row number out of range");
        0 >= c && x("glp_set_rii: i = " + b + "; rii = " + c + "; invalid scale factor");
        if (a.valid && a.o[b].qa != c)
            for (var d = a.o[b].l; null != d; d = d.G)
                if (d.g.stat == A) {
                    a.valid = 0;
                    break;
                }
        a.o[b].qa = c;
    }),
    Bb = (window['__GLP'].glp_set_sjj = function (a, b, c) {
        (1 <= b && b <= a.n) || x("glp_set_sjj: j = " + b + "; column number out of range");
        0 >= c && x("glp_set_sjj: j = " + b + "; sjj = " + c + "; invalid scale factor");
        a.valid && a.g[b].za != c && a.g[b].stat == A && (a.valid = 0);
        a.g[b].za = c;
    }),
    Cb = (window['__GLP'].glp_get_rii = function (a, b) {
        (1 <= b && b <= a.h) || x("glp_get_rii: i = " + b + "; row number out of range");
        return a.o[b].qa;
    }),
    Db = (window['__GLP'].glp_get_sjj = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_sjj: j = " + b + "; column number out of range");
        return a.g[b].za;
    }),
    Eb = (window['__GLP'].glp_unscale_prob = function (a) {
        var b = kb(a),
            c = lb(a),
            d;
        for (d = 1; d <= b; d++) Ab(a, d, 1);
        for (b = 1; b <= c; b++) Bb(a, b, 1);
    }),
    Fb = (window['__GLP'].glp_set_row_stat = function (a, b, c) {
        (1 <= b && b <= a.h) || x("glp_set_row_stat: i = " + b + "; row number out of range");
        c != A &&
            c != M &&
            c != P &&
            c != Ra &&
            c != Na &&
            x("glp_set_row_stat: i = " + b + "; stat = " + c + "; invalid status");
        b = a.o[b];
        if (c != A)
            switch (b.type) {
                case Ka:
                    c = Ra;
                    break;
                case Sa:
                    c = M;
                    break;
                case Ta:
                    c = P;
                    break;
                case Q:
                    c != P && (c = M);
                    break;
                case C:
                    c = Na;
            }
        if ((b.stat == A && c != A) || (b.stat != A && c == A)) a.valid = 0;
        b.stat = c;
    }),
    Gb = (window['__GLP'].glp_set_col_stat = function (a, b, c) {
        (1 <= b && b <= a.n) || x("glp_set_col_stat: j = " + b + "; column number out of range");
        c != A &&
            c != M &&
            c != P &&
            c != Ra &&
            c != Na &&
            x("glp_set_col_stat: j = " + b + "; stat = " + c + "; invalid status");
        b = a.g[b];
        if (c != A)
            switch (b.type) {
                case Ka:
                    c = Ra;
                    break;
                case Sa:
                    c = M;
                    break;
                case Ta:
                    c = P;
                    break;
                case Q:
                    c != P && (c = M);
                    break;
                case C:
                    c = Na;
            }
        if ((b.stat == A && c != A) || (b.stat != A && c == A)) a.valid = 0;
        b.stat = c;
    }),
    Hb = (window['__GLP'].glp_std_basis = function (a) {
        var b;
        for (b = 1; b <= a.h; b++) Fb(a, b, A);
        for (b = 1; b <= a.n; b++) {
            var c = a.g[b];
            c.type == Q && Math.abs(c.c) > Math.abs(c.f) ? Gb(a, b, P) : Gb(a, b, M);
        }
    }),
    sc = (window['__GLP'].glp_simplex = function (a, b) {
        function c(a, b) {
            var c;
            if (
                !Ib(a) &&
                ((c = Jb(a)),
                    0 != c &&
                    (c == Kb
                        ? b.s >= Mb && y("glp_simplex: initial basis is invalid")
                        : c == Nb
                            ? b.s >= Mb && y("glp_simplex: initial basis is singular")
                            : c == Ob && b.s >= Mb && y("glp_simplex: initial basis is ill-conditioned")),
                    0 != c)
            )
                return c;
            b.hb == Pb
                ? (c = Qb(a, b))
                : b.hb == Rb
                    ? ((c = Sb(a, b)), c == Tb && a.valid && (c = Qb(a, b)))
                    : b.hb == Ub && (c = Sb(a, b));
            return c;
        }
        function d(a, b) {
            function d() {
                Vb(e, f);
                f = null;
                Wb(e, a);
                return (r = 0);
            }
            var e,
                f = null,
                g = {},
                r;
            b.s >= Xb && y("Preprocessing...");
            e = Yb();
            Zb(e, a, $b);
            r = ac(e, 0);
            0 != r &&
                (r == bc
                    ? b.s >= Xb && y("PROBLEM HAS NO PRIMAL FEASIBLE SOLUTION")
                    : r == cc && b.s >= Xb && y("PROBLEM HAS NO DUAL FEASIBLE SOLUTION"));
            if (0 != r) return r;
            f = Ba();
            dc(e, f);
            if (0 == f.h && 0 == f.n)
                return (
                    (f.ra = f.wa = ec),
                    (f.ea = f.la),
                    b.s >= fc && 0 == b.cb && y(a.da + ": obj = " + f.ea + "  infeas = 0.0"),
                    b.s >= Xb && y("OPTIMAL SOLUTION FOUND BY LP PREPROCESSOR"),
                    d()
                );
            b.s >= Xb &&
                y(
                    f.h +
                    " row" +
                    (1 == f.h ? "" : "s") +
                    ", " +
                    f.n +
                    " column" +
                    (1 == f.n ? "" : "s") +
                    ", " +
                    f.O +
                    " non-zero" +
                    (1 == f.O ? "" : "s") +
                    ""
                );
            eb(a, g);
            fb(f, g);
            var g = pa,
                p = g.Hb;
            g.Hb = !p || b.s < Xb ? cb : bb;
            gc(f, hc);
            g.Hb = p;
            g = pa;
            p = g.Hb;
            g.Hb = !p || b.s < Xb ? cb : bb;
            ic(f);
            g.Hb = p;
            f.da = a.da;
            r = c(f, b);
            a.da = f.da;
            return 0 != r || f.ra != ec || f.wa != ec
                ? (b.s >= Mb && y("glp_simplex: unable to recover undefined or non-optimal solution"),
                    0 == r && (f.ra == jc ? (r = bc) : f.wa == jc && (r = cc)),
                    r)
                : d();
        }
        function e(a, b) {
            function c() {
                f.stat = M;
                f.w = f.c;
            }
            function d() {
                f.stat = P;
                f.w = f.f;
            }
            var e, f, g, p, u;
            a.valid = 0;
            a.ra = a.wa = ec;
            a.ea = a.la;
            p = u = a.some = 0;
            for (g = 1; g <= a.h; g++) {
                e = a.o[g];
                e.stat = A;
                e.w = e.M = 0;
                if (e.type == Sa || e.type == Q || e.type == C)
                    e.c > +b.Ib && ((a.ra = jc), 0 == a.some && b.hb != Pb && (a.some = g)), p < +e.c && (p = +e.c);
                if (e.type == Ta || e.type == Q || e.type == C)
                    e.f < -b.Ib && ((a.ra = jc), 0 == a.some && b.hb != Pb && (a.some = g)), p < -e.f && (p = -e.f);
            }
            for (e = g = 1; e <= a.n; e++) (f = a.g[e]), g < Math.abs(f.B) && (g = Math.abs(f.B));
            g = (a.dir == za ? 1 : -1) / g;
            for (e = 1; e <= a.n; e++) {
                f = a.g[e];
                f.type == Ka
                    ? ((f.stat = Ra), (f.w = 0))
                    : f.type == Sa
                        ? c()
                        : f.type == Ta
                            ? d()
                            : f.type == Q
                                ? 0 < g * f.B
                                    ? c()
                                    : 0 > g * f.B
                                        ? d()
                                        : Math.abs(f.c) <= Math.abs(f.f)
                                            ? c()
                                            : d()
                                : f.type == C && ((f.stat = Na), (f.w = f.c));
                f.M = f.B;
                a.ea += f.B * f.w;
                if (f.type == Ka || f.type == Sa)
                    g * f.M < -b.vb && ((a.wa = jc), 0 == a.some && b.hb == Pb && (a.some = a.h + e)),
                        u < -g * f.M && (u = -g * f.M);
                if (f.type == Ka || f.type == Ta)
                    g * f.M > +b.vb && ((a.wa = jc), 0 == a.some && b.hb == Pb && (a.some = a.h + e)),
                        u < +g * f.M && (u = +g * f.M);
            }
            b.s >= fc && 0 == b.cb && y("~" + a.da + ": obj = " + a.ea + "  infeas = " + (b.hb == Pb ? p : u) + "");
            b.s >= Xb &&
                0 == b.cb &&
                (a.ra == ec && a.wa == ec
                    ? y("OPTIMAL SOLUTION FOUND")
                    : a.ra == jc
                        ? y("PROBLEM HAS NO FEASIBLE SOLUTION")
                        : b.hb == Pb
                            ? y("PROBLEM HAS UNBOUNDED SOLUTION")
                            : y("PROBLEM HAS NO DUAL FEASIBLE SOLUTION"));
        }
        var f;
        (null != a && 3621377730 == a.Ad) || x("glp_simplex: P = " + a + "; invalid problem object");
        null != a.$ && 0 != a.$.reason && x("glp_simplex: operation not allowed");
        null == b && (b = new kc());
        b.s != lc &&
            b.s != Mb &&
            b.s != fc &&
            b.s != Xb &&
            b.s != mc &&
            x("glp_simplex: msg_lev = " + b.s + "; invalid parameter");
        b.hb != Pb && b.hb != Rb && b.hb != Ub && x("glp_simplex: meth = " + b.hb + "; invalid parameter");
        b.ed != nc && b.ed != oc && x("glp_simplex: pricing = " + b.ed + "; invalid parameter");
        b.le != pc && b.le != qc && x("glp_simplex: r_test = " + b.le + "; invalid parameter");
        (0 < b.Ib && 1 > b.Ib) || x("glp_simplex: tol_bnd = " + b.Ib + "; invalid parameter");
        (0 < b.vb && 1 > b.vb) || x("glp_simplex: tol_dj = " + b.vb + "; invalid parameter");
        (0 < b.ve && 1 > b.ve) || x("glp_simplex: tol_piv = " + b.ve + "; invalid parameter");
        0 > b.pc && x("glp_simplex: it_lim = " + b.pc + "; invalid parameter");
        0 > b.ub && x("glp_simplex: tm_lim = " + b.ub + "; invalid parameter");
        1 > b.dc && x("glp_simplex: out_frq = " + b.dc + "; invalid parameter");
        0 > b.cb && x("glp_simplex: out_dly = " + b.cb + "; invalid parameter");
        b.yc != bb && b.yc != cb && x("glp_simplex: presolve = " + b.yc + "; invalid parameter");
        a.ra = a.wa = Aa;
        a.ea = 0;
        a.some = 0;
        for (f = 1; f <= a.h; f++) {
            var g = a.o[f];
            if (g.type == Q && g.c >= g.f)
                return (
                    b.s >= Mb &&
                    y("glp_simplex: row " + f + ": lb = " + g.c + ", ub = " + g.f + "; incorrect bounds"),
                    (f = rc)
                );
        }
        for (f = 1; f <= a.n; f++)
            if (((g = a.g[f]), g.type == Q && g.c >= g.f))
                return (
                    b.s >= Mb &&
                    y("glp_simplex: column " + f + ": lb = " + g.c + ", ub = " + g.f + "; incorrect bounds"),
                    (f = rc)
                );
        b.s >= Xb &&
            (y("GLPK Simplex Optimizer, v" + sa() + ""),
                y(
                    a.h +
                    " row" +
                    (1 == a.h ? "" : "s") +
                    ", " +
                    a.n +
                    " column" +
                    (1 == a.n ? "" : "s") +
                    ", " +
                    a.O +
                    " non-zero" +
                    (1 == a.O ? "" : "s") +
                    ""
                ));
        0 == a.O ? (e(a, b), (f = 0)) : (f = b.yc ? d(a, b) : c(a, b));
        return f;
    }),
    kc = (window['__GLP'].SMCP = function (a) {
        a = a || {};
        this.s = a.msg_lev || Xb;
        this.hb = a.meth || Pb;
        this.ed = a.pricing || oc;
        this.le = a.r_test || qc;
        this.Ib = a.tol_bnd || 1e-7;
        this.vb = a.tol_dj || 1e-7;
        this.ve = a.tol_piv || 1e-10;
        this.ef = a.obj_ll || -t;
        this.ff = a.obj_ul || +t;
        this.pc = a.it_lim || 2147483647;
        this.ub = a.tm_lim || 2147483647;
        this.dc = a.out_frq || 500;
        this.cb = a.out_dly || 0;
        this.yc = a.presolve || cb;
    }),
    xc = (window['__GLP'].glp_get_status = function (a) {
        var b;
        b = tc(a);
        switch (b) {
            case ec:
                switch (uc(a)) {
                    case ec:
                        b = vc;
                        break;
                    case jc:
                        b = wc;
                }
        }
        return b;
    }),
    tc = (window['__GLP'].glp_get_prim_stat = function (a) {
        return a.ra;
    }),
    uc = (window['__GLP'].glp_get_dual_stat = function (a) {
        return a.wa;
    }),
    yc = (window['__GLP'].glp_get_obj_val = function (a) {
        return a.ea;
    }),
    zc = (window['__GLP'].glp_get_row_stat = function (a, b) {
        (1 <= b && b <= a.h) || x("glp_get_row_stat: i = " + b + "; row number out of range");
        return a.o[b].stat;
    }),
    Ac = (window['__GLP'].glp_get_row_prim = function (a, b) {
        (1 <= b && b <= a.h) || x("glp_get_row_prim: i = " + b + "; row number out of range");
        return a.o[b].w;
    }),
    Bc = (window['__GLP'].glp_get_row_dual = function (a, b) {
        (1 <= b && b <= a.h) || x("glp_get_row_dual: i = " + b + "; row number out of range");
        return a.o[b].M;
    }),
    Cc = (window['__GLP'].glp_get_col_stat = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_col_stat: j = " + b + "; column number out of range");
        return a.g[b].stat;
    }),
    Dc = (window['__GLP'].glp_get_col_prim = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_col_prim: j = " + b + "; column number out of range");
        return a.g[b].w;
    }),
    Ec = (window['__GLP'].glp_get_col_dual = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_col_dual: j = " + b + "; column number out of range");
        return a.g[b].M;
    });
window['__GLP'].glp_get_unbnd_ray = function (a) {
    var b = a.some;
    b > a.h + a.n && (b = 0);
    return b;
};
var Hc = (window['__GLP'].glp_set_col_kind = function (a, b, c) {
    (1 <= b && b <= a.n) || x("glp_set_col_kind: j = " + b + "; column number out of range");
    var d = a.g[b];
    switch (c) {
        case Ma:
            d.kind = Ma;
            break;
        case Fc:
            d.kind = Fc;
            break;
        case Gc:
            d.kind = Fc;
            (d.type == Q && 0 == d.c && 1 == d.f) || Va(a, b, Q, 0, 1);
            break;
        default:
            x("glp_set_col_kind: j = " + b + "; kind = " + c + "; invalid column kind");
    }
}),
    Ic = (window['__GLP'].glp_get_col_kind = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_get_col_kind: j = " + b + "; column number out of range");
        var c = a.g[b],
            d = c.kind;
        switch (d) {
            case Fc:
                c.type == Q && 0 == c.c && 1 == c.f && (d = Gc);
        }
        return d;
    }),
    Jc = (window['__GLP'].glp_get_num_int = function (a) {
        for (var b, c = 0, d = 1; d <= a.n; d++) (b = a.g[d]), b.kind == Fc && c++;
        return c;
    }),
    Kc = (window['__GLP'].glp_get_num_bin = function (a) {
        for (var b, c = 0, d = 1; d <= a.n; d++)
            (b = a.g[d]), b.kind == Fc && b.type == Q && 0 == b.c && 1 == b.f && c++;
        return c;
    });
window['__GLP'].glp_intopt = function (a, b) {
    function c(a, b) {
        var c;
        if (xc(a) != vc)
            return b.s >= Mb && y("glp_intopt: optimal basis to initial LP relaxation not provided"), (c = Lc);
        b.s >= Xb && y("Integer optimization begins...");
        var d = a.h;
        c = a.n;
        var e, f;
        a.$ = e = {};
        e.n = c;
        e.wc = d;
        e.cc = new Int8Array(1 + d + c);
        e.ad = new Float64Array(1 + d + c);
        e.bd = new Float64Array(1 + d + c);
        e.jf = new Int8Array(1 + d + c);
        e.hf = new Float64Array(1 + d + c);
        e.gf = new Float64Array(1 + d + c);
        for (f = 1; f <= d; f++) {
            var q = a.o[f];
            e.cc[f] = q.type;
            e.ad[f] = q.c;
            e.bd[f] = q.f;
            e.jf[f] = q.stat;
            e.hf[f] = q.w;
            e.gf[f] = q.M;
        }
        for (f = 1; f <= c; f++)
            (q = a.g[f]),
                (e.cc[d + f] = q.type),
                (e.ad[d + f] = q.c),
                (e.bd[d + f] = q.f),
                (e.jf[d + f] = q.stat),
                (e.hf[d + f] = q.w),
                (e.gf[d + f] = q.M);
        e.dh = a.ea;
        e.Dd = 0;
        e.Rc = 0;
        e.Ca = null;
        e.head = e.$a = null;
        e.Od = e.Vf = e.Fg = 0;
        e.Eg = 0;
        e.qe = null;
        e.oe = e.re = null;
        e.pe = null;
        e.R = null;
        e.F = a;
        e.$c = new Int8Array(1 + c);
        e.Bg = e.Cg = 0;
        e.mf = null;
        e.kf = e.nf = null;
        e.lf = null;
        d = { size: 0 };
        d.head = d.$a = null;
        d.$g = 0;
        d.R = null;
        e.local = d;
        e.Tf = null;
        e.Le = null;
        e.Ed = null;
        e.xg = new Int32Array(1 + c);
        e.Og = new Float64Array(1 + c);
        e.u = b;
        e.ic = la();
        e.Hg = 0;
        e.lh = 0;
        e.reason = 0;
        e.ne = 0;
        e.pf = 0;
        e.Sc = 0;
        e.Ff = 0;
        e.sd = 0;
        e.Cd = 0;
        e.stop = 0;
        Mc(e, null);
        c = Nc(e);
        var d = e.F,
            r = d.h;
        f = d.n;
        if (r != e.wc) {
            var p,
                r = r - e.wc;
            p = new Int32Array(1 + r);
            for (q = 1; q <= r; q++) p[q] = e.wc + q;
            ab(d, r, p);
        }
        r = e.wc;
        for (q = 1; q <= r; q++)
            Ua(d, q, e.cc[q], e.ad[q], e.bd[q]), Fb(d, q, e.jf[q]), (d.o[q].w = e.hf[q]), (d.o[q].M = e.gf[q]);
        for (q = 1; q <= f; q++)
            Va(d, q, e.cc[r + q], e.ad[r + q], e.bd[r + q]),
                Gb(d, q, e.jf[r + q]),
                (d.g[q].w = e.hf[r + q]),
                (d.g[q].M = e.gf[r + q]);
        d.ra = d.wa = ec;
        d.ea = e.dh;
        Oc(e.local);
        d.$ = null;
        0 == c
            ? a.Da == ec
                ? (b.s >= Xb && y("INTEGER OPTIMAL SOLUTION FOUND"), (a.Da = vc))
                : (b.s >= Xb && y("PROBLEM HAS NO INTEGER FEASIBLE SOLUTION"), (a.Da = jc))
            : c == Pc
                ? b.s >= Xb && y("RELATIVE MIP GAP TOLERANCE REACHED; SEARCH TERMINATED")
                : c == Qc
                    ? b.s >= Xb && y("TIME LIMIT EXCEEDED; SEARCH TERMINATED")
                    : c == Tb
                        ? b.s >= Mb && y("glp_intopt: cannot solve current LP relaxation")
                        : c == Rc && b.s >= Xb && y("SEARCH TERMINATED BY APPLICATION");
        return c;
    }
    function d(a, b) {
        function d() {
            Vb(f, m);
            m = null;
            Wb(f, a);
            return r;
        }
        var e = pa.Hb,
            f,
            m = null,
            q = {},
            r;
        b.s >= Xb && y("Preprocessing...");
        f = Yb();
        Zb(f, a, Sc);
        pa.Hb = !e || b.s < Xb ? cb : bb;
        r = Tc(f, b);
        pa.Hb = e;
        0 != r &&
            (r == bc
                ? b.s >= Xb && y("PROBLEM HAS NO PRIMAL FEASIBLE SOLUTION")
                : r == cc && b.s >= Xb && y("LP RELAXATION HAS NO DUAL FEASIBLE SOLUTION"));
        if (0 != r) return r;
        m = Ba();
        dc(f, m);
        if (0 == m.h && 0 == m.n)
            return (
                (m.Da = vc),
                (m.xa = m.la),
                b.s >= Xb &&
                (y("Objective value = " + m.xa + ""), y("INTEGER OPTIMAL SOLUTION FOUND BY MIP PREPROCESSOR")),
                d()
            );
        if (b.s >= Xb) {
            var p = Jc(m),
                u = Kc(m);
            y(
                m.h +
                " row" +
                (1 == m.h ? "" : "s") +
                ", " +
                m.n +
                " column" +
                (1 == m.n ? "" : "s") +
                ", " +
                m.O +
                " non-zero" +
                (1 == m.O ? "" : "s") +
                ""
            );
            y(
                p +
                " integer variable" +
                (1 == p ? "" : "s") +
                ", " +
                (0 == u
                    ? "none of"
                    : 1 == p && 1 == u
                        ? ""
                        : 1 == u
                            ? "one of"
                            : u == p
                                ? "all of"
                                : u + " of") +
                " which " +
                (1 == u ? "is" : "are") +
                " binary"
            );
        }
        eb(a, q);
        fb(m, q);
        pa.Hb = !e || b.s < Xb ? cb : bb;
        gc(m, Uc | Vc | Wc | Xc);
        pa.Hb = e;
        pa.Hb = !e || b.s < Xb ? cb : bb;
        ic(m);
        pa.Hb = e;
        b.s >= Xb && y("Solving LP relaxation...");
        e = new kc();
        e.s = b.s;
        m.da = a.da;
        r = sc(m, e);
        a.da = m.da;
        if (0 != r) return b.s >= Mb && y("glp_intopt: cannot solve LP relaxation"), (r = Tb);
        r = xc(m);
        r == vc ? (r = 0) : r == jc ? (r = bc) : r == wc && (r = cc);
        if (0 != r) return r;
        m.da = a.da;
        r = c(m, b);
        a.da = m.da;
        return m.Da != vc && m.Da != ec ? ((a.Da = m.Da), r) : d();
    }
    var e, f;
    (null != a && 3621377730 == a.Ad) || x("glp_intopt: P = " + a + "; invalid problem object");
    null != a.$ && x("glp_intopt: operation not allowed");
    null == b && (b = new Yc());
    b.s != lc &&
        b.s != Mb &&
        b.s != fc &&
        b.s != Xb &&
        b.s != mc &&
        x("glp_intopt: msg_lev = " + b.s + "; invalid parameter");
    b.Lb != Zc &&
        b.Lb != $c &&
        b.Lb != ad &&
        b.Lb != bd &&
        b.Lb != cd &&
        x("glp_intopt: br_tech = " + b.Lb + "; invalid parameter");
    b.lc != dd &&
        b.lc != ed &&
        b.lc != fd &&
        b.lc != gd &&
        x("glp_intopt: bt_tech = " + b.lc + "; invalid parameter");
    (0 < b.Xb && 1 > b.Xb) || x("glp_intopt: tol_int = " + b.Xb + "; invalid parameter");
    (0 < b.ue && 1 > b.ue) || x("glp_intopt: tol_obj = " + b.ue + "; invalid parameter");
    0 > b.ub && x("glp_intopt: tm_lim = " + b.ub + "; invalid parameter");
    0 > b.dc && x("glp_intopt: out_frq = " + b.dc + "; invalid parameter");
    0 > b.cb && x("glp_intopt: out_dly = " + b.cb + "; invalid parameter");
    (0 <= b.Ke && 256 >= b.Ke) || x("glp_intopt: cb_size = " + b.Ke + "; invalid parameter");
    b.dd != hd && b.dd != id && b.dd != jd && x("glp_intopt: pp_tech = " + b.dd + "; invalid parameter");
    0 > b.ae && x("glp_intopt: mip_gap = " + b.ae + "; invalid parameter");
    b.Bd != bb && b.Bd != cb && x("glp_intopt: mir_cuts = " + b.Bd + "; invalid parameter");
    b.yd != bb && b.yd != cb && x("glp_intopt: gmi_cuts = " + b.yd + "; invalid parameter");
    b.vd != bb && b.vd != cb && x("glp_intopt: cov_cuts = " + b.vd + "; invalid parameter");
    b.td != bb && b.td != cb && x("glp_intopt: clq_cuts = " + b.td + "; invalid parameter");
    b.yc != bb && b.yc != cb && x("glp_intopt: presolve = " + b.yc + "; invalid parameter");
    b.qd != bb && b.qd != cb && x("glp_intopt: binarize = " + b.qd + "; invalid parameter");
    b.Ve != bb && b.Ve != cb && x("glp_intopt: fp_heur = " + b.Ve + "; invalid parameter");
    a.Da = Aa;
    a.xa = 0;
    for (e = 1; e <= a.h; e++)
        if (((f = a.o[e]), f.type == Q && f.c >= f.f))
            return (
                b.s >= Mb && y("glp_intopt: row " + e + ": lb = " + f.c + ", ub = " + f.f + "; incorrect bounds"),
                (e = rc)
            );
    for (e = 1; e <= a.n; e++)
        if (((f = a.g[e]), f.type == Q && f.c >= f.f))
            return (
                b.s >= Mb &&
                y("glp_intopt: column " + e + ": lb = " + f.c + ", ub = " + f.f + "; incorrect bounds"),
                (e = rc)
            );
    for (e = 1; e <= a.n; e++)
        if (((f = a.g[e]), f.kind == Fc)) {
            if ((f.type == Sa || f.type == Q) && f.c != Math.floor(f.c))
                return (
                    b.s >= Mb && y("glp_intopt: integer column " + e + " has non-integer lower bound " + f.c + ""),
                    (e = rc)
                );
            if ((f.type == Ta || f.type == Q) && f.f != Math.floor(f.f))
                return (
                    b.s >= Mb && y("glp_intopt: integer column " + e + " has non-integer upper bound " + f.f + ""),
                    (e = rc)
                );
            if (f.type == C && f.c != Math.floor(f.c))
                return (
                    b.s >= Mb && y("glp_intopt: integer column " + e + " has non-integer fixed value " + f.c + ""),
                    (e = rc)
                );
        }
    b.s >= Xb &&
        ((e = Jc(a)),
            (f = Kc(a)),
            y("GLPK Integer Optimizer, v" + sa() + ""),
            y(
                a.h +
                " row" +
                (1 == a.h ? "" : "s") +
                ", " +
                a.n +
                " column" +
                (1 == a.n ? "" : "s") +
                ", " +
                a.O +
                " non-zero" +
                (1 == a.O ? "" : "s") +
                ""
            ),
            y(
                e +
                " integer variable" +
                (1 == e ? "" : "s") +
                ", " +
                (0 == f ? "none of" : 1 == e && 1 == f ? "" : 1 == f ? "one of" : f == e ? "all of" : f + " of") +
                " which " +
                (1 == f ? "is" : "are") +
                " binary"
            ));
    return (e = b.yc ? d(a, b) : c(a, b));
};
var Yc = (window['__GLP'].IOCP = function (a) {
    a = a || {};
    this.s = a.msg_lev || Xb;
    this.Lb = a.br_tech || bd;
    this.lc = a.bt_tech || fd;
    this.Xb = a.tol_int || 1e-5;
    this.ue = a.tol_obj || 1e-7;
    this.ub = a.tm_lim || 2147483647;
    this.dc = a.out_frq || 5e3;
    this.cb = a.out_dly || 1e4;
    this.rb = a.cb_func || null;
    this.Tc = a.cb_info || null;
    this.Ke = a.cb_size || 0;
    this.dd = a.pp_tech || jd;
    this.ae = a.mip_gap || 0;
    this.Bd = a.mir_cuts || cb;
    this.yd = a.gmi_cuts || cb;
    this.vd = a.cov_cuts || cb;
    this.td = a.clq_cuts || cb;
    this.yc = a.presolve || cb;
    this.qd = a.binarize || cb;
    this.Ve = a.fp_heur || cb;
});
window['__GLP'].glp_mip_status = function (a) {
    return a.Da;
};
window['__GLP'].glp_mip_obj_val = function (a) {
    return a.xa;
};
var kd = (window['__GLP'].glp_mip_row_val = function (a, b) {
    (1 <= b && b <= a.h) || x("glp_mip_row_val: i = " + b + "; row number out of range");
    return a.o[b].Va;
}),
    ld = (window['__GLP'].glp_mip_col_val = function (a, b) {
        (1 <= b && b <= a.n) || x("glp_mip_col_val: j = " + b + "; column number out of range");
        return a.g[b].Va;
    }),
    Ib = (window['__GLP'].glp_bf_exists = function (a) {
        return 0 == a.h || a.valid;
    }),
    Jb = (window['__GLP'].glp_factorize = function (a) {
        function b(a, b, c, d) {
            var e = a.h,
                f;
            f = a.head[b];
            if (f <= e) (b = 1), (c[1] = f), (d[1] = 1);
            else
                for (b = 0, a = a.g[f - e].l; null != a; a = a.L)
                    b++, (c[b] = a.o.ia), (d[b] = -a.o.qa * a.j * a.g.za);
            return b;
        }
        var c = a.h,
            d = a.n,
            e = a.o,
            f = a.g,
            g = a.head,
            k,
            h,
            l;
        k = a.valid = 0;
        for (h = 1; h <= c + d; h++)
            if (
                (h <= c ? ((l = e[h].stat), (e[h].bind = 0)) : ((l = f[h - c].stat), (f[h - c].bind = 0)), l == A)
            ) {
                k++;
                if (k > c) return (a = Kb);
                g[k] = h;
                h <= c ? (e[h].bind = k) : (f[h - c].bind = k);
            }
        if (k < c) return (a = Kb);
        if (0 < c) {
            null == a.Y &&
                ((a.Y = {
                    valid: 0,
                    type: md,
                    jb: null,
                    bb: null,
                    zd: 0,
                    ec: 0.1,
                    xc: 4,
                    hc: 1,
                    Ob: 1e-15,
                    sc: 1e10,
                    Zc: 100,
                    jc: 1e-6,
                    vc: 100,
                    jd: 1e3,
                    xh: -1,
                    dg: 0,
                }),
                    nd(a));
            switch (od(a.Y, c, b, a)) {
                case pd:
                    return (a = Nb);
                case qd:
                    return (a = Ob);
            }
            a.valid = 1;
        }
        return 0;
    });
window['__GLP'].glp_bf_updated = function (a) {
    0 == a.h || a.valid || x("glp_bf_update: basis factorization does not exist");
    return 0 == a.h ? 0 : a.Y.dg;
};
var eb = (window['__GLP'].glp_get_bfcp = function (a, b) {
    var c = a.Pd;
    null == c
        ? ((b.type = md),
            (b.zd = 0),
            (b.ec = 0.1),
            (b.xc = 4),
            (b.hc = bb),
            (b.Ob = 1e-15),
            (b.sc = 1e10),
            (b.Zc = 100),
            (b.jc = 1e-6),
            (b.vc = 100),
            (b.jd = 0))
        : ga(b, c);
});
function nd(a) {
    var b = {};
    eb(a, b);
    a = a.Y;
    a.type = b.type;
    a.zd = b.zd;
    a.ec = b.ec;
    a.xc = b.xc;
    a.hc = b.hc;
    a.Ob = b.Ob;
    a.sc = b.sc;
    a.Zc = b.Zc;
    a.jc = b.jc;
    a.vc = b.vc;
    a.jd = b.jd;
}
var fb = (window['__GLP'].glp_set_bfcp = function (a, b) {
    var c = a.Pd;
    null == b
        ? null != c && (a.Pd = null)
        : (null == c && (c = a.Pd = {}),
            ga(c, b),
            c.type != md &&
            c.type != rd &&
            c.type != sd &&
            x("glp_set_bfcp: type = " + c.type + "; invalid parameter"),
            0 > c.zd && x("glp_set_bfcp: lu_size = " + c.zd + "; invalid parameter"),
            (0 < c.ec && 1 > c.ec) || x("glp_set_bfcp: piv_tol = " + c.ec + "; invalid parameter"),
            1 > c.xc && x("glp_set_bfcp: piv_lim = " + c.xc + "; invalid parameter"),
            c.hc != bb && c.hc != cb && x("glp_set_bfcp: suhl = " + c.hc + "; invalid parameter"),
            (0 <= c.Ob && 1e-6 >= c.Ob) || x("glp_set_bfcp: eps_tol = " + c.Ob + "; invalid parameter"),
            1 > c.sc && x("glp_set_bfcp: max_gro = " + c.sc + "; invalid parameter"),
            (1 <= c.Zc && 32767 >= c.Zc) || x("glp_set_bfcp: nfs_max = " + c.Zc + "; invalid parameter"),
            (0 < c.jc && 1 > c.jc) || x("glp_set_bfcp: upd_tol = " + c.jc + "; invalid parameter"),
            (1 <= c.vc && 32767 >= c.vc) || x("glp_set_bfcp: nrs_max = " + c.vc + "; invalid parameter"),
            0 > c.jd && x("glp_set_bfcp: rs_size = " + c.vc + "; invalid parameter"),
            0 == c.jd && (c.jd = 20 * c.vc));
    null != a.Y && nd(a);
}),
    td = (window['__GLP'].glp_get_bhead = function (a, b) {
        0 == a.h || a.valid || x("glp_get_bhead: basis factorization does not exist");
        (1 <= b && b <= a.h) || x("glp_get_bhead: k = " + b + "; index out of range");
        return a.head[b];
    }),
    ud = (window['__GLP'].glp_get_row_bind = function (a, b) {
        0 == a.h || a.valid || x("glp_get_row_bind: basis factorization does not exist");
        (1 <= b && b <= a.h) || x("glp_get_row_bind: i = " + b + "; row number out of range");
        return a.o[b].bind;
    }),
    vd = (window['__GLP'].glp_get_col_bind = function (a, b) {
        0 == a.h || a.valid || x("glp_get_col_bind: basis factorization does not exist");
        (1 <= b && b <= a.n) || x("glp_get_col_bind: j = " + b + "; column number out of range");
        return a.g[b].bind;
    }),
    xd = (window['__GLP'].glp_ftran = function (a, b) {
        var c = a.h,
            d = a.o,
            e = a.g,
            f,
            g;
        0 == c || a.valid || x("glp_ftran: basis factorization does not exist");
        for (f = 1; f <= c; f++) b[f] *= d[f].qa;
        0 < c && wd(a.Y, b);
        for (f = 1; f <= c; f++) (g = a.head[f]), (b[f] = g <= c ? b[f] / d[g].qa : b[f] * e[g - c].za);
    }),
    zd = (window['__GLP'].glp_btran = function (a, b) {
        var c = a.h,
            d = a.o,
            e = a.g,
            f,
            g;
        0 == c || a.valid || x("glp_btran: basis factorization does not exist");
        for (f = 1; f <= c; f++) (g = a.head[f]), (b[f] = g <= c ? b[f] / d[g].qa : b[f] * e[g - c].za);
        0 < c && yd(a.Y, b);
        for (f = 1; f <= c; f++) b[f] *= d[f].qa;
    });
window['__GLP'].glp_warm_up = function (a) {
    var b, c, d, e, f;
    a.ra = a.wa = Aa;
    a.ea = 0;
    a.some = 0;
    for (d = 1; d <= a.h; d++) (b = a.o[d]), (b.w = b.M = 0);
    for (d = 1; d <= a.n; d++) (b = a.g[d]), (b.w = b.M = 0);
    if (!Ib(a) && ((e = Jb(a)), 0 != e)) return e;
    e = new Float64Array(1 + a.h);
    for (d = 1; d <= a.h; d++)
        (b = a.o[d]),
            b.stat != A &&
            (b.stat == M
                ? (b.w = b.c)
                : b.stat == P
                    ? (b.w = b.f)
                    : b.stat == Ra
                        ? (b.w = 0)
                        : b.stat == Na && (b.w = b.c),
                (e[d] -= b.w));
    for (d = 1; d <= a.n; d++)
        if (
            ((b = a.g[d]),
                b.stat != A &&
                (b.stat == M
                    ? (b.w = b.c)
                    : b.stat == P
                        ? (b.w = b.f)
                        : b.stat == Ra
                            ? (b.w = 0)
                            : b.stat == Na && (b.w = b.c),
                    0 != b.w))
        )
            for (c = b.l; null != c; c = c.L) e[c.o.ia] += c.j * b.w;
    xd(a, e);
    a.ra = ec;
    for (d = 1; d <= a.h; d++)
        if (((b = a.o[d]), b.stat == A)) {
            b.w = e[b.bind];
            c = b.type;
            if (c == Sa || c == Q || c == C) (f = 1e-6 + 1e-9 * Math.abs(b.c)), b.w < b.c - f && (a.ra = Ad);
            if (c == Ta || c == Q || c == C) (f = 1e-6 + 1e-9 * Math.abs(b.f)), b.w > b.f + f && (a.ra = Ad);
        }
    for (d = 1; d <= a.n; d++)
        if (((b = a.g[d]), b.stat == A)) {
            b.w = e[b.bind];
            c = b.type;
            if (c == Sa || c == Q || c == C) (f = 1e-6 + 1e-9 * Math.abs(b.c)), b.w < b.c - f && (a.ra = Ad);
            if (c == Ta || c == Q || c == C) (f = 1e-6 + 1e-9 * Math.abs(b.f)), b.w > b.f + f && (a.ra = Ad);
        }
    a.ea = a.la;
    for (d = 1; d <= a.n; d++) (b = a.g[d]), (a.ea += b.B * b.w);
    for (d = 1; d <= a.h; d++) e[d] = 0;
    for (d = 1; d <= a.n; d++) (b = a.g[d]), b.stat == A && (e[b.bind] = b.B);
    zd(a, e);
    a.wa = ec;
    for (d = 1; d <= a.h; d++)
        if (((b = a.o[d]), b.stat == A)) b.M = 0;
        else if (
            ((b.M = -e[d]),
                (c = b.stat),
                (b = a.dir == za ? +b.M : -b.M),
                ((c == Ra || c == M) && -1e-5 > b) || ((c == Ra || c == P) && 1e-5 < b))
        )
            a.wa = Ad;
    for (d = 1; d <= a.n; d++)
        if (((b = a.g[d]), b.stat == A)) b.M = 0;
        else {
            b.M = b.B;
            for (c = b.l; null != c; c = c.L) b.M += c.j * e[c.o.ia];
            c = b.stat;
            b = a.dir == za ? +b.M : -b.M;
            if (((c == Ra || c == M) && -1e-5 > b) || ((c == Ra || c == P) && 1e-5 < b)) a.wa = Ad;
        }
    return 0;
};
var Bd = (window['__GLP'].glp_eval_tab_row = function (a, b, c, d) {
    var e = a.h,
        f = a.n,
        g,
        k,
        h,
        l,
        n,
        m,
        q;
    0 == e || a.valid || x("glp_eval_tab_row: basis factorization does not exist");
    (1 <= b && b <= e + f) || x("glp_eval_tab_row: k = " + b + "; variable number out of range");
    g = b <= e ? ud(a, b) : vd(a, b - e);
    0 == g && x("glp_eval_tab_row: k = " + b + "; variable must be basic");
    m = new Float64Array(1 + e);
    l = new Int32Array(1 + e);
    q = new Float64Array(1 + e);
    m[g] = 1;
    zd(a, m);
    k = 0;
    for (b = 1; b <= e + f; b++) {
        if (b <= e) {
            if (zc(a, b) == A) continue;
            n = -m[b];
        } else {
            if (Cc(a, b - e) == A) continue;
            h = gb(a, b - e, l, q);
            n = 0;
            for (g = 1; g <= h; g++) n += m[l[g]] * q[g];
        }
        0 != n && (k++, (c[k] = b), (d[k] = n));
    }
    return k;
}),
    Cd = (window['__GLP'].glp_eval_tab_col = function (a, b, c, d) {
        var e = a.h,
            f = a.n,
            g;
        0 == e || a.valid || x("glp_eval_tab_col: basis factorization does not exist");
        (1 <= b && b <= e + f) || x("glp_eval_tab_col: k = " + b + "; variable number out of range");
        (b <= e ? zc(a, b) : Cc(a, b - e)) == A && x("glp_eval_tab_col: k = " + b + "; variable must be non-basic");
        f = new Float64Array(1 + e);
        if (b <= e) f[b] = -1;
        else for (g = gb(a, b - e, c, d), b = 1; b <= g; b++) f[c[b]] = d[b];
        xd(a, f);
        g = 0;
        for (b = 1; b <= e; b++) 0 != f[b] && (g++, (c[g] = td(a, b)), (d[g] = f[b]));
        return g;
    }),
    Dd = (window['__GLP'].glp_transform_row = function (a, b, c, d) {
        var e, f, g, k, h, l, n, m, q, r;
        Ib(a) || x("glp_transform_row: basis factorization does not exist ");
        f = kb(a);
        g = lb(a);
        m = new Float64Array(1 + g);
        (0 <= b && b <= g) || x("glp_transform_row: len = " + b + "; invalid row length");
        for (k = 1; k <= b; k++)
            (e = c[k]),
                (1 <= e && e <= g) || x("glp_transform_row: ind[" + k + "] = " + e + "; column index out of range"),
                0 == d[k] && x("glp_transform_row: val[" + k + "] = 0; zero coefficient not allowed"),
                0 != m[e] &&
                x("glp_transform_row: ind[" + k + "] = " + e + "; duplicate column indices not allowed"),
                (m[e] = d[k]);
        q = new Float64Array(1 + f);
        for (e = 1; e <= f; e++) (b = td(a, e)), (q[e] = b <= f ? 0 : m[b - f]);
        zd(a, q);
        b = 0;
        for (e = 1; e <= f; e++) zc(a, e) != A && ((n = -q[e]), 0 != n && (b++, (c[b] = e), (d[b] = n)));
        l = new Int32Array(1 + f);
        r = new Float64Array(1 + f);
        for (e = 1; e <= g; e++)
            if (Cc(a, e) != A) {
                n = m[e];
                h = gb(a, e, l, r);
                for (k = 1; k <= h; k++) n += r[k] * q[l[k]];
                0 != n && (b++, (c[b] = f + e), (d[b] = n));
            }
        return b;
    });
window['__GLP'].glp_transform_col = function (a, b, c, d) {
    var e, f, g, k;
    Ib(a) || x("glp_transform_col: basis factorization does not exist ");
    f = kb(a);
    k = new Float64Array(1 + f);
    (0 <= b && b <= f) || x("glp_transform_col: len = " + b + "; invalid column length");
    for (g = 1; g <= b; g++)
        (e = c[g]),
            (1 <= e && e <= f) || x("glp_transform_col: ind[" + g + "] = " + e + "; row index out of range"),
            0 == d[g] && x("glp_transform_col: val[" + g + "] = 0; zero coefficient not allowed"),
            0 != k[e] && x("glp_transform_col: ind[" + g + "] = " + e + "; duplicate row indices not allowed"),
            (k[e] = d[g]);
    xd(a, k);
    b = 0;
    for (e = 1; e <= f; e++) 0 != k[e] && (b++, (c[b] = td(a, e)), (d[b] = k[e]));
    return b;
};
var Ed = (window['__GLP'].glp_prim_rtest = function (a, b, c, d, e, f) {
    var g, k, h, l, n, m, q, r, p, u, v, H, E;
    tc(a) != ec && x("glp_prim_rtest: basic solution is not primal feasible ");
    1 != e && -1 != e && x("glp_prim_rtest: dir = " + e + "; invalid parameter");
    (0 < f && 1 > f) || x("glp_prim_rtest: eps = " + f + "; invalid parameter");
    k = kb(a);
    h = lb(a);
    l = 0;
    E = t;
    r = 0;
    for (n = 1; n <= b; n++)
        if (
            ((g = c[n]),
                (1 <= g && g <= k + h) ||
                x("glp_prim_rtest: ind[" + n + "] = " + g + "; variable number out of range"),
                g <= k
                    ? ((m = pb(a, g)), (u = qb(a, g)), (v = rb(a, g)), (q = zc(a, g)), (p = Ac(a, g)))
                    : ((m = sb(a, g - k)),
                        (u = tb(a, g - k)),
                        (v = ub(a, g - k)),
                        (q = Cc(a, g - k)),
                        (p = Dc(a, g - k))),
                q != A && x("glp_prim_rtest: ind[" + n + "] = " + g + "; non-basic variable not allowed"),
                (g = 0 < e ? +d[n] : -d[n]),
                m != Ka)
        ) {
            if (m == Sa) {
                if (g > -f) continue;
                H = (u - p) / g;
            } else if (m == Ta) {
                if (g < +f) continue;
                H = (v - p) / g;
            } else if (m == Q)
                if (0 > g) {
                    if (g > -f) continue;
                    H = (u - p) / g;
                } else {
                    if (g < +f) continue;
                    H = (v - p) / g;
                }
            else if (m == C) {
                if (-f < g && g < +f) continue;
                H = 0;
            }
            0 > H && (H = 0);
            if (E > H || (E == H && r < Math.abs(g))) (l = n), (E = H), (r = Math.abs(g));
        }
    return l;
}),
    Fd = (window['__GLP'].glp_dual_rtest = function (a, b, c, d, e, f) {
        var g, k, h, l, n, m, q, r, p, u, v;
        uc(a) != ec && x("glp_dual_rtest: basic solution is not dual feasible");
        1 != e && -1 != e && x("glp_dual_rtest: dir = " + e + "; invalid parameter");
        (0 < f && 1 > f) || x("glp_dual_rtest: eps = " + f + "; invalid parameter");
        k = kb(a);
        h = lb(a);
        p = jb(a) == za ? 1 : -1;
        l = 0;
        v = t;
        q = 0;
        for (n = 1; n <= b; n++) {
            g = c[n];
            (1 <= g && g <= k + h) || x("glp_dual_rtest: ind[" + n + "] = " + g + "; variable number out of range");
            g <= k ? ((m = zc(a, g)), (r = Bc(a, g))) : ((m = Cc(a, g - k)), (r = Ec(a, g - k)));
            m == A && x("glp_dual_rtest: ind[" + n + "] = " + g + "; basic variable not allowed");
            g = 0 < e ? +d[n] : -d[n];
            if (m == M) {
                if (g < +f) continue;
                u = (p * r) / g;
            } else if (m == P) {
                if (g > -f) continue;
                u = (p * r) / g;
            } else if (m == Ra) {
                if (-f < g && g < +f) continue;
                u = 0;
            } else if (m == Na) continue;
            0 > u && (u = 0);
            if (v > u || (v == u && q < Math.abs(g))) (l = n), (v = u), (q = Math.abs(g));
        }
        return l;
    });
function Gd(a, b, c, d, e, f, g) {
    var k,
        h,
        l,
        n = 0,
        m,
        q;
    a.ra == Aa && x("glp_analyze_row: primal basic solution components are undefined");
    a.wa != ec && x("glp_analyze_row: basic solution is not dual feasible");
    (0 <= b && b <= a.n) || x("glp_analyze_row: len = " + b + "; invalid row length");
    q = 0;
    for (k = 1; k <= b; k++)
        (h = c[k]),
            (1 <= h && h <= a.h + a.n) ||
            x("glp_analyze_row: ind[" + k + "] = " + h + "; row/column index out of range"),
            h <= a.h
                ? (a.o[h].stat == A &&
                    x("glp_analyze_row: ind[" + k + "] = " + h + "; basic auxiliary variable is not allowed"),
                    (m = a.o[h].w))
                : (a.g[h - a.h].stat == A &&
                    x("glp_analyze_row: ind[" + k + "] = " + h + "; basic structural variable is not allowed"),
                    (m = a.g[h - a.h].w)),
            (q += d[k] * m);
    if (e == Sa) {
        if (q >= f) return 1;
        l = 1;
    } else if (e == Ta) {
        if (q <= f) return 1;
        l = -1;
    } else x("glp_analyze_row: type = " + e + "; invalid parameter");
    e = f - q;
    b = Fd(a, b, c, d, l, 1e-9);
    if (0 == b) return 2;
    h = c[b];
    m = h <= a.h ? a.o[h].w : a.g[h - a.h].w;
    c = e / d[b];
    g(b, m, c, q, e, h <= a.h ? a.o[h].M * c : a.g[h - a.h].M * c);
    return n;
}
window['__GLP'].glp_analyze_bound = function (a, b, c) {
    var d, e, f, g, k, h, l, n, m, q, r, p, u, v;
    r = p = u = v = null;
    (null != a && 3621377730 == a.Ad) || x("glp_analyze_bound: P = " + a + "; invalid problem object");
    e = a.h;
    f = a.n;
    (a.ra == ec && a.wa == ec) || x("glp_analyze_bound: optimal basic solution required");
    0 == e || a.valid || x("glp_analyze_bound: basis factorization required");
    (1 <= b && b <= e + f) || x("glp_analyze_bound: k = " + b + "; variable number out of range");
    d = b <= e ? a.o[b] : a.g[b - e];
    g = d.stat;
    f = d.w;
    g == A && x("glp_analyze_bound: k = " + b + "; basic variable not allowed ");
    g = new Int32Array(1 + e);
    q = new Float64Array(1 + e);
    h = Cd(a, b, g, q);
    for (b = -1; 1 >= b; b += 2)
        (l = Ed(a, h, g, q, b, 1e-9)),
            0 == l
                ? ((k = 0), (l = 0 > b ? -t : +t))
                : ((k = g[l]),
                    k <= e
                        ? ((d = a.o[k]), (n = qb(a, d.ia)), (m = rb(a, d.ia)))
                        : ((d = a.g[k - e]), (n = tb(a, d.H)), (m = ub(a, d.H))),
                    (d = d.w),
                    (d = (0 > b && 0 < q[l]) || (0 < b && 0 > q[l]) ? n - d : m - d),
                    (l = f + d / q[l])),
            0 > b ? ((r = l), (p = k)) : ((u = l), (v = k));
    c(r, p, u, v);
};
window['__GLP'].glp_analyze_coef = function (a, b, c) {
    var d,
        e,
        f,
        g,
        k,
        h,
        l,
        n,
        m,
        q,
        r,
        p,
        u,
        v,
        H,
        E,
        B,
        J,
        R,
        T,
        O = null,
        S = null,
        G = null,
        Z = null,
        Y = null,
        ba = null;
    (null != a && 3621377730 == a.Ad) || x("glp_analyze_coef: P = " + a + "; invalid problem object");
    e = a.h;
    f = a.n;
    (a.ra == ec && a.wa == ec) || x("glp_analyze_coef: optimal basic solution required");
    0 == e || a.valid || x("glp_analyze_coef: basis factorization required");
    (1 <= b && b <= e + f) || x("glp_analyze_coef: k = " + b + "; variable number out of range");
    b <= e
        ? ((d = a.o[b]), (g = d.type), (p = d.c), (u = d.f), (v = 0))
        : ((d = a.g[b - e]), (g = d.type), (p = d.c), (u = d.f), (v = d.B));
    k = d.stat;
    H = d.w;
    k != A && x("glp_analyze_coef: k = " + b + "; non-basic variable not allowed");
    k = new Int32Array(1 + e);
    T = new Float64Array(1 + e);
    r = new Int32Array(1 + f);
    R = new Float64Array(1 + f);
    m = Bd(a, b, r, R);
    for (f = -1; 1 >= f; f += 2)
        a.dir == za ? (l = -f) : a.dir == Ea && (l = +f),
            (q = Fd(a, m, r, R, l, 1e-9)),
            0 == q
                ? ((E = 0 > f ? -t : +t), (h = 0), (q = H))
                : ((h = r[q]),
                    (d = h <= e ? a.o[h] : a.g[h - e]),
                    (l = d.M),
                    (d = -l / R[q]),
                    (E = v + d),
                    (l = (0 > f && 0 < R[q]) || (0 < f && 0 > R[q]) ? 1 : -1),
                    a.dir == Ea && (l = -l),
                    (n = Cd(a, h, k, T)),
                    (d = b <= e ? a.o[b] : a.g[b - e]),
                    (d.type = Ka),
                    (d.c = d.f = 0),
                    (n = Ed(a, n, k, T, l, 1e-9)),
                    (d = b <= e ? a.o[b] : a.g[b - e]),
                    (d.type = g),
                    (d.c = p),
                    (d.f = u),
                    0 == n
                        ? (q = (0 > l && 0 < R[q]) || (0 < l && 0 > R[q]) ? -t : +t)
                        : ((d = k[n]),
                            d <= e
                                ? ((d = a.o[d]), (B = qb(a, d.ia)), (J = rb(a, d.ia)))
                                : ((d = a.g[d - e]), (B = tb(a, d.H)), (J = ub(a, d.H))),
                            (d = d.w),
                            (d = (0 > l && 0 < T[n]) || (0 < l && 0 > T[n]) ? B - d : J - d),
                            (q = H + (R[q] / T[n]) * d))),
            0 > f ? ((O = E), (S = h), (G = q)) : ((Z = E), (Y = h), (ba = q));
    c(O, S, G, Z, Y, ba);
};
window['__GLP'].glp_ios_reason = function (a) {
    return a.reason;
};
window['__GLP'].glp_ios_get_prob = function (a) {
    return a.F;
};
function Hd(a) {
    a.reason != Ia && x("glp_ios_pool_size: operation not allowed");
    return a.local.size;
}
function Id(a, b, c, d, e, f, g) {
    a.reason != Ia && x("glp_ios_add_row: operation not allowed");
    var k = a.local,
        h,
        l;
    h = { name: null };
    (0 <= b && 255 >= b) || x("glp_ios_add_row: klass = " + b + "; invalid cut class");
    h.qc = b;
    h.l = null;
    (0 <= c && c <= a.n) || x("glp_ios_add_row: len = " + c + "; invalid cut length");
    for (l = 1; l <= c; l++)
        (b = {}),
            (1 <= d[l] && d[l] <= a.n) ||
            x("glp_ios_add_row: ind[" + l + "] = " + d[l] + "; column index out of range"),
            (b.H = d[l]),
            (b.j = e[l]),
            (b.next = h.l),
            (h.l = b);
    f != Sa && f != Ta && f != C && x("glp_ios_add_row: type = " + f + "; invalid cut type");
    h.type = f;
    h.Zf = g;
    h.ga = k.$a;
    h.next = null;
    null == h.ga ? (k.head = h) : (h.ga.next = h);
    k.$a = h;
    k.size++;
}
function Jd(a, b) {
    (1 <= b && b <= a.F.n) || x("glp_ios_can_branch: j = " + b + "; column number out of range");
    return a.$c[b];
}
function Kd(a, b) {
    var c = a.F,
        d = a.wc,
        e = a.n,
        f,
        g;
    g = c.la;
    for (f = 1; f <= e; f++) {
        var k = c.g[f];
        if (k.kind == Fc && b[f] != Math.floor(b[f])) return 1;
        g += k.B * b[f];
    }
    if (c.Da == ec)
        switch (c.dir) {
            case za:
                if (g >= a.F.xa) return 1;
                break;
            case Ea:
                if (g <= a.F.xa) return 1;
        }
    a.u.s >= fc && y("Solution found by heuristic: " + g + "");
    c.Da = ec;
    c.xa = g;
    for (f = 1; f <= e; f++) c.g[f].Va = b[f];
    for (e = 1; e <= d; e++) for (f = c.o[e], f.Va = 0, g = f.l; null != g; g = g.G) f.Va += g.j * g.g.Va;
    return 0;
}
window['__GLP'].glp_mpl_alloc_wksp = function () {
    return Ld();
};
window['__GLP']._glp_mpl_init_rand = function (a, b) {
    0 != a.I && x("glp_mpl_init_rand: invalid call sequence\n");
    Md(a.Fd, b);
};
var Od = (window['__GLP'].glp_mpl_read_model = function (a, b, c, d) {
    0 != a.I && x("glp_mpl_read_model: invalid call sequence");
    a = Nd(a, b, c, d);
    1 == a || 2 == a ? (a = 0) : 4 == a && (a = 1);
    return a;
});
window['__GLP'].glp_mpl_read_model_from_string = function (a, b, c, d) {
    var e = 0;
    return Od(
        a,
        b,
        function () {
            return e < c.length ? c[e++] : -1;
        },
        d
    );
};
var Qd = (window['__GLP'].glp_mpl_read_data = function (a, b, c) {
    1 != a.I && 2 != a.I && x("glp_mpl_read_data: invalid call sequence");
    a = Pd(a, b, c);
    2 == a ? (a = 0) : 4 == a && (a = 1);
    return a;
});
window['__GLP'].glp_mpl_read_data_from_string = function (a, b, c) {
    var d = 0;
    return Qd(a, b, function () {
        return d < c.length ? c[d++] : -1;
    });
};
window['__GLP'].glp_mpl_generate = function (a, b, c, d) {
    1 != a.I && 2 != a.I && x("glp_mpl_generate: invalid call sequence\n");
    a = Rd(a, b, c, d);
    3 == a ? (a = 0) : 4 == a && (a = 1);
    return a;
};
window['__GLP'].glp_mpl_build_prob = function (a, b) {
    var c, d, e, f, g, k, h;
    3 != a.I && x("glp_mpl_build_prob: invalid call sequence\n");
    db(b);
    Ca(b, Sd(a));
    c = Td(a);
    0 < c && La(b, c);
    for (d = 1; d <= c; d++) {
        Pa(b, d, Ud(a, d));
        g = Vd(a, d, function (a, b) {
            k = a;
            h = b;
        });
        switch (g) {
            case Wd:
                g = Ka;
                break;
            case Xd:
                g = Sa;
                break;
            case Yd:
                g = Ta;
                break;
            case Zd:
                g = Q;
                break;
            case $d:
                g = C;
        }
        g == Q &&
            Math.abs(k - h) < 1e-9 * (1 + Math.abs(k)) &&
            ((g = C), Math.abs(k) <= Math.abs(h) ? (h = k) : (k = h));
        Ua(b, d, g, k, h);
        0 != ae(a, d) && y("glp_mpl_build_prob: row " + Ud(a, d) + "; constant term " + ae(a, d) + " ignored");
    }
    d = be(a);
    0 < d && Oa(b, d);
    for (e = 1; e <= d; e++) {
        Qa(b, e, ce(a, e));
        f = de(a, e);
        switch (f) {
            case ee:
            case fe:
                Hc(b, e, Fc);
        }
        g = ge(a, e, function (a, b) {
            k = a;
            h = b;
        });
        switch (g) {
            case Wd:
                g = Ka;
                break;
            case Xd:
                g = Sa;
                break;
            case Yd:
                g = Ta;
                break;
            case Zd:
                g = Q;
                break;
            case $d:
                g = C;
        }
        if (f == fe) {
            if (g == Ka || g == Ta || 0 > k) k = 0;
            if (g == Ka || g == Sa || 1 < h) h = 1;
            g = Q;
        }
        g == Q &&
            Math.abs(k - h) < 1e-9 * (1 + Math.abs(k)) &&
            ((g = C), Math.abs(k) <= Math.abs(h) ? (h = k) : (k = h));
        Va(b, e, g, k, h);
    }
    g = new Int32Array(1 + d);
    e = new Float64Array(1 + d);
    for (d = 1; d <= c; d++) (f = he(a, d, g, e)), Ya(b, d, f, g, e);
    for (d = 1; d <= c; d++)
        if (((f = ie(a, d)), f == je || f == ke)) {
            Da(b, Ud(a, d));
            Fa(b, f == je ? za : Ea);
            Xa(b, 0, ae(a, d));
            f = he(a, d, g, e);
            for (c = 1; c <= f; c++) Xa(b, g[c], e[c]);
            break;
        }
};
window['__GLP'].glp_mpl_postsolve = function (a, b, c) {
    var d, e, f, g, k, h;
    (3 != a.I || a.Kf) && x("glp_mpl_postsolve: invalid call sequence");
    c != $b && c != le && c != Sc && x("glp_mpl_postsolve: sol = " + c + "; invalid parameter");
    e = Td(a);
    f = be(a);
    (e == kb(b) && f == lb(b)) || x("glp_mpl_postsolve: wrong problem object\n");
    if (!me(a)) return 0;
    for (d = 1; d <= e; d++)
        c == $b
            ? ((g = zc(b, d)), (k = Ac(b, d)), (h = Bc(b, d)))
            : c == le
                ? ((g = 0), (k = glp_ipt_row_prim(b, d)), (h = glp_ipt_row_dual(b, d)))
                : c == Sc && ((g = 0), (k = kd(b, d)), (h = 0)),
            1e-9 > Math.abs(k) && (k = 0),
            1e-9 > Math.abs(h) && (h = 0),
            ne(a, d, g, k, h);
    for (d = 1; d <= f; d++)
        c == $b
            ? ((g = Cc(b, d)), (k = Dc(b, d)), (h = Ec(b, d)))
            : c == le
                ? ((g = 0), (k = glp_ipt_col_prim(b, d)), (h = glp_ipt_col_dual(b, d)))
                : c == Sc && ((g = 0), (k = ld(b, d)), (h = 0)),
            1e-9 > Math.abs(k) && (k = 0),
            1e-9 > Math.abs(h) && (h = 0),
            oe(a, d, g, k, h);
    a = pe(a);
    3 == a ? (a = 0) : 4 == a && (a = 1);
    return a;
};
function qe(a, b) {
    var c, d, e;
    c = null;
    for (d = a.root; null != d;)
        (c = d), 0 >= a.ug(a.info, b, c.key) ? ((e = 0), (d = c.left), c.ta++) : ((e = 1), (d = c.right));
    d = {};
    d.key = b;
    d.type = 0;
    d.link = null;
    d.ta = 1;
    d.V = c;
    d.fa = null == c ? 0 : e;
    d.Aa = 0;
    d.left = null;
    d.right = null;
    a.size++;
    for (null == c ? (a.root = d) : 0 == e ? (c.left = d) : (c.right = d); null != c;) {
        if (0 == e) {
            if (0 < c.Aa) {
                c.Aa = 0;
                break;
            }
            if (0 > c.Aa) {
                re(a, c);
                break;
            }
            c.Aa = -1;
        } else {
            if (0 > c.Aa) {
                c.Aa = 0;
                break;
            }
            if (0 < c.Aa) {
                re(a, c);
                break;
            }
            c.Aa = 1;
        }
        e = c.fa;
        c = c.V;
    }
    null == c && a.height++;
    return d;
}
function re(a, b) {
    var c, d, e, f, g;
    0 > b.Aa
        ? ((c = b.V),
            (d = b.left),
            (e = d.right),
            0 >= d.Aa
                ? (null == c ? (a.root = d) : 0 == b.fa ? (c.left = d) : (c.right = d),
                    (b.ta -= d.ta),
                    (d.V = c),
                    (d.fa = b.fa),
                    d.Aa++,
                    (d.right = b),
                    (b.V = d),
                    (b.fa = 1),
                    (b.Aa = -d.Aa),
                    (b.left = e),
                    null != e && ((e.V = b), (e.fa = 0)))
                : ((f = e.left),
                    (g = e.right),
                    null == c ? (a.root = e) : 0 == b.fa ? (c.left = e) : (c.right = e),
                    (b.ta -= d.ta + e.ta),
                    (e.ta += d.ta),
                    (b.Aa = 0 <= e.Aa ? 0 : 1),
                    (d.Aa = 0 >= e.Aa ? 0 : -1),
                    (e.V = c),
                    (e.fa = b.fa),
                    (e.Aa = 0),
                    (e.left = d),
                    (e.right = b),
                    (b.V = e),
                    (b.fa = 1),
                    (b.left = g),
                    (d.V = e),
                    (d.fa = 0),
                    (d.right = f),
                    null != f && ((f.V = d), (f.fa = 1)),
                    null != g && ((g.V = b), (g.fa = 0))))
        : ((c = b.V),
            (d = b.right),
            (e = d.left),
            0 <= d.Aa
                ? (null == c ? (a.root = d) : 0 == b.fa ? (c.left = d) : (c.right = d),
                    (d.ta += b.ta),
                    (d.V = c),
                    (d.fa = b.fa),
                    d.Aa--,
                    (d.left = b),
                    (b.V = d),
                    (b.fa = 0),
                    (b.Aa = -d.Aa),
                    (b.right = e),
                    null != e && ((e.V = b), (e.fa = 1)))
                : ((f = e.left),
                    (g = e.right),
                    null == c ? (a.root = e) : 0 == b.fa ? (c.left = e) : (c.right = e),
                    (d.ta -= e.ta),
                    (e.ta += b.ta),
                    (b.Aa = 0 >= e.Aa ? 0 : -1),
                    (d.Aa = 0 <= e.Aa ? 0 : 1),
                    (e.V = c),
                    (e.fa = b.fa),
                    (e.Aa = 0),
                    (e.left = b),
                    (e.right = d),
                    (b.V = e),
                    (b.fa = 0),
                    (b.right = f),
                    (d.V = e),
                    (d.fa = 1),
                    (d.left = g),
                    null != f && ((f.V = b), (f.fa = 1)),
                    null != g && ((g.V = d), (g.fa = 0))));
}
var pd = 1,
    qd = 2,
    se = 3,
    te = 4,
    ue = 5;
function od(a, b, c, d) {
    var e, f;
    f = a.valid = 0;
    switch (a.type) {
        case md:
            a.bb = null;
            null == a.jb &&
                ((f = {}),
                    (f.kb = f.h = 0),
                    (f.valid = 0),
                    (f.ma = ve()),
                    (f.Yd = 50),
                    (f.Rb = 0),
                    (f.Xe = f.Ze = f.Ye = null),
                    (f.ge = f.fe = null),
                    (f.qg = null),
                    (f.rg = null),
                    (f.jc = 1e-6),
                    (f.Xf = 0),
                    (a.jb = f),
                    (f = 1));
            break;
        case rd:
        case sd:
            (a.jb = null),
                null == a.bb &&
                (we && y("lpf_create_it: warning: debug mode enabled"),
                    (f = { valid: 0 }),
                    (f.Mc = f.cf = 0),
                    (f.ma = ve()),
                    (f.h = 0),
                    (f.yf = null),
                    (f.N = 50),
                    (f.n = 0),
                    (f.Ld = f.Kd = null),
                    (f.Nd = f.Md = null),
                    (f.Pc = null),
                    (f.Ee = f.De = null),
                    (f.Ge = f.Fe = null),
                    (f.Id = 1e3),
                    (f.md = 0),
                    (f.Zb = null),
                    (f.$b = null),
                    (f.mb = f.Gc = null),
                    (a.bb = f),
                    (f = 1));
    }
    null != a.jb ? (e = a.jb.ma) : null != a.bb && (e = a.bb.ma);
    f && (e.Ya = a.zd);
    e.ec = a.ec;
    e.xc = a.xc;
    e.hc = a.hc;
    e.Ob = a.Ob;
    e.sc = a.sc;
    null != a.jb && (f && (a.jb.Yd = a.Zc), (a.jb.jc = a.jc));
    null != a.bb && (f && (a.bb.N = a.vc), f && (a.bb.Id = a.jd));
    if (null != a.jb) {
        a: {
            e = a.jb;
            1 > b && x("fhv_factorize: m = " + b + "; invalid parameter");
            1e8 < b && x("fhv_factorize: m = " + b + "; matrix too big");
            e.h = b;
            e.valid = 0;
            null == e.Xe && (e.Xe = new Int32Array(1 + e.Yd));
            null == e.Ze && (e.Ze = new Int32Array(1 + e.Yd));
            null == e.Ye && (e.Ye = new Int32Array(1 + e.Yd));
            e.kb < b &&
                ((e.kb = b + 100),
                    (e.ge = new Int32Array(1 + e.kb)),
                    (e.fe = new Int32Array(1 + e.kb)),
                    (e.qg = new Int32Array(1 + e.kb)),
                    (e.rg = new Float64Array(1 + e.kb)));
            switch (xe(e.ma, b, c, d)) {
                case ye:
                    b = ze;
                    break a;
                case Ae:
                    b = Be;
                    break a;
            }
            e.valid = 1;
            e.Rb = 0;
            ha(e.ge, 1, e.ma.nb, 1, b);
            ha(e.fe, 1, e.ma.xb, 1, b);
            b = e.Xf = 0;
        }
        switch (b) {
            case ze:
                return (a = pd);
            case Be:
                return (a = qd);
        }
    } else if (null != a.bb) {
        a: {
            e = a.bb;
            if (we) var g, k, h, l, n, m;
            1 > b && x("lpf_factorize: m = " + b + "; invalid parameter");
            1e8 < b && x("lpf_factorize: m = " + b + "; matrix too big");
            e.cf = e.h = b;
            e.valid = 0;
            null == e.Ld && (e.Ld = new Int32Array(1 + e.N));
            null == e.Kd && (e.Kd = new Int32Array(1 + e.N));
            null == e.Nd && (e.Nd = new Int32Array(1 + e.N));
            null == e.Md && (e.Md = new Int32Array(1 + e.N));
            null == e.Pc &&
                ((f = e.N),
                    Ce && y("scf_create_it: warning: debug mode enabled"),
                    (1 <= f && 32767 >= f) || x("scf_create_it: n_max = " + f + "; invalid parameter"),
                    (g = {}),
                    (g.N = f),
                    (g.n = 0),
                    (g.Pb = new Float64Array(1 + f * f)),
                    (g.C = new Float64Array(1 + (f * (f + 1)) / 2)),
                    (g.p = new Int32Array(1 + f)),
                    (g.bg = De),
                    (g.ta = 0),
                    Ce ? (g.m = new Float64Array(1 + f * f)) : (g.m = null),
                    (g.eg = new Float64Array(1 + f)),
                    (e.Pc = g));
            null == e.Zb && (e.Zb = new Int32Array(1 + e.Id));
            null == e.$b && (e.$b = new Float64Array(1 + e.Id));
            e.Mc < b &&
                ((e.Mc = b + 100),
                    (e.Ee = new Int32Array(1 + e.Mc + e.N)),
                    (e.De = new Int32Array(1 + e.Mc + e.N)),
                    (e.Ge = new Int32Array(1 + e.Mc + e.N)),
                    (e.Fe = new Int32Array(1 + e.Mc + e.N)),
                    (e.mb = new Float64Array(1 + e.Mc + e.N)),
                    (e.Gc = new Float64Array(1 + e.Mc + e.N)));
            switch (xe(e.ma, b, c, d)) {
                case ye:
                    b = Ee;
                    break a;
                case Ae:
                    b = LPF_ECOND;
                    break a;
            }
            e.valid = 1;
            if (we) {
                e.yf = n = new Float64Array(1 + b * b);
                l = new Int32Array(1 + b);
                m = new Float64Array(1 + b);
                for (f = 1; f <= b * b; f++) n[f] = 0;
                for (k = 1; k <= b; k++)
                    for (h = c(d, k, l, m), f = 1; f <= h; f++) (g = l[f]), (n[(g - 1) * b + k] = m[f]);
            }
            e.n = 0;
            c = e.Pc;
            c.n = c.ta = 0;
            for (f = 1; f <= b; f++) (e.Ee[f] = e.De[f] = f), (e.Ge[f] = e.Fe[f] = f);
            e.md = 1;
            b = 0;
        }
        switch (b) {
            case 0:
                switch (a.type) {
                    case rd:
                        a.bb.Pc.bg = De;
                        break;
                    case sd:
                        a.bb.Pc.bg = Fe;
                }
                break;
            case Ee:
                return (a = pd);
            case LPF_ECOND:
                return (a = qd);
        }
    }
    a.valid = 1;
    return (a.dg = 0);
}
function wd(a, b) {
    if (null != a.jb) {
        var c = a.jb,
            d = c.ma.nb,
            e = c.ma.xb,
            f = c.ge,
            g = c.fe;
        c.valid || x("fhv_ftran: the factorization is not valid");
        c.ma.nb = f;
        c.ma.xb = g;
        Ge(c.ma, 0, b);
        c.ma.nb = d;
        c.ma.xb = e;
        He(c, 0, b);
        Ie(c.ma, 0, b);
    } else if (null != a.bb) {
        var c = a.bb,
            d = c.cf,
            e = c.h,
            k = c.n,
            h = c.De,
            f = c.Fe,
            g = c.mb,
            l,
            n;
        if (we) var m;
        c.valid || x("lpf_ftran: the factorization is not valid");
        if (we) for (m = new Float64Array(1 + e), l = 1; l <= e; l++) m[l] = b[l];
        for (l = 1; l <= d + k; l++) g[l] = (n = h[l]) <= e ? b[n] : 0;
        Ge(c.ma, 0, g);
        Je(c, g, d, g);
        Ke(c.Pc, 0, g, d);
        k = c.n;
        h = c.Ld;
        l = c.Kd;
        n = c.Zb;
        var q = c.$b,
            r,
            p,
            u,
            v;
        for (r = 1; r <= k; r++)
            if (0 != g[r + d]) for (v = -1 * g[r + d], p = h[r], u = p + l[r]; p < u; p++) g[n[p]] += v * q[p];
        Ie(c.ma, 0, g);
        for (l = 1; l <= e; l++) b[l] = g[f[l]];
        we && check_error(c, 0, b, m);
    }
}
function yd(a, b) {
    if (null != a.jb) {
        var c = a.jb,
            d = c.ma.nb,
            e = c.ma.xb,
            f = c.ge,
            g = c.fe;
        c.valid || x("fhv_btran: the factorization is not valid");
        Ie(c.ma, 1, b);
        He(c, 1, b);
        c.ma.nb = f;
        c.ma.xb = g;
        Ge(c.ma, 1, b);
        c.ma.nb = d;
        c.ma.xb = e;
    } else if (null != a.bb) {
        var c = a.bb,
            d = c.cf,
            e = c.h,
            k = c.n,
            f = c.Ee,
            h = c.Ge,
            g = c.mb,
            l,
            n;
        if (we) var m;
        c.valid || x("lpf_btran: the factorization is not valid");
        if (we) for (m = new Float64Array(1 + e), l = 1; l <= e; l++) m[l] = b[l];
        for (l = 1; l <= d + k; l++) g[l] = (n = h[l]) <= e ? b[n] : 0;
        Ie(c.ma, 1, g);
        Le(c, g, d, g);
        Ke(c.Pc, 1, g, d);
        k = c.n;
        h = c.Nd;
        l = c.Md;
        n = c.Zb;
        var q = c.$b,
            r,
            p,
            u,
            v;
        for (r = 1; r <= k; r++)
            if (0 != g[r + d]) for (v = -1 * g[r + d], p = h[r], u = p + l[r]; p < u; p++) g[n[p]] += v * q[p];
        Ge(c.ma, 1, g);
        for (l = 1; l <= e; l++) b[l] = g[f[l]];
        we && check_error(c, 1, b, m);
    }
}
function Me(a, b, c, d, e, f) {
    if (null != a.jb)
        switch (Ne(a.jb, b, c, d, e, f)) {
            case ze:
                return (a.valid = 0), (a = pd);
            case Oe:
                return (a.valid = 0), (a = se);
            case Pe:
                return (a.valid = 0), (a = te);
            case Qe:
                return (a.valid = 0), (a = ue);
        }
    else if (null != a.bb) {
        a: {
            var g = a.bb,
                k = g.cf,
                h = g.h;
            if (we) var l = g.yf;
            var n = g.n,
                m = g.Ld,
                q = g.Kd,
                r = g.Nd,
                p = g.Md,
                u = g.Ee,
                v = g.De,
                H = g.Ge,
                E = g.Fe,
                B = g.md,
                J = g.Zb,
                R = g.$b,
                T = g.Gc,
                O = g.mb,
                S = g.Gc,
                G,
                Z,
                Y;
            g.valid || x("lpf_update_it: the factorization is not valid");
            (1 <= b && b <= h) || x("lpf_update_it: j = " + b + "; column number out of range");
            if (n == g.N) (g.valid = 0), (b = LPF_ELIMIT);
            else {
                for (G = 1; G <= h; G++) T[G] = 0;
                for (Y = 1; Y <= c; Y++)
                    (G = d[e + Y]),
                        (1 <= G && G <= h) ||
                        x("lpf_update_it: ind[" + Y + "] = " + G + "; row number out of range"),
                        0 != T[G] &&
                        x("lpf_update_it: ind[" + Y + "] = " + G + "; duplicate row index not allowed"),
                        0 == f[Y] && x("lpf_update_it: val[" + Y + "] = " + f[Y] + "; zero element not allowed"),
                        (T[G] = f[Y]);
                if (we) for (G = 1; G <= h; G++) l[(G - 1) * h + b] = T[G];
                for (G = 1; G <= k + n; G++) O[G] = (Z = v[G]) <= h ? T[Z] : 0;
                for (G = 1; G <= k + n; G++) S[G] = 0;
                S[E[b]] = 1;
                Ge(g.ma, 0, O);
                Ie(g.ma, 1, S);
                if (g.Id < B + k + k) {
                    G = g.Id;
                    c = g.md - 1;
                    d = g.Zb;
                    for (e = g.$b; G < B + k + k;) G += G;
                    g.Id = G;
                    g.Zb = new Int32Array(1 + G);
                    g.$b = new Float64Array(1 + G);
                    ha(g.Zb, 1, d, 1, c);
                    ha(g.$b, 1, e, 1, c);
                    J = g.Zb;
                    R = g.$b;
                }
                m[n + 1] = B;
                for (G = 1; G <= k; G++) 0 != O[G] && ((J[B] = G), (R[B] = O[G]), B++);
                q[n + 1] = B - g.md;
                g.md = B;
                r[n + 1] = B;
                for (G = 1; G <= k; G++) 0 != S[G] && ((J[B] = G), (R[B] = S[G]), B++);
                p[n + 1] = B - g.md;
                g.md = B;
                Je(g, O, 0, O);
                Le(g, S, 0, S);
                q = 0;
                for (G = 1; G <= k; G++) q -= S[G] * O[G];
                m = g.Pc;
                B = q;
                G = m.N;
                q = m.n;
                c = m.Pb;
                d = m.C;
                e = m.p;
                if (Ce) var ba = m.m;
                p = m.eg;
                r = 0;
                if (q == G) r = Re;
                else {
                    m.n = ++q;
                    f = 1;
                    for (h = (f - 1) * m.N + q; f < q; f++, h += G) c[h] = 0;
                    h = 1;
                    for (f = (q - 1) * m.N + h; h < q; h++, f++) c[f] = 0;
                    for (f = c[(q - 1) * m.N + q] = 1; f < q; f++) {
                        J = 0;
                        h = 1;
                        for (l = (f - 1) * m.N + 1; h < q; h++, l++) J += c[l] * O[h + k];
                        d[Se(m, f, q)] = J;
                    }
                    for (h = 1; h < q; h++) p[h] = S[e[h] + k];
                    p[q] = B;
                    e[q] = q;
                    if (Ce) {
                        f = 1;
                        for (h = (f - 1) * m.N + q; f < q; f++, h += G) ba[h] = O[f + k];
                        h = 1;
                        for (f = (q - 1) * m.N + h; h < q; h++, f++) ba[f] = S[h + k];
                        ba[(q - 1) * m.N + q] = B;
                    }
                    for (O = 1; O < q && 0 == p[O]; O++);
                    switch (m.bg) {
                        case De:
                            S = m.n;
                            ba = m.Pb;
                            for (B = m.C; O < S; O++) {
                                e = Se(m, O, O);
                                c = (O - 1) * m.N + 1;
                                f = (S - 1) * m.N + 1;
                                if (Math.abs(B[e]) < Math.abs(p[O])) {
                                    G = O;
                                    for (d = e; G <= S; G++, d++) (l = B[d]), (B[d] = p[G]), (p[G] = l);
                                    G = 1;
                                    d = c;
                                    for (h = f; G <= S; G++, d++, h++) (l = ba[d]), (ba[d] = ba[h]), (ba[h] = l);
                                }
                                Math.abs(B[e]) < Te && (B[e] = p[O] = 0);
                                if (0 != p[O]) {
                                    l = p[O] / B[e];
                                    G = O + 1;
                                    for (d = e + 1; G <= S; G++, d++) p[G] -= l * B[d];
                                    G = 1;
                                    d = c;
                                    for (h = f; G <= S; G++, d++, h++) ba[h] -= l * ba[d];
                                }
                            }
                            Math.abs(p[S]) < Te && (p[S] = 0);
                            B[Se(m, S, S)] = p[S];
                            break;
                        case Fe:
                            Ue(m, O, p);
                    }
                    G = m.N;
                    O = m.n;
                    S = m.C;
                    B = 0;
                    ba = 1;
                    for (p = Se(m, ba, ba); ba <= O; ba++, p += G, G--) 0 != S[p] && B++;
                    m.ta = B;
                    m.ta != q && (r = Ve);
                    Ce && check_error(m, "scf_update_exp");
                }
                switch (r) {
                    case Ve:
                        g.valid = 0;
                        b = Ee;
                        break a;
                }
                u[k + n + 1] = v[k + n + 1] = k + n + 1;
                H[k + n + 1] = E[k + n + 1] = k + n + 1;
                G = E[b];
                Z = E[k + n + 1];
                H[G] = k + n + 1;
                E[k + n + 1] = G;
                H[Z] = b;
                E[b] = Z;
                g.n++;
                b = 0;
            }
        }
        switch (b) {
            case Ee:
                return (a.valid = 0), (a = pd);
            case LPF_ELIMIT:
                return (a.valid = 0), (a = te);
        }
    }
    a.dg++;
    return 0;
}
var We = (window['__GLP'].glp_read_lp = function (a, b, c) {
    function d(a, b) {
        throw Error(a.count + ": " + b);
    }
    function e(a, b) {
        y(a.count + ": warning: " + b);
    }
    function f(a) {
        var b;
        "\n" == a.m && a.count++;
        b = a.Lg();
        0 > b
            ? "\n" == a.m
                ? (a.count--, (b = -1))
                : (e(a, "missing final end of line"), (b = "\n"))
            : "\n" != b &&
            (0 <= " \t\n\v\f\r".indexOf(b)
                ? (b = " ")
                : ta(b) && d(a, "invalid control character " + b.charCodeAt(0)));
        a.m = b;
    }
    function g(a) {
        a.i += a.m;
        f(a);
    }
    function k(a, b) {
        return a.toLowerCase() == b.toLowerCase() ? 1 : 0;
    }
    function h(a) {
        function b() {
            for (a.b = 9; va(a.m) || 0 <= "!\"#$%&()/,.;?@_`'{}|~".indexOf(a.m);) g(a);
            c &&
                (k(a.i, "minimize")
                    ? (a.b = 1)
                    : k(a.i, "minimum")
                        ? (a.b = 1)
                        : k(a.i, "min")
                            ? (a.b = 1)
                            : k(a.i, "maximize")
                                ? (a.b = 2)
                                : k(a.i, "maximum")
                                    ? (a.b = 2)
                                    : k(a.i, "max")
                                        ? (a.b = 2)
                                        : k(a.i, "subject")
                                            ? " " == a.m &&
                                            (f(a),
                                                "t" == a.m.toLowerCase() &&
                                                ((a.b = 3),
                                                    (a.i += " "),
                                                    g(a),
                                                    "o" != a.m.toLowerCase() && d(a, "keyword `subject to' incomplete"),
                                                    g(a),
                                                    ua(a.m) && d(a, "keyword `" + a.i + a.m + "...' not recognized")))
                                            : k(a.i, "such")
                                                ? " " == a.m &&
                                                (f(a),
                                                    "t" == a.m.toLowerCase() &&
                                                    ((a.b = 3),
                                                        (a.i += " "),
                                                        g(a),
                                                        "h" != a.m.toLowerCase() && d(a, "keyword `such that' incomplete"),
                                                        g(a),
                                                        "a" != a.m.toLowerCase() && d(a, "keyword `such that' incomplete"),
                                                        g(a),
                                                        "t" != a.m.toLowerCase() && d(a, "keyword `such that' incomplete"),
                                                        g(a),
                                                        ua(a.m) && d(a, "keyword `" + a.i + a.m + "...' not recognized")))
                                                : k(a.i, "st")
                                                    ? (a.b = 3)
                                                    : k(a.i, "s.t.")
                                                        ? (a.b = 3)
                                                        : k(a.i, "st.")
                                                            ? (a.b = 3)
                                                            : k(a.i, "bounds")
                                                                ? (a.b = 4)
                                                                : k(a.i, "bound")
                                                                    ? (a.b = 4)
                                                                    : k(a.i, "general")
                                                                        ? (a.b = 5)
                                                                        : k(a.i, "generals")
                                                                            ? (a.b = 5)
                                                                            : k(a.i, "gen")
                                                                                ? (a.b = 5)
                                                                                : k(a.i, "integer")
                                                                                    ? (a.b = 6)
                                                                                    : k(a.i, "integers")
                                                                                        ? (a.b = 6)
                                                                                        : k(a.i, "int")
                                                                                            ? (a.b = 6)
                                                                                            : k(a.i, "binary")
                                                                                                ? (a.b = 7)
                                                                                                : k(a.i, "binaries")
                                                                                                    ? (a.b = 7)
                                                                                                    : k(a.i, "bin")
                                                                                                        ? (a.b = 7)
                                                                                                        : k(a.i, "end") && (a.b = 8));
        }
        var c;
        a.b = -1;
        a.i = "";
        for (a.value = 0; ;) {
            for (c = 0; " " == a.m;) f(a);
            if (-1 == a.m) a.b = 0;
            else if ("\n" == a.m)
                if ((f(a), ua(a.m))) (c = 1), b();
                else continue;
            else if ("\\" == a.m) {
                for (; "\n" != a.m;) f(a);
                continue;
            } else if (ua(a.m) || ("." != a.m && 0 <= "!\"#$%&()/,.;?@_`'{}|~".indexOf(a.m))) b();
            else if (wa(a.m) || "." == a.m) {
                for (a.b = 10; wa(a.m);) g(a);
                if ("." == a.m)
                    for (g(a), 1 != a.i.length || wa(a.m) || d(a, "invalid use of decimal point"); wa(a.m);) g(a);
                if ("e" == a.m || "E" == a.m)
                    for (
                        g(a),
                        ("+" != a.m && "-" != a.m) || g(a),
                        wa(a.m) || d(a, "numeric constant `" + a.i + "' incomplete");
                        wa(a.m);

                    )
                        g(a);
                a.value = Number(a.i);
                a.value == Number.NaN && d(a, "numeric constant `" + a.i + "' out of range");
            } else
                "+" == a.m
                    ? ((a.b = 11), g(a))
                    : "-" == a.m
                        ? ((a.b = 12), g(a))
                        : ":" == a.m
                            ? ((a.b = 13), g(a))
                            : "<" == a.m
                                ? ((a.b = 14), g(a), "=" == a.m && g(a))
                                : ">" == a.m
                                    ? ((a.b = 15), g(a), "=" == a.m && g(a))
                                    : "=" == a.m
                                        ? ((a.b = 16), g(a), "<" == a.m ? ((a.b = 14), g(a)) : ">" == a.m && ((a.b = 15), g(a)))
                                        : d(a, "character `" + a.m + "' not recognized");
            break;
        }
        for (; " " == a.m;) f(a);
    }
    function l(a, b) {
        var c = yb(a.Oa, b);
        if (0 == c) {
            c = Oa(a.Oa, 1);
            Qa(a.Oa, c, b);
            if (a.N < c) {
                var d = a.N,
                    e = a.ca,
                    f = a.j,
                    g = a.fa,
                    k = a.c,
                    h = a.f;
                a.N += a.N;
                a.ca = new Int32Array(1 + a.N);
                ha(a.ca, 1, e, 1, d);
                a.j = new Float64Array(1 + a.N);
                ha(a.j, 1, f, 1, d);
                a.fa = new Int8Array(1 + a.N);
                ja(a.fa, 1, 0, a.N);
                ha(a.fa, 1, g, 1, d);
                a.c = new Float64Array(1 + a.N);
                ha(a.c, 1, k, 1, d);
                a.f = new Float64Array(1 + a.N);
                ha(a.f, 1, h, 1, d);
            }
            a.c[c] = +t;
            a.f[c] = -t;
        }
        return c;
    }
    function n(a) {
        for (var b, c = 0, e, f; ;)
            if (
                (11 == a.b ? ((e = 1), h(a)) : 12 == a.b ? ((e = -1), h(a)) : (e = 1),
                    10 == a.b ? ((f = a.value), h(a)) : (f = 1),
                    9 != a.b && d(a, "missing variable name"),
                    (b = l(a, a.i)),
                    a.fa[b] && d(a, "multiple use of variable `" + a.i + "' not allowed"),
                    c++,
                    (a.ca[c] = b),
                    (a.j[c] = e * f),
                    (a.fa[b] = 1),
                    h(a),
                    11 != a.b && 12 != a.b)
            ) {
                for (b = 1; b <= c; b++) a.fa[a.ca[b]] = 0;
                e = 0;
                for (b = 1; b <= c; b++) 0 != a.j[b] && (e++, (a.ca[e] = a.ca[b]), (a.j[e] = a.j[b]));
                break;
            }
        return e;
    }
    function m(a, b, c) {
        a.c[b] != +t && e(a, "lower bound of variable `" + nb(a.Oa, b) + "' redefined");
        a.c[b] = c;
    }
    function q(a, b, c) {
        a.f[b] != -t && e(a, "upper bound of variable `" + nb(a.Oa, b) + "' redefined");
        a.f[b] = c;
    }
    function r(a) {
        var b, c, e, f;
        for (h(a); 11 == a.b || 12 == a.b || 10 == a.b || 9 == a.b;)
            11 == a.b || 12 == a.b
                ? ((c = 1),
                    (f = 11 == a.b ? 1 : -1),
                    h(a),
                    10 == a.b
                        ? ((e = f * a.value), h(a))
                        : k(a.i, "infinity") || k(a.i, "inf")
                            ? (0 < f && d(a, "invalid use of `+inf' as lower bound"), (e = -t), h(a))
                            : d(a, "missing lower bound"))
                : 10 == a.b
                    ? ((c = 1), (e = a.value), h(a))
                    : (c = 0),
                c && (14 != a.b && d(a, "missing `<', `<=', or `=<' after lower bound"), h(a)),
                9 != a.b && d(a, "missing variable name"),
                (b = l(a, a.i)),
                c && m(a, b, e),
                h(a),
                14 == a.b
                    ? (h(a),
                        11 == a.b || 12 == a.b
                            ? ((f = 11 == a.b ? 1 : -1),
                                h(a),
                                10 == a.b
                                    ? (q(a, b, f * a.value), h(a))
                                    : k(a.i, "infinity") || k(a.i, "inf")
                                        ? (0 > f && d(a, "invalid use of `-inf' as upper bound"), q(a, b, +t), h(a))
                                        : d(a, "missing upper bound"))
                            : 10 == a.b
                                ? (q(a, b, a.value), h(a))
                                : d(a, "missing upper bound"))
                    : 15 == a.b
                        ? (c && d(a, "invalid bound definition"),
                            h(a),
                            11 == a.b || 12 == a.b
                                ? ((f = 11 == a.b ? 1 : -1),
                                    h(a),
                                    10 == a.b
                                        ? (m(a, b, f * a.value), h(a))
                                        : k(a.i, "infinity") || 0 == k(a.i, "inf")
                                            ? (0 < f && d(a, "invalid use of `+inf' as lower bound"), m(a, b, -t), h(a))
                                            : d(a, "missing lower bound"))
                                : 10 == a.b
                                    ? (m(a, b, a.value), h(a))
                                    : d(a, "missing lower bound"))
                        : 16 == a.b
                            ? (c && d(a, "invalid bound definition"),
                                h(a),
                                11 == a.b || 12 == a.b
                                    ? ((f = 11 == a.b ? 1 : -1),
                                        h(a),
                                        10 == a.b
                                            ? (m(a, b, f * a.value), q(a, b, f * a.value), h(a))
                                            : d(a, "missing fixed value"))
                                    : 10 == a.b
                                        ? (m(a, b, a.value), q(a, b, a.value), h(a))
                                        : d(a, "missing fixed value"))
                            : k(a.i, "free")
                                ? (c && d(a, "invalid bound definition"), m(a, b, -t), q(a, b, +t), h(a))
                                : c || d(a, "invalid bound definition");
    }
    function p(a) {
        var b, c;
        5 == a.b ? ((c = 0), h(a)) : 6 == a.b ? ((c = 0), h(a)) : 7 == a.b && ((c = 1), h(a));
        for (; 9 == a.b;) (b = l(a, a.i)), Hc(a.Oa, b, Fc), c && (m(a, b, 0), q(a, b, 1)), h(a);
    }
    var u = {};
    y("Reading problem data");
    null == b && (b = {});
    u.Oa = a;
    u.u = b;
    u.Lg = c;
    u.count = 0;
    u.m = "\n";
    u.b = 0;
    u.i = "";
    u.value = 0;
    u.N = 100;
    u.ca = new Int32Array(1 + u.N);
    u.j = new Float64Array(1 + u.N);
    u.fa = new Int8Array(1 + u.N);
    ja(u.fa, 1, 0, u.N);
    u.c = new Float64Array(1 + u.N);
    u.f = new Float64Array(1 + u.N);
    db(a);
    wb(a);
    h(u);
    1 != u.b && 2 != u.b && d(u, "`minimize' or `maximize' keyword missing");
    (function (a) {
        var b, c;
        1 == a.b ? Fa(a.Oa, za) : 2 == a.b && Fa(a.Oa, Ea);
        h(a);
        9 == a.b && ":" == a.m ? (Da(a.Oa, a.i), h(a), h(a)) : Da(a.Oa, "obj");
        c = n(a);
        for (b = 1; b <= c; b++) Xa(a.Oa, a.ca[b], a.j[b]);
    })(u);
    3 != u.b && d(u, "constraints section missing");
    (function (a) {
        var b, c, e;
        for (
            h(a);
            (b = La(a.Oa, 1)),
            9 == a.b && ":" == a.m
                ? (0 != xb(a.Oa, a.i) && d(a, "constraint `" + a.i + "' multiply defined"),
                    Pa(a.Oa, b, a.i),
                    h(a),
                    h(a))
                : Pa(a.Oa, b, "r." + a.count),
            (c = n(a)),
            Ya(a.Oa, b, c, a.ca, a.j),
            14 == a.b
                ? ((e = Ta), h(a))
                : 15 == a.b
                    ? ((e = Sa), h(a))
                    : 16 == a.b
                        ? ((e = C), h(a))
                        : d(a, "missing constraint sense"),
            11 == a.b ? ((c = 1), h(a)) : 12 == a.b ? ((c = -1), h(a)) : (c = 1),
            10 != a.b && d(a, "missing right-hand side"),
            Ua(a.Oa, b, e, c * a.value, c * a.value),
            "\n" != a.m && -1 != a.m && d(a, "invalid symbol(s) beyond right-hand side"),
            h(a),
            11 == a.b || 12 == a.b || 10 == a.b || 9 == a.b;

        );
    })(u);
    for (4 == u.b && r(u); 5 == u.b || 6 == u.b || 7 == u.b;) p(u);
    8 == u.b ? h(u) : 0 == u.b ? e(u, "keyword `end' missing") : d(u, "symbol " + u.i + " in wrong position");
    0 != u.b && d(u, "extra symbol(s) detected beyond `end'");
    var v, H;
    for (b = 1; b <= a.n; b++)
        (v = u.c[b]),
            (H = u.f[b]),
            v == +t && (v = 0),
            H == -t && (H = +t),
            (c = v == -t && H == +t ? Ka : H == +t ? Sa : v == -t ? Ta : v != H ? Q : C),
            Va(u.Oa, b, c, v, H);
    y(
        a.h +
        " row" +
        (1 == a.h ? "" : "s") +
        ", " +
        a.n +
        " column" +
        (1 == a.n ? "" : "s") +
        ", " +
        a.O +
        " non-zero" +
        (1 == a.O ? "" : "s")
    );
    0 < Jc(a) &&
        ((b = Jc(a)),
            (c = Kc(a)),
            1 == b
                ? 0 == c
                    ? y("One variable is integer")
                    : y("One variable is binary")
                : ((v = b + " integer variables, "),
                    y(
                        (0 == c ? v + "none" : 1 == c ? v + "one" : c == b ? v + "all" : v + c) +
                        " of which " +
                        (1 == c ? "is" : "are") +
                        " binary"
                    )));
    y(u.count + " lines were read");
    zb(a);
    $a(a);
    return 0;
});
window['__GLP'].glp_write_lp = function (a, b, c) {
    function d(a) {
        if ("." == a[0] || wa(a[0])) return 1;
        for (var b = 0; b < a.length; b++) if (!va(a[b]) && 0 > "!\"#$%&()/,.;?@_`'{}|~".indexOf(a[b])) return 1;
        return 0;
    }
    function e(a) {
        for (var b = 0; b < a.length; b++)
            " " == a[b]
                ? (a[b] = "_")
                : "-" == a[b]
                    ? (a[b] = "~")
                    : "[" == a[b]
                        ? (a[b] = "(")
                        : "]" == a[b] && (a[b] = ")");
    }
    function f(a, b) {
        var c;
        c = 0 == b ? ib(a.Oa) : mb(a.Oa, b);
        if (null == c) return 0 == b ? "obj" : "r_" + b;
        e(c);
        return d(c) ? (0 == b ? "obj" : "r_" + b) : c;
    }
    function g(a, b) {
        var c = nb(a.Oa, b);
        if (null == c) return "x_" + b;
        e(c);
        return d(c) ? "x_" + b : c;
    }
    function k() {
        c("End");
        r++;
        y(r + " lines were written");
        return 0;
    }
    var h = {},
        l,
        n,
        m,
        q,
        r,
        p;
    y("Writing problem data");
    null == b && (b = {});
    h.Oa = a;
    h.u = b;
    r = 0;
    c("\\* Problem: " + (null == a.name ? "Unknown" : a.name) + " *\\");
    r++;
    c("");
    r++;
    if (!(0 < a.h && 0 < a.n))
        return (
            y("Warning: problem has no rows/columns"),
            c("\\* WARNING: PROBLEM HAS NO ROWS/COLUMNS *\\"),
            r++,
            c(""),
            r++,
            k()
        );
    a.dir == za ? (c("Minimize"), r++) : a.dir == Ea && (c("Maximize"), r++);
    b = f(h, 0);
    p = " " + b + ":";
    n = 0;
    for (m = 1; m <= a.n; m++)
        if (((l = a.g[m]), 0 != l.B || null == l.l))
            n++,
                (b = g(h, m)),
                (q =
                    0 == l.B
                        ? " + 0 " + b
                        : 1 == l.B
                            ? " + " + b
                            : -1 == l.B
                                ? " - " + b
                                : 0 < l.B
                                    ? " + " + l.B + " " + b
                                    : " - " + -l.B + " " + b),
                72 < p.length + q.length && (c(p), (p = ""), r++),
                (p += q);
    0 == n && ((q = " 0 " + g(h, 1)), (p += q));
    c(p);
    r++;
    0 != a.la && (c("\\* constant term = " + a.la + " *\\"), r++);
    c("");
    r++;
    c("Subject To");
    r++;
    for (m = 1; m <= a.h; m++)
        if (((l = a.o[m]), l.type != Ka)) {
            b = f(h, m);
            p = " " + b + ":";
            for (n = l.l; null != n; n = n.G)
                (b = g(h, n.g.H)),
                    (q =
                        1 == n.j
                            ? " + " + b
                            : -1 == n.j
                                ? " - " + b
                                : 0 < n.j
                                    ? " + " + n.j + " " + b
                                    : " - " + -n.j + " " + b),
                    72 < p.length + q.length && (c(p), (p = ""), r++),
                    (p += q);
            l.type == Q
                ? ((q = " - ~r_" + m), 72 < p.length + q.length && (c(p), (p = ""), r++), (p += q))
                : null == l.l && ((q = " 0 " + g(h, 1)), (p += q));
            if (l.type == Sa) q = " >= " + l.c;
            else if (l.type == Ta) q = " <= " + l.f;
            else if (l.type == Q || l.type == C) q = " = " + l.c;
            72 < p.length + q.length && (c(p), (p = ""), r++);
            p += q;
            c(p);
            r++;
        }
    c("");
    r++;
    q = 0;
    for (m = 1; m <= a.h; m++)
        (l = a.o[m]),
            l.type == Q && (q || (c("Bounds"), (q = 1), r++), c(" 0 <= ~r_" + m + " <= " + (l.f - l.c)), r++);
    for (m = 1; m <= a.n; m++)
        if (((l = a.g[m]), l.type != Sa || 0 != l.c))
            q || (c("Bounds"), (q = 1), r++),
                (b = g(h, m)),
                l.type == Ka
                    ? (c(" " + b + " free"), r++)
                    : l.type == Sa
                        ? (c(" " + b + " >= " + l.c), r++)
                        : l.type == Ta
                            ? (c(" -Inf <= " + b + " <= " + l.f), r++)
                            : l.type == Q
                                ? (c(" " + l.c + " <= " + b + " <= " + l.f), r++)
                                : l.type == C && (c(" " + b + " = " + l.c), r++);
    q && c("");
    r++;
    q = 0;
    for (m = 1; m <= a.n; m++)
        (l = a.g[m]), l.kind != Ma && (q || (c("Generals"), (q = 1), r++), c(" " + g(h, m)), r++);
    q && (c(""), r++);
    return k();
};
window['__GLP'].glp_read_lp_from_string = function (a, b, c) {
    var d = 0;
    return We(a, b, function () {
        return d < c.length ? c[d++] : -1;
    });
};
var ze = 1,
    Be = 2,
    Oe = 3,
    Pe = 4,
    Qe = 5;
function He(a, b, c) {
    var d = a.Rb,
        e = a.Xe,
        f = a.Ze,
        g = a.Ye,
        k = a.ma.yb,
        h = a.ma.zb,
        l,
        n,
        m;
    a.valid || x("fhv_h_solve: the factorization is not valid");
    if (b)
        for (b = d; 1 <= b; b--) {
            if (((a = e[b]), (m = c[a]), 0 != m)) for (l = f[b], n = l + g[b] - 1; l <= n; l++) c[k[l]] -= h[l] * m;
        }
    else
        for (b = 1; b <= d; b++) {
            a = e[b];
            m = c[a];
            l = f[b];
            for (n = l + g[b] - 1; l <= n; l++) m -= h[l] * c[k[l]];
            c[a] = m;
        }
}
function Ne(a, b, c, d, e, f) {
    var g = a.h,
        k = a.ma,
        h = k.Fc,
        l = k.Ec,
        n = k.nd,
        m = k.wf,
        q = k.Dc,
        r = k.Cc,
        p = k.Qc,
        u = k.nb,
        v = k.xb,
        H = k.of,
        E = k.ke,
        B = k.yb,
        J = k.zb,
        R = k.xe,
        T = k.Ob,
        O = a.Xe,
        S = a.Ze,
        G = a.Ye,
        Z = a.ge,
        Y = a.fe,
        ba = a.qg,
        oa = a.rg,
        z = a.jc,
        F,
        D;
    a.valid || x("fhv_update_it: the factorization is not valid");
    (1 <= b && b <= g) || x("fhv_update_it: j = " + b + "; column number out of range");
    if (a.Rb == a.Yd) return (a.valid = 0), (a = Pe);
    for (F = 1; F <= g; F++) oa[F] = 0;
    for (D = 1; D <= c; D++)
        (F = d[e + D]),
            (1 <= F && F <= g) || x("fhv_update_it: ind[" + D + "] = " + F + "; row number out of range"),
            0 != oa[F] && x("fhv_update_it: ind[" + D + "] = " + F + "; duplicate row index not allowed"),
            0 == f[D] && x("fhv_update_it: val[" + D + "] = " + f[D] + "; zero element not allowed"),
            (oa[F] = f[D]);
    a.ma.nb = Z;
    a.ma.xb = Y;
    Ge(a.ma, 0, oa);
    a.ma.nb = u;
    a.ma.xb = v;
    He(a, 0, oa);
    c = 0;
    for (F = 1; F <= g; F++) (e = oa[F]), 0 == e || Math.abs(e) < T || (c++, (ba[c] = F), (oa[c] = e));
    Y = q[b];
    for (Z = Y + r[b] - 1; Y <= Z; Y++) {
        F = B[Y];
        f = h[F];
        for (D = f + l[F] - 1; B[f] != b; f++);
        B[f] = B[D];
        J[f] = J[D];
        l[F]--;
    }
    k.Sb -= r[b];
    r[b] = 0;
    e = H[b];
    d = 0;
    for (D = 1; D <= c; D++) {
        F = ba[D];
        if (l[F] + 1 > n[F] && Xe(k, F, l[F] + 10)) return (a.valid = 0), (k.Ya = k.Ka + k.Ka), (a = Qe);
        f = h[F] + l[F];
        B[f] = b;
        J[f] = oa[D];
        l[F]++;
        d < v[F] && (d = v[F]);
    }
    if (p[b] < c && Ye(k, b, c)) return (a.valid = 0), (k.Ya = k.Ka + k.Ka), (a = Qe);
    Y = q[b];
    ha(B, Y, ba, 1, c);
    ha(J, Y, oa, 1, c);
    r[b] = c;
    k.Sb += c;
    if (e > d) return (a.valid = 0), (a = ze);
    F = u[e];
    b = E[e];
    for (D = e; D < d; D++) (u[D] = u[D + 1]), (v[u[D]] = D), (E[D] = E[D + 1]), (H[E[D]] = D);
    u[d] = F;
    v[F] = d;
    E[d] = b;
    H[b] = d;
    for (b = 1; b <= g; b++) R[b] = 0;
    f = h[F];
    for (D = f + l[F] - 1; f <= D; f++) {
        b = B[f];
        R[b] = J[f];
        Y = q[b];
        for (Z = Y + r[b] - 1; B[Y] != F; Y++);
        B[Y] = B[Z];
        J[Y] = J[Z];
        r[b]--;
    }
    k.Sb -= l[F];
    l[F] = 0;
    a.Rb++;
    O[a.Rb] = F;
    G[a.Rb] = 0;
    if (k.Pa - k.Ja < d - e && (Ze(k), k.Pa - k.Ja < d - e))
        return (a.valid = k.valid = 0), (k.Ya = k.Ka + k.Ka), (a = Qe);
    for (D = e; D < d; D++)
        if (((b = u[D]), (c = E[D]), 0 != R[c])) {
            v = R[c] / m[b];
            H = h[b];
            for (c = H + l[b] - 1; H <= c; H++) R[B[H]] -= v * J[H];
            k.Pa--;
            B[k.Pa] = b;
            J[k.Pa] = v;
            G[a.Rb]++;
        }
    0 == G[a.Rb] ? a.Rb-- : ((S[a.Rb] = k.Pa), (a.Xf += G[a.Rb]));
    m[F] = R[E[d]];
    c = 0;
    for (D = d + 1; D <= g; D++)
        if (((b = E[D]), (e = R[b]), !(Math.abs(e) < T))) {
            if (r[b] + 1 > p[b] && Ye(k, b, r[b] + 10)) return (a.valid = 0), (k.Ya = k.Ka + k.Ka), (a = Qe);
            Y = q[b] + r[b];
            B[Y] = F;
            J[Y] = e;
            r[b]++;
            c++;
            ba[c] = b;
            oa[c] = e;
        }
    if (n[F] < c && Xe(k, F, c)) return (a.valid = 0), (k.Ya = k.Ka + k.Ka), (a = Qe);
    f = h[F];
    ha(B, f, ba, 1, c);
    ha(J, f, oa, 1, c);
    l[F] = c;
    k.Sb += c;
    e = 0;
    F = u[d];
    f = h[F];
    for (D = f + l[F] - 1; f <= D; f++) e < Math.abs(J[f]) && (e = Math.abs(J[f]));
    b = E[d];
    Y = q[b];
    for (Z = Y + r[b] - 1; Y <= Z; Y++) e < Math.abs(J[Y]) && (e = Math.abs(J[Y]));
    return Math.abs(m[F]) < z * e ? ((a.valid = 0), (a = Oe)) : 0;
}
function ic(a) {
    function b(a, b, c, d, h, l) {
        var n,
            m,
            q,
            r,
            p,
            u,
            v,
            H,
            E,
            B,
            J,
            R,
            T,
            O,
            S = 0;
        (0 < a && 0 < b) || x("triang: m = " + a + "; n = " + b + "; invalid dimension");
        n = new Int32Array(1 + (a >= b ? a : b));
        m = new Int32Array(1 + a);
        q = new Int32Array(1 + b);
        r = new Int32Array(1 + a);
        p = new Int32Array(1 + a);
        v = new Int32Array(1 + b);
        H = new Int32Array(1 + b);
        for (B = 1; B <= b; B++) (J = d(c, -B, n)), (v[B] = m[J]), (m[J] = B);
        for (J = u = 0; J <= a; J++) for (B = m[J]; 0 != B; B = v[B]) (H[B] = u), (u = B);
        J = 0;
        for (B = u; 0 != B; B = H[B]) (v[B] = J), (J = B);
        for (E = 1; E <= a; E++)
            (m[E] = J = d(c, +E, n)), (r[E] = 0), (p[E] = q[J]), 0 != p[E] && (r[p[E]] = E), (q[J] = E);
        for (E = 1; E <= a; E++) h[E] = 0;
        for (B = 1; B <= b; B++) l[B] = 0;
        R = 1;
        for (T = b; R <= T;) {
            E = q[1];
            if (0 != E) {
                B = 0;
                for (O = d(c, +E, n); 1 <= O; O--) (J = n[O]), 0 == l[J] && (B = J);
                h[E] = l[B] = R;
                R++;
                S++;
            } else (B = u), (l[B] = T), T--;
            0 == v[B] ? (u = H[B]) : (H[v[B]] = H[B]);
            0 != H[B] && (v[H[B]] = v[B]);
            for (O = d(c, -B, n); 1 <= O; O--)
                (E = n[O]),
                    (J = m[E]),
                    0 == r[E] ? (q[J] = p[E]) : (p[r[E]] = p[E]),
                    0 != p[E] && (r[p[E]] = r[E]),
                    (m[E] = --J),
                    (r[E] = 0),
                    (p[E] = q[J]),
                    0 != p[E] && (r[p[E]] = E),
                    (q[J] = E);
        }
        for (E = 1; E <= a; E++) 0 == h[E] && (h[E] = R++);
        for (B = 1; B <= b; B++);
        for (r = 1; r <= a; r++) m[r] = 0;
        for (E = 1; E <= a; E++) (r = h[E]), (m[r] = E);
        for (J = 1; J <= b; J++) q[J] = 0;
        for (B = 1; B <= b; B++) (J = l[B]), (q[J] = B);
        for (r = 1; r <= S; r++) for (E = m[r], O = d(c, +E, n); 1 <= O; O--);
        return S;
    }
    function c(a, b, c) {
        var d = kb(a);
        lb(a);
        var h,
            l,
            n,
            m = 0;
        if (0 < b) {
            h = +b;
            n = vb(a, h, c, null);
            for (b = 1; b <= n; b++)
                $e(a, c[b], function (a) {
                    a != af && (c[++m] = d + c[b]);
                });
            bf(a, h, function (a) {
                a != af && (c[++m] = h);
            });
        } else
            (n = function (b) {
                b != af && (l <= d ? (c[++m] = l) : (m = gb(a, l - d, c, null)));
            }),
                (l = -b),
                l <= d ? bf(a, l, n) : $e(a, l - d, n);
        return m;
    }
    function d(a) {
        var d = kb(a),
            g = lb(a),
            k,
            h,
            l,
            n,
            m,
            q,
            r,
            p = new Int32Array(1 + d + g);
        y("Constructing initial basis...");
        if (0 == d || 0 == g) Hb(a);
        else {
            m = new Int32Array(1 + d);
            h = new Int32Array(1 + d + g);
            n = b(d, d + g, a, c, m, h);
            3 <= cf(a) && y("Size of triangular part = " + n + "");
            q = new Int32Array(1 + d);
            r = new Int32Array(1 + d + g);
            for (k = 1; k <= d; k++) q[m[k]] = k;
            for (k = 1; k <= d + g; k++) r[h[k]] = k;
            for (l = 1; l <= d + g; l++) p[l] = -1;
            for (h = 1; h <= n; h++) (k = r[h]), (p[k] = df);
            for (h = n + 1; h <= d; h++) (k = q[h]), (p[k] = df);
            for (l = 1; l <= d + g; l++)
                p[l] != df &&
                    ((n = function (a, b, c) {
                        switch (a) {
                            case ef:
                                p[l] = ff;
                                break;
                            case gf:
                                p[l] = hf;
                                break;
                            case jf:
                                p[l] = kf;
                                break;
                            case lf:
                                p[l] = Math.abs(b) <= Math.abs(c) ? hf : kf;
                                break;
                            case af:
                                p[l] = mf;
                        }
                    }),
                        l <= d ? bf(a, l, n) : $e(a, l - d, n));
            for (l = 1; l <= d + g; l++) l <= d ? Fb(a, l, p[l] - df + A) : Gb(a, l - d, p[l] - df + A);
        }
    }
    0 == a.h || 0 == a.n ? Hb(a) : d(a);
}
function Mc(a, b) {
    var c, d;
    if (0 == a.Rc)
        for (
            c = a.Dd,
            d = a.Ca,
            0 == c ? (a.Dd = 20) : (a.Dd = c + c),
            a.Ca = Array(1 + a.Dd),
            ka(a.Ca, 0, 1 + a.Dd),
            null != d && ha(a.Ca, 1, d, 1, c),
            d = a.Dd;
            d > c;
            d--
        )
            (a.Ca[d].node = null), (a.Ca[d].next = a.Rc), (a.Rc = d);
    d = a.Rc;
    a.Rc = a.Ca[d].next;
    a.Ca[d].next = 0;
    c = d;
    d = {};
    a.Ca[c].node = d;
    d.p = c;
    d.V = b;
    d.level = null == b ? 0 : b.level + 1;
    d.count = 0;
    d.Qa = null;
    d.zc = null;
    d.fc = null;
    d.ag = 0;
    d.rc = null == b ? (a.F.dir == za ? -t : +t) : b.rc;
    d.bound = null == b ? (a.F.dir == za ? -t : +t) : b.bound;
    d.Sc = 0;
    d.pg = 0;
    d.wg = 0;
    d.Yc = 0;
    d.Qd = 0;
    0 == a.u.Ke ? (d.data = null) : (d.data = {});
    d.na = null;
    d.ga = a.$a;
    d.next = null;
    null == a.head ? (a.head = d) : (a.$a.next = d);
    a.$a = d;
    a.Od++;
    a.Vf++;
    a.Fg++;
    null != b && b.count++;
    return d;
}
function nf(a, b) {
    var c = a.F,
        d,
        e,
        f,
        g;
    d = a.Ca[b].node;
    a.R = d;
    e = a.Ca[1].node;
    if (d != e) {
        for (d.na = null; null != d; d = d.V) null != d.V && (d.V.na = d);
        for (d = e; null != d; d = d.na) {
            var k = c.h;
            e = c.n;
            if (null == d.na) {
                a.Bg = k;
                a.Cg < k + e &&
                    ((f = k + e + 100),
                        (a.Cg = f),
                        (a.mf = new Int8Array(1 + f)),
                        (a.kf = new Float64Array(1 + f)),
                        (a.nf = new Float64Array(1 + f)),
                        (a.lf = new Int8Array(1 + f)));
                for (f = 1; f <= k; f++)
                    (g = c.o[f]), (a.mf[f] = g.type), (a.kf[f] = g.c), (a.nf[f] = g.f), (a.lf[f] = g.stat);
                for (f = 1; f <= e; f++)
                    (g = c.g[f]),
                        (a.mf[c.h + f] = g.type),
                        (a.kf[c.h + f] = g.c),
                        (a.nf[c.h + f] = g.f),
                        (a.lf[c.h + f] = g.stat);
            }
            for (f = d.Qa; null != f; f = f.next)
                f.k <= k ? Ua(c, f.k, f.type, f.c, f.f) : Va(c, f.k - k, f.type, f.c, f.f);
            for (f = d.zc; null != f; f = f.next) f.k <= k ? Fb(c, f.k, f.stat) : Gb(c, f.k - k, f.stat);
            if (null != d.fc) {
                var h,
                    l,
                    k = new Int32Array(1 + e);
                l = new Float64Array(1 + e);
                for (e = d.fc; null != e; e = e.next) {
                    f = La(c, 1);
                    Pa(c, f, e.name);
                    c.o[f].level = d.level;
                    c.o[f].origin = e.origin;
                    c.o[f].qc = e.qc;
                    Ua(c, f, e.type, e.c, e.f);
                    h = 0;
                    for (g = e.l; null != g; g = g.next) h++, (k[h] = g.H), (l[h] = g.j);
                    Ya(c, f, h, k, l);
                    Ab(c, f, e.qa);
                    Fb(c, f, e.stat);
                }
            }
        }
        for (d = a.R; null != d.Qa;) (f = d.Qa), (d.Qa = f.next);
        for (; null != d.zc;) (f = d.zc), (d.zc = f.next);
        for (; null != d.fc;) for (e = d.fc, d.fc = e.next; null != e.l;) (g = e.l), (e.l = g.next);
    }
}
function of(a) {
    var b = a.F,
        c = b.h,
        d = b.n,
        e = a.R,
        f,
        g,
        k;
    if (null == e.V)
        for (
            a.Eg = c,
            a.qe = new Int8Array(1 + c + d),
            a.oe = new Float64Array(1 + c + d),
            a.re = new Float64Array(1 + c + d),
            a.pe = new Int8Array(1 + c + d),
            f = 1;
            f <= c + d;
            f++
        )
            (k = f <= c ? b.o[f] : b.g[f - c]),
                (a.qe[f] = k.type),
                (a.oe[f] = k.c),
                (a.re[f] = k.f),
                (a.pe[f] = k.stat);
    else {
        var h = a.Eg,
            l = a.Bg;
        for (f = 1; f <= l + d; f++) {
            var n, m, q, r, p, u;
            n = a.mf[f];
            q = a.kf[f];
            r = a.nf[f];
            g = a.lf[f];
            k = f <= l ? b.o[f] : b.g[f - l];
            m = k.type;
            p = k.c;
            u = k.f;
            k = k.stat;
            if (n != m || q != p || r != u)
                (n = {}), (n.k = f), (n.type = m), (n.c = p), (n.f = u), (n.next = e.Qa), (e.Qa = n);
            g != k && ((g = {}), (g.k = f), (g.stat = k), (g.next = e.zc), (e.zc = g));
        }
        if (l < c)
            for (m = new Int32Array(1 + d), p = new Float64Array(1 + d), g = c; g > l; g--) {
                k = b.o[g];
                u = {};
                f = mb(b, g);
                null == f ? (u.name = null) : (u.name = f);
                u.type = k.type;
                u.c = k.c;
                u.f = k.f;
                u.l = null;
                n = vb(b, g, m, p);
                for (f = 1; f <= n; f++) (q = {}), (q.H = m[f]), (q.j = p[f]), (q.next = u.l), (u.l = q);
                u.qa = k.qa;
                u.stat = k.stat;
                u.next = e.fc;
                e.fc = u;
            }
        if (c != h) {
            c = c - h;
            e = new Int32Array(1 + c);
            for (g = 1; g <= c; g++) e[g] = h + g;
            ab(b, c, e);
        }
        c = b.h;
        for (g = 1; g <= c; g++) Ua(b, g, a.qe[g], a.oe[g], a.re[g]), Fb(b, g, a.pe[g]);
        for (h = 1; h <= d; h++) Va(b, h, a.qe[c + h], a.oe[c + h], a.re[c + h]), Gb(b, h, a.pe[c + h]);
    }
    a.R = null;
}
function pf(a, b, c) {
    var d;
    b = a.Ca[b].node;
    null == b.ga ? (a.head = b.next) : (b.ga.next = b.next);
    null == b.next ? (a.$a = b.ga) : (b.next.ga = b.ga);
    b.ga = b.next = null;
    a.Od--;
    for (d = 1; 2 >= d; d++) c[d] = Mc(a, b).p;
}
function qf(a, b) {
    var c;
    c = a.Ca[b].node;
    null == c.ga ? (a.head = c.next) : (c.ga.next = c.next);
    null == c.next ? (a.$a = c.ga) : (c.next.ga = c.ga);
    c.ga = c.next = null;
    for (a.Od--; ;) {
        for (var d; null != c.Qa;) (d = c.Qa), (c.Qa = d.next);
        for (; null != c.zc;) (d = c.zc), (c.zc = d.next);
        for (; null != c.fc;) {
            d = c.fc;
            for (d.name = null; null != d.l;) d.l = d.l.next;
            c.fc = d.next;
        }
        b = c.p;
        a.Ca[b].node = null;
        a.Ca[b].next = a.Rc;
        a.Rc = b;
        c = c.V;
        a.Vf--;
        if (null != c && (c.count--, 0 == c.count)) continue;
        break;
    }
}
function rf(a, b, c) {
    var d = a.F,
        e = d.h,
        f,
        g,
        k,
        h,
        l = a.xg,
        n = a.Og,
        m,
        q;
    xc(d);
    Ib(d);
    a = d.g[b].w;
    b = Bd(d, e + b, l, n);
    for (f = -1; 1 >= f; f += 2)
        if (((k = l), (g = Fd(d, b, k, n, f, 1e-9)), (g = 0 == g ? 0 : k[g]), 0 == g))
            d.dir == za ? (0 > f ? (m = +t) : (q = +t)) : d.dir == Ea && (0 > f ? (m = -t) : (q = -t));
        else {
            for (k = 1; k <= b && l[k] != g; k++);
            k = n[k];
            g <= e ? ((h = d.o[g].stat), (g = d.o[g].M)) : ((h = d.g[g - e].stat), (g = d.g[g - e].M));
            if (d.dir == za) {
                if ((h == M && 0 > g) || (h == P && 0 < g) || h == Ra) g = 0;
            } else d.dir == Ea && ((h == M && 0 < g) || (h == P && 0 > g) || h == Ra) && (g = 0);
            h = (0 > f ? Math.floor(a) : Math.ceil(a)) - a;
            h /= k;
            k = g * h;
            0 > f ? (m = d.ea + k) : (q = d.ea + k);
        }
    c(m, q);
}
function sf(a, b) {
    var c = a.F,
        d = c.n,
        e,
        f,
        g,
        k = a.xg,
        h;
    g = 0;
    h = c.la;
    e = 0;
    for (f = 1; f <= d; f++) {
        var l = c.g[f];
        if (0 != l.B)
            if (l.type == C) h += l.B * l.w;
            else {
                if (l.kind != Fc || l.B != Math.floor(l.B)) return b;
                2147483647 >= Math.abs(l.B) ? (k[++g] = Math.abs(l.B) | 0) : (e = 1);
            }
    }
    if (0 == e) {
        if (0 == g) return b;
        d = 0;
        for (e = 1; e <= g; e++) {
            if (1 == e) d = k[1];
            else for (f = k[e], l = void 0; 0 < f;) (l = d % f), (d = f), (f = l);
            if (1 == d) break;
        }
        e = d;
    }
    c.dir == za
        ? b != +t && ((c = (b - h) / e), c >= Math.floor(c) + 0.001 && ((c = Math.ceil(c)), (b = e * c + h)))
        : c.dir == Ea &&
        b != -t &&
        ((c = (b - h) / e), c <= Math.ceil(c) - 0.001 && ((c = Math.floor(c)), (b = e * c + h)));
    return b;
}
function tf(a, b) {
    var c = a.F,
        d = 1,
        e;
    if (c.Da == ec)
        switch (((e = a.u.ue * (1 + Math.abs(c.xa))), c.dir)) {
            case za:
                b >= c.xa - e && (d = 0);
                break;
            case Ea:
                b <= c.xa + e && (d = 0);
        }
    else
        switch (c.dir) {
            case za:
                b == +t && (d = 0);
                break;
            case Ea:
                b == -t && (d = 0);
        }
    return d;
}
function uf(a) {
    var b = null;
    switch (a.F.dir) {
        case za:
            for (a = a.head; null != a; a = a.next) if (null == b || b.bound > a.bound) b = a;
            break;
        case Ea:
            for (a = a.head; null != a; a = a.next) if (null == b || b.bound < a.bound) b = a;
    }
    return null == b ? 0 : b.p;
}
var vf = (window['__GLP'].glp_ios_relative_gap = function (a) {
    var b = a.F,
        c;
    b.Da == ec
        ? ((b = b.xa),
            (c = uf(a)),
            0 == c
                ? (a = 0)
                : ((a = a.Ca[c].node.bound), (a = Math.abs(b - a) / (Math.abs(b) + 2.220446049250313e-16))))
        : (a = t);
    return a;
});
function wf(a) {
    var b = a.F,
        c = new kc();
    switch (a.u.s) {
        case lc:
            c.s = lc;
            break;
        case Mb:
            c.s = Mb;
            break;
        case fc:
        case Xb:
            c.s = fc;
            break;
        case mc:
            c.s = Xb;
    }
    c.hb = Rb;
    a.u.s < mc ? (c.cb = a.u.cb) : (c.cb = 0);
    if (b.Da == ec)
        switch (a.F.dir) {
            case za:
                c.ff = b.xa;
                break;
            case Ea:
                c.ef = b.xa;
        }
    b = sc(b, c);
    a.R.ag++;
    return b;
}
function Oc(a) {
    for (; null != a.head;) {
        var b = a.head;
        for (a.head = b.next; null != b.l;) b.l = b.l.next;
    }
    a.size = 0;
    a.head = a.$a = null;
    a.$g = 0;
    a.R = null;
}
function xf(a, b) {
    function c(a, b, c, d, e) {
        var f, g, k;
        g = k = 0;
        for (f = 1; f <= a; f++)
            if (0 < b[f])
                if (c[f] == -t)
                    if (0 == g) g = f;
                    else {
                        k = -t;
                        g = 0;
                        break;
                    }
                else k += b[f] * c[f];
            else if (0 > b[f])
                if (d[f] == +t)
                    if (0 == g) g = f;
                    else {
                        k = -t;
                        g = 0;
                        break;
                    }
                else k += b[f] * d[f];
        e.Ud = k;
        e.Qf = g;
        g = k = 0;
        for (f = 1; f <= a; f++)
            if (0 < b[f])
                if (d[f] == +t)
                    if (0 == g) g = f;
                    else {
                        k = +t;
                        g = 0;
                        break;
                    }
                else k += b[f] * d[f];
            else if (0 > b[f])
                if (c[f] == -t)
                    if (0 == g) g = f;
                    else {
                        k = +t;
                        g = 0;
                        break;
                    }
                else k += b[f] * c[f];
        e.Td = k;
        e.Pf = g;
    }
    function d(a, b) {
        b(0 == a.Qf ? a.Ud : -t, 0 == a.Pf ? a.Td : +t);
    }
    function e(a, b, c, d, e, f, g, k) {
        var h, l, m, p;
        c == -t || a.Td == +t
            ? (h = -t)
            : 0 == a.Pf
                ? 0 < b[g]
                    ? (h = c - (a.Td - b[g] * f[g]))
                    : 0 > b[g] && (h = c - (a.Td - b[g] * e[g]))
                : (h = a.Pf == g ? c - a.Td : -t);
        d == +t || a.Ud == -t
            ? (l = +t)
            : 0 == a.Qf
                ? 0 < b[g]
                    ? (l = d - (a.Ud - b[g] * e[g]))
                    : 0 > b[g] && (l = d - (a.Ud - b[g] * f[g]))
                : (l = a.Qf == g ? d - a.Ud : +t);
        1e-6 > Math.abs(b[g])
            ? ((m = -t), (p = +t))
            : 0 < b[g]
                ? ((m = h == -t ? -t : h / b[g]), (p = l == +t ? +t : l / b[g]))
                : 0 > b[g] && ((m = l == +t ? -t : l / b[g]), (p = h == -t ? +t : h / b[g]));
        k(m, p);
    }
    function f(a, b, c, e, f) {
        var g = 0,
            k = b[c],
            h = e[f],
            l = null,
            m = null;
        d(a, function (a, b) {
            l = a;
            m = b;
        });
        if (
            (k != -t && ((a = 0.001 * (1 + Math.abs(k))), m < k - a)) ||
            (h != +t && ((a = 0.001 * (1 + Math.abs(h))), l > h + a))
        )
            return 1;
        k != -t && ((a = 1e-12 * (1 + Math.abs(k))), l > k - a && (b[c] = -t));
        h != +t && ((a = 1e-12 * (1 + Math.abs(h))), m < h + a && (e[f] = +t));
        return g;
    }
    function g(a, b, c, d, f, g, k, h, l) {
        var m = 0,
            p,
            n,
            q = null,
            r = null;
        p = f[h];
        n = g[h];
        e(a, b, c, d, f, g, h, function (a, b) {
            q = a;
            r = b;
        });
        k &&
            (q != -t && (q = 0.001 > q - Math.floor(q) ? Math.floor(q) : Math.ceil(q)),
                r != +t && (r = 0.001 > Math.ceil(r) - r ? Math.ceil(r) : Math.floor(r)));
        if (
            (p != -t && ((a = 0.001 * (1 + Math.abs(p))), r < p - a)) ||
            (n != +t && ((a = 0.001 * (1 + Math.abs(n))), q > n + a))
        )
            return 1;
        q != -t && ((a = 0.001 * (1 + Math.abs(q))), p < q - a && (p = q));
        r != +t && ((a = 0.001 * (1 + Math.abs(r))), n > r + a && (n = r));
        p != -t &&
            n != +t &&
            ((a = Math.abs(p)),
                (b = Math.abs(n)),
                p > n - 1e-10 * (1 + (a <= b ? a : b)) &&
                (p == f[h] ? (n = p) : n == g[h] ? (p = n) : a <= b ? (n = p) : (p = n)));
        l(p, n);
        return m;
    }
    function k(a, b, c, d, e) {
        var f,
            g = 0;
        b < d && (a || b == -t ? g++ : ((f = c == +t ? 1 + Math.abs(b) : 1 + (c - b)), d - b >= 0.25 * f && g++));
        c > e && (a || c == +t ? g++ : ((f = b == -t ? 1 + Math.abs(c) : 1 + (c - b)), c - e >= 0.25 * f && g++));
        return g;
    }
    var h = a.F,
        l = h.h,
        n = h.n,
        m,
        q,
        r,
        p = 0,
        u,
        v,
        H,
        E;
    u = new Float64Array(1 + l);
    v = new Float64Array(1 + l);
    switch (h.Da) {
        case Aa:
            u[0] = -t;
            v[0] = +t;
            break;
        case ec:
            switch (h.dir) {
                case za:
                    u[0] = -t;
                    v[0] = h.xa - h.la;
                    break;
                case Ea:
                    (u[0] = h.xa - h.la), (v[0] = +t);
            }
    }
    for (m = 1; m <= l; m++) (u[m] = qb(h, m)), (v[m] = rb(h, m));
    H = new Float64Array(1 + n);
    E = new Float64Array(1 + n);
    for (m = 1; m <= n; m++) (H[m] = tb(h, m)), (E[m] = ub(h, m));
    q = l + 1;
    r = new Int32Array(1 + q);
    for (m = 1; m <= q; m++) r[m] = m - 1;
    if (
        (function (a, b, d, e, h, l, m, p) {
            var n = a.h,
                q = a.n,
                r = {},
                u,
                H,
                v = 0,
                w,
                E,
                L,
                K,
                aa,
                N,
                da,
                ea;
            w = new Int32Array(1 + q);
            E = new Int32Array(1 + n + 1);
            L = new Int32Array(1 + n + 1);
            K = new Int32Array(1 + n + 1);
            aa = new Float64Array(1 + q);
            N = new Float64Array(1 + q);
            da = new Float64Array(1 + q);
            H = 0;
            for (u = 1; u <= l; u++) (n = m[u]), (E[++H] = n), (L[n] = 1);
            for (; 0 < H;)
                if (((n = E[H--]), (L[n] = 0), K[n]++, b[n] != -t || d[n] != +t)) {
                    l = 0;
                    if (0 == n)
                        for (m = 1; m <= q; m++) (ea = a.g[m]), 0 != ea.B && (l++, (w[l] = m), (aa[l] = ea.B));
                    else for (m = a.o[n].l; null != m; m = m.G) l++, (w[l] = m.g.H), (aa[l] = m.j);
                    for (u = 1; u <= l; u++) (m = w[u]), (N[u] = e[m]), (da[u] = h[m]);
                    c(l, aa, N, da, r);
                    if (f(r, b, n, d, n)) {
                        v = 1;
                        break;
                    }
                    if (b[n] != -t || d[n] != +t)
                        for (u = 1; u <= l; u++) {
                            var I,
                                ia = null,
                                Wa = null;
                            m = w[u];
                            ea = a.g[m];
                            I = ea.kind != Ma;
                            if (
                                g(r, aa, b[n], d[n], N, da, I, u, function (a, b) {
                                    ia = a;
                                    Wa = b;
                                })
                            )
                                return (v = 1);
                            I = k(I, e[m], h[m], ia, Wa);
                            e[m] = ia;
                            h[m] = Wa;
                            if (0 < I)
                                for (m = ea.l; null != m; m = m.L)
                                    (ea = m.o.ia),
                                        K[ea] >= p ||
                                        (b[ea] == -t && d[ea] == +t) ||
                                        0 != L[ea] ||
                                        ((E[++H] = ea), (L[ea] = 1));
                        }
                }
            return v;
        })(h, u, v, H, E, q, r, b)
    )
        return 1;
    for (m = 1; m <= l; m++)
        zc(h, m) == A &&
            (u[m] == -t && v[m] == +t
                ? Ua(h, m, Ka, 0, 0)
                : v[m] == +t
                    ? Ua(h, m, Sa, u[m], 0)
                    : u[m] == -t && Ua(h, m, Ta, 0, v[m]));
    for (m = 1; m <= n; m++)
        Va(
            h,
            m,
            H[m] == -t && E[m] == +t ? Ka : E[m] == +t ? Sa : H[m] == -t ? Ta : H[m] != E[m] ? Q : C,
            H[m],
            E[m]
        );
    return p;
}
function Nc(a) {
    function b(a, b) {
        var c, d, e, f;
        d = a.F.Da == ec ? String(a.F.xa) : "not found yet";
        c = uf(a);
        0 == c
            ? (e = "tree is empty")
            : ((c = a.Ca[c].node.bound), c == -t ? (e = "-inf") : c == +t ? (e = "+inf") : (e = c));
        a.F.dir == za ? (f = ">=") : a.F.dir == Ea && (f = "<=");
        c = vf(a);
        y(
            "+" +
            a.F.da +
            ": " +
            (b ? ">>>>>" : "mip =") +
            " " +
            d +
            " " +
            f +
            " " +
            e +
            " " +
            (0 == c
                ? "  0.0%"
                : 0.001 > c
                    ? " < 0.1%"
                    : 9.999 >= c
                        ? "  " + Number(100 * c).toFixed(1) + "%"
                        : "") +
            " (" +
            a.Od +
            "; " +
            (a.Fg - a.Vf) +
            ")"
        );
        a.Hg = la();
    }
    function c(a, b) {
        return tf(a, a.Ca[b].node.bound);
    }
    function d(a) {
        var b = a.F,
            c,
            d,
            e = 0,
            f,
            g,
            k,
            h,
            l,
            m = 0;
        for (c = 1; c <= b.n; c++)
            if (((k = b.g[c]), (a.$c[c] = 0), k.kind == Fc && k.stat == A)) {
                d = k.type;
                f = k.c;
                g = k.f;
                k = k.w;
                if (d == Sa || d == Q || d == C) {
                    h = f - a.u.Xb;
                    l = f + a.u.Xb;
                    if (h <= k && k <= l) continue;
                    if (k < f) continue;
                }
                if (d == Ta || d == Q || d == C) {
                    h = g - a.u.Xb;
                    l = g + a.u.Xb;
                    if (h <= k && k <= l) continue;
                    if (k > g) continue;
                }
                h = Math.floor(k + 0.5) - a.u.Xb;
                l = Math.floor(k + 0.5) + a.u.Xb;
                (h <= k && k <= l) ||
                    ((a.$c[c] = 1), e++, (h = k - Math.floor(k)), (l = Math.ceil(k) - k), (m += h <= l ? h : l));
            }
        a.R.wg = e;
        a.R.Yc = m;
        a.u.s >= mc &&
            (0 == e
                ? y("There are no fractional columns")
                : 1 == e
                    ? y("There is one fractional column, integer infeasibility is " + m + "")
                    : y("There are " + e + " fractional columns, integer infeasibility is " + m + ""));
    }
    function e(a) {
        var b = a.F,
            c;
        b.Da = ec;
        b.xa = b.ea;
        for (c = 1; c <= b.h; c++) {
            var d = b.o[c];
            d.Va = d.w;
        }
        for (c = 1; c <= b.n; c++)
            (d = b.g[c]), d.kind == Ma ? (d.Va = d.w) : d.kind == Fc && (d.Va = Math.floor(d.w + 0.5));
        a.lh++;
    }
    function f(a, b, c) {
        var d = a.F,
            e,
            f = d.h,
            g,
            k,
            h,
            l,
            m,
            p = Array(3),
            n,
            q,
            r,
            u,
            w = null,
            v = null,
            L;
        g = d.g[b].type;
        n = d.g[b].c;
        q = d.g[b].f;
        e = d.g[b].w;
        r = Math.floor(e);
        u = Math.ceil(e);
        switch (g) {
            case Ka:
                k = Ta;
                h = Sa;
                break;
            case Sa:
                k = n == r ? C : Q;
                h = Sa;
                break;
            case Ta:
                k = Ta;
                h = u == q ? C : Q;
                break;
            case Q:
                (k = n == r ? C : Q), (h = u == q ? C : Q);
        }
        rf(a, b, function (a, b) {
            w = a;
            v = b;
        });
        g = sf(a, w);
        L = sf(a, v);
        l = !tf(a, g);
        m = !tf(a, L);
        if (l && m) return a.u.s >= mc && y("Both down- and up-branches are hopeless"), 2;
        if (m)
            return (
                a.u.s >= mc && y("Up-branch is hopeless"),
                Va(d, b, k, n, r),
                (a.R.rc = w),
                d.dir == za ? a.R.bound < g && (a.R.bound = g) : d.dir == Ea && a.R.bound > g && (a.R.bound = g),
                1
            );
        if (l)
            return (
                a.u.s >= mc && y("Down-branch is hopeless"),
                Va(d, b, h, u, q),
                (a.R.rc = v),
                d.dir == za ? a.R.bound < L && (a.R.bound = L) : d.dir == Ea && a.R.bound > L && (a.R.bound = L),
                1
            );
        a.u.s >= mc && y("Branching on column " + b + ", primal value is " + e + "");
        l = a.R.p;
        a.R.Sc = b;
        a.R.pg = e;
        of(a);
        pf(a, l, p);
        a.u.s >= mc && y("Node " + p[1] + " begins down branch, node " + p[2] + " begins up branch ");
        e = a.Ca[p[1]].node;
        e.Qa = {};
        e.Qa.k = f + b;
        e.Qa.type = k;
        e.Qa.c = n;
        e.Qa.f = r;
        e.Qa.next = null;
        e.rc = w;
        d.dir == za ? e.bound < g && (e.bound = g) : d.dir == Ea && e.bound > g && (e.bound = g);
        e = a.Ca[p[2]].node;
        e.Qa = {};
        e.Qa.k = f + b;
        e.Qa.type = h;
        e.Qa.c = u;
        e.Qa.f = q;
        e.Qa.next = null;
        e.rc = v;
        d.dir == za ? e.bound < L && (e.bound = L) : d.dir == Ea && e.bound > L && (e.bound = L);
        c == yf ? (a.sd = 0) : c == zf ? (a.sd = p[1]) : c == Af && (a.sd = p[2]);
        return 0;
    }
    function g(a) {
        var b = a.F,
            c,
            d,
            e = 0,
            f,
            g,
            k,
            h;
        f = b.ea;
        for (c = 1; c <= b.n; c++)
            if (((h = b.g[c]), h.kind == Fc))
                switch (((g = h.c), (k = h.f), (d = h.stat), (h = h.M), b.dir)) {
                    case za:
                        d == M
                            ? (0 > h && (h = 0), f + h >= b.xa && (Va(b, c, C, g, g), e++))
                            : d == P && (0 < h && (h = 0), f - h >= b.xa && (Va(b, c, C, k, k), e++));
                        break;
                    case Ea:
                        d == M
                            ? (0 < h && (h = 0), f + h <= b.xa && (Va(b, c, C, g, g), e++))
                            : d == P && (0 > h && (h = 0), f - h <= b.xa && (Va(b, c, C, k, k), e++));
                }
        a.u.s >= mc &&
            0 != e &&
            (1 == e
                ? y("One column has been fixed by reduced cost")
                : y(e + " columns have been fixed by reduced costs"));
    }
    function k(a) {
        var b,
            c = 0,
            d = null;
        for (b = a.wc + 1; b <= a.F.h; b++)
            a.F.o[b].origin == Ja &&
                a.F.o[b].level == a.R.level &&
                a.F.o[b].stat == A &&
                (null == d && (d = new Int32Array(1 + a.F.h)), (d[++c] = b));
        0 < c && (ab(a.F, c, d), Jb(a.F));
    }
    function h(a) {
        var b = a.F,
            c,
            d = 0,
            e = 0,
            f = 0,
            g = 0,
            k = 0;
        for (c = b.h; 0 < c; c--) {
            var h = b.o[c];
            h.origin == Ja && (h.qc == Bf ? d++ : h.qc == Cf ? e++ : h.qc == Df ? f++ : h.qc == Ef ? g++ : k++);
        }
        0 < d + e + f + g + k &&
            (y("Cuts on level " + a.R.level + ":"),
                0 < d && y(" gmi = " + d + ";"),
                0 < e && y(" mir = " + e + ";"),
                0 < f && y(" cov = " + f + ";"),
                0 < g && y(" clq = " + g + ";"),
                0 < k && y(" app = " + k + ";"),
                y(""));
    }
    function l(a) {
        if (a.u.Bd == bb || a.u.yd == bb || a.u.vd == bb || a.u.td == bb) {
            var b, c, d;
            c = a.n;
            1e3 > c && (c = 1e3);
            d = 0;
            for (b = a.wc + 1; b <= a.F.h; b++) a.F.o[b].origin == Ja && d++;
            if (!(d >= c)) {
                a.u.yd == bb && 5 > a.R.Qd && Ff(a);
                a.u.Bd == bb && Gf(a, a.Tf);
                if (a.u.vd == bb) {
                    b = a.F;
                    c = kb(b);
                    var e = lb(b),
                        f,
                        g,
                        k,
                        h,
                        l;
                    xc(b);
                    d = new Int32Array(1 + e);
                    h = new Float64Array(1 + e);
                    l = new Float64Array(1 + e);
                    for (e = 1; e <= c; e++)
                        for (k = 1; 2 >= k; k++) {
                            g = pb(b, e) - Ka + ef;
                            if (1 == k) {
                                if (g != jf && g != lf) continue;
                                g = vb(b, e, d, h);
                                h[0] = Hf(b, e);
                            } else {
                                if (g != gf && g != lf) continue;
                                g = vb(b, e, d, h);
                                for (f = 1; f <= g; f++) h[f] = -h[f];
                                h[0] = -If(b, e);
                            }
                            a: {
                                var m = b;
                                f = d;
                                for (
                                    var p = h,
                                    n = l,
                                    q = null,
                                    r = null,
                                    u = Array(5),
                                    w = void 0,
                                    v = void 0,
                                    L = void 0,
                                    K = (L = void 0),
                                    aa = void 0,
                                    N = (K = K = void 0),
                                    L = 0,
                                    v = 1;
                                    v <= g;
                                    v++
                                )
                                    (w = f[v]),
                                        sb(m, w) - Ka + ef == af
                                            ? (p[0] -= p[v] * Jf(m, w))
                                            : (L++, (f[L] = f[v]), (p[L] = p[v]));
                                g = L;
                                L = 0;
                                for (v = 1; v <= g; v++)
                                    (w = f[v]),
                                        (Ic(m, w) == Ma ? Kf : Lf) == Lf &&
                                        sb(m, w) - Ka + ef == lf &&
                                        0 == Jf(m, w) &&
                                        1 == Mf(m, w) &&
                                        (L++,
                                            (aa = f[L]),
                                            (K = p[L]),
                                            (f[L] = f[v]),
                                            (p[L] = p[v]),
                                            (f[v] = aa),
                                            (p[v] = K));
                                if (2 > L) g = 0;
                                else {
                                    aa = K = 0;
                                    for (v = L + 1; v <= g; v++) {
                                        w = f[v];
                                        if (sb(m, w) - Ka + ef != lf) {
                                            g = 0;
                                            break a;
                                        }
                                        0 < p[v]
                                            ? ((aa += p[v] * Jf(m, w)), (K += p[v] * Mf(m, w)))
                                            : ((aa += p[v] * Mf(m, w)), (K += p[v] * Jf(m, w)));
                                    }
                                    K -= aa;
                                    N = 0;
                                    for (v = L + 1; v <= g; v++) (w = f[v]), (N += p[v] * Dc(m, w));
                                    N -= aa;
                                    0 > N && (N = 0);
                                    N > K && (N = K);
                                    p[0] -= aa;
                                    for (v = 1; v <= L; v++)
                                        (w = f[v]),
                                            (n[v] = Dc(m, w)),
                                            0 > n[v] && (n[v] = 0),
                                            1 < n[v] && (n[v] = 1);
                                    for (v = 1; v <= L; v++)
                                        0 > p[v] &&
                                            ((f[v] = -f[v]), (p[v] = -p[v]), (p[0] += p[v]), (n[v] = 1 - n[v]));
                                    m = L;
                                    v = p[0];
                                    w = N;
                                    N = void 0;
                                    for (N = 1; N <= m; N++);
                                    for (N = 1; N <= m; N++);
                                    N = void 0;
                                    b: {
                                        for (
                                            var da = (N = void 0),
                                            ea = 0,
                                            I = 0,
                                            ia = void 0,
                                            Wa = void 0,
                                            ob = 0.001,
                                            ia = 0.001 * (1 + Math.abs(v)),
                                            N = 1;
                                            N <= m;
                                            N++
                                        )
                                            for (da = N + 1; da <= m; da++) {
                                                ea++;
                                                if (1e3 < ea) {
                                                    N = I;
                                                    break b;
                                                }
                                                p[N] + p[da] + w > v + ia &&
                                                    ((Wa = p[N] + p[da] - v),
                                                        (q = 1 / (Wa + K)),
                                                        (r = 2 - q * Wa),
                                                        (Wa = n[N] + n[da] + q * w - r),
                                                        ob < Wa && ((ob = Wa), (u[1] = N), (u[2] = da), (I = 1)));
                                            }
                                        N = I;
                                    }
                                    da = void 0;
                                    if (N) da = 2;
                                    else {
                                        N = void 0;
                                        b: {
                                            for (
                                                var ea = (da = N = void 0),
                                                ia = (I = 0),
                                                ob = (Wa = void 0),
                                                Lb = 0.001,
                                                Wa = 0.001 * (1 + Math.abs(v)),
                                                N = 1;
                                                N <= m;
                                                N++
                                            )
                                                for (da = N + 1; da <= m; da++)
                                                    for (ea = da + 1; ea <= m; ea++) {
                                                        I++;
                                                        if (1e3 < I) {
                                                            N = ia;
                                                            break b;
                                                        }
                                                        p[N] + p[da] + p[ea] + w > v + Wa &&
                                                            ((ob = p[N] + p[da] + p[ea] - v),
                                                                (q = 1 / (ob + K)),
                                                                (r = 3 - q * ob),
                                                                (ob = n[N] + n[da] + n[ea] + q * w - r),
                                                                Lb < ob &&
                                                                ((Lb = ob),
                                                                    (u[1] = N),
                                                                    (u[2] = da),
                                                                    (u[3] = ea),
                                                                    (ia = 1)));
                                                    }
                                            N = ia;
                                        }
                                        da = void 0;
                                        if (N) da = 3;
                                        else {
                                            N = void 0;
                                            b: {
                                                for (
                                                    var I = (ea = da = N = void 0),
                                                    Wa = (ia = 0),
                                                    Lb = (ob = void 0),
                                                    bh = 0.001,
                                                    ob = 0.001 * (1 + Math.abs(v)),
                                                    N = 1;
                                                    N <= m;
                                                    N++
                                                )
                                                    for (da = N + 1; da <= m; da++)
                                                        for (ea = da + 1; ea <= m; ea++)
                                                            for (I = ea + 1; I <= m; I++) {
                                                                ia++;
                                                                if (1e3 < ia) {
                                                                    N = Wa;
                                                                    break b;
                                                                }
                                                                p[N] + p[da] + p[ea] + p[I] + w > v + ob &&
                                                                    ((Lb = p[N] + p[da] + p[ea] + p[I] - v),
                                                                        (q = 1 / (Lb + K)),
                                                                        (r = 4 - q * Lb),
                                                                        (Lb = n[N] + n[da] + n[ea] + n[I] + q * w - r),
                                                                        bh < Lb &&
                                                                        ((bh = Lb),
                                                                            (u[1] = N),
                                                                            (u[2] = da),
                                                                            (u[3] = ea),
                                                                            (u[4] = I),
                                                                            (Wa = 1)));
                                                            }
                                                N = Wa;
                                            }
                                            da = N ? 4 : 0;
                                        }
                                    }
                                    K = da;
                                    if (0 == K) g = 0;
                                    else {
                                        f[0] = 0;
                                        p[0] = r;
                                        for (w = 1; w <= K; w++) u[w] = f[u[w]];
                                        for (v = 1; v <= K; v++)
                                            0 < u[v]
                                                ? ((f[v] = +u[v]), (p[v] = 1))
                                                : ((f[v] = -u[v]), (p[v] = -1), --p[0]);
                                        for (v = L + 1; v <= g; v++) K++, (f[K] = f[v]), (p[K] = q * p[v]);
                                        p[0] += q * aa;
                                        g = K;
                                    }
                                }
                            }
                            if (0 != g) {
                                f = b;
                                p = g;
                                n = d;
                                q = h;
                                r = lb(f);
                                L = u = void 0;
                                aa = 0;
                                0 > p && x("lpx_eval_row: len = " + p + "; invalid row length");
                                for (L = 1; L <= p; L++)
                                    (u = n[L]),
                                        (1 <= u && u <= r) ||
                                        x("lpx_eval_row: j = " + u + "; column number out of range"),
                                        (aa += q[L] * Dc(f, u));
                                f = aa - h[0];
                                0.001 > f || Id(a, Df, g, d, h, Ta, h[0]);
                            }
                        }
                }
                a.u.td == bb &&
                    null != a.Le &&
                    ((0 == a.R.level && 50 > a.R.Qd) || (0 < a.R.level && 5 > a.R.Qd)) &&
                    ((c = a.Le),
                        (d = lb(a.F)),
                        (b = new Int32Array(1 + d)),
                        (d = new Float64Array(1 + d)),
                        (c = Nf(a.F, c, b, d)),
                        0 < c && Id(a, Ef, c, b, d, Ta, d[0]));
            }
        }
    }
    function n(a) {
        var b,
            d,
            e = 0;
        for (b = a.head; null != b; b = d) (d = b.next), c(a, b.p) || (qf(a, b.p), e++);
        a.u.s >= mc &&
            (1 == e
                ? y("One hopeless branch has been pruned")
                : 1 < e && y(e + " hopeless branches have been pruned"));
    }
    var m,
        q,
        r,
        p,
        u = 0,
        v = a.ic;
    for (q = 0; ;) {
        r = null;
        switch (q) {
            case 0:
                if (null == a.head) {
                    a.u.s >= mc && y("Active list is empty!");
                    p = 0;
                    r = 3;
                    break;
                }
                if (null != a.u.rb && ((a.reason = Of), a.u.rb(a, a.u.Tc), (a.reason = 0), a.stop)) {
                    p = Rc;
                    r = 3;
                    break;
                }
                0 == a.Cd && (1 == a.Od ? (a.Cd = a.head.p) : 0 != a.sd ? (a.Cd = a.sd) : (a.Cd = Pf(a)));
                nf(a, a.Cd);
                a.Cd = a.sd = 0;
                null != a.R.V && a.R.V.p != u && (u = 0);
                m = a.R.p;
                a.u.s >= mc &&
                    (y("------------------------------------------------------------------------"),
                        y("Processing node " + m + " at level " + a.R.level + ""));
                1 == m &&
                    (a.u.yd == bb && a.u.s >= Xb && y("Gomory's cuts enabled"),
                        a.u.Bd == bb && (a.u.s >= Xb && y("MIR cuts enabled"), (a.Tf = Qf(a))),
                        a.u.vd == bb && a.u.s >= Xb && y("Cover cuts enabled"),
                        a.u.td == bb && (a.u.s >= Xb && y("Clique cuts enabled"), (a.Le = Rf(a.F))));
            case 1:
                (a.u.s >= mc || (a.u.s >= fc && a.u.dc - 1 <= 1e3 * ma(a.Hg))) && b(a, 0);
                a.u.s >= Xb && 60 <= ma(v) && (y("Time used: " + ma(a.ic) + " secs"), (v = la()));
                if (0 < a.u.ae && vf(a) <= a.u.ae) {
                    a.u.s >= mc && y("Relative gap tolerance reached; search terminated ");
                    p = Pc;
                    r = 3;
                    break;
                }
                if (2147483647 > a.u.ub && a.u.ub - 1 <= 1e3 * ma(a.ic)) {
                    a.u.s >= mc && y("Time limit exhausted; search terminated");
                    p = Qc;
                    r = 3;
                    break;
                }
                if (null != a.u.rb && ((a.reason = Sf), a.u.rb(a, a.u.Tc), (a.reason = 0), a.stop)) {
                    p = Rc;
                    r = 3;
                    break;
                }
                if (a.u.dd != hd)
                    if (a.u.dd == id) {
                        if (0 == a.R.level && xf(a, 100)) {
                            r = 2;
                            break;
                        }
                    } else if (a.u.dd == jd && xf(a, 0 == a.R.level ? 100 : 10)) {
                        r = 2;
                        break;
                    }
                if (!c(a, m)) {
                    y("*** not tested yet ***");
                    r = 2;
                    break;
                }
                a.u.s >= mc && y("Solving LP relaxation...");
                p = wf(a);
                if (0 != p && p != Tf && p != Uf) {
                    a.u.s >= Mb &&
                        y("ios_driver: unable to solve current LP relaxation; glp_simplex returned " + p + "");
                    p = Tb;
                    r = 3;
                    break;
                }
                q = a.F.ra;
                r = a.F.wa;
                if (q == ec && r == ec) a.u.s >= mc && y("Found optimal solution to LP relaxation");
                else if (r == jc) {
                    a.u.s >= Mb && y("ios_driver: current LP relaxation has no dual feasible solution");
                    p = Tb;
                    r = 3;
                    break;
                } else if (q == Ad && r == ec) {
                    a.u.s >= mc && y("LP relaxation has no solution better than incumbent objective value");
                    r = 2;
                    break;
                } else if (q == jc) {
                    a.u.s >= mc && y("LP relaxation has no feasible solution");
                    r = 2;
                    break;
                }
                q = a.R.rc = a.F.ea;
                q = sf(a, q);
                a.F.dir == za
                    ? a.R.bound < q && (a.R.bound = q)
                    : a.F.dir == Ea && a.R.bound > q && (a.R.bound = q);
                a.u.s >= mc && y("Local bound is " + q + "");
                if (!c(a, m)) {
                    a.u.s >= mc && y("Current branch is hopeless and can be pruned");
                    r = 2;
                    break;
                }
                if (null != a.u.rb) {
                    a.reason = Ga;
                    a.u.rb(a, a.u.Tc);
                    a.reason = 0;
                    if (a.stop) {
                        p = Rc;
                        r = 3;
                        break;
                    }
                    if (a.ne) {
                        a.ne = a.pf = 0;
                        r = 1;
                        break;
                    }
                    a.pf && ((a.pf = 0), Jb(a.F));
                }
                d(a);
                if (0 == a.R.wg) {
                    a.u.s >= mc && y("New integer feasible solution found");
                    a.u.s >= Xb && h(a);
                    e(a);
                    a.u.s >= fc && b(a, 1);
                    if (null != a.u.rb && ((a.reason = Vf), a.u.rb(a, a.u.Tc), (a.reason = 0), a.stop)) {
                        p = Rc;
                        r = 3;
                        break;
                    }
                    r = 2;
                    break;
                }
                a.F.Da == ec && g(a);
                if (null != a.u.rb) {
                    a.reason = Wf;
                    a.u.rb(a, a.u.Tc);
                    a.reason = 0;
                    if (a.stop) {
                        p = Rc;
                        r = 3;
                        break;
                    }
                    if (!c(a, m)) {
                        a.u.s >= mc && y("Current branch became hopeless and can be pruned");
                        r = 2;
                        break;
                    }
                }
                if (a.u.Ve && ((a.reason = Wf), Xf(a), (a.reason = 0), !c(a, m))) {
                    a.u.s >= mc && y("Current branch became hopeless and can be pruned");
                    r = 2;
                    break;
                }
                if (null != a.u.rb && ((a.reason = Ia), a.u.rb(a, a.u.Tc), (a.reason = 0), a.stop)) {
                    p = Rc;
                    r = 3;
                    break;
                }
                if (0 == a.R.level || 0 == u) (a.reason = Ia), l(a), (a.reason = 0);
                0 < a.local.size && ((a.reason = Ia), Yf(a), (a.reason = 0));
                Oc(a.local);
                if (a.ne) {
                    a.ne = 0;
                    a.R.Qd++;
                    r = 1;
                    break;
                }
                k(a);
                a.u.s >= Xb && 0 == a.R.level && h(a);
                null != a.Ed && Zf(a);
                if (null != a.u.rb && ((a.reason = $f), a.u.rb(a, a.u.Tc), (a.reason = 0), a.stop)) {
                    p = Rc;
                    r = 3;
                    break;
                }
                0 == a.Sc &&
                    (a.Sc = ag(a, function (b) {
                        a.Ff = b;
                    }));
                q = a.R.p;
                p = f(a, a.Sc, a.Ff);
                a.Sc = a.Ff = 0;
                if (0 == p) {
                    u = q;
                    r = 0;
                    break;
                } else if (1 == p) {
                    a.R.ag = a.R.Qd = 0;
                    r = 1;
                    break;
                } else if (2 == p) {
                    r = 2;
                    break;
                }
            case 2:
                a.u.s >= mc && y("Node " + m + " fathomed");
                of(a);
                qf(a, m);
                a.F.Da == ec && n(a);
                r = u = 0;
                break;
            case 3:
                return a.u.s >= fc && b(a, 0), (a.Tf = null), (a.Le = null), p;
        }
        if (null == r) break;
        q = r;
    }
}
function bg(a) {
    var b;
    b = {};
    b.n = a;
    b.O = 0;
    b.Na = new Int32Array(1 + a);
    b.ca = new Int32Array(1 + a);
    b.j = new Float64Array(1 + a);
    return b;
}
function cg(a, b, c) {
    var d = a.Na[b];
    0 == c
        ? 0 != d &&
        ((a.Na[b] = 0), d < a.O && ((a.Na[a.ca[a.O]] = d), (a.ca[d] = a.ca[a.O]), (a.j[d] = a.j[a.O])), a.O--)
        : (0 == d && ((d = ++a.O), (a.Na[b] = d), (a.ca[d] = b)), (a.j[d] = c));
}
function dg(a) {
    for (var b = 1; b <= a.O; b++) a.Na[a.ca[b]] = 0;
    a.O = 0;
}
function eg(a, b) {
    for (var c = 0, d = 1; d <= a.O; d++)
        0 == Math.abs(a.j[d]) || Math.abs(a.j[d]) < b
            ? (a.Na[a.ca[d]] = 0)
            : (c++, (a.Na[a.ca[d]] = c), (a.ca[c] = a.ca[d]), (a.j[c] = a.j[d]));
    a.O = c;
}
function fg(a, b) {
    dg(a);
    a.O = b.O;
    ha(a.ca, 1, b.ca, 1, a.O);
    ha(a.j, 1, b.j, 1, a.O);
    for (var c = 1; c <= a.O; c++) a.Na[a.ca[c]] = c;
}
function Ff(a) {
    function b(a) {
        return a - Math.floor(a);
    }
    function c(a, c, d) {
        var e = a.F,
            f = e.h,
            g = e.n,
            k = c.ca,
            h = c.j;
        c = c.fh;
        var l, B, J, R, T, O, S, G, Z, Y, ba;
        B = Bd(e, f + d, k, h);
        G = e.g[d].w;
        for (l = 1; l <= f + g; l++) c[l] = 0;
        ba = b(G);
        for (d = 1; d <= B; d++) {
            l = k[d];
            l <= f ? ((R = e.o[l]), (J = Ma)) : ((R = e.g[l - f]), (J = R.kind));
            T = R.c;
            O = R.f;
            R = R.stat;
            Z = h[d];
            if (1e5 < Math.abs(Z)) return;
            if (!(1e-10 > Math.abs(Z))) {
                switch (R) {
                    case Ra:
                        return;
                    case M:
                        S = -Z;
                        break;
                    case P:
                        S = +Z;
                        break;
                    case Na:
                        continue;
                }
                switch (J) {
                    case Fc:
                        if (1e-10 > Math.abs(S - Math.floor(S + 0.5))) continue;
                        else b(S) <= b(G) ? (Y = b(S)) : (Y = (b(G) / (1 - b(G))) * (1 - b(S)));
                        break;
                    case Ma:
                        Y = 0 <= S ? +S : (b(G) / (1 - b(G))) * -S;
                }
                switch (R) {
                    case M:
                        c[l] = +Y;
                        ba += Y * T;
                        break;
                    case P:
                        (c[l] = -Y), (ba -= Y * O);
                }
            }
        }
        for (d = 1; d <= f; d++)
            if (!(1e-10 > Math.abs(c[d]))) for (R = e.o[d], S = R.l; null != S; S = S.G) c[f + S.g.H] += c[d] * S.j;
        B = 0;
        for (d = 1; d <= g; d++)
            1e-10 > Math.abs(c[f + d]) ||
                ((R = e.g[d]), R.type == C ? (ba -= c[f + d] * R.c) : (B++, (k[B] = d), (h[B] = c[f + d])));
        1e-12 > Math.abs(ba) && (ba = 0);
        for (l = 1; l <= B; l++) if (0.001 > Math.abs(h[l]) || 1e3 < Math.abs(h[l])) return;
        Id(a, Bf, B, k, h, Sa, ba);
    }
    var d = a.F,
        e = d.h,
        f = d.n,
        g,
        k,
        h = {};
    g = Array(1 + f);
    h.ca = new Int32Array(1 + f);
    h.j = new Float64Array(1 + f);
    h.fh = new Float64Array(1 + e + f);
    e = 0;
    for (k = 1; k <= f; k++) {
        var l = d.g[k];
        l.kind == Fc &&
            l.type != C &&
            l.stat == A &&
            ((l = b(l.w)), 0.05 <= l && 0.95 >= l && (e++, (g[e].H = k), (g[e].Pb = l)));
    }
    na(g, e, function (a, b) {
        return a.Pb > b.Pb ? -1 : a.Pb < b.Pb ? 1 : 0;
    });
    f = Hd(a);
    for (d = 1; d <= e && !(50 <= Hd(a) - f); d++) c(a, h, g[d].H);
}
var gg = 0,
    hg = 5,
    ig = 0,
    jg = 1,
    kg = 2;
function Qf(a) {
    var b = a.F,
        c = b.h,
        b = b.n,
        d;
    gg && y("ios_mir_init: warning: debug mode enabled");
    d = {};
    d.h = c;
    d.n = b;
    d.Gb = new Int8Array(1 + c);
    d.fb = new Int8Array(1 + c + b);
    d.c = new Float64Array(1 + c + b);
    d.ac = new Int32Array(1 + c + b);
    d.f = new Float64Array(1 + c + b);
    d.Bb = new Int32Array(1 + c + b);
    d.x = new Float64Array(1 + c + b);
    d.Af = new Int32Array(1 + hg);
    d.ab = bg(c + b);
    d.ob = new Int8Array(1 + c + b);
    d.sa = bg(c + b);
    d.J = bg(c + b);
    (function (a, b) {
        var c = a.F,
            d = b.h,
            h;
        for (h = 1; h <= d; h++) {
            var l = c.o[h];
            b.Gb[h] = 0;
            b.fb[h] = 0;
            switch (l.type) {
                case Ka:
                    b.c[h] = -t;
                    b.f[h] = +t;
                    break;
                case Sa:
                    b.c[h] = l.c;
                    b.f[h] = +t;
                    break;
                case Ta:
                    b.c[h] = -t;
                    b.f[h] = l.f;
                    break;
                case Q:
                    b.c[h] = l.c;
                    b.f[h] = l.f;
                    break;
                case C:
                    b.c[h] = b.f[h] = l.c;
            }
            b.ac[h] = b.Bb[h] = 0;
        }
    })(a, d);
    (function (a, b) {
        var c = a.F,
            d = b.h,
            h = b.n,
            l;
        for (l = d + 1; l <= d + h; l++) {
            var n = c.g[l - d];
            switch (n.kind) {
                case Ma:
                    b.fb[l] = 0;
                    break;
                case Fc:
                    b.fb[l] = 1;
            }
            switch (n.type) {
                case Ka:
                    b.c[l] = -t;
                    b.f[l] = +t;
                    break;
                case Sa:
                    b.c[l] = n.c;
                    b.f[l] = +t;
                    break;
                case Ta:
                    b.c[l] = -t;
                    b.f[l] = n.f;
                    break;
                case Q:
                    b.c[l] = n.c;
                    b.f[l] = n.f;
                    break;
                case C:
                    b.c[l] = b.f[l] = n.c;
            }
            b.ac[l] = b.Bb[l] = 0;
        }
    })(a, d);
    (function (a, b) {
        var c = a.F,
            d = b.h,
            h,
            l,
            n,
            m,
            q,
            r;
        for (l = 1; l <= d; l++)
            if ((0 == b.c[l] && b.f[l] == +t) || (b.c[l] == -t && 0 == b.f[l]))
                if (
                    ((h = c.o[l].l),
                        null != h &&
                        ((n = d + h.g.H),
                            (q = h.j),
                            (h = h.G),
                            null != h && ((m = d + h.g.H), (r = h.j), null == h.G)))
                ) {
                    if (b.fb[n] || !b.fb[m])
                        if (b.fb[n] && !b.fb[m]) (m = n), (r = q), (n = d + h.g.H), (q = h.j);
                        else continue;
                    b.c[m] != -t &&
                        b.f[m] != +t &&
                        b.c[m] != b.f[m] &&
                        (0 == b.f[l] && ((q = -q), (r = -r)),
                            0 < q
                                ? 0 == b.ac[n] && ((b.c[n] = -r / q), (b.ac[n] = m), (b.Gb[l] = 1))
                                : 0 == b.Bb[n] && ((b.f[n] = -r / q), (b.Bb[n] = m), (b.Gb[l] = 1)));
                }
    })(a, d);
    (function (a, b) {
        var c = a.F,
            d = b.h,
            h,
            l,
            n,
            m;
        for (l = 1; l <= d; l++)
            if (b.c[l] == -t && b.f[l] == +t) b.Gb[l] = 1;
            else {
                m = 0;
                for (h = c.o[l].l; null != h; h = h.G) {
                    n = d + h.g.H;
                    if (b.c[n] == -t && b.f[n] == +t) {
                        b.Gb[l] = 1;
                        break;
                    }
                    if ((b.fb[n] && b.c[n] == -t) || (b.fb[n] && b.f[n] == +t)) {
                        b.Gb[l] = 1;
                        break;
                    }
                    (0 == b.ac[n] && 0 == b.Bb[n] && b.c[n] == b.f[n]) || m++;
                }
                0 == m && (b.Gb[l] = 1);
            }
    })(a, d);
    return d;
}
function Gf(a, b) {
    function c(a, b, c, d, e, f, g) {
        function k(a, b, c, d, e, f, g) {
            var h;
            h = c;
            for (c = 1; c <= a; c++) (g[c] = b[c] / f), e[c] && (g[c] = -g[c]), (h -= b[c] * d[c]);
            b = h / f;
            var l;
            if (0.01 > Math.abs(b - Math.floor(b + 0.5))) b = 1;
            else {
                h = b - Math.floor(b);
                for (c = 1; c <= a; c++)
                    (l = g[c] - Math.floor(g[c]) - h),
                        (g[c] = 0 >= l ? Math.floor(g[c]) : Math.floor(g[c]) + l / (1 - h));
                q = Math.floor(b);
                r = 1 / (1 - h);
                b = 0;
            }
            if (b) return 1;
            for (c = 1; c <= a; c++) e[c] && ((g[c] = -g[c]), (q += g[c] * d[c]));
            r /= f;
            return 0;
        }
        var h, l, m, p, n;
        m = Array(4);
        var u, v, B, H;
        B = new Int8Array(1 + a);
        H = Array(1 + a);
        for (l = 1; l <= a; l++) B[l] = e[l] >= 0.5 * d[l];
        v = n = 0;
        for (l = 1; l <= a; l++)
            if (
                ((h = 1e-9 * (1 + Math.abs(d[l]))),
                    !(e[l] < h || e[l] > d[l] - h || ((h = k(a, b, c, d, B, Math.abs(b[l]), g)), h)))
            ) {
                u = -q - r * f;
                for (h = 1; h <= a; h++) u += g[h] * e[h];
                v < u && ((v = u), (n = Math.abs(b[l])));
            }
        0.001 > v && (v = 0);
        if (0 == v) return v;
        m[1] = n / 2;
        m[2] = n / 4;
        m[3] = n / 8;
        for (l = 1; 3 >= l; l++)
            if (((h = k(a, b, c, d, B, m[l], g)), !h)) {
                u = -q - r * f;
                for (h = 1; h <= a; h++) u += g[h] * e[h];
                v < u && ((v = u), (n = m[l]));
            }
        m = 0;
        for (l = 1; l <= a; l++)
            (h = 1e-9 * (1 + Math.abs(d[l]))),
                e[l] < h || e[l] > d[l] - h || (m++, (H[m].H = l), (H[m].tf = Math.abs(e[l] - 0.5 * d[l])));
        na(H, m, function (a, b) {
            return a.tf < b.tf ? -1 : a.tf > b.tf ? 1 : 0;
        });
        for (p = 1; p <= m; p++)
            if (((l = H[p].H), (B[l] = !B[l]), (h = k(a, b, c, d, B, n, g)), (B[l] = !B[l]), !h)) {
                u = -q - r * f;
                for (h = 1; h <= a; h++) u += g[h] * e[h];
                v < u && ((v = u), (B[l] = !B[l]));
            }
        h = k(a, b, c, d, B, n, g);
        return v;
    }
    function d(a, b, c) {
        var d = a.F;
        a = b.h;
        b.Gb[c] = 2;
        b.He = 1;
        b.Af[1] = c;
        dg(b.ab);
        cg(b.ab, c, 1);
        for (c = d.o[c].l; null != c; c = c.G) cg(b.ab, a + c.g.H, -c.j);
        b.zf = 0;
    }
    function e(a) {
        var b, c;
        for (b = 1; b <= a.ab.O; b++)
            (c = a.ab.ca[b]),
                0 == a.ac[c] && 0 == a.Bb[c] && a.c[c] == a.f[c] && ((a.zf -= a.ab.j[b] * a.c[c]), (a.ab.j[b] = 0));
        eg(a.ab, 2.220446049250313e-16);
    }
    function f(a) {
        var b, c, d, e;
        for (b = 1; b <= a.ab.O; b++)
            (c = a.ab.ca[b]),
                a.fb[c] ||
                ((d = a.ac[c]),
                    (e = 0 == d ? (a.c[c] == -t ? t : a.x[c] - a.c[c]) : a.x[c] - a.c[c] * a.x[d]),
                    (d = a.Bb[c]),
                    (d = 0 == d ? (a.Bb[c] == +t ? t : a.f[c] - a.x[c]) : a.f[c] * a.x[d] - a.x[c]),
                    (a.ob[c] = e <= d ? jg : kg));
    }
    function g(a) {
        var b, c, d, e;
        fg(a.sa, a.ab);
        a.tc = a.zf;
        for (b = a.sa.O; 1 <= b; b--)
            (d = a.sa.ca[b]),
                a.fb[d] ||
                (a.ob[d] == jg
                    ? ((e = a.ac[d]),
                        0 == e
                            ? (a.tc -= a.sa.j[b] * a.c[d])
                            : ((c = a.sa.Na[e]),
                                0 == c && (cg(a.sa, e, 1), (c = a.sa.Na[e]), (a.sa.j[c] = 0)),
                                (a.sa.j[c] += a.sa.j[b] * a.c[d])))
                    : a.ob[d] == kg &&
                    ((e = a.Bb[d]),
                        0 == e
                            ? (a.tc -= a.sa.j[b] * a.f[d])
                            : ((c = a.sa.Na[e]),
                                0 == c && (cg(a.sa, e, 1), (c = a.sa.Na[e]), (a.sa.j[c] = 0)),
                                (a.sa.j[c] += a.sa.j[b] * a.f[d])),
                        (a.sa.j[b] = -a.sa.j[b])));
        for (b = 1; b <= a.sa.O; b++)
            (d = a.sa.ca[b]),
                a.fb[d] &&
                (Math.abs(a.c[d]) <= Math.abs(a.f[d])
                    ? ((a.ob[d] = jg), (a.tc -= a.sa.j[b] * a.c[d]))
                    : ((a.ob[d] = kg), (a.tc -= a.sa.j[b] * a.f[d]), (a.sa.j[b] = -a.sa.j[b])));
    }
    function k(a) {
        var b = a.h,
            d = a.n,
            e,
            f,
            g,
            h,
            k,
            l,
            m;
        k = 0;
        fg(a.J, a.sa);
        a.Nb = a.tc;
        eg(a.J, 2.220446049250313e-16);
        for (e = 1; e <= a.J.O; e++) (f = a.J.ca[e]), !a.fb[f] && 0 < a.J.j[e] && (a.J.j[e] = 0);
        eg(a.J, 0);
        h = 0;
        for (e = 1; e <= a.J.O; e++)
            (f = a.J.ca[e]),
                a.fb[f] &&
                (h++,
                    (g = a.J.ca[h]),
                    (a.J.Na[f] = h),
                    (a.J.Na[g] = e),
                    (a.J.ca[h] = f),
                    (a.J.ca[e] = g),
                    (f = a.J.j[h]),
                    (a.J.j[h] = a.J.j[e]),
                    (a.J.j[e] = f));
        if (0 == h) return k;
        l = new Float64Array(1 + h);
        g = new Float64Array(1 + h);
        m = new Float64Array(1 + h);
        for (e = 1; e <= h; e++)
            (f = a.J.ca[e]),
                (l[e] = a.f[f] - a.c[f]),
                a.ob[f] == jg ? (g[e] = a.x[f] - a.c[f]) : a.ob[f] == kg && (g[e] = a.f[f] - a.x[f]),
                0 > g[e] && (g[e] = 0);
        k = 0;
        for (e = h + 1; e <= a.J.O; e++)
            (f = a.J.ca[e]),
                a.ob[f] == jg
                    ? ((g = a.ac[f]), (g = 0 == g ? a.x[f] - a.c[f] : a.x[f] - a.c[f] * a.x[g]))
                    : a.ob[f] == kg && ((g = a.Bb[f]), (g = 0 == g ? a.f[f] - a.x[f] : a.f[f] * a.x[g] - a.x[f])),
                0 > g && (g = 0),
                (k -= a.J.j[e] * g);
        k = c(h, a.J.j, a.Nb, l, g, k, m);
        if (0 == k) return k;
        for (e = 1; e <= h; e++) a.J.j[e] = m[e];
        for (e = h + 1; e <= a.J.O; e++) (f = a.J.ca[e]), f <= b + d && (a.J.j[e] *= 0);
        a.Nb = null;
        return k;
    }
    function h(a) {
        var b, c, d, e;
        for (b = 1; b <= a.J.O; b++)
            (d = a.J.ca[b]),
                a.fb[d] &&
                (a.ob[d] == jg
                    ? (a.Nb += a.J.j[b] * a.c[d])
                    : a.ob[d] == kg && ((a.Nb -= a.J.j[b] * a.f[d]), (a.J.j[b] = -a.J.j[b])));
        for (b = 1; b <= a.J.O; b++)
            (d = a.J.ca[b]),
                a.fb[d] ||
                (a.ob[d] == jg
                    ? ((e = a.ac[d]),
                        0 == e
                            ? (a.Nb += a.J.j[b] * a.c[d])
                            : ((c = a.J.Na[e]),
                                0 == c && (cg(a.J, e, 1), (c = a.J.Na[e]), (a.J.j[c] = 0)),
                                (a.J.j[c] -= a.J.j[b] * a.c[d])))
                    : a.ob[d] == kg &&
                    ((e = a.Bb[d]),
                        0 == e
                            ? (a.Nb -= a.J.j[b] * a.f[d])
                            : ((c = a.J.Na[e]),
                                0 == c && (cg(a.J, e, 1), (c = a.J.Na[e]), (a.J.j[c] = 0)),
                                (a.J.j[c] += a.J.j[b] * a.f[d])),
                        (a.J.j[b] = -a.J.j[b])));
    }
    function l(a, b) {
        var c = a.F,
            d = b.h,
            e,
            f,
            g,
            h;
        for (f = b.J.O; 1 <= f; f--)
            if (((e = b.J.ca[f]), !(e > d))) {
                for (e = c.o[e].l; null != e; e = e.G)
                    (g = d + e.g.H),
                        (h = b.J.Na[g]),
                        0 == h && (cg(b.J, g, 1), (h = b.J.Na[g]), (b.J.j[h] = 0)),
                        (b.J.j[h] += b.J.j[f] * e.j);
                b.J.j[f] = 0;
            }
        eg(b.J, 0);
    }
    function n(a, b) {
        var c = b.h,
            d = b.n,
            e,
            f,
            g = new Int32Array(1 + d),
            h = new Float64Array(1 + d);
        f = 0;
        for (d = b.J.O; 1 <= d; d--) (e = b.J.ca[d]), f++, (g[f] = e - c), (h[f] = b.J.j[d]);
        Id(a, Cf, f, g, h, Ta, b.Nb);
    }
    function m(a, b) {
        var c = a.F,
            d = b.h,
            e = b.n,
            f,
            g,
            h,
            k = 0,
            l = 0,
            m,
            p = 0;
        for (f = 1; f <= b.ab.O; f++)
            (g = b.ab.ca[f]),
                g <= d ||
                b.fb[g] ||
                0.001 > Math.abs(b.ab.j[f]) ||
                ((h = b.ac[g]),
                    (m = 0 == h ? (b.c[g] == -t ? t : b.x[g] - b.c[g]) : b.x[g] - b.c[g] * b.x[h]),
                    (h = b.Bb[g]),
                    (h = 0 == h ? (b.Bb[g] == +t ? t : b.f[g] - b.x[g]) : b.f[g] * b.x[h] - b.x[g]),
                    (m = m <= h ? m : h),
                    !(0.001 > m) && p < m && ((p = m), (k = g)));
        if (0 == k) return 1;
        for (g = 1; g <= d; g++)
            if (!b.Gb[g]) {
                for (f = c.o[g].l; null != f && f.g.H != k - d; f = f.G);
                if (null != f && 0.001 <= Math.abs(f.j)) break;
            }
        if (g > d) return 2;
        b.He++;
        b.Af[b.He] = g;
        b.Gb[g] = 2;
        e = bg(d + e);
        cg(e, g, 1);
        for (f = c.o[g].l; null != f; f = f.G) cg(e, d + f.g.H, -f.j);
        f = b.ab.Na[k];
        c = b.ab;
        d = -b.ab.j[f] / e.j[e.Na[k]];
        for (g = 1; g <= e.O; g++)
            (f = e.ca[g]),
                (p = void 0),
                (p = c.Na[f]),
                (p = 0 == p ? 0 : c.j[p]),
                (m = e.j[g]),
                cg(c, f, p + d * m);
        cg(b.ab, k, 0);
        return l;
    }
    var q,
        r,
        p = b.h,
        u = b.n,
        v,
        H,
        E;
    (function (a, b) {
        var c = a.F,
            d = b.h,
            e = b.n,
            f;
        for (f = 1; f <= d; f++) b.x[f] = c.o[f].w;
        for (f = d + 1; f <= d + e; f++) b.x[f] = c.g[f - d].w;
    })(a, b);
    ja(b.ob, 1, ig, p + u);
    for (v = 1; v <= p; v++)
        if (!b.Gb[v]) {
            for (d(a, b, v); ;) {
                e(b);
                if (gg) for (H = 1; H <= p + u; H++);
                f(b);
                g(b);
                E = k(b);
                0 < E && (h(b), l(a, b), n(a, b));
                for (var B = 1; B <= b.sa.O; B++) (H = b.sa.ca[B]), (b.ob[H] = ig);
                if (!(0 == E && b.He < hg && 0 == m(a, b))) break;
            }
            for (H = 1; H <= b.He; H++) (E = b.Af[H]), (b.Gb[E] = 0);
        }
}
function Rf(a) {
    function b(a, b) {
        var c;
        switch (pb(a, b) - Ka + ef) {
            case ef:
            case jf:
                c = -t;
                break;
            case gf:
            case lf:
            case af:
                c = If(a, b);
        }
        return c;
    }
    function c(a, b) {
        var c;
        switch (pb(a, b) - Ka + ef) {
            case ef:
            case gf:
                c = +t;
                break;
            case jf:
            case lf:
            case af:
                c = Hf(a, b);
        }
        return c;
    }
    function d(a, b) {
        var c;
        switch (sb(a, b) - Ka + ef) {
            case ef:
            case jf:
                c = -t;
                break;
            case gf:
            case lf:
            case af:
                c = Jf(a, b);
        }
        return c;
    }
    function e(a, b) {
        var c;
        switch (sb(a, b) - Ka + ef) {
            case ef:
            case gf:
                c = +t;
                break;
            case jf:
            case lf:
            case af:
                c = Mf(a, b);
        }
        return c;
    }
    function f(a, b) {
        return (Ic(a, b) == Ma ? Kf : Lf) == Lf && sb(a, b) - Ka + ef == lf && 0 == Jf(a, b) && 1 == Mf(a, b);
    }
    function g(a, b, c, f) {
        var g, h, k;
        k = 0;
        for (h = 1; h <= b; h++)
            if (((g = c[h]), 0 < f[h])) {
                g = d(a, g);
                if (g == -t) {
                    k = -t;
                    break;
                }
                k += f[h] * g;
            } else if (0 > f[h]) {
                g = e(a, g);
                if (g == +t) {
                    k = -t;
                    break;
                }
                k += f[h] * g;
            }
        return k;
    }
    function k(a, b, c, f) {
        var g, h, k;
        k = 0;
        for (h = 1; h <= b; h++)
            if (((g = c[h]), 0 < f[h])) {
                g = e(a, g);
                if (g == +t) {
                    k = +t;
                    break;
                }
                k += f[h] * g;
            } else if (0 > f[h]) {
                g = d(a, g);
                if (g == -t) {
                    k = +t;
                    break;
                }
                k += f[h] * g;
            }
        return k;
    }
    function h(a, b, c, d, e, f, g, h) {
        b != -t && g && (b -= a[f]);
        c != +t && g && (c -= a[f]);
        d != -t && (0 > a[f] && (d -= a[f]), 0 > a[h] && (d -= a[h]));
        e != +t && (0 < a[f] && (e -= a[f]), 0 < a[h] && (e -= a[h]));
        f = 0 < a[h] ? (b == -t || e == +t ? -t : (b - e) / a[h]) : c == +t || d == -t ? -t : (c - d) / a[h];
        if (0.001 < f) return 2;
        f = 0 < a[h] ? (c == +t || d == -t ? +t : (c - d) / a[h]) : b == -t || e == +t ? +t : (b - e) / a[h];
        return 0.999 > f ? 1 : 0;
    }
    var l = null,
        n,
        m,
        q,
        r,
        p,
        u,
        v,
        H,
        E,
        B,
        J,
        R,
        T,
        O,
        S,
        G;
    y("Creating the conflict graph...");
    n = kb(a);
    m = lb(a);
    q = 0;
    B = new Int32Array(1 + m);
    J = new Int32Array(1 + m);
    E = new Int32Array(1 + m);
    G = new Float64Array(1 + m);
    for (r = 1; r <= n; r++)
        if (((R = b(a, r)), (T = c(a, r)), R != -t || T != +t))
            if (((H = vb(a, r, E, G)), !(500 < H)))
                for (O = g(a, H, E, G), S = k(a, H, E, G), u = 1; u <= H; u++)
                    if (f(a, E[u]))
                        for (v = u + 1; v <= H; v++)
                            f(a, E[v]) &&
                                (h(G, R, T, O, S, u, 0, v) || h(G, R, T, O, S, u, 1, v)) &&
                                ((p = E[u]),
                                    0 == B[p] && (q++, (B[p] = q), (J[q] = p)),
                                    (p = E[v]),
                                    0 == B[p] && (q++, (B[p] = q), (J[q] = p)));
    if (0 == q || 4e3 < q) return y("The conflict graph is either empty or too big"), l;
    l = {};
    l.n = m;
    l.Eb = q;
    l.zg = 0;
    l.uf = B;
    l.de = J;
    H = q + q;
    H = ((H * (H - 1)) / 2 + 0) / 1;
    l.Jc = Array(H);
    for (p = 1; p <= q; p++) lg(l, +J[p], -J[p]);
    for (r = 1; r <= n; r++)
        if (((R = b(a, r)), (T = c(a, r)), R != -t || T != +t))
            if (((H = vb(a, r, E, G)), !(500 < H)))
                for (O = g(a, H, E, G), S = k(a, H, E, G), u = 1; u <= H; u++)
                    if (f(a, E[u]))
                        for (v = u + 1; v <= H; v++)
                            if (f(a, E[v])) {
                                switch (h(G, R, T, O, S, u, 0, v)) {
                                    case 1:
                                        lg(l, -E[u], +E[v]);
                                        break;
                                    case 2:
                                        lg(l, -E[u], -E[v]);
                                }
                                switch (h(G, R, T, O, S, u, 1, v)) {
                                    case 1:
                                        lg(l, +E[u], +E[v]);
                                        break;
                                    case 2:
                                        lg(l, +E[u], -E[v]);
                                }
                            }
    y("The conflict graph has 2*" + l.Eb + " vertices and " + l.zg + " edges");
    return l;
}
function lg(a, b, c) {
    var d;
    0 < b ? (b = a.uf[b]) : ((b = a.uf[-b]), (b += a.Eb));
    0 < c ? (c = a.uf[c]) : ((c = a.uf[-c]), (c += a.Eb));
    b < c && ((d = b), (b = c), (c = d));
    d = ((b - 1) * (b - 2)) / 2 + (c - 1);
    a.Jc[d / 1] |= 1 << (0 - (d % 1));
    a.zg++;
}
function Nf(a, b, c, d) {
    function e(a, b, c) {
        return b == c ? 0 : b > c ? f(a, (b * (b - 1)) / 2 + c) : f(a, (c * (c - 1)) / 2 + b);
    }
    function f(a, b) {
        return a.Jc[b / 1] & (1 << (0 - (b % 1)));
    }
    function g(a, b, c, d, f, h) {
        var k, l, m, p, n, q, r, ba;
        ba = new Int32Array(a.n);
        if (0 >= b) {
            if ((0 == b && ((a.set[d++] = c[0]), (f += h)), f > a.fd))
                for (a.fd = f, a.Yf = d, k = 0; k < d; k++) a.jh[k + 1] = a.set[k];
        } else
            for (k = b; 0 <= k && !(0 == d && k < b); k--) {
                m = c[k];
                if (0 < d && a.sg[m] <= a.fd - f) break;
                a.set[d] = m;
                p = f + a.Ic[m + 1];
                h -= a.Ic[m + 1];
                if (h <= a.fd - p) break;
                for (n = r = q = 0; r < c + k;)
                    (l = c[r]), r++, e(a, l, m) && ((ba[q] = l), q++, (n += a.Ic[l + 1]));
                n <= a.fd - p || g(a, q - 1, ba, d + 1, p, n);
            }
    }
    var k = lb(a),
        h,
        l,
        n,
        m = 0,
        q,
        r,
        p;
    n = new Int32Array(1 + 2 * b.Eb);
    q = new Int32Array(1 + 2 * b.Eb);
    p = new Float64Array(1 + k);
    for (l = 1; l <= b.Eb; l++)
        (h = b.de[l]),
            (h = Dc(a, h)),
            (h = (100 * h + 0.5) | 0),
            0 > h && (h = 0),
            100 < h && (h = 100),
            (n[l] = h),
            (n[b.Eb + l] = 100 - h);
    n = (function (a, b, c, d) {
        var f = {},
            h,
            k,
            l,
            m,
            p,
            n;
        f.n = a;
        f.Ic = b;
        f.Jc = c;
        f.fd = 0;
        f.Yf = 0;
        f.jh = d;
        f.sg = new Int32Array(f.n);
        f.set = new Int32Array(f.n);
        p = new Int32Array(f.n);
        n = new Int32Array(f.n);
        b = new Int32Array(f.n);
        c = la();
        for (a = 0; a < f.n; a++) for (h = n[a] = 0; h < f.n; h++) e(f, a, h) && (n[a] += f.Ic[h + 1]);
        for (a = 0; a < f.n; a++) p[a] = 0;
        for (a = f.n - 1; 0 <= a; a--) {
            m = l = -1;
            for (h = 0; h < f.n; h++)
                !p[h] &&
                    (f.Ic[h + 1] > l || (f.Ic[h + 1] == l && n[h] > m)) &&
                    ((l = f.Ic[h + 1]), (m = n[h]), (k = h));
            b[a] = k;
            p[k] = 1;
            for (h = 0; h < f.n; h++) !p[h] && h != k && e(f, k, h) && (n[h] -= f.Ic[k + 1]);
        }
        for (a = k = 0; a < f.n; a++)
            (k += f.Ic[b[a] + 1]),
                g(f, a, b, 0, 0, k),
                (f.sg[b[a]] = f.fd),
                4.999 <= ma(c) && (y("level = " + a + 1 + " (" + f.n + "); best = " + f.fd + ""), (c = la()));
        for (a = 1; a <= f.Yf; a++) d[a]++;
        return f.Yf;
    })(2 * b.Eb, n, b.Jc, q);
    r = 0;
    for (l = 1; l <= n; l++)
        (h = q[l]),
            h <= b.Eb
                ? ((h = b.de[h]), (h = Dc(a, h)), (r += h))
                : ((h = b.de[h - b.Eb]), (h = Dc(a, h)), (r += 1 - h));
    if (1.01 <= r) {
        for (l = a = 1; l <= n; l++)
            (h = q[l]), h <= b.Eb ? ((h = b.de[h]), (p[h] += 1)) : ((h = b.de[h - b.Eb]), --p[h], --a);
        for (h = 1; h <= k; h++) 0 != p[h] && (m++, (c[m] = h), (d[m] = p[h]));
        c[0] = 0;
        d[0] = a;
    }
    return m;
}
function ag(a, b) {
    var c;
    if (a.u.Lb == Zc) {
        var d, e;
        for (d = 1; d <= a.n && !a.$c[d]; d++);
        e = Dc(a.F, d);
        b(e - Math.floor(e) < Math.ceil(e) - e ? zf : Af);
        c = d;
    } else if (a.u.Lb == $c) {
        for (d = a.n; 1 <= d && !a.$c[d]; d--);
        e = Dc(a.F, d);
        b(e - Math.floor(e) < Math.ceil(e) - e ? zf : Af);
        c = d;
    } else if (a.u.Lb == ad) c = mg(a, b);
    else if (a.u.Lb == bd) {
        c = a.F;
        var f = c.h,
            g = c.n,
            k = a.$c,
            h,
            l,
            n,
            m,
            q,
            r,
            p,
            u,
            v,
            H,
            E,
            B,
            J,
            R;
        xc(c);
        p = new Int32Array(1 + g);
        R = new Float64Array(1 + g);
        l = 0;
        J = -1;
        for (h = 1; h <= g; h++)
            if (k[h]) {
                u = Dc(c, h);
                r = Bd(c, f + h, p, R);
                for (q = -1; 1 >= q; q += 2) {
                    n = Fd(c, r, p, R, q, 1e-9);
                    0 != n && (n = p[n]);
                    if (0 == n) n = a.F.dir == za ? +t : -t;
                    else {
                        for (m = 1; m <= r && p[m] != n; m++);
                        m = R[m];
                        v = (0 > q ? Math.floor(u) : Math.ceil(u)) - u;
                        v /= m;
                        n > f &&
                            Ic(c, n - f) != Ma &&
                            0.001 < Math.abs(v - Math.floor(v + 0.5)) &&
                            (v = 0 < v ? Math.ceil(v) : Math.floor(v));
                        n <= f ? ((m = zc(c, n)), (n = Bc(c, n))) : ((m = Cc(c, n - f)), (n = Ec(c, n - f)));
                        switch (a.F.dir) {
                            case za:
                                if ((m == M && 0 > n) || (m == P && 0 < n) || m == Ra) n = 0;
                                break;
                            case Ea:
                                if ((m == M && 0 < n) || (m == P && 0 > n) || m == Ra) n = 0;
                        }
                        n = n * v;
                    }
                    0 > q ? (e = n) : (H = n);
                }
                if (J < Math.abs(e) || J < Math.abs(H))
                    if (
                        ((l = h),
                            Math.abs(e) < Math.abs(H) ? ((d = zf), (J = Math.abs(H))) : ((d = Af), (J = Math.abs(e))),
                            (E = e),
                            (B = H),
                            J == t)
                    )
                        break;
            }
        J < 1e-6 * (1 + 0.001 * Math.abs(c.ea))
            ? (c = l = mg(a, b))
            : (a.u.s >= mc &&
                (y("branch_drtom: column " + l + " chosen to branch on"),
                    Math.abs(E) == t
                        ? y("branch_drtom: down-branch is infeasible")
                        : y("branch_drtom: down-branch bound is " + (yc(c) + E) + ""),
                    Math.abs(B) == t
                        ? y("branch_drtom: up-branch   is infeasible")
                        : y("branch_drtom: up-branch   bound is " + (yc(c) + B) + "")),
                b(d),
                (c = l));
    } else a.u.Lb == cd && (c = ng(a, b));
    return c;
}
function mg(a, b) {
    var c, d, e, f, g, k;
    d = 0;
    g = t;
    for (c = 1; c <= a.n; c++)
        a.$c[c] &&
            ((f = Dc(a.F, c)),
                (k = Math.floor(f) + 0.5),
                g > Math.abs(f - k) && ((d = c), (g = Math.abs(f - k)), (e = f < k ? zf : Af)));
    b(e);
    return d;
}
function og(a) {
    a = a.n;
    var b,
        c = {};
    c.wd = new Int32Array(1 + a);
    c.Sd = new Float64Array(1 + a);
    c.Hd = new Int32Array(1 + a);
    c.we = new Float64Array(1 + a);
    for (b = 1; b <= a; b++) (c.wd[b] = c.Hd[b] = 0), (c.Sd[b] = c.we[b] = 0);
    return c;
}
function Zf(a) {
    var b,
        c,
        d = a.Ed;
    null != a.R.V &&
        ((b = a.R.V.Sc),
            (c = a.F.g[b].w - a.R.V.pg),
            (a = a.F.ea - a.R.V.rc),
            (a = Math.abs(a / c)),
            0 > c ? (d.wd[b]++, (d.Sd[b] += a)) : (d.Hd[b]++, (d.we[b] += a)));
}
function ng(a, b) {
    function c(a, b, c) {
        var d, e;
        xc(a);
        d = Ba();
        hb(d, a, 0);
        Va(d, b, C, c, c);
        b = new kc();
        b.s = lc;
        b.hb = Ub;
        b.pc = 30;
        b.cb = 1e3;
        b.hb = Ub;
        b = sc(d, b);
        0 == b || b == pg
            ? tc(d) == jc
                ? (e = t)
                : uc(d) == ec
                    ? (a.dir == za ? (e = d.ea - a.ea) : a.dir == Ea && (e = a.ea - d.ea),
                        e < 1e-6 * (1 + 0.001 * Math.abs(a.ea)) && (e = 0))
                    : (e = 0)
            : (e = 0);
        return e;
    }
    function d(a, b, d) {
        var e = a.Ed,
            f;
        if (d == zf) {
            if (0 == e.wd[b]) {
                d = a.F.g[b].w;
                a = c(a.F, b, Math.floor(d));
                if (a == t) return (f = t);
                e.wd[b] = 1;
                e.Sd[b] = a / (d - Math.floor(d));
            }
            f = e.Sd[b] / e.wd[b];
        } else if (d == Af) {
            if (0 == e.Hd[b]) {
                d = a.F.g[b].w;
                a = c(a.F, b, Math.ceil(d));
                if (a == t) return (f = t);
                e.Hd[b] = 1;
                e.we[b] = a / (Math.ceil(d) - d);
            }
            f = e.we[b] / e.Hd[b];
        }
        return f;
    }
    function e(a) {
        var b = a.Ed,
            c,
            d = 0,
            e = 0;
        for (c = 1; c <= a.n; c++) Jd(a, c) && (d++, 0 < b.wd[c] && 0 < b.Hd[c] && e++);
        y("Pseudocosts initialized for " + e + " of " + d + " variables");
    }
    var f = la(),
        g,
        k,
        h,
        l,
        n,
        m,
        q;
    null == a.Ed && (a.Ed = og(a));
    k = 0;
    q = -1;
    for (g = 1; g <= a.n; g++)
        if (Jd(a, g)) {
            l = a.F.g[g].w;
            n = d(a, g, zf);
            if (n == t) return (k = g), (h = zf), b(h), k;
            m = n * (l - Math.floor(l));
            n = d(a, g, Af);
            if (n == t) return (k = g), (h = Af), b(h), k;
            l = n * (Math.ceil(l) - l);
            n = m > l ? m : l;
            q < n && ((q = n), (k = g), (h = m <= l ? zf : Af));
            a.u.s >= bb && 10 <= ma(f) && (e(a), (f = la()));
        }
    if (0 == q) return (k = mg(a, b));
    b(h);
    return k;
}
function Xf(a) {
    var b = a.F,
        c = b.n,
        d = null,
        e = null,
        f = null,
        g,
        k,
        h,
        l,
        n,
        m,
        q,
        r;
    for (l = 0; ;) {
        var p = null;
        switch (l) {
            case 0:
                xc(b);
                if (0 != a.R.level || 1 != a.R.ag) {
                    p = 5;
                    break;
                }
                q = 0;
                for (h = 1; h <= c; h++)
                    if (((g = b.g[h]), g.kind != Ma && g.type != C))
                        if (g.type == Q && 0 == g.c && 1 == g.f) q++;
                        else {
                            a.u.s >= Xb && y("FPUMP heuristic cannot be applied due to general integer variables");
                            p = 5;
                            break;
                        }
                if (null != p) break;
                if (0 == q) {
                    p = 5;
                    break;
                }
                a.u.s >= Xb && y("Applying FPUMP heuristic...");
                e = Array(1 + q);
                ka(e, 1, q);
                l = 0;
                for (h = 1; h <= c; h++) (g = b.g[h]), g.kind == Fc && g.type == Q && (e[++l].H = h);
                d = Ba();
            case 1:
                hb(d, b, cb);
                if (b.Da == ec) {
                    La(d, 1);
                    n = new Int32Array(1 + c);
                    m = new Float64Array(1 + c);
                    for (h = 1; h <= c; h++) (n[h] = h), (m[h] = b.g[h].B);
                    Ya(d, d.h, c, n, m);
                    n = 0.1 * b.ea + 0.9 * b.xa;
                    b.dir == za ? Ua(d, d.h, Ta, 0, n - b.la) : b.dir == Ea && Ua(d, d.h, Sa, n - b.la, 0);
                }
                m = 0;
                for (l = 1; l <= q; l++) e[l].x = -1;
            case 2:
                if ((m++, a.u.s >= Xb && y("Pass " + m + ""), (r = t), (n = 0), 1 < m)) {
                    null == f && (f = qg());
                    for (l = 1; l <= q; l++)
                        (h = e[l].H),
                            (g = d.g[h]),
                            (p = rg(f)),
                            0 > p && (p = 0),
                            (g = Math.abs(e[l].x - g.w)),
                            0.5 < g + p && (e[l].x = 1 - e[l].x);
                    p = 4;
                    break;
                }
            case 3:
                for (l = k = 1; l <= q; l++)
                    (g = d.g[e[l].H]), (g = 0.5 > g.w ? 0 : 1), e[l].x != g && ((k = 0), (e[l].x = g));
                if (k) {
                    for (l = 1; l <= q; l++) (g = d.g[e[l].H]), (e[l].d = Math.abs(g.w - e[l].x));
                    na(e, q, function (a, b) {
                        return a.d > b.d ? -1 : a.d < b.d ? 1 : 0;
                    });
                    for (l = 1; l <= q && !((5 <= l && 0.35 > e[l].d) || 10 <= l); l++) e[l].x = 1 - e[l].x;
                }
            case 4:
                if (2147483647 > a.u.ub && a.u.ub - 1 <= 1e3 * ma(a.ic)) {
                    p = 5;
                    break;
                }
                d.dir = za;
                d.la = 0;
                for (h = 1; h <= c; h++) d.g[h].B = 0;
                for (l = 1; l <= q; l++)
                    (h = e[l].H), 0 == e[l].x ? (d.g[h].B = 1) : ((d.g[h].B = -1), (d.la += 1));
                k = new kc();
                a.u.s <= Mb ? (k.s = a.u.s) : a.u.s <= Xb && ((k.s = fc), (k.cb = 1e4));
                l = sc(d, k);
                if (0 != l) {
                    a.u.s >= Mb && y("Warning: glp_simplex returned " + l + "");
                    p = 5;
                    break;
                }
                l = xc(d);
                if (l != vc) {
                    a.u.s >= Mb && y("Warning: glp_get_status returned " + l + "");
                    p = 5;
                    break;
                }
                a.u.s >= mc && y("delta = " + d.ea + "");
                h = 0.3 * a.u.Xb;
                for (l = 1; l <= q && !((g = d.g[e[l].H]), h < g.w && g.w < 1 - h); l++);
                if (l > q) {
                    g = new Float64Array(1 + c);
                    for (h = 1; h <= c; h++)
                        (g[h] = d.g[h].w), b.g[h].kind == Fc && (g[h] = Math.floor(g[h] + 0.5));
                    d.la = b.la;
                    d.dir = b.dir;
                    for (l = 1; l <= q; l++)
                        (d.g[e[l].H].c = g[e[l].H]), (d.g[e[l].H].f = g[e[l].H]), (d.g[e[l].H].type = C);
                    for (h = 1; h <= c; h++) d.g[h].B = b.g[h].B;
                    l = sc(d, k);
                    if (0 != l) {
                        a.u.s >= Mb && y("Warning: glp_simplex returned " + l + "");
                        p = 5;
                        break;
                    }
                    l = xc(d);
                    if (l != vc) {
                        a.u.s >= Mb && y("Warning: glp_get_status returned " + l + "");
                        p = 5;
                        break;
                    }
                    for (h = 1; h <= c; h++) b.g[h].kind != Fc && (g[h] = d.g[h].w);
                    l = Kd(a, g);
                    if (0 == l) {
                        p = tf(a, a.R.bound) ? 1 : 5;
                        break;
                    }
                }
                r == t || d.ea <= r - 1e-6 * (1 + r) ? ((n = 0), (r = d.ea)) : n++;
                if (3 > n) {
                    p = 3;
                    break;
                }
                5 > m && (p = 2);
        }
        if (null == p) break;
        l = p;
    }
}
function Yf(a) {
    function b(a, b, c) {
        var d,
            e = 0,
            f = 0,
            g = 0;
        for (d = a.l; null != d; d = d.next) (c[d.H] = d.j), (f += d.j * d.j);
        for (d = b.l; null != d; d = d.next) (e += c[d.H] * d.j), (g += d.j * d.j);
        for (d = a.l; null != d; d = d.next) c[d.H] = 0;
        a = Math.sqrt(f) * Math.sqrt(g);
        4.930380657631324e-32 > a && (a = 2.220446049250313e-16);
        return e / a;
    }
    var c, d, e, f, g, k, h, l, n, m;
    c = a.local;
    f = Array(1 + c.size);
    l = new Int32Array(1 + a.n);
    n = new Float64Array(1 + a.n);
    m = new Float64Array(1 + a.n);
    g = 0;
    for (d = c.head; null != d; d = d.next) g++, (f[g].Pe = d), (f[g].fa = 0);
    for (g = 1; g <= c.size; g++) {
        var q = null,
            r = null;
        d = f[g].Pe;
        k = h = 0;
        for (e = d.l; null != e; e = e.next) h++, (l[h] = e.H), (n[h] = e.j), (k += e.j * e.j);
        4.930380657631324e-32 > k && (k = 2.220446049250313e-16);
        h = Dd(a.F, h, l, n);
        d = Gd(a.F, h, l, n, d.type, d.Zf, function (a, b, c, d, e, f) {
            q = e;
            r = f;
        });
        0 == d
            ? ((f[g].Wc = Math.abs(q) / Math.sqrt(k)),
                a.F.dir == za ? (0 > r && (r = 0), (f[g].Cb = +r)) : (0 < r && (r = 0), (f[g].Cb = -r)))
            : 1 == d
                ? (f[g].Wc = f[g].Cb = 0)
                : 2 == d && ((f[g].Wc = 1), (f[g].Cb = t));
        0.01 > f[g].Cb && (f[g].Cb = 0);
    }
    na(f, c.size, function (a, b) {
        if (0 == a.Cb && 0 == b.Cb) {
            if (a.Wc > b.Wc) return -1;
            if (a.Wc < b.Wc) return 1;
        } else {
            if (a.Cb > b.Cb) return -1;
            if (a.Cb < b.Cb) return 1;
        }
        return 0;
    });
    k = 0 == a.R.level ? 90 : 10;
    k > c.size && (k = c.size);
    for (g = 1; g <= k; g++)
        if (!(0.01 > f[g].Cb && 0.01 > f[g].Wc)) {
            for (c = 1; c < g && !(f[c].fa && 0.9 < b(f[g].Pe, f[c].Pe, m)); c++);
            if (!(c < g)) {
                d = f[g].Pe;
                f[g].fa = 1;
                c = La(a.F, 1);
                null != d.name && Pa(a.F, c, d.name);
                a.F.o[c].qc = d.qc;
                h = 0;
                for (e = d.l; null != e; e = e.next) h++, (l[h] = e.H), (n[h] = e.j);
                Ya(a.F, c, h, l, n);
                Ua(a.F, c, d.type, d.Zf, d.Zf);
            }
        }
}
function Pf(a) {
    function b(a) {
        var b, c;
        b = 0;
        c = t;
        for (a = a.head; null != a; a = a.next) c > a.V.Yc && ((b = a.p), (c = a.V.Yc));
        return b;
    }
    function c(a) {
        var b, c, d, e, n;
        b = a.Ca[1].node;
        e = (a.F.xa - b.bound) / b.Yc;
        c = 0;
        d = t;
        for (b = a.head; null != b; b = b.next)
            (n = b.V.bound + e * b.V.Yc), a.F.dir == Ea && (n = -n), d > n && ((c = b.p), (d = n));
        return c;
    }
    function d(a) {
        var b,
            c = null,
            d,
            e;
        switch (a.F.dir) {
            case za:
                d = +t;
                for (b = a.head; null != b; b = b.next) d > b.bound && (d = b.bound);
                e = 0.001 * (1 + Math.abs(d));
                for (b = a.head; null != b; b = b.next)
                    b.bound <= d + e && (null == c || c.V.Yc > b.V.Yc) && (c = b);
                break;
            case Ea:
                d = -t;
                for (b = a.head; null != b; b = b.next) d < b.bound && (d = b.bound);
                e = 0.001 * (1 + Math.abs(d));
                for (b = a.head; null != b; b = b.next) b.bound >= d - e && (null == c || c.rc < b.rc) && (c = b);
        }
        return c.p;
    }
    var e;
    a.u.lc == dd
        ? (e = a.$a.p)
        : a.u.lc == ed
            ? (e = a.head.p)
            : a.u.lc == fd
                ? (e = d(a))
                : a.u.lc == gd && (e = a.F.Da == Aa ? b(a) : c(a));
    return e;
}
var qa = (window['__GLP'].GLP_MAJOR_VERSION = 4),
    ra = (window['__GLP'].GLP_MINOR_VERSION = 49),
    za = (window['__GLP'].GLP_MIN = 1),
    Ea = (window['__GLP'].GLP_MAX = 2),
    Ma = (window['__GLP'].GLP_CV = 1),
    Fc = (window['__GLP'].GLP_IV = 2),
    Gc = (window['__GLP'].GLP_BV = 3),
    Ka = (window['__GLP'].GLP_FR = 1),
    Sa = (window['__GLP'].GLP_LO = 2),
    Ta = (window['__GLP'].GLP_UP = 3),
    Q = (window['__GLP'].GLP_DB = 4),
    C = (window['__GLP'].GLP_FX = 5),
    A = (window['__GLP'].GLP_BS = 1),
    M = (window['__GLP'].GLP_NL = 2),
    P = (window['__GLP'].GLP_NU = 3),
    Ra = (window['__GLP'].GLP_NF = 4),
    Na = (window['__GLP'].GLP_NS = 5),
    Uc = (window['__GLP'].GLP_SF_GM = 1),
    Vc = (window['__GLP'].GLP_SF_EQ = 16),
    Wc = (window['__GLP'].GLP_SF_2N = 32),
    Xc = (window['__GLP'].GLP_SF_SKIP = 64),
    hc = (window['__GLP'].GLP_SF_AUTO = 128),
    $b = (window['__GLP'].GLP_SOL = 1),
    le = (window['__GLP'].GLP_IPT = 2),
    Sc = (window['__GLP'].GLP_MIP = 3),
    Aa = (window['__GLP'].GLP_UNDEF = 1),
    ec = (window['__GLP'].GLP_FEAS = 2),
    Ad = (window['__GLP'].GLP_INFEAS = 3),
    jc = (window['__GLP'].GLP_NOFEAS = 4),
    vc = (window['__GLP'].GLP_OPT = 5),
    wc = (window['__GLP'].GLP_UNBND = 6),
    md = (window['__GLP'].GLP_BF_FT = 1),
    rd = (window['__GLP'].GLP_BF_BG = 2),
    sd = (window['__GLP'].GLP_BF_GR = 3),
    lc = (window['__GLP'].GLP_MSG_OFF = 0),
    Mb = (window['__GLP'].GLP_MSG_ERR = 1),
    fc = (window['__GLP'].GLP_MSG_ON = 2),
    Xb = (window['__GLP'].GLP_MSG_ALL = 3),
    mc = (window['__GLP'].GLP_MSG_DBG = 4),
    Pb = (window['__GLP'].GLP_PRIMAL = 1),
    Rb = (window['__GLP'].GLP_DUALP = 2),
    Ub = (window['__GLP'].GLP_DUAL = 3),
    nc = (window['__GLP'].GLP_PT_STD = 17),
    oc = (window['__GLP'].GLP_PT_PSE = 34),
    pc = (window['__GLP'].GLP_RT_STD = 17),
    qc = (window['__GLP'].GLP_RT_HAR = 34);
window['__GLP'].GLP_ORD_NONE = 0;
window['__GLP'].GLP_ORD_QMD = 1;
window['__GLP'].GLP_ORD_AMD = 2;
window['__GLP'].GLP_ORD_SYMAMD = 3;
var Zc = (window['__GLP'].GLP_BR_FFV = 1),
    $c = (window['__GLP'].GLP_BR_LFV = 2),
    ad = (window['__GLP'].GLP_BR_MFV = 3),
    bd = (window['__GLP'].GLP_BR_DTH = 4),
    cd = (window['__GLP'].GLP_BR_PCH = 5),
    dd = (window['__GLP'].GLP_BT_DFS = 1),
    ed = (window['__GLP'].GLP_BT_BFS = 2),
    fd = (window['__GLP'].GLP_BT_BLB = 3),
    gd = (window['__GLP'].GLP_BT_BPH = 4),
    hd = (window['__GLP'].GLP_PP_NONE = 0),
    id = (window['__GLP'].GLP_PP_ROOT = 1),
    jd = (window['__GLP'].GLP_PP_ALL = 2);
window['__GLP'].GLP_RF_REG = 0;
var Ha = (window['__GLP'].GLP_RF_LAZY = 1),
    Ja = (window['__GLP'].GLP_RF_CUT = 2),
    Bf = (window['__GLP'].GLP_RF_GMI = 1),
    Cf = (window['__GLP'].GLP_RF_MIR = 2),
    Df = (window['__GLP'].GLP_RF_COV = 3),
    Ef = (window['__GLP'].GLP_RF_CLQ = 4),
    bb = (window['__GLP'].GLP_ON = 1),
    cb = (window['__GLP'].GLP_OFF = 0),
    Ga = (window['__GLP'].GLP_IROWGEN = 1),
    Vf = (window['__GLP'].GLP_IBINGO = 2),
    Wf = (window['__GLP'].GLP_IHEUR = 3),
    Ia = (window['__GLP'].GLP_ICUTGEN = 4),
    $f = (window['__GLP'].GLP_IBRANCH = 5),
    Of = (window['__GLP'].GLP_ISELECT = 6),
    Sf = (window['__GLP'].GLP_IPREPRO = 7),
    yf = (window['__GLP'].GLP_NO_BRNCH = 0),
    zf = (window['__GLP'].GLP_DN_BRNCH = 1),
    Af = (window['__GLP'].GLP_UP_BRNCH = 2),
    Kb = (window['__GLP'].GLP_EBADB = 1),
    Nb = (window['__GLP'].GLP_ESING = 2),
    Ob = (window['__GLP'].GLP_ECOND = 3),
    rc = (window['__GLP'].GLP_EBOUND = 4),
    Tb = (window['__GLP'].GLP_EFAIL = 5),
    Tf = (window['__GLP'].GLP_EOBJLL = 6),
    Uf = (window['__GLP'].GLP_EOBJUL = 7),
    pg = (window['__GLP'].GLP_EITLIM = 8),
    Qc = (window['__GLP'].GLP_ETMLIM = 9),
    bc = (window['__GLP'].GLP_ENOPFS = 10),
    cc = (window['__GLP'].GLP_ENODFS = 11),
    Lc = (window['__GLP'].GLP_EROOT = 12),
    Rc = (window['__GLP'].GLP_ESTOP = 13),
    Pc = (window['__GLP'].GLP_EMIPGAP = 14);
window['__GLP'].GLP_ENOFEAS = 15;
window['__GLP'].GLP_ENOCVG = 16;
window['__GLP'].GLP_EINSTAB = 17;
window['__GLP'].GLP_EDATA = 18;
window['__GLP'].GLP_ERANGE = 19;
window['__GLP'].GLP_KKT_PE = 1;
window['__GLP'].GLP_KKT_PB = 2;
window['__GLP'].GLP_KKT_DE = 3;
window['__GLP'].GLP_KKT_DB = 4;
window['__GLP'].GLP_KKT_CS = 5;
window['__GLP'].GLP_MPS_DECK = 1;
window['__GLP'].GLP_MPS_FILE = 2;
window['__GLP'].GLP_ASN_MIN = 1;
window['__GLP'].GLP_ASN_MAX = 2;
window['__GLP'].GLP_ASN_MMP = 3;
function sg(a) {
    var b = Math.floor(Math.log(a) / Math.log(2)) + 1;
    return Math.pow(2, 0.75 >= a / Math.pow(2, b) ? b - 1 : b);
}
function tg(a, b) {
    var c = Number(a);
    if (isNaN(c)) return 2;
    switch (c) {
        case Number.POSITIVE_INFINITY:
        case Number.NEGATIVE_INFINITY:
            return 1;
        default:
            return b(c), 0;
    }
}
function ug(a, b) {
    var c = Number(a);
    if (isNaN(c)) return 2;
    switch (c) {
        case Number.POSITIVE_INFINITY:
        case Number.NEGATIVE_INFINITY:
            return 1;
        default:
            return 0 == c % 1 ? (b(c), 0) : 2;
    }
}
function vg(a, b, c) {
    var d, e;
    if (!(1 <= a && 31 >= a && 1 <= b && 12 >= b && 1 <= c && 4e3 >= c)) return -1;
    3 <= b ? (b -= 3) : ((b += 9), c--);
    d = (c / 100) | 0;
    c = (((146097 * d) / 4) | 0) + (((1461 * (c - 100 * d)) / 4) | 0);
    c += ((153 * b + 2) / 5) | 0;
    c += a + 1721119;
    wg(c, function (a) {
        e = a;
    });
    a != e && (c = -1);
    return c;
}
function wg(a, b) {
    var c, d, e;
    1721426 <= a &&
        3182395 >= a &&
        ((a -= 1721119),
            (e = ((4 * a - 1) / 146097) | 0),
            (c = (((4 * a - 1) % 146097) / 4) | 0),
            (a = ((4 * c + 3) / 1461) | 0),
            (c = ((((4 * c + 3) % 1461) + 4) / 4) | 0),
            (d = ((5 * c - 3) / 153) | 0),
            (c = (5 * c - 3) % 153),
            (c = ((c + 5) / 5) | 0),
            (e = 100 * e + a),
            9 >= d ? (d += 3) : ((d -= 9), e++),
            b(c, d, e));
}
var Ee = 1;
LPF_ECOND = 2;
LPF_ELIMIT = 3;
var we = 0;
function Le(a, b, c, d) {
    var e = a.n,
        f = a.Ld,
        g = a.Kd,
        k = a.Zb;
    a = a.$b;
    var h, l, n, m;
    for (h = 1; h <= e; h++) {
        m = 0;
        l = f[h];
        for (n = l + g[h]; l < n; l++) m += a[l] * d[k[l]];
        b[h + c] += -1 * m;
    }
}
function Je(a, b, c, d) {
    var e = a.n,
        f = a.Nd,
        g = a.Md,
        k = a.Zb;
    a = a.$b;
    var h, l, n, m;
    for (h = 1; h <= e; h++) {
        m = 0;
        l = f[h];
        for (n = l + g[h]; l < n; l++) m += a[l] * d[k[l]];
        b[h + c] += -1 * m;
    }
}
if (we)
    var check_error = function (a, b, c, d) {
        var e = a.h;
        a = a.yf;
        var f,
            g,
            k = 0,
            h,
            l,
            n;
        for (f = 1; f <= e; f++) {
            h = 0;
            for (g = n = 1; g <= e; g++)
                (l = b ? a[e * (g - 1) + f] * c[g] : a[e * (f - 1) + g] * c[g]),
                    n < Math.abs(l) && (n = Math.abs(l)),
                    (h += l);
            g = Math.abs(h - d[f]) / n;
            k < g && (k = g);
        }
        1e-8 < k && y((b ? "lpf_btran" : "lpf_ftran") + ": dmax = " + k + "; relative error too large");
    };
window['__GLP'].LPX_LP = 100;
window['__GLP'].LPX_MIP = 101;
var ef = (window['__GLP'].LPX_FR = 110),
    gf = (window['__GLP'].LPX_LO = 111),
    jf = (window['__GLP'].LPX_UP = 112),
    lf = (window['__GLP'].LPX_DB = 113),
    af = (window['__GLP'].LPX_FX = 114);
window['__GLP'].LPX_MIN = 120;
window['__GLP'].LPX_MAX = 121;
window['__GLP'].LPX_P_UNDEF = 132;
window['__GLP'].LPX_P_FEAS = 133;
window['__GLP'].LPX_P_INFEAS = 134;
window['__GLP'].LPX_P_NOFEAS = 135;
window['__GLP'].LPX_D_UNDEF = 136;
window['__GLP'].LPX_D_FEAS = 137;
window['__GLP'].LPX_D_INFEAS = 138;
window['__GLP'].LPX_D_NOFEAS = 139;
var df = (window['__GLP'].LPX_BS = 140),
    hf = (window['__GLP'].LPX_NL = 141),
    kf = (window['__GLP'].LPX_NU = 142),
    ff = (window['__GLP'].LPX_NF = 143),
    mf = (window['__GLP'].LPX_NS = 144);
window['__GLP'].LPX_T_UNDEF = 150;
window['__GLP'].LPX_T_OPT = 151;
var Kf = (window['__GLP'].LPX_CV = 160),
    Lf = (window['__GLP'].LPX_IV = 161);
window['__GLP'].LPX_I_UNDEF = 170;
window['__GLP'].LPX_I_OPT = 171;
window['__GLP'].LPX_I_FEAS = 172;
window['__GLP'].LPX_I_NOFEAS = 173;
window['__GLP'].LPX_OPT = 180;
window['__GLP'].LPX_FEAS = 181;
window['__GLP'].LPX_INFEAS = 182;
window['__GLP'].LPX_NOFEAS = 183;
window['__GLP'].LPX_UNBND = 184;
window['__GLP'].LPX_UNDEF = 185;
window['__GLP'].LPX_E_OK = 200;
window['__GLP'].LPX_E_EMPTY = 201;
window['__GLP'].LPX_E_BADB = 202;
window['__GLP'].LPX_E_INFEAS = 203;
window['__GLP'].LPX_E_FAULT = 204;
window['__GLP'].LPX_E_OBJLL = 205;
window['__GLP'].LPX_E_OBJUL = 206;
window['__GLP'].LPX_E_ITLIM = 207;
window['__GLP'].LPX_E_TMLIM = 208;
window['__GLP'].LPX_E_NOFEAS = 209;
window['__GLP'].LPX_E_INSTAB = 210;
window['__GLP'].LPX_E_SING = 211;
window['__GLP'].LPX_E_NOCONV = 212;
window['__GLP'].LPX_E_NOPFS = 213;
window['__GLP'].LPX_E_NODFS = 214;
window['__GLP'].LPX_E_MIPGAP = 215;
var xg = (window['__GLP'].LPX_K_MSGLEV = 300),
    yg = (window['__GLP'].LPX_K_SCALE = 301),
    zg = (window['__GLP'].LPX_K_DUAL = 302),
    Ag = (window['__GLP'].LPX_K_PRICE = 303);
window['__GLP'].LPX_K_RELAX = 304;
window['__GLP'].LPX_K_TOLBND = 305;
window['__GLP'].LPX_K_TOLDJ = 306;
window['__GLP'].LPX_K_TOLPIV = 307;
var Bg = (window['__GLP'].LPX_K_ROUND = 308);
window['__GLP'].LPX_K_OBJLL = 309;
window['__GLP'].LPX_K_OBJUL = 310;
var Cg = (window['__GLP'].LPX_K_ITLIM = 311),
    Dg = (window['__GLP'].LPX_K_ITCNT = 312);
window['__GLP'].LPX_K_TMLIM = 313;
var Eg = (window['__GLP'].LPX_K_OUTFRQ = 314);
window['__GLP'].LPX_K_OUTDLY = 315;
var Fg = (window['__GLP'].LPX_K_BRANCH = 316),
    Gg = (window['__GLP'].LPX_K_BTRACK = 317);
window['__GLP'].LPX_K_TOLINT = 318;
window['__GLP'].LPX_K_TOLOBJ = 319;
var Hg = (window['__GLP'].LPX_K_MPSINFO = 320),
    Ig = (window['__GLP'].LPX_K_MPSOBJ = 321),
    Jg = (window['__GLP'].LPX_K_MPSORIG = 322),
    Kg = (window['__GLP'].LPX_K_MPSWIDE = 323),
    Lg = (window['__GLP'].LPX_K_MPSFREE = 324),
    Mg = (window['__GLP'].LPX_K_MPSSKIP = 325),
    Ng = (window['__GLP'].LPX_K_LPTORIG = 326),
    Og = (window['__GLP'].LPX_K_PRESOL = 327),
    Pg = (window['__GLP'].LPX_K_BINARIZE = 328),
    Qg = (window['__GLP'].LPX_K_USECUTS = 329),
    Rg = (window['__GLP'].LPX_K_BFTYPE = 330);
window['__GLP'].LPX_K_MIPGAP = 331;
window['__GLP'].LPX_C_COVER = 1;
window['__GLP'].LPX_C_CLIQUE = 2;
window['__GLP'].LPX_C_GOMORY = 4;
window['__GLP'].LPX_C_MIR = 8;
window['__GLP'].LPX_C_ALL = 255;
function If(a, b) {
    var c = qb(a, b);
    c == -t && (c = 0);
    return c;
}
function Hf(a, b) {
    var c = rb(a, b);
    c == +t && (c = 0);
    return c;
}
function bf(a, b, c) {
    c(pb(a, b) - Ka + ef, If(a, b), Hf(a, b));
}
function Jf(a, b) {
    var c = tb(a, b);
    c == -t && (c = 0);
    return c;
}
function Mf(a, b) {
    var c = ub(a, b);
    c == +t && (c = 0);
    return c;
}
function $e(a, b, c) {
    c(sb(a, b) - Ka + ef, Jf(a, b), Mf(a, b));
}
function cf(a) {
    var b = xg,
        c;
    null == a.ie &&
        ((a.ie = {}),
            (c = a.ie),
            (c.s = 3),
            (c.scale = 1),
            (c.M = 0),
            (c.hh = 1),
            (c.th = 0.07),
            (c.Ib = 1e-7),
            (c.vb = 1e-7),
            (c.ve = 1e-9),
            (c.round = 0),
            (c.ef = -t),
            (c.ff = +t),
            (c.pc = -1),
            (c.ub = -1),
            (c.dc = 200),
            (c.cb = 0),
            (c.Jg = 2),
            (c.Kg = 3),
            (c.Xb = 1e-5),
            (c.ue = 1e-7),
            (c.Sg = 1),
            (c.Tg = 2),
            (c.Ug = 0),
            (c.Wg = 1),
            (c.Rg = 0),
            (c.Vg = 0),
            (c.Qg = 0),
            (c.gh = 0),
            (c.qd = 0),
            (c.rh = 0),
            (c.ae = 0));
    c = a.ie;
    var d = 0;
    switch (b) {
        case xg:
            d = c.s;
            break;
        case yg:
            d = c.scale;
            break;
        case zg:
            d = c.M;
            break;
        case Ag:
            d = c.hh;
            break;
        case Bg:
            d = c.round;
            break;
        case Cg:
            d = c.pc;
            break;
        case Dg:
            d = a.da;
            break;
        case Eg:
            d = c.dc;
            break;
        case Fg:
            d = c.Jg;
            break;
        case Gg:
            d = c.Kg;
            break;
        case Hg:
            d = c.Sg;
            break;
        case Ig:
            d = c.Tg;
            break;
        case Jg:
            d = c.Ug;
            break;
        case Kg:
            d = c.Wg;
            break;
        case Lg:
            d = c.Rg;
            break;
        case Mg:
            d = c.Vg;
            break;
        case Ng:
            d = c.Qg;
            break;
        case Og:
            d = c.gh;
            break;
        case Pg:
            d = c.qd;
            break;
        case Qg:
            d = c.rh;
            break;
        case Rg:
            b = {};
            eb(a, b);
            switch (b.type) {
                case md:
                    d = 1;
                    break;
                case rd:
                    d = 2;
                    break;
                case sd:
                    d = 3;
            }
            break;
        default:
            x("lpx_get_int_parm: parm = " + b + "; invalid parameter");
    }
    return d;
}
var ye = 1,
    Ae = 2;
function ve() {
    var a = {};
    a.N = a.n = 0;
    a.valid = 0;
    a.Nf = a.We = null;
    a.Wd = a.Vd = null;
    a.Fc = a.Ec = a.nd = null;
    a.wf = null;
    a.Dc = a.Cc = a.Qc = null;
    a.nb = a.xb = null;
    a.of = a.ke = null;
    a.Ka = 0;
    a.Ja = a.Pa = 0;
    a.yb = null;
    a.zb = null;
    a.kd = a.Vb = 0;
    a.Gd = a.ld = null;
    a.vf = null;
    a.rf = a.$f = a.sf = null;
    a.Me = a.Oe = a.Ne = null;
    a.fa = null;
    a.xe = null;
    a.Ya = 0;
    a.ec = 0.1;
    a.xc = 4;
    a.hc = 1;
    a.Ob = 1e-15;
    a.sc = 1e10;
    a.Yg = a.Wf = a.Sb = 0;
    a.yg = a.pd = 0;
    a.ta = 0;
    return a;
}
function Ze(a) {
    var b = a.n,
        c = a.Fc,
        d = a.Ec,
        e = a.nd,
        f = a.Dc,
        g = a.Cc,
        k = a.Qc,
        h = a.yb,
        l = a.zb,
        n = a.ld,
        m = 1,
        q,
        r;
    for (r = a.kd; 0 != r; r = n[r])
        if (r <= b) {
            q = r;
            if (c[q] != m) break;
            e[q] = d[q];
            m += e[q];
        } else {
            q = r - b;
            if (f[q] != m) break;
            k[q] = g[q];
            m += k[q];
        }
    for (; 0 != r; r = n[r])
        r <= b
            ? ((q = r), ha(h, m, h, c[q], d[q]), ha(l, m, l, c[q], d[q]), (c[q] = m), (e[q] = d[q]), (m += e[q]))
            : ((q = r - b),
                ha(h, m, h, f[q], g[q]),
                ha(l, m, l, f[q], g[q]),
                (f[q] = m),
                (k[q] = g[q]),
                (m += k[q]));
    a.Ja = m;
}
function Xe(a, b, c) {
    var d = a.n,
        e = a.Fc,
        f = a.Ec,
        g = a.nd,
        k = a.Qc,
        h = a.yb,
        l = a.zb,
        n = a.Gd,
        m = a.ld,
        q = 0,
        r;
    if (a.Pa - a.Ja < c && (Ze(a), a.Pa - a.Ja < c)) return 1;
    r = g[b];
    ha(h, a.Ja, h, e[b], f[b]);
    ha(l, a.Ja, l, e[b], f[b]);
    e[b] = a.Ja;
    g[b] = c;
    a.Ja += c;
    0 == n[b] ? (a.kd = m[b]) : ((c = n[b]), c <= d ? (g[c] += r) : (k[c - d] += r), (m[n[b]] = m[b]));
    0 == m[b] ? (a.Vb = n[b]) : (n[m[b]] = n[b]);
    n[b] = a.Vb;
    m[b] = 0;
    0 == n[b] ? (a.kd = b) : (m[n[b]] = b);
    a.Vb = b;
    return q;
}
function Ye(a, b, c) {
    var d = a.n,
        e = a.nd,
        f = a.Dc,
        g = a.Cc,
        k = a.Qc,
        h = a.yb,
        l = a.zb,
        n = a.Gd,
        m = a.ld,
        q = 0,
        r;
    if (a.Pa - a.Ja < c && (Ze(a), a.Pa - a.Ja < c)) return 1;
    r = k[b];
    ha(h, a.Ja, h, f[b], g[b]);
    ha(l, a.Ja, l, f[b], g[b]);
    f[b] = a.Ja;
    k[b] = c;
    a.Ja += c;
    b = d + b;
    0 == n[b] ? (a.kd = m[b]) : ((c = n[b]), c <= d ? (e[c] += r) : (k[c - d] += r), (m[n[b]] = m[b]));
    0 == m[b] ? (a.Vb = n[b]) : (n[m[b]] = n[b]);
    n[b] = a.Vb;
    m[b] = 0;
    0 == n[b] ? (a.kd = b) : (m[n[b]] = b);
    a.Vb = b;
    return q;
}
function Sg(a, b) {
    var c = a.N;
    a.n = b;
    b <= c ||
        ((a.N = c = b + 100),
            (a.Nf = new Int32Array(1 + c)),
            (a.We = new Int32Array(1 + c)),
            (a.Wd = new Int32Array(1 + c)),
            (a.Vd = new Int32Array(1 + c)),
            (a.Fc = new Int32Array(1 + c)),
            (a.Ec = new Int32Array(1 + c)),
            (a.nd = new Int32Array(1 + c)),
            (a.wf = new Float64Array(1 + c)),
            (a.Dc = new Int32Array(1 + c)),
            (a.Cc = new Int32Array(1 + c)),
            (a.Qc = new Int32Array(1 + c)),
            (a.nb = new Int32Array(1 + c)),
            (a.xb = new Int32Array(1 + c)),
            (a.of = new Int32Array(1 + c)),
            (a.ke = new Int32Array(1 + c)),
            (a.Gd = new Int32Array(1 + c + c)),
            (a.ld = new Int32Array(1 + c + c)),
            (a.vf = new Float64Array(1 + c)),
            (a.rf = new Int32Array(1 + c)),
            (a.$f = new Int32Array(1 + c)),
            (a.sf = new Int32Array(1 + c)),
            (a.Me = new Int32Array(1 + c)),
            (a.Oe = new Int32Array(1 + c)),
            (a.Ne = new Int32Array(1 + c)),
            (a.fa = new Int32Array(1 + c)),
            (a.xe = new Float64Array(1 + c)));
}
function Tg(a, b, c) {
    var d = a.n,
        e = a.Wd,
        f = a.Vd,
        g = a.Fc,
        k = a.Ec,
        h = a.nd,
        l = a.Dc,
        n = a.Cc,
        m = a.Qc,
        q = a.nb,
        r = a.xb,
        p = a.of,
        u = a.ke,
        v = a.yb,
        H = a.zb,
        E = a.Gd,
        B = a.ld,
        J = a.vf,
        R = a.rf,
        T = a.$f,
        O = a.sf,
        S = a.Me,
        G = a.Oe,
        Z = a.Ne,
        Y = a.fa,
        ba = a.xe,
        oa = 0,
        z,
        F,
        D,
        w,
        ca,
        L,
        K;
    w = 1;
    ca = a.Ka + 1;
    for (F = 1; F <= d; F++) (e[F] = ca), (f[F] = 0);
    for (z = 1; z <= d; z++) (k[z] = h[z] = 0), (Y[z] = 0);
    f = e = 0;
    for (F = 1; F <= d; F++) {
        var aa = q,
            N = ba;
        D = b(c, F, aa, N);
        (0 <= D && D <= d) || x("luf_factorize: j = " + F + "; len = " + D + "; invalid column length");
        if (ca - w < D) return (oa = 1);
        l[F] = w;
        n[F] = m[F] = D;
        e += D;
        for (L = 1; L <= D; L++)
            (z = aa[L]),
                (K = N[L]),
                (1 <= z && z <= d) || x("luf_factorize: i = " + z + "; j = " + F + "; invalid row index"),
                Y[z] && x("luf_factorize: i = " + z + "; j = " + F + "; duplicate element not allowed"),
                0 == K && x("luf_factorize: i = " + z + "; j = " + F + "; zero element not allowed"),
                (v[w] = z),
                (H[w] = K),
                w++,
                0 > K && (K = -K),
                f < K && (f = K),
                (Y[z] = 1),
                h[z]++;
        for (L = 1; L <= D; L++) Y[aa[L]] = 0;
    }
    for (z = 1; z <= d; z++) {
        D = h[z];
        if (ca - w < D) return (oa = 1);
        g[z] = w;
        w += D;
    }
    for (F = 1; F <= d; F++)
        for (z = l[F], b = z + n[F] - 1, h = z; h <= b; h++)
            (z = v[h]), (K = H[h]), (c = g[z] + k[z]), (v[c] = F), (H[c] = K), k[z]++;
    for (h = 1; h <= d; h++) q[h] = r[h] = p[h] = u[h] = h;
    a.Ja = w;
    a.Pa = ca;
    a.kd = d + 1;
    a.Vb = d;
    for (z = 1; z <= d; z++) (E[z] = z - 1), (B[z] = z + 1);
    E[1] = d + d;
    B[d] = 0;
    for (F = 1; F <= d; F++) (E[d + F] = d + F - 1), (B[d + F] = d + F + 1);
    E[d + 1] = 0;
    for (h = B[d + d] = 1; h <= d; h++) (Y[h] = 0), (ba[h] = 0);
    a.Yg = e;
    a.Wf = 0;
    a.Sb = e;
    a.yg = f;
    a.pd = f;
    a.ta = -1;
    for (z = 1; z <= d; z++) J[z] = -1;
    for (D = 0; D <= d; D++) R[D] = 0;
    for (z = 1; z <= d; z++) (D = k[z]), (T[z] = 0), (O[z] = R[D]), 0 != O[z] && (T[O[z]] = z), (R[D] = z);
    for (D = 0; D <= d; D++) S[D] = 0;
    for (F = 1; F <= d; F++) (D = n[F]), (G[F] = 0), (Z[F] = S[D]), 0 != Z[F] && (G[Z[F]] = F), (S[D] = F);
    return oa;
}
function Ug(a, b) {
    function c() {
        b(B, J);
        return 0 == B;
    }
    var d = a.n,
        e = a.Fc,
        f = a.Ec,
        g = a.Dc,
        k = a.Cc,
        h = a.yb,
        l = a.zb,
        n = a.vf,
        m = a.rf,
        q = a.sf,
        r = a.Me,
        p = a.Oe,
        u = a.Ne,
        v = a.ec,
        H = a.xc,
        E = a.hc,
        B,
        J,
        R,
        T,
        O,
        S,
        G,
        Z,
        Y,
        ba,
        oa,
        z,
        F,
        D,
        w,
        ca,
        L,
        K;
    B = J = 0;
    ca = t;
    oa = 0;
    Z = r[1];
    if (0 != Z) return (B = h[g[Z]]), (J = Z), c();
    T = m[1];
    if (0 != T) return (B = T), (J = h[e[T]]), c();
    for (R = 2; R <= d; R++) {
        for (Z = r[R]; 0 != Z; Z = z) {
            T = g[Z];
            Y = T + k[Z] - 1;
            z = u[Z];
            F = D = 0;
            w = 2147483647;
            for (ba = T; ba <= Y; ba++)
                if (((T = h[ba]), (O = e[T]), (S = O + f[T] - 1), !(f[T] >= w))) {
                    L = n[T];
                    if (0 > L) {
                        for (G = O; G <= S; G++) (K = l[G]), 0 > K && (K = -K), L < K && (L = K);
                        n[T] = L;
                    }
                    for (G = e[T]; h[G] != Z; G++);
                    K = l[G];
                    0 > K && (K = -K);
                    if (!(K < v * L) && ((F = T), (D = Z), (w = f[T]), w <= R)) return (B = F), (J = D), c();
                }
            if (0 != F) {
                if ((oa++, (Z = (w - 1) * (R - 1)), Z < ca && ((B = F), (J = D), (ca = Z)), oa == H)) return c();
            } else
                E &&
                    (0 == p[Z] ? (r[R] = u[Z]) : (u[p[Z]] = u[Z]),
                        0 != u[Z] && (p[u[Z]] = p[Z]),
                        (p[Z] = u[Z] = Z));
        }
        for (T = m[R]; 0 != T; T = q[T]) {
            O = e[T];
            S = O + f[T] - 1;
            L = n[T];
            if (0 > L) {
                for (G = O; G <= S; G++) (K = l[G]), 0 > K && (K = -K), L < K && (L = K);
                n[T] = L;
            }
            F = D = 0;
            w = 2147483647;
            for (G = O; G <= S; G++)
                if (
                    ((Z = h[G]),
                        !(k[Z] >= w) &&
                        ((K = l[G]), 0 > K && (K = -K), !(K < v * L) && ((F = T), (D = Z), (w = k[Z]), w <= R)))
                )
                    return (B = F), (J = D), c();
            if (0 != F && (oa++, (Z = (R - 1) * (w - 1)), Z < ca && ((B = F), (J = D), (ca = Z)), oa == H))
                return c();
        }
    }
    return c();
}
function Vg(a, b, c) {
    var d = a.n,
        e = a.Wd,
        f = a.Vd,
        g = a.Fc,
        k = a.Ec,
        h = a.nd,
        l = a.wf,
        n = a.Dc,
        m = a.Cc,
        q = a.Qc,
        r = a.yb,
        p = a.zb,
        u = a.Gd,
        v = a.ld,
        H = a.vf,
        E = a.rf,
        B = a.$f,
        J = a.sf,
        R = a.Me,
        T = a.Oe,
        O = a.Ne,
        S = a.fa,
        G = a.xe,
        Z = a.Ob,
        Y = a.We,
        ba = 0,
        oa,
        z,
        F,
        D,
        w,
        ca,
        L,
        K,
        aa,
        N,
        da,
        ea;
    0 == B[b] ? (E[k[b]] = J[b]) : (J[B[b]] = J[b]);
    0 != J[b] && (B[J[b]] = B[b]);
    0 == T[c] ? (R[m[c]] = O[c]) : (O[T[c]] = O[c]);
    0 != O[c] && (T[O[c]] = T[c]);
    K = g[b];
    aa = K + k[b] - 1;
    for (z = K; r[z] != c; z++);
    ea = l[b] = p[z];
    r[z] = r[aa];
    p[z] = p[aa];
    k[b]--;
    aa--;
    l = n[c];
    N = l + m[c] - 1;
    for (F = l; r[F] != b; F++);
    r[F] = r[N];
    m[c]--;
    N--;
    for (z = K; z <= aa; z++) {
        D = r[z];
        S[D] = 1;
        G[D] = p[z];
        0 == T[D] ? (R[m[D]] = O[D]) : (O[T[D]] = O[D]);
        0 != O[D] && (T[O[D]] = T[D]);
        ca = n[D];
        for (L = ca + m[D] - 1; r[ca] != b; ca++);
        r[ca] = r[L];
        m[D]--;
    }
    for (; l <= N;) {
        F = r[l];
        0 == B[F] ? (E[k[F]] = J[F]) : (J[B[F]] = J[F]);
        0 != J[F] && (B[J[F]] = B[F]);
        D = g[F];
        oa = D + k[F] - 1;
        for (w = D; r[w] != c; w++);
        da = p[w] / ea;
        r[w] = r[oa];
        p[w] = p[oa];
        k[F]--;
        oa--;
        r[l] = r[N];
        m[c]--;
        N--;
        z = k[b];
        for (w = D; w <= oa; w++)
            if (((D = r[w]), S[D]))
                if (((ca = p[w] -= da * G[D]), 0 > ca && (ca = -ca), (S[D] = 0), z--, 0 == ca || ca < Z)) {
                    r[w] = r[oa];
                    p[w] = p[oa];
                    k[F]--;
                    w--;
                    oa--;
                    ca = n[D];
                    for (L = ca + m[D] - 1; r[ca] != F; ca++);
                    r[ca] = r[L];
                    m[D]--;
                } else a.pd < ca && (a.pd = ca);
        if (k[F] + z > h[F]) {
            if (Xe(a, F, k[F] + z)) return (ba = 1);
            K = g[b];
            aa = K + k[b] - 1;
            l = n[c];
            N = l + m[c] - 1;
        }
        oa = 0;
        for (z = K; z <= aa; z++)
            (D = r[z]),
                S[D]
                    ? ((ca = L = -da * G[D]),
                        0 > ca && (ca = -ca),
                        0 == ca ||
                        ca < Z ||
                        ((w = g[F] + k[F]),
                            (r[w] = D),
                            (p[w] = L),
                            k[F]++,
                            (Y[++oa] = D),
                            a.pd < ca && (a.pd = ca)))
                    : (S[D] = 1);
        for (w = 1; w <= oa; w++) {
            D = Y[w];
            if (m[D] + 1 > q[D]) {
                if (Ye(a, D, m[D] + 10)) return (ba = 1);
                K = g[b];
                aa = K + k[b] - 1;
                l = n[c];
                N = l + m[c] - 1;
            }
            ca = n[D] + m[D];
            r[ca] = F;
            m[D]++;
        }
        B[F] = 0;
        J[F] = E[k[F]];
        0 != J[F] && (B[J[F]] = F);
        E[k[F]] = F;
        H[F] = -1;
        if (1 > a.Pa - a.Ja) {
            Ze(a);
            if (1 > a.Pa - a.Ja) return (ba = 1);
            K = g[b];
            aa = K + k[b] - 1;
            l = n[c];
            N = l + m[c] - 1;
        }
        a.Pa--;
        r[a.Pa] = F;
        p[a.Pa] = da;
        f[b]++;
    }
    q[c] = 0;
    w = d + c;
    0 == u[w] ? (a.kd = v[w]) : (v[u[w]] = v[w]);
    0 == v[w] ? (a.Vb = u[w]) : (u[v[w]] = u[w]);
    e[b] = a.Pa;
    for (z = K; z <= aa; z++)
        if (((D = r[z]), (S[D] = 0), (G[D] = 0), 1 == m[D] || T[D] != D || O[D] != D))
            (T[D] = 0), (O[D] = R[m[D]]), 0 != O[D] && (T[O[D]] = D), (R[m[D]] = D);
    return ba;
}
function Wg(a) {
    var b = a.n,
        c = a.Fc,
        d = a.Ec,
        e = a.Dc,
        f = a.Cc,
        g = a.Qc,
        k = a.yb,
        h = a.zb,
        l = a.Gd,
        n = a.ld,
        m,
        q,
        r,
        p;
    p = 0;
    for (m = 1; m <= b; m++) {
        q = c[m];
        for (r = q + d[m] - 1; q <= r; q++) g[k[q]]++;
        p += d[m];
    }
    a.Sb = p;
    if (a.Pa - a.Ja < p) return 1;
    for (p = 1; p <= b; p++) (e[p] = a.Ja), (a.Ja += g[p]);
    for (m = 1; m <= b; m++)
        for (q = c[m], r = q + d[m] - 1; q <= r; q++)
            (p = k[q]), (g = e[p] + f[p]), (k[g] = m), (h[g] = h[q]), f[p]++;
    for (c = b + 1; c <= b + b; c++) (l[c] = c - 1), (n[c] = c + 1);
    l[b + 1] = a.Vb;
    n[a.Vb] = b + 1;
    n[b + b] = 0;
    a.Vb = b + b;
    return 0;
}
function Xg(a) {
    var b = a.n,
        c = a.Nf,
        d = a.We,
        e = a.Wd,
        f = a.Vd,
        g = a.yb,
        k = a.zb,
        h,
        l,
        n,
        m;
    for (h = 1; h <= b; h++) d[h] = 0;
    h = 0;
    for (l = 1; l <= b; l++) {
        n = e[l];
        for (m = n + f[l] - 1; n <= m; n++) d[g[n]]++;
        h += f[l];
    }
    a.Wf = h;
    if (a.Pa - a.Ja < h) return 1;
    for (h = 1; h <= b; h++) (c[h] = a.Pa), (a.Pa -= d[h]);
    for (l = 1; l <= b; l++)
        for (n = e[l], m = n + f[l] - 1; n <= m; n++) (h = g[n]), (a = --c[h]), (g[a] = l), (k[a] = k[n]);
    return 0;
}
function xe(a, b, c, d) {
    function e() {
        0 < a.Ya &&
            ((a.Ka = a.Ya), (a.yb = new Int32Array(1 + a.Ka)), (a.zb = new Float64Array(1 + a.Ka)), (a.Ya = 0));
        if (Tg(a, c, d)) return (a.Ya = a.Ka + a.Ka), !0;
        for (q = 1; q <= b; q++) {
            if (
                Ug(a, function (a, b) {
                    r = a;
                    p = b;
                })
            )
                return (a.ta = q - 1), (v = ye), !1;
            n = g[r];
            m = k[p];
            u = f[q];
            f[n] = u;
            g[u] = n;
            f[q] = r;
            g[r] = q;
            u = h[q];
            h[m] = u;
            k[u] = m;
            h[q] = p;
            k[p] = q;
            if (Vg(a, r, p)) return (a.Ya = a.Ka + a.Ka), !0;
            if (a.pd > l * a.yg) return (a.ta = q - 1), (v = Ae), !1;
        }
        Ze(a);
        return Wg(a) || Xg(a) ? ((a.Ya = a.Ka + a.Ka), !0) : !1;
    }
    var f,
        g,
        k,
        h,
        l = a.sc,
        n,
        m,
        q,
        r,
        p,
        u,
        v = null;
    1 > b && x("luf_factorize: n = " + b + "; invalid parameter");
    1e8 < b && x("luf_factorize: n = " + b + "; matrix too big");
    a.valid = 0;
    Sg(a, b);
    f = a.nb;
    g = a.xb;
    k = a.of;
    h = a.ke;
    0 == a.Ka && 0 == a.Ya && (a.Ya = 5 * (b + 10));
    for (; e(););
    if (null != v) return v;
    a.valid = 1;
    a.ta = b;
    v = 0;
    u = 3 * (b + a.Sb) + 2 * a.Wf;
    if (a.Ka < u) for (a.Ya = a.Ka; a.Ya < u;) (q = a.Ya), (a.Ya = q + q);
    return v;
}
function Ge(a, b, c) {
    var d = a.n,
        e = a.Nf,
        f = a.We,
        g = a.Wd,
        k = a.Vd,
        h = a.nb,
        l = a.yb,
        n = a.zb,
        m;
    a.valid || x("luf_f_solve: LU-factorization is not valid");
    if (b)
        for (; 1 <= d; d--) {
            if (((m = h[d]), (a = c[m]), 0 != a)) for (b = e[m], m = b + f[m] - 1; b <= m; b++) c[l[b]] -= n[b] * a;
        }
    else
        for (e = 1; e <= d; e++)
            if (((m = h[e]), (a = c[m]), 0 != a)) for (b = g[m], m = b + k[m] - 1; b <= m; b++) c[l[b]] -= n[b] * a;
}
function Ie(a, b, c) {
    var d = a.n,
        e = a.Fc,
        f = a.Ec,
        g = a.wf,
        k = a.Dc,
        h = a.Cc,
        l = a.nb,
        n = a.ke,
        m = a.yb,
        q = a.zb,
        r = a.xe,
        p,
        u,
        v;
    a.valid || x("luf_v_solve: LU-factorization is not valid");
    for (a = 1; a <= d; a++) (r[a] = c[a]), (c[a] = 0);
    if (b)
        for (a = 1; a <= d; a++) {
            if (((p = l[a]), (u = n[a]), (b = r[u]), 0 != b))
                for (c[p] = b /= g[p], v = e[p], p = v + f[p] - 1; v <= p; v++) r[m[v]] -= q[v] * b;
        }
    else
        for (a = d; 1 <= a; a--)
            if (((p = l[a]), (u = n[a]), (b = r[p]), 0 != b))
                for (c[u] = b /= g[p], v = k[u], p = v + h[u] - 1; v <= p; v++) r[m[v]] -= q[v] * b;
}
var Wd = 401,
    Xd = 402,
    Yd = 403,
    Zd = 404,
    $d = 405,
    je = 412,
    ke = 413,
    ee = 422,
    fe = 423;
function Yg() {
    return { index: {}, W: {}, set: {}, A: {}, K: {}, a: {}, loop: {} };
}
function Zg(a) {
    var b;
    201 == a.b ? (b = "_|_") : 205 == a.b ? (b = "'...'") : (b = a.i);
    a.context[a.mc++] = " ";
    60 == a.mc && (a.mc = 0);
    for (var c = 0; c < b.length; c++) (a.context[a.mc++] = b[c]), 60 == a.mc && (a.mc = 0);
}
function $g(a) {
    var b;
    -1 != a.m &&
        ("\n" == a.m && (a.gb++, (a.Uc = 0)),
            (b = a.af()),
            0 > b && (b = -1),
            a.Uc++,
            -1 == b
                ? "\n" == a.m
                    ? a.gb--
                    : ah(a, "final NL missing before end of file")
                : "\n" != b &&
                (0 <= " \t\n\v\f\r".indexOf(b)
                    ? (b = " ")
                    : ta(b) && (Zg(a), U(a, "control character " + b + " not allowed"))),
            (a.m = b));
}
function ch(a) {
    a.i += a.m;
    a.Db++;
    $g(a);
}
function V(a) {
    function b() {
        Zg(a);
        U(a, "keyword s.t. incomplete");
    }
    function c() {
        Zg(a);
        U(a, "cannot convert numeric literal " + a.i + " to floating-point number");
    }
    function d() {
        if ("e" == a.m || "E" == a.m)
            for (
                ch(a),
                ("+" != a.m && "-" != a.m) || ch(a),
                wa(a.m) || (Zg(a), U(a, "numeric literal " + a.i + " incomplete"));
                wa(a.m);

            )
                ch(a);
        if (ua(a.m) || "_" == a.m) Zg(a), U(a, "symbol " + a.i + a.m + "... should be enclosed in quotes");
    }
    a.Df = a.b;
    a.Cf = a.Db;
    a.Bf = a.i;
    a.Ef = a.value;
    if (a.Se) (a.Se = 0), (a.b = a.If), (a.Db = a.Hf), (a.i = a.Gf), (a.value = a.Jf);
    else {
        for (; ;) {
            a.b = 0;
            a.Db = 0;
            a.i = "";
            for (a.value = 0; " " == a.m || "\n" == a.m;) $g(a);
            if (-1 == a.m) a.b = 201;
            else if ("#" == a.m) {
                for (; "\n" != a.m && -1 != a.m;) $g(a);
                continue;
            } else if (a.oc || (!ua(a.m) && "_" != a.m))
                if (!a.oc && wa(a.m)) {
                    for (a.b = 204; wa(a.m);) ch(a);
                    var e = !1;
                    if ("." == a.m)
                        if ((ch(a), "." == a.m))
                            a.Db--, (a.i = a.i.substr(0, a.i.length - 1)), (a.Re = 1), (e = !0);
                        else for (; wa(a.m);) ch(a);
                    e || d();
                    tg(a.i, function (b) {
                        a.value = b;
                    }) && c();
                } else if ("'" == a.m || '"' == a.m) {
                    var e = function () {
                        for (; ;) {
                            if (("\n" == a.m && !g) || -1 == a.m)
                                Zg(a), U(a, "unexpected end of line; string literal incomplete");
                            if (a.m == f)
                                if (($g(a), a.m == f)) {
                                    if (g)
                                        if (($g(a), a.m == f)) {
                                            $g(a);
                                            break;
                                        } else (a.i += '""'), (a.Db += 2);
                                } else if (g) (a.i += '"'), a.Db++;
                                else break;
                            ch(a);
                        }
                    },
                        f = a.m,
                        g = !1;
                    a.b = 205;
                    $g(a);
                    a.m == f ? ($g(a), a.m == f && ((g = !0), $g(a), e())) : e();
                } else if (a.oc || "+" != a.m)
                    if (a.oc || "-" != a.m)
                        if ("*" == a.m) (a.b = 227), ch(a), "*" == a.m && ((a.b = 229), ch(a));
                        else if ("/" == a.m) {
                            if (((a.b = 228), ch(a), "*" == a.m)) {
                                for ($g(a); ;)
                                    if (-1 == a.m) U(a, "unexpected end of file; comment sequence incomplete");
                                    else if ("*" == a.m) {
                                        if (($g(a), "/" == a.m)) break;
                                    } else $g(a);
                                $g(a);
                                continue;
                            }
                        } else if ("^" == a.m) (a.b = 229), ch(a);
                        else if ("<" == a.m)
                            (a.b = 230),
                                ch(a),
                                "=" == a.m
                                    ? ((a.b = 231), ch(a))
                                    : ">" == a.m
                                        ? ((a.b = 235), ch(a))
                                        : "-" == a.m && ((a.b = 252), ch(a));
                        else if ("=" == a.m) (a.b = 232), ch(a), "=" == a.m && ch(a);
                        else if (">" == a.m)
                            (a.b = 234),
                                ch(a),
                                "=" == a.m ? ((a.b = 233), ch(a)) : ">" == a.m && ((a.b = 250), ch(a));
                        else if ("!" == a.m) (a.b = 218), ch(a), "=" == a.m && ((a.b = 235), ch(a));
                        else if ("&" == a.m) (a.b = 236), ch(a), "&" == a.m && ((a.b = 206), ch(a));
                        else if ("|" == a.m) (a.b = 237), ch(a), "|" == a.m && ((a.b = 219), ch(a));
                        else if (a.oc || "." != a.m)
                            if ("," == a.m) (a.b = 239), ch(a);
                            else if (":" == a.m) (a.b = 240), ch(a), "=" == a.m && ((a.b = 242), ch(a));
                            else if (";" == a.m) (a.b = 241), ch(a);
                            else if ("(" == a.m) (a.b = 244), ch(a);
                            else if (")" == a.m) (a.b = 245), ch(a);
                            else if ("[" == a.m) (a.b = 246), ch(a);
                            else if ("]" == a.m) (a.b = 247), ch(a);
                            else if ("{" == a.m) (a.b = 248), ch(a);
                            else if ("}" == a.m) (a.b = 249), ch(a);
                            else if ("~" == a.m) (a.b = 251), ch(a);
                            else if (va(a.m) || 0 <= "+-._".indexOf(a.m)) {
                                for (a.b = 203; va(a.m) || 0 <= "+-._".indexOf(a.m);) ch(a);
                                switch (
                                tg(a.i, function (b) {
                                    a.value = b;
                                })
                                ) {
                                    case 0:
                                        a.b = 204;
                                        break;
                                    case 1:
                                        c();
                                }
                            } else Zg(a), U(a, "character " + a.m + " not allowed");
                        else if (((a.b = 238), ch(a), a.Re)) (a.b = 243), (a.Db = 2), (a.i = ".."), (a.Re = 0);
                        else if ("." == a.m) (a.b = 243), ch(a);
                        else {
                            if (wa(a.m)) {
                                a.b = 204;
                                for (ch(a); wa(a.m);) ch(a);
                                d();
                                tg(a.i, function (b) {
                                    a.value = b;
                                }) && c();
                            }
                        }
                    else (a.b = 226), ch(a);
                else (a.b = 225), ch(a);
            else {
                for (a.b = 202; va(a.m) || "_" == a.m;) ch(a);
                "and" == a.i
                    ? (a.b = 206)
                    : "by" == a.i
                        ? (a.b = 207)
                        : "cross" == a.i
                            ? (a.b = 208)
                            : "diff" == a.i
                                ? (a.b = 209)
                                : "div" == a.i
                                    ? (a.b = 210)
                                    : "else" == a.i
                                        ? (a.b = 211)
                                        : "if" == a.i
                                            ? (a.b = 212)
                                            : "in" == a.i
                                                ? (a.b = 213)
                                                : "Infinity" == a.i
                                                    ? (a.b = 214)
                                                    : "inter" == a.i
                                                        ? (a.b = 215)
                                                        : "less" == a.i
                                                            ? (a.b = 216)
                                                            : "mod" == a.i
                                                                ? (a.b = 217)
                                                                : "not" == a.i
                                                                    ? (a.b = 218)
                                                                    : "or" == a.i
                                                                        ? (a.b = 219)
                                                                        : "s" == a.i && "." == a.m
                                                                            ? ((a.b = 220), ch(a), "t" != a.m && b(), ch(a), "." != a.m && b(), ch(a))
                                                                            : "symdiff" == a.i
                                                                                ? (a.b = 221)
                                                                                : "then" == a.i
                                                                                    ? (a.b = 222)
                                                                                    : "union" == a.i
                                                                                        ? (a.b = 223)
                                                                                        : "within" == a.i && (a.b = 224);
            }
            break;
        }
        Zg(a);
        a.Lf = 0;
    }
}
function dh(a) {
    a.Se = 1;
    a.If = a.b;
    a.Hf = a.Db;
    a.Gf = a.i;
    a.Jf = a.value;
    a.b = a.Df;
    a.Db = a.Cf;
    a.i = a.Bf;
    a.value = a.Ef;
}
function eh(a, b) {
    return 202 == a.b && a.i == b;
}
function fh(a) {
    return (
        (206 == a.b && "a" == a.i[0]) ||
        207 == a.b ||
        208 == a.b ||
        209 == a.b ||
        210 == a.b ||
        211 == a.b ||
        212 == a.b ||
        213 == a.b ||
        215 == a.b ||
        216 == a.b ||
        217 == a.b ||
        (218 == a.b && "n" == a.i[0]) ||
        (219 == a.b && "o" == a.i[0]) ||
        221 == a.b ||
        222 == a.b ||
        223 == a.b ||
        224 == a.b
    );
}
function gh(a, b, c, d) {
    var e = {};
    e.Wa = a;
    e.X = 0;
    e.a = Yg();
    e.value = {};
    switch (a) {
        case 301:
            e.a.U = b.U;
            break;
        case 302:
            e.a.P = b.P;
            break;
        case 303:
            e.a.index.Ca = b.index.Ca;
            e.a.index.next = b.index.next;
            break;
        case 304:
        case 305:
            for (a = b.W.list; null != a; a = a.next) (a.x.V = e), (e.X |= a.x.X);
            e.a.W.W = b.W.W;
            e.a.W.list = b.W.list;
            break;
        case 306:
            for (a = b.set.list; null != a; a = a.next) (a.x.V = e), (e.X |= a.x.X);
            e.a.set.set = b.set.set;
            e.a.set.list = b.set.list;
            break;
        case 307:
            for (a = b.A.list; null != a; a = a.next) (a.x.V = e), (e.X |= a.x.X);
            e.a.A.A = b.A.A;
            e.a.A.list = b.A.list;
            e.a.A.Ac = b.A.Ac;
            break;
        case 308:
            for (a = b.K.list; null != a; a = a.next) (a.x.V = e), (e.X |= a.x.X);
            e.a.K.K = b.K.K;
            e.a.K.list = b.K.list;
            e.a.K.Ac = b.K.Ac;
            break;
        case 309:
        case 310:
            for (a = b.list; null != a; a = a.next) (a.x.V = e), (e.X |= a.x.X);
            e.a.list = b.list;
            break;
        case 311:
            e.a.slice = b.slice;
            break;
        case 312:
        case 313:
        case 314:
        case 315:
            e.X = 1;
            break;
        case 316:
        case 317:
        case 318:
        case 319:
        case 320:
        case 321:
        case 322:
        case 323:
        case 324:
        case 325:
        case 326:
        case 327:
        case 328:
        case 329:
        case 330:
        case 331:
        case 332:
        case 333:
        case 334:
        case 335:
        case 336:
        case 337:
            b.a.x.V = e;
            e.X |= b.a.x.X;
            e.a.a.x = b.a.x;
            break;
        case 338:
        case 339:
        case 340:
        case 341:
        case 342:
        case 343:
        case 344:
        case 345:
        case 346:
        case 347:
        case 348:
        case 349:
            349 == a && (e.X = 1);
        case 350:
            350 == a && (e.X = 1);
        case 351:
        case 352:
        case 353:
        case 354:
        case 355:
        case 356:
        case 357:
        case 358:
        case 359:
        case 360:
        case 361:
        case 362:
        case 363:
        case 364:
        case 365:
        case 366:
        case 367:
        case 368:
        case 369:
        case 370:
        case 371:
            b.a.x.V = e;
            e.X |= b.a.x.X;
            b.a.y.V = e;
            e.X |= b.a.y.X;
            e.a.a.x = b.a.x;
            e.a.a.y = b.a.y;
            break;
        case 372:
        case 373:
        case 374:
            b.a.x.V = e;
            e.X |= b.a.x.X;
            b.a.y.V = e;
            e.X |= b.a.y.X;
            null != b.a.z && ((b.a.z.V = e), (e.X |= b.a.z.X));
            e.a.a.x = b.a.x;
            e.a.a.y = b.a.y;
            e.a.a.z = b.a.z;
            break;
        case 375:
        case 376:
            for (a = b.list; null != a; a = a.next) (a.x.V = e), (e.X |= a.x.X);
            e.a.list = b.list;
            break;
        case 377:
        case 378:
        case 379:
        case 380:
        case 381:
        case 382:
        case 383:
        case 384:
            a = b.loop.domain;
            null != a.code && ((a.code.V = e), (e.X |= a.code.X));
            for (a = a.list; null != a; a = a.next) (a.code.V = e), (e.X |= a.code.X);
            null != b.loop.x && ((b.loop.x.V = e), (e.X |= b.loop.x.X));
            e.a.loop.domain = b.loop.domain;
            e.a.loop.x = b.loop.x;
    }
    e.type = c;
    e.v = d;
    e.V = null;
    e.valid = 0;
    e.value = {};
    return e;
}
function W(a, b, c, d) {
    var e = Yg();
    e.a.x = b;
    return gh(a, e, c, d);
}
function hh(a, b, c, d, e) {
    var f = Yg();
    f.a.x = b;
    f.a.y = c;
    return gh(a, f, d, e);
}
function ih(a, b, c, d, e, f) {
    var g = Yg();
    g.a.x = b;
    g.a.y = c;
    g.a.z = d;
    return gh(a, g, e, f);
}
function jh(a, b) {
    var c = {},
        d;
    c.x = b;
    c.next = null;
    if (null == a) a = c;
    else {
        for (d = a; null != d.next; d = d.next);
        d.next = c;
    }
    return a;
}
function kh(a) {
    var b;
    for (b = 0; null != a; a = a.next) b++;
    return b;
}
function lh(a) {
    var b,
        c,
        d,
        e,
        f,
        g,
        k,
        h,
        l,
        n = Yg(),
        m = a.$[a.i];
    null == m && U(a, a.i + " not defined");
    switch (m.type) {
        case 111:
            b = m.link;
            h = b.name;
            l = 0;
            break;
        case 122:
            c = m.link;
            h = c.name;
            l = c.v;
            0 == c.aa && (c.aa = 1);
            break;
        case 120:
            d = m.link;
            h = d.name;
            l = d.v;
            break;
        case 127:
            e = m.link;
            h = e.name;
            l = e.v;
            break;
        case 103:
            (f = m.link), (h = f.name), (l = f.v);
    }
    V(a);
    if (246 == a.b) {
        0 == l && U(a, h + " cannot be subscripted");
        V(a);
        for (var q = null; ;)
            if (
                ((g = mh(a)),
                    118 == g.type && (g = W(317, g, 124, 0)),
                    124 != g.type && U(a, "subscript expression has invalid type"),
                    (q = jh(q, g)),
                    239 == a.b)
            )
                V(a);
            else if (247 == a.b) break;
            else U(a, "syntax error in subscript list");
        g = q;
        l != kh(g) && U(a, h + " must have " + l + " subscript" + (1 == l ? "" : "s") + " rather than " + kh(g));
        V(a);
    } else 0 != l && U(a, h + " must be subscripted"), (g = null);
    l = a.Qb || 127 != m.type ? 4 : 0;
    238 == a.b &&
        (V(a),
            202 != a.b && U(a, "invalid use of period"),
            127 != m.type && 103 != m.type && U(a, h + " cannot have a suffix"),
            "lb" == a.i
                ? (l = 1)
                : "ub" == a.i
                    ? (l = 2)
                    : "status" == a.i
                        ? (l = 3)
                        : "val" == a.i
                            ? (l = 4)
                            : "dual" == a.i
                                ? (l = 5)
                                : U(a, "suffix ." + a.i + " invalid"),
            V(a));
    switch (m.type) {
        case 111:
            n.index.Ca = b;
            n.index.next = b.list;
            k = gh(303, n, 124, 0);
            b.list = k;
            break;
        case 122:
            n.set.set = c;
            n.set.list = g;
            k = gh(306, n, 106, c.aa);
            break;
        case 120:
            n.W.W = d;
            n.W.list = g;
            k = 124 == d.type ? gh(305, n, 124, 0) : gh(304, n, 118, 0);
            break;
        case 127:
            a.Qb ||
                (3 != l && 4 != l && 5 != l) ||
                U(
                    a,
                    "invalid reference to status, primal value, or dual value of variable " +
                    e.name +
                    " above solve statement"
                );
            n.A.A = e;
            n.A.list = g;
            n.A.Ac = l;
            k = gh(307, n, 0 == l ? 110 : 118, 0);
            break;
        case 103:
            a.Qb ||
                (3 != l && 4 != l && 5 != l) ||
                U(
                    a,
                    "invalid reference to status, primal value, or dual value of " +
                    (103 == f.type ? "constraint" : "objective") +
                    " " +
                    f.name +
                    " above solve statement"
                ),
                (n.K.K = f),
                (n.K.list = g),
                (n.K.Ac = l),
                (k = gh(308, n, 118, 0));
    }
    return k;
}
function nh(a, b) {
    var c = mh(a);
    124 == c.type && (c = W(316, c, 118, 0));
    118 != c.type && U(a, "argument for " + b + " has invalid type");
    return c;
}
function oh(a, b) {
    var c = mh(a);
    118 == c.type && (c = W(317, c, 124, 0));
    124 != c.type && U(a, "argument for " + b + " has invalid type");
    return c;
}
function ph(a, b, c) {
    var d = {};
    d.name = b;
    d.code = c;
    d.value = null;
    d.list = null;
    d.next = null;
    if (null == a.list) a.list = d;
    else {
        for (a = a.list; null != a.next; a = a.next);
        a.next = d;
    }
}
function qh(a) {
    var b,
        c = Yg(),
        d = Array(21);
    ka(d, 0, 21);
    var e,
        f,
        g,
        k = 0;
    e = a.Lf;
    V(a);
    for (g = 1; ; g++) {
        var h = function () {
            b = rh(a);
            if (239 == a.b || 1 < g)
                118 == b.type && (b = W(317, b, 124, 0)),
                    124 != b.type && U(a, "component expression has invalid type");
            d[g].name = null;
            d[g].code = b;
        };
        20 < g && U(a, "too many components within parentheses");
        if (202 == a.b)
            if ((V(a), (f = a.b), dh(a), !e || (239 != f && 245 != f) || null != a.$[a.i])) h();
            else {
                for (f = 1; f < g; f++)
                    null != d[f].name && d[f].name == a.i && U(a, "duplicate dummy index " + a.i + " not allowed");
                d[g].name = a.i;
                d[g].code = null;
                V(a);
                k = 1;
                1 == g && 245 == a.b && U(a, d[g].name + " not defined");
            }
        else h();
        if (239 == a.b) V(a);
        else if (245 == a.b) break;
        else U(a, "right parenthesis missing where expected");
    }
    if (1 != g || k)
        if (k) {
            c.slice = {};
            for (f = 1; f <= g; f++) ph(c.slice, d[f].name, d[f].code);
            b = gh(311, c, 126, g);
        } else {
            c.list = null;
            for (f = 1; f <= g; f++) c.list = jh(c.list, d[f].code);
            b = gh(309, c, 126, g);
        }
    else b = d[1].code;
    V(a);
    k && 213 != a.b && U(a, "keyword in missing where expected");
    e &&
        213 == a.b &&
        !k &&
        (1 == g ? U(a, "syntax error in indexing expression") : U(a, "0-ary slice not allowed"));
    return b;
}
function sh(a) {
    var b, c, d, e;
    V(a);
    249 == a.b && U(a, "empty indexing expression not allowed");
    for (b = {}; ;) {
        e = c = null;
        202 == a.b
            ? (V(a),
                (d = a.b),
                dh(a),
                213 == d && null == a.$[a.i] && ((c = {}), (d = a.i), ph(c, d, null), V(a), V(a)))
            : 244 == a.b && ((a.Lf = 1), (e = th(a)), 311 == e.Wa && ((c = e.a.slice), (e = null), V(a)));
        null == e && (e = th(a));
        if (106 != e.type) {
            null != c && U(a, "domain expression has invalid type");
            d = a;
            var f = Yg(),
                g = void 0;
            f.list = null;
            for (g = 1; ; g++) {
                118 == e.type && (e = W(317, e, 124, 0));
                124 == e.type && (e = W(319, e, 126, 1));
                126 != e.type && U(d, "member expression has invalid type");
                null != f.list &&
                    f.list.x.v != e.v &&
                    U(
                        d,
                        "member " +
                        (g - 1) +
                        " has " +
                        f.list.x.v +
                        " component" +
                        (1 == f.list.x.v ? "" : "s") +
                        " while member " +
                        g +
                        " has " +
                        e.v +
                        " component" +
                        (1 == e.v ? "" : "s")
                    );
                f.list = jh(f.list, e);
                if (239 == d.b) V(d);
                else if (249 == d.b) break;
                else U(d, "syntax error in literal set");
                e = mh(d);
            }
            e = gh(310, f, 106, f.list.x.v);
        }
        if (null == c) for (c = {}, d = 1; d <= e.v; d++) ph(c, null, null);
        f = 0;
        for (d = c.list; null != d; d = d.next) f++;
        f != e.v && U(a, f + " " + (1 == f ? "index" : "indices") + " specified for set of dimension " + e.v);
        c.code = e;
        e = b;
        d = c;
        f = void 0;
        if (null == e.list) e.list = d;
        else {
            for (f = e.list; null != f.next; f = f.next);
            f.next = d;
        }
        for (d = c.list; null != d; d = d.next) null != d.name && (a.$[d.name] = { type: 111, link: d });
        if (239 == a.b) V(a);
        else if (240 == a.b || 249 == a.b) break;
        else U(a, "syntax error in indexing expression");
    }
    240 == a.b &&
        (V(a),
            (e = rh(a)),
            124 == e.type && (e = W(316, e, 118, 0)),
            118 == e.type && (e = W(318, e, 114, 0)),
            114 != e.type && U(a, "expression following colon has invalid type"),
            (b.code = e),
            249 != a.b && U(a, "syntax error in indexing expression"));
    V(a);
    return b;
}
function uh(a, b) {
    var c, d;
    for (c = b.list; null != c; c = c.next)
        for (d = c.list; null != d; d = d.next) null != d.name && delete a.$[d.name];
}
function vh(a) {
    var b, c;
    for (b = a.a.loop.domain.list; null != b; b = b.next)
        for (c = b.list; null != c; c = c.next) null != c.code && (c.code.V = a);
}
function wh(a) {
    function b() {
        U(a, "integrand following " + f + "{...} has invalid type");
    }
    var c,
        d = Yg(),
        e,
        f;
    "sum" == a.i
        ? (e = 377)
        : "prod" == a.i
            ? (e = 378)
            : "min" == a.i
                ? (e = 379)
                : "max" == a.i
                    ? (e = 380)
                    : "forall" == a.i
                        ? (e = 381)
                        : "exists" == a.i
                            ? (e = 382)
                            : "setof" == a.i
                                ? (e = 383)
                                : U(a, "operator " + a.i + " unknown");
    f = a.i;
    V(a);
    d.loop.domain = sh(a);
    switch (e) {
        case 377:
        case 378:
        case 379:
        case 380:
            d.loop.x = xh(a);
            124 == d.loop.x.type && (d.loop.x = W(316, d.loop.x, 118, 0));
            118 == d.loop.x.type || (377 == e && 110 == d.loop.x.type) || b();
            c = gh(e, d, d.loop.x.type, 0);
            break;
        case 381:
        case 382:
            d.loop.x = yh(a);
            124 == d.loop.x.type && (d.loop.x = W(316, d.loop.x, 118, 0));
            118 == d.loop.x.type && (d.loop.x = W(318, d.loop.x, 114, 0));
            114 != d.loop.x.type && b();
            c = gh(e, d, 114, 0);
            break;
        case 383:
            (d.loop.x = mh(a)),
                118 == d.loop.x.type && (d.loop.x = W(317, d.loop.x, 124, 0)),
                124 == d.loop.x.type && (d.loop.x = W(319, d.loop.x, 126, 1)),
                126 != d.loop.x.type && b(),
                (c = gh(e, d, 106, d.loop.x.v));
    }
    uh(a, d.loop.domain);
    vh(c);
    return c;
}
function zh(a) {
    var b = 0;
    for (a = a.list; null != a; a = a.next) for (var c = a.list; null != c; c = c.next) null == c.code && b++;
    return b;
}
function Ah(a, b) {
    U(a, "operand preceding " + b + " has invalid type");
}
function Bh(a, b) {
    U(a, "operand following " + b + " has invalid type");
}
function Ch(a, b, c, d) {
    U(
        a,
        "operands preceding and following " + b + " have different dimensions " + c + " and " + d + ", respectively"
    );
}
function Dh(a) {
    var b, c;
    if (204 == a.b) (b = Yg()), (b.U = a.value), (b = gh(301, b, 118, 0)), V(a), (c = b);
    else if (214 == a.b) (b = Yg()), (b.U = t), (c = gh(301, b, 118, 0)), V(a);
    else if (205 == a.b) (b = Yg()), (b.P = a.i), (b = gh(302, b, 124, 0)), V(a), (c = b);
    else if (202 == a.b)
        switch ((V(a), (c = a.b), dh(a), c)) {
            case 246:
                c = lh(a);
                break;
            case 244:
                c = Yg();
                var d;
                "abs" == a.i
                    ? (b = 324)
                    : "ceil" == a.i
                        ? (b = 325)
                        : "floor" == a.i
                            ? (b = 326)
                            : "exp" == a.i
                                ? (b = 327)
                                : "log" == a.i
                                    ? (b = 328)
                                    : "log10" == a.i
                                        ? (b = 329)
                                        : "sqrt" == a.i
                                            ? (b = 330)
                                            : "sin" == a.i
                                                ? (b = 331)
                                                : "cos" == a.i
                                                    ? (b = 332)
                                                    : "atan" == a.i
                                                        ? (b = 333)
                                                        : "min" == a.i
                                                            ? (b = 375)
                                                            : "max" == a.i
                                                                ? (b = 376)
                                                                : "round" == a.i
                                                                    ? (b = 334)
                                                                    : "trunc" == a.i
                                                                        ? (b = 335)
                                                                        : "Irand224" == a.i
                                                                            ? (b = 312)
                                                                            : "Uniform01" == a.i
                                                                                ? (b = 313)
                                                                                : "Uniform" == a.i
                                                                                    ? (b = 349)
                                                                                    : "Normal01" == a.i
                                                                                        ? (b = 314)
                                                                                        : "Normal" == a.i
                                                                                            ? (b = 350)
                                                                                            : "card" == a.i
                                                                                                ? (b = 336)
                                                                                                : "length" == a.i
                                                                                                    ? (b = 337)
                                                                                                    : "substr" == a.i
                                                                                                        ? (b = 369)
                                                                                                        : "str2time" == a.i
                                                                                                            ? (b = 370)
                                                                                                            : "time2str" == a.i
                                                                                                                ? (b = 371)
                                                                                                                : "gmtime" == a.i
                                                                                                                    ? (b = 315)
                                                                                                                    : U(a, "function " + a.i + " unknown");
                d = a.i;
                V(a);
                V(a);
                if (375 == b || 376 == b)
                    for (c.list = null; ;)
                        if (((c.list = jh(c.list, nh(a, d))), 239 == a.b)) V(a);
                        else if (245 == a.b) break;
                        else U(a, "syntax error in argument list for " + d);
                else if (312 == b || 313 == b || 314 == b || 315 == b)
                    245 != a.b && U(a, d + " needs no arguments");
                else if (349 == b || 350 == b)
                    (c.a.x = nh(a, d)),
                        239 != a.b &&
                        (245 == a.b
                            ? U(a, d + " needs two arguments")
                            : U(a, "syntax error in argument for " + d)),
                        V(a),
                        (c.a.y = nh(a, d)),
                        239 == a.b
                            ? U(a, d + " needs two argument")
                            : 245 != a.b && U(a, "syntax error in argument for " + d);
                else if (333 == b || 334 == b || 335 == b) {
                    c.a.x = nh(a, d);
                    if (239 == a.b) {
                        switch (b) {
                            case 333:
                                b = 346;
                                break;
                            case 334:
                                b = 347;
                                break;
                            case 335:
                                b = 348;
                        }
                        V(a);
                        c.a.y = nh(a, d);
                    }
                    239 == a.b
                        ? U(a, d + " needs one or two arguments")
                        : 245 != a.b && U(a, "syntax error in argument for " + d);
                } else if (369 == b)
                    (c.a.x = oh(a, d)),
                        239 != a.b &&
                        (245 == a.b
                            ? U(a, d + " needs two or three arguments")
                            : U(a, "syntax error in argument for " + d)),
                        V(a),
                        (c.a.y = nh(a, d)),
                        239 == a.b && ((b = 374), V(a), (c.a.z = nh(a, d))),
                        239 == a.b
                            ? U(a, d + " needs two or three arguments")
                            : 245 != a.b && U(a, "syntax error in argument for " + d);
                else if (370 == b)
                    (c.a.x = oh(a, d)),
                        239 != a.b &&
                        (245 == a.b
                            ? U(a, d + " needs two arguments")
                            : U(a, "syntax error in argument for " + d)),
                        V(a),
                        (c.a.y = oh(a, d)),
                        239 == a.b
                            ? U(a, d + " needs two argument")
                            : 245 != a.b && U(a, "syntax error in argument for " + d);
                else if (371 == b)
                    (c.a.x = nh(a, d)),
                        239 != a.b &&
                        (245 == a.b
                            ? U(a, d + " needs two arguments")
                            : U(a, "syntax error in argument for " + d)),
                        V(a),
                        (c.a.y = oh(a, d)),
                        239 == a.b
                            ? U(a, d + " needs two argument")
                            : 245 != a.b && U(a, "syntax error in argument for " + d);
                else {
                    var e = c.a,
                        f;
                    336 == b
                        ? ((f = th(a)), 106 != f.type && U(a, "argument for " + d + " has invalid type"))
                        : (f = 337 == b ? oh(a, d) : nh(a, d));
                    e.x = f;
                    239 == a.b
                        ? U(a, d + " needs one argument")
                        : 245 != a.b && U(a, "syntax error in argument for " + d);
                }
                b = 369 == b || 374 == b || 371 == b ? gh(b, c, 124, 0) : gh(b, c, 118, 0);
                V(a);
                c = b;
                break;
            case 248:
                c = wh(a);
                break;
            default:
                c = lh(a);
        }
    else if (244 == a.b) c = qh(a);
    else if (248 == a.b)
        (b = Yg()),
            V(a),
            249 == a.b
                ? ((b.list = null), (b = gh(310, b, 106, 1)), V(a))
                : (dh(a),
                    (b.loop.domain = sh(a)),
                    (b.loop.x = null),
                    uh(a, b.loop.domain),
                    (b = gh(384, b, 106, zh(b.loop.domain))),
                    vh(b)),
            (c = b);
    else if (212 == a.b) {
        V(a);
        b = rh(a);
        124 == b.type && (b = W(316, b, 118, 0));
        118 == b.type && (b = W(318, b, 114, 0));
        114 != b.type && U(a, "expression following if has invalid type");
        222 != a.b && U(a, "keyword then missing where expected");
        V(a);
        c = th(a);
        118 != c.type &&
            124 != c.type &&
            106 != c.type &&
            110 != c.type &&
            U(a, "expression following then has invalid type");
        if (211 != a.b) 106 == c.type && U(a, "keyword else missing where expected"), (d = null);
        else {
            V(a);
            d = th(a);
            118 != d.type &&
                124 != d.type &&
                106 != d.type &&
                110 != d.type &&
                U(a, "expression following else has invalid type");
            if (110 == c.type || 110 == d.type)
                124 == c.type && (c = W(316, c, 118, 0)),
                    118 == c.type && (c = W(320, c, 110, 0)),
                    124 == d.type && (d = W(316, d, 118, 0)),
                    118 == d.type && (d = W(320, d, 110, 0));
            if (124 == c.type || 124 == d.type)
                118 == c.type && (c = W(317, c, 124, 0)), 118 == d.type && (d = W(317, d, 124, 0));
            c.type != d.type && U(a, "expressions following then and else have incompatible types");
            c.v != d.v &&
                U(
                    a,
                    "expressions following then and else have different dimensions " +
                    c.v +
                    " and " +
                    d.v +
                    ", respectively"
                );
        }
        c = ih(373, b, c, d, c.type, c.v);
    } else fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "syntax error in expression");
    229 == a.b &&
        ((d = a.i),
            124 == c.type && (c = W(316, c, 118, 0)),
            118 != c.type && Ah(a, d),
            V(a),
            (b = 225 == a.b || 226 == a.b ? Eh(a) : Dh(a)),
            124 == b.type && (b = W(316, b, 118, 0)),
            118 != b.type && Bh(a, d),
            (c = hh(345, c, b, 118, 0)));
    return c;
}
function Eh(a) {
    var b;
    225 == a.b
        ? (V(a),
            (b = Dh(a)),
            124 == b.type && (b = W(316, b, 118, 0)),
            118 != b.type && 110 != b.type && Bh(a, "+"),
            (b = W(321, b, b.type, 0)))
        : 226 == a.b
            ? (V(a),
                (b = Dh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && 110 != b.type && Bh(a, "-"),
                (b = W(322, b, b.type, 0)))
            : (b = Dh(a));
    return b;
}
function xh(a) {
    for (var b, c = Eh(a); ;)
        if (227 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && 110 != c.type && Ah(a, "*"),
                V(a),
                (b = Eh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && 110 != b.type && Bh(a, "*"),
                110 == c.type && 110 == b.type && U(a, "multiplication of linear forms not allowed"),
                (c = 118 == c.type && 118 == b.type ? hh(341, c, b, 118, 0) : hh(341, c, b, 110, 0));
        else if (228 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && 110 != c.type && Ah(a, "/"),
                V(a),
                (b = Eh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && Bh(a, "/"),
                (c = 118 == c.type ? hh(342, c, b, 118, 0) : hh(342, c, b, 110, 0));
        else if (210 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && Ah(a, "div"),
                V(a),
                (b = Eh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && Bh(a, "div"),
                (c = hh(343, c, b, 118, 0));
        else if (217 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && Ah(a, "mod"),
                V(a),
                (b = Eh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && Bh(a, "mod"),
                (c = hh(344, c, b, 118, 0));
        else break;
    return c;
}
function Fh(a) {
    for (var b, c = xh(a); ;)
        if (225 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && 110 != c.type && Ah(a, "+"),
                V(a),
                (b = xh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && 110 != b.type && Bh(a, "+"),
                118 == c.type && 110 == b.type && (c = W(320, c, 110, 0)),
                110 == c.type && 118 == b.type && (b = W(320, b, 110, 0)),
                (c = hh(338, c, b, c.type, 0));
        else if (226 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && 110 != c.type && Ah(a, "-"),
                V(a),
                (b = xh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && 110 != b.type && Bh(a, "-"),
                118 == c.type && 110 == b.type && (c = W(320, c, 110, 0)),
                110 == c.type && 118 == b.type && (b = W(320, b, 110, 0)),
                (c = hh(339, c, b, c.type, 0));
        else if (216 == a.b)
            124 == c.type && (c = W(316, c, 118, 0)),
                118 != c.type && Ah(a, "less"),
                V(a),
                (b = xh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 != b.type && Bh(a, "less"),
                (c = hh(340, c, b, 118, 0));
        else break;
    return c;
}
function mh(a) {
    for (var b, c = Fh(a); ;)
        if (236 == a.b)
            118 == c.type && (c = W(317, c, 124, 0)),
                124 != c.type && Ah(a, "&"),
                V(a),
                (b = Fh(a)),
                118 == b.type && (b = W(317, b, 124, 0)),
                124 != b.type && Bh(a, "&"),
                (c = hh(351, c, b, 124, 0));
        else break;
    return c;
}
function Gh(a) {
    var b,
        c,
        d = mh(a);
    243 == a.b &&
        (124 == d.type && (d = W(316, d, 118, 0)),
            118 != d.type && Ah(a, ".."),
            V(a),
            (b = mh(a)),
            124 == b.type && (b = W(316, b, 118, 0)),
            118 != b.type && Bh(a, ".."),
            207 == a.b
                ? (V(a), (c = mh(a)), 124 == c.type && (c = W(316, c, 118, 0)), 118 != c.type && Bh(a, "by"))
                : (c = null),
            (d = ih(372, d, b, c, 106, 1)));
    return d;
}
function Hh(a) {
    for (var b, c = Gh(a); ;)
        if (208 == a.b)
            106 != c.type && Ah(a, "cross"),
                V(a),
                (b = Gh(a)),
                106 != b.type && Bh(a, "cross"),
                (c = hh(364, c, b, 106, c.v + b.v));
        else break;
    return c;
}
function Ih(a) {
    for (var b, c = Hh(a); ;)
        if (215 == a.b)
            106 != c.type && Ah(a, "inter"),
                V(a),
                (b = Hh(a)),
                106 != b.type && Bh(a, "inter"),
                c.v != b.v && Ch(a, "inter", c.v, b.v),
                (c = hh(363, c, b, 106, c.v));
        else break;
    return c;
}
function th(a) {
    for (var b, c = Ih(a); ;)
        if (223 == a.b)
            106 != c.type && Ah(a, "union"),
                V(a),
                (b = Ih(a)),
                106 != b.type && Bh(a, "union"),
                c.v != b.v && Ch(a, "union", c.v, b.v),
                (c = hh(360, c, b, 106, c.v));
        else if (209 == a.b)
            106 != c.type && Ah(a, "diff"),
                V(a),
                (b = Ih(a)),
                106 != b.type && Bh(a, "diff"),
                c.v != b.v && Ch(a, "diff", c.v, b.v),
                (c = hh(361, c, b, 106, c.v));
        else if (221 == a.b)
            106 != c.type && Ah(a, "symdiff"),
                V(a),
                (b = Ih(a)),
                106 != b.type && Bh(a, "symdiff"),
                c.v != b.v && Ch(a, "symdiff", c.v, b.v),
                (c = hh(362, c, b, 106, c.v));
        else break;
    return c;
}
function Jh(a) {
    var b,
        c = -1,
        d = "",
        e = th(a);
    switch (a.b) {
        case 230:
            c = 352;
            break;
        case 231:
            c = 353;
            break;
        case 232:
            c = 354;
            break;
        case 233:
            c = 355;
            break;
        case 234:
            c = 356;
            break;
        case 235:
            c = 357;
            break;
        case 213:
            c = 365;
            break;
        case 224:
            c = 367;
            break;
        case 218:
            d = a.i;
            V(a);
            213 == a.b ? (c = 366) : 224 == a.b ? (c = 368) : U(a, "invalid use of " + d);
            d += " ";
            break;
        default:
            return e;
    }
    d += a.i;
    switch (c) {
        case 354:
        case 357:
        case 352:
        case 353:
        case 356:
        case 355:
            118 != e.type && 124 != e.type && Ah(a, d);
            V(a);
            b = th(a);
            118 != b.type && 124 != b.type && Bh(a, d);
            118 == e.type && 124 == b.type && (e = W(317, e, 124, 0));
            124 == e.type && 118 == b.type && (b = W(317, b, 124, 0));
            e = hh(c, e, b, 114, 0);
            break;
        case 365:
        case 366:
            118 == e.type && (e = W(317, e, 124, 0));
            124 == e.type && (e = W(319, e, 126, 1));
            126 != e.type && Ah(a, d);
            V(a);
            b = th(a);
            106 != b.type && Bh(a, d);
            e.v != b.v && Ch(a, d, e.v, b.v);
            e = hh(c, e, b, 114, 0);
            break;
        case 367:
        case 368:
            106 != e.type && Ah(a, d),
                V(a),
                (b = th(a)),
                106 != b.type && Bh(a, d),
                e.v != b.v && Ch(a, d, e.v, b.v),
                (e = hh(c, e, b, 114, 0));
    }
    return e;
}
function Kh(a) {
    var b, c;
    218 == a.b
        ? ((c = a.i),
            V(a),
            (b = Jh(a)),
            124 == b.type && (b = W(316, b, 118, 0)),
            118 == b.type && (b = W(318, b, 114, 0)),
            114 != b.type && Bh(a, c),
            (b = W(323, b, 114, 0)))
        : (b = Jh(a));
    return b;
}
function yh(a) {
    for (var b, c = "", d = Kh(a); ;)
        if (206 == a.b)
            (c = a.i),
                124 == d.type && (d = W(316, d, 118, 0)),
                118 == d.type && (d = W(318, d, 114, 0)),
                114 != d.type && Ah(a, c),
                V(a),
                (b = Kh(a)),
                124 == b.type && (b = W(316, b, 118, 0)),
                118 == b.type && (b = W(318, b, 114, 0)),
                114 != b.type && Bh(a, c),
                (d = hh(358, d, b, 114, 0));
        else break;
    return d;
}
function rh(a) {
    for (var b, c = yh(a); ;)
        if (219 == a.b) {
            var d = a.i;
            124 == c.type && (c = W(316, c, 118, 0));
            118 == c.type && (c = W(318, c, 114, 0));
            114 != c.type && Ah(a, d);
            V(a);
            b = yh(a);
            124 == b.type && (b = W(316, b, 118, 0));
            118 == b.type && (b = W(318, b, 114, 0));
            114 != b.type && Bh(a, d);
            c = hh(359, c, b, 114, 0);
        } else break;
    return c;
}
function Lh(a) {
    function b() {
        U(a, "at most one := or default/data allowed");
    }
    function c() {
        U(a, a.i + " not a plain set");
    }
    function d() {
        U(a, "dimension of " + a.i + " too small");
    }
    function e() {
        U(a, "component number must be integer between 1 and " + h.set.aa);
    }
    var f,
        g,
        k = 0,
        h;
    V(a);
    202 != a.b &&
        (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "symbolic name missing where expected"));
    null != a.$[a.i] && U(a, a.i + " multiply declared");
    f = {};
    f.name = a.i;
    f.Kb = null;
    f.v = 0;
    f.domain = null;
    f.aa = 0;
    f.xf = null;
    f.assign = null;
    f.Ba = null;
    f.Xc = null;
    f.data = 0;
    f.T = null;
    V(a);
    205 == a.b && ((f.Kb = a.i), V(a));
    248 == a.b && ((f.domain = sh(a)), (f.v = zh(f.domain)));
    g = a.$[f.name] = {};
    g.type = 122;
    for (g.link = f; ;) {
        if (239 == a.b) V(a);
        else if (241 == a.b) break;
        if (eh(a, "dimen")) {
            var l;
            V(a);
            (204 == a.b && 1 <= a.value && 20 >= a.value && Math.floor(a.value) == a.value) ||
                U(a, "dimension must be integer between 1 and 20");
            l = (a.value + 0.5) | 0;
            k && U(a, "at most one dimension attribute allowed");
            0 < f.aa && U(a, "dimension " + l + " conflicts with dimension " + f.aa + " already determined");
            f.aa = l;
            k = 1;
            V(a);
        } else if (224 == a.b || 213 == a.b) {
            213 != a.b || a.ng || (ah(a, "keyword in understood as within"), (a.ng = 1));
            V(a);
            l = { code: null, next: null };
            if (null == f.xf) f.xf = l;
            else {
                for (g = f.xf; null != g.next; g = g.next);
                g.next = l;
            }
            l.code = th(a);
            106 != l.code.type && U(a, "expression following within has invalid type");
            0 == f.aa && (f.aa = l.code.v);
            f.aa != l.code.v &&
                U(a, "set expression following within must have dimension " + f.aa + " rather than " + l.code.v);
        } else if (242 == a.b)
            (null == f.assign && null == f.Ba && null == f.Xc) || b(),
                V(a),
                (f.assign = th(a)),
                106 != f.assign.type && U(a, "expression following := has invalid type"),
                0 == f.aa && (f.aa = f.assign.v),
                f.aa != f.assign.v &&
                U(a, "set expression following := must have dimension " + f.aa + " rather than " + f.assign.v);
        else if (eh(a, "default"))
            (null == f.assign && null == f.Ba) || b(),
                V(a),
                (f.Ba = th(a)),
                106 != f.Ba.type && U(a, "expression following default has invalid type"),
                0 == f.aa && (f.aa = f.Ba.v),
                f.aa != f.Ba.v &&
                U(a, "set expression following default must have dimension " + f.aa + " rather than " + f.Ba.v);
        else if (eh(a, "data")) {
            var n = 0;
            l = Array(20);
            (null == f.assign && null == f.Xc) || b();
            V(a);
            f.Xc = h = {};
            202 != a.b &&
                (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "set name missing where expected"));
            g = a.$[a.i];
            null == g && U(a, a.i + " not defined");
            122 != g.type && c();
            h.set = g.link;
            0 != h.set.v && c();
            h.set == f && U(a, "set cannot be initialized by itself");
            f.v >= h.set.aa && d();
            0 == f.aa && (f.aa = h.set.aa - f.v);
            f.v + f.aa > h.set.aa ? d() : f.v + f.aa < h.set.aa && U(a, "dimension of " + a.i + " too big");
            V(a);
            244 == a.b ? V(a) : U(a, "left parenthesis missing where expected");
            for (g = 0; g < h.set.aa; g++) l[g] = 0;
            for (g = 0; ;)
                if (
                    (204 != a.b && U(a, "component number missing where expected"),
                        0 !=
                        ug(a.i, function (a) {
                            n = a;
                        }) && e(),
                        (1 <= n && n <= h.set.aa) || e(),
                        0 != l[n - 1] && U(a, "component " + n + " multiply specified"),
                        (h.ca[g++] = n),
                        (l[n - 1] = 1),
                        V(a),
                        239 == a.b)
                )
                    V(a);
                else if (245 == a.b) break;
                else U(a, "syntax error in data attribute");
            g < h.set.aa && U(a, "there are must be " + h.set.aa + " components rather than " + g);
            V(a);
        } else U(a, "syntax error in set statement");
    }
    null != f.domain && uh(a, f.domain);
    0 == f.aa && (f.aa = 1);
    V(a);
    return f;
}
function Mh(a) {
    function b() {
        g && U(a, "at most one binary allowed");
        124 == d.type && U(a, "symbolic parameter cannot be binary");
        d.type = 101;
        g = 1;
        V(a);
    }
    function c() {
        U(a, "at most one := or default allowed");
    }
    var d,
        e,
        f = 0,
        g = 0,
        k = 0;
    V(a);
    202 != a.b &&
        (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "symbolic name missing where expected"));
    null != a.$[a.i] && U(a, a.i + " multiply declared");
    d = {};
    d.name = a.i;
    d.Kb = null;
    d.v = 0;
    d.domain = null;
    d.type = 118;
    d.ud = null;
    d.ua = null;
    d.assign = null;
    d.Ba = null;
    d.data = 0;
    d.Vc = null;
    d.T = null;
    V(a);
    205 == a.b && ((d.Kb = a.i), V(a));
    248 == a.b && ((d.domain = sh(a)), (d.v = zh(d.domain)));
    e = a.$[d.name] = {};
    e.type = 120;
    for (e.link = d; ;) {
        if (239 == a.b) V(a);
        else if (241 == a.b) break;
        if (eh(a, "integer"))
            f && U(a, "at most one integer allowed"),
                124 == d.type && U(a, "symbolic parameter cannot be integer"),
                101 != d.type && (d.type = 113),
                (f = 1),
                V(a);
        else if (eh(a, "binary")) b();
        else if (eh(a, "logical")) a.Ie || (ah(a, "keyword logical understood as binary"), (a.Ie = 1)), b();
        else if (eh(a, "symbolic"))
            k && U(a, "at most one symbolic allowed"),
                118 != d.type && U(a, "integer or binary parameter cannot be symbolic"),
                (null == d.ud && null == d.ua && null == d.assign && null == d.Ba) ||
                U(a, "keyword symbolic must precede any other parameter attributes"),
                (d.type = 124),
                (k = 1),
                V(a);
        else if (230 == a.b || 231 == a.b || 232 == a.b || 233 == a.b || 234 == a.b || 235 == a.b) {
            var h,
                l = {};
            switch (a.b) {
                case 230:
                    l.hd = 352;
                    h = a.i;
                    break;
                case 231:
                    l.hd = 353;
                    h = a.i;
                    break;
                case 232:
                    l.hd = 354;
                    h = a.i;
                    break;
                case 233:
                    l.hd = 355;
                    h = a.i;
                    break;
                case 234:
                    l.hd = 356;
                    h = a.i;
                    break;
                case 235:
                    (l.hd = 357), (h = a.i);
            }
            l.code = null;
            l.next = null;
            if (null == d.ud) d.ud = l;
            else {
                for (e = d.ud; null != e.next; e = e.next);
                e.next = l;
            }
            V(a);
            l.code = mh(a);
            118 != l.code.type && 124 != l.code.type && U(a, "expression following " + h + " has invalid type");
            124 != d.type && 124 == l.code.type && (l.code = W(316, l.code, 118, 0));
            124 == d.type && 124 != l.code.type && (l.code = W(317, l.code, 124, 0));
        } else if (213 == a.b || 224 == a.b) {
            224 != a.b || a.mg || (ah(a, "keyword within understood as in"), (a.mg = 1));
            V(a);
            l = { code: null, next: null };
            if (null == d.ua) d.ua = l;
            else {
                for (e = d.ua; null != e.next; e = e.next);
                e.next = l;
            }
            l.code = th(a);
            106 != l.code.type && U(a, "expression following in has invalid type");
            1 != l.code.v && U(a, "set expression following in must have dimension 1 rather than " + l.code.v);
        } else
            242 == a.b
                ? ((null == d.assign && null == d.Ba) || c(),
                    V(a),
                    (d.assign = mh(a)),
                    118 != d.assign.type && 124 != d.assign.type && U(a, "expression following := has invalid type"),
                    124 != d.type && 124 == d.assign.type && (d.assign = W(316, d.assign, 118, 0)),
                    124 == d.type && 124 != d.assign.type && (d.assign = W(317, d.assign, 124, 0)))
                : eh(a, "default")
                    ? ((null == d.assign && null == d.Ba) || c(),
                        V(a),
                        (d.Ba = mh(a)),
                        118 != d.Ba.type && 124 != d.Ba.type && U(a, "expression following default has invalid type"),
                        124 != d.type && 124 == d.Ba.type && (d.Ba = W(316, d.Ba, 118, 0)),
                        124 == d.type && 124 != d.Ba.type && (d.Ba = W(317, d.Ba, 124, 0)))
                    : U(a, "syntax error in parameter statement");
    }
    null != d.domain && uh(a, d.domain);
    V(a);
    return d;
}
function Nh(a) {
    function b() {
        d && U(a, "at most one binary allowed");
        e.type = 101;
        d = 1;
        V(a);
    }
    var c = 0,
        d = 0;
    a.Qb && U(a, "variable statement must precede solve statement");
    V(a);
    202 != a.b &&
        (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "symbolic name missing where expected"));
    null != a.$[a.i] && U(a, a.i + " multiply declared");
    var e = {};
    e.name = a.i;
    e.Kb = null;
    e.v = 0;
    e.domain = null;
    e.type = 118;
    e.S = null;
    e.Z = null;
    e.T = null;
    V(a);
    205 == a.b && ((e.Kb = a.i), V(a));
    248 == a.b && ((e.domain = sh(a)), (e.v = zh(e.domain)));
    var f = (a.$[e.name] = {});
    f.type = 127;
    for (f.link = e; ;) {
        if (239 == a.b) V(a);
        else if (241 == a.b) break;
        if (eh(a, "integer"))
            c && U(a, "at most one integer allowed"), 101 != e.type && (e.type = 113), (c = 1), V(a);
        else if (eh(a, "binary")) b();
        else if (eh(a, "logical")) a.Ie || (ah(a, "keyword logical understood as binary"), (a.Ie = 1)), b();
        else if (eh(a, "symbolic")) U(a, "variable cannot be symbolic");
        else if (233 == a.b)
            null != e.S &&
                (e.S == e.Z
                    ? U(a, "both fixed value and lower bound not allowed")
                    : U(a, "at most one lower bound allowed")),
                V(a),
                (e.S = mh(a)),
                124 == e.S.type && (e.S = W(316, e.S, 118, 0)),
                118 != e.S.type && U(a, "expression following >= has invalid type");
        else if (231 == a.b)
            null != e.Z &&
                (e.Z == e.S
                    ? U(a, "both fixed value and upper bound not allowed")
                    : U(a, "at most one upper bound allowed")),
                V(a),
                (e.Z = mh(a)),
                124 == e.Z.type && (e.Z = W(316, e.Z, 118, 0)),
                118 != e.Z.type && U(a, "expression following <= has invalid type");
        else if (232 == a.b) {
            if (null != e.S || null != e.Z)
                e.S == e.Z
                    ? U(a, "at most one fixed value allowed")
                    : null != e.S
                        ? U(a, "both lower bound and fixed value not allowed")
                        : U(a, "both upper bound and fixed value not allowed");
            f = a.i;
            V(a);
            e.S = mh(a);
            124 == e.S.type && (e.S = W(316, e.S, 118, 0));
            118 != e.S.type && U(a, "expression following " + f + " has invalid type");
            e.Z = e.S;
        } else
            230 == a.b || 234 == a.b || 235 == a.b
                ? U(a, "strict bound not allowed")
                : U(a, "syntax error in variable statement");
    }
    null != e.domain && uh(a, e.domain);
    V(a);
    return e;
}
function Oh(a) {
    function b() {
        U(a, "syntax error in constraint statement");
    }
    var c, d, e, f;
    a.Qb && U(a, "constraint statement must precede solve statement");
    eh(a, "subject")
        ? (V(a), eh(a, "to") || U(a, "keyword subject to incomplete"), V(a))
        : eh(a, "subj")
            ? (V(a), eh(a, "to") || U(a, "keyword subj to incomplete"), V(a))
            : 220 == a.b && V(a);
    202 != a.b &&
        (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "symbolic name missing where expected"));
    null != a.$[a.i] && U(a, a.i + " multiply declared");
    var g = {};
    g.name = a.i;
    g.Kb = null;
    g.v = 0;
    g.domain = null;
    g.type = 103;
    g.code = null;
    g.S = null;
    g.Z = null;
    g.T = null;
    V(a);
    205 == a.b && ((g.Kb = a.i), V(a));
    248 == a.b && ((g.domain = sh(a)), (g.v = zh(g.domain)));
    c = a.$[g.name] = {};
    c.type = 103;
    c.link = g;
    240 != a.b && U(a, "colon missing where expected");
    V(a);
    c = mh(a);
    124 == c.type && (c = W(316, c, 118, 0));
    118 != c.type && 110 != c.type && U(a, "expression following colon has invalid type");
    239 == a.b && V(a);
    switch (a.b) {
        case 231:
        case 233:
        case 232:
            break;
        case 230:
        case 234:
        case 235:
            U(a, "strict inequality not allowed");
            break;
        case 241:
            U(a, "constraint must be equality or inequality");
            break;
        default:
            b();
    }
    f = a.b;
    e = a.i;
    V(a);
    d = mh(a);
    124 == d.type && (d = W(316, d, 118, 0));
    118 != d.type && 110 != d.type && U(a, "expression following " + e + " has invalid type");
    239 == a.b && (V(a), 241 == a.b && b());
    230 == a.b || 231 == a.b || 232 == a.b || 233 == a.b || 234 == a.b || 235 == a.b
        ? ((232 != f && a.b == f) || U(a, "double inequality must be ... <= ... <= ... or ... >= ... >= ..."),
            110 == c.type && U(a, "leftmost expression in double inequality cannot be linear form"),
            V(a),
            (e = mh(a)),
            124 == e.type && (e = W(316, d, 118, 0)),
            118 != e.type &&
            110 != e.type &&
            U(a, "rightmost expression in double inequality constraint has invalid type"),
            110 == e.type && U(a, "rightmost expression in double inequality cannot be linear form"))
        : (e = null);
    null != g.domain && uh(a, g.domain);
    110 != c.type && (c = W(320, c, 110, 0));
    110 != d.type && (d = W(320, d, 110, 0));
    null != e && (e = W(320, e, 110, 0));
    if (null == e)
        switch (f) {
            case 231:
                g.code = c;
                g.S = null;
                g.Z = d;
                break;
            case 233:
                g.code = c;
                g.S = d;
                g.Z = null;
                break;
            case 232:
                (g.code = c), (g.S = d), (g.Z = d);
        }
    else
        switch (f) {
            case 231:
                g.code = d;
                g.S = c;
                g.Z = e;
                break;
            case 233:
                (g.code = d), (g.S = e), (g.Z = c);
        }
    241 != a.b && b();
    V(a);
    return g;
}
function Ph(a) {
    (!a.oc && eh(a, "end")) || (a.oc && Qh(a, "end"))
        ? (V(a), 241 == a.b ? V(a) : ah(a, "no semicolon following end statement; missing semicolon inserted"))
        : ah(a, "unexpected end of file; missing end statement inserted");
    201 != a.b && ah(a, "some text detected beyond end statement; text ignored");
}
function Rh(a, b) {
    var c = { C: {} };
    c.gb = a.gb;
    c.Uc = a.Uc;
    c.next = null;
    if (eh(a, "set")) b && U(a, "set statement not allowed here"), (c.type = 122), (c.C.set = Lh(a));
    else if (eh(a, "param")) b && U(a, "parameter statement not allowed here"), (c.type = 120), (c.C.W = Mh(a));
    else if (eh(a, "var")) b && U(a, "variable statement not allowed here"), (c.type = 127), (c.C.A = Nh(a));
    else if (eh(a, "subject") || eh(a, "subj") || 220 == a.b)
        b && U(a, "constraint statement not allowed here"), (c.type = 103), (c.C.K = Oh(a));
    else if (eh(a, "minimize") || eh(a, "maximize")) {
        b && U(a, "objective statement not allowed here");
        c.type = 103;
        var d = c.C,
            e,
            f;
        eh(a, "minimize") ? (f = 116) : eh(a, "maximize") && (f = 115);
        a.Qb && U(a, "objective statement must precede solve statement");
        V(a);
        202 != a.b &&
            (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "symbolic name missing where expected"));
        null != a.$[a.i] && U(a, a.i + " multiply declared");
        e = {};
        e.name = a.i;
        e.Kb = null;
        e.v = 0;
        e.domain = null;
        e.type = f;
        e.code = null;
        e.S = null;
        e.Z = null;
        e.T = null;
        V(a);
        205 == a.b && ((e.Kb = a.i), V(a));
        248 == a.b && ((e.domain = sh(a)), (e.v = zh(e.domain)));
        var g = (a.$[e.name] = {});
        g.type = 103;
        g.link = e;
        240 != a.b && U(a, "colon missing where expected");
        V(a);
        e.code = mh(a);
        124 == e.code.type && (e.code = W(316, e.code, 118, 0));
        118 == e.code.type && (e.code = W(320, e.code, 110, 0));
        110 != e.code.type && U(a, "expression following colon has invalid type");
        null != e.domain && uh(a, e.domain);
        241 != a.b && U(a, "syntax error in objective statement");
        V(a);
        d.K = e;
    } else if (eh(a, "table")) {
        b && U(a, "table statement not allowed here");
        c.type = 125;
        var d = c.C,
            k,
            h;
        V(a);
        202 != a.b &&
            (fh(a) ? U(a, "invalid use of reserved keyword " + a.i) : U(a, "symbolic name missing where expected"));
        null != a.$[a.i] && U(a, a.i + " multiply declared");
        e = { C: { ua: {}, Nc: {} } };
        e.name = a.i;
        V(a);
        205 == a.b ? ((e.Kb = a.i), V(a)) : (e.Kb = null);
        248 == a.b
            ? ((e.type = 119), (e.C.Nc.domain = sh(a)), eh(a, "OUT") || U(a, "keyword OUT missing where expected"))
            : ((e.type = 112), eh(a, "IN") || U(a, "keyword IN missing where expected"));
        V(a);
        for (e.a = f = null; ;)
            if (
                ((k = {}),
                    (239 != a.b && 240 != a.b && 241 != a.b) || U(a, "argument expression missing where expected"),
                    (k.code = mh(a)),
                    118 == k.code.type && (k.code = W(317, k.code, 124, 0)),
                    124 != k.code.type && U(a, "argument expression has invalid type"),
                    (k.next = null),
                    null == f ? (e.a = k) : (f.next = k),
                    (f = k),
                    239 == a.b)
            )
                V(a);
            else if (240 == a.b || 241 == a.b) break;
        240 == a.b ? V(a) : U(a, "colon missing where expected");
        switch (e.type) {
            case 112:
                202 == a.b
                    ? ((g = a.$[a.i]),
                        null == g && U(a, a.i + " not defined"),
                        122 != g.type && U(a, a.i + " not a set"),
                        (e.C.ua.set = g.link),
                        null != e.C.ua.set.assign && U(a, a.i + " needs no data"),
                        0 != e.C.ua.set.v && U(a, a.i + " must be a simple set"),
                        V(a),
                        252 == a.b ? V(a) : U(a, "delimiter <- missing where expected"))
                    : fh(a)
                        ? U(a, "invalid use of reserved keyword " + a.i)
                        : (e.C.ua.set = null);
                e.C.ua.Ue = g = null;
                f = 0;
                for (246 == a.b ? V(a) : U(a, "field list missing where expected"); ;)
                    if (
                        ((k = {}),
                            202 != a.b &&
                            (fh(a)
                                ? U(a, "invalid use of reserved keyword " + a.i)
                                : U(a, "field name missing where expected")),
                            (k.name = a.i),
                            V(a),
                            (k.next = null),
                            null == g ? (e.C.ua.Ue = k) : (g.next = k),
                            (g = k),
                            f++,
                            239 == a.b)
                    )
                        V(a);
                    else if (247 == a.b) break;
                    else U(a, "syntax error in field list");
                null != e.C.ua.set &&
                    e.C.ua.set.aa != f &&
                    U(
                        a,
                        "there must be " +
                        e.C.ua.set.aa +
                        " field" +
                        (1 == e.C.ua.set.aa ? "" : "s") +
                        " rather than " +
                        f
                    );
                V(a);
                for (e.C.ua.list = k = null; 239 == a.b;)
                    V(a),
                        (h = {}),
                        202 != a.b &&
                        (fh(a)
                            ? U(a, "invalid use of reserved keyword " + a.i)
                            : U(a, "parameter name missing where expected")),
                        (g = a.$[a.i]),
                        null == g && U(a, a.i + " not defined"),
                        120 != g.type && U(a, a.i + " not a parameter"),
                        (h.W = g.link),
                        h.W.v != f &&
                        U(
                            a,
                            a.i +
                            " must have " +
                            f +
                            " subscript" +
                            (1 == f ? "" : "s") +
                            " rather than " +
                            h.W.v
                        ),
                        null != h.W.assign && U(a, a.i + " needs no data"),
                        V(a),
                        251 == a.b
                            ? (V(a),
                                202 != a.b &&
                                (fh(a)
                                    ? U(a, "invalid use of reserved keyword " + a.i)
                                    : U(a, "field name missing where expected")),
                                (g = a.i),
                                V(a))
                            : (g = h.W.name),
                        (h.name = g),
                        (h.next = null),
                        null == k ? (e.C.ua.list = h) : (k.next = h),
                        (k = h);
                break;
            case 119:
                for (e.C.Nc.list = f = null; ;)
                    if (
                        ((k = {}),
                            (239 != a.b && 241 != a.b) || U(a, "expression missing where expected"),
                            202 == a.b ? (g = a.i) : (g = ""),
                            (k.code = mh(a)),
                            251 == a.b &&
                            (V(a),
                                202 != a.b &&
                                (fh(a)
                                    ? U(a, "invalid use of reserved keyword " + a.i)
                                    : U(a, "field name missing where expected")),
                                (g = a.i),
                                V(a)),
                            "" == g && U(a, "field name required"),
                            (k.name = g),
                            (k.next = null),
                            null == f ? (e.C.Nc.list = k) : (f.next = k),
                            (f = k),
                            239 == a.b)
                    )
                        V(a);
                    else if (241 == a.b) break;
                    else U(a, "syntax error in output list");
                uh(a, e.C.Nc.domain);
        }
        241 != a.b && U(a, "syntax error in table statement");
        V(a);
        d.tab = e;
    } else if (eh(a, "solve"))
        b && U(a, "solve statement not allowed here"),
            (c.type = 123),
            (d = c.C),
            a.Qb && U(a, "at most one solve statement allowed"),
            (a.Qb = 1),
            V(a),
            241 != a.b && U(a, "syntax error in solve statement"),
            V(a),
            (d.uh = null);
    else if (eh(a, "check"))
        (c.type = 102),
            (d = c.C),
            (e = { domain: null, code: null }),
            V(a),
            248 == a.b && (e.domain = sh(a)),
            240 == a.b && V(a),
            (e.code = rh(a)),
            114 != e.code.type && U(a, "expression has invalid type"),
            null != e.domain && uh(a, e.domain),
            241 != a.b && U(a, "syntax error in check statement"),
            V(a),
            (d.Mg = e);
    else if (eh(a, "display")) {
        c.type = 104;
        d = c.C;
        g = { domain: null };
        g.list = e = null;
        V(a);
        248 == a.b && (g.domain = sh(a));
        for (240 == a.b && V(a); ;) {
            f = { C: {}, type: 0, next: null };
            null == g.list ? (g.list = f) : (e.next = f);
            e = f;
            if (202 == a.b)
                if ((V(a), (k = a.b), dh(a), 239 != k && 241 != k)) (f.type = 108), (f.C.code = rh(a));
                else {
                    k = a.$[a.i];
                    null == k && U(a, a.i + " not defined");
                    f.type = k.type;
                    switch (k.type) {
                        case 111:
                            f.C.Ca = k.link;
                            break;
                        case 122:
                            f.C.set = k.link;
                            break;
                        case 120:
                            f.C.W = k.link;
                            break;
                        case 127:
                            f.C.A = k.link;
                            a.Qb || U(a, "invalid reference to variable " + f.C.A.name + " above solve statement");
                            break;
                        case 103:
                            (f.C.K = k.link),
                                a.Qb ||
                                U(
                                    a,
                                    "invalid reference to " +
                                    (103 == f.C.K.type ? "constraint" : "objective") +
                                    " " +
                                    f.C.K.name +
                                    " above solve statement"
                                );
                    }
                    V(a);
                }
            else (f.type = 108), (f.C.code = rh(a));
            if (239 == a.b) V(a);
            else break;
        }
        null != g.domain && uh(a, g.domain);
        241 != a.b && U(a, "syntax error in display statement");
        V(a);
        d.Ng = g;
    } else if (eh(a, "printf")) {
        c.type = 121;
        d = c.C;
        f = { domain: null, xd: null };
        f.list = g = null;
        V(a);
        248 == a.b && (f.domain = sh(a));
        240 == a.b && V(a);
        f.xd = mh(a);
        118 == f.xd.type && (f.xd = W(317, f.xd, 124, 0));
        for (124 != f.xd.type && U(a, "format expression has invalid type"); 239 == a.b;)
            V(a),
                (e = { code: null, next: null }),
                null == f.list ? (f.list = e) : (g.next = e),
                (g = e),
                (e.code = th(a)),
                118 != e.code.type &&
                124 != e.code.type &&
                114 != e.code.type &&
                U(a, "only numeric, symbolic, or logical expression allowed");
        null != f.domain && uh(a, f.domain);
        f.Ia = null;
        f.app = 0;
        if (234 == a.b || 250 == a.b)
            (f.app = 250 == a.b),
                V(a),
                (f.Ia = mh(a)),
                118 == f.Ia.type && (f.Ia = W(317, f.Ia, 124, 0)),
                124 != f.Ia.type && U(a, "file name expression has invalid type");
        241 != a.b && U(a, "syntax error in printf statement");
        V(a);
        d.ih = f;
    } else if (eh(a, "for")) {
        c.type = 109;
        d = c.C;
        f = { domain: null };
        f.list = g = null;
        V(a);
        248 != a.b && U(a, "indexing expression missing where expected");
        f.domain = sh(a);
        240 == a.b && V(a);
        if (248 != a.b) f.list = Rh(a, 1);
        else {
            for (V(a); 249 != a.b;) (e = Rh(a, 1)), null == g ? (f.list = e) : (g.next = e), (g = e);
            V(a);
        }
        uh(a, f.domain);
        d.Pg = f;
    } else
        202 == a.b
            ? (b && U(a, "constraint statement not allowed here"), (c.type = 103), (c.C.K = Oh(a)))
            : fh(a)
                ? U(a, "invalid use of reserved keyword " + a.i)
                : U(a, "syntax error in model section");
    return c;
}
function Sh(a) {
    var b, c;
    for (c = null; 201 != a.b && !eh(a, "data") && !eh(a, "end");)
        (b = Rh(a, 0)), null == c ? (a.uc = b) : (c.next = b), (c = b);
}
function Th(a, b) {
    var c,
        d = {};
    d.ba = b;
    d.next = null;
    if (null == a) a = d;
    else {
        for (c = a; null != c.next; c = c.next);
        c.next = d;
    }
    return a;
}
function Uh(a) {
    for (var b = 0; null != a; a = a.next) b++;
    return b;
}
function Vh(a) {
    for (var b = 0; null != a; a = a.next) null == a.ba && b++;
    return b;
}
function Wh(a) {
    for (var b = null; 0 < a--;) b = Th(b, null);
    return b;
}
function Xh(a) {
    return 204 == a.b || 203 == a.b || 205 == a.b;
}
function Qh(a, b) {
    return Xh(a) && a.i == b;
}
function Yh(a) {
    var b;
    b = 204 == a.b ? Zh(a.value) : $h(a.i);
    V(a);
    return b;
}
function ai(a, b, c) {
    var d, e;
    switch (a.b) {
        case 246:
            e = 247;
            break;
        case 244:
            e = 245;
    }
    0 == c && U(a, b + " cannot be subscripted");
    V(a);
    for (d = null; ;)
        if (
            (Xh(a)
                ? (d = Th(d, Yh(a)))
                : 227 == a.b
                    ? ((d = Th(d, null)), V(a))
                    : U(a, "number, symbol, or asterisk missing where expected"),
                239 == a.b)
        )
            V(a);
        else if (a.b == e) break;
        else U(a, "syntax error in slice");
    if (Uh(d) != c)
        switch (e) {
            case 247:
                U(a, b + " must have " + c + " subscript" + (1 == c ? "" : "s") + ", not " + Uh(d));
                break;
            case 245:
                U(a, b + " has dimension " + c + ", not " + Uh(d));
        }
    V(a);
    return d;
}
function bi(a, b) {
    var c;
    c = a.$[b];
    (null != c && 122 == c.type) || U(a, b + " not a set");
    c = c.link;
    (null == c.assign && null == c.Xc) || U(a, b + " needs no data");
    c.data = 1;
    return c;
}
function ci(a, b, c) {
    var d,
        e,
        f = null;
    for (d = null; null != c; c = c.next)
        null == c.ba
            ? (Xh(a) ||
                ((e = Vh(c)),
                    1 == e
                        ? U(a, "one item missing in data group beginning with " + di(f))
                        : U(a, e + " items missing in data group beginning with " + di(f))),
                (e = Yh(a)),
                null == f && (f = e))
            : (e = ei(c.ba)),
            (d = fi(d, e)),
            null != c.next && 239 == a.b && V(a);
    gi(a, b.value.set, d);
}
function hi(a, b, c, d) {
    var e, f, g, k, h;
    for (e = null; 242 != a.b;) Xh(a) || U(a, "number, symbol, or := missing where expected"), (e = Th(e, Yh(a)));
    for (V(a); Xh(a);)
        for (h = Yh(a), f = e; null != f; f = f.next) {
            var l = 0;
            if (!Qh(a, "+"))
                if (Qh(a, "-")) {
                    V(a);
                    continue;
                } else
                    (g = Uh(f)),
                        1 == g
                            ? U(a, "one item missing in data group beginning with " + di(h))
                            : U(a, g + " items missing in data group beginning with " + di(h));
            k = null;
            for (g = c; null != g; g = g.next)
                if (null == g.ba)
                    switch (++l) {
                        case 1:
                            k = fi(k, ei(d ? f.ba : h));
                            break;
                        case 2:
                            k = fi(k, ei(d ? h : f.ba));
                    }
                else k = fi(k, ei(g.ba));
            gi(a, b.value.set, k);
            V(a);
        }
}
function ii(a) {
    function b() {
        U(a, "slice currently used must specify 2 asterisks, not " + Vh(k));
    }
    function c() {
        U(a, "transpose indicator (tr) incomplete");
    }
    function d() {
        V(a);
        Qh(a, "tr") || c();
        2 != Vh(k) && b();
        V(a);
        245 != a.b && c();
        V(a);
        240 == a.b && V(a);
        h = 1;
        hi(a, g, k, h);
    }
    var e,
        f,
        g,
        k,
        h = 0;
    V(a);
    Xh(a) || U(a, "set name missing where expected");
    e = bi(a, a.i);
    V(a);
    f = null;
    if (246 == a.b) {
        0 == e.v && U(a, e.name + " cannot be subscripted");
        for (V(a); ;)
            if ((Xh(a) || U(a, "number or symbol missing where expected"), (f = fi(f, Yh(a))), 239 == a.b)) V(a);
            else if (247 == a.b) break;
            else U(a, "syntax error in subscript list");
        e.v != ji(f) &&
            U(a, e.name + " must have " + e.v + " subscript" + (1 == e.v ? "" : "s") + " rather than " + ji(f));
        V(a);
    } else 0 != e.v && U(a, e.name + " must be subscripted");
    null != ki(a, e.T, f) && U(a, e.name + li("[", f) + " already defined");
    g = mi(e.T, f);
    g.value.set = ni(a, 117, e.aa);
    for (k = Wh(e.aa); ;)
        if ((239 == a.b && V(a), 242 == a.b)) V(a);
        else if (244 == a.b)
            V(a),
                (f = Qh(a, "tr")),
                dh(a),
                f ? d() : ((k = ai(a, e.name, e.aa)), (h = 0), 0 == Vh(k) && ci(a, g, k));
        else if (Xh(a)) ci(a, g, k);
        else if (240 == a.b) 2 != Vh(k) && b(), V(a), hi(a, g, k, h);
        else if (244 == a.b) d();
        else if (241 == a.b) {
            V(a);
            break;
        } else U(a, "syntax error in set data block");
}
function oi(a, b) {
    var c;
    c = a.$[b];
    (null != c && 120 == c.type) || U(a, b + " not a parameter");
    c = c.link;
    null != c.assign && U(a, b + " needs no data");
    c.data && U(a, b + " already provided with data");
    c.data = 1;
    return c;
}
function pi(a, b, c) {
    null != b.Ba && U(a, "default value for " + b.name + " already specified in model section");
    b.Vc = c;
}
function qi(a, b, c) {
    null != ki(a, b.T, c) && U(a, b.name + li("[", c) + " already defined");
    c = mi(b.T, c);
    switch (b.type) {
        case 118:
        case 113:
        case 101:
            204 == a.b || U(a, b.name + " requires numeric data");
            b = c.value;
            c = a.value;
            V(a);
            b.U = c;
            break;
        case 124:
            c.value.ba = Yh(a);
    }
}
function ri(a, b, c) {
    var d,
        e,
        f = null;
    for (d = null; null != c; c = c.next)
        null == c.ba
            ? (Xh(a) || U(a, Vh(c) + 1 + " items missing in data group beginning with " + di(f)),
                (e = Yh(a)),
                null == f && (f = e))
            : (e = ei(c.ba)),
            (d = fi(d, e)),
            239 == a.b && V(a);
    Xh(a) || U(a, "one item missing in data group beginning with " + di(f));
    qi(a, b, d);
}
function si(a, b, c, d) {
    var e, f, g, k, h;
    for (e = null; 242 != a.b;) Xh(a) || U(a, "number, symbol, or := missing where expected"), (e = Th(e, Yh(a)));
    for (V(a); Xh(a);)
        for (h = Yh(a), f = e; null != f; f = f.next) {
            var l = 0;
            if (Qh(a, ".")) V(a);
            else {
                k = null;
                for (g = c; null != g; g = g.next)
                    if (null == g.ba)
                        switch (++l) {
                            case 1:
                                k = fi(k, ei(d ? f.ba : h));
                                break;
                            case 2:
                                k = fi(k, ei(d ? h : f.ba));
                        }
                    else k = fi(k, ei(g.ba));
                Xh(a) ||
                    ((g = Uh(f)),
                        1 == g
                            ? U(a, "one item missing in data group beginning with " + di(h))
                            : U(a, g + " items missing in data group beginning with " + di(h)));
                qi(a, b, k);
            }
        }
}
function ti(a, b) {
    var c = null,
        d,
        e,
        f,
        g,
        k = 0;
    g = null;
    Xh(a) &&
        (V(a),
            (e = a.b),
            dh(a),
            240 == e &&
            ((c = bi(a, a.i)),
                0 != c.v && U(a, c.name + " must be a simple set"),
                null != c.T.head && U(a, c.name + " already defined"),
                (mi(c.T, null).value.set = ni(a, 117, c.aa)),
                (g = c.name),
                (k = c.aa),
                V(a),
                V(a)));
    for (e = null; 242 != a.b;)
        Xh(a) || U(a, "parameter name or := missing where expected"),
            (d = oi(a, a.i)),
            0 == d.v && U(a, a.i + " not a subscripted parameter"),
            0 != k && d.v != k && U(a, g + " has dimension " + k + " while " + d.name + " has dimension " + d.v),
            null != b && pi(a, d, ei(b)),
            (e = Th(e, d)),
            (g = d.name),
            (k = d.v),
            V(a),
            239 == a.b && V(a);
    0 == Uh(e) && U(a, "at least one parameter name required");
    V(a);
    for (239 == a.b && V(a); Xh(a);) {
        g = null;
        for (f = 1; f <= k; f++)
            Xh(a) || ((d = Uh(e) + k - f + 1), U(a, d + " items missing in data group beginning with " + di(g.ba))),
                (g = fi(g, Yh(a))),
                f < k && 239 == a.b && V(a);
        null != c && gi(a, c.T.head.value.set, ui(g));
        239 == a.b && V(a);
        for (f = e; null != f; f = f.next)
            Qh(a, ".")
                ? V(a)
                : (Xh(a) ||
                    ((d = Uh(f)),
                        1 == d
                            ? U(a, "one item missing in data group beginning with " + di(g.ba))
                            : U(a, d + " items missing in data group beginning with " + di(g.ba))),
                    qi(a, f.ba, ui(g)),
                    null != f.next && 239 == a.b && V(a));
        239 == a.b && (V(a), Xh(a) || dh(a));
    }
    for (f = e; null != f; f = f.next) f.ba = null;
}
function vi(a) {
    function b() {
        U(a, e.name + " not a subscripted parameter");
    }
    function c() {
        U(a, "slice currently used must specify 2 asterisks, not " + Vh(g));
    }
    function d() {
        U(a, "transpose indicator (tr) incomplete");
    }
    var e,
        f = null,
        g,
        k = 0;
    V(a);
    Qh(a, "default") &&
        (V(a),
            Xh(a) || U(a, "default value missing where expected"),
            (f = Yh(a)),
            240 != a.b && U(a, "colon missing where expected"));
    if (240 == a.b)
        V(a),
            239 == a.b && V(a),
            ti(a, f),
            241 != a.b && U(a, "symbol, number, or semicolon missing where expected"),
            V(a);
    else
        for (
            Xh(a) || U(a, "parameter name missing where expected"),
            e = oi(a, a.i),
            V(a),
            Qh(a, "default") &&
            (V(a), Xh(a) || U(a, "default value missing where expected"), (f = Yh(a)), pi(a, e, f)),
            g = Wh(e.v);
            ;

        )
            if ((239 == a.b && V(a), 242 == a.b)) V(a);
            else if (246 == a.b) (g = ai(a, e.name, e.v)), (k = 0);
            else if (Xh(a)) ri(a, e, g);
            else if (240 == a.b) 0 == e.v && b(), 2 != Vh(g) && c(), V(a), si(a, e, g, k);
            else if (244 == a.b)
                V(a),
                    Qh(a, "tr") || d(),
                    0 == e.v && b(),
                    2 != Vh(g) && c(),
                    V(a),
                    245 != a.b && d(),
                    V(a),
                    240 == a.b && V(a),
                    (k = 1),
                    si(a, e, g, k);
            else if (241 == a.b) {
                V(a);
                break;
            } else U(a, "syntax error in parameter data block");
}
function wi(a) {
    for (; 201 != a.b && !Qh(a, "end");)
        Qh(a, "set") ? ii(a) : Qh(a, "param") ? vi(a) : U(a, "syntax error in data section");
}
function xi(a, b, c) {
    ((0 < b && 0 < c && b > 0.999 * t - c) || (0 > b && 0 > c && b < -0.999 * t - c)) &&
        U(a, b + " + " + c + "; floating-point overflow");
    return b + c;
}
function yi(a, b, c) {
    ((0 < b && 0 > c && b > 0.999 * t + c) || (0 > b && 0 < c && b < -0.999 * t + c)) &&
        U(a, b + " - " + c + "; floating-point overflow");
    return b - c;
}
function zi(a, b, c) {
    if (b < c) return 0;
    0 < b && 0 > c && b > 0.999 * t + c && U(a, b + " less " + c + "; floating-point overflow");
    return b - c;
}
function Ai(a, b, c) {
    1 < Math.abs(c) && Math.abs(b) > (0.999 * t) / Math.abs(c) && U(a, b + " * " + c + "; floating-point overflow");
    return b * c;
}
function Bi(a, b, c) {
    Math.abs(c) < fa && U(a, b + " / " + c + "; floating-point zero divide");
    1 > Math.abs(c) && Math.abs(b) > 0.999 * t * Math.abs(c) && U(a, b + " / " + c + "; floating-point overflow");
    return b / c;
}
function Ci(a, b, c) {
    Math.abs(c) < fa && U(a, b + " div " + c + "; floating-point zero divide");
    1 > Math.abs(c) && Math.abs(b) > 0.999 * t * Math.abs(c) && U(a, b + " div " + c + "; floating-point overflow");
    b /= c;
    return 0 < b ? Math.floor(b) : 0 > b ? Math.ceil(b) : 0;
}
function Di(a, b) {
    var c;
    if (0 == a) c = 0;
    else if (0 == b) c = a;
    else if (((c = Math.abs(a) % Math.abs(b)), 0 != c && (0 > a && (c = -c), (0 < a && 0 > b) || (0 > a && 0 < b))))
        c += b;
    return c;
}
function Ei(a, b, c) {
    ((0 == b && 0 >= c) || (0 > b && c != Math.floor(c))) && U(a, b + " ** " + c + "; result undefined");
    0 == b
        ? (a = Math.pow(b, c))
        : (((1 < Math.abs(b) && 1 < c && +Math.log(Math.abs(b)) > (0.999 * Math.log(t)) / c) ||
            (1 > Math.abs(b) && -1 > c && +Math.log(Math.abs(b)) < (0.999 * Math.log(t)) / c)) &&
            U(a, b + " ** " + c + "; floating-point overflow"),
            (a =
                (1 < Math.abs(b) && -1 > c && -Math.log(Math.abs(b)) < (0.999 * Math.log(t)) / c) ||
                    (1 > Math.abs(b) && 1 < c && -Math.log(Math.abs(b)) > (0.999 * Math.log(t)) / c)
                    ? 0
                    : Math.pow(b, c)));
    return a;
}
function Fi(a, b) {
    b > 0.999 * Math.log(t) && U(a, "exp(" + b + "); floating-point overflow");
    return Math.exp(b);
}
function Gi(a, b) {
    0 >= b && U(a, "log(" + b + "); non-positive argument");
    return Math.log(b);
}
function Hi(a, b) {
    0 >= b && U(a, "log10(" + b + "); non-positive argument");
    return Math.log(b) / Math.LN10;
}
function Ii(a, b) {
    0 > b && U(a, "sqrt(" + b + "); negative argument");
    return Math.sqrt(b);
}
function Ji(a, b) {
    (-1e6 <= b && 1e6 >= b) || U(a, "sin(" + b + "); argument too large");
    return Math.sin(b);
}
function Ki(a, b) {
    (-1e6 <= b && 1e6 >= b) || U(a, "cos(" + b + "); argument too large");
    return Math.cos(b);
}
function Li(a) {
    return Math.atan(a);
}
function Mi(a, b) {
    return Math.atan2(a, b);
}
function Ni(a, b, c) {
    c != Math.floor(c) && U(a, "round(" + b + ", " + c + "); non-integer second argument");
    18 >= c &&
        ((a = Math.pow(10, c)),
            Math.abs(b) < (0.999 * t) / a && ((b = Math.floor(b * a + 0.5)), 0 != b && (b /= a)));
    return b;
}
function Oi(a, b, c) {
    c != Math.floor(c) && U(a, "trunc(" + b + ", " + c + "); non-integer second argument");
    18 >= c &&
        ((a = Math.pow(10, c)),
            Math.abs(b) < (0.999 * t) / a && ((b = 0 <= b ? Math.floor(b * a) : Math.ceil(b * a)), 0 != b && (b /= a)));
    return b;
}
function Pi(a, b, c) {
    var d;
    b >= c && U(a, "Uniform(" + b + ", " + c + "); invalid range");
    d = Qi(a.Fd) / 2147483648;
    return (d = xi(a, b * (1 - d), c * d));
}
function Ri(a) {
    var b, c;
    do (b = -1 + 2 * (Qi(a.Fd) / 2147483648)), (c = -1 + 2 * (Qi(a.Fd) / 2147483648)), (b = b * b + c * c);
    while (1 < b || 0 == b);
    return c * Math.sqrt((-2 * Math.log(b)) / b);
}
function Si(a, b, c) {
    return xi(a, b, Ai(a, c, Ri(a)));
}
function Zh(a) {
    var b = {};
    b.U = a;
    b.P = null;
    return b;
}
function $h(a) {
    var b = { U: 0 };
    b.P = a;
    return b;
}
function ei(a) {
    var b = {};
    null == a.P ? ((b.U = a.U), (b.P = null)) : ((b.U = 0), (b.P = a.P));
    return b;
}
function Ti(a, b) {
    var c;
    if (null == a.P && null == b.P) c = a.U < b.U ? -1 : a.U > b.U ? 1 : 0;
    else if (null == a.P) c = -1;
    else if (null == b.P) c = 1;
    else {
        c = a.P;
        var d = b.P;
        c = c == d ? 0 : c > d ? 1 : -1;
    }
    return c;
}
function di(a) {
    var b;
    if (null == a.P) b = String(a.U);
    else {
        var c = function (a) {
            255 > e && ((b += a), e++);
        },
            d,
            e,
            f = a.P;
        if (ua(f[0]) || "_" == f[0])
            for (a = !1, d = 1; d < f.length; d++) {
                if (!(va(f[d]) || 0 <= "+-._".indexOf(f[d]))) {
                    a = !0;
                    break;
                }
            }
        else a = !0;
        b = "";
        e = 0;
        a && c("'");
        for (d = 0; d < f.length; d++) a && "'" == f[d] && c("'"), c(f[d]);
        a && c("'");
        255 == e && (b = b.slice(0, 252) + "...");
    }
    return b;
}
function fi(a, b) {
    var c,
        d = {};
    d.ba = b;
    d.next = null;
    if (null == a) a = d;
    else {
        for (c = a; null != c.next; c = c.next);
        c.next = d;
    }
    return a;
}
function ji(a) {
    for (var b = 0; null != a; a = a.next) b++;
    return b;
}
function ui(a) {
    var b, c;
    if (null == a) b = null;
    else {
        for (b = c = {}; null != a; a = a.next) (c.ba = ei(a.ba)), null != a.next && (c = c.next = {});
        c.next = null;
    }
    return b;
}
function Ui(a, b) {
    var c, d, e;
    c = a;
    for (d = b; null != c; c = c.next, d = d.next) if (((e = Ti(c.ba, d.ba)), 0 != e)) return e;
    return 0;
}
function Vi(a, b) {
    for (var c = null, d = 1, e = a; d <= b; d++, e = e.next) c = fi(c, ei(e.ba));
    return c;
}
function li(a, b) {
    function c(a) {
        255 > f && (g += a);
        f++;
    }
    var d,
        e,
        f = 0,
        g = "",
        k = "",
        h = ji(b);
    "[" == a && 0 < h && c("[");
    "(" == a && 1 < h && c("(");
    for (d = b; null != d; d = d.next) for (d != b && c(","), k = di(d.ba), e = 0; e < k.length; e++) c(k[e]);
    "[" == a && 0 < h && c("]");
    "(" == a && 1 < h && c(")");
    255 == f && (g = g.slice(0, 252) + "...");
    return g;
}
function Wi(a, b) {
    mi(a, b).value.Zg = null;
}
function gi(a, b, c) {
    null != ki(a, b, c) && U(a, "duplicate tuple " + li("(", c) + " detected");
    Wi(b, c);
}
function Xi(a, b) {
    var c, d;
    c = ni(a, 117, b.v);
    for (d = b.head; null != d; d = d.next) Wi(c, ui(d.D));
    return c;
}
function Yi(a, b, c, d) {
    var e;
    0 == d && U(a, b + " .. " + c + " by " + d + "; zero stride not allowed");
    e = 0 < c && 0 > b && c > 0.999 * t + b ? +t : 0 > c && 0 < b && c < -0.999 * t + b ? -t : c - b;
    1 > Math.abs(d) && Math.abs(e) > 0.999 * t * Math.abs(d)
        ? (e = (0 < e && 0 < d) || (0 > e && 0 > d) ? +t : 0)
        : ((e = Math.floor(e / d) + 1), 0 > e && (e = 0));
    2147483646 < e && U(a, b + " .. " + c + " by " + d + "; set too large");
    return (e + 0.5) | 0;
}
function Zi(a, b, c, d, e) {
    1 <= e && Yi(a, b, c, d);
    return b + (e - 1) * d;
}
function $i(a) {
    var b;
    0 == a ? (b = null) : ((b = {}), (b.B = a), (b.A = null), (b.next = null));
    return b;
}
function aj(a) {
    var b, c;
    if (null == a) b = null;
    else {
        for (b = c = {}; null != a; a = a.next) (c.B = a.B), (c.A = a.A), null != a.next && (c = c.next = {});
        c.next = null;
    }
    return b;
}
function bj(a, b, c, d, e) {
    var f = null,
        g,
        k = 0;
    for (g = c; null != g; g = g.next)
        null == g.A ? (k = xi(a, k, Ai(a, b, g.B))) : (g.A.na = xi(a, g.A.na, Ai(a, b, g.B)));
    for (g = e; null != g; g = g.next)
        null == g.A ? (k = xi(a, k, Ai(a, d, g.B))) : (g.A.na = xi(a, g.A.na, Ai(a, d, g.B)));
    for (g = c; null != g; g = g.next)
        null != g.A && 0 != g.A.na && ((a = {}), (a.B = g.A.na), (a.A = g.A), (a.next = f), (f = a), (g.A.na = 0));
    for (g = e; null != g; g = g.next)
        null != g.A && 0 != g.A.na && ((a = {}), (a.B = g.A.na), (a.A = g.A), (a.next = f), (f = a), (g.A.na = 0));
    0 != k && ((a = {}), (a.B = k), (a.A = null), (a.next = f), (f = a));
    return f;
}
function cj(a, b, c) {
    for (var d = null, e, f = 0; null != b;)
        (e = b), (b = b.next), null == e.A ? (f = xi(a, f, e.B)) : ((e.next = d), (d = e));
    c(f);
    return d;
}
function dj(a, b) {
    switch (a) {
        case 117:
            b.Zg = null;
            break;
        case 118:
            b.U = 0;
            break;
        case 124:
            b.ba = null;
            break;
        case 114:
            b.og = 0;
            break;
        case 126:
            b.D = null;
            break;
        case 106:
            b.set = null;
            break;
        case 107:
            b.A = null;
            break;
        case 110:
            b.form = null;
            break;
        case 105:
            b.K = null;
    }
}
function ni(a, b, c) {
    var d = {};
    d.type = b;
    d.v = c;
    d.size = 0;
    d.head = null;
    d.$a = null;
    d.$ = !1;
    d.ga = null;
    d.next = a.lg;
    null != d.next && (d.next.ga = d);
    return (a.lg = d);
}
function ej(a, b, c) {
    return Ui(b, c);
}
function ki(a, b, c) {
    if (30 < b.size && !b.$) {
        var d = { root: null };
        d.ug = ej;
        d.info = a;
        d.size = 0;
        d.height = 0;
        b.$ = d;
        for (a = b.head; null != a; a = a.next) qe(b.$, a.D).link = a;
    }
    if (b.$) {
        b = b.$;
        for (a = b.root; null != a;) {
            d = b.ug(b.info, c, a.key);
            if (0 == d) break;
            a = 0 > d ? a.left : a.right;
        }
        c = a;
        a = null == c ? null : c.link;
    } else for (a = b.head; null != a && 0 != Ui(a.D, c); a = a.next);
    return a;
}
function mi(a, b) {
    var c = {};
    c.D = b;
    c.next = null;
    c.value = {};
    a.size++;
    null == a.head ? (a.head = c) : (a.$a.next = c);
    a.$a = c;
    null != a.$ && (qe(a.$, c.D).link = c);
    return c;
}
function fj(a) {
    var b;
    if (null != a.Je)
        for (b = a.list, a = a.Je; null != b; b = b.next, a = a.next)
            a: {
                var c = b,
                    d = a.ba,
                    e = void 0,
                    f = void 0;
                if (null != c.value) {
                    if (0 == Ti(c.value, d)) break a;
                    c.value = null;
                }
                for (e = c.list; null != e; e = e.a.index.next)
                    for (f = e; null != f; f = f.V) f.valid && ((f.valid = 0), dj(f.type, f.value));
                c.value = ei(d);
            }
}
function gj(a, b, c, d, e) {
    var f,
        g = 0;
    if (!hj(a, b.code, c)) return 1;
    f = b.Je;
    b.Je = c;
    fj(b);
    e(a, d);
    b.Je = f;
    fj(b);
    return g;
}
function ij(a, b) {
    if (null != b.block) {
        var c,
            d,
            e = null,
            f = null;
        c = b.block;
        b.block = c.next;
        for (d = c.list; null != d; d = d.next)
            null == e ? (e = f = {}) : (f = f.next = {}),
                null == d.code ? ((f.ba = b.D.ba), (b.D = b.D.next)) : (f.ba = jj(a, d.code));
        f.next = null;
        gj(a, c, e, b, ij) && (b.Te = 1);
        for (d = c.list; null != d; d = d.next) e = e.next;
    } else null == b.domain.code || kj(a, b.domain.code) ? b.Xd(a, b.info) : (b.Te = 2);
}
function lj(a, b, c, d, e) {
    var f = {};
    null == b
        ? (e(a, d), (f.Te = 0))
        : ((f.domain = b), (f.block = b.list), (f.D = c), (f.info = d), (f.Xd = e), (f.Te = 0), ij(a, f));
    return f.Te;
}
function mj(a, b) {
    if (null != b.block) {
        var c, d, e;
        c = b.block;
        b.block = c.next;
        e = null;
        for (d = c.list; null != d; d = d.next) null != d.code && (e = fi(e, jj(a, d.code)));
        if (372 == c.code.Wa) {
            var f, g, k, h;
            g = X(a, c.code.a.a.x);
            k = X(a, c.code.a.a.y);
            null == c.code.a.a.z ? (h = 1) : (h = X(a, c.code.a.a.z));
            e = Yi(a, g, k, h);
            d = fi(null, Zh(0));
            for (f = 1; f <= e && b.Sf; f++) (d.ba.U = Zi(a, g, k, h, f)), gj(a, c, d, b, mj);
        } else
            for (h = nj(a, c.code).head; null != h && b.Sf; h = h.next) {
                f = h.D;
                g = e;
                k = !1;
                for (d = c.list; null != d; d = d.next) {
                    if (null != d.code) {
                        if (0 != Ti(f.ba, g.ba)) {
                            k = !0;
                            break;
                        }
                        g = g.next;
                    }
                    f = f.next;
                }
                k || gj(a, c, h.D, b, mj);
            }
        b.block = c;
    } else if (null == b.domain.code || kj(a, b.domain.code)) b.Sf = !b.Xd(a, b.info);
}
function oj(a, b, c, d) {
    var e = {};
    null == b ? d(a, c) : ((e.domain = b), (e.block = b.list), (e.Sf = 1), (e.info = c), (e.Xd = d), mj(a, e));
}
function pj(a, b, c) {
    U(a, b + li("[", c) + " out of domain");
}
function qj(a) {
    var b = null;
    if (null != a)
        for (a = a.list; null != a; a = a.next)
            for (var c = a.list; null != c; c = c.next) null == c.code && (b = fi(b, ei(c.value)));
    return b;
}
function rj(a, b, c, d) {
    for (var e = b.xf, f = 1; null != e; e = e.next, f++)
        for (var g = d.head; null != g; g = g.next)
            if (!hj(a, e.code, g.D)) {
                var k = li("(", g.D);
                U(a, b.name + li("[", c) + " contains " + k + " which not within specified set; see (" + f + ")");
            }
}
function sj(a, b, c) {
    function d() {
        rj(a, b, c, e);
        f = mi(b.T, ui(c));
        f.value.set = e;
    }
    var e,
        f = ki(a, b.T, c);
    null != f
        ? (e = f.value.set)
        : null != b.assign
            ? ((e = nj(a, b.assign)), d())
            : null != b.Ba
                ? ((e = nj(a, b.Ba)), d())
                : U(a, "no value for " + b.name + li("[", c));
    return e;
}
function tj(a, b) {
    null != b.ka ? rj(a, b.set, b.ka.D, b.ka.value.set) : (b.me = sj(a, b.set, b.D));
}
function uj(a, b) {
    var c = b.Xc,
        d,
        e,
        f,
        g = Array(20);
    y("Generating " + b.name + "...");
    d = c.set;
    oj(a, d.domain, d, vj);
    for (d = c.set.T.head.value.set.head; null != d; d = d.next) {
        f = ui(d.D);
        for (e = 0; e < c.set.aa; e++) g[e] = null;
        for (e = 0; null != f; f = f.next) g[c.ca[e++] - 1] = f;
        for (e = 0; e < c.set.aa; e++) g[e].next = g[e + 1];
        0 == b.v ? (f = null) : ((f = g[0]), (g[b.v - 1].next = null));
        e = ki(a, b.T, f);
        null == e && ((e = mi(b.T, f)), (e.value.set = ni(a, 117, b.aa)));
        f = g[b.v];
        g[c.set.aa - 1].next = null;
        Wi(e.value.set, f);
    }
    b.data = 1;
}
function wj(a, b, c) {
    var d = {};
    d.set = b;
    d.D = c;
    null != b.Xc && 0 == b.data && uj(a, b);
    if (1 == b.data)
        for (
            c = b.T.$a, b.data = 2, d.ka = b.T.head;
            null != d.ka && (lj(a, b.domain, d.ka.D, d, tj) && pj(a, b.name, d.ka.D), d.ka != c);
            d.ka = d.ka.next
        );
    d.ka = null;
    lj(a, d.set.domain, d.D, d, tj) && pj(a, b.name, d.D);
    return d.me;
}
function vj(a, b) {
    var c = qj(b.domain);
    wj(a, b, c);
    return 0;
}
function xj(a, b, c, d) {
    var e, f;
    switch (b.type) {
        case 113:
            d != Math.floor(d) && U(a, b.name + li("[", c) + " = " + d + " not integer");
            break;
        case 101:
            0 != d && 1 != d && U(a, b.name + li("[", c) + " = " + d + " not binary");
    }
    e = b.ud;
    for (f = 1; null != e; e = e.next, f++) {
        var g = function (e) {
            U(a, b.name + li("[", c) + " = " + d + " not " + e + " " + k + "; see (" + f + ")");
        },
            k;
        k = X(a, e.code);
        switch (e.hd) {
            case 352:
                d < k || g("<");
                break;
            case 353:
                d <= k || g("<=");
                break;
            case 354:
                d != k && g("=");
                break;
            case 355:
                d >= k || g(">=");
                break;
            case 356:
                d > k || g(">");
                break;
            case 357:
                d == k && g("<>");
        }
    }
    f = 1;
    for (e = b.ua; null != e; e = e.next, f++)
        (g = fi(null, Zh(d))),
            hj(a, e.code, g) || U(a, b.name + li("[", c) + " = " + d + " not in specified set; see (" + f + ")");
}
function yj(a, b, c) {
    function d(d) {
        xj(a, b, c, d);
        e = mi(b.T, ui(c));
        return (e.value.U = d);
    }
    var e = ki(a, b.T, c);
    return null != e
        ? e.value.U
        : null != b.assign
            ? d(X(a, b.assign))
            : null != b.Ba
                ? d(X(a, b.Ba))
                : null != b.Vc
                    ? (null != b.Vc.P && U(a, "cannot convert " + di(b.Vc) + " to floating-point number"), d(b.Vc.U))
                    : U(a, "no value for " + b.name + li("[", c));
}
function zj(a, b) {
    null != b.ka ? xj(a, b.W, b.ka.D, b.ka.value.U) : (b.value = yj(a, b.W, b.D));
}
function Aj(a, b, c) {
    var d = {};
    d.W = b;
    d.D = c;
    if (1 == b.data)
        for (
            c = b.T.$a, b.data = 2, d.ka = b.T.head;
            null != d.ka && (lj(a, b.domain, d.ka.D, d, zj) && pj(a, b.name, d.ka.D), d.ka != c);
            d.ka = d.ka.next
        );
    d.ka = null;
    lj(a, d.W.domain, d.D, d, zj) && pj(a, b.name, d.D);
    return d.value;
}
function Bj(a, b, c, d) {
    var e,
        f = 1;
    for (e = b.ud; null != e; e = e.next, f++) {
        var g;
        g = jj(a, e.code);
        switch (e.hd) {
            case 352:
                0 > Ti(d, g) || ((g = di(g)), U(a, b.name + li("[", c) + " = " + di(d) + " not < " + g));
                break;
            case 353:
                0 >= Ti(d, g) || ((g = di(g)), U(a, b.name + li("[", c) + " = " + di(d) + " not <= " + g));
                break;
            case 354:
                0 != Ti(d, g) && ((g = di(g)), U(a, b.name + li("[", c) + " = " + di(d) + " not = " + g));
                break;
            case 355:
                0 <= Ti(d, g) || ((g = di(g)), U(a, b.name + li("[", c) + " = " + di(d) + " not >= " + g));
                break;
            case 356:
                0 < Ti(d, g) || ((g = di(g)), U(a, b.name + li("[", c) + " = " + di(d) + " not > " + g));
                break;
            case 357:
                0 == Ti(d, g) && ((g = di(g)), U(a, b.name + li("[", c) + " <> " + di(d) + " not > " + g));
        }
    }
    f = 1;
    for (e = b.ua; null != e; e = e.next, f++)
        (g = fi(null, ei(d))),
            hj(a, e.code, g) || U(a, b.name, li("[", c) + " = " + di(d) + " not in specified set; see (" + f + ")");
}
function Cj(a, b, c) {
    function d(d) {
        Bj(a, b, c, d);
        e = mi(b.T, ui(c));
        e.value.ba = ei(d);
        return d;
    }
    var e = ki(a, b.T, c);
    return null != e
        ? ei(e.value.ba)
        : null != b.assign
            ? d(jj(a, b.assign))
            : null != b.Ba
                ? d(jj(a, b.Ba))
                : null != b.Vc
                    ? ei(b.Vc)
                    : U(a, "no value for " + b.name + li("[", c));
}
function Dj(a, b) {
    null != b.ka ? Bj(a, b.W, b.ka.D, b.ka.value.ba) : (b.value = Cj(a, b.W, b.D));
}
function Ej(a, b, c) {
    var d = {};
    d.W = b;
    d.D = c;
    if (1 == b.data)
        for (
            c = b.T.$a, b.data = 2, d.ka = b.T.head;
            null != d.ka && (lj(a, b.domain, d.ka.D, d, Dj) && pj(a, b.name, d.ka.D), d.ka != c);
            d.ka = d.ka.next
        );
    d.ka = null;
    lj(a, d.W.domain, d.D, d, Dj) && pj(a, b.name, d.D);
    return d.value;
}
function Fj(a, b) {
    var c = qj(b.domain);
    switch (b.type) {
        case 118:
        case 113:
        case 101:
            Aj(a, b, c);
            break;
        case 124:
            Ej(a, b, c);
    }
    return 0;
}
function Gj(a, b) {
    var c = b.A,
        d = b.D,
        e = ki(a, c.T, d);
    null != e
        ? (d = e.value.A)
        : ((e = mi(c.T, ui(d))),
            (d = e.value.A = {}),
            (d.H = 0),
            (d.A = c),
            (d.ka = e),
            null == c.S ? (d.S = 0) : (d.S = X(a, c.S)),
            null == c.Z ? (d.Z = 0) : c.Z == c.S ? (d.Z = d.S) : (d.Z = X(a, c.Z)),
            (d.na = 0),
            (d.stat = 0),
            (d.w = d.M = 0));
    b.me = d;
}
function Hj(a, b, c) {
    var d = {};
    d.A = b;
    d.D = c;
    lj(a, d.A.domain, d.D, d, Gj) && pj(a, b.name, d.D);
    return d.me;
}
function Ij(a, b, c) {
    var d = null,
        e = ki(a, b.T, c);
    if (null != e) c = e.value.K;
    else {
        e = mi(b.T, ui(c));
        c = e.value.K = {};
        c.ia = 0;
        c.K = b;
        c.ka = e;
        c.form = Jj(a, b.code);
        if (null == b.S && null == b.Z)
            (c.form = cj(a, c.form, function (a) {
                d = a;
            })),
                (c.S = c.Z = -d);
        else if (null != b.S && null == b.Z)
            (c.form = bj(a, 1, c.form, -1, Jj(a, b.S))),
                (c.form = cj(a, c.form, function (a) {
                    d = a;
                })),
                (c.S = -d),
                (c.Z = 0);
        else if (null == b.S && null != b.Z)
            (c.form = bj(a, 1, c.form, -1, Jj(a, b.Z))),
                (c.form = cj(a, c.form, function (a) {
                    d = a;
                })),
                (c.S = 0),
                (c.Z = -d);
        else if (b.S == b.Z)
            (c.form = bj(a, 1, c.form, -1, Jj(a, b.S))),
                (c.form = cj(a, c.form, function (a) {
                    d = a;
                })),
                (c.S = c.Z = -d);
        else {
            var f = null,
                g = null;
            c.form = cj(a, c.form, function (a) {
                d = a;
            });
            cj(a, Jj(a, b.S), function (a) {
                f = a;
            });
            cj(a, Jj(a, b.Z), function (a) {
                g = a;
            });
            c.S = yi(a, f, d);
            c.Z = yi(a, g, d);
        }
        c.stat = 0;
        c.w = c.M = 0;
    }
    return c;
}
function Kj(a, b) {
    b.me = Ij(a, b.K, b.D);
}
function Lj(a, b, c) {
    var d = {};
    d.K = b;
    d.D = c;
    lj(a, d.K.domain, d.D, d, Kj) && pj(a, b.name, d.D);
    return d.me;
}
function Mj(a, b) {
    var c = qj(b.domain);
    Lj(a, b, c);
    return 0;
}
function Nj(a, b) {
    var c = X(a, b.code.a.loop.x);
    switch (b.code.Wa) {
        case 377:
            b.value = xi(a, b.value, c);
            break;
        case 378:
            b.value = Ai(a, b.value, c);
            break;
        case 379:
            b.value > c && (b.value = c);
            break;
        case 380:
            b.value < c && (b.value = c);
    }
    return 0;
}
function X(a, b) {
    var c, d, e;
    b.X && b.valid && ((b.valid = 0), dj(b.type, b.value));
    if (b.valid) return b.value.U;
    switch (b.Wa) {
        case 301:
            c = b.a.U;
            break;
        case 304:
            d = null;
            for (e = b.a.W.list; null != e; e = e.next) d = fi(d, jj(a, e.x));
            c = Aj(a, b.a.W.W, d);
            break;
        case 307:
            d = null;
            for (e = b.a.A.list; null != e; e = e.next) d = fi(d, jj(a, e.x));
            e = Hj(a, b.a.A.A, d);
            switch (b.a.A.Ac) {
                case 1:
                    null == e.A.S ? (c = -t) : (c = e.S);
                    break;
                case 2:
                    null == e.A.Z ? (c = +t) : (c = e.Z);
                    break;
                case 3:
                    c = e.stat;
                    break;
                case 4:
                    c = e.w;
                    break;
                case 5:
                    c = e.M;
            }
            break;
        case 308:
            d = null;
            for (e = b.a.K.list; null != e; e = e.next) d = fi(d, jj(a, e.x));
            e = Lj(a, b.a.K.K, d);
            switch (b.a.K.Ac) {
                case 1:
                    null == e.K.S ? (c = -t) : (c = e.S);
                    break;
                case 2:
                    null == e.K.Z ? (c = +t) : (c = e.Z);
                    break;
                case 3:
                    c = e.stat;
                    break;
                case 4:
                    c = e.w;
                    break;
                case 5:
                    c = e.M;
            }
            break;
        case 312:
            c = Oj(a.Fd);
            break;
        case 313:
            c = Qi(a.Fd) / 2147483648;
            break;
        case 314:
            c = Ri(a);
            break;
        case 315:
            c = Math.round(Date.now() / 1e3);
            break;
        case 316:
            e = jj(a, b.a.a.x);
            null == e.P
                ? (c = e.U)
                : tg(e.P, function (a) {
                    c = a;
                }) && U(a, "cannot convert " + di(e) + " to floating-point number");
            break;
        case 321:
            c = +X(a, b.a.a.x);
            break;
        case 322:
            c = -X(a, b.a.a.x);
            break;
        case 324:
            c = Math.abs(X(a, b.a.a.x));
            break;
        case 325:
            c = Math.ceil(X(a, b.a.a.x));
            break;
        case 326:
            c = Math.floor(X(a, b.a.a.x));
            break;
        case 327:
            c = Fi(a, X(a, b.a.a.x));
            break;
        case 328:
            c = Gi(a, X(a, b.a.a.x));
            break;
        case 329:
            c = Hi(a, X(a, b.a.a.x));
            break;
        case 330:
            c = Ii(a, X(a, b.a.a.x));
            break;
        case 331:
            c = Ji(a, X(a, b.a.a.x));
            break;
        case 332:
            c = Ki(a, X(a, b.a.a.x));
            break;
        case 333:
            c = Li(X(a, b.a.a.x));
            break;
        case 346:
            c = Mi(X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 334:
            c = Ni(a, X(a, b.a.a.x), 0);
            break;
        case 347:
            c = Ni(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 335:
            c = Oi(a, X(a, b.a.a.x), 0);
            break;
        case 348:
            c = Oi(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 338:
            c = xi(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 339:
            c = yi(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 340:
            c = zi(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 341:
            c = Ai(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 342:
            c = Bi(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 343:
            c = Ci(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 344:
            c = Di(X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 345:
            c = Ei(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 349:
            c = Pi(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 350:
            c = Si(a, X(a, b.a.a.x), X(a, b.a.a.y));
            break;
        case 336:
            c = nj(a, b.a.a.x).size;
            break;
        case 337:
            e = jj(a, b.a.a.x);
            null == e.P ? (d = String(e.U)) : (d = e.P);
            c = d.length;
            break;
        case 370:
            var f;
            e = jj(a, b.a.a.x);
            null == e.P ? (d = String(e.U)) : (d = e.P);
            e = jj(a, b.a.a.y);
            null == e.P ? (f = String(e.U)) : (f = e.P);
            c = Pj(a, d, f);
            break;
        case 373:
            kj(a, b.a.a.x) ? (c = X(a, b.a.a.y)) : null == b.a.a.z ? (c = 0) : (c = X(a, b.a.a.z));
            break;
        case 375:
            c = +t;
            for (e = b.a.list; null != e; e = e.next) (d = X(a, e.x)), c > d && (c = d);
            break;
        case 376:
            c = -t;
            for (e = b.a.list; null != e; e = e.next) (d = X(a, e.x)), c < d && (c = d);
            break;
        case 377:
            e = {};
            e.code = b;
            e.value = 0;
            oj(a, b.a.loop.domain, e, Nj);
            c = e.value;
            break;
        case 378:
            e = {};
            e.code = b;
            e.value = 1;
            oj(a, b.a.loop.domain, e, Nj);
            c = e.value;
            break;
        case 379:
            e = {};
            e.code = b;
            e.value = +t;
            oj(a, b.a.loop.domain, e, Nj);
            e.value == +t && U(a, "min{} over empty set; result undefined");
            c = e.value;
            break;
        case 380:
            (e = {}),
                (e.code = b),
                (e.value = -t),
                oj(a, b.a.loop.domain, e, Nj),
                e.value == -t && U(a, "max{} over empty set; result undefined"),
                (c = e.value);
    }
    b.valid = 1;
    return (b.value.U = c);
}
function jj(a, b) {
    var c, d;
    b.X && b.valid && ((b.valid = 0), dj(b.type, b.value));
    if (b.valid) return ei(b.value.ba);
    switch (b.Wa) {
        case 302:
            c = $h(b.a.P);
            break;
        case 303:
            c = ei(b.a.index.Ca.value);
            break;
        case 305:
            var e, f;
            e = null;
            for (f = b.a.W.list; null != f; f = f.next) e = fi(e, jj(a, f.x));
            c = Ej(a, b.a.W.W, e);
            break;
        case 317:
            c = Zh(X(a, b.a.a.x));
            break;
        case 351:
            var g = jj(a, b.a.a.x);
            d = jj(a, b.a.a.y);
            null == g.P ? (e = String(g.U)) : (e = g.P);
            null == d.P ? (f = String(d.U)) : (f = d.P);
            c = $h(e + f);
            break;
        case 373:
            c = kj(a, b.a.a.x) ? jj(a, b.a.a.y) : null == b.a.a.z ? Zh(0) : jj(a, b.a.a.z);
            break;
        case 369:
        case 374:
            var k;
            c = jj(a, b.a.a.x);
            null == c.P ? (d = String(c.U)) : (d = c.P);
            369 == b.Wa
                ? ((e = X(a, b.a.a.y)),
                    e != Math.floor(e) && U(a, "substr('...', " + e + "); non-integer second argument"),
                    (1 > e || e > d.length + 1) && U(a, "substr('...', " + e + "); substring out of range"))
                : ((e = X(a, b.a.a.y)),
                    (k = X(a, b.a.a.z)),
                    (e == Math.floor(e) && k == Math.floor(k)) ||
                    U(a, "substr('...', " + e + ", " + k + "); non-integer second and/or third argument"),
                    (1 > e || 0 > k || e + k > d.length + 1) &&
                    U(a, "substr('...', " + e + ", " + k + "); substring out of range"));
            c = $h(d.slice(e - 1, e + k - 1));
            break;
        case 371:
            (e = X(a, b.a.a.x)),
                (f = jj(a, b.a.a.y)),
                null == f.P ? (g = String(f.U)) : (g = f.P),
                (d = Qj(a, e, g)),
                (c = $h(d));
    }
    b.valid = 1;
    b.value.ba = ei(c);
    return c;
}
function Rj(a, b) {
    var c = 0;
    switch (b.code.Wa) {
        case 381:
            b.value &= kj(a, b.code.a.loop.x);
            b.value || (c = 1);
            break;
        case 382:
            (b.value |= kj(a, b.code.a.loop.x)), b.value && (c = 1);
    }
    return c;
}
function kj(a, b) {
    var c, d;
    b.X && b.valid && ((b.valid = 0), dj(b.type, b.value));
    if (b.valid) return b.value.og;
    switch (b.Wa) {
        case 318:
            c = 0 != X(a, b.a.a.x);
            break;
        case 323:
            c = !kj(a, b.a.a.x);
            break;
        case 352:
            118 == b.a.a.x.type
                ? (c = X(a, b.a.a.x) < X(a, b.a.a.y))
                : ((c = jj(a, b.a.a.x)), (d = jj(a, b.a.a.y)), (c = 0 > Ti(c, d)));
            break;
        case 353:
            118 == b.a.a.x.type
                ? (c = X(a, b.a.a.x) <= X(a, b.a.a.y))
                : ((c = jj(a, b.a.a.x)), (d = jj(a, b.a.a.y)), (c = 0 >= Ti(c, d)));
            break;
        case 354:
            118 == b.a.a.x.type
                ? (c = X(a, b.a.a.x) == X(a, b.a.a.y))
                : ((c = jj(a, b.a.a.x)), (d = jj(a, b.a.a.y)), (c = 0 == Ti(c, d)));
            break;
        case 355:
            118 == b.a.a.x.type
                ? (c = X(a, b.a.a.x) >= X(a, b.a.a.y))
                : ((c = jj(a, b.a.a.x)), (d = jj(a, b.a.a.y)), (c = 0 <= Ti(c, d)));
            break;
        case 356:
            118 == b.a.a.x.type
                ? (c = X(a, b.a.a.x) > X(a, b.a.a.y))
                : ((c = jj(a, b.a.a.x)), (d = jj(a, b.a.a.y)), (c = 0 < Ti(c, d)));
            break;
        case 357:
            118 == b.a.a.x.type
                ? (c = X(a, b.a.a.x) != X(a, b.a.a.y))
                : ((c = jj(a, b.a.a.x)), (d = jj(a, b.a.a.y)), (c = 0 != Ti(c, d)));
            break;
        case 358:
            c = kj(a, b.a.a.x) && kj(a, b.a.a.y);
            break;
        case 359:
            c = kj(a, b.a.a.x) || kj(a, b.a.a.y);
            break;
        case 365:
            c = Sj(a, b.a.a.x);
            c = hj(a, b.a.a.y, c);
            break;
        case 366:
            c = Sj(a, b.a.a.x);
            c = !hj(a, b.a.a.y, c);
            break;
        case 367:
            d = nj(a, b.a.a.x);
            c = 1;
            for (d = d.head; null != d; d = d.next)
                if (!hj(a, b.a.a.y, d.D)) {
                    c = 0;
                    break;
                }
            break;
        case 368:
            d = nj(a, b.a.a.x);
            c = 1;
            for (d = d.head; null != d; d = d.next)
                if (hj(a, b.a.a.y, d.D)) {
                    c = 0;
                    break;
                }
            break;
        case 381:
            c = {};
            c.code = b;
            c.value = 1;
            oj(a, b.a.loop.domain, c, Rj);
            c = c.value;
            break;
        case 382:
            (c = {}), (c.code = b), (c.value = 0), oj(a, b.a.loop.domain, c, Rj), (c = c.value);
    }
    b.valid = 1;
    return (b.value.og = c);
}
function Sj(a, b) {
    var c;
    b.X && b.valid && ((b.valid = 0), dj(b.type, b.value));
    if (b.valid) return ui(b.value.D);
    switch (b.Wa) {
        case 309:
            c = null;
            for (var d = b.a.list; null != d; d = d.next) c = fi(c, jj(a, d.x));
            break;
        case 319:
            c = fi(null, jj(a, b.a.a.x));
    }
    b.valid = 1;
    b.value.D = ui(c);
    return c;
}
function Tj(a, b) {
    var c;
    switch (b.code.Wa) {
        case 383:
            c = Sj(a, b.code.a.loop.x);
            null == ki(a, b.value, c) && Wi(b.value, c);
            break;
        case 384:
            Wi(b.value, qj(b.code.a.loop.domain));
    }
    return 0;
}
function nj(a, b) {
    var c, d;
    b.X && b.valid && ((b.valid = 0), dj(b.type, b.value));
    if (b.valid) return Xi(a, b.value.set);
    switch (b.Wa) {
        case 306:
            c = null;
            for (d = b.a.set.list; null != d; d = d.next) c = fi(c, jj(a, d.x));
            c = Xi(a, wj(a, b.a.set.set, c));
            break;
        case 310:
            c = ni(a, 117, b.v);
            for (d = b.a.list; null != d; d = d.next) gi(a, c, Sj(a, d.x));
            break;
        case 360:
            d = nj(a, b.a.a.x);
            for (c = nj(a, b.a.a.y).head; null != c; c = c.next) null == ki(a, d, c.D) && Wi(d, ui(c.D));
            c = d;
            break;
        case 361:
            var e = nj(a, b.a.a.x);
            d = nj(a, b.a.a.y);
            c = ni(a, 117, e.v);
            for (e = e.head; null != e; e = e.next) null == ki(a, d, e.D) && Wi(c, ui(e.D));
            break;
        case 362:
            d = nj(a, b.a.a.x);
            c = nj(a, b.a.a.y);
            for (var f = ni(a, 117, d.v), e = d.head; null != e; e = e.next)
                null == ki(a, c, e.D) && Wi(f, ui(e.D));
            for (e = c.head; null != e; e = e.next) null == ki(a, d, e.D) && Wi(f, ui(e.D));
            c = f;
            break;
        case 363:
            e = nj(a, b.a.a.x);
            d = nj(a, b.a.a.y);
            c = ni(a, 117, e.v);
            for (e = e.head; null != e; e = e.next) null != ki(a, d, e.D) && Wi(c, ui(e.D));
            break;
        case 364:
            e = nj(a, b.a.a.x);
            d = nj(a, b.a.a.y);
            var g, k;
            c = ni(a, 117, e.v + d.v);
            for (e = e.head; null != e; e = e.next)
                for (f = d.head; null != f; f = f.next) {
                    g = ui(e.D);
                    for (k = f.D; null != k; k = k.next) g = fi(g, ei(k.ba));
                    Wi(c, g);
                }
            break;
        case 372:
            d = X(a, b.a.a.x);
            c = X(a, b.a.a.y);
            e = null == b.a.a.z ? 1 : X(a, b.a.a.z);
            f = ni(a, 117, 1);
            g = Yi(a, d, c, e);
            for (k = 1; k <= g; k++) Wi(f, fi(null, Zh(Zi(a, d, c, e, k))));
            c = f;
            break;
        case 373:
            c = kj(a, b.a.a.x) ? nj(a, b.a.a.y) : nj(a, b.a.a.z);
            break;
        case 383:
            d = {};
            d.code = b;
            d.value = ni(a, 117, b.v);
            oj(a, b.a.loop.domain, d, Tj);
            c = d.value;
            break;
        case 384:
            (d = {}), (d.code = b), (d.value = ni(a, 117, b.v)), oj(a, b.a.loop.domain, d, Tj), (c = d.value);
    }
    b.valid = 1;
    b.value.set = Xi(a, c);
    return c;
}
function Uj() { }
function hj(a, b, c) {
    var d, e, f;
    switch (b.Wa) {
        case 306:
            f = null;
            for (e = b.a.set.list; null != e; e = e.next) f = fi(f, jj(a, e.x));
            b = wj(a, b.a.set.set, f);
            f = Vi(c, b.v);
            d = null != ki(a, b, f);
            break;
        case 310:
            d = 0;
            f = Vi(c, b.v);
            for (e = b.a.list; null != e && !((c = Sj(a, e.x)), (d = 0 == Ui(f, c))); e = e.next);
            break;
        case 360:
            d = hj(a, b.a.a.x, c) || hj(a, b.a.a.y, c);
            break;
        case 361:
            d = hj(a, b.a.a.x, c) && !hj(a, b.a.a.y, c);
            break;
        case 362:
            f = hj(a, b.a.a.x, c);
            a = hj(a, b.a.a.y, c);
            d = (f && !a) || (!f && a);
            break;
        case 363:
            d = hj(a, b.a.a.x, c) && hj(a, b.a.a.y, c);
            break;
        case 364:
            if ((d = hj(a, b.a.a.x, c))) {
                for (f = 1; f <= b.a.a.x.v; f++) c = c.next;
                d = hj(a, b.a.a.y, c);
            }
            break;
        case 372:
            d = X(a, b.a.a.x);
            e = X(a, b.a.a.y);
            null == b.a.a.z ? (f = 1) : (f = X(a, b.a.a.z));
            Yi(a, d, e, f);
            if (null != c.ba.P) {
                d = 0;
                break;
            }
            c = c.ba.U;
            if ((0 < f && !(d <= c && c <= e)) || (0 > f && !(e <= c && c <= d))) {
                d = 0;
                break;
            }
            d = Zi(a, d, e, f, (((c - d) / f + 0.5) | 0) + 1) == c;
            break;
        case 373:
            d = kj(a, b.a.a.x) ? hj(a, b.a.a.y, c) : hj(a, b.a.a.z, c);
            break;
        case 383:
            U(a, "implementation restriction; in/within setof{} not allowed");
            break;
        case 384:
            (f = Vi(c, b.v)), (d = 0 == lj(a, b.a.loop.domain, f, null, Uj));
    }
    return d;
}
function Vj(a, b) {
    switch (b.code.Wa) {
        case 377:
            var c;
            c = Jj(a, b.code.a.loop.x);
            for (null == b.value ? (b.value = c) : (b.$a.next = c); null != c; c = c.next) b.$a = c;
    }
    return 0;
}
function Jj(a, b) {
    var c;
    b.X && b.valid && ((b.valid = 0), dj(b.type, b.value));
    if (b.valid) return aj(b.value.form);
    switch (b.Wa) {
        case 307:
            var d = null;
            for (c = b.a.A.list; null != c; c = c.next) d = fi(d, jj(a, c.x));
            c = Hj(a, b.a.A.A, d);
            d = { B: 1 };
            d.A = c;
            d.next = null;
            c = d;
            break;
        case 320:
            c = $i(X(a, b.a.a.x));
            break;
        case 321:
            c = bj(a, 0, $i(0), 1, Jj(a, b.a.a.x));
            break;
        case 322:
            c = bj(a, 0, $i(0), -1, Jj(a, b.a.a.x));
            break;
        case 338:
            c = bj(a, 1, Jj(a, b.a.a.x), 1, Jj(a, b.a.a.y));
            break;
        case 339:
            c = bj(a, 1, Jj(a, b.a.a.x), -1, Jj(a, b.a.a.y));
            break;
        case 341:
            c =
                118 == b.a.a.x.type
                    ? bj(a, X(a, b.a.a.x), Jj(a, b.a.a.y), 0, $i(0))
                    : bj(a, X(a, b.a.a.y), Jj(a, b.a.a.x), 0, $i(0));
            break;
        case 342:
            c = bj(a, Bi(a, 1, X(a, b.a.a.y)), Jj(a, b.a.a.x), 0, $i(0));
            break;
        case 373:
            c = kj(a, b.a.a.x) ? Jj(a, b.a.a.y) : null == b.a.a.z ? $i(0) : Jj(a, b.a.a.z);
            break;
        case 377:
            c = {};
            c.code = b;
            c.value = $i(0);
            c.$a = null;
            oj(a, b.a.loop.domain, c, Vj);
            c = c.value;
            for (var e, f = 0, d = c; null != d; d = d.next)
                null == d.A ? (f = xi(a, f, d.B)) : (d.A.na = xi(a, d.A.na, d.B));
            e = c;
            c = null;
            for (d = e; null != d; d = e)
                (e = d.next),
                    null == d.A && 0 != f
                        ? ((d.B = f), (f = 0), (d.next = c), (c = d))
                        : null != d.A && 0 != d.A.na && ((d.B = d.A.na), (d.A.na = 0), (d.next = c), (c = d));
    }
    b.valid = 1;
    b.value.form = aj(c);
    return c;
}
var Wj = (window['__GLP'].mpl_tab_num_args = function (a) {
    return a.df;
}),
    Xj = (window['__GLP'].mpl_tab_get_arg = function (a, b) {
        return a.a[b];
    });
window['__GLP'].mpl_tab_get_args = function (a) {
    return a.a;
};
var Yj = (window['__GLP'].mpl_tab_num_flds = function (a) {
    return a.Za;
}),
    Zj = (window['__GLP'].mpl_tab_get_name = function (a, b) {
        return a.name[b];
    }),
    ak = (window['__GLP'].mpl_tab_get_type = function (a, b) {
        return a.type[b];
    }),
    bk = (window['__GLP'].mpl_tab_get_num = function (a, b) {
        return a.U[b];
    }),
    ck = (window['__GLP'].mpl_tab_get_str = function (a, b) {
        return a.P[b];
    }),
    dk = (window['__GLP'].mpl_tab_set_num = function (a, b, c) {
        a.type[b] = "N";
        a.U[b] = c;
    }),
    ek = (window['__GLP'].mpl_tab_set_str = function (a, b, c) {
        a.type[b] = "S";
        a.P[b] = c;
    });
function fk(a, b) {
    var c = a.Lc,
        d,
        e,
        f;
    f = 0;
    for (d = b.C.Nc.list; null != d; d = d.next)
        switch ((f++, d.code.type)) {
            case 118:
                c.type[f] = "N";
                c.U[f] = X(a, d.code);
                c.P[f][0] = "\x00";
                break;
            case 124:
                (e = jj(a, d.code)),
                    null == e.P
                        ? ((c.type[f] = "N"), (c.U[f] = e.U), (c.P[f][0] = "\x00"))
                        : ((c.type[f] = "S"), (c.U[f] = 0), (c.P[f] = e.P));
        }
    c = a.Lc;
    c.link.writeRecord(c) && U(a, "error on writing data to table " + a.lb.C.tab.name);
    return 0;
}
function gk(a, b) {
    kj(a, b.code) || U(a, "check" + li("[", qj(b.domain)) + " failed");
    return 0;
}
function hk(a, b, c) {
    var d = c.value.set;
    ik(a, b.name + li("[", c.D) + (null == d.head ? " is empty" : ":"));
    for (b = d.head; null != b; b = b.next) ik(a, "   " + li("(", b.D));
}
function jk(a, b, c) {
    switch (b.type) {
        case 118:
        case 113:
        case 101:
            ik(a, b.name + li("[", c.D) + " = " + c.value.U);
            break;
        case 124:
            ik(a, b.name + li("[", c.D) + " = " + di(c.value.ba));
    }
}
function kk(a, b, c, d) {
    0 == d || 4 == d
        ? ik(a, b.name + li("[", c.D) + ".val = " + c.value.A.w)
        : 1 == d
            ? ik(a, b.name + li("[", c.D) + ".lb = " + (null == c.value.A.A.S ? -t : c.value.A.S))
            : 2 == d
                ? ik(a, b.name + li("[", c.D) + ".ub = " + (null == c.value.A.A.Z ? +t : c.value.A.Z))
                : 3 == d
                    ? ik(a, b.name + li("[", c.D) + ".status = " + c.value.A.stat)
                    : 5 == d && ik(a, b.name + li("[", c.D) + ".dual = " + c.value.A.M);
}
function lk(a, b, c, d) {
    0 == d || 4 == d
        ? ik(a, b.name + li("[", c.D) + ".val = " + c.value.K.w)
        : 1 == d
            ? ik(a, b.name + li("[", c.D) + ".lb = " + (null == c.value.K.K.S ? -t : c.value.K.S))
            : 2 == d
                ? ik(a, b.name + li("[", c.D) + ".ub = " + (null == c.value.K.K.Z ? +t : c.value.K.Z))
                : 3 == d
                    ? ik(a, b.name + li("[", c.D) + ".status = " + c.value.K.stat)
                    : 5 == d && ik(a, b.name + li("[", c.D) + ".dual = " + c.value.K.M);
}
function mk(a, b) {
    for (var c, d = b.list; null != d; d = d.next)
        if (111 == d.type) (c = d.C.Ca), ik(a, c.name + " = " + di(c.value));
        else if (122 == d.type) {
            var e = d.C.set;
            null != e.assign
                ? oj(a, e.domain, e, vj)
                : (null != e.Xc && 0 == e.data && uj(a, e), null != e.T.head && wj(a, e, e.T.head.D));
            null == e.T.head && ik(a, e.name + " has empty content");
            for (c = e.T.head; null != c; c = c.next) hk(a, e, c);
        } else if (120 == d.type)
            for (
                e = d.C.W,
                null != e.assign
                    ? oj(a, e.domain, e, Fj)
                    : null != e.T.head && (124 != e.type ? Aj(a, e, e.T.head.D) : Ej(a, e, e.T.head.D)),
                null == e.T.head && ik(a, e.name + " has empty content"),
                c = e.T.head;
                null != c;
                c = c.next
            )
                jk(a, e, c);
        else if (127 == d.type)
            for (
                e = d.C.A, null == e.T.head && ik(a, e.name + " has empty content"), c = e.T.head;
                null != c;
                c = c.next
            )
                kk(a, e, c, 0);
        else if (103 == d.type)
            for (
                e = d.C.K, null == e.T.head && ik(a, e.name + " has empty content"), c = e.T.head;
                null != c;
                c = c.next
            )
                lk(a, e, c, 0);
        else if (108 == d.type)
            if (((e = d.C.code), 304 == e.Wa || 305 == e.Wa || 306 == e.Wa || 307 == e.Wa || 308 == e.Wa)) {
                c = a;
                var f = { value: {} },
                    g = void 0;
                f.D = null;
                for (g = e.a.W.list || e.a.A.list; null != g; g = g.next) f.D = fi(f.D, jj(c, g.x));
                switch (e.Wa) {
                    case 304:
                        f.value.U = Aj(c, e.a.W.W, f.D);
                        jk(c, e.a.W.W, f);
                        break;
                    case 305:
                        f.value.ba = Ej(c, e.a.W.W, f.D);
                        jk(c, e.a.W.W, f);
                        break;
                    case 306:
                        f.value.set = wj(c, e.a.set.set, f.D);
                        hk(c, e.a.set.set, f);
                        break;
                    case 307:
                        f.value.A = Hj(c, e.a.A.A, f.D);
                        kk(c, e.a.A.A, f, e.a.A.Ac);
                        break;
                    case 308:
                        (f.value.K = Lj(c, e.a.K.K, f.D)), lk(c, e.a.K.K, f, e.a.K.Ac);
                }
            } else
                switch (((c = a), e.type)) {
                    case 118:
                        e = X(c, e);
                        ik(c, String(e));
                        break;
                    case 124:
                        e = jj(c, e);
                        ik(c, di(e));
                        break;
                    case 114:
                        e = kj(c, e);
                        ik(c, e ? "true" : "false");
                        break;
                    case 126:
                        e = Sj(c, e);
                        ik(c, li("(", e));
                        break;
                    case 106:
                        e = nj(c, e);
                        0 == e.head && ik(c, "set is empty");
                        for (e = e.head; null != e; e = e.next) ik(c, "   " + li("(", e.D));
                        break;
                    case 110:
                        for (
                            f = void 0, e = Jj(c, e), null == e && ik(c, "linear form is empty"), f = e;
                            null != f;
                            f = f.next
                        )
                            null == f.A
                                ? ik(c, "   " + f.B)
                                : ik(c, "   " + f.B + " " + f.A.A.name + li("[", f.A.ka.D));
                }
    return 0;
}
function nk(a, b) {
    null == a.Dg ? ("\n" == b ? (a.ee(a.cd, a.je), (a.cd = "")) : (a.cd += b)) : a.Dg(b);
}
function ok(a, b) {
    for (var c = 0; c < b.length; c++) nk(a, b[c]);
}
function pk(a, b) {
    var c,
        d,
        e,
        f,
        g,
        k = jj(a, b.xd);
    null == k.P ? (d = String(k.U)) : (d = k.P);
    c = b.list;
    for (f = 0; f < d.length; f++)
        if ("%" == d[f])
            if (((e = f++), "%" == d[f])) nk(a, "%");
            else {
                if (null == c) break;
                for (; "-" == d[f] || "+" == d[f] || " " == d[f] || "#" == d[f] || "0" == d[f];) f++;
                for (; wa(d[f]);) f++;
                if ("." == d[f]) for (f++; wa(d[f]);) f++;
                if (
                    "d" == d[f] ||
                    "i" == d[f] ||
                    "e" == d[f] ||
                    "E" == d[f] ||
                    "f" == d[f] ||
                    "F" == d[f] ||
                    "g" == d[f] ||
                    "G" == d[f]
                ) {
                    switch (c.code.type) {
                        case 118:
                            g = X(a, c.code);
                            break;
                        case 124:
                            k = jj(a, c.code);
                            null != k.P && U(a, "cannot convert " + di(k) + " to floating-point number");
                            g = k.U;
                            break;
                        case 114:
                            g = kj(a, c.code) ? 1 : 0;
                    }
                    "d" == d[f] || "i" == d[f]
                        ? ((-2147483647 <= g && 2147483647 >= g) || U(a, "cannot convert " + g + " to integer"),
                            ok(a, xa(d.slice(e, f + 1), Math.floor(g + 0.5) | 0)))
                        : ok(a, xa(d.slice(e, f + 1), g));
                } else if ("s" == d[f]) {
                    switch (c.code.type) {
                        case 118:
                            g = String(X(a, c.code));
                            break;
                        case 114:
                            g = kj(a, c.code) ? "T" : "F";
                            break;
                        case 124:
                            (k = jj(a, c.code)), null == k.P ? (g = String(k.U)) : (g = k.P);
                    }
                    ok(a, xa(d.slice(e, f + 1), g));
                } else U(a, "format specifier missing or invalid");
                c = c.next;
            }
        else
            "\\" == d[f]
                ? (f++,
                    "t" == d[f]
                        ? nk(a, "\t")
                        : "n" == d[f]
                            ? nk(a, "\n")
                            : "\x00" == d[f]
                                ? U(a, "invalid use of escape character \\ in format control string")
                                : nk(a, d[f]))
                : nk(a, d[f]);
    return 0;
}
function qk(a, b) {
    for (var c = a.lb, d = b.list; null != d; d = d.next) rk(a, d);
    a.lb = c;
    return 0;
}
function rk(a, b) {
    a.lb = b;
    switch (b.type) {
        case 103:
            y("Generating " + b.C.K.name + "...");
            var c = b.C.K;
            oj(a, c.domain, c, Mj);
            break;
        case 125:
            switch (b.C.tab.type) {
                case 112:
                    y("Reading " + b.C.tab.name + "...");
                    break;
                case 119:
                    y("Writing " + b.C.tab.name + "...");
            }
            var c = b.C.tab,
                d,
                e,
                f,
                g;
            a.Lc = f = {};
            f.id = 0;
            f.link = null;
            f.df = 0;
            f.a = null;
            f.Za = 0;
            f.name = null;
            f.type = null;
            f.U = null;
            f.P = null;
            for (d = c.a; null != d; d = d.next) f.df++;
            f.a = Array(1 + f.df);
            for (g = 1; g <= f.df; g++) f.a[g] = null;
            g = 0;
            for (d = c.a; null != d; d = d.next) {
                g++;
                var k = jj(a, d.code);
                null == k.P ? (e = String(k.U)) : (e = k.P);
                f.a[g] = e;
            }
            switch (c.type) {
                case 112:
                    g = c.C.ua.set;
                    null != g &&
                        (g.data && U(a, g.name + " already provided with data"),
                            (mi(g.T, null).value.set = ni(a, 117, g.aa)),
                            (g.data = 1));
                    for (e = c.C.ua.list; null != e; e = e.next)
                        e.W.data && U(a, e.W.name + " already provided with data"), (e.W.data = 1);
                    for (e = c.C.ua.Ue; null != e; e = e.next) f.Za++;
                    for (e = c.C.ua.list; null != e; e = e.next) f.Za++;
                    f.name = Array(1 + f.Za);
                    f.type = Array(1 + f.Za);
                    f.U = new Float64Array(1 + f.Za);
                    f.P = Array(1 + f.Za);
                    g = 0;
                    for (e = c.C.ua.Ue; null != e; e = e.next)
                        g++, (f.name[g] = e.name), (f.type[g] = "?"), (f.U[g] = 0), (f.P[g] = "");
                    for (e = c.C.ua.list; null != e; e = e.next)
                        g++, (f.name[g] = e.name), (f.type[g] = "?"), (f.U[g] = 0), (f.P[g] = "");
                    for (sk(a, "R"); ;) {
                        for (g = 1; g <= f.Za; g++) f.type[g] = "?";
                        g = a;
                        d = g.Lc;
                        d = d.link.readRecord(d);
                        0 < d && U(g, "error on reading data from table " + g.lb.C.tab.name);
                        if (d) break;
                        for (g = 1; g <= f.Za; g++)
                            "?" == f.type[g] && U(a, "field " + f.name[g] + " missing in input table");
                        d = null;
                        g = 0;
                        for (e = c.C.ua.Ue; null != e; e = e.next)
                            switch ((g++, f.type[g])) {
                                case "N":
                                    d = fi(d, Zh(f.U[g]));
                                    break;
                                case "S":
                                    d = fi(d, $h(f.P[g]));
                            }
                        null != c.C.ua.set && gi(a, c.C.ua.set.T.head.value.set, ui(d));
                        for (e = c.C.ua.list; null != e; e = e.next)
                            switch (
                            (g++,
                                null != ki(a, e.W.T, d) && U(a, e.W.name + li("[", d) + " already defined"),
                                (k = mi(e.W.T, ui(d))),
                                e.W.type)
                            ) {
                                case 118:
                                case 113:
                                case 101:
                                    "N" != f.type[g] && U(a, e.W.name + " requires numeric data");
                                    k.value.U = f.U[g];
                                    break;
                                case 124:
                                    switch (f.type[g]) {
                                        case "N":
                                            k.value.ba = Zh(f.U[g]);
                                            break;
                                        case "S":
                                            k.value.ba = $h(f.P[g]);
                                    }
                            }
                    }
                    a.Lc = null;
                    break;
                case 119:
                    for (d = c.C.Nc.list; null != d; d = d.next) f.Za++;
                    f.name = Array(1 + f.Za);
                    f.type = Array(1 + f.Za);
                    f.U = new Float64Array(1 + f.Za);
                    f.P = Array(1 + f.Za);
                    g = 0;
                    for (d = c.C.Nc.list; null != d; d = d.next)
                        g++, (f.name[g] = d.name), (f.type[g] = "?"), (f.U[g] = 0), (f.P[g] = "");
                    sk(a, "W");
                    oj(a, c.C.Nc.domain, c, fk);
                    c = a.Lc;
                    c.link.flush(c);
                    a.Lc = null;
            }
            break;
        case 102:
            y("Checking (line " + b.gb + ")...");
            c = b.C.Mg;
            oj(a, c.domain, c, gk);
            break;
        case 104:
            ik(a, "Display statement at line " + b.gb);
            c = b.C.Ng;
            oj(a, c.domain, c, mk);
            break;
        case 121:
            c = b.C.ih;
            null == c.Ia ? (a.je = null) : ((f = jj(a, c.Ia)), (a.je = null == f.P ? f.U : f.P));
            oj(a, c.domain, c, pk);
            break;
        case 109:
            (c = b.C.Pg), oj(a, c.domain, c, qk);
    }
}
function tk(a) {
    var b;
    for (b = a.uc; null != b; b = b.next)
        switch (b.type) {
            case 122:
                b.C.set.T = ni(a, 106, b.C.set.v);
                break;
            case 120:
                switch (b.C.W.type) {
                    case 118:
                    case 113:
                    case 101:
                        b.C.W.T = ni(a, 118, b.C.W.v);
                        break;
                    case 124:
                        b.C.W.T = ni(a, 124, b.C.W.v);
                }
                break;
            case 127:
                b.C.A.T = ni(a, 107, b.C.A.v);
                break;
            case 103:
                b.C.K.T = ni(a, 105, b.C.K.v);
        }
}
function uk(a, b, c) {
    a.gb = 0;
    a.Uc = 0;
    a.m = "\n";
    a.b = 0;
    a.Db = 0;
    a.i = "";
    a.value = 0;
    a.Df = 201;
    a.Cf = 0;
    a.Bf = "";
    a.Ef = 0;
    a.Re = 0;
    a.Se = 0;
    a.If = 0;
    a.Hf = 0;
    a.Gf = "";
    a.Jf = 0;
    ja(a.context, 0, " ", 60);
    a.mc = 0;
    a.af = c;
    a.$e = b || "input";
    $g(a);
    V(a);
}
function vk(a, b, c) {
    null == c
        ? (a.ee = function (a) {
            y(a);
        })
        : ((a.ee = c), (a.eh = b));
    a.cd = "";
}
function ik(a, b) {
    a.ee(b, a.je);
}
function wk(a) {
    0 < a.cd.length && (a.ee(a.cd, a.je), (a.cd = ""));
}
function U(a, b) {
    var c;
    switch (a.I) {
        case 1:
        case 2:
            c = Error(a.$e + ":" + a.gb + ": " + b);
            c.line = a.gb;
            c.column = a.Uc;
            for (var d; 0 < a.mc;)
                a.mc--, (d = a.context[0]), ha(a.context, 0, a.context, 1, 59), (a.context[59] = d);
            y("Context: " + a.gb + " > " + (" " == a.context[0] ? "" : "...") + a.context.join("").trim());
            break;
        case 3:
            d = null == a.lb ? 0 : a.lb.gb;
            var e = null == a.lb ? 0 : a.lb.Uc;
            c = Error(d + ": " + b);
            c.line = d;
            c.column = e;
    }
    a.I = 4;
    throw c;
}
function ah(a, b) {
    switch (a.I) {
        case 1:
        case 2:
            y(a.$e + ":" + a.gb + ": warning: " + b);
            break;
        case 3:
            y(a.Uf + ":" + (null == a.lb ? 0 : a.lb.gb) + ": warning: " + b);
    }
}
var Ld = (window['__GLP'].mpl_initialize = function () {
    var a = {
        gb: 0,
        Uc: 0,
        m: 0,
        b: 0,
        Db: 0,
        i: "",
        value: 0,
        Df: 0,
        Cf: 0,
        Bf: "",
        Ef: 0,
        Re: 0,
        Se: 0,
        If: 0,
        Hf: 0,
        Gf: "",
        Jf: 0,
    };
    a.context = Array(60);
    ja(a.context, 0, " ", 60);
    a.mc = 0;
    a.oc = 0;
    a.$ = {};
    a.uc = null;
    a.Lf = 0;
    a.ng = 0;
    a.mg = 0;
    a.Ie = 0;
    a.Qb = 0;
    a.lg = null;
    a.vh = "";
    a.wh = "";
    a.Fd = qg();
    a.Kf = 0;
    a.lb = null;
    a.Lc = null;
    a.h = 0;
    a.n = 0;
    a.o = null;
    a.g = null;
    a.af = null;
    a.$e = null;
    a.ee = null;
    a.eh = null;
    a.Dg = null;
    a.je = null;
    a.I = 0;
    a.Uf = null;
    a.sh = "";
    return a;
}),
    Nd = (window['__GLP'].mpl_read_model = function (a, b, c, d) {
        function e() {
            y(a.gb + " line" + (1 == a.gb ? "" : "s") + " were read");
            a.af = null;
            return a.I;
        }
        0 != a.I && x("mpl_read_model: invalid call sequence");
        null == c && x("mpl_read_model: no input specified");
        a.I = 1;
        y("Reading model section from " + b + " ...");
        uk(a, b, c);
        Sh(a);
        null == a.uc && U(a, "empty model section not allowed");
        a.Uf = a.$e;
        tk(a);
        if (eh(a, "data")) {
            if (d) return ah(a, "data section ignored"), e();
            a.oc = 1;
            V(a);
            241 != a.b && U(a, "semicolon missing where expected");
            V(a);
            a.I = 2;
            y("Reading data section from " + b + " ...");
            wi(a);
        }
        Ph(a);
        return e();
    }),
    Pd = (window['__GLP'].mpl_read_data = function (a, b, c) {
        1 != a.I && 2 != a.I && x("mpl_read_data: invalid call sequence");
        null == c && x("mpl_read_data: no input specified");
        a.I = 2;
        y("Reading data section from " + b + " ...");
        a.oc = 1;
        uk(a, b, c);
        Qh(a, "data") && (V(a), 241 != a.b && U(a, "semicolon missing where expected"), V(a));
        wi(a);
        Ph(a);
        y(a.gb + " line" + (1 == a.gb ? "" : "s") + " were read");
        a.af = null;
        return a.I;
    }),
    Rd = (window['__GLP'].mpl_generate = function (a, b, c, d) {
        1 != a.I && 2 != a.I && x("mpl_generate: invalid call sequence");
        a.I = 3;
        a.te = d;
        vk(a, b, c);
        for (b = a.uc; null != b && (rk(a, b), 123 != a.lb.type); b = b.next);
        a.lb = b;
        wk(a);
        for (b = a.uc; null != b; b = b.next)
            if (127 == b.type) for (c = b.C.A, c = c.T.head; null != c; c = c.next);
        for (b = a.uc; null != b; b = b.next)
            if (103 == b.type)
                for (c = b.C.K, c = c.T.head; null != c; c = c.next)
                    for (c.value.K.ia = ++a.h, d = c.value.K.form; null != d; d = d.next) d.A.ka.value.A.H = -1;
        for (b = a.uc; null != b; b = b.next)
            if (127 == b.type)
                for (c = b.C.A, c = c.T.head; null != c; c = c.next) 0 != c.value.A.H && (c.value.A.H = ++a.n);
        a.o = Array(1 + a.h);
        for (d = 1; d <= a.h; d++) a.o[d] = null;
        for (b = a.uc; null != b; b = b.next)
            if (103 == b.type)
                for (c = b.C.K, c = c.T.head; null != c; c = c.next) (d = c.value.K.ia), (a.o[d] = c.value.K);
        for (d = 1; d <= a.h; d++);
        a.g = Array(1 + a.n);
        for (d = 1; d <= a.n; d++) a.g[d] = null;
        for (b = a.uc; null != b; b = b.next)
            if (127 == b.type)
                for (c = b.C.A, c = c.T.head; null != c; c = c.next)
                    (d = c.value.A.H), 0 != d && (a.g[d] = c.value.A);
        for (d = 1; d <= a.n; d++);
        y("Model has been successfully generated");
        return a.I;
    }),
    Sd = (window['__GLP'].mpl_get_prob_name = function (a) {
        return a.Uf;
    }),
    Td = (window['__GLP'].mpl_get_num_rows = function (a) {
        3 != a.I && x("mpl_get_num_rows: invalid call sequence");
        return a.h;
    }),
    be = (window['__GLP'].mpl_get_num_cols = function (a) {
        3 != a.I && x("mpl_get_num_cols: invalid call sequence");
        return a.n;
    }),
    Ud = (window['__GLP'].mpl_get_row_name = function (a, b) {
        3 != a.I && x("mpl_get_row_name: invalid call sequence");
        (1 <= b && b <= a.h) || x("mpl_get_row_name: i = " + b + "; row number out of range");
        var c = a.o[b].K.name,
            c = c + li("[", a.o[b].ka.D).slice(0, 255);
        255 == c.length && (c = c.slice(0, 252) + "...");
        return c;
    }),
    ie = (window['__GLP'].mpl_get_row_kind = function (a, b) {
        var c;
        3 != a.I && x("mpl_get_row_kind: invalid call sequence");
        (1 <= b && b <= a.h) || x("mpl_get_row_kind: i = " + b + "; row number out of range");
        switch (a.o[b].K.type) {
            case 103:
                c = 411;
                break;
            case 116:
                c = je;
                break;
            case 115:
                c = ke;
        }
        return c;
    }),
    Vd = (window['__GLP'].mpl_get_row_bnds = function (a, b, c) {
        var d;
        3 != a.I && x("mpl_get_row_bnds: invalid call sequence");
        (1 <= b && b <= a.h) || x("mpl_get_row_bnds: i = " + b + "; row number out of range");
        d = a.o[b];
        a = null == d.K.S ? -t : d.S;
        b = null == d.K.Z ? +t : d.Z;
        a == -t && b == +t
            ? ((d = Wd), (a = b = 0))
            : b == +t
                ? ((d = Xd), (b = 0))
                : a == -t
                    ? ((d = Yd), (a = 0))
                    : (d = d.K.S != d.K.Z ? Zd : $d);
        c(a, b);
        return d;
    }),
    he = (window['__GLP'].mpl_get_mat_row = function (a, b, c, d) {
        var e = 0;
        3 != a.I && x("mpl_get_mat_row: invalid call sequence");
        (1 <= b && b <= a.h) || x("mpl_get_mat_row: i = " + b + "; row number out of range");
        for (a = a.o[b].form; null != a; a = a.next) e++, null != c && (c[e] = a.A.H), null != d && (d[e] = a.B);
        return e;
    }),
    ae = (window['__GLP'].mpl_get_row_c0 = function (a, b) {
        var c;
        3 != a.I && x("mpl_get_row_c0: invalid call sequence");
        (1 <= b && b <= a.h) || x("mpl_get_row_c0: i = " + b + "; row number out of range");
        c = a.o[b];
        return null == c.K.S && null == c.K.Z ? -c.S : 0;
    }),
    ce = (window['__GLP'].mpl_get_col_name = function (a, b) {
        3 != a.I && x("mpl_get_col_name: invalid call sequence");
        (1 <= b && b <= a.n) || x("mpl_get_col_name: j = " + b + "; column number out of range");
        var c = a.g[b].A.name,
            c = c + li("[", a.g[b].ka.D);
        255 == c.length && (c = c.slice(0, 252) + "...");
        return c;
    }),
    de = (window['__GLP'].mpl_get_col_kind = function (a, b) {
        var c;
        3 != a.I && x("mpl_get_col_kind: invalid call sequence");
        (1 <= b && b <= a.n) || x("mpl_get_col_kind: j = " + b + "; column number out of range");
        switch (a.g[b].A.type) {
            case 118:
                c = 421;
                break;
            case 113:
                c = ee;
                break;
            case 101:
                c = fe;
        }
        return c;
    }),
    ge = (window['__GLP'].mpl_get_col_bnds = function (a, b, c) {
        var d;
        3 != a.I && x("mpl_get_col_bnds: invalid call sequence");
        (1 <= b && b <= a.n) || x("mpl_get_col_bnds: j = " + b + "; column number out of range");
        d = a.g[b];
        a = null == d.A.S ? -t : d.S;
        b = null == d.A.Z ? +t : d.Z;
        a == -t && b == +t
            ? ((d = Wd), (a = b = 0))
            : b == +t
                ? ((d = Xd), (b = 0))
                : a == -t
                    ? ((d = Yd), (a = 0))
                    : (d = d.A.S != d.A.Z ? Zd : $d);
        c(a, b);
        return d;
    }),
    me = (window['__GLP'].mpl_has_solve_stmt = function (a) {
        3 != a.I && x("mpl_has_solve_stmt: invalid call sequence");
        return a.Qb;
    }),
    ne = (window['__GLP'].mpl_put_row_soln = function (a, b, c, d, e) {
        a.o[b].stat = c;
        a.o[b].w = d;
        a.o[b].M = e;
    }),
    oe = (window['__GLP'].mpl_put_col_soln = function (a, b, c, d, e) {
        a.g[b].stat = c;
        a.g[b].w = d;
        a.g[b].M = e;
    }),
    pe = (window['__GLP'].mpl_postsolve = function (a) {
        (3 != a.I || a.Kf) && x("mpl_postsolve: invalid call sequence");
        var b;
        a.Kf = 1;
        for (b = a.lb; null != b; b = b.next) rk(a, b);
        a.lb = null;
        wk(a);
        y("Model has been successfully processed");
        return a.I;
    }),
    xk = "Monday Tuesday Wednesday Thursday Friday Saturday Sunday".split(" "),
    yk = "January February March April May June July August September October November December".split(" ");
function zk(a) {
    for (var b = ""; 0 < a;) (b += "^"), a--;
    return b;
}
function Ak(a, b, c, d, e, f) {
    y("Input string passed to str2time:");
    y(b);
    y(zk(c + 1));
    y("Format string passed to str2time:\n");
    y(d);
    y(zk(e + 1));
    U(a, f);
}
function Pj(a, b, c) {
    function d() {
        Ak(a, b, p, c, u, "time zone offset value incomplete or invalid");
    }
    function e() {
        Ak(a, b, p, c, u, "time zone offset value out of range");
    }
    function f() {
        b[p] != c[u] && Ak(a, b, p, c, u, "character mismatch");
        p++;
    }
    var g, k, h, l, n, m, q, r, p, u;
    k = h = l = n = m = q = -1;
    r = 2147483647;
    for (u = p = 0; u < c.length; u++)
        if ("%" == c[u])
            if ((u++, "b" == c[u] || "h" == c[u])) {
                var v;
                for (0 <= h && Ak(a, b, p, c, u, "month multiply specified"); " " == b[p];) p++;
                for (h = 1; 12 >= h; h++) {
                    v = yk[h - 1];
                    var H = !1;
                    for (g = 0; 2 >= g; g++)
                        if (p[g].toUpperCase() != v[g].toUpperCase()) {
                            H = !0;
                            break;
                        }
                    if (!H) {
                        p += 3;
                        for (g = 3; "\x00" != v[g] && b[p].toUpperCase() == v[g].toUpperCase(); g++) p++;
                        break;
                    }
                }
                12 < h && Ak(a, b, p, c, u, "abbreviated month name missing or invalid");
            } else if ("d" == c[u]) {
                for (0 <= l && Ak(a, b, p, c, u, "day multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "day missing or invalid");
                l = b[p++] - 0;
                "0" <= b[p] && "9" >= b[p] && (l = 10 * l + (b[p++] - 0));
                (1 <= l && 31 >= l) || Ak(a, b, p, c, u, "day out of range");
            } else if ("H" == c[u]) {
                for (0 <= n && Ak(a, b, p, c, u, "hour multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "hour missing or invalid");
                n = b[p++] - 0;
                "0" <= b[p] && "9" >= b[p] && (n = 10 * n + (b[p++] - 0));
                (0 <= n && 23 >= n) || Ak(a, b, p, c, u, "hour out of range");
            } else if ("m" == c[u]) {
                for (0 <= h && Ak(a, b, p, c, u, "month multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "month missing or invalid");
                h = b[p++] - 0;
                "0" <= b[p] && "9" >= b[p] && (h = 10 * h + (b[p++] - 0));
                (1 <= h && 12 >= h) || Ak(a, b, p, c, u, "month out of range");
            } else if ("M" == c[u]) {
                for (0 <= m && Ak(a, b, p, c, u, "minute multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "minute missing or invalid");
                m = b[p++] - 0;
                "0" <= b[p] && "9" >= b[p] && (m = 10 * m + (b[p++] - 0));
                (0 <= m && 59 >= m) || Ak(a, b, p, c, u, "minute out of range");
            } else if ("S" == c[u]) {
                for (0 <= q && Ak(a, b, p, c, u, "second multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "second missing or invalid");
                q = b[p++] - 0;
                "0" <= b[p] && "9" >= b[p] && (q = 10 * q + (b[p++] - 0));
                (0 <= q && 60 >= q) || Ak(a, b, p, c, u, "second out of range");
            } else if ("y" == c[u]) {
                for (0 <= k && Ak(a, b, p, c, u, "year multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "year missing or invalid");
                k = b[p++] - 0;
                "0" <= b[p] && "9" >= b[p] && (k = 10 * k + (b[p++] - 0));
                k += 69 <= k ? 1900 : 2e3;
            } else if ("Y" == c[u]) {
                for (0 <= k && Ak(a, b, p, c, u, "year multiply specified"); " " == b[p];) p++;
                ("0" <= b[p] && "9" >= b[p]) || Ak(a, b, p, c, u, "year missing or invalid");
                k = 0;
                for (g = 1; 4 >= g && "0" <= b[p] && "9" >= b[p]; g++) k = 10 * k + (b[p++] - 0);
                (1 <= k && 4e3 >= k) || Ak(a, b, p, c, u, "year out of range");
            } else if ("z" == c[u]) {
                var E;
                for (2147483647 != r && Ak(a, b, p, c, u, "time zone offset multiply specified"); " " == b[p];)
                    p++;
                if ("Z" == b[p]) (E = n = m = 0), p++;
                else {
                    "+" == b[p]
                        ? ((E = 1), p++)
                        : "-" == b[p]
                            ? ((E = -1), p++)
                            : Ak(a, b, p, c, u, "time zone offset sign missing");
                    n = 0;
                    for (g = 1; 2 >= g; g++) ("0" <= b[p] && "9" >= b[p]) || d(), (n = 10 * n + (b[p++] - 0));
                    23 < n && e();
                    ":" == b[p] && (p++, ("0" <= b[p] && "9" >= b[p]) || d());
                    m = 0;
                    if ("0" <= b[p] && "9" >= b[p]) {
                        for (g = 1; 2 >= g; g++) ("0" <= b[p] && "9" >= b[p]) || d(), (m = 10 * m + (b[p++] - 0));
                        59 < m && e();
                    }
                }
                r = E * (60 * n + m);
            } else "%" == c[u] ? f() : Ak(a, b, p, c, u, "invalid conversion specifier");
        else " " != c[u] && f();
    0 > k && (k = 1970);
    0 > h && (h = 1);
    0 > l && (l = 1);
    0 > n && (n = 0);
    0 > m && (m = 0);
    0 > q && (q = 0);
    2147483647 == r && (r = 0);
    g = vg(l, h, k);
    return 60 * (60 * (24 * (g - vg(1, 1, 1970)) + n) + m) + q - 60 * r;
}
function Bk(a, b, c) {
    y("Format string passed to time2str:");
    y(b);
    y(zk(c));
    U(a, "invalid conversion specifier");
}
function Ck(a) {
    return ((a + vg(1, 1, 1970)) % 7) + 1;
}
function Dk(a) {
    a = vg(1, 1, a) - vg(1, 1, 1970);
    switch (Ck(a)) {
        case 1:
            a += 0;
            break;
        case 2:
            --a;
            break;
        case 3:
            a -= 2;
            break;
        case 4:
            a -= 3;
            break;
        case 5:
            a += 3;
            break;
        case 6:
            a += 2;
            break;
        case 7:
            a += 1;
    }
    Ck(a);
    return a;
}
function Qj(a, b, c) {
    var d,
        e = 0,
        f = 0,
        g = 0,
        k,
        h,
        l,
        n = "",
        m;
    (-62135596800 <= b && 64092211199 >= b) || U(a, "time2str(" + b + ",...); argument out of range");
    b = Math.floor(b + 0.5);
    k = Math.abs(b) / 86400;
    d = Math.floor(k);
    0 > b && (d = k == Math.floor(k) ? -d : -(d + 1));
    wg(d + vg(1, 1, 1970), function (a, b, c) {
        g = a;
        f = b;
        e = c;
    });
    h = (b - 86400 * d) | 0;
    k = h / 60;
    h %= 60;
    b = k / 60;
    k %= 60;
    for (l = 0; l < c.length; l++) {
        if ("%" == c[l])
            if ((l++, "a" == c[l])) m = xk[Ck(d) - 1].slice(0, 3);
            else if ("A" == c[l]) m = xk[Ck(d) - 1];
            else if ("b" == c[l] || "h" == c[l]) m = yk[f - 1].slice(0, 3);
            else if ("B" == c[l]) m = yk[f - 1];
            else if ("C" == c[l]) m = String(Math.floor(e / 100));
            else if ("d" == c[l]) m = String(g);
            else if ("D" == c[l]) m = f + "/" + g + "/" + (e % 100);
            else if ("e" == c[l]) m = String(g);
            else if ("F" == c[l]) xa(m, e + "-" + f + "-" + g);
            else if ("g" == c[l]) {
                var q;
                d < Dk(e) ? (q = e - 1) : (q = d < Dk(e + 1) ? e : e + 1);
                m = String(q % 100);
            } else
                "G" == c[l]
                    ? (d < Dk(e) ? (q = e - 1) : (q = d < Dk(e + 1) ? e : e + 1), (m = String(q)))
                    : "H" == c[l]
                        ? (m = String(b))
                        : "I" == c[l]
                            ? (m = String(0 == b ? 12 : 12 >= b ? b : b - 12))
                            : "j" == c[l]
                                ? (m = String(vg(g, f, e) - vg(1, 1, e) + 1))
                                : "k" == c[l]
                                    ? (m = String(b))
                                    : "l" == c[l]
                                        ? (m = String(0 == b ? 12 : 12 >= b ? b : b - 12))
                                        : "m" == c[l]
                                            ? (m = String(f))
                                            : "M" == c[l]
                                                ? (m = String(k))
                                                : "p" == c[l]
                                                    ? (m = 11 >= b ? "AM" : "PM")
                                                    : "P" == c[l]
                                                        ? (m = 11 >= b ? "am" : "pm")
                                                        : "r" == c[l]
                                                            ? (m = (0 == b ? 12 : 12 >= b ? b : b - 12) + ":" + k + ":" + h + " " + (11 >= b ? "AM" : "PM"))
                                                            : "R" == c[l]
                                                                ? (m = b + ":" + k)
                                                                : "S" == c[l]
                                                                    ? (m = String(h))
                                                                    : "T" == c[l]
                                                                        ? (m = b + ":" + k + ":" + h)
                                                                        : "u" == c[l]
                                                                            ? (m = String(Ck(d)))
                                                                            : "U" == c[l]
                                                                                ? ((m = vg(1, 1, e) - vg(1, 1, 1970)), (m += 7 - Ck(m)), (m = String((d + 7 - m) / 7)))
                                                                                : "V" == c[l]
                                                                                    ? ((q = d < Dk(e) ? d - Dk(e - 1) : d < Dk(e + 1) ? d - Dk(e) : d - Dk(e + 1)),
                                                                                        (m = String(q / 7 + 1)))
                                                                                    : "w" == c[l]
                                                                                        ? (m = String(Ck(d) % 7))
                                                                                        : "W" == c[l]
                                                                                            ? ((m = vg(1, 1, e) - vg(1, 1, 1970)), (m += (8 - Ck(m)) % 7), (m = String((d + 7 - m) / 7)))
                                                                                            : "y" == c[l]
                                                                                                ? (m = String(e % 100))
                                                                                                : "Y" == c[l]
                                                                                                    ? (m = String(e))
                                                                                                    : "%" == c[l]
                                                                                                        ? (m = "%")
                                                                                                        : Bk(a, c, l);
        else m = c[l];
        n += m;
    }
    return n;
}
var Ek = {};
function sk(a, b) {
    var c = a.Lc,
        d = Ek[c.a[1].toLowerCase()];
    d ? (c.link = new d(c, b, a.te)) : U(a, "Invalid table driver '" + c.a[1] + "'");
    null == c.link && U(a, "error on opening table " + a.lb.C.tab.name);
}
var Fk = (window['__GLP'].mpl_tab_drv_register = function (a, b) {
    Ek[a.toLowerCase()] = b;
});
function Gk(a, b, c) {
    this.mode = b;
    this.Ia = null;
    this.count = 0;
    this.m = "\n";
    this.Jb = 0;
    this.sb = "";
    this.Za = 0;
    this.Ra = [];
    this.te = c;
    this.jg = 0;
    this.ye = 1;
    this.kg = 2;
    this.ze = 3;
    2 > Wj(a) && x("csv_driver: file name not specified\n");
    this.Ia = Xj(a, 2);
    if ("R" == b) {
        c ? ((this.data = c(a.a, b)), (this.cursor = 0)) : x("csv_driver: unable to open " + this.Ia);
        this.Ag = 0;
        for (Hk(this); ;) {
            Hk(this);
            if (this.Jb == this.ye) break;
            this.Jb != this.ze && x(this.Ia + ":" + this.count + ": invalid field name\n");
            this.Za++;
            for (b = Yj(a); 1 <= b && Zj(a, b) != this.sb; b--);
            this.Ra[this.Za] = b;
        }
        for (b = Yj(a); 1 <= b && "RECNO" != Zj(a, b); b--);
        this.Ra[0] = b;
    } else if ("W" == b) {
        this.data = "";
        c = Yj(a);
        for (b = 1; b <= c; b++) this.data += Zj(a, b) + (b < c ? "," : "\n");
        this.count++;
    }
}
function Hk(a) {
    if (-1 == a.m) (a.Jb = a.jg), (a.sb = "EOF");
    else if ("\n" == a.m) {
        if (
            ((a.Jb = a.ye),
                (a.sb = "EOR"),
                Ik(a),
                "," == a.m && x(a.Ia + ":" + a.count + ": empty field not allowed\n"),
                "\n" == a.m && x(a.Ia + ":" + a.count + ": empty record not allowed\n"),
                "#" == a.m && 1 == a.count)
        )
            for (; "#" == a.m;) {
                for (; "\n" != a.m;) Ik(a);
                Ik(a);
                a.Ag++;
            }
    } else if (("," == a.m && Ik(a), "'" == a.m || '"' == a.m)) {
        var b = a.m;
        a.sb = "";
        a.Jb = a.ze;
        for (Ik(a); ;) {
            if (a.m == b && (Ik(a), a.m != b))
                if ("," == a.m || "\n" == a.m) break;
                else x(a.Ia + ":" + a.count + ": invalid field");
            a.sb += a.m;
            Ik(a);
        }
        0 == a.sb.length && x(a.Ia + ":" + a.count + ": empty field not allowed");
    } else {
        a.sb = "";
        for (a.Jb = a.kg; "," != a.m && "\n" != a.m;)
            ("'" != a.m && '"' != a.m) ||
                x(a.Ia + ":" + a.count + ": invalid use of single or double quote within field"),
                (a.sb += a.m),
                Ik(a);
        0 == a.sb.length && x(a.Ia + ":" + a.count + ": empty field not allowed");
        tg(a.sb, function () { }) && (a.Jb = a.ze);
    }
}
function Ik(a) {
    var b;
    for ("\n" == a.m && a.count++; ;)
        if ((a.cursor < a.data.length ? (b = a.data[a.cursor++]) : (b = -1), "\r" != b)) {
            "\n" != b && ta(b) && x(a.Ia + ":" + a.count + ": invalid control character " + b);
            break;
        }
    a.m = b;
}
Gk.prototype.readRecord = function (a) {
    var b;
    0 < this.Ra[0] && dk(a, this.Ra[0], this.count - this.Ag - 1);
    for (b = 1; b <= this.Za; b++) {
        Hk(this);
        if (this.Jb == this.jg) return -1;
        if (this.Jb == this.ye) {
            var c = this.Za - b + 1;
            1 == c
                ? x(this.Ia + ":" + this.count + ": one field missing")
                : x(this.Ia + ":" + this.count + ": " + c + " fields missing");
        } else if (this.Jb == this.kg) {
            if (0 < this.Ra[b]) {
                var d = 0;
                tg(this.sb, function (a) {
                    d = a;
                });
                dk(a, this.Ra[b], d);
            }
        } else this.Jb == this.ze && 0 < this.Ra[b] && ek(a, this.Ra[b], this.sb);
    }
    Hk(this);
    this.Jb != this.ye && x(this.Ia + ":" + this.count + ": too many fields");
    return 0;
};
Gk.prototype.writeRecord = function (a) {
    var b, c, d, e;
    c = Yj(a);
    for (b = 1; b <= c; b++) {
        switch (ak(a, b)) {
            case "N":
                this.data += bk(a, b);
                break;
            case "S":
                this.data += '"';
                d = ck(a, b);
                for (e = 0; d.length > e; e++) '"' == d[e] ? (this.data += '""') : (this.data += d[e]);
                this.data += '"';
        }
        this.data += b < c ? "," : "\n";
    }
    this.count++;
    return 0;
};
Gk.prototype.flush = function (a) {
    this.te(a.a, this.mode, this.data);
};
Fk("CSV", Gk);
function Jk(a, b, c) {
    this.mode = b;
    this.Ia = null;
    2 > Wj(a) && x("json driver: file name not specified");
    this.Ia = Xj(a, 2);
    if ("R" == b)
        for (
            this.Ra = {},
            c
                ? ((this.data = c(a.a, b)),
                    "string" == typeof this.data && (this.data = JSON.parse(this.data)),
                    (this.cursor = 1))
                : x("json driver: unable to open " + this.Ia),
            a = 0,
            b = this.data[0];
            a < b.length;
            a++
        )
            this.Ra[b[a]] = a;
    else if ("W" == b) {
        this.te = c;
        c = [];
        this.data = [c];
        var d = Yj(a);
        for (b = 1; b <= d; b++) c.push(Zj(a, b));
    }
}
Jk.prototype.writeRecord = function (a) {
    var b,
        c = Yj(a),
        d = [];
    for (b = 1; b <= c; b++)
        switch (ak(a, b)) {
            case "N":
                d.push(bk(a, b));
                break;
            case "S":
                d.push(ck(a, b));
        }
    this.data.push(d);
    return 0;
};
Jk.prototype.readRecord = function (a) {
    var b = this.data[this.cursor++];
    if (null == b) return -1;
    for (var c = 1; c <= Yj(a); c++) {
        var d = this.Ra[Zj(a, c)];
        if (null != d)
            switch (((d = b[d]), typeof d)) {
                case "number":
                    dk(a, c, d);
                    break;
                case "boolean":
                    dk(a, c, Number(d));
                    break;
                case "string":
                    ek(a, c, d);
                    break;
                default:
                    x("Unexpected data type " + d + " in " + this.Ia);
            }
    }
    return 0;
};
Jk.prototype.flush = function (a) {
    this.te(a.a, this.mode, this.data);
};
Fk("JSON", Jk);
function Yb() {
    var a = { bc: 0 };
    a.wc = a.ah = a.bh = 0;
    a.name = a.ib = null;
    a.la = 0;
    a.ce = a.be = 0;
    a.Fb = a.Oc = null;
    a.Mb = a.rd = null;
    a.top = null;
    a.h = a.n = a.O = 0;
    a.qf = a.Rd = null;
    a.ha = a.se = 0;
    a.he = a.tg = a.Gg = a.vg = 0;
    a.pa = null;
    a.Ea = null;
    a.oa = null;
    a.Sa = null;
    return a;
}
function Kk(a, b, c) {
    0 == c
        ? ((b.ga = null), (b.next = a.Fb), null == b.next ? (a.Oc = b) : (b.next.ga = b), (a.Fb = b))
        : ((b.ga = a.Oc), (b.next = null), null == b.ga ? (a.Fb = b) : (b.ga.next = b), (a.Oc = b));
}
function Lk(a, b) {
    null == b.ga ? (a.Fb = b.next) : (b.ga.next = b.next);
    null == b.next ? (a.Oc = b.ga) : (b.next.ga = b.ga);
}
function Mk(a, b) {
    b.na || ((b.na = 1), Lk(a, b), Kk(a, b, 0));
}
function Nk(a, b, c) {
    0 == c
        ? ((b.ga = null), (b.next = a.Mb), null == b.next ? (a.rd = b) : (b.next.ga = b), (a.Mb = b))
        : ((b.ga = a.rd), (b.next = null), null == b.ga ? (a.Mb = b) : (b.ga.next = b), (a.rd = b));
}
function Ok(a, b) {
    null == b.ga ? (a.Mb = b.next) : (b.ga.next = b.next);
    null == b.next ? (a.rd = b.ga) : (b.next.ga = b.ga);
}
function Pk(a, b) {
    b.na || ((b.na = 1), Ok(a, b), Nk(a, b, 0));
}
function Qk(a) {
    var b = {};
    b.ia = ++a.ce;
    b.name = null;
    b.c = -t;
    b.f = +t;
    b.l = null;
    b.na = 0;
    Kk(a, b, 1);
    return b;
}
function Rk(a) {
    var b = {};
    b.H = ++a.be;
    b.name = null;
    b.Ua = 0;
    b.c = b.f = b.B = 0;
    b.l = null;
    b.na = 0;
    b.tb = {};
    b.wb = {};
    Nk(a, b, 1);
    return b;
}
function Sk(a, b, c) {
    var d = {};
    d.o = a;
    d.g = b;
    d.j = c;
    d.ya = null;
    d.G = a.l;
    d.va = null;
    d.L = b.l;
    null != d.G && (d.G.ya = d);
    null != d.L && (d.L.va = d);
    a.l = b.l = d;
}
function Tk(a, b) {
    var c;
    c = {};
    c.Xd = b;
    c.info = {};
    c.link = a.top;
    a.top = c;
    return c.info;
}
function Uk(a) {
    for (var b; null != a.l;)
        (b = a.l), (a.l = b.G), null == b.va ? (b.g.l = b.L) : (b.va.L = b.L), null != b.L && (b.L.va = b.va);
}
function Vk(a, b) {
    Uk(b);
    Lk(a, b);
}
function Wk(a, b) {
    for (var c; null != b.l;)
        (c = b.l), (b.l = c.L), null == c.ya ? (c.o.l = c.G) : (c.ya.G = c.G), null != c.G && (c.G.ya = c.ya);
    Ok(a, b);
}
function Zb(a, b, c) {
    var d = cb,
        e = cb,
        f = b.h,
        g = b.n,
        k,
        h,
        l;
    a.bc = b.dir;
    a.bc == za ? (l = 1) : a.bc == Ea && (l = -1);
    a.wc = f;
    a.ah = g;
    a.bh = b.O;
    d && null != b.name && (a.name = b.name);
    d && null != b.ib && (a.ib = b.ib);
    a.la = l * b.la;
    k = Array(1 + f);
    for (h = 1; h <= f; h++) {
        var n = b.o[h],
            m;
        k[h] = m = Qk(a);
        d && null != n.name && (m.name = n.name);
        if (e) {
            var q = n.qa;
            n.type == Ka
                ? ((m.c = -t), (m.f = +t))
                : n.type == Sa
                    ? ((m.c = n.c * q), (m.f = +t))
                    : n.type == Ta
                        ? ((m.c = -t), (m.f = n.f * q))
                        : n.type == Q
                            ? ((m.c = n.c * q), (m.f = n.f * q))
                            : n.type == C && (m.c = m.f = n.c * q);
        } else
            n.type == Ka
                ? ((m.c = -t), (m.f = +t))
                : n.type == Sa
                    ? ((m.c = n.c), (m.f = +t))
                    : n.type == Ta
                        ? ((m.c = -t), (m.f = n.f))
                        : n.type == Q
                            ? ((m.c = n.c), (m.f = n.f))
                            : n.type == C && (m.c = m.f = n.c);
    }
    for (f = 1; f <= g; f++)
        if (
            ((m = b.g[f]),
                (h = Rk(a)),
                d && null != m.name && (h.name = m.name),
                c == Sc && (h.Ua = Number(m.kind == Fc)),
                e)
        )
            for (
                n = m.za,
                m.type == Ka
                    ? ((h.c = -t), (h.f = +t))
                    : m.type == Sa
                        ? ((h.c = m.c / n), (h.f = +t))
                        : m.type == Ta
                            ? ((h.c = -t), (h.f = m.f / n))
                            : m.type == Q
                                ? ((h.c = m.c / n), (h.f = m.f / n))
                                : m.type == C && (h.c = h.f = m.c / n),
                h.B = l * m.B * n,
                m = m.l;
                null != m;
                m = m.L
            )
                Sk(k[m.o.ia], h, m.o.qa * m.j * n);
        else
            for (
                m.type == Ka
                    ? ((h.c = -t), (h.f = +t))
                    : m.type == Sa
                        ? ((h.c = m.c), (h.f = +t))
                        : m.type == Ta
                            ? ((h.c = -t), (h.f = m.f))
                            : m.type == Q
                                ? ((h.c = m.c), (h.f = m.f))
                                : m.type == C && (h.c = h.f = m.c),
                h.B = l * m.B,
                m = m.l;
                null != m;
                m = m.L
            )
                Sk(k[m.o.ia], h, m.j);
    a.ha = c;
    a.se = e;
}
function dc(a, b) {
    var c, d, e, f, g, k, h;
    db(b);
    Ca(b, a.name);
    Da(b, a.ib);
    Fa(b, a.bc);
    a.bc == za ? (k = 1) : a.bc == Ea && (k = -1);
    Xa(b, 0, k * a.la);
    for (c = a.Fb; null != c; c = c.next)
        (c.na = e = La(b, 1)),
            Pa(b, e, c.name),
            (d = c.c == -t && c.f == +t ? Ka : c.f == +t ? Sa : c.c == -t ? Ta : c.c != c.f ? Q : C),
            Ua(b, e, d, c.c, c.f);
    g = new Int32Array(1 + b.h);
    h = new Float64Array(1 + b.h);
    for (c = a.Mb; null != c; c = c.next) {
        e = Oa(b, 1);
        Qa(b, e, c.name);
        Hc(b, e, c.Ua ? Fc : Ma);
        d = c.c == -t && c.f == +t ? Ka : c.f == +t ? Sa : c.c == -t ? Ta : c.c != c.f ? Q : C;
        Va(b, e, d, c.c, c.f);
        Xa(b, e, k * c.B);
        f = 0;
        for (d = c.l; null != d; d = d.L) f++, (g[f] = d.o.na), (h[f] = d.j);
        Za(b, e, f, g, h);
    }
    a.h = b.h;
    a.n = b.n;
    a.O = b.O;
    a.qf = new Int32Array(1 + a.h);
    a.Rd = new Int32Array(1 + a.n);
    c = a.Fb;
    for (e = 0; null != c; c = c.next) a.qf[++e] = c.ia;
    c = a.Mb;
    for (e = 0; null != c; c = c.next) a.Rd[++e] = c.H;
    a.name = a.ib = null;
    a.la = 0;
    a.Fb = a.Oc = null;
    a.Mb = a.rd = null;
}
function Vb(a, b) {
    var c, d, e, f;
    a.bc == za ? (d = 1) : a.bc == Ea && (d = -1);
    a.ha == $b ? ((a.he = b.ra), (a.tg = b.wa)) : a.ha == le ? (a.Gg = b.bf) : a.ha == Sc && (a.vg = b.Da);
    if (a.ha == $b) {
        null == a.pa && (a.pa = new Int8Array(1 + a.ce));
        for (f = 1; f <= a.ce; f++) a.pa[f] = 0;
        null == a.oa && (a.oa = new Int8Array(1 + a.be));
        for (c = 1; c <= a.be; c++) a.oa[c] = 0;
    }
    null == a.Sa && (a.Sa = new Float64Array(1 + a.be));
    for (c = 1; c <= a.be; c++) a.Sa[c] = t;
    if (a.ha != Sc) for (null == a.Ea && (a.Ea = new Float64Array(1 + a.ce)), f = 1; f <= a.ce; f++) a.Ea[f] = t;
    if (a.ha == $b) {
        for (f = 1; f <= a.h; f++) (c = b.o[f]), (e = a.qf[f]), (a.pa[e] = c.stat), (a.Ea[e] = d * c.M);
        for (c = 1; c <= a.n; c++) (d = b.g[c]), (e = a.Rd[c]), (a.oa[e] = d.stat), (a.Sa[e] = d.w);
    } else if (a.ha == le) {
        for (f = 1; f <= a.h; f++) (c = b.o[f]), (e = a.qf[f]), (a.Ea[e] = d * c.nc);
        for (c = 1; c <= a.n; c++) (d = b.g[c]), (e = a.Rd[c]), (a.Sa[e] = d.Tb);
    } else if (a.ha == Sc) for (c = 1; c <= a.n; c++) (d = b.g[c]), (e = a.Rd[c]), (a.Sa[e] = d.Va);
    for (e = a.top; null != e; e = e.link) e.Xd(a, e.info);
}
function Wb(a, b) {
    var c, d, e, f;
    a.bc == za ? (e = 1) : a.bc == Ea && (e = -1);
    if (a.ha == $b) {
        b.valid = 0;
        b.ra = a.he;
        b.wa = a.tg;
        b.ea = b.la;
        b.some = 0;
        for (d = 1; d <= b.h; d++)
            (c = b.o[d]),
                (c.stat = a.pa[d]),
                (c.M = a.se ? e * a.Ea[d] * c.qa : e * a.Ea[d]),
                c.stat == A
                    ? (c.M = 0)
                    : c.stat == M
                        ? (c.w = c.c)
                        : c.stat == P
                            ? (c.w = c.f)
                            : c.stat == Ra
                                ? (c.w = 0)
                                : c.stat == Na && (c.w = c.c);
        for (d = 1; d <= b.n; d++)
            (c = b.g[d]),
                (c.stat = a.oa[d]),
                a.se ? (c.w = a.Sa[d] * c.za) : (c.w = a.Sa[d]),
                c.stat == A
                    ? (c.M = 0)
                    : c.stat == M
                        ? (c.w = c.c)
                        : c.stat == P
                            ? (c.w = c.f)
                            : c.stat == Ra
                                ? (c.w = 0)
                                : c.stat == Na && (c.w = c.c),
                (b.ea += c.B * c.w);
        for (d = 1; d <= b.h; d++)
            if (((c = b.o[d]), c.stat == A)) {
                f = 0;
                for (e = c.l; null != e; e = e.G) f += e.j * e.g.w;
                c.w = f;
            }
        for (d = 1; d <= b.n; d++)
            if (((c = b.g[d]), c.stat != A)) {
                f = c.B;
                for (e = c.l; null != e; e = e.L) f -= e.j * e.o.M;
                c.M = f;
            }
    } else if (a.ha == le) {
        b.bf = a.Gg;
        b.Zd = b.la;
        for (d = 1; d <= b.h; d++) (c = b.o[d]), (c.nc = a.se ? e * a.Ea[d] * c.qa : e * a.Ea[d]);
        for (d = 1; d <= b.n; d++)
            (c = b.g[d]), a.se ? (c.Tb = a.Sa[d] * c.za) : (c.Tb = a.Sa[d]), (b.Zd += c.B * c.Tb);
        for (d = 1; d <= b.h; d++) {
            c = b.o[d];
            f = 0;
            for (e = c.l; null != e; e = e.G) f += e.j * e.g.Tb;
            c.Tb = f;
        }
        for (d = 1; d <= b.n; d++) {
            c = b.g[d];
            f = c.B;
            for (e = c.l; null != e; e = e.L) f -= e.j * e.o.nc;
            c.nc = f;
        }
    } else if (a.ha == Sc) {
        b.Da = a.vg;
        b.xa = b.la;
        for (d = 1; d <= b.n; d++) (c = b.g[d]), (c.Va = a.Sa[d]), (b.xa += c.B * c.Va);
        for (d = 1; d <= b.h; d++) {
            c = b.o[d];
            f = 0;
            for (e = c.l; null != e; e = e.G) f += e.j * e.g.Va;
            c.Va = f;
        }
    }
}
function Xk(a, b) {
    Tk(a, function (a, b) {
        a.ha == $b && (a.pa[b.p] = A);
        a.ha != Sc && (a.Ea[b.p] = 0);
        return 0;
    }).p = b.ia;
    Vk(a, b);
}
function Yk(a, b) {
    var c, d;
    c = Tk(a, function (a, b) {
        if (a.ha == $b)
            if (a.oa[b.q] == A || a.oa[b.q] == M || a.oa[b.q] == P) a.oa[b.q] = a.oa[b.q];
            else return 1;
        a.Sa[b.q] = b.Ig + a.Sa[b.q];
        return 0;
    });
    c.q = b.H;
    c.Ig = b.c;
    a.la += b.B * b.c;
    for (d = b.l; null != d; d = d.L)
        (c = d.o),
            c.c == c.f
                ? (c.f = c.c -= d.j * b.c)
                : (c.c != -t && (c.c -= d.j * b.c), c.f != +t && (c.f -= d.j * b.c));
    b.f != +t && (b.f -= b.c);
    b.c = 0;
}
function Zk(a, b) {
    var c, d;
    c = Tk(a, function (a, b) {
        a.ha == $b && (a.oa[b.q] = Na);
        a.Sa[b.q] = b.kh;
        return 0;
    });
    c.q = b.H;
    c.kh = b.c;
    a.la += b.B * b.c;
    for (d = b.l; null != d; d = d.L)
        (c = d.o),
            c.c == c.f
                ? (c.f = c.c -= d.j * b.c)
                : (c.c != -t && (c.c -= d.j * b.c), c.f != +t && (c.f -= d.j * b.c));
    Wk(a, b);
}
function $k(a, b) {
    var c, d, e;
    d = 1e-9 + 1e-12 * Math.abs(b.c);
    b.f - b.c > d ||
        ((Tk(a, function (a, b) {
            if (a.ha == $b)
                if (a.pa[b.p] == A) a.pa[b.p] = A;
                else if (a.pa[b.p] == Na) a.pa[b.p] = 0 <= a.Ea[b.p] ? M : P;
                else return 1;
            return 0;
        }).p = b.ia),
            (c = 0.5 * (b.f + b.c)),
            (e = Math.floor(c + 0.5)),
            Math.abs(c - e) <= d && (c = e),
            (b.c = b.f = c));
}
function al(a, b) {
    var c, d, e, f;
    f = 1e-9 + 1e-12 * Math.abs(b.c);
    if (b.f - b.c > f) return 0;
    c = Tk(a, function (a, b) {
        var c, d;
        if (a.ha == $b)
            if (a.oa[b.q] == A) a.oa[b.q] = A;
            else if (a.oa[b.q] == Na) {
                d = b.m;
                for (c = b.l; null != c; c = c.next) d -= c.j * a.Ea[c.Ra];
                a.oa[b.q] = 0 <= d ? M : P;
            } else return 1;
        return 0;
    });
    c.q = b.H;
    c.m = b.B;
    c.l = null;
    if (a.ha == $b)
        for (d = b.l; null != d; d = d.L) (e = {}), (e.Ra = d.o.ia), (e.j = d.j), (e.next = c.l), (c.l = e);
    c = 0.5 * (b.f + b.c);
    d = Math.floor(c + 0.5);
    Math.abs(c - d) <= f && (c = d);
    b.c = b.f = c;
    return 1;
}
function bl(a, b) {
    if (0.001 < b.c || -0.001 > b.f) return 1;
    b.c = -t;
    b.f = +t;
    Xk(a, b);
    return 0;
}
function cl(a, b) {
    function c() {
        e.stat = M;
        b.f = b.c;
    }
    function d() {
        e.stat = P;
        b.c = b.f;
    }
    var e;
    if ((0.001 < b.B && b.c == -t) || (-0.001 > b.B && b.f == +t)) return 1;
    e = Tk(a, function (a, b) {
        a.ha == $b && (a.oa[b.q] = b.stat);
        return 0;
    });
    e.q = b.H;
    b.c == -t && b.f == +t
        ? ((e.stat = Ra), (b.c = b.f = 0))
        : b.f == +t
            ? c()
            : b.c == -t
                ? d()
                : b.c != b.f
                    ? 2.220446049250313e-16 <= b.B
                        ? c()
                        : -2.220446049250313e-16 >= b.B
                            ? d()
                            : Math.abs(b.c) <= Math.abs(b.f)
                                ? c()
                                : d()
                    : (e.stat = Na);
    Zk(a, b);
    return 0;
}
function dl(a, b) {
    var c;
    if (a.Ua)
        if (((c = Math.floor(b + 0.5)), 1e-5 >= Math.abs(b - c))) b = c;
        else return 2;
    if (a.c != -t) {
        c = a.Ua ? 1e-5 : 1e-5 + 1e-8 * Math.abs(a.c);
        if (b < a.c - c) return 1;
        if (b < a.c + 0.001 * c) return (a.f = a.c), 0;
    }
    if (a.f != +t) {
        c = a.Ua ? 1e-5 : 1e-5 + 1e-8 * Math.abs(a.f);
        if (b > a.f + c) return 1;
        if (b > a.f - 0.001 * c) return (a.c = a.f), 0;
    }
    a.c = a.f = b;
    return 0;
}
function el(a, b) {
    var c, d, e;
    e = b.l;
    d = e.g;
    c = dl(d, b.c / e.j);
    if (0 != c) return c;
    c = Tk(a, function (a, b) {
        var c, d;
        if (a.ha == $b) {
            if (a.oa[b.q] != Na) return 1;
            a.pa[b.p] = Na;
            a.oa[b.q] = A;
        }
        if (a.ha != Sc) {
            d = b.m;
            for (c = b.l; null != c; c = c.next) d -= c.j * a.Ea[c.Ra];
            a.Ea[b.p] = d / b.Ha;
        }
        return 0;
    });
    c.p = b.ia;
    c.q = d.H;
    c.Ha = e.j;
    c.m = d.B;
    c.l = null;
    if (a.ha != Sc)
        for (e = d.l; null != e; e = e.L)
            e.o != b && ((d = {}), (d.Ra = e.o.ia), (d.j = e.j), (d.next = c.l), (c.l = d));
    Vk(a, b);
    return 0;
}
function fl(a, b) {
    var c;
    a.Ua && ((c = Math.floor(b + 0.5)), (b = 1e-5 >= Math.abs(b - c) ? c : Math.ceil(b)));
    if (a.c != -t && ((c = a.Ua ? 0.001 : 0.001 + 1e-6 * Math.abs(a.c)), b < a.c + c)) return 0;
    if (a.f != +t) {
        c = a.Ua ? 1e-5 : 1e-5 + 1e-8 * Math.abs(a.f);
        if (b > a.f + c) return 4;
        if (b > a.f - 0.001 * c) return (a.c = a.f), 3;
    }
    c = a.c == -t ? 2 : a.Ua && b > a.c + 0.5 ? 2 : b > a.c + 0.3 * (1 + Math.abs(a.c)) ? 2 : 1;
    a.c = b;
    return c;
}
function gl(a, b) {
    var c;
    a.Ua && ((c = Math.floor(b + 0.5)), (b = 1e-5 >= Math.abs(b - c) ? c : Math.floor(b)));
    if (a.f != +t && ((c = a.Ua ? 0.001 : 0.001 + 1e-6 * Math.abs(a.f)), b > a.f - c)) return 0;
    if (a.c != -t) {
        c = a.Ua ? 1e-5 : 1e-5 + 1e-8 * Math.abs(a.c);
        if (b < a.c - c) return 4;
        if (b < a.c + 0.001 * c) return (a.f = a.c), 3;
    }
    c = a.f == +t ? 2 : a.Ua && b < a.f - 0.5 ? 2 : b < a.f - 0.3 * (1 + Math.abs(a.f)) ? 2 : 1;
    a.f = b;
    return c;
}
function hl(a, b) {
    var c, d, e, f, g, k;
    e = b.l;
    d = e.g;
    0 < e.j
        ? ((g = b.c == -t ? -t : b.c / e.j), (c = b.f == +t ? +t : b.f / e.j))
        : ((g = b.f == +t ? -t : b.f / e.j), (c = b.c == -t ? +t : b.c / e.j));
    if (g == -t) g = 0;
    else if (((g = fl(d, g)), 4 == g)) return 4;
    if (c == +t) k = 0;
    else if (3 == g) k = 0;
    else if (((k = gl(d, c)), 4 == k)) return 4;
    if (!g && !k) return (b.c = -t), (b.f = +t), Xk(a, b), 0;
    c = Tk(a, function (a, b) {
        var c, d;
        if (a.ha == Sc) return 0;
        d = b.m;
        for (c = b.l; null != c; c = c.next) d -= c.j * a.Ea[c.Ra];
        if (a.ha == $b) {
            c = function () {
                b.cg
                    ? ((a.pa[b.p] = 0 < b.Ha ? P : M), (a.oa[b.q] = A), (a.Ea[b.p] = d / b.Ha))
                    : ((a.pa[b.p] = A), (a.Ea[b.p] = 0));
                return 0;
            };
            var e = function () {
                b.Rf
                    ? ((a.pa[b.p] = 0 < b.Ha ? M : P), (a.oa[b.q] = A), (a.Ea[b.p] = d / b.Ha))
                    : ((a.pa[b.p] = A), (a.Ea[b.p] = 0));
                return 0;
            };
            if (a.oa[b.q] == A) (a.pa[b.p] = A), (a.Ea[b.p] = 0);
            else if (a.oa[b.q] == M) e();
            else if (a.oa[b.q] == P) c();
            else if (a.oa[b.q] == Na) {
                if (1e-7 < d && ((0 < b.Ha && b.c != -t) || (0 > b.Ha && b.f != +t) || !b.Rf))
                    return (a.oa[b.q] = M), e();
                if (-1e-7 > d && ((0 < b.Ha && b.f != +t) || (0 > b.Ha && b.c != -t) || !b.cg))
                    return (a.oa[b.q] = P), c();
                if (b.c != -t && b.f == +t) a.pa[b.p] = M;
                else if (b.c == -t && b.f != +t) a.pa[b.p] = P;
                else if (b.c != -t && b.f != +t) a.pa[b.p] = b.Ha * a.Sa[b.q] <= 0.5 * (b.c + b.f) ? M : P;
                else return 1;
                a.oa[b.q] = A;
                a.Ea[b.p] = d / b.Ha;
            } else return 1;
        }
        a.ha == le &&
            (a.Ea[b.p] =
                (2.220446049250313e-16 < d && b.Rf) || (-2.220446049250313e-16 > d && b.cg) ? d / b.Ha : 0);
        return 0;
    });
    c.p = b.ia;
    c.q = d.H;
    c.Ha = e.j;
    c.m = d.B;
    c.c = b.c;
    c.f = b.f;
    c.Rf = g;
    c.cg = k;
    c.l = null;
    if (a.ha != Sc)
        for (d = d.l; null != d; d = d.L)
            d != e && ((f = {}), (f.Ra = d.o.ia), (f.j = d.j), (f.next = c.l), (c.l = f));
    Vk(a, b);
    return g >= k ? g : k;
}
function il(a, b) {
    var c, d, e, f;
    e = b.l;
    d = e.o;
    c = Tk(a, function (a, b) {
        var c, d;
        if (a.ha == $b) {
            if (a.pa[b.p] == A || a.pa[b.p] == Ra) a.oa[b.q] = a.pa[b.p];
            else if (a.pa[b.p] == M) a.oa[b.q] = 0 < b.Ha ? P : M;
            else if (a.pa[b.p] == P) a.oa[b.q] = 0 < b.Ha ? M : P;
            else return 1;
            a.pa[b.p] = Na;
        }
        a.ha != Sc && (a.Ea[b.p] += b.m / b.Ha);
        c = b.od;
        for (d = b.l; null != d; d = d.next) c -= d.j * a.Sa[d.Ra];
        a.Sa[b.q] = c / b.Ha;
        return 0;
    });
    c.p = d.ia;
    c.q = b.H;
    c.Ha = e.j;
    c.od = d.c;
    c.m = b.B;
    c.l = null;
    for (e = d.l; null != e; e = e.G)
        e.g != b &&
            ((f = {}), (f.Ra = e.g.H), (f.j = e.j), (f.next = c.l), (c.l = f), (e.g.B -= (e.j / c.Ha) * c.m));
    a.la += (c.od / c.Ha) * c.m;
    0 < c.Ha
        ? ((d.c = b.f == +t ? -t : c.od - c.Ha * b.f), (d.f = b.c == -t ? +t : c.od - c.Ha * b.c))
        : ((d.c = b.c == -t ? -t : c.od - c.Ha * b.c), (d.f = b.f == +t ? +t : c.od - c.Ha * b.f));
    Wk(a, b);
}
function jl(a, b) {
    function c() {
        e.stat = M;
        f.f = f.c;
    }
    function d() {
        e.stat = P;
        f.c = f.f;
    }
    var e, f, g, k, h, l;
    g = b.l;
    f = g.o;
    h = f.c;
    if (h != -t)
        for (k = f.l; null != k; k = k.G)
            if (k != g)
                if (0 < k.j) {
                    if (k.g.f == +t) {
                        h = -t;
                        break;
                    }
                    h -= k.j * k.g.f;
                } else {
                    if (k.g.c == -t) {
                        h = -t;
                        break;
                    }
                    h -= k.j * k.g.c;
                }
    l = f.f;
    if (l != +t)
        for (k = f.l; null != k; k = k.G)
            if (k != g)
                if (0 < k.j) {
                    if (k.g.c == -t) {
                        l = +t;
                        break;
                    }
                    l -= k.j * k.g.c;
                } else {
                    if (k.g.f == +t) {
                        l = +t;
                        break;
                    }
                    l -= k.j * k.g.f;
                }
    k = 0 < g.j ? (h == -t ? -t : h / g.j) : l == +t ? -t : l / g.j;
    h = 0 < g.j ? (l == +t ? +t : l / g.j) : h == -t ? +t : h / g.j;
    if (
        (b.c != -t && ((l = 1e-9 + 1e-12 * Math.abs(b.c)), k < b.c - l)) ||
        (b.f != +t && ((l = 1e-9 + 1e-12 * Math.abs(b.f)), h > b.f + l))
    )
        return 1;
    b.c = -t;
    b.f = +t;
    e = Tk(a, function (a, b) {
        if (a.ha == $b)
            if (a.pa[b.p] == A) a.pa[b.p] = A;
            else if (a.pa[b.p] == Na) a.pa[b.p] = b.stat;
            else return 1;
        return 0;
    });
    e.p = f.ia;
    e.stat = -1;
    g = b.B / g.j;
    if (2.220446049250313e-16 < g)
        if (f.c != -t) c();
        else {
            if (1e-5 < g) return 2;
            d();
        }
    else if (-2.220446049250313e-16 > g)
        if (f.f != +t) d();
        else {
            if (-1e-5 > g) return 2;
            c();
        }
    else f.f == +t ? c() : f.c == -t ? d() : Math.abs(f.c) <= Math.abs(f.f) ? c() : d();
    return 0;
}
function kl(a, b, c) {
    var d,
        e = null,
        f,
        g,
        k;
    d = 1;
    for (g = b.l; null != g; g = g.G) d < Math.abs(g.j) && (d = Math.abs(g.j));
    for (g = b.l; null != g; g = g.G) if (Math.abs(g.j) < 1e-7 * d) return 1;
    d = Tk(a, function (a, b) {
        var c, d, e, f, g;
        if (a.ha == Sc) return 0;
        if (a.ha == $b) {
            if (a.pa[b.p] != A) return 1;
            for (c = b.l; null != c; c = c.next) {
                if (a.oa[c.H] != Na) return 1;
                a.oa[c.H] = c.stat;
            }
        }
        for (c = b.l; null != c; c = c.next) {
            e = c.m;
            for (d = c.l; null != d; d = d.next) e -= d.j * a.Ea[d.Ra];
            c.m = e;
        }
        d = null;
        f = 0;
        for (c = b.l; null != c; c = c.next)
            if (((e = c.m), (g = Math.abs(e / c.Jc)), c.stat == M)) 0 > e && f < g && ((d = c), (f = g));
            else if (c.stat == P) 0 < e && f < g && ((d = c), (f = g));
            else return 1;
        null != d && (a.ha == $b && ((a.pa[b.p] = b.stat), (a.oa[d.H] = A)), (a.Ea[b.p] = d.m / d.Jc));
        return 0;
    });
    d.p = b.ia;
    d.stat = b.c == b.f ? Na : 0 == c ? M : P;
    d.l = null;
    for (g = b.l; null != g; g = g.G)
        if (
            ((f = g.g),
                a.ha != Sc &&
                ((e = {}),
                    (e.H = f.H),
                    (e.stat = -1),
                    (e.Jc = g.j),
                    (e.m = f.B),
                    (e.l = null),
                    (e.next = d.l),
                    (d.l = e)),
                (0 == c && 0 > g.j) || (0 != c && 0 < g.j)
                    ? (a.ha != Sc && (e.stat = M), (f.f = f.c))
                    : (a.ha != Sc && (e.stat = P), (f.c = f.f)),
                a.ha != Sc)
        )
            for (f = f.l; null != f; f = f.L)
                f != g && ((k = {}), (k.Ra = f.o.ia), (k.j = f.j), (k.next = e.l), (e.l = k));
    b.c = -t;
    b.f = +t;
    return 0;
}
function ll(a) {
    var b,
        c = 0,
        d,
        e;
    d = 0;
    for (b = a.l; null != b; b = b.G)
        if (0 < b.j) {
            if (b.g.c == -t) {
                d = -t;
                break;
            }
            d += b.j * b.g.c;
        } else {
            if (b.g.f == +t) {
                d = -t;
                break;
            }
            d += b.j * b.g.f;
        }
    e = 0;
    for (b = a.l; null != b; b = b.G)
        if (0 < b.j) {
            if (b.g.f == +t) {
                e = +t;
                break;
            }
            e += b.j * b.g.f;
        } else {
            if (b.g.c == -t) {
                e = +t;
                break;
            }
            e += b.j * b.g.c;
        }
    if (
        (a.c != -t && ((b = 0.001 + 1e-6 * Math.abs(a.c)), a.c - b > e)) ||
        (a.f != +t && ((b = 0.001 + 1e-6 * Math.abs(a.f)), a.f + b < d))
    )
        return 51;
    a.c != -t && ((b = 1e-9 + 1e-12 * Math.abs(a.c)), a.c - b > d && (c = a.c + b <= e ? c | 1 : c | 2));
    a.f != +t && ((b = 1e-9 + 1e-12 * Math.abs(a.f)), a.f + b < e && (c = a.f - b >= d ? c | 16 : c | 32));
    return c;
}
function ml(a, b, c) {
    a.ha == $b &&
        ((a = Tk(a, function (a, b) {
            if (a.ha != $b) return 1;
            a.pa[b.p] = a.pa[b.p] == A ? A : b.stat;
            return 0;
        })),
            (a.p = b.ia),
            (a.stat = b.f == +t ? M : b.c == -t ? P : b.c != b.f ? (0 == c ? P : M) : Na));
    0 == c ? (b.c = -t) : 1 == c && (b.f = +t);
}
function nl(a) {
    var b, c, d, e, f, g, k, h, l, n, m;
    h = l = n = m = 0;
    for (d = a.rd; null != d; d = d.ga)
        if (d.Ua && d.c != d.f && (0 != d.c || 1 != d.f))
            if (-1e6 > d.c || 1e6 < d.f || 4095 < d.f - d.c) h++;
            else if ((l++, 0 != d.c && Yk(a, d), (e = d.f | 0), 1 != e)) {
                g = 2;
                for (c = 4; e >= c;) g++, (c += c);
                n += g;
                b = Tk(a, function (a, b) {
                    var c,
                        d,
                        e = a.Sa[b.q];
                    c = 1;
                    for (d = 2; c < b.n; c++, d += d) e += d * a.Sa[b.H + (c - 1)];
                    a.Sa[b.q] = e;
                    return 0;
                });
                b.q = d.H;
                b.H = 0;
                b.n = g;
                e < c - 1 ? ((c = Qk(a)), m++, (c.c = -t), (c.f = e)) : (c = null);
                d.f = 1;
                null != c && Sk(c, d, 1);
                k = 1;
                for (c = 2; k < g; k++, c += c)
                    for (
                        e = Rk(a), e.Ua = 1, e.c = 0, e.f = 1, e.B = c * d.B, 0 == b.H && (b.H = e.H), f = d.l;
                        null != f;
                        f = f.L
                    )
                        Sk(f.o, e, c * f.j);
            }
    0 < l && y(l + " integer variable(s) were replaced by " + n + " binary ones");
    0 < m && y(m + " row(s) were added due to binarization");
    0 < h && y("Binarization failed for " + h + " integer variable(s)");
}
function ol(a, b) {
    var c, d, e;
    d = null;
    for (c = a.l; null != c; c = c.G) (e = {}), (e.ja = b * c.j), (e.kc = c.g), (e.next = d), (d = e);
    return d;
}
function pl(a, b, c) {
    var d, e, f;
    for (d = a; null != d; d = d.next);
    e = 0;
    for (d = a; null != d; d = d.next)
        if (1 != d.ja)
            if (-1 == d.ja) e++;
            else break;
    if (null == d && b == 1 - e) return 1;
    for (d = a; null != d; d = d.next) 0 > d.ja && (b -= d.ja);
    for (d = a; null != d; d = d.next) if (Math.abs(d.ja) > b) return 0;
    e = null;
    for (d = a; null != d; d = d.next) if (null == e || Math.abs(e.ja) > Math.abs(d.ja)) e = d;
    f = null;
    for (d = a; null != d; d = d.next) d != e && (null == f || Math.abs(f.ja) > Math.abs(d.ja)) && (f = d);
    if (Math.abs(e.ja) + Math.abs(f.ja) <= b + (0.001 + 1e-6 * Math.abs(b))) return 0;
    b = 1;
    for (d = a; null != d; d = d.next) 0 < d.ja ? (d.ja = 1) : ((d.ja = -1), --b);
    c(b);
    return 2;
}
function ql(a, b) {
    var c,
        d,
        e,
        f,
        g = 0,
        k;
    for (f = 0; 1 >= f; f++) {
        if (0 == f) {
            if (b.f == +t) continue;
            e = ol(b, 1);
            k = +b.f;
        } else {
            if (b.c == -t) continue;
            e = ol(b, -1);
            k = -b.c;
        }
        c = pl(e, k, function (a) {
            k = a;
        });
        if ((1 == f && 1 == c) || 2 == c) {
            g++;
            if (b.c == -t || b.f == +t) c = null;
            else
                for (
                    c = Qk(a), 0 == f ? ((c.c = b.c), (c.f = +t)) : ((c.c = -t), (c.f = b.f)), d = b.l;
                    null != d;
                    d = d.G
                )
                    Sk(c, d.g, d.j);
            Uk(b);
            b.c = -t;
            for (b.f = k; null != e; e = e.next) Sk(b, e.kc, e.ja);
            null != c && (b = c);
        }
    }
    return g;
}
function rl(a, b, c) {
    var d, e;
    for (d = a; null != d; d = d.next);
    e = 0;
    for (d = a; null != d; d = d.next)
        if (1 != d.ja)
            if (-1 == d.ja) e++;
            else break;
    if (null == d && b == 1 - e) return 1;
    for (d = a; null != d; d = d.next) 0 > d.ja && (b -= d.ja);
    if (0.001 > b) return 0;
    e = 1e-9 + 1e-12 * Math.abs(b);
    for (d = a; null != d; d = d.next) if (Math.abs(d.ja) < b - e) return 0;
    b = 1;
    for (d = a; null != d; d = d.next) 0 < d.ja ? (d.ja = 1) : ((d.ja = -1), --b);
    c(b);
    return 2;
}
function sl(a, b) {
    var c,
        d,
        e,
        f,
        g = 0,
        k;
    for (f = 0; 1 >= f; f++) {
        if (0 == f) {
            if (b.c == -t) continue;
            e = ol(b, 1);
            k = +b.c;
        } else {
            if (b.f == +t) continue;
            e = ol(b, -1);
            k = -b.f;
        }
        c = rl(e, k, function (a) {
            k = a;
        });
        if ((1 == f && 1 == c) || 2 == c) {
            g++;
            if (b.c == -t || b.f == +t) c = null;
            else
                for (
                    c = Qk(a), 0 == f ? ((c.c = -t), (c.f = b.f)) : ((c.c = b.c), (c.f = +t)), d = b.l;
                    null != d;
                    d = d.G
                )
                    Sk(c, d.g, d.j);
            Uk(b);
            b.c = k;
            for (b.f = +t; null != e; e = e.next) Sk(b, e.kc, e.ja);
            null != c && (b = c);
        }
    }
    return g;
}
function tl(a, b, c) {
    var d,
        e = 0,
        f,
        g;
    f = 0;
    for (d = a; null != d; d = d.next)
        if (0 < d.ja) {
            if (d.kc.c == -t) return e;
            f += d.ja * d.kc.c;
        } else {
            if (d.kc.f == +t) return e;
            f += d.ja * d.kc.f;
        }
    for (d = a; null != d; d = d.next)
        d.kc.Ua &&
            0 == d.kc.c &&
            1 == d.kc.f &&
            (0 < d.ja
                ? ((a = f),
                    b - d.ja < a &&
                    a < b &&
                    ((g = b - a), 0.001 <= g && d.ja - g >= 0.01 * (1 + d.ja) && ((d.ja = g), e++)))
                : ((a = f - d.ja),
                    b < a &&
                    a < b - d.ja &&
                    ((g = d.ja + (a - b)),
                        -0.001 >= g && g - d.ja >= 0.01 * (1 - d.ja) && ((d.ja = g), (f += a - b), (b = a), e++))));
    c(b);
    return e;
}
function ul(a, b) {
    var c,
        d,
        e,
        f,
        g = Array(2),
        k;
    for (f = g[0] = g[1] = 0; 1 >= f; f++) {
        if (0 == f) {
            if (b.c == -t) continue;
            e = ol(b, 1);
            k = +b.c;
        } else {
            if (b.f == +t) continue;
            e = ol(b, -1);
            k = -b.f;
        }
        g[f] = tl(e, k, function (a) {
            k = a;
        });
        if (0 < g[f]) {
            if (b.c == -t || b.f == +t) c = null;
            else
                for (
                    c = Qk(a), 0 == f ? ((c.c = -t), (c.f = b.f)) : ((c.c = b.c), (c.f = +t)), d = b.l;
                    null != d;
                    d = d.G
                )
                    Sk(c, d.g, d.j);
            Uk(b);
            b.c = k;
            b.f = +t;
            for (d = e; null != d; d = d.next) Sk(b, d.kc, d.ja);
            null != c && (b = c);
        }
    }
    return g[0] + g[1];
}
function vl(a, b, c) {
    function d() {
        for (f = b.l; null != f; f = g) {
            e = f.g;
            g = f.G;
            for (k = e.l; null != k; k = k.L) Mk(a, k.o);
            Zk(a, e);
        }
        Xk(a, b);
        return 0;
    }
    var e, f, g, k, h;
    if (null == b.l) {
        h = bl(a, b);
        if (0 == h) return 0;
        if (1 == h) return bc;
    }
    if (null == b.l.G)
        if (((e = b.l.g), b.c == b.f)) {
            h = el(a, b);
            if (0 == h) {
                for (f = e.l; null != f; f = f.L) Mk(a, f.o);
                Zk(a, e);
                return 0;
            }
            if (1 == h || 2 == h) return bc;
        } else {
            h = hl(a, b);
            if (0 <= h && 3 >= h) {
                Pk(a, e);
                if (2 <= h) for (f = e.l; null != f; f = f.L) Mk(a, f.o);
                3 == h && Zk(a, e);
                return 0;
            }
            if (4 == h) return bc;
        }
    h = ll(b);
    if (51 == h) return bc;
    if (0 == (h & 15)) b.c != -t && ml(a, b, 0);
    else if (1 != (h & 15) && 2 == (h & 15) && 0 == kl(a, b, 0)) return d();
    if (0 == (h & 240)) b.f != +t && ml(a, b, 1);
    else if (16 != (h & 240) && 32 == (h & 240) && 0 == kl(a, b, 1)) return d();
    if (b.c == -t && b.f == +t) {
        for (f = b.l; null != f; f = f.G) Pk(a, f.g);
        Xk(a, b);
        return 0;
    }
    return a.ha == Sc && c && 0 > wl(a, b, 1) ? bc : 0;
}
function wl(a, b, c) {
    var d,
        e,
        f,
        g,
        k,
        h = 0,
        l;
    k = !1;
    e = 1;
    for (d = b.l; null != d; d = d.G) (d.g.tb.tb = -t), (d.g.wb.wb = +t), e < Math.abs(d.j) && (e = Math.abs(d.j));
    g = 1e-6 * e;
    if (b.c != -t) {
        e = null;
        for (d = b.l; null != d; d = d.G)
            if ((0 < d.j && d.g.f == +t) || (0 > d.j && d.g.c == -t))
                if (null == e) e = d;
                else {
                    k = !0;
                    break;
                }
        if (!k) {
            k = b.c;
            for (d = b.l; null != d; d = d.G) d != e && (k = 0 < d.j ? k - d.j * d.g.f : k - d.j * d.g.c);
            if (null == e)
                for (d = b.l; null != d; d = d.G)
                    d.j >= +g ? (d.g.tb.tb = d.g.f + k / d.j) : d.j <= -g && (d.g.wb.wb = d.g.c + k / d.j);
            else e.j >= +g ? (e.g.tb.tb = k / e.j) : e.j <= -g && (e.g.wb.wb = k / e.j);
        }
    }
    k = !1;
    if (b.f != +t) {
        e = null;
        for (d = b.l; null != d; d = d.G)
            if ((0 < d.j && d.g.c == -t) || (0 > d.j && d.g.f == +t))
                if (null == e) e = d;
                else {
                    k = !0;
                    break;
                }
        if (!k) {
            k = b.f;
            for (d = b.l; null != d; d = d.G) d != e && (k = 0 < d.j ? k - d.j * d.g.c : k - d.j * d.g.f);
            if (null == e)
                for (d = b.l; null != d; d = d.G)
                    d.j >= +g ? (d.g.wb.wb = d.g.c + k / d.j) : d.j <= -g && (d.g.tb.tb = d.g.f + k / d.j);
            else e.j >= +g ? (e.g.wb.wb = k / e.j) : e.j <= -g && (e.g.tb.tb = k / e.j);
        }
    }
    for (e = b.l; null != e;)
        for (d = e.g, e = e.G, g = 0; 1 >= g; g++) {
            f = d.c;
            l = d.f;
            if (0 == g) {
                if (d.tb.tb == -t) continue;
                k = fl(d, d.tb.tb);
            } else {
                if (d.wb.wb == +t) continue;
                k = gl(d, d.wb.wb);
            }
            if (0 == k || 1 == k) (d.c = f), (d.f = l);
            else if (2 == k || 3 == k) {
                h++;
                if (c) for (f = d.l; null != f; f = f.L) f.o != b && Mk(a, f.o);
                if (3 == k) {
                    Zk(a, d);
                    break;
                }
            } else if (4 == k) return -1;
        }
    return h;
}
function xl(a, b) {
    var c, d, e;
    if (null == b.l) {
        e = cl(a, b);
        if (0 == e) return 0;
        if (1 == e) return cc;
    }
    if (null == b.l.L) {
        var f = function () {
            il(a, b);
            if (c.c == -t && c.f == +t) {
                for (d = c.l; null != d; d = d.G) Pk(a, d.g);
                Xk(a, c);
            } else Mk(a, c);
            return 0;
        };
        c = b.l.o;
        if (c.c == c.f) {
            if (!b.Ua) return f();
        } else if (!b.Ua) {
            e = jl(a, b);
            if (0 == e) return f();
            if (1 != e && 2 == e) return cc;
        }
    }
    return 0;
}
function ac(a, b) {
    var c, d, e;
    for (c = a.Fb; null != c; c = d) (d = c.next), c.c == -t && c.f == +t && Xk(a, c);
    for (c = a.Fb; null != c; c = d) (d = c.next), c.c != -t && c.f != +t && c.c < c.f && $k(a, c);
    for (c = a.Mb; null != c; c = d) (d = c.next), c.c == c.f && Zk(a, c);
    for (c = a.Mb; null != c; c = d)
        (d = c.next), c.c != -t && c.f != +t && c.c < c.f && ((e = al(a, c)), 0 != e && 1 == e && Zk(a, c));
    for (c = a.Fb; null != c; c = c.next) c.na = 1;
    for (c = a.Mb; null != c; c = c.next) c.na = 1;
    for (d = 1; d;) {
        for (d = 0; ;) {
            c = a.Fb;
            if (null == c || !c.na) break;
            d = a;
            e = c;
            e.na && ((e.na = 0), Lk(d, e), Kk(d, e, 1));
            c = vl(a, c, b);
            if (0 != c) return c;
            d = 1;
        }
        for (; ;) {
            c = a.Mb;
            if (null == c || !c.na) break;
            d = a;
            e = c;
            e.na && ((e.na = 0), Ok(d, e), Nk(d, e, 1));
            c = xl(a, c);
            if (0 != c) return c;
            d = 1;
        }
    }
    if (a.ha == Sc && !b) for (c = a.Fb; null != c; c = c.next) if (0 > wl(a, c, 0)) return (c = bc);
    return 0;
}
function Tc(a, b) {
    var c, d, e, f, g;
    c = ac(a, 1);
    if (0 != c) return c;
    b.qd && nl(a);
    g = 0;
    for (c = a.Oc; null != c; c = d)
        if (((d = c.ga), (c.c != -t || c.f != +t) && c.c != c.f && null != c.l && null != c.l.G)) {
            for (f = c.l; null != f && ((e = f.g), e.Ua && 0 == e.c && 1 == e.f); f = f.G);
            null == f && (g += ql(a, c));
        }
    0 < g && y(g + " hidden packing inequaliti(es) were detected");
    g = 0;
    for (c = a.Oc; null != c; c = d)
        if (
            ((d = c.ga), (c.c != -t || c.f != +t) && c.c != c.f && null != c.l && null != c.l.G && null != c.l.G.G)
        ) {
            for (f = c.l; null != f && ((e = f.g), e.Ua && 0 == e.c && 1 == e.f); f = f.G);
            null == f && (g += sl(a, c));
        }
    0 < g && y(g + " hidden covering inequaliti(es) were detected");
    g = 0;
    for (c = a.Oc; null != c; c = d) (d = c.ga), c.c != c.f && (g += ul(a, c));
    0 < g && y(g + " constraint coefficient(s) were reduced");
    return 0;
}
function yl(a) {
    var b, c;
    b = 1;
    for (c = 32; 55 >= c; b++, c++) a.qb[b] = (a.qb[b] - a.qb[c]) & 2147483647;
    for (c = 1; 55 >= b; b++, c++) a.qb[b] = (a.qb[b] - a.qb[c]) & 2147483647;
    a.Mf = 54;
    return a.qb[55];
}
function qg() {
    var a = {},
        b;
    a.qb = Array(56);
    a.qb[0] = -1;
    for (b = 1; 55 >= b; b++) a.qb[b] = 0;
    a.Mf = 0;
    Md(a, 1);
    return a;
}
function Md(a, b) {
    var c,
        d,
        e = 1;
    b = d = (b - 0) & 2147483647;
    a.qb[55] = d;
    for (c = 21; c; c = (c + 21) % 55)
        (a.qb[c] = e),
            (e = (d - e) & 2147483647),
            b & 1 ? (b = 1073741824 + (b >> 1)) : (b >>= 1),
            (e = (e - b) & 2147483647),
            (d = a.qb[c]);
    yl(a);
    yl(a);
    yl(a);
    yl(a);
    yl(a);
}
function Qi(a) {
    return 0 <= a.qb[a.Mf] ? a.qb[a.Mf--] : yl(a);
}
function Oj(a) {
    var b;
    do b = Qi(a);
    while (2147483648 <= b);
    return b % 16777216;
}
function rg(a) {
    a = Qi(a) / 2147483647;
    return -0.3 * (1 - a) + 0.7 * a;
}
var De = 1,
    Fe = 2,
    Ve = 1,
    Re = 2,
    Ce = 0,
    Te = 1e-10;
function Se(a, b, c) {
    return (b - 1) * a.N + c - (b * (b - 1)) / 2;
}
function zl(a, b, c) {
    var d;
    0 == b
        ? ((b = 1), (d = 0))
        : Math.abs(a) <= Math.abs(b)
            ? ((a = -a / b), (d = 1 / Math.sqrt(1 + a * a)), (b = d * a))
            : ((a = -b / a), (b = 1 / Math.sqrt(1 + a * a)), (d = b * a));
    c(b, d);
}
function Ue(a, b, c) {
    for (var d = a.n, e = a.Pb, f = a.C, g, k, h, l, n, m; b < d; b++)
        (l = Se(a, b, b)),
            (k = (b - 1) * a.N + 1),
            (n = (d - 1) * a.N + 1),
            Math.abs(f[l]) < Te && Math.abs(c[b]) < Te && (f[l] = c[b] = 0),
            0 != c[b] &&
            zl(f[l], c[b], function (a, r) {
                g = b;
                for (h = l; g <= d; g++, h++) {
                    var p = f[h],
                        u = c[g];
                    f[h] = a * p - r * u;
                    c[g] = r * p + a * u;
                }
                g = 1;
                h = k;
                for (m = n; g <= d; g++, h++, m++)
                    (p = e[h]), (u = e[m]), (e[h] = a * p - r * u), (e[m] = r * p + a * u);
            });
    Math.abs(c[d]) < Te && (c[d] = 0);
    f[Se(a, d, d)] = c[d];
}
Ce &&
    (check_error = function (a, b) {
        var c = a.n,
            d = a.Pb,
            e = a.C,
            f = a.p,
            g = a.m,
            k,
            h,
            l,
            n,
            m = 0;
        for (k = 1; k <= c; k++)
            for (h = 1; h <= c; h++) {
                n = 0;
                for (l = 1; l <= c; l++) n += d[(k - 1) * a.N + l] * g[(l - 1) * a.N + h];
                l = f[h];
                l = k <= l ? e[Se(a, k, l)] : 0;
                n = Math.abs(n - l) / (1 + Math.abs(l));
                m < n && (m = n);
            }
        1e-8 < m && y(b + ": dmax = " + m + "; relative error too large");
    });
function Ke(a, b, c, d) {
    a.ta < a.n && x("scf_solve_it: singular matrix");
    if (b) {
        b = a.n;
        var e = a.Pb,
            f = a.C,
            g = a.p,
            k = a.eg,
            h,
            l,
            n;
        for (h = 1; h <= b; h++) k[h] = c[g[h] + d];
        for (h = 1; h <= b; h++)
            for (l = Se(a, h, h), n = k[h] /= f[l], g = h + 1, l++; g <= b; g++, l++) k[g] -= f[l] * n;
        for (g = 1; g <= b; g++) c[g + d] = 0;
        for (h = 1; h <= b; h++)
            for (n = k[h], g = 1, l = (h - 1) * a.N + 1; g <= b; g++, l++) c[g + d] += e[l] * n;
    } else {
        b = a.n;
        e = a.Pb;
        f = a.C;
        k = a.p;
        h = a.eg;
        for (var m, g = 1; g <= b; g++) {
            m = 0;
            l = 1;
            for (n = (g - 1) * a.N + 1; l <= b; l++, n++) m += e[n] * c[l + d];
            h[g] = m;
        }
        for (g = b; 1 <= g; g--) {
            m = h[g];
            l = b;
            for (n = Se(a, g, b); l > g; l--, n--) m -= f[n] * h[l];
            h[g] = m / f[n];
        }
        for (g = 1; g <= b; g++) c[k[g] + d] = h[g];
    }
}
var gc = (window['__GLP'].glp_scale_prob = function (a, b) {
    function c(a, b) {
        var c, d, e;
        d = 1;
        for (c = a.o[b].l; null != c; c = c.G)
            if (((e = Math.abs(c.j)), (e = e * c.o.qa * c.g.za), null == c.ya || d > e)) d = e;
        return d;
    }
    function d(a, b) {
        var c, d, e;
        d = 1;
        for (c = a.o[b].l; null != c; c = c.G)
            if (((e = Math.abs(c.j)), (e = e * c.o.qa * c.g.za), null == c.ya || d < e)) d = e;
        return d;
    }
    function e(a, b) {
        var c, d, e;
        d = 1;
        for (c = a.g[b].l; null != c; c = c.L)
            if (((e = Math.abs(c.j)), (e = e * c.o.qa * c.g.za), null == c.va || d > e)) d = e;
        return d;
    }
    function f(a, b) {
        var c, d, e;
        d = 1;
        for (c = a.g[b].l; null != c; c = c.L)
            if (((e = Math.abs(c.j)), (e = e * c.o.qa * c.g.za), null == c.va || d < e)) d = e;
        return d;
    }
    function g(a) {
        var b, d, e;
        for (b = d = 1; b <= a.h; b++) if (((e = c(a, b)), 1 == b || d > e)) d = e;
        return d;
    }
    function k(a) {
        var b, c, e;
        for (b = c = 1; b <= a.h; b++) if (((e = d(a, b)), 1 == b || c < e)) c = e;
        return c;
    }
    function h(a, b) {
        var c, e, g;
        for (e = 0; 1 >= e; e++)
            if (e == b) for (c = 1; c <= a.h; c++) (g = d(a, c)), Ab(a, c, Cb(a, c) / g);
            else for (c = 1; c <= a.n; c++) (g = f(a, c)), Bb(a, c, Db(a, c) / g);
    }
    function l(a) {
        var b, e, f;
        for (b = e = 1; b <= a.h; b++) if (((f = d(a, b) / c(a, b)), 1 == b || e < f)) e = f;
        return e;
    }
    function n(a) {
        var b, c, d;
        for (b = c = 1; b <= a.n; b++) if (((d = f(a, b) / e(a, b)), 1 == b || c < d)) c = d;
        return c;
    }
    function m(a) {
        var b,
            h,
            m = 0,
            v;
        h = l(a) > n(a);
        for (b = 1; 15 >= b; b++) {
            v = m;
            m = k(a) / g(a);
            if (1 < b && m > 0.9 * v) break;
            v = a;
            for (var H = h, E = void 0, B = (E = void 0), J = void 0, B = 0; 1 >= B; B++)
                if (B == H) for (E = 1; E <= v.h; E++) (J = c(v, E) * d(v, E)), Ab(v, E, Cb(v, E) / Math.sqrt(J));
                else for (E = 1; E <= v.n; E++) (J = e(v, E) * f(v, E)), Bb(v, E, Db(v, E) / Math.sqrt(J));
        }
    }
    b & ~(Uc | Vc | Wc | Xc | hc) && x("glp_scale_prob: flags = " + b + "; invalid scaling options");
    b & hc && (b = Uc | Vc | Xc);
    (function (a, b) {
        function c(a, b, d, e) {
            return a + ": min|aij| = " + b + "  max|aij| = " + d + "  ratio = " + e + "";
        }
        var d, e;
        y("Scaling...");
        Eb(a);
        d = g(a);
        e = k(a);
        y(c(" A", d, e, e / d));
        if (0.1 <= d && 10 >= e && (y("Problem data seem to be well scaled"), b & Xc)) return;
        b & Uc && (m(a), (d = g(a)), (e = k(a)), y(c("GM", d, e, e / d)));
        b & Vc && (h(a, l(a) > n(a)), (d = g(a)), (e = k(a)), y(c("EQ", d, e, e / d)));
        if (b & Wc) {
            for (d = 1; d <= a.h; d++) Ab(a, d, sg(Cb(a, d)));
            for (d = 1; d <= a.n; d++) Bb(a, d, sg(Db(a, d)));
            d = g(a);
            e = k(a);
            y(c("2N", d, e, e / d));
        }
    })(a, b);
});
function Qb(a, b) {
    function c(a, b, c, d) {
        var e = a.h,
            f = a.Ga,
            g = a.Fa,
            h = a.Ma;
        a = a.head[b];
        if (a <= e) (e = 1), (c[1] = a), (d[1] = 1);
        else
            for (b = f[a - e], e = f[a - e + 1] - b, ha(c, 1, g, b, e), ha(d, 1, h, b, e), c = 1; c <= e; c++)
                d[c] = -d[c];
        return e;
    }
    function d(a) {
        var b = od(a.Y, a.h, c, a);
        a.valid = 0 == b;
        return b;
    }
    function e(a, b, c) {
        var d = a.h,
            e;
        if (c <= d) {
            var f = Array(2);
            e = Array(2);
            f[1] = c;
            e[1] = 1;
            b = Me(a.Y, b, 1, f, 0, e);
        } else {
            var g = a.Ga,
                f = a.Fa,
                h = a.Ma;
            e = a.mb;
            var k;
            k = g[c - d];
            c = g[c - d + 1];
            g = 0;
            for (d = k; d < c; d++) e[++g] = -h[d];
            b = Me(a.Y, b, g, f, k - 1, e);
        }
        a.valid = 0 == b;
        return b;
    }
    function f(a, b, c) {
        var d = a.h,
            e = a.mb,
            f = a.mb,
            g = a.h,
            h = a.Ga,
            k = a.Fa,
            l = a.Ma,
            m = a.head,
            n,
            p,
            q;
        ha(f, 1, b, 1, g);
        for (b = 1; b <= g; b++)
            if (((q = c[b]), 0 != q))
                if (((n = m[b]), n <= g)) f[n] -= q;
                else for (p = h[n - g], n = h[n - g + 1]; p < n; p++) f[k[p]] += l[p] * q;
        wd(a.Y, e);
        for (a = 1; a <= d; a++) c[a] += e[a];
    }
    function g(a, b, c) {
        var d = a.h,
            e = a.mb,
            f = a.mb,
            g = a.h,
            h = a.Ga,
            k = a.Fa,
            l = a.Ma,
            m = a.head,
            n,
            p,
            q,
            I;
        for (n = 1; n <= g; n++) {
            p = m[n];
            I = b[n];
            if (p <= g) I -= c[p];
            else for (q = h[p - g], p = h[p - g + 1]; q < p; q++) I += l[q] * c[k[q]];
            f[n] = I;
        }
        yd(a.Y, e);
        for (a = 1; a <= d; a++) c[a] += e[a];
    }
    function k(a, b, c) {
        var d = a.h,
            e = a.Be,
            f = a.Jd,
            g = a.Ae,
            h = a.Ce,
            k;
        if (c <= d) (k = e[c] + f[c]++), (g[k] = b), (h[k] = 1);
        else {
            k = a.Ga;
            var l = a.Fa;
            a = a.Ma;
            var m;
            m = k[c - d];
            c = k[c - d + 1];
            for (d = m; d < c; d++) (k = l[d]), (k = e[k] + f[k]++), (g[k] = b), (h[k] = -a[d]);
        }
    }
    function h(a, b, c) {
        var d = a.h,
            e = a.Be,
            f = a.Jd,
            g = a.Ae,
            h = a.Ce,
            k;
        if (c <= d) {
            for (d = k = e[c]; g[d] != b; d++);
            k += --f[c];
            g[d] = g[k];
            h[d] = h[k];
        } else {
            k = a.Ga;
            a = a.Fa;
            var l, m;
            m = k[c - d];
            for (c = k[c - d + 1]; m < c; m++) {
                l = a[m];
                for (d = k = e[l]; g[d] != b; d++);
                k += --f[l];
                g[d] = g[k];
                h[d] = h[k];
            }
        }
    }
    function l(a, b) {
        var c = a.c,
            d = a.f,
            e = a.stat,
            f,
            g;
        f = a.head[a.h + b];
        switch (e[b]) {
            case M:
                g = c[f];
                break;
            case P:
                g = d[f];
                break;
            case Ra:
                g = 0;
                break;
            case Na:
                g = c[f];
        }
        return g;
    }
    function n(a, b) {
        var c = a.h,
            d = a.n,
            e = a.Ga,
            g = a.Fa,
            h = a.Ma,
            k = a.head,
            m = a.Gc,
            n,
            p,
            q,
            I;
        for (n = 1; n <= c; n++) m[n] = 0;
        for (n = 1; n <= d; n++)
            if (((p = k[c + n]), (I = l(a, n)), 0 != I))
                if (p <= c) m[p] -= I;
                else for (q = e[p - c], p = e[p - c + 1]; q < p; q++) m[g[q]] += I * h[q];
        ha(b, 1, m, 1, c);
        wd(a.Y, b);
        f(a, m, b);
    }
    function m(a) {
        var b = a.n,
            c = a.Ta,
            d = a.Hc,
            e;
        e = a.h;
        var f = a.B,
            h = a.head,
            k = a.Gc,
            l;
        for (l = 1; l <= e; l++) k[l] = f[h[l]];
        ha(d, 1, k, 1, e);
        yd(a.Y, d);
        g(a, k, d);
        for (e = 1; e <= b; e++) {
            f = a.h;
            l = a.B;
            k = h = void 0;
            h = a.head[f + e];
            k = l[h];
            if (h <= f) k -= d[h];
            else {
                l = a.Ga;
                for (
                    var m = a.Fa, n = a.Ma, p = void 0, q = void 0, p = void 0, p = l[h - f], q = l[h - f + 1];
                    p < q;
                    p++
                )
                    k += n[p] * d[m[p]];
            }
            c[e] = k;
        }
    }
    function q(a) {
        var b = a.h,
            c = a.n,
            d = a.head,
            e = a.gd,
            f = a.gamma,
            g;
        a.Ub = 1e3;
        ja(e, 1, 0, b + c);
        for (a = 1; a <= c; a++) (g = d[b + a]), (e[g] = 1), (f[a] = 1);
    }
    function r(a, b) {
        var c = a.n,
            d = a.stat,
            e = a.Ta,
            f = a.gamma,
            g,
            h,
            k,
            l;
        l = h = 0;
        for (g = 1; g <= c; g++) {
            k = e[g];
            switch (d[g]) {
                case M:
                    if (k >= -b) continue;
                    break;
                case P:
                    if (k <= +b) continue;
                    break;
                case Ra:
                    if (-b <= k && k <= +b) continue;
                    break;
                case Na:
                    continue;
            }
            k = (k * k) / f[g];
            l < k && ((h = g), (l = k));
        }
        a.q = h;
    }
    function p(a) {
        var b = a.h,
            c = a.Ab,
            d = a.Xa,
            e = a.Xa,
            f,
            g;
        g = a.head[b + a.q];
        for (f = 1; f <= b; f++) e[f] = 0;
        if (g <= b) e[g] = -1;
        else {
            var h = a.Ga;
            f = a.Fa;
            var k = a.Ma,
                l;
            l = h[g - b];
            for (g = h[g - b + 1]; l < g; l++) e[f[l]] = k[l];
        }
        wd(a.Y, d);
        e = 0;
        for (f = 1; f <= b; f++) 0 != d[f] && (c[++e] = f);
        a.Wb = e;
    }
    function u(a) {
        var b = a.h,
            c = a.Ab,
            d = a.Xa,
            e = a.Hc,
            g,
            h;
        h = a.head[b + a.q];
        for (g = 1; g <= b; g++) e[g] = 0;
        if (h <= b) e[h] = -1;
        else {
            var k = a.Ga;
            g = a.Fa;
            var l = a.Ma,
                m;
            m = k[h - b];
            for (h = k[h - b + 1]; m < h; m++) e[g[m]] = l[m];
        }
        f(a, e, d);
        e = 0;
        for (g = 1; g <= b; g++) 0 != d[g] && (c[++e] = g);
        a.Wb = e;
    }
    function v(a, b) {
        var c = a.Wb,
            d = a.Ab,
            e = a.Xa,
            f,
            g,
            h;
        g = 0;
        for (f = 1; f <= c; f++) (h = Math.abs(e[d[f]])), g < h && (g = h);
        a.mh = g;
        h = b * (1 + 0.01 * g);
        for (g = 0; g < c;) (f = d[c]), Math.abs(e[f]) < h ? c-- : (g++, (d[c] = d[g]), (d[g] = f));
        a.nh = g;
    }
    function H(a, b) {
        var c = a.h,
            d = a.type,
            e = a.c,
            f = a.f,
            g = a.B,
            h = a.head,
            k = a.I,
            l = a.La,
            m = a.q,
            n = a.Ab,
            p = a.Xa,
            q = a.nh,
            I,
            r,
            u,
            v,
            w,
            ia,
            z,
            B,
            D;
        z = 0 < a.Ta[m] ? -1 : 1;
        I = h[c + m];
        d[I] == Q ? ((m = -1), (r = 0), (D = f[I] - e[I]), (w = 1)) : ((r = m = 0), (D = t), (w = 0));
        for (u = 1; u <= q; u++) {
            c = n[u];
            I = h[c];
            v = z * p[c];
            if (0 < v)
                if (1 == k && 0 > g[I])
                    (ia = b * (1 + 0.1 * Math.abs(e[I]))), (B = (e[I] + ia - l[c]) / v), (I = M);
                else if (1 == k && 0 < g[I]) continue;
                else if (d[I] == Ta || d[I] == Q || d[I] == C)
                    (ia = b * (1 + 0.1 * Math.abs(f[I]))), (B = (f[I] + ia - l[c]) / v), (I = P);
                else continue;
            else if (1 == k && 0 < g[I])
                (ia = b * (1 + 0.1 * Math.abs(f[I]))), (B = (f[I] - ia - l[c]) / v), (I = P);
            else if (1 == k && 0 > g[I]) continue;
            else if (d[I] == Sa || d[I] == Q || d[I] == C)
                (ia = b * (1 + 0.1 * Math.abs(e[I]))), (B = (e[I] - ia - l[c]) / v), (I = M);
            else continue;
            0 > B && (B = 0);
            if (D > B || (D == B && w < Math.abs(v))) (m = c), (r = I), (D = B), (w = Math.abs(v));
        }
        if (!(0 == b || 0 >= m || 0 == D))
            for (ia = D, r = m = 0, D = t, w = 0, u = 1; u <= q; u++) {
                c = n[u];
                I = h[c];
                v = z * p[c];
                if (0 < v)
                    if (1 == k && 0 > g[I]) (B = (e[I] - l[c]) / v), (I = M);
                    else if (1 == k && 0 < g[I]) continue;
                    else if (d[I] == Ta || d[I] == Q || d[I] == C) (B = (f[I] - l[c]) / v), (I = P);
                    else continue;
                else if (1 == k && 0 < g[I]) (B = (f[I] - l[c]) / v), (I = P);
                else if (1 == k && 0 > g[I]) continue;
                else if (d[I] == Sa || d[I] == Q || d[I] == C) (B = (e[I] - l[c]) / v), (I = M);
                else continue;
                0 > B && (B = 0);
                B <= ia && w < Math.abs(v) && ((m = c), (r = I), (D = B), (w = Math.abs(v)));
            }
        a.p = m;
        0 < m && d[h[m]] == C ? (a.he = Na) : (a.he = r);
        a.oh = z * D;
    }
    function E(a, b) {
        var c = a.h,
            d = a.p,
            e;
        for (e = 1; e <= c; e++) b[e] = 0;
        b[d] = 1;
        yd(a.Y, b);
    }
    function B(a, b) {
        var c = a.h,
            d = a.p,
            e = a.Hc,
            f;
        for (f = 1; f <= c; f++) e[f] = 0;
        e[d] = 1;
        g(a, e, b);
    }
    function J(a, b) {
        var c = a.h,
            d = a.n,
            e = a.Be,
            f = a.Jd,
            g = a.Ae,
            h = a.Ce,
            k = a.Yb,
            l = a.pb,
            m,
            n,
            p,
            I;
        for (m = 1; m <= d; m++) l[m] = 0;
        for (m = 1; m <= c; m++)
            if (((I = b[m]), 0 != I)) for (n = e[m], p = n + f[m]; n < p; n++) l[g[n]] -= I * h[n];
        c = 0;
        for (m = 1; m <= d; m++) 0 != l[m] && (k[++c] = m);
        a.Bc = c;
    }
    function R(a) {
        var b = a.La,
            c = a.q,
            d = a.Wb,
            e = a.Ab,
            f = a.Xa,
            g = a.p,
            h = a.oh;
        0 < g && (b[g] = l(a, c) + h);
        if (0 != h) for (c = 1; c <= d; c++) (a = e[c]), a != g && (b[a] += f[a] * h);
    }
    function T(a) {
        var b = a.B,
            c = a.head,
            d = a.Wb,
            e = a.Ab,
            f = a.Xa,
            g,
            h;
        h = b[c[a.h + a.q]];
        for (g = 1; g <= d; g++) (a = e[g]), (h += b[c[a]] * f[a]);
        return h;
    }
    function O(a) {
        var b = a.Ta,
            c = a.q,
            d = a.Bc,
            e = a.Yb;
        a = a.pb;
        var f, g, h;
        h = b[c] /= a[c];
        for (g = 1; g <= d; g++) (f = e[g]), f != c && (b[f] -= a[f] * h);
    }
    function S(a) {
        var b = a.h,
            c = a.type,
            d = a.Ga,
            e = a.Fa,
            f = a.Ma,
            g = a.head,
            h = a.gd,
            k = a.gamma,
            l = a.q,
            m = a.Wb,
            n = a.Ab,
            p = a.Xa,
            I = a.p,
            q = a.Bc,
            r = a.Yb,
            u = a.pb,
            v = a.Hc,
            w,
            ia,
            z,
            B,
            D,
            E;
        a.Ub--;
        B = D = h[g[b + l]] ? 1 : 0;
        for (w = 1; w <= b; w++) v[w] = 0;
        for (ia = 1; ia <= m; ia++) (w = n[ia]), h[g[w]] ? ((v[w] = w = p[w]), (B += w * w)) : (v[w] = 0);
        yd(a.Y, v);
        m = u[l];
        for (ia = 1; ia <= q; ia++)
            if (((a = r[ia]), a != l)) {
                w = u[a] / m;
                n = g[b + a];
                if (n <= b) E = v[n];
                else for (E = 0, z = d[n - b], p = d[n - b + 1]; z < p; z++) E -= f[z] * v[e[z]];
                p = k[a] + w * w * B + 2 * w * E;
                w = (h[n] ? 1 : 0) + D * w * w;
                k[a] = p >= w ? p : w;
                2.220446049250313e-16 > k[a] && (k[a] = 2.220446049250313e-16);
            }
        c[g[I]] == C
            ? (k[l] = 1)
            : ((k[l] = B / (m * m)), 2.220446049250313e-16 > k[l] && (k[l] = 2.220446049250313e-16));
    }
    function G(a) {
        var b = a.h,
            c = a.head,
            d = a.stat,
            e = a.q,
            f = a.p;
        a = a.he;
        var g;
        if (0 > f)
            switch (d[e]) {
                case M:
                    d[e] = P;
                    break;
                case P:
                    d[e] = M;
            }
        else (g = c[f]), (c[f] = c[b + e]), (c[b + e] = g), (d[e] = a);
    }
    function Z(a, b) {
        var c = a.h,
            d = a.n,
            e = a.type,
            f = a.c,
            g = a.f,
            h = a.B,
            k = a.head,
            l = a.La,
            m,
            n = 0,
            p;
        b *= 0.9;
        for (m = 1; m <= c + d; m++) h[m] = 0;
        for (d = 1; d <= c; d++) {
            m = k[d];
            if (e[m] == Sa || e[m] == Q || e[m] == C)
                (p = b * (1 + 0.1 * Math.abs(f[m]))), l[d] < f[m] - p && ((h[m] = -1), n++);
            if (e[m] == Ta || e[m] == Q || e[m] == C)
                (p = b * (1 + 0.1 * Math.abs(g[m]))), l[d] > g[m] + p && ((h[m] = 1), n++);
        }
        return n;
    }
    function Y(a) {
        var b = a.h,
            c = a.n,
            d = a.B,
            e = a.ib;
        a = a.eb;
        var f;
        for (f = 1; f <= b; f++) d[f] = 0;
        for (f = 1; f <= c; f++) d[b + f] = a * e[f];
    }
    function ba(a, b) {
        var c = a.h,
            d = a.type,
            e = a.c,
            f = a.f,
            g = a.B,
            h = a.head,
            k = a.I,
            l = a.La,
            m,
            n,
            p;
        for (m = 1; m <= c; m++)
            if (((n = h[m]), 1 == k && 0 > g[n])) {
                if (((p = b * (1 + 0.1 * Math.abs(e[n]))), l[m] > e[n] + p)) return 1;
            } else if (1 == k && 0 < g[n]) {
                if (((p = b * (1 + 0.1 * Math.abs(f[n]))), l[m] < f[n] - p)) return 1;
            } else {
                if (d[n] == Sa || d[n] == Q || d[n] == C)
                    if (((p = b * (1 + 0.1 * Math.abs(e[n]))), l[m] < e[n] - p)) return 1;
                if (d[n] == Ta || d[n] == Q || d[n] == C)
                    if (((p = b * (1 + 0.1 * Math.abs(f[n]))), l[m] > f[n] + p)) return 1;
            }
        return 0;
    }
    function oa(a, b) {
        var c = a.h,
            d = a.c,
            e = a.f,
            f = a.B,
            g = a.head,
            h = a.La,
            k,
            l,
            m;
        for (k = 1; k <= c; k++)
            if (((l = g[k]), 0 > f[l])) {
                if (((m = b * (1 + 0.1 * Math.abs(d[l]))), h[k] < d[l] - m)) return 1;
            } else if (0 < f[l] && ((m = b * (1 + 0.1 * Math.abs(e[l]))), h[k] > e[l] + m)) return 1;
        return 0;
    }
    function z(a) {
        var b = a.h,
            c = a.n,
            d = a.ib,
            e = a.head,
            f = a.La,
            g,
            h,
            k;
        k = d[0];
        for (g = 1; g <= b; g++) (h = e[g]), h > b && (k += d[h - b] * f[g]);
        for (f = 1; f <= c; f++) (h = e[b + f]), h > b && (k += d[h - b] * l(a, f));
        return k;
    }
    function F(a, b, c) {
        var d = a.h,
            e = a.type,
            f = a.c,
            g = a.f,
            h = a.I,
            k = a.head,
            l = a.La,
            m,
            n;
        if (!(b.s < fc || (0 < b.cb && 1e3 * ma(a.ic) < b.cb) || a.da == a.$d || (!c && 0 != a.da % b.dc))) {
            m = n = 0;
            for (b = 1; b <= d; b++)
                (c = k[b]),
                    (e[c] == Sa || e[c] == Q || e[c] == C) && l[b] < f[c] && (n += f[c] - l[b]),
                    (e[c] == Ta || e[c] == Q || e[c] == C) && l[b] > g[c] && (n += l[b] - g[c]),
                    e[c] == C && m++;
            y((1 == h ? " " : "*") + a.da + ": obj = " + z(a) + "  infeas = " + n + " (" + m + ")");
            a.$d = a.da;
        }
    }
    function D(a, b, c, d, e) {
        var f = a.h,
            g = a.n,
            h = a.eb,
            k = a.head,
            l = a.stat,
            m = a.La,
            n = a.Ta;
        b.valid = 1;
        a.valid = 0;
        b.Y = a.Y;
        a.Y = null;
        ha(b.head, 1, k, 1, f);
        b.ra = c;
        b.wa = d;
        b.ea = z(a);
        b.da = a.da;
        b.some = e;
        for (a = 1; a <= f; a++)
            (c = k[a]),
                c <= f
                    ? ((c = b.o[c]), (c.stat = A), (c.bind = a), (c.w = m[a] / c.qa))
                    : ((c = b.g[c - f]), (c.stat = A), (c.bind = a), (c.w = m[a] * c.za)),
                (c.M = 0);
        for (m = 1; m <= g; m++)
            if (((c = k[f + m]), c <= f)) {
                c = b.o[c];
                c.stat = l[m];
                c.bind = 0;
                switch (l[m]) {
                    case M:
                        c.w = c.c;
                        break;
                    case P:
                        c.w = c.f;
                        break;
                    case Ra:
                        c.w = 0;
                        break;
                    case Na:
                        c.w = c.c;
                }
                c.M = (n[m] * c.qa) / h;
            } else {
                c = b.g[c - f];
                c.stat = l[m];
                c.bind = 0;
                switch (l[m]) {
                    case M:
                        c.w = c.c;
                        break;
                    case P:
                        c.w = c.f;
                        break;
                    case Ra:
                        c.w = 0;
                        break;
                    case Na:
                        c.w = c.c;
                }
                c.M = n[m] / c.za / h;
            }
    }
    var w,
        ca = 2,
        L = 0,
        K = 0,
        aa = 0,
        N,
        da,
        ea;
    w = (function (a) {
        var b = a.h,
            c = a.n;
        a = a.O;
        var d = {};
        d.h = b;
        d.n = c;
        d.type = new Int8Array(1 + b + c);
        d.c = new Float64Array(1 + b + c);
        d.f = new Float64Array(1 + b + c);
        d.B = new Float64Array(1 + b + c);
        d.ib = new Float64Array(1 + c);
        d.Ga = new Int32Array(1 + c + 1);
        d.Fa = new Int32Array(1 + a);
        d.Ma = new Float64Array(1 + a);
        d.head = new Int32Array(1 + b + c);
        d.stat = new Int8Array(1 + c);
        d.Be = new Int32Array(1 + b + 1);
        d.Jd = new Int32Array(1 + b);
        d.Ae = null;
        d.Ce = null;
        d.La = new Float64Array(1 + b);
        d.Ta = new Float64Array(1 + c);
        d.gd = new Int8Array(1 + b + c);
        d.gamma = new Float64Array(1 + c);
        d.Ab = new Int32Array(1 + b);
        d.Xa = new Float64Array(1 + b);
        d.Yb = new Int32Array(1 + c);
        d.pb = new Float64Array(1 + c);
        d.mb = new Float64Array(1 + b);
        d.Gc = new Float64Array(1 + b);
        d.Hc = new Float64Array(1 + b);
        d.fg = new Float64Array(1 + b);
        return d;
    })(a);
    (function (a, b) {
        var c = a.h,
            d = a.n,
            e = a.type,
            f = a.c,
            g = a.f,
            h = a.B,
            l = a.ib,
            m = a.Ga,
            n = a.Fa,
            p = a.Ma,
            I = a.head,
            q = a.stat,
            r = a.gd,
            u = a.gamma,
            w,
            v;
        for (w = 1; w <= c; w++)
            (v = b.o[w]), (e[w] = v.type), (f[w] = v.c * v.qa), (g[w] = v.f * v.qa), (h[w] = 0);
        for (w = 1; w <= d; w++)
            (v = b.g[w]),
                (e[c + w] = v.type),
                (f[c + w] = v.c / v.za),
                (g[c + w] = v.f / v.za),
                (h[c + w] = v.B * v.za);
        l[0] = b.la;
        ha(l, 1, h, c + 1, d);
        e = 0;
        for (w = 1; w <= d; w++) e < Math.abs(l[w]) && (e = Math.abs(l[w]));
        0 == e && (e = 1);
        switch (b.dir) {
            case za:
                a.eb = 1 / e;
                break;
            case Ea:
                a.eb = -1 / e;
        }
        1 > Math.abs(a.eb) && (a.eb *= 1e3);
        for (w = l = 1; w <= d; w++)
            for (m[w] = l, e = b.g[w].l; null != e; e = e.L) (n[l] = e.o.ia), (p[l] = e.o.qa * e.j * e.g.za), l++;
        m[d + 1] = l;
        ha(I, 1, b.head, 1, c);
        m = 0;
        for (w = 1; w <= c; w++) (v = b.o[w]), v.stat != A && (m++, (I[c + m] = w), (q[m] = v.stat));
        for (w = 1; w <= d; w++) (v = b.g[w]), v.stat != A && (m++, (I[c + m] = c + w), (q[m] = v.stat));
        a.valid = 1;
        b.valid = 0;
        a.Y = b.Y;
        b.Y = null;
        I = a.h;
        q = a.n;
        m = a.Ga;
        n = a.Fa;
        p = a.Be;
        w = a.Jd;
        for (l = 1; l <= I; l++) w[l] = 1;
        for (l = 1; l <= q; l++) for (f = m[l], e = m[l + 1]; f < e; f++) w[n[f]]++;
        for (l = p[1] = 1; l <= I; l++) w[l] > q && (w[l] = q), (p[l + 1] = p[l] + w[l]);
        a.Ae = new Int32Array(p[I + 1]);
        a.Ce = new Float64Array(p[I + 1]);
        I = a.h;
        q = a.n;
        m = a.head;
        n = a.stat;
        ja(a.Jd, 1, 0, I);
        for (p = 1; p <= q; p++) n[p] != Na && ((w = m[I + p]), k(a, p, w));
        a.I = 0;
        a.ic = la();
        a.Of = a.da = b.da;
        a.$d = -1;
        a.Ub = 0;
        ja(r, 1, 0, c + d);
        for (w = 1; w <= d; w++) u[w] = 1;
    })(w, a);
    for (b.s >= mc && y("Objective scale factor = " + w.eb + ""); ;) {
        if (0 == ca) {
            ea = d(w);
            if (0 != ea)
                return (
                    b.s >= Mb &&
                    (y("Error: unable to factorize the basis matrix (" + ea + ")"),
                        y("Sorry, basis recovery procedure not implemented yet")),
                    (a.Y = w.Y),
                    (w.Y = null),
                    (a.ra = a.wa = Aa),
                    (a.ea = 0),
                    (a.da = w.da),
                    (a.some = 0),
                    (ea = Tb)
                );
            ca = w.valid = 1;
            L = K = 0;
        }
        if (
            0 == L &&
            (n(w, w.La),
                (L = 1),
                0 == w.I && (0 < Z(w, b.Ib) ? (w.I = 1) : (Y(w), (w.I = 2)), (K = 0), F(w, b, 1)),
                ba(w, b.Ib))
        ) {
            b.s >= Mb &&
                y("Warning: numerical instability (primal simplex, phase " + (1 == w.I ? "I" : "II") + ")");
            ca = w.I = 0;
            aa = 5;
            continue;
        }
        1 != w.I || oa(w, b.Ib) || ((w.I = 2), Y(w), (K = 0), F(w, b, 1));
        0 == K && (m(w), (K = 1));
        switch (b.ed) {
            case oc:
                0 == w.Ub && q(w);
        }
        if (2147483647 > b.pc && w.da - w.Of >= b.pc) {
            if (1 != L || (2 == w.I && 1 != K)) {
                1 != L && (L = 0);
                2 == w.I && 1 != K && (K = 0);
                continue;
            }
            F(w, b, 1);
            b.s >= Xb && y("ITERATION LIMIT EXCEEDED; SEARCH TERMINATED");
            switch (w.I) {
                case 1:
                    N = Ad;
                    Y(w);
                    m(w);
                    break;
                case 2:
                    N = ec;
            }
            r(w, b.vb);
            da = 0 == w.q ? ec : Ad;
            D(w, a, N, da, 0);
            return (ea = pg);
        }
        if (2147483647 > b.ub && 1e3 * ma(w.ic) >= b.ub) {
            if (1 != L || (2 == w.I && 1 != K)) {
                1 != L && (L = 0);
                2 == w.I && 1 != K && (K = 0);
                continue;
            }
            F(w, b, 1);
            b.s >= Xb && y("TIME LIMIT EXCEEDED; SEARCH TERMINATED");
            switch (w.I) {
                case 1:
                    N = Ad;
                    Y(w);
                    m(w);
                    break;
                case 2:
                    N = ec;
            }
            r(w, b.vb);
            da = 0 == w.q ? ec : Ad;
            D(w, a, N, da, 0);
            return (ea = Qc);
        }
        F(w, b, 0);
        r(w, b.vb);
        if (0 == w.q) {
            if (1 != L || 1 != K) {
                1 != L && (L = 0);
                1 != K && (K = 0);
                continue;
            }
            F(w, b, 1);
            switch (w.I) {
                case 1:
                    b.s >= Xb && y("PROBLEM HAS NO FEASIBLE SOLUTION");
                    N = jc;
                    Y(w);
                    m(w);
                    r(w, b.vb);
                    da = 0 == w.q ? ec : Ad;
                    break;
                case 2:
                    b.s >= Xb && y("OPTIMAL SOLUTION FOUND"), (N = da = ec);
            }
            D(w, a, N, da, 0);
            return (ea = 0);
        }
        p(w);
        aa && u(w);
        v(w, b.ve);
        var I = w.Ta[w.q],
            ia = T(w);
        if (Math.abs(I - ia) > 1e-5 * (1 + Math.abs(ia)) || !((0 > I && 0 > ia) || (0 < I && 0 < ia)))
            if ((b.s >= mc && y("d1 = " + I + "; d2 = " + ia + ""), 1 != K || !aa)) {
                1 != K && (K = 0);
                aa = 5;
                continue;
            }
        w.Ta[w.q] = 0 < I ? (0 < ia ? ia : 2.220446049250313e-16) : 0 > ia ? ia : -2.220446049250313e-16;
        switch (b.le) {
            case pc:
                H(w, 0);
                break;
            case qc:
                H(w, 0.3 * b.Ib);
        }
        if (0 == w.p) {
            if (1 != L || 1 != K || !aa) {
                1 != L && (L = 0);
                1 != K && (K = 0);
                aa = 1;
                continue;
            }
            F(w, b, 1);
            switch (w.I) {
                case 1:
                    b.s >= Mb && y("Error: unable to choose basic variable on phase I");
                    a.Y = w.Y;
                    w.Y = null;
                    a.ra = a.wa = Aa;
                    a.ea = 0;
                    a.da = w.da;
                    a.some = 0;
                    ea = Tb;
                    break;
                case 2:
                    b.s >= Xb && y("PROBLEM HAS UNBOUNDED SOLUTION"), D(w, a, ec, jc, w.head[w.h + w.q]), (ea = 0);
            }
            return ea;
        }
        if (
            0 < w.p &&
            ((I = w.Xa[w.p]),
                (ia = 1e-5 * (1 + 0.01 * w.mh)),
                Math.abs(I) < ia && (b.s >= mc && y("piv = " + I + "; eps = " + ia + ""), !aa))
        ) {
            aa = 5;
            continue;
        }
        0 < w.p && ((I = w.fg), E(w, I), aa && B(w, I), J(w, I));
        if (
            0 < w.p &&
            ((I = w.Xa[w.p]),
                (ia = w.pb[w.q]),
                Math.abs(I - ia) > 1e-8 * (1 + Math.abs(I)) || !((0 < I && 0 < ia) || (0 > I && 0 > ia)))
        ) {
            b.s >= mc && y("piv1 = " + I + "; piv2 = " + ia + "");
            if (1 != ca || !aa) {
                1 != ca && (ca = 0);
                aa = 5;
                continue;
            }
            0 == w.pb[w.q] && (w.Bc++, (w.Yb[w.Bc] = w.q));
            w.pb[w.q] = I;
        }
        R(w);
        L = 2;
        0 < w.p && (O(w), (K = 2), 1 == w.I && ((I = w.head[w.p]), (w.Ta[w.q] -= w.B[I]), (w.B[I] = 0)));
        if (0 < w.p)
            switch (b.ed) {
                case oc:
                    0 < w.Ub && S(w);
            }
        0 < w.p && ((ea = e(w, w.p, w.head[w.h + w.q])), (ca = 0 == ea ? 2 : (w.valid = 0)));
        0 < w.p && (h(w, w.q, w.head[w.h + w.q]), w.type[w.head[w.p]] != C && k(w, w.q, w.head[w.p]));
        G(w);
        w.da++;
        0 < aa && aa--;
    }
}
function Sb(a, b) {
    function c(a, b, c, d) {
        var e = a.h,
            f = a.Ga,
            g = a.Fa,
            h = a.Ma;
        a = a.head[b];
        if (a <= e) (e = 1), (c[1] = a), (d[1] = 1);
        else
            for (b = f[a - e], e = f[a - e + 1] - b, ha(c, 1, g, b, e), ha(d, 1, h, b, e), c = 1; c <= e; c++)
                d[c] = -d[c];
        return e;
    }
    function d(a) {
        var b = od(a.Y, a.h, c, a);
        a.valid = 0 == b;
        return b;
    }
    function e(a, b, c) {
        var d = a.h,
            e;
        if (c <= d) {
            var f = Array(2);
            e = Array(2);
            f[1] = c;
            e[1] = 1;
            b = Me(a.Y, b, 1, f, 0, e);
        } else {
            var g = a.Ga,
                f = a.Fa,
                h = a.Ma;
            e = a.mb;
            var k;
            k = g[c - d];
            c = g[c - d + 1];
            g = 0;
            for (d = k; d < c; d++) e[++g] = -h[d];
            b = Me(a.Y, b, g, f, k - 1, e);
        }
        a.valid = 0 == b;
        return b;
    }
    function f(a, b, c) {
        var d = a.h,
            e = a.mb,
            f = a.mb,
            g = a.h,
            h = a.Ga,
            k = a.Fa,
            l = a.Ma,
            m = a.head,
            n,
            p,
            q;
        ha(f, 1, b, 1, g);
        for (b = 1; b <= g; b++)
            if (((q = c[b]), 0 != q))
                if (((n = m[b]), n <= g)) f[n] -= q;
                else for (p = h[n - g], n = h[n - g + 1]; p < n; p++) f[k[p]] += l[p] * q;
        wd(a.Y, e);
        for (a = 1; a <= d; a++) c[a] += e[a];
    }
    function g(a, b, c) {
        var d = a.h,
            e = a.mb,
            f = a.mb,
            g = a.h,
            h = a.Ga,
            k = a.Fa,
            l = a.Ma,
            m = a.head,
            n,
            p,
            q,
            r;
        for (n = 1; n <= g; n++) {
            p = m[n];
            r = b[n];
            if (p <= g) r -= c[p];
            else for (q = h[p - g], p = h[p - g + 1]; q < p; q++) r += l[q] * c[k[q]];
            f[n] = r;
        }
        yd(a.Y, e);
        for (a = 1; a <= d; a++) c[a] += e[a];
    }
    function k(a, b) {
        var c = a.c,
            d = a.f,
            e = a.stat,
            f,
            g;
        f = a.head[a.h + b];
        switch (e[b]) {
            case M:
                g = c[f];
                break;
            case P:
                g = d[f];
                break;
            case Ra:
                g = 0;
                break;
            case Na:
                g = c[f];
        }
        return g;
    }
    function h(a, b) {
        var c = a.h,
            d = a.n,
            e = a.Ga,
            g = a.Fa,
            h = a.Ma,
            l = a.head,
            m = a.Gc,
            n,
            p,
            q,
            r;
        for (n = 1; n <= c; n++) m[n] = 0;
        for (n = 1; n <= d; n++)
            if (((p = l[c + n]), (r = k(a, n)), 0 != r))
                if (p <= c) m[p] -= r;
                else for (q = e[p - c], p = e[p - c + 1]; q < p; q++) m[g[q]] += r * h[q];
        ha(b, 1, m, 1, c);
        wd(a.Y, b);
        f(a, m, b);
    }
    function l(a) {
        var b = a.n,
            c = a.Ta,
            d = a.Hc,
            e;
        e = a.h;
        var f = a.B,
            h = a.head,
            k = a.Gc,
            l;
        for (l = 1; l <= e; l++) k[l] = f[h[l]];
        ha(d, 1, k, 1, e);
        yd(a.Y, d);
        g(a, k, d);
        for (e = 1; e <= b; e++) {
            f = a.h;
            l = a.B;
            k = h = void 0;
            h = a.head[f + e];
            k = l[h];
            if (h <= f) k -= d[h];
            else {
                l = a.Ga;
                for (
                    var m = a.Fa, n = a.Ma, p = void 0, q = void 0, p = void 0, p = l[h - f], q = l[h - f + 1];
                    p < q;
                    p++
                )
                    k += n[p] * d[m[p]];
            }
            c[e] = k;
        }
    }
    function n(a) {
        var b = a.h,
            c = a.n,
            d = a.head,
            e = a.gd,
            f = a.gamma;
        a.Ub = 1e3;
        ja(e, 1, 0, b + c);
        for (a = 1; a <= b; a++) (c = d[a]), (e[c] = 1), (f[a] = 1);
    }
    function m(a, b) {
        var c = a.h,
            d = a.type,
            e = a.c,
            f = a.f,
            g = a.head,
            h = a.La,
            k = a.gamma,
            l,
            m,
            n,
            p,
            q,
            r,
            u;
        q = p = n = 0;
        for (l = 1; l <= c; l++) {
            m = g[l];
            u = 0;
            if (d[m] == Sa || d[m] == Q || d[m] == C)
                (r = b * (1 + 0.1 * Math.abs(e[m]))), h[l] < e[m] - r && (u = e[m] - h[l]);
            if (d[m] == Ta || d[m] == Q || d[m] == C)
                (r = b * (1 + 0.1 * Math.abs(f[m]))), h[l] > f[m] + r && (u = f[m] - h[l]);
            0 != u &&
                ((m = k[l]),
                    2.220446049250313e-16 > m && (m = 2.220446049250313e-16),
                    (m = (u * u) / m),
                    q < m && ((n = l), (p = u), (q = m)));
        }
        a.p = n;
        a.Qe = p;
    }
    function q(a, b) {
        var c = a.h,
            d = a.p,
            e;
        for (e = 1; e <= c; e++) b[e] = 0;
        b[d] = 1;
        yd(a.Y, N);
    }
    function r(a, b) {
        var c = a.h,
            d = a.p,
            e = a.Hc,
            f;
        for (f = 1; f <= c; f++) e[f] = 0;
        e[d] = 1;
        g(a, e, b);
    }
    function p(a, b) {
        var c = a.h,
            d,
            e;
        e = 0;
        for (d = 1; d <= c; d++) 0 != b[d] && e++;
        if (0.2 <= e / c) {
            c = a.h;
            d = a.n;
            e = a.Ga;
            var f = a.Fa,
                g = a.Ma,
                h = a.head,
                k = a.stat,
                l = a.Yb,
                m = a.pb,
                n,
                p,
                q,
                r,
                u;
            r = 0;
            for (n = 1; n <= d; n++)
                if (k[n] == Na) m[n] = 0;
                else {
                    p = h[c + n];
                    if (p <= c) u = -b[p];
                    else for (q = e[p - c], p = e[p - c + 1], u = 0; q < p; q++) u += b[f[q]] * g[q];
                    0 != u && (l[++r] = n);
                    m[n] = u;
                }
            a.Bc = r;
        } else {
            f = a.h;
            c = a.n;
            g = a.hg;
            h = a.gg;
            k = a.ig;
            l = a.bind;
            m = a.stat;
            d = a.Yb;
            e = a.pb;
            for (r = 1; r <= c; r++) e[r] = 0;
            for (n = 1; n <= f; n++)
                if (((p = b[n]), 0 != p))
                    for (
                        r = l[n] - f, 1 <= r && m[r] != Na && (e[r] -= p), r = g[n], q = g[n + 1], u = r;
                        u < q;
                        u++
                    )
                        (r = l[f + h[u]] - f), 1 <= r && m[r] != Na && (e[r] += p * k[u]);
            f = 0;
            for (r = 1; r <= c; r++) 0 != e[r] && (d[++f] = r);
            a.Bc = f;
        }
    }
    function u(a, b) {
        var c = a.Bc,
            d = a.Yb,
            e = a.pb,
            f,
            g,
            h;
        g = 0;
        for (f = 1; f <= c; f++) (h = Math.abs(e[d[f]])), g < h && (g = h);
        a.ph = g;
        h = b * (1 + 0.01 * g);
        for (g = 0; g < c;) (f = d[c]), Math.abs(e[f]) < h ? c-- : (g++, (d[c] = d[g]), (d[g] = f));
        a.qh = g;
    }
    function v(a, b) {
        var c = a.stat,
            d = a.Ta,
            e = a.Yb,
            f = a.pb,
            g = a.qh,
            h,
            k,
            l,
            m,
            n,
            p,
            q,
            r,
            u;
        p = 0 < a.Qe ? 1 : -1;
        l = 0;
        r = t;
        n = 0;
        for (k = 1; k <= g; k++) {
            h = e[k];
            m = p * f[h];
            if (0 < m)
                if (c[h] == M || c[h] == Ra) q = (d[h] + b) / m;
                else continue;
            else if (c[h] == P || c[h] == Ra) q = (d[h] - b) / m;
            else continue;
            0 > q && (q = 0);
            if (r > q || (r == q && n < Math.abs(m))) (l = h), (r = q), (n = Math.abs(m));
        }
        if (0 != b && 0 != l && 0 != r)
            for (u = r, l = 0, r = t, n = 0, k = 1; k <= g; k++) {
                h = e[k];
                m = p * f[h];
                if (0 < m)
                    if (c[h] == M || c[h] == Ra) q = d[h] / m;
                    else continue;
                else if (c[h] == P || c[h] == Ra) q = d[h] / m;
                else continue;
                0 > q && (q = 0);
                q <= u && n < Math.abs(m) && ((l = h), (r = q), (n = Math.abs(m)));
            }
        a.q = l;
        a.Xg = p * r;
    }
    function H(a) {
        var b = a.h,
            c = a.Ab,
            d = a.Xa,
            e = a.Xa,
            f,
            g;
        g = a.head[b + a.q];
        for (f = 1; f <= b; f++) e[f] = 0;
        if (g <= b) e[g] = -1;
        else {
            var h = a.Ga;
            f = a.Fa;
            var k = a.Ma,
                l;
            l = h[g - b];
            for (g = h[g - b + 1]; l < g; l++) e[f[l]] = k[l];
        }
        wd(a.Y, d);
        e = 0;
        for (f = 1; f <= b; f++) 0 != d[f] && (c[++e] = f);
        a.Wb = e;
    }
    function E(a) {
        var b = a.h,
            c = a.Ab,
            d = a.Xa,
            e = a.Hc,
            g,
            h;
        h = a.head[b + a.q];
        for (g = 1; g <= b; g++) e[g] = 0;
        if (h <= b) e[h] = -1;
        else {
            var k = a.Ga;
            g = a.Fa;
            var l = a.Ma,
                m;
            m = k[h - b];
            for (h = k[h - b + 1]; m < h; m++) e[g[m]] = l[m];
        }
        f(a, e, d);
        e = 0;
        for (g = 1; g <= b; g++) 0 != d[g] && (c[++e] = g);
        a.Wb = e;
    }
    function B(a) {
        var b = a.Ta,
            c = a.Bc,
            d = a.Yb,
            e = a.pb,
            f = a.q;
        a = a.Xg;
        var g, h;
        b[f] = a;
        if (0 != a) for (h = 1; h <= c; h++) (g = d[h]), g != f && (b[g] -= e[g] * a);
    }
    function J(a) {
        var b = a.La,
            c = a.p,
            d = a.q,
            e = a.Wb,
            f = a.Ab,
            g = a.Xa,
            h;
        h = a.Qe / g[c];
        b[c] = k(a, d) + h;
        if (0 != h) for (d = 1; d <= e; d++) (a = f[d]), a != c && (b[a] += g[a] * h);
    }
    function R(a) {
        var b = a.h,
            c = a.type,
            d = a.head,
            e = a.gd,
            f = a.gamma,
            g = a.p,
            h = a.Bc,
            k = a.Yb,
            l = a.pb,
            m = a.q,
            n = a.Wb,
            p = a.Ab,
            q = a.Xa,
            r = a.Hc,
            u,
            w,
            v,
            z,
            B,
            D;
        a.Ub--;
        B = D = e[d[g]] ? 1 : 0;
        for (u = 1; u <= b; u++) r[u] = 0;
        for (z = 1; z <= h; z++)
            if (((w = k[z]), (v = d[b + w]), e[v]))
                if (((w = l[w]), (B += w * w), v <= b)) r[v] += w;
                else {
                    var E = a.Ga;
                    u = a.Fa;
                    var F = a.Ma,
                        G;
                    G = E[v - b];
                    for (v = E[v - b + 1]; G < v; G++) r[u[G]] -= w * F[G];
                }
        wd(a.Y, r);
        a = q[g];
        for (z = 1; z <= n; z++)
            (u = p[z]),
                (v = d[u]),
                u != g &&
                c[d[u]] != Ka &&
                ((w = q[u] / a),
                    (h = f[u] + w * w * B + 2 * w * r[u]),
                    (w = (e[v] ? 1 : 0) + D * w * w),
                    (f[u] = h >= w ? h : w),
                    2.220446049250313e-16 > f[u] && (f[u] = 2.220446049250313e-16));
        c[d[b + m]] == Ka
            ? (f[g] = 1)
            : ((f[g] = B / (a * a)), 2.220446049250313e-16 > f[g] && (f[g] = 2.220446049250313e-16));
        v = d[g];
        if (c[v] == C && e[v])
            for (e[v] = 0, z = 1; z <= n; z++) {
                u = p[z];
                if (u == g) {
                    if (c[d[b + m]] == Ka) continue;
                    w = 1 / q[g];
                } else {
                    if (c[d[u]] == Ka) continue;
                    w = q[u] / q[g];
                }
                f[u] -= w * w;
                2.220446049250313e-16 > f[u] && (f[u] = 2.220446049250313e-16);
            }
    }
    function T(a) {
        var b = a.h,
            c = a.type,
            d = a.head,
            e = a.bind,
            f = a.stat,
            g = a.p,
            h = a.Qe;
        a = a.q;
        var k;
        k = d[g];
        d[g] = d[b + a];
        d[b + a] = k;
        e[d[g]] = g;
        e[d[b + a]] = b + a;
        f[a] = c[k] == C ? Na : 0 < h ? M : P;
    }
    function O(a, b) {
        var c = a.h,
            d = a.n,
            e = a.cc,
            f = a.head,
            g = a.Ta,
            h,
            k;
        for (h = 1; h <= d; h++)
            if (
                ((k = f[c + h]),
                    (g[h] < -b && (e[k] == Sa || e[k] == Ka)) || (g[h] > +b && (e[k] == Ta || e[k] == Ka)))
            )
                return 1;
        return 0;
    }
    function S(a) {
        var b = a.h,
            c = a.n,
            d = a.type,
            e = a.c,
            f = a.f,
            g = a.cc,
            h = a.head,
            k = a.stat;
        a = a.Ta;
        var l;
        for (l = 1; l <= b + c; l++)
            switch (g[l]) {
                case Ka:
                    d[l] = Q;
                    e[l] = -1e3;
                    f[l] = 1e3;
                    break;
                case Sa:
                    d[l] = Q;
                    e[l] = 0;
                    f[l] = 1;
                    break;
                case Ta:
                    d[l] = Q;
                    e[l] = -1;
                    f[l] = 0;
                    break;
                case Q:
                case C:
                    (d[l] = C), (e[l] = f[l] = 0);
            }
        for (e = 1; e <= c; e++) (l = h[b + e]), (k[e] = d[l] == C ? Na : 0 <= a[e] ? M : P);
    }
    function G(a) {
        var b = a.h,
            c = a.n,
            d = a.type,
            e = a.c,
            f = a.f,
            g = a.ad,
            h = a.bd,
            k = a.head,
            l = a.stat,
            m = a.Ta;
        ha(d, 1, a.cc, 1, b + c);
        ha(e, 1, g, 1, b + c);
        ha(f, 1, h, 1, b + c);
        for (a = 1; a <= c; a++)
            switch (((g = k[b + a]), d[g])) {
                case Ka:
                    l[a] = Ra;
                    break;
                case Sa:
                    l[a] = M;
                    break;
                case Ta:
                    l[a] = P;
                    break;
                case Q:
                    l[a] =
                        2.220446049250313e-16 <= m[a]
                            ? M
                            : -2.220446049250313e-16 >= m[a]
                                ? P
                                : Math.abs(e[g]) <= Math.abs(f[g])
                                    ? M
                                    : P;
                    break;
                case C:
                    l[a] = Na;
            }
    }
    function Z(a, b) {
        var c = a.n,
            d = a.stat,
            e = a.Ta,
            f;
        for (f = 1; f <= c; f++)
            if ((e[f] < -b && (d[f] == M || d[f] == Ra)) || (e[f] > +b && (d[f] == P || d[f] == Ra))) return 1;
        return 0;
    }
    function Y(a) {
        var b = a.h,
            c = a.n,
            d = a.ib,
            e = a.head,
            f = a.La,
            g,
            h,
            l;
        l = d[0];
        for (g = 1; g <= b; g++) (h = e[g]), h > b && (l += d[h - b] * f[g]);
        for (f = 1; f <= c; f++) (h = e[b + f]), h > b && (l += d[h - b] * k(a, f));
        return l;
    }
    function ba(a, b, c) {
        var d = a.h,
            e = a.n,
            f = a.B,
            g = a.cc,
            h = a.head,
            l = a.stat,
            m = a.I,
            n = a.La,
            p = a.Ta;
        if (!(b.s < fc || (0 < b.cb && 1e3 * ma(a.ic) < b.cb) || a.da == a.$d || (!c && 0 != a.da % b.dc))) {
            b = 0;
            if (1 == m) {
                for (l = 1; l <= d; l++) b -= f[h[l]] * n[l];
                for (n = 1; n <= e; n++) b -= f[h[d + n]] * k(a, n);
            } else
                for (n = 1; n <= e; n++)
                    0 > p[n] && (l[n] == M || l[n] == Ra) && (b -= p[n]),
                        0 < p[n] && (l[n] == P || l[n] == Ra) && (b += p[n]);
            e = 0;
            for (l = 1; l <= d; l++) g[h[l]] == C && e++;
            1 == a.I
                ? y(" " + a.da + ":  infeas = " + b + " (" + e + ")")
                : y("|" + a.da + ": obj = " + Y(a) + "  infeas = " + b + " (" + e + ")");
            a.$d = a.da;
        }
    }
    function oa(a, b, c, d, e) {
        var f = a.h,
            g = a.n,
            h = a.eb,
            k = a.head,
            l = a.stat,
            m = a.La,
            n = a.Ta;
        b.valid = 1;
        a.valid = 0;
        b.Y = a.Y;
        a.Y = null;
        ha(b.head, 1, k, 1, f);
        b.ra = c;
        b.wa = d;
        b.ea = Y(a);
        b.da = a.da;
        b.some = e;
        for (a = 1; a <= f; a++)
            (c = k[a]),
                c <= f
                    ? ((c = b.o[c]), (c.stat = A), (c.bind = a), (c.w = m[a] / c.qa))
                    : ((c = b.g[c - f]), (c.stat = A), (c.bind = a), (c.w = m[a] * c.za)),
                (c.M = 0);
        for (m = 1; m <= g; m++)
            if (((c = k[f + m]), c <= f)) {
                c = b.o[c];
                c.stat = l[m];
                c.bind = 0;
                switch (l[m]) {
                    case M:
                        c.w = c.c;
                        break;
                    case P:
                        c.w = c.f;
                        break;
                    case Ra:
                        c.w = 0;
                        break;
                    case Na:
                        c.w = c.c;
                }
                c.M = (n[m] * c.qa) / h;
            } else {
                c = b.g[c - f];
                c.stat = l[m];
                c.bind = 0;
                switch (l[m]) {
                    case M:
                        c.w = c.c;
                        break;
                    case P:
                        c.w = c.f;
                        break;
                    case Ra:
                        c.w = 0;
                        break;
                    case Na:
                        c.w = c.c;
                }
                c.M = n[m] / c.za / h;
            }
    }
    this.chrome_workaround_1 = function (a, b) {
        var c = a.Ga,
            d = a.Fa,
            e = a.Ma,
            f = a.n,
            g,
            h,
            k;
        for (k = h = 1; k <= f; k++)
            for (c[k] = h, g = b.g[k].l; null != g; g = g.L) (d[h] = g.o.ia), (e[h] = g.o.qa * g.j * g.g.za), h++;
        c[f + 1] = h;
    };
    this.chrome_workaround_2 = function (a, b) {
        var c,
            d,
            e,
            f = a.hg,
            g = a.gg,
            h = a.ig,
            k = a.h;
        for (d = c = 1; d <= k; d++)
            for (f[d] = c, e = b.o[d].l; null != e; e = e.G) (g[c] = e.g.H), (h[c] = e.o.qa * e.j * e.g.za), c++;
        f[k + 1] = c;
    };
    var z,
        F = 2,
        D = 0,
        w = 0,
        ca = 0,
        L,
        K,
        aa;
    z = (function (a) {
        var b = a.h,
            c = a.n;
        a = a.O;
        var d = {};
        d.h = b;
        d.n = c;
        d.type = new Int8Array(1 + b + c);
        d.c = new Float64Array(1 + b + c);
        d.f = new Float64Array(1 + b + c);
        d.B = new Float64Array(1 + b + c);
        d.cc = new Int8Array(1 + b + c);
        d.ad = new Float64Array(1 + b + c);
        d.bd = new Float64Array(1 + b + c);
        d.ib = new Float64Array(1 + c);
        d.Ga = new Int32Array(1 + c + 1);
        d.Fa = new Int32Array(1 + a);
        d.Ma = new Float64Array(1 + a);
        d.hg = new Int32Array(1 + b + 1);
        d.gg = new Int32Array(1 + a);
        d.ig = new Float64Array(1 + a);
        d.head = new Int32Array(1 + b + c);
        d.bind = new Int32Array(1 + b + c);
        d.stat = new Int8Array(1 + c);
        d.La = new Float64Array(1 + b);
        d.Ta = new Float64Array(1 + c);
        d.gd = new Int8Array(1 + b + c);
        d.gamma = new Float64Array(1 + b);
        d.Yb = new Int32Array(1 + c);
        d.pb = new Float64Array(1 + c);
        d.Ab = new Int32Array(1 + b);
        d.Xa = new Float64Array(1 + b);
        d.mb = new Float64Array(1 + b);
        d.Gc = new Float64Array(1 + b);
        d.Hc = new Float64Array(1 + b);
        d.fg = new Float64Array(1 + b);
        return d;
    })(a);
    (function (a, b) {
        var c = a.h,
            d = a.n,
            e = a.type,
            f = a.c,
            g = a.f,
            h = a.B,
            k = a.cc,
            l = a.ad,
            m = a.bd,
            n = a.ib,
            p = a.head,
            q = a.bind,
            r = a.stat,
            u = a.gd,
            w = a.gamma,
            v,
            z;
        for (v = 1; v <= c; v++)
            (z = b.o[v]), (e[v] = z.type), (f[v] = z.c * z.qa), (g[v] = z.f * z.qa), (h[v] = 0);
        for (v = 1; v <= d; v++)
            (z = b.g[v]),
                (e[c + v] = z.type),
                (f[c + v] = z.c / z.za),
                (g[c + v] = z.f / z.za),
                (h[c + v] = z.B * z.za);
        ha(k, 1, e, 1, c + d);
        ha(l, 1, f, 1, c + d);
        ha(m, 1, g, 1, c + d);
        n[0] = b.la;
        ha(n, 1, h, c + 1, d);
        e = 0;
        for (v = 1; v <= d; v++) e < Math.abs(n[v]) && (e = Math.abs(n[v]));
        0 == e && (e = 1);
        switch (b.dir) {
            case za:
                a.eb = 1 / e;
                break;
            case Ea:
                a.eb = -1 / e;
        }
        1 > Math.abs(a.eb) && (a.eb *= 1e3);
        for (v = 1; v <= d; v++) h[c + v] *= a.eb;
        chrome_workaround_1(a, b);
        chrome_workaround_2(a, b);
        ha(p, 1, b.head, 1, c);
        h = 0;
        for (v = 1; v <= c; v++) (z = b.o[v]), z.stat != A && (h++, (p[c + h] = v), (r[h] = z.stat));
        for (v = 1; v <= d; v++) (z = b.g[v]), z.stat != A && (h++, (p[c + h] = c + v), (r[h] = z.stat));
        for (h = 1; h <= c + d; h++) q[p[h]] = h;
        a.valid = 1;
        b.valid = 0;
        a.Y = b.Y;
        b.Y = null;
        a.I = 0;
        a.ic = la();
        a.Of = a.da = b.da;
        a.$d = -1;
        a.Ub = 0;
        ja(u, 1, 0, c + d);
        for (v = 1; v <= c; v++) w[v] = 1;
    })(z, a);
    for (b.s >= mc && y("Objective scale factor = " + z.eb + ""); ;) {
        if (0 == F) {
            aa = d(z);
            if (0 != aa)
                return (
                    b.s >= Mb &&
                    (y("Error: unable to factorize the basis matrix (" + aa + ")"),
                        y("Sorry, basis recovery procedure not implemented yet")),
                    (a.Y = z.Y),
                    (z.Y = null),
                    (a.ra = a.wa = Aa),
                    (a.ea = 0),
                    (a.da = z.da),
                    (a.some = 0),
                    (aa = Tb)
                );
            F = z.valid = 1;
            D = w = 0;
        }
        if (
            0 == w &&
            (l(z),
                (w = 1),
                0 == z.I && (0 != O(z, 0.9 * b.vb) ? ((z.I = 1), S(z)) : ((z.I = 2), G(z)), (D = z.Ub = 0)),
                0 != Z(z, b.vb))
        ) {
            b.s >= Mb && y("Warning: numerical instability (dual simplex, phase " + (1 == z.I ? "I" : "II") + ")");
            if (b.hb == Rb) return oa(z, a, Aa, Aa, 0), (aa = Tb);
            F = z.I = 0;
            ca = 5;
            continue;
        }
        1 == z.I && 0 == O(z, b.vb) && (ba(z, b, 1), (z.I = 2), 1 != w && (l(z), (w = 1)), G(z), (D = z.Ub = 0));
        0 == D && (h(z, z.La), 2 == z.I && (z.La[0] = Y(z)), (D = 1));
        switch (b.ed) {
            case oc:
                0 == z.Ub && n(z);
        }
        if (2 == z.I && 0 > z.eb && b.ef > -t && z.La[0] <= b.ef) {
            if (1 != D || 1 != w) {
                1 != D && (D = 0);
                1 != w && (w = 0);
                continue;
            }
            ba(z, b, 1);
            b.s >= Xb && y("OBJECTIVE LOWER LIMIT REACHED; SEARCH TERMINATED");
            oa(z, a, Ad, ec, 0);
            return (aa = Tf);
        }
        if (2 == z.I && 0 < z.eb && b.ff < +t && z.La[0] >= b.ff) {
            if (1 != D || 1 != w) {
                1 != D && (D = 0);
                1 != w && (w = 0);
                continue;
            }
            ba(z, b, 1);
            b.s >= Xb && y("OBJECTIVE UPPER LIMIT REACHED; SEARCH TERMINATED");
            oa(z, a, Ad, ec, 0);
            return (aa = Uf);
        }
        if (2147483647 > b.pc && z.da - z.Of >= b.pc) {
            if ((2 == z.I && 1 != D) || 1 != w) {
                2 == z.I && 1 != D && (D = 0);
                1 != w && (w = 0);
                continue;
            }
            ba(z, b, 1);
            b.s >= Xb && y("ITERATION LIMIT EXCEEDED; SEARCH TERMINATED");
            switch (z.I) {
                case 1:
                    K = Ad;
                    G(z);
                    h(z, z.La);
                    break;
                case 2:
                    K = ec;
            }
            oa(z, a, Ad, K, 0);
            return (aa = pg);
        }
        if (2147483647 > b.ub && 1e3 * ma(z.ic) >= b.ub) {
            if ((2 == z.I && 1 != D) || 1 != w) {
                2 == z.I && 1 != D && (D = 0);
                1 != w && (w = 0);
                continue;
            }
            ba(z, b, 1);
            b.s >= Xb && y("TIME LIMIT EXCEEDED; SEARCH TERMINATED");
            switch (z.I) {
                case 1:
                    K = Ad;
                    G(z);
                    h(z, z.La);
                    break;
                case 2:
                    K = ec;
            }
            oa(z, a, Ad, K, 0);
            return (aa = Qc);
        }
        ba(z, b, 0);
        m(z, b.Ib);
        if (0 == z.p) {
            if (1 != D || 1 != w) {
                1 != D && (D = 0);
                1 != w && (w = 0);
                continue;
            }
            ba(z, b, 1);
            switch (z.I) {
                case 1:
                    b.s >= Xb && y("PROBLEM HAS NO DUAL FEASIBLE SOLUTION");
                    G(z);
                    h(z, z.La);
                    L = Ad;
                    K = jc;
                    break;
                case 2:
                    b.s >= Xb && y("OPTIMAL SOLUTION FOUND"), (L = K = ec);
            }
            oa(z, a, L, K, 0);
            return (aa = 0);
        }
        var N = z.fg;
        q(z, N);
        ca && r(z, N);
        p(z, N);
        u(z, b.Ib);
        switch (b.le) {
            case pc:
                v(z, 0);
                break;
            case qc:
                v(z, 0.3 * b.vb);
        }
        if (0 == z.q) {
            if (1 != D || 1 != w || !ca) {
                1 != D && (D = 0);
                1 != w && (w = 0);
                ca = 1;
                continue;
            }
            ba(z, b, 1);
            switch (z.I) {
                case 1:
                    b.s >= Mb && y("Error: unable to choose basic variable on phase I");
                    a.Y = z.Y;
                    z.Y = null;
                    a.ra = a.wa = Aa;
                    a.ea = 0;
                    a.da = z.da;
                    a.some = 0;
                    aa = Tb;
                    break;
                case 2:
                    b.s >= Xb && y("PROBLEM HAS NO FEASIBLE SOLUTION"), oa(z, a, jc, ec, z.head[z.p]), (aa = 0);
            }
            return aa;
        }
        var da = z.pb[z.q],
            ea = 1e-5 * (1 + 0.01 * z.ph);
        if (Math.abs(da) < ea && (b.s >= mc && y("piv = " + da + "; eps = " + ea + ""), !ca)) {
            ca = 5;
            continue;
        }
        H(z);
        ca && E(z);
        da = z.Xa[z.p];
        ea = z.pb[z.q];
        if (Math.abs(da - ea) > 1e-8 * (1 + Math.abs(da)) || !((0 < da && 0 < ea) || (0 > da && 0 > ea))) {
            b.s >= mc && y("piv1 = " + da + "; piv2 = " + ea + "");
            if (1 != F || !ca) {
                1 != F && (F = 0);
                ca = 5;
                continue;
            }
            0 == z.Xa[z.p] && (z.Wb++, (z.Ab[z.Wb] = z.p));
            z.Xa[z.p] = ea;
        }
        J(z);
        2 == z.I && (z.La[0] += (z.Ta[z.q] / z.eb) * (z.Qe / z.Xa[z.p]));
        D = 2;
        B(z);
        w = 2;
        switch (b.ed) {
            case oc:
                0 < z.Ub && R(z);
        }
        aa = e(z, z.p, z.head[z.h + z.q]);
        F = 0 == aa ? 2 : (z.valid = 0);
        T(z);
        z.da++;
        0 < ca && ca--;
    }
}
