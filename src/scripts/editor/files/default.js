function bs(arr, val, low, high) {
    if (high <= low || arr.length == 0) return -1

    const mid = low + Math.floor((high - low) / 2)

    if (arr[mid] == val) {
        return mid
    }

    if (arr[mid] > val) {
        return bs(arr, val, low, mid - 1)
    }

    return bs(arr, val, mid + 1, high)
}

let arr = [2, 5, 7, 8, 13, 18]
let i = bs(arr, 8, 0, arr.length - 1)
