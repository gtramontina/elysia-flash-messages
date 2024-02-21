import { Elysia } from "elysia";

type Level = "info" | "success" | "warning" | "error";

export const flashMessages = new Elysia({
	name: "@gtramontina.com/elysia-flash-messages",
}).derive(({ cookie: { flash } }) => {
	const availableMessages = flash.value ?? {};
	flash.remove();

	const add = (type: Level, message: string) => {
		const newMessages = flash.value ?? {};
		newMessages[type] = [...(newMessages[type] ?? []), message];
		flash.set({
			maxAge: 30,
			expires: undefined,
			value: newMessages,
			secure: true,
			httpOnly: true,
		});
	};

	const get = (type: Level) => {
		return availableMessages[type] ?? [];
	};

	return { flash: { get, add } };
});
