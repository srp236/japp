import addData from '@/src/firebase/firestore/addData'
import delField from '@/src/firebase/firestore/delField'
import { Layout, Row, Col, Spin, Card, Dropdown, message } from 'antd';
import { getAllDocs, docsQuery } from '../firebase/firestore/getData';
import { MoreOutlined } from '@ant-design/icons';
import firebase_app from "../firebase/config";
import { getFirestore, collection, onSnapshot, query } from "firebase/firestore";

const db = getFirestore(firebase_app)

export const isKanji = (str) => {
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

export const storeCard = async (set, kanjichar, meaning) => {
  const data = {[kanjichar]:{kanji: kanjichar, def: meaning}}
  const { result, error } = await addData('flashcards', set, data)
  if (error) {
      return console.log(error)
  }
}

export const delCard = async (set, kanjichar) => {
  const data = kanjichar
  const { result, error } = await delField('flashcards', set, data)
  if (error) {
      return console.log(error)
  }
}

export async function getKanjiInfo(list) {
	let i = 0, k, s, myList = []
	while (i< (list).length) {
		k=list[i]
		await fetch(`https://kanjiapi.dev/v1/kanji/${k}`).then(r => r.json()).then(r=> s=r);
		myList.push({kanji:s.kanji, jlpt:s.jlpt, kun:s.kun_readings, onr:s.on_readings, meaning: s.meanings, key: i, bl:false})
		i++
	}
	return myList
}

export function Dropdwn({kanji, meaning, items}) {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
    {contextHolder}
    <Dropdown
      overlayStyle={{width:'fit-content'}}
      menu={{items:items, selectable:true, onClick:(e)=>{
        if(items[e.key].label == 'new +'){
          console.log('creating a new set')
          console.log(e)
        } else {
          getData('flashcards',items[e.key].label).then((res)=>{
            if(res.result.data()[kanji] == undefined){
              storeCard(items[e.key].label,kanji,meaning)
              messageApi.open({content:`${kanji} added to "${items[e.key].label}"`, type:'success', duration:3});
            }
            else{
              confirm(`Are you sure you want to remove ${kanji} from "${items[e.key].label}"`)?delCard(items[e.key].label,kanji):console.log('user canceled')
            }
          })}}}} trigger={['click']}>
      <MoreOutlined onClick={(e) => e.preventDefault()} style={{color:'rgb(230,26,57)', fontSize:'20px', position:'absolute', right:'10px', top:'20px'}}/>
    </Dropdown>
    </>
  )
}

let test = [];
const items = [];

const flashCardDoc = async () => {
  const request = await getAllDocs('flashcards')
  request.map((it=>{
    let i=items.length
    items.push({label:it.id, key: i,})
  }))
}

flashCardDoc()

const q = query(collection(db, 'flashcards'))
const unsubscribe = onSnapshot(q, (querySnapshot) => {
  querySnapshot.forEach((doc) => {
    test.push({id:doc.id, data:Object.keys(doc.data())});
  })
})

export function Drop({kanji, meaning}) {
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
    {contextHolder}
    <Dropdown
      overlayStyle={{width:'fit-content'}}
      menu={{items:items, selectable:true, onClick:(e)=>{
        if(items[e.key].label == 'new +'){
          console.log('creating a new set')
          console.log(e)
        } else {
          test.forEach(element => {
            if(element.id == items[e.key].label){
              if((element.data).indexOf(kanji) > -1){
                confirm(`Are you sure you want to remove ${kanji} from "${items[e.key].label}"`)?delCard(items[e.key].label,kanji):console.log('user canceled')
                test = []
              } 
              else {
                storeCard(items[e.key].label,kanji,meaning)
                messageApi.open({content:`${kanji} added to "${items[e.key].label}"`, type:'success', duration:3});
                test =[]
              }
            }
          });
          }}}} trigger={['click']}>
      <MoreOutlined onClick={(e) => e.preventDefault()} style={{color:'rgb(230,26,57)', fontSize:'20px', position:'absolute', right:'10px', top:'20px'}}/>
    </Dropdown>
    </>
  )
}

export const KanjiList = ({info, styles}) => {
	return (
		info.map(item=>(
			<Card className={styles.card} key={item.key}>
				<div className={styles.kanjiCard}>
					<h2 onClick={()=>{
						let color
						item.bl = !item.bl
						item.bl? color = 'yellow': color='white'
						const div = document.querySelector('pre')
						div.innerHTML = div.innerHTML.replaceAll(item.kanji,()=>{
							return `<span style="background-color: ${color}">${item.kanji}</span>`
						})
					}} 
					className={styles.cardL}>{item.kanji}</h2>
					<div className={styles.cardR}>
						<p>JLPT level:{item.jlpt}</p>
						<p>On Yomi: {(item.onr).join('、')}</p>
						<p>kun-yomi: {(item.kun).join('、')}</p>
						<p>Meaning: {(item.meaning).join(', ')}</p>
					</div>
					<Drop kanji={item.kanji} meaning={item.meaning}></Drop>
				</div>
			</Card>
		))
	)
}
