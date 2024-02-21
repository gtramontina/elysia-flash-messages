import { Elysia } from "elysia";
import { flashMessages } from "../index";

new Elysia()
	.use(flashMessages)
	.get("/", ({ set, flash }) => {
		flash.add("success", "Success message 1");
		flash.add("success", "Success message 2");
		flash.add("warning", "Warning message 1");
		flash.add("info", "Info message 1");
		flash.add("info", "Info message 2");
		flash.add("error", "Error message 1");

		set.redirect = "/flash-messages";
	})
	.get("/flash-messages", ({ flash }) => {
		return {
			success: flash.get("success"),
			warning: flash.get("warning"),
			info: flash.get("info"),
			error: flash.get("error"),
		};
	})
	.listen(8080, () => {
		console.info("Listening on http://localhost:8080");
	});
