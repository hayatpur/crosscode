function concat(a, b) {
    let c = []
    for (let i = 0; i < a.length; i = i + 1) c.push(a[i])
    for (let i = 0; i < b.length; i = i + 1) c.push(b[i])
    return c
}

function push(O, item) {
    let len = O.length
    O[len] = item
}

function qs(array) {
    if (array.length <= 1) {
        return array
    }

    let pivot = array[0]

    let left = []
    let right = []

    for (let i = 1; i < array.length - 1; i = i + 1) {
        if (array[i] < pivot) {
            push(left, array[i])
        } else {
            push(right, array[i])
        }
    }

    let l = qs(left)
    let r = qs(right)

    l.push(pivot)

    return concat(l, r)
}

let unsorted = [4, 1, 7, 0, 3, 9, 1, 6, 3]
let sorted = qs(unsorted)
