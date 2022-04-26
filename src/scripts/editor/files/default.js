let array = [5, 2, 7, 1, 6]
let n = array.length

array[0] = array[n - 1]
array[n - 1] = n
