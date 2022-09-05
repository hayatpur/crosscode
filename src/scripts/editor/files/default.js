let array = [5, 2, 7, 1, 6]
let n = array.length

// Sort
for (let i = 0; i < n; i++) {
    let key = array[i]

    let j = 0
    for (j = i - 1; j >= 0 && array[j] > key; j--) {
        array[j + 1] = array[j]
    }

    array[j + 1] = key
}
