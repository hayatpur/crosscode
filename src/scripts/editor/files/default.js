function ack(m, n) {
    if (m === 0) {
        return n + 1
    }

    if (n === 0) {
        return ack(m - 1, 1)
    }

    if (m !== 0 && n !== 0) {
        return ack(m - 1, ack(m, n - 1))
    }
}

const y = ack(3, 2)
