function qs(array) {
    if (array.length <= 2) {
        return array
    }

    let pivot = array[0]

    let left = []
    let right = []

    for (let i = 1; i < array.length - 1; i = i + 1) {
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

let unsorted = [4, -1, 7, 10, -3, 9, 1, 6, 3]
let sorted = qs(unsorted)
