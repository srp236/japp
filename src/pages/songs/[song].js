// import Layout from '../../../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'
import { Layout, Row, Col, Spin, Card, Checkbox } from 'antd';
import styles from '@/src/styles/Home.module.css'
import logo from '../../../public/images/logo_red.png'
import { useRouter } from "next/router"
import React, { useState, useEffect } from 'react'
import { LinkedinFilled, StarOutlined, StarFilled, LeftOutlined } from '@ant-design/icons';
import addData from '@/src/firebase/firestore/addData'
import getData from '@/src/firebase/firestore/getData'
import delField from '@/src/firebase/firestore/delField'

const { Header, Footer, Content } = Layout;

//   const storeCard = async (set, kanjichar, meaning) => {
//     const data = {[kanjichar]:{kanji: kanjichar, def: meaning}}
//     const { result, error } = await addData('flashcards', set, data)
//     if (error) {
//         return console.log(error)
//     } else {
//       console.log('card added to FS')
//     }
// }
//   const delCard = async (set, kanjichar) => {
//     const data = kanjichar
//     const { result, error } = await delField('flashcards', set, data)
//     if (error) {
//         return console.log(error)
//     } else {
//       console.log('card removed')
//     }
// }

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
    return (
      info.map(item=>(
        <Card className={styles.card}>
          <div className={styles.star}><Checkbox className={styles.ckbox} onChange={(e)=>{
            e.target.checked?storeCard('samp', item.kanji, item.meaning):delCard('samp', item.kanji)
          }}></Checkbox></div>
          {/* <Checkbox onChange={onChange}></Checkbox> */}
          <div className={styles.star} onClick={(e)=>{
            storeCard('samp',item.kanji, item.meaning)

          }}><StarOutlined style={{fontSize:'20px'}} /></div>
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
        <Image alt='logo' height={50} src={logo} />
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
          <pre id='lyrics' style={{fontSize:'15px'}}></pre>
        </Card> 
        <Card id='kr' style={{width:'33%',height:'1300px',overflow:'scroll'}}>
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