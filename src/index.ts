import { Hono } from "hono";
import { createBunWebSocket } from "hono/bun";
import type { ServerWebSocket } from "bun";
import puppeteer from "puppeteer-core";

const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

const app = new Hono();

const endpoints: string[] = [];

app.get(
	"/",
	upgradeWebSocket(async(c) => {
		const token = c.req.query("token");
		if (token !== process.env.TOKEN) {
			throw new Response("Unauthorized", { status: 401 });
		}
		if (endpoints.length === 0) {
			console.log("launching puppeteer")
			const brower = await puppeteer.launch({
				channel: "chrome",
				executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
				args: ["--no-sandbox", "--disable-setuid-sandbox"],
			})
			endpoints.push(brower.wsEndpoint())
		}
		const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
        const socket = new WebSocket(randomEndpoint)
        
		return {
			onOpen(evt, ws) {
				socket.onmessage = (evt) => {
                    ws.send(evt.data)
                }
			},
			onMessage(evt, ws) {
                socket.send(evt.data)
			},
		};
	}),
);

export default {
	fetch: app.fetch,
	websocket,
};
