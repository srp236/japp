import {addData, createDoc, updateDataArray, updateData, updateMultiDocs} from '@/src/firebase/firestore/addData'
import {delField, delDoc} from '@/src/firebase/firestore/delField'
import { Layout, Row, Col, Button, Card, Dropdown, message, Image, Modal, Tag, Input } from 'antd';
import { docsQuery, getAllDocs, getData, getDocuQuery } from '../firebase/firestore/getData';
import { MoreOutlined, CaretRightOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'

const { Footer } = Layout;
let items = [{label:'new +',id:'New Card', data:[], key:0}];

export const flashCardDoc = async (uid) => {
	let list1 = [{label:'new +',id:'New Card', data:[], key:0}]
	let temp = []
	const request = await getData('users', uid)
	const response = request.result.data()['flashcardRefs']
	const request2 = await getDocuQuery('kanji', 'flashcardRef', 'in', response)		
	response.forEach(element => {
		request2.forEach(element2 => {
			if(element2.flashcardRef == element){
				temp.push(element2.kanji)
			}
		});
		let i=list1.length
		list1.push({label:element, id:element, key:i, data:temp})
		temp = []
	});
	items = list1
	list1 = [{label:'new +',id:'New Card', data:[]}]
}

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

export const storeCard = async (set, kanjichar) => {
	await updateData('kanji', kanjichar, 'flashcardRef', set)
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

export const FlashSets = (user) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const router = useRouter()
  const handleOk = (e) => {
		let x = document.forms["createsetform"]["setTitle"].value
		if (x == "") {
      alert("Enter name for new flashcard set");
      return false;
    } 
		updateDataArray('users', user.user, "flashcardRefs", x, 'add').then(e=>{
			setIsModalOpen(false)
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
				<h3>
					<PlusOutlined /> Create Set
				</h3>
			</Button>
			<Modal title="Create New Flashcard Set" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
				<form name='createsetform' style={{display:'flex', flexDirection:'column'}}>
					<label>Title of Set</label>
					<input type='text' id='setTitle' name='setTitle'/>
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
					<a onClick={()=>{router.push({pathname:`/study/${element.id}`})}}><CaretRightOutlined/></a>
				</div>
				<FlashDrop set={element} 	user={user}></FlashDrop>
			</Card>
		))
	)
}

export function FlashDrop({set, user}) {
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
							getDocuQuery('kanji','flashcardRef','==', set.id).then(e=>{
								updateMultiDocs('kanji',e,'flashcardRef',null)
								updateDataArray('users', user.user, "flashcardRefs", set.id, 'remove').then(e=>{
									router.reload()
								})
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

export function Drop({kanji, icon, dataaa, uid}) {
  const [messageApi, contextHolder] = message.useMessage();
  return (
    <>
    {contextHolder}
    <Dropdown
      overlayStyle={{width:'fit-content'}}
      menu={{items:items, selectable:true, onClick:(e)=>{
				if(dataaa){
					if(items[e.key].label == 'none'){
						confirm(`Are you sure you want to remove the list from all flashcard sets?`)?updateMultiDocs('kanji', dataaa, 'flashcardRef', null):console.log('user canceled')
					} else {
						updateMultiDocs('kanji', dataaa, 'flashcardRef', items[e.key].label)
					}
				} else {
					if(items[e.key].label == 'new +'){
						console.log('creating a new set')
					} else {
						if((items[e.key].data).indexOf(kanji) > -1){
							confirm(`Are you sure you want to remove ${kanji} from "${items[e.key].label}"`)?storeCard(null, kanji):console.log('user canceled')
							flashCardDoc(uid)
						} else {
							messageApi.open({content:`${kanji} moved to "${items[e.key].label}"`, type:'success', duration:3});
							storeCard(items[e.key].label,kanji)
							flashCardDoc(uid)
						}
					}
				}
			}}} trigger={['click']}>
      {icon}
    </Dropdown>
    </>
  )
}



export const KanjiList = ({info, uid}) => {
	const [curr, setCurrent] = useState('');
	const [inputValue, setInputValue] = useState('')
	const inputRef = useRef(null);

	useEffect(() => {
    if (curr !='') {
      inputRef.current?.focus();
    }
  }, [curr]);

	return (
		<>
		<Drop kanji={''} icon={<Button>+ Add all to Set</Button>} dataaa={info}></Drop>
		{info.map(item=>(
			<>
			<Card key={info.indexOf(item)} style={{width:'500px', margin:'20px 0px'}}>
				<div style={{display:'flex', flexDirection:'row', width:'500px', height:'150px'}}>
					<h2 onClick={()=>{
						let color
						item.bl = !item.bl
						item.bl? color = 'yellow': color='white'
						const div = document.querySelector('pre')
						div.innerHTML = div.innerHTML.replaceAll(item.kanji,()=>{
							return `<span style="background-color: ${color}">${item.kanji}</span>`
						})
					}}
				className={styles.cardL}
				>{item.kanji}</h2>
					<div className={styles.cardR} >
						<p>JLPT level:{item.jlpt}</p>
						<p>kun-yomi: {(item.kunyomi).join('、')}</p>
						<p>On Yomi: {(item.onyomi).join('、')}</p>
						<p>Meaning: {(item.meaning).join(', ')}</p>
						<p>Tags: {item.tags?[(item.tags).map((tag)=>{
							return (
								<span key={tag}style={{display: 'inline-block'}}>
									<Tag closable onClose={()=>{updateDataArray('kanji',item.kanji,'tags',tag, 'remove')}}>{tag}</Tag>
								</span>
							)
						})]:<div id='new tags'>{tagList}</div>}
						{
						curr == item.kanji?<Input type='text' size='small' style={{width:'78px'}} value={inputValue} onChange={(e)=>{setInputValue(e.target.value)}} 
						onPressEnter={()=>{
							(item.tags).push(inputValue),
							setCurrent('')
							setInputValue(''),
							updateDataArray('kanji',item.kanji,'tags',inputValue, 'add')
						}}
						/>:<Tag id='mt' onClick={()=>{setCurrent(item.kanji)}} style={{borderStyle:'dashed'}}><PlusOutlined/> New Tag</Tag>
						}
						</p>
					</div>
				</div>
				<Drop kanji={item.kanji} icon={<MoreOutlined onClick={(e) => e.preventDefault()} style={{color:'rgb(230,26,57)', fontSize:'20px', position:'absolute', right:'10px', top:'20px'}}/>} dataaa='' uid={uid}></Drop>
			</Card>
			</>
		))}
		</>
	)
}

export function CommonFoot() {
	return (
		<Footer className={styles.footerStyle}>
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
			<Image alt='' height={60} className={styles.footerImg} src="/images/logo.png"/>
		</Footer>
	)
}