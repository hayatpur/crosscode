let list = [],
    n = 10

// Add to list
for (let i = 0; i < n; i++) {
    list.push(i)
}

// Reverse list
for (let i = 0; i < n / 2; i++) {
    let temp = list[i]
    list[i] = list[n - 1 - i]
    list[n - 1 - i] = temp
}
