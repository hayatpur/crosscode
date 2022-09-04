function avg(l) {
    let s = 0
    let n = l.length

    for (let i = 0; i < n; i = i + 1) {
        s = s + l[i]
    }

    return s / n
}

let lst = [1, 5, 6, 10]
let k = avg(lst)
