function avg(list) {
    let sum = 0
    let n = list.length

    for (let i = 0; i < n; i = i + 1) {
        sum = sum + list[i]
    }

    return sum / n
}

let lst = [1, 5, 6, 10]
let k = avg(lst)
