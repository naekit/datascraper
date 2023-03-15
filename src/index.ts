// check each url in listings.json then scrape the data from each url and write it to a JSON file
import puppeteer, { Browser, Puppeteer } from "puppeteer"
import fs from "fs"

type ListingData = {
	imageUrl?: string
	address?: string
	price?: {
		listingPrice: string
		annualTax: string
	}
	mainListingInfo?: {
		bedrooms: string
		bathrooms: string
		area: string
		outdoorSpace: boolean
	}
	listingAgent?: {
		name: string
		phone: string
	}
	listingCourtesyOf?: string
}

const preparePageForTests = async (page: any) => {
	// Pass the User-Agent Test.
	const userAgent =
		"Mozilla/5.0 (X11; Linux x86_64)" +
		"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36"
	await page.setUserAgent(userAgent)
}

const scrapeListing = async (
	url: string,
	page: any
): Promise<ListingData | null> => {
	try {
		await preparePageForTests(page)
		await page.goto(`https://www.corcoran.com${url}`, {
			waitUntil: "load",
			timeout: 0,
		})

		// extract the data from the page
		const data = await page.evaluate(() => {
			const imageUrl =
				Array.from(
					document.querySelectorAll(
						".ListingDetailSimpleCarousel__ImageContainer-sc-ba177043-2 img"
					)
				).map((el) => el.getAttribute("src"))[0] ?? ""
			const address =
				document.querySelector(
					".MainListingInfo__ListingTitle-sc-d88565d5-3"
				)?.textContent ?? ""
			const listingPrice =
				document.querySelector(".TextBase-sc-3b1caa46-0")
					?.textContent ?? ""
			const annualTax =
				document.querySelector(".MainListingInfo__Tax-sc-d88565d5-6")
					?.textContent ?? ""
			const bedrooms =
				document.querySelector(
					"[data-e2e-id='main-listing-info__flex-container__bedroom-info']"
				)?.textContent ?? ""
			// data-e2e-id="main-listing-info__flex-container__bathrooms"
			const bathrooms =
				document.querySelector(
					"[data-e2e-id='main-listing-info__flex-container__bathrooms']"
				)?.textContent ?? ""
			// main-listing-info__flex-container__squarefootage
			const area =
				document.querySelector(
					"[data-e2e-id='main-listing-info__flex-container__squarefootage']"
				)?.textContent ?? ""
			// main-listing-info__flex-container__outdoor-info
			const outdoorSpace = document.querySelector(
				"[data-e2e-id='main-listing-info__flex-container__outdoor-info']"
			)?.textContent
				? true
				: false
			const listingAgentName =
				document.querySelector(
					"[data-e2e-id='agent-card-small__agent-card-name']"
				)?.textContent ?? ""
			const listingAgentNumber =
				document.querySelector(
					"[data-e2e-id='agent-text__agent-data-term']"
				)?.textContent ?? ""
			// details-agents__listing-firm-name-wrapper
			const listingCourtesyOf =
				document.querySelector(
					"[data-e2e-id='details-agents__listing-firm-name-wrapper']"
				)?.textContent ?? ""

			return {
				imageUrl,
				address,
				price: {
					listingPrice,
					annualTax,
				},
				mainListingInfo: {
					bedrooms,
					bathrooms,
					area,
					outdoorSpace,
				},
				listingAgent: {
					name: listingAgentName,
					phone: listingAgentNumber,
				},
				listingCourtesyOf,
			}
		})

		return data
	} catch (error) {
		console.error(error)
		return null
	}
}

const main = async () => {
	const browser: Browser = await puppeteer.launch()
	const page = await browser.newPage()

	await preparePageForTests(page)

	const listings = JSON.parse(fs.readFileSync("listings.json", "utf-8"))

	console.log(listings[0].url, listings.length)

	const data: ListingData[] = []
	// const urlObj of listings
	for (let i = 5848; i < listings.length; i++) {
		const listingData = await scrapeListing(listings[i].url, page)
		if (listingData) {
			data.push(listingData)
			console.log(listingData.price?.listingPrice, {
				length: listings.length - i,
			})
		}
	}

	// Write the data to a JSON file
	fs.writeFileSync("listingsData.json", JSON.stringify(data))

	await browser.close()
}

main()
