function fib(N) {
    const memo = [0, 1]

    for (let i = 2; i <= N; i++) {
        memo[i] = memo[i - 1] + memo[i - 2]
    }

    return memo[N]
}

let y = fib(20)
