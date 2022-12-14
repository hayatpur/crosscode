// Tutorial D
//
// Controls:
//    - Progressive closure
//    - Progressive disclosure
//    - Selection from source code
// Concepts
//    - Aggregation over depth

function fact(x) {
    if (x > 1) {
        return x * fact(x - 1)
    }

    return 1
}

function fact2(x) {
    let r = 5
    let z = r + 1
    let y = z - r
    y = y - r
    r = y * y

    if (x > 1) {
        return x * fact(x - 1)
    }

    return 1
}

let n = 5
let y = fact(n)
