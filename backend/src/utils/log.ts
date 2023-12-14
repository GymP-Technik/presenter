import * as log from "https://deno.land/std@0.167.0/log/mod.ts";

const logFile = `logs/presenter.log`;

await Deno.mkdir(logFile.split("/").slice(0, -1).join("/"), { recursive: true });

const formatter = (logRecord: log.LogRecord) => {
	const date = logRecord.datetime.toLocaleDateString("en-DE", {
		weekday: "short",
		year: "numeric",
		month: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

	return `[${date.replace(",", "")}] [${logRecord.levelName}] ${logRecord.msg}`;
};

const rotatingHandler = new log.handlers.RotatingFileHandler("DEBUG", {
	filename: logFile,
	maxBytes: 10485760,
	maxBackupCount: 30,
	formatter: formatter,
});

await log.setup({
	handlers: {
		console: new log.handlers.ConsoleHandler("DEBUG", {
			formatter: formatter,
		}),
		file: rotatingHandler,
	},

	loggers: {
		// configure default logger available via short-hand methods above.
		default: {
			level: "DEBUG",
			handlers: ["console", "file"],
		},
	},
});

// Flush top file every 10 sec
setTimeout(() => {
	rotatingHandler.flush();
}, 10 * 1000);

// Flush on crash, or exit
globalThis.addEventListener("unload", () => {
	log.info(`Quitting`);
});

Deno.addSignalListener("SIGINT", () => {
	log.info(`Interrupted`);
	Deno.exit();
});

export default log;
