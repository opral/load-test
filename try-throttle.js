// @ts-nocheck
/*

This logs all key presses to the console
Throttled keypresses are logged again, prefixed with "==> "

Notice throttled keypress are logged at start, at each interval, and at the end.
The last event may have a delay, if events stopped in the middle of an interval.

credit: https://gist.github.com/newvertex/d78b9c6050d6a8f830809e6e528d5e96
*/

import { throttle } from "throttle-debounce"
import readline from "node:readline"

console.log("keylogger - throttled to 1s - ctrl C to exit")

readline.emitKeypressEvents(process.stdin)

if (process.stdin.isTTY) process.stdin.setRawMode(true)

const throttledKeyPressHandler = throttle(1000, (_, key) => {
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
