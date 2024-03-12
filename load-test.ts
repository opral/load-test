/* eslint-disable no-restricted-imports */
/* eslint-disable no-console */
import { openRepository } from "@lix-js/client"
import { loadProject } from "@inlang/sdk"

import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"
import { throttle } from "throttle-debounce"
import childProcess from "node:child_process"
import fs from "node:fs/promises"

import _debug from "debug"
const debug = _debug("load-test")

const exec = promisify(childProcess.exec)

const throttleEventLogs = 2000

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const projectPath = join(__dirname, "project.inlang")

const mockServer = "http://localhost:3000"

const cli = `PUBLIC_SERVER_BASE_URL=${mockServer} pnpm inlang`
const translateCommand = cli + " machine translate -f --project ./project.inlang"

const messageDir = join(__dirname, "locales", "en")
const messageFile = join(__dirname, "locales", "en", "common.json")

export async function runLoadTest(
	messageCount: number = 1000,
	translate: boolean = true,
	subscribeToMessages: boolean = true,
	subscribeToLintReports: boolean = false,
	watchMode: boolean = false
) {
	debug("load-test start" + (watchMode ? " - watchMode on, ctrl C to exit" : ""))

	if (translate && !(await isMockRpcServerRunning())) {
		console.error(
			`Please start the mock rpc server with "MOCK_TRANSLATE=true pnpm --filter @inlang/server dev"`
		)
		return
	}

	process.on("SIGINT", () => {
		debug("bye bye")
		process.exit(0)
	})

	await generateMessageFile(1)

	debug("opening repo and loading project")
	const repo = await openRepository(__dirname, { nodeishFs: fs })
	const project = await loadProject({ repo, projectPath })

	debug("subscribing to project.errors")
	project.errors.subscribe((errors) => {
		if (errors.length > 0) {
			debug(`load=test project errors ${errors[0]}`)
		}
	})

	if (subscribeToMessages) {
		debug("subscribing to messages.getAll")
		let messagesEvents = 0
		const logMessagesEvent = throttle(throttleEventLogs, (messages: any) => {
			debug(`messages changed event: ${messagesEvents}, length: ${messages.length}`)
		})
		project.query.messages.getAll.subscribe((messages) => {
			messagesEvents++
			logMessagesEvent(messages)
		})
	}

	if (subscribeToLintReports) {
		debug("subscribing to lintReports.getAll")
		let lintEvents = 0
		const logLintEvent = throttle(throttleEventLogs, (reports: any) => {
			debug(`lint reports changed event: ${lintEvents}, length: ${reports.length}`)
		})
		project.query.messageLintReports.getAll.subscribe((reports) => {
			lintEvents++
			logLintEvent(reports)
		})
	}

	debug(`generating ${messageCount} messages`)
	await generateMessageFile(messageCount)

	if (translate) {
		debug("translating messages with inlang cli")
		await exec(translateCommand, { cwd: __dirname })
	}

	debug("load-test done - " + (watchMode ? "watching for events" : "exiting"))

	if (watchMode) {
		await new Promise<void>((resolve) => {
			setTimeout(resolve, 1000 * 60 * 60 * 24)
		})
	}
}

async function generateMessageFile(messageCount: number) {
	await exec(`mkdir -p ${messageDir}`)
	const messages: Record<string, string> = {}
	for (let i = 1; i <= messageCount; i++) {
		messages[`message_key_${i}`] = `Generated message (${i})`
	}
	await fs.writeFile(messageFile, JSON.stringify(messages, undefined, 2), "utf-8")
}

async function isMockRpcServerRunning(): Promise<boolean> {
	try {
		const req = await fetch(`${mockServer}/ping`)
		if (!req.ok) {
			console.error(`Mock rpc server responded with status: ${req.status}`)
			return false
		}
		const res = await req.text()
		const expected = `${mockServer} MOCK_TRANSLATE\n`
		if (res !== expected) {
			console.error(
				`Mock rpc server responded with: ${JSON.stringify(res)} instead of ${JSON.stringify(
					expected
				)}`
			)
			return false
		}
	} catch (error) {
		console.error(`Mock rpc server error: ${error} ${causeString(error)}`)
		return false
	}
	return true
}

function causeString(error: any) {
	if (typeof error === "object" && error.cause) {
		if (error.cause.errors?.length) return error.cause.errors.join(", ")
		if (error.cause.code) return "" + error.cause.code
		return JSON.stringify(error.cause)
	}
	return ""
}