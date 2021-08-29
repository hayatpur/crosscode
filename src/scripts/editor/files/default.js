let x = [1, 2, 3];

if (x[0] > 0) {
    let temp = x[0];
    x[0] = x[2];
    x[2] = temp;
}