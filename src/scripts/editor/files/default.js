let x = [1, 2, 3, 4, 5];

for (let i = 0; i < x.length - 1; i = i + 1) {
    let temp = x[i];
    x[i] = x[i+1];
    x[i+1] = temp;
}