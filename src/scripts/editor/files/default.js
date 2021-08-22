let list = [1, 7, 2, 0];
let len = list.length;

for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
        if (list[j] > list[j + 1]) {
            let temp = list[j];
            list[j] = list[j + 1];
            list[j + 1] = temp;
        }
    }
}

