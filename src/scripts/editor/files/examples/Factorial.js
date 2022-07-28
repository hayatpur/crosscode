function factorial(x) {
    if (x == 1) {
        return x
    } else {
        return x * factorial(x - 1)
    }
}

let n = 5
let y = factorial(n)
