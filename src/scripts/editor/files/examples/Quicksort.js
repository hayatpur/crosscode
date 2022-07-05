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

    let l = qs(left)
    let r = qs(right)
    l.push(pivot)

    return l.concat(r)
}

let unsorted = [2, 4, 1, 3, 5, 0, 6]
let sorted = qs(unsorted)
