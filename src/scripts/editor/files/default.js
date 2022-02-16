// Correct

let list = [],
    n = 10

for (let i = 0; i < n; i++) {
    list.push(i)
}

for (let i = 0; i < n / 2; i++) {
    let temp = list[i]
    list[i] = list[n - 1 - i]
    list[n - 1 - i] = temp
}
