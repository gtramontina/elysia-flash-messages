# Elysia Flash Messages

Elysia plugin to enable flash messages.

## Installation

```sh
bun add --exact @gtramontina.com/elysia-flash-messages
```

## Usage

```typescript
import { flashMessages } from "@gtramontina.com/elysia-flash-messages";
import { Elysia } from "elysia";

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

```

Please feel free to explore the [example](./example).
