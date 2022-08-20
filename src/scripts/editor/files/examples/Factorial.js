function fact(x) {
    if (x == 1) {
        return x
    } else {
        return x * fact(x - 1)
    }
}

let n = 5
let y = fact(n)
