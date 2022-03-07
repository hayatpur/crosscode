function qs(array) {
    if (array.length <= 1) {
        return array
    }

    let pivot = array[0]

    let left = []
    let right = []

    for (let i = 1; i < array.length - 1; i++) {
        if (array[i] < pivot) {
            left.push(array[i])
        } else {
            right.push(array[i])
        }
    }

    const l = qs(left)
    const r = qs(right)
    l.push(pivot)

    return l.concat(r)
}

let unsorted = [23, 45, 16, 37, 3, 99, 22]
let sorted = qs(unsorted)
