let l = [1, 2, 3, 4, 5]
let n = l.length

let temp = l[0]
l[0] = l[n - 1]
l[n - 1] = temp
