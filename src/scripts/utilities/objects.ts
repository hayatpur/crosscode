import * as RFDC from './rfdc.js'

// export function objectMap(
//     obj: { [s: string]: any },
//     fn: (value: any, key: string, index: number, depth: number) => any,
//     d = 0
// ) {
//     if (obj == null) {
//         return null
//     }
//     return Object.fromEntries(Object.entries(obj).map(([k, v], i) => [k, fn(v, k, i, d + 1)]))
// }

// // Returns a deep copy of the object
// export function clone<T>(obj: T, d = 0): T {

//     if (typeof obj == 'function') {
//         return obj
//     }

//     if (typeof obj == 'object') {
//         if (obj instanceof Set) {
//             return new Set(clone([...obj])) as any
//         } else if (Array.isArray(obj)) {
//             return obj.map((child) => clone(child)) as any
//         } else {
//             return objectMap(
//                 obj,
//                 (child, k, i, depth) => {
//                     // console.log(' '.repeat(depth), k, i)
//                     return clone(child, depth)
//                 },
//                 d
//             ) as any
//         }
//     } else {
//         return obj
//     }
// }

export function clone<T>(obj: T, d = 0): T {
    return RFDC.clone(obj)
}
