browser proxy build with bun. 
proxy and protect your headless chrome

## Usage
````ts
await puppeteer.connect({
		browserWSEndpoint: "wss://browserproxy.fly.dev?token=this_is_a_secret_token",
})
````