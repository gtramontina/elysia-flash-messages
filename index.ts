import { Elysia } from "elysia";

export type Level = "info" | "success" | "warning" | "error";
export type FlashWriter = { add: (type: Level, message: string) => void };
export type FlashReader = { get: (type: Level) => string[] };
export type FlashWriterContext = { flash: FlashWriter };
export type FlashReaderContext = { flash: FlashReader };
export type FlashContext = { flash: FlashWriter & FlashReader };

type Messages = { [K in Level]?: string[] };

class Flash {
	private readonly incoming: Messages;
	private outgoing: Messages | undefined = undefined;

	constructor(incoming: Messages) {
		this.incoming = incoming ?? {};
	}

	get(type: Level) {
		return this.incoming[type] ?? [];
	}

	add(type: Level, message: string) {
		this.outgoing = this.outgoing ?? {};
		this.outgoing[type] = [...(this.outgoing[type] ?? []), message];
	}

	outgoingMessages() {
		return this.outgoing;
	}
}

export const flashMessages = new Elysia({
	name: "@gtramontina.com/elysia-flash-messages",
})
	.derive(({ cookie }) => ({ flash: new Flash(cookie.flash.value) }))
	.mapResponse(({ cookie, flash }) => {
		cookie.flash.set({
			maxAge: flash.outgoingMessages() ? 30 : 0,
			expires: undefined,
			path: "/",
			value: flash.outgoingMessages(),
			secure: true,
			httpOnly: true,
		});
	});
