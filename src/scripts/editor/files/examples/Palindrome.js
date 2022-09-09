function isPalindrome(string) {
    let right = string.length - 1

    for (let left = 0; left < right; left = left + 1) {
        if (string[left] !== string[right]) {
            return false
        }
        right -= 1
    }

    return true
}

let t1 = isPalindrome('racecar')
let t2 = isPalindrome('polo')
