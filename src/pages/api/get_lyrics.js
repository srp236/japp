import chromium from "chrome-aws-lambda";
import addData from '@/src/firebase/firestore/addData'

let myLyrics;
let myKanji;

// async function getLyricRef(songName, artistName) {
//   try {
//     const url = `https://utaten.com/search?sort=popular_sort_asc&artist_name=${artistName}&title=${songName}&beginning=&body=&lyricist=&composer=&sub_title=&tag=&show_artists=1`;
//     const browser = await chromium.puppeteer.launch()
//     const page = await browser.newPage();
//     await page.goto(url, {waitUntil:'load', timeout: 0})
//     const lyricRef = await page.evaluate(() => {
//         return document.querySelector(".searchResult__title").querySelector("a").getAttribute("href")
//     })
//     await browser.close()
//     return lyricRef
//   } catch (error) {
//       console.log(error)
//       return 1
//   }
// }

async function getLyrics(url) {
    const browser = await chromium.puppeteer.launch()
    const page = await browser.newPage();
    await page.goto(url, {waitUntil:'load', timeout: 0})

    const lyrics = await page.evaluate(() => {
        const lrcDOM = document.querySelector(".hiragana")
        const rubyList = lrcDOM.querySelectorAll(".ruby")
            
        for (let i = 0; i < rubyList.length; i++) {
            rubyList[i].removeChild(rubyList[i].querySelector(".rt"))
        }
        
        lrcDOM.insertAdjacentHTML(
            "beforeend",
            `<textarea id="copyZone" style="position: absolute; right: -9999px">${lrcDOM.innerText}</textarea>`
        )
        return document.querySelector("#copyZone").textContent
    })

    await browser.close()
    return lyrics
}

const isKanji = (str) => {
    const kanjiList = []
    for(const kan in str)
    {
      if ((str[kan] >= "\u4e00" && str[kan] <= "\u9faf") || (str[kan] >= "\u3400" && str[kan] <= "\u4dbf"))
      {
        if(!kanjiList.includes(str[kan])){
          kanjiList.push(str[kan])
        }
      }
    }
    return kanjiList
}

const storeLyrics = async (songName, artistName) => {
    const data = {[songName]:{kanji:myKanji, lyrics:myLyrics}}
    const { result, error } = await addData('lyrics', artistName, data)
    
    if (error) {
        return console.log(error)
    }
}

async function Lyrics(songName, artistName, lyricRef) {
    try {
        let baseUrl = 'https://utaten.com'
        // const lyric_ref = await getLyricRef(songName, artistName)
        // if(lyric_ref == 1){
        //   return 1
        // }
        var url = baseUrl + lyricRef
        myLyrics = await getLyrics(url)
        myKanji = isKanji(myLyrics)
        
        await storeLyrics(songName, artistName)
        return 0
    } catch (error) {
        return error
    }
}

export default function handler(req, res) {
    const song = req.body.songName
    const artist = req.body.artistName
    const ref = req.body.lyricRef
    Lyrics(song, artist, ref).then((value)=>{res.json({data:value})})
}