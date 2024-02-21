import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { flashMessages } from "./index";

describe("Elysia Flash Messages Plugin", () => {
	it("sets a cookie with the desired messages", async () => {
		const response = await new Elysia()
			.use(flashMessages)
			.get("/", ({ flash }) => {
				flash.add("success", "Success message 1");
				flash.add("success", "Success message 2");
				flash.add("info", "Info message 1");
				flash.add("warning", "Warning message 1");
				flash.add("error", "Error message 1");
				flash.add("error", "Error message 2");
			})
			.handle(req("/"));

		const cookies = parseCookieJar(response);
		expect(cookies[0].HttpOnly).toBe(true);
		expect(cookies[0].Secure).toBe(true);
		expect(cookies[0]["Max-Age"]).toBe("30");
		expect(JSON.parse(decodeURIComponent(cookies[0].flash as string))).toEqual({
			success: ["Success message 1", "Success message 2"],
			info: ["Info message 1"],
			warning: ["Warning message 1"],
			error: ["Error message 1", "Error message 2"],
		});
	});

	it("makes messages available only for the next request", async () => {
		const app = new Elysia()
			.use(flashMessages)
			.get("/", ({ set, flash }) => {
				flash.add("success", "Success message 1");
				flash.add("success", "Success message 2");
				flash.add("info", "Info message 1");
				flash.add("warning", "Warning message 1");
				flash.add("error", "Error message 1");
				flash.add("error", "Error message 2");

				set.redirect = "/flash-messages";
			})
			.get("/flash-messages", ({ flash }) => {
				return {
					success: flash.get("success"),
					info: flash.get("info"),
					warning: flash.get("warning"),
					error: flash.get("error"),
				};
			});

		expect(await (await handleRedirects(app, req("/"))).json()).toEqual({
			success: ["Success message 1", "Success message 2"],
			info: ["Info message 1"],
			warning: ["Warning message 1"],
			error: ["Error message 1", "Error message 2"],
		});

		expect(
			await (await handleRedirects(app, req("/flash-messages"))).json(),
		).toEqual({
			success: [],
			info: [],
			warning: [],
			error: [],
		});
	});

	it("is configured", () => {
		expect(flashMessages.config.name).toBe(
			"@gtramontina.com/elysia-flash-messages",
		);
	});
});

// ---

const handleRedirects = async (
	app: { handle: (_: Request) => Promise<Response> },
	request: Request,
): Promise<Response> => {
	const response = await app.handle(request);
	if (response.status === 302) {
		const headers = new Headers();
		headers.set(
			"cookie",
			[response.headers.get("set-cookie"), request.headers.get("cookie")]
				.filter(Boolean)
				.join(", "),
		);
		return handleRedirects(
			app,
			req(response.headers.get("location") ?? "", { headers }),
		);
	}

	return response;
};

const req = (path: string, init: RequestInit = {}) =>
	new Request(new URL(path, "http://localhost").href, init);

const parseCookieJar = (response: Response) =>
	response.headers.getAll("set-cookie").map(parseCookie);

const parseCookie = (cookie: string) =>
	cookie.split(";").reduce(
		(acc, it) => {
			const [key, value] = it.split("=");
			acc[key.trim()] = value ?? true;
			return acc;
		},
		{} as Record<string, string | boolean>,
	);
