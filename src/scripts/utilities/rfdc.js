function RFDCcopyBuffer(cur) {
    if (cur instanceof Buffer) {
        return Buffer.from(cur)
    }

    return new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length)
}

export function RFDCcloneArray(a, fn) {
    var keys = Object.keys(a)
    var a2 = new Array(keys.length)
    for (var i = 0; i < keys.length; i++) {
        var k = keys[i]
        var cur = a[k]
        if (typeof cur !== 'object' || cur === null) {
            a2[k] = cur
        } else if (cur instanceof Date) {
            a2[k] = new Date(cur)
        } else if (ArrayBuffer.isView(cur)) {
            a2[k] = RFDCcopyBuffer(cur)
        } else {
            a2[k] = fn(cur)
        }
    }
    return a2
}

export function RFDCclone(o) {
    if (typeof o !== 'object' || o === null) return o
    if (o instanceof Date) return new Date(o)
    if (Array.isArray(o)) return RFDCcloneArray(o, RFDCclone)
    if (o instanceof Map) return new Map(RFDCcloneArray(Array.from(o), RFDCclone))
    if (o instanceof Set) return new Set(RFDCcloneArray(Array.from(o), clone))
    var o2 = {}
    for (var k in o) {
        if (Object.hasOwnProperty.call(o, k) === false) continue
        var cur = o[k]
        if (typeof cur !== 'object' || cur === null) {
            o2[k] = cur
        } else if (cur instanceof Date) {
            o2[k] = new Date(cur)
        } else if (cur instanceof Map) {
            o2[k] = new Map(RFDCcloneArray(Array.from(cur), RFDCclone))
        } else if (cur instanceof Set) {
            o2[k] = new Set(RFDCcloneArray(Array.from(cur), RFDCclone))
        } else if (ArrayBuffer.isView(cur)) {
            o2[k] = RFDCcopyBuffer(cur)
        } else {
            o2[k] = RFDCclone(cur)
        }
    }
    return o2
}

export function RFDCcloneProto(o) {
    if (typeof o !== 'object' || o === null) return o
    if (o instanceof Date) return new Date(o)
    if (Array.isArray(o)) return RFDCcloneArray(o, RFDCcloneProto)
    if (o instanceof Map) return new Map(RFDCcloneArray(Array.from(o), RFDCcloneProto))
    if (o instanceof Set) return new Set(RFDCcloneArray(Array.from(o), RFDCcloneProto))
    var o2 = {}
    for (var k in o) {
        var cur = o[k]
        if (typeof cur !== 'object' || cur === null) {
            o2[k] = cur
        } else if (cur instanceof Date) {
            o2[k] = new Date(cur)
        } else if (cur instanceof Map) {
            o2[k] = new Map(RFDCcloneArray(Array.from(cur), RFDCcloneProto))
        } else if (cur instanceof Set) {
            o2[k] = new Set(RFDCcloneArray(Array.from(cur), RFDCcloneProto))
        } else if (ArrayBuffer.isView(cur)) {
            o2[k] = RFDCcopyBuffer(cur)
        } else {
            o2[k] = RFDCcloneProto(cur)
        }
    }
    return o2
}
