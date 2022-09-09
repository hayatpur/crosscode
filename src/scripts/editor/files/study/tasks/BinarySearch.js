function bs(arr, searchValue, low, high) {
    if (low >= high) return -1

    let mid = low + Math.floor((high - low) / 2)

    if (arr[mid] === searchValue) {
        return mid
    }

    if (arr[mid] > searchValue) {
        return bs(arr, searchValue, low, mid - 1)
    }

    return bs(arr, searchValue, mid + 1, high)
}

let arr = [2, 5, 7, 8, 13, 18]
let i = bs(arr, 8, 0, arr.length - 1)
