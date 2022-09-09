function pushn(O, n, item) {
    for (let i = 0; i < n; i = i + 1) {
        O.push(item)
    }
}

let left = [1, 4, 5]
let y = 5
pushn(left, 5, y)
