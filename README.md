# Web scraper

The following repo is my approach to scraping data given a specific URL

## File Structure

The listing URLs are outputted by the scrapeListingUrls.ts file

```bash
scrapeListing.ts = 'listings.json'
```

The listing URLs are then taken by the index.ts file and outputted in the listingsData.json file
The output is an array of objects containing a structure defined within the index.ts file.

```bash
'listings.json' => index.ts = 'listingsData.json'
```
