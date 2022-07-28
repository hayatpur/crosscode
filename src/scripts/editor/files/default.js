let list = [1, 2, 3 - 2, 4]
let n = list.length

for (let i = 0; i < n / 2; i++) {
    let temp = list[i]
    list[i] = list[n - 1 - i]
    list[n - 1 - i] = temp
}
