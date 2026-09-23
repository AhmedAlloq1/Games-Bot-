"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInt = randomInt;
exports.pick = pick;
exports.shuffle = shuffle;
function randomInt(min, max) {
    const low = Math.ceil(min);
    const high = Math.floor(max);
    return Math.floor(Math.random() * (high - low + 1)) + low;
}
function pick(items) {
    if (items.length === 0)
        throw new Error("Cannot pick from an empty list");
    return items[randomInt(0, items.length - 1)];
}
function shuffle(items) {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
        const swapIndex = randomInt(0, index);
        [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
    }
    return result;
}
