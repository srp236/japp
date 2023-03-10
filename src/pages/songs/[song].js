import { getData, getAllDocs} from '@/src/firebase/firestore/getData'
import { Layout, Row, Col, Spin, Card, Dropdown, message } from 'antd';
import delField from '@/src/firebase/firestore/delField'
import logo from '../../../public/images/logo_red.png'
import addData from '@/src/firebase/firestore/addData'
import { MoreOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';

const { Header, Footer } = Layout;
const items = [];

const flashCardDoc = async () => {
  const request = await getAllDocs('flashcards')
  request.map((it=>{
    let i=items.length
    items.push({label:it, key: i,})
  }))
}

flashCardDoc()

export function Dropdwn({kanji, meaning}) {
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

const storeCard = async (set, kanjichar, meaning) => {
  const data = {[kanjichar]:{kanji: kanjichar, def: meaning}}
  const { result, error } = await addData('flashcards', set, data)
  if (error) {
      return console.log(error)
  }
}

const delCard = async (set, kanjichar) => {
  const data = kanjichar
  const { result, error } = await delField('flashcards', set, data)
  if (error) {
      return console.log(error)
  }
}

export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState([]);

  async function scrapeData(ref, songN, artistN) {
    const data = {
      songName: songN,
      artistName: artistN,
      lyricRef: ref
    }
    const JSONdata = JSON.stringify(data)
    const endpoint = '/api/get_lyrics'
    const options = {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSONdata,
    }
    const request = await fetch(endpoint, options)
    const response = await request.json()
  
    if(response.data == 0){
      return 0
    } else {
      return 1
    }
  }

 async function getKanjiInfo(list) {
    let i = 0, k, s, myList = []
    while (i< (list).length) {
      k=list[i]
      await fetch(`https://kanjiapi.dev/v1/kanji/${k}`).then(r => r.json()).then(r=> s=r);
      myList.push({kanji:s.kanji, jlpt:s.jlpt, kun:s.kun_readings, onr:s.on_readings, meaning: s.meanings, key: i, bl:false})
      i++
    }
    return myList
  }

  const KanjiList = () => {
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
            <Dropdwn kanji={item.kanji} meaning={item.meaning}></Dropdwn>
          </div>
        </Card>
      ))
    )
  }

  const getLyricsKanji = async () => {
    if(fstat == 0) {
      const request = await getData('lyrics', artist)
      const response = request.result.data()[title]
      document.getElementById('lyrics').innerHTML = response.lyrics
      const kanjiInfo = await getKanjiInfo(response.kanji)
      setInfo(kanjiInfo)
      setLoading(false)
    } else {
      const res = await scrapeData(fstat, title, artist)
      if(res == 0){
        const request = await getData('lyrics', artist)
        const response = request.result.data()[title]
        document.getElementById('lyrics').innerHTML = response.lyrics
        const kanjiInfo = await getKanjiInfo(response.kanji)
        setInfo(kanjiInfo)
        setLoading(false)
      }
    }
  }

  useEffect(()=>{
    getLyricsKanji()
  },[router.query])

  return (
    <>
    <Spin size='large' spinning={loading}>
      <Head>
      <title>だんだん</title>
      </Head>
      <Layout>
      <Header className={styles.headerStyle} style={{backgroundColor:'white'}}>
        <div onClick={()=>{router.push('/home')}}>
          <Image alt='logo' height={50} src={logo} />
        </div>
        <div>
          <div></div>
          <div></div>
        </div>
      </Header>
      <div className={styles.bar}></div>
      <div className={styles.lbody}>
        <Card style={{width:'33%',}}>
          <h1>{title}</h1>
          <h4>{artist}</h4>
          <pre id='lyrics' style={{fontSize:'15px', marginTop:'20px'}}></pre>
        </Card> 
        <Card id='may' style={{width:'33%',overflow:'scroll',}}>
          <KanjiList/>
        </Card>
        <iframe title='jisho' style={{width:'33%'}} src='https://jisho.org/'></iframe>
      </div>
      <Footer className={styles.footerStyle}>
        <Row>
          {/* <Col span={8}>temp</Col> */}
          {/* <Col span={8}>temp</Col> */}
          <Col span={8} offset={8} >temp</Col>
          <Col span={8}>
            <h3>Connect with Me</h3>
            <ul>
              <li>Github</li>
              <li>LinkedIN</li>
            </ul>
          </Col>
        </Row>
        <Image alt='' height={60} className={styles.footerImg} src={logo}/>
      </Footer>
      </Layout>
    </Spin>
    </>
  );
}

//height:document.getElementById('lyrics').offsetHeight + 50

