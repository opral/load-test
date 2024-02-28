// @ts-nocheck
/*

This logs all key presses to the console
Debounced keypresses are logged again, prefixed with "==> "

Notice that with the default { atBegin: false } option,
only the final "debounced" keypress is logged at the end,
and No "debounced" keypress is logged at the start.

credit: https://gist.github.com/newvertex/d78b9c6050d6a8f830809e6e528d5e96
*/

import { debounce } from "throttle-debounce"
import readline from "node:readline"

console.log("keylogger - debounced to 1s - ctrl C to exit")

readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) process.stdin.setRawMode(true)

const debouncedKeyPressHandler = debounce(1000, (_, key) => {
	console.log("==> " + key?.sequence)
}, { atBegin: false })

const keypressHandler = (_, key) => {
	console.log(key?.sequence)
	if (key && key.ctrl && key.name === "c") {
		process.exit()
	}
}

process.stdin.on("keypress", keypressHandler)
process.stdin.on("keypress", debouncedKeyPressHandler)

await new Promise((resolve) => {
	setTimeout(resolve, 1000 * 60 * 60 * 24)
})
