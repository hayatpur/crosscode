function mergeSort(array) {
    // Base case or terminating case
    if (array.length < 2) {
        return array
    }

    const half = array.length / 2
    const left = array.splice(0, half)
    return merge(mergeSort(left), mergeSort(array))
}
