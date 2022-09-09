function copy(L) {
    let copy = []
    for (let i = 0; i < L.length; i = i + 1) copy[i] = L[i]
    return copy
}

function swap(L, i, j) {
    const temp = L[i]
    L[i] = L[j]
    L[j] = temp
}

// Bubble up elements till L[:i]
function bubble(L, i) {
    for (let j = 0; j < L.length - i - 1; j = j + 1) {
        if (L[j] > L[j + 1]) {
            swap(L, j, j + 1)
        }
    }
}

// From left to right, swap items that are out of order
// Returns a new list, does not modify the original
function bubbleSort(L) {
    let sorted = copy(L)

    for (let i = 0; i < sorted.length; i = i + 1) {
        bubble(sorted, i)
    }

    return sorted
}

let list = [5, 4, 3, 2, 1]
let sorted = bubbleSort(list)
