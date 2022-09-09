let list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let n = list.length

for (let i = 0; i < n / 2; i = i + 1) {
    let temp = list[i]
    list[i] = list[n - 1 - i]
    list[n - 1 - i] = temp
}
