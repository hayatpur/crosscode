function f(x) {
    if (x == 1) {
        return x
    } else {
        return x * f(x - 1)
    }
}

let y = f(5)
