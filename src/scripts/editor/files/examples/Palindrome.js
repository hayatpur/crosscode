function isPalindrome(string) {
    let left = 0
    let right = string.length - 1

    while (left < right) {
        if (string[left] !== string[right]) {
            return false
        }
        left += 1
        right -= 1
    }

    return true
}

let t1 = isPalindrome('racecar')
let t2 = isPalindrome('polo')
