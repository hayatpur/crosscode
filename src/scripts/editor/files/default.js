let array = [5, 2, 7, 1, 6]
let n = array.length

// Shift to right
for (let i = 1; i < n; i = i + 1) {
    let temp = array[i]
    array[i] = array[i - 1]
    array[i - 1] = temp
}
