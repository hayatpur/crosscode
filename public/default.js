let list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let n = list.length

if (list[0] < list[n - 1]) {
    let temp = list[0]
    list[0] = list[n - 1]
    list[n - 1] = temp
}
