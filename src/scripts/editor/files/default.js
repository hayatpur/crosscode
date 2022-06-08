let l = [1, 2, 3, 4, 5]
let n = l.length

for (let i = 0; i < n - 1; i++) {
    let temp = l[i]
    l[i] = l[i + 1]
    l[i + 1] = temp
}
