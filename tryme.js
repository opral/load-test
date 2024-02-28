async function tryme() {
	console.log("yo tryme")

	process.on("SIGINT", () => {
    console.log(' bye bye ')
		process.exit(0)
	})

	await new Promise((resolve) => {
		setTimeout(resolve, 1000 * 60 * 60 * 24)
	})
}

await tryme()