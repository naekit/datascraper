import fs from "fs"
import puppeteer, { Browser } from "puppeteer"

console.log(123)

const url =
	"https://www.corcoran.com/search/for-sale/location/northwest-harris-tx-17534130/regionId/119"

const preparePageForTests = async (page: any) => {
	// Pass the User-Agent Test.
	const userAgent =
		"Mozilla/5.0 (X11; Linux x86_64)" +
		"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36"
	await page.setUserAgent(userAgent)
	await page.screenshot({
		path: "./screenshot.jpg",
		type: "jpeg",
		fullPage: true,
	})
}

const main = async () => {
	const browser: Browser = await puppeteer.launch()
	const page = await browser.newPage()

	await preparePageForTests(page)

	await page.goto(url)
	await page.waitForSelector(".ListingCard__TopSectionLink-sc-e02a053c-22")
	await page.waitForSelector(".Paginator__NextButtonText-sc-44618f2a-8")

	let listings: any = []

	let nextButtonDisabled: any = false

	while (true) {
		const listingArray = await page.$$(
			".ListingCard__TopSectionLink-sc-e02a053c-22"
		)
		const data = await Promise.all(
			listingArray.map(async (listing) => ({
				url: await listing.evaluate((el) => el.getAttribute("href")),
			}))
		)
		listings = [...listings, ...data]

		const nextPageButton = await page.$(
			".Paginator__NextButtonText-sc-44618f2a-8.cbHbhW"
		)
		console.log(nextPageButton)
		console.log(data.length)

		nextButtonDisabled = await page.$(
			".Paginator__NextButtonText-sc-44618f2a-8.hacNxd"
		)
		console.log(nextButtonDisabled)
		if (nextButtonDisabled !== null) {
			break
		}

		await nextPageButton?.click()
		await page.waitForSelector(
			".ListingCard__TopSectionLink-sc-e02a053c-22"
		)
	}

	console.log(listings)

	// Write the data to a JSON file
	fs.writeFileSync("listings.json", JSON.stringify(listings))

	await browser.close()
}

main()
