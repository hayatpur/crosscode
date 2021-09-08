export function objectMap(obj: { [s: string]: any }, fn: (value: any, key: string, index: number) => any) {
    if (obj == null) {
        return null;
    }
    return Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i)]));
}

// Returns a deep copy of the object
export function clone(obj: { [x: string]: any }) {
    if (typeof obj == 'function') {
        return obj;
    }

    if (typeof obj == 'object') {
        if (obj instanceof Set) {
            return new Set(clone([...obj]));
        } else if (Array.isArray(obj)) {
            return obj.map((child) => clone(child));
        } else {
            return objectMap(obj, (child) => clone(child));
        }
    } else {
        return obj;
    }
}
