let array = [5, 2, 7, 1, 6]
let n = array.length

// Insertion sort
for (let i = 1; i < n; i++) {
    let key = array[i]
    let j = i - 1

    while (j >= 0 && array[j] > key) {
        array[j + 1] = array[j]
        j = j - 1
    }
    array[j + 1] = key
}
