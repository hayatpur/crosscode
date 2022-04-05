let array = [5, 2, 7, 1, 6]
let n = array[0]

for (let i = 1; i < n; i++) {
    let k = array[i]
    let j = 0
    for (j = i - 1; k < array[j]; j = j - 1) {
        array[j + 1] = array[j]
    }
    array[j + 1] = k
}
