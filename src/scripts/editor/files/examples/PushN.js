function push(O, item) {
    let len = O.length
    O[len] = item
}

function pushn(O, n, item) {
    for (let i = 0; i < n; i++) {
        push(O, item)
    }
}

let left = [1, 4, 5]
let y = 5
pushn(left, 5, y)
