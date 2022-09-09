// Return a new list with item inserted at the right position
function insert(list, item) {
    let n = list.length
    let newList = []
    let i = 0

    for (i = 0; i < n; i = i + 1) {
        if (item < list[i]) {
            break
        }
        newList[i] = list[i]
    }

    newList.push(item)

    for (let j = i; j < n + 1; j = j + 1) {
        newList[j + 1] = list[j]
    }

    return newList
}

let list = [1, 3, 5, 7, 9]
let newList = insert(list, 6)
