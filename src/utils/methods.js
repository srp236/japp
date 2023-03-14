import {addData, createDoc} from '@/src/firebase/firestore/addData'
import {delField, delDoc} from '@/src/firebase/firestore/delField'
import { Layout, Row, Col, Button, Card, Dropdown, message, Image, Modal } from 'antd';
import { getAllDocs } from '../firebase/firestore/getData';
import { MoreOutlined, CaretRightOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import styles from '@/src/styles/Home.module.css'

const { Footer } = Layout;

let items = [{id:'New Card', data:[]}];

export const flashCardDoc = async () => {
	let plz = [{id:'New Card', data:[]}]
  const request = await getAllDocs('flashcards')
  request.map((it=>{
		let i=plz.length
		if(!plz.includes({label:it.id, key: i,})){
			plz.push({label:it.id, key: i, id:it.id, data:it.data})
		}
  }))
	items = plz
	plz = []
}
flashCardDoc()

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

export const storeDoc = async (set, data) => {
	const result = await createDoc('flashcards', set, data)
	console.log(result)
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

export const FlashSets = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const router = useRouter()
  const handleOk = (e) => {
		let x = document.forms["createsetform"]["setTitle"].value
		let y = document.forms["createsetform"]["kanji"].value
		let z = document.forms["createsetform"]["meaning"].value
		if (x == "" || y == "" || z == "") {
      alert("Please complete all fileds");
      return false;
    } 
		const data = {[y]:{kanji: y, def: z}}
		createDoc('flashcards',x, data).then(e=>{
			setIsModalOpen(false);
			router.reload()
		})
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
	return (
		items.map(element => (
			element.id == 'New Card'?<div>
			<Button style={{borderStyle: 'dashed', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}} className={[styles.flashCard, styles.cardInt]} onClick={()=>{setIsModalOpen(true)}}>
			{/* <Button style={{borderStyle: 'dashed', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}} className={[styles.flashCard, styles.cardInt]} onClick={()=>{showModal; console.log('i pressed it')}}> */}
				<h3>
					<PlusOutlined /> Create Set
				</h3>
			</Button>
			<Modal title="Create New Flashcard Set" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
				<form name='createsetform' style={{display:'flex', flexDirection:'column'}}>
					<p>* you must add at least one card to the set to create it</p>
					<label>Title of Set</label>
					<input type='text' id='setTitle' name='setTitle'/>
					<label>Kanji</label>
					<input type='text' id='kanji' name='kanji'/>
					<label>Text</label>
					<input type='text' id='meaning' name='meaning'/>
					{/* add tags option for sorting also allow for image selection amongst specific options or user opload */}
				</form>
			</Modal>
			</div>
		:<Card className={styles.flashCard} cover={<div><Image preview={false} className={styles.ig} width={200} height={200} src='/images/profile.jpg' alt='flashcard cover'/>
			<div className={styles.igtext}>
					<h4 style={{fontWeight:'900'}} >{element.id}</h4>
					<p style={{fontStyle:'italic'}}>{element.data.length} card(s)</p>
				</div>
			</div>}>
				<div style={{display:'flex', flexDirection:'row', justifyContent:'center'}} >
					<a onClick={()=>{console.log('i clickked')}}><CaretRightOutlined/></a>
				</div>
				<FlashDrop set={element}></FlashDrop>
			</Card>
		))
	)
}

export function FlashDrop({set}) {
	const router = useRouter()
	const menuItems = [
		{
			label:'edit',
			key:0
		},
		{
			label:'delete',
			key:1
		}
	]
  return (
    <>
    <Dropdown
      overlayStyle={{width:'fit-content'}}
      menu={{items:menuItems, selectable:true, onClick:(e)=>{
					switch (menuItems[e.key].label) {
						case 'delete':
							delDoc('flashcards', set.id).then(e=>{
									router.reload()
								})
							break;
						case 'edit':
							console.log('hhi  edit')
							break;
					}
				}}} trigger={['click']}>
      <MoreOutlined onClick={(e) => e.preventDefault()} style={{color:'rgb(230,26,57)', fontSize:'20px', position:'absolute', right:'10px', top:'20px'}}/>
    </Dropdown>
    </>
  )
}

export function Drop({kanji, meaning, icon, dataaa}) {
  const [messageApi, contextHolder] = message.useMessage();
	let nDat = {}
  return (
    <>
    {contextHolder}
    <Dropdown
      overlayStyle={{width:'fit-content'}}
      menu={{items:items, selectable:true, onClick:(e)=>{
				if(dataaa){
					dataaa.forEach(element => {
						Object.assign(nDat, {[element.kanji]:{kanji: element.kanji, def: element.meaning}})
					});
					storeDoc(items[e.key].label,nDat)
				} else {
					if(items[e.key].label == 'new +'){
						console.log('creating a new set')
						console.log(e)
					} else {
						items.forEach(element => {
							if(element.id == items[e.key].label){
								if((element.data).indexOf(kanji) > -1){
									confirm(`Are you sure you want to remove ${kanji} from "${items[e.key].label}"`)?delCard(items[e.key].label,kanji):console.log('user canceled')
								} 
								else {
									storeCard(items[e.key].label,kanji,meaning)
									messageApi.open({content:`${kanji} added to "${items[e.key].label}"`, type:'success', duration:3});
								}
							}
						});
					}
				}
				}}} trigger={['click']}>
      {icon}
    </Dropdown>
    </>
  )
}

export const KanjiList = ({info}) => {
	return (
		<>
		<Drop kanji={''} meaning={''} icon={<Button>+ Add List to Set</Button>} dataaa={info}></Drop>
		{info.map(item=>(
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
						<p>kun-yomi: {(item.kun).join('、')}</p>
						<p>On Yomi: {(item.onr).join('、')}</p>
						<p>Meaning: {(item.meaning).join(', ')}</p>
					</div>
					<Drop kanji={item.kanji} meaning={item.meaning} icon={<MoreOutlined onClick={(e) => e.preventDefault()} style={{color:'rgb(230,26,57)', fontSize:'20px', position:'absolute', right:'10px', top:'20px'}}/>} dataaa=''></Drop>
				</div>
			</Card>
		))}
		</>
	)
}

export function CommonFoot() {
	return (
		<Footer className={styles.footerStyle}>			
		<Image alt='' height={60} className={styles.footerImg} src="/images/logo.png"/>
		<Row>
			<Col span={8} offset={8} >temp</Col>
			<Col span={8}>
				<h3>Connect with Me</h3>
				<ul>
					<li>Github</li>
					<li>LinkedIN</li>
				</ul>
			</Col>
		</Row>
	</Footer>
	)
}