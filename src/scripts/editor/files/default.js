let x = 5

for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i * j < 2) {
            x = i - j
        }
    }
}
