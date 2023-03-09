// import Layout from '../../../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'
import { Layout, Row, Col, Spin, Card, Menu, Dropdown, Space} from 'antd';
import styles from '@/src/styles/Home.module.css'
import logo from '../../../public/images/logo_red.png'
import { useRouter } from "next/router"
import React, { useState, useEffect } from 'react'
import { EditOutlined, MoreOutlined } from '@ant-design/icons';
import addData from '@/src/firebase/firestore/addData'
import { getData, getAllDocs} from '@/src/firebase/firestore/getData'
import delField from '@/src/firebase/firestore/delField'

const { Header, Footer, Content } = Layout;

const flashCardDoc = async (k,m) => {
  const request = await getAllDocs('flashcards',)
  request.map((it=>{
    let i=items.length
    items.push({label:it, key: i,})
  }))
}

const items = [
  // {
  //   type: 'divider',
  // },
  // {
  //   label:'new +',
  //   key:0
  // }
];

flashCardDoc()

export function Dropdwn({kanji, meaning}) {
  return (
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
            console.log('card added to set')
        }
        else{
          delCard(items[e.key].label,kanji)
          console.log('card removed from set')
        }
      })
      }
    }}}
    trigger={['click']}
  >
    <a onClick={(e) => e.preventDefault()}>
      <Space>
        <MoreOutlined style={{color:'red', fontSize:'20px', position:'absolute', right:'10px', top:'20px'}}/>
      </Space>
    </a>
  </Dropdown>
  )
}

const storeCard = async (set, kanjichar, meaning) => {
  const data = {[kanjichar]:{kanji: kanjichar, def: meaning}}
  const { result, error } = await addData('flashcards', set, data)
  if (error) {
      return console.log(error)
  } else {
    console.log('card added to FS')
  }
}

const delCard = async (set, kanjichar) => {
  const data = kanjichar
  const { result, error } = await delField('flashcards', set, data)
  if (error) {
      return console.log(error)
  } else {
    console.log('card removed')
  }
}

export default function Song() {
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 

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
      headers: {
        'Content-Type': 'application/json',
      },
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
    let i = 0;
    let myList = []
    let k
    let s
    while (i< (list).length) {
      k=list[i]
      await fetch(`https://kanjiapi.dev/v1/kanji/${k}`).then(r => r.json()).then(r=> s=r);
      myList.push({kanji:s.kanji, jlpt:s.jlpt, kun:s.kun_readings, onr:s.on_readings, meaning: s.meanings, value: 0})
      i++
    }
    return myList
  }

  const KanjiList = () => {
    const mItems = [
      {
        label: <a href="https://www.antgroup.com">1st menu item</a>,
        key: '0',
      },
      {
        label: <a href="https://www.aliyun.com">2nd menu item</a>,
        key: '1',
      },
      {
        type: 'divider',
      },
      {
        label: '3rd menu item',
        key: '3',
      },
    ];
    return (
      info.map(item=>(
        <Card className={styles.card}>
          <div className={styles.kanjiCard}>
            <h2 onClick={()=>{
              let color
              item.value++
              item.value == 1? color = 'yellow':color='white'
              const div = document.querySelector('pre')
              div.innerHTML = div.innerHTML.replaceAll(item.kanji,()=>{
                return `<span style="background-color: ${color}">${item.kanji}</span>`
              })
              if(item.value >1){
                item.value = 0
              }
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
    <Spin spinning={loading}>
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
      <h1>{title}</h1>
      <h4>{artist}</h4>
      <div className={styles.lbody}>
        <Card style={{width:'33%',}}>
          <pre id='lyrics' style={{fontSize:'15px',}}></pre>
        </Card> 
        <Card id='may' style={{width:'33%',overflow:'scroll',}}>
          <KanjiList/>
        </Card>
        <iframe title='jisho' style={{width:'33%'}} src='https://jisho.org/'></iframe>
      </div>
      <form>
        <input style={{height:'300px', width:'100%'}} type='text' id='songName' name='songName'/>
        <button type='submit'>Save</button>  
      </form>
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

