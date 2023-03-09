import chromium from "chrome-aws-lambda";

async function getLyricRef(songName, artistName) {
  try {
    const url = `https://utaten.com/search?sort=popular_sort_asc&artist_name=${artistName}&title=${songName}&beginning=&body=&lyricist=&composer=&sub_title=&tag=&show_artists=1`;
    const browser = await chromium.puppeteer.launch()
    const page = await browser.newPage();
    await page.goto(url, {waitUntil:'load', timeout: 0})
    const lyricRef = await page.evaluate(() => {
        return document.querySelector(".searchResult__title").querySelector("a").getAttribute("href")
    })
    await browser.close()
    return lyricRef
  } catch (error) {
      return 1
  }
}

export default function handler(req, res) {
  const song = req.body.songName
  const artist = req.body.artistName
  getLyricRef(song, artist).then((value)=>{res.json({data:value})})
}