function sv(n) {
    // Eratosthenes algorithm to find all primes under n
    let array = []
    let upperLimit = Math.sqrt(n)
    let output = []

    // Make an array from 2 to (n - 1)
    for (let i = 0; i < n; i = i + 1) {
        array.push(true)
    }

    // Remove multiples of primes starting from 2, 3, 5,...
    for (let i = 2; i <= upperLimit; i = i + 1) {
        if (array[i] == true) {
            for (let j = i * i; j < n; j = j + i) {
                array[j] = false
            }
        }
    }

    // All array[i] set to true are primes
    for (let i = 2; i < n; i = i + 1) {
        if (array[i]) {
            output.push(i)
        }
    }

    return output
}

let x = sv(10)
