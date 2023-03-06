// Controls:
//    - Left key to move one step back
//    - Right key to move one step forward
//    - Up key to move animation backward
//    - Down key to move animation forward
//    - Grab control flow cursor to move
//    - Control/Cmd click to get break down a step

let list = [1, 2, 3, 4, 5, 6, 7, 8, 9]
let n = list.length

if (list[0] < list[n - 1]) {
    let temp = list[0]
    list[0] = list[n - 1]
    list[n - 1] = temp
}
