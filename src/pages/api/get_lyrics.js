import chromium from "chrome-aws-lambda";
import { addData, createMultiDocs} from '@/src/firebase/firestore/addData'
import { getKanjiInfo } from "@/src/utils/methods";
import { getAllDocID } from "@/src/firebase/firestore/getData";

let myLyrics, myKanji, kanjiInfoList;
let newKanji = [], oldKanji = [];

async function getLyrics(url) {
  console.log('ready...start!')
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
  console.log('done')
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

const alreadyExist = async (list) => {
  let test = await getAllDocID('kanji')
  list.forEach(element => {
    if(test.indexOf(element) > -1){
      oldKanji.push(element)
    } else {
      newKanji.push(element)
    }
  });
}

const storeLyrics = async (songName, artistName) => {
  const data = {[songName]:{lyrics:myLyrics}}
  const { result, error } = await addData('lyrics', artistName, data)
  
  if (error) {
    return console.log(error)
  }
}

async function Lyrics(songName, artistName, lyricRef) {
  try {
    let baseUrl = 'https://utaten.com'
    var url = baseUrl + lyricRef
    myLyrics = await getLyrics(url)
    await storeLyrics(songName, artistName)
    myKanji = isKanji(myLyrics)
    await alreadyExist(myKanji)
    kanjiInfoList = await getKanjiInfo(newKanji)
    await createMultiDocs(kanjiInfoList, songName, artistName, oldKanji)
    return 0
  } catch (error) {
    console.log(error)
    return error
  }
}

export default function handler(req, res) {
  const song = req.body.songName
  const artist = req.body.artistName
  const ref = req.body.lyricRef
  Lyrics(song, artist, ref).then((value)=>{res.json({data:value})})
}