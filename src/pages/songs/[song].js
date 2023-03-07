// import Layout from '../../../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'
import { Layout, Row, Col, Spin, Card } from 'antd';
import styles from '@/src/styles/Home.module.css'
import logo from '../../../public/images/logo_red.png'
import { useRouter } from "next/router"
import React, { useState, useEffect } from 'react'
import firebase_app from "../../firebase/config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const { Header, Footer, Content } = Layout;

export default function Song() {
  const [loading, setLoading] = useState(true);
  // const [lyrics, setLyrics] = useState('');
  const [kanji, setKanji] = useState('');
  const [info, setInfo] = useState([]);
  const router = useRouter()
  const {query: { title, artist }} = router

  async function getSong(songName, artistName) {
    const db = getFirestore(firebase_app)
    let docRef = doc(db, 'lyrics', artistName);
    try {
      const response = await getDoc(docRef);
      const result = response.data()[songName]
      return result;
    } catch (error) {
      console.log('artist not in database')
      return undefined
    }
  }
  
  async function scLyrics(songName, artistName) {
    const data = {
      songName: songName,
      artistName: artistName,
    }
    const JSONdata = JSON.stringify(data)
    const endpoint = '/api/get_lyrics'
    console.log(`this is the input ${JSONdata}`)
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    
    async function getDataFS() {
      const db = getFirestore(firebase_app)
      let docRef = doc(db, 'lyrics', artist);
      try {
        const response = await getDoc(docRef);
        const result = response.data()[title]
        return result;
      } catch (error) {
        console.log('error occured')
      }
    }
    const response = await fetch(endpoint, options)
    const result = await response.json()

    if(result === 0){
      return 0
    } else {
      return 1
    }
  }

  async function getKAPI(list){
    let i = 0;
    let myList = []
    let k
    let s
      while (i< (list).length) {
        k=list[i]
        await fetch(`https://kanjiapi.dev/v1/kanji/${k}`).then(r => r.json()).then(r=> s=r);
        myList.push({kanji:s.kanji, jlpt:s.jlpt, kun:s.kun_readings, onr:s.on_readings, meaning: s.meanings})
        i++
      }
      return myList
  }

  const DisplayKanji = (list) => {
    return (
      info.map(item => (
        <Card className={styles.card}>
          <div className={styles.kanjiCard}>
            <h2 className={styles.cardL}>{item.kanji}</h2>
            <div className={styles.cardR}>
              <p>JLPT level:{item.jlpt}</p>
              <p>On Yomi:{item.onr}</p>
              <p>kun yomi:{item.kun}</p>
              <p>Meanings: {JSON.stringify(item.meaning)}</p>
            </div>
          </div>
        </Card>
      ))
    )
  }

  const getData = async () => {
    const params = {
      songName: title,
      artistName: artist,
    }
    const fsData = await getSong(params.songName, params.artistName)
    if(fsData === undefined){
      const sc = await scLyrics(params.songName, params.artistName)
      if(sc === 0){
        console.log('Successfully retrieved lyrics! :) <3')
        let temp = await getSong(params.songName, params.artistName)
        setLyrics(temp.lyrics)
        setKanji(temp.kanji)
        document.getElementById('lyrics').innerHTML = lyrics
        document.getElementById('kanji').innerHTML = kanji
        setLoading(false)
        getKAPI(kanji)
      } else {
        console.log('There was an error :(')
        router.push({pathname:`/home`})
      }
    } else {
      let temp = await getSong(params.songName, params.artistName)
      // setLyrics(temp.lyrics)
      setKanji(temp.kanji)
      document.getElementById('lyrics').innerHTML = temp.lyrics
      // document.getElementById('lyrics').innerHTML = lyrics
      document.getElementById('kanji').innerHTML = kanji
      setLoading(false)
      const d = await getKAPI(kanji)
      setInfo(d)
      console.log(info)
    }
  }

  useEffect(()=>{
    getData()
    DisplayKanji(info)
  },[])

  return (
    <>
    <Spin spinning={loading}>
      <Head>
      <title>だんだん</title>
      </Head>
      <Layout>
      <Header className={styles.headerStyle} style={{backgroundColor:'purple'}}>
        <Image alt='logo' height={50} src={logo} />
        <div>
          <Link className={styles.bttnSpace} href={'/home/'}>Login</Link>
          <Link className={styles.bttnSpace} href={'/register/'}>Register</Link>
        </div>
      </Header>
        <div id='lyrics'></div>
        <div id='kanji'></div>
        <DisplayKanji/>
        <article>
        {/* <h1 className={utilStyles.headingXl}>{postData.title}</h1>
        <div className={utilStyles.lightText}>
        </div> */}
        {/* <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} /> */}
        </article>
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
