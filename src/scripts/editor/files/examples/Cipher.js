function getCipherMap(alphabet, shift) {
    let charsMap = {}

    for (let i = 0; i < alphabet.length; i++) {
        let char = alphabet[i]
        let index = (i + shift) % alphabet.length

        if (index < 0) {
            charsMap[char] += alphabet.length
        }

        charsMap[char] = alphabet[index]
    }
    return charsMap
}

let alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j']
let a = getCipherMap(alphabet, 2)
