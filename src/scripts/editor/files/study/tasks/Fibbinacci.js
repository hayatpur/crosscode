function fibonacci(N) {
    let memo = [0, 1]

    for (let i = 2; i <= N; i = i + 1) {
        memo[i] = memo[i - 1] + memo[i - 2]
    }

    return memo[N]
}

let n = 7
let y = fibonacci(n)
