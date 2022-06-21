let array = [5, 2, 7, 1, 6]
let n = array.length

// Shift
for (let i = 1; i < n; i++) {
    array[i] = array[i - 1]
}
