function merge(left, right) {
    let i = 0
    let j = 0
    let results = []

    for (let k = 0; k < left.length + right.length; k = k + 1) {
        if (i > left.length - 1) {
            results.push(right[j])
            j = j + 1
        } else if (j > right.length - 1) {
            results.push(left[i])
            i = i + 1
        } else if (left[i] < right[j]) {
            results.push(left[i])
            i = i + 1
        } else {
            results.push(right[j])
            j = j + 1
        }
    }

    return results
}

function mergeSort(array) {
    // Base case or terminating case
    if (array.length < 2) {
        return array
    }

    let half = array.length / 2
    let left = []
    let right = []

    for (let i = 0; i < array.length; i = i + 1) {
        if (i < half) {
            left.push(array[i])
        } else {
            right.push(array[i])
        }
    }

    return merge(mergeSort(left), mergeSort(right))
}

let unsorted = [4, 1, 7, 0, 3, 9, 1, 6, 3]
let sorted = mergeSort(unsorted)
console.log(sorted)
