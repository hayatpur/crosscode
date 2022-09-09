function fact(x) {
    if (x > 1) {
        return x * fact(x - 1)
    }

    return 1
}

let n = 10
let y = fact(n)
