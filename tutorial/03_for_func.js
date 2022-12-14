// Tutorial C
//
// Controls:
//    - Shift click into a function call
//    - For expanding / collapsing
//    - Minimize / maximize
//    - Progressive closure enable
//    - Expanding / collapsing abbreviations
// Concepts
//    - Aggregation over breadth
//    - Abbreviations
//    - Specialized representations for For Statement
//    - Data state scope
//    - Detailed / less detailed representations
//    - Progressive closure

function avg(list) {
    let sum = 0
    let n = list.length

    for (let i = 0; i < n; i = i + 1) {
        sum = sum + list[i]
    }

    return sum / n
}

let l = [1, 5, 6, 10, 2, 5, 1, 2]
let k = avg(l)
