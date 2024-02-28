// @ts-nocheck
/*

This logs all key presses to the console
Throttled keypresses are logged again, prefixed with "==> "

Notice that there is always a final throttled keypress
this captures the "last" throttled event before a quiet period

credit: https://gist.github.com/newvertex/d78b9c6050d6a8f830809e6e528d5e96
*/

import { throttle } from "throttle-debounce"
import readline from "node:readline"

console.log("keylogger - throttled to 1s - ctrl C to exit")

readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) process.stdin.setRawMode(true)

const throttledKeyPressHandler = throttle(500, (_, key) => {
	console.log("==> " + key?.sequence)
})

const keypressHandler = (_, key) => {
	console.log(key?.sequence)
	if (key && key.ctrl && key.name === "c") {
		process.exit()
	}
}

process.stdin.on("keypress", keypressHandler)
process.stdin.on("keypress", throttledKeyPressHandler)

await new Promise((resolve) => {
	setTimeout(resolve, 1000 * 60 * 60 * 24)
})
