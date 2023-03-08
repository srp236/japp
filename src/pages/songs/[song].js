// import Layout from '../../../components/layout';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image'
import { Layout, Row, Col, Spin, Card, Grid } from 'antd';
import styles from '@/src/styles/Home.module.css'
import logo from '../../../public/images/logo_red.png'
import { useRouter } from "next/router"
import React, { useState, useEffect } from 'react'
import firebase_app from "../../firebase/config";
import { getFirestore, getDoc, doc } from "firebase/firestore";

const { Header, Footer, Content } = Layout;
export default function Song() {
  const [loading, setLoading] = useState(true);
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
        myList.push({kanji:s.kanji, jlpt:s.jlpt, kun:s.kun_readings, onr:s.on_readings, meaning: s.meanings, value: 0})
        i++
      }
      return myList
  }

  const DisplayKanji = (list) => {
    return (
      info.map(item => (
        <Card className={styles.card} onClick={()=>{
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
        }}>
          <div className={styles.kanjiCard}>
            <h2 className={styles.cardL}>{item.kanji}</h2>
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
      document.getElementById('lyrics').innerHTML = temp.lyrics
      const d = await getKAPI(temp.kanji)
      setInfo(d)
      console.log(info)
      setLoading(false)
    }
  }

  useEffect(()=>{
    getData()
  },[])
  
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
        <Card style={{width:'33%'}}>
          <pre id='lyrics' style={{fontSize:'15px'}}></pre>
        </Card>
        <Card style={{width:'33%'}}>
          <form>
            <input style={{height:'100vh', width:'100%'}} type='text' id='songName' name='songName'/>
            <button type='submit'>Save</button>  
          </form>
        </Card>
        <iframe style={{width:'33%'}} src='https://jisho.org/' ></iframe>
      </div>
        <Row>
          <DisplayKanji/>
        </Row>
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
