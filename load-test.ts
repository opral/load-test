import { openRepository } from "@lix-js/client"
import { loadProject } from "@inlang/sdk"

import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import childProcess from "node:child_process"
import { promisify } from "node:util"

const exec = promisify(childProcess.exec)

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const repoI18next = __dirname
const projectPath = join(repoI18next, "project.inlang")

const mockServer = "http://localhost:3000"

await checkIfServerIsRunning()
await clean()
await runLoadTest()

async function runLoadTest() {
	console.log("opening repo and loading project")
	const repo = await openRepository(repoI18next, { nodeishFs: fs })
	const project = await loadProject({ repo, projectPath })
	project.errors.subscribe((errors) => {
		if (errors.length > 0) {
					console.log("project errors", errors[0])
		}
	})
	project.query.messages.getAll.subscribe((messages) => {
			console.log("messages changed", messages.length)
	})
	await generateSourceMessageFile(1000)
}

async function generateSourceMessageFile(count: number) {
	const messages: Record<string, string> = {}
	console.log(`Generating ${count} messages`)
	for (let i = 1; i <= count; i++) {
		messages[`message_key_${i}`] = `Generated message (${i})`
	}
	await fs.writeFile(
		join(repoI18next, "locales", "en", "common.json"),
		JSON.stringify(messages, undefined, 2),
		"utf-8"
	)
	console.log(`Finished generating ${count} messages`)
}

async function checkIfServerIsRunning() {
	const { stdout } = await exec(`curl ${mockServer}/ping`)
	console.log(stdout)
}

async function clean() {
	console.log("clean")
	await exec("pnpm clean", { cwd: repoI18next })
}

