import { getData, getDocuQuery } from '@/src/firebase/firestore/getData'
import { Layout, Spin, Card } from 'antd';
import logo from '../../../public/images/logo_red.png'
import React, { useState, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';
import { KanjiList, CommonFoot } from '@/src/utils/methods';
import { useAuth} from '@/src/utils/AuthUserContext';
const { Header } = Layout;

export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const { authUser, loading } = useAuth();

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

  const getLyricsKanji = async () => {
    if(fstat == 0) {
      const request = await getData('lyrics', artist)
      const response = request.result.data()[title]
      document.getElementById('lyrics').innerHTML = response.lyrics
      const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
      setInfo(request2)
      setsLoading(false)
    } else {
      const res = await scrapeData(fstat, title, artist)
      if(res == 0){
        const request = await getData('lyrics', artist)
        const response = request.result.data()[title]
        document.getElementById('lyrics').innerHTML = response.lyrics
        const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
        setInfo(request2)
        setsLoading(false)
      }
    }
  }

  useEffect(()=>{
    setsLoading(true)
    if(!loading && !authUser){
      router.push('/')
    }
  },[router.query, authUser,loading])

  useEffect(()=>{
    getLyricsKanji()
  },[])

  // let name =''
  // let uid =''
  // if(authUser){
  //   name = authUser.name
  //   uid = authUser.uid
  //   flashCardDoc(uid)
  // }

  return (
    <>
    <Spin size='large' spinning={sloading}>
      <Head>
      <title>歌詞</title>
      </Head>
      <Layout>
      <Header className={styles.headerStyle} style={{backgroundColor:'white'}}>
        <div onClick={()=>{router.push('/home')}}>
          <Image alt='logo' height={50} src={logo} />
        </div>
      </Header>
      <div className={styles.bar}></div>
      <div className={styles.lbody}>
        <Card style={{width:'30%',}}>
          <h1>{title}</h1>
          <h4>{artist}</h4>
          <pre id='lyrics' style={{fontSize:'15px', marginTop:'20px'}}></pre>
        </Card> 
        <Card id='may' style={{width:'40%',overflow:'scroll',}}>
          <KanjiList info={info}/>
        </Card>
        <iframe title='dictionary' src='https://jisho.org/' ></iframe>
        {/* <iframe title='jisho' style={{width:'35%'}} src='https://jisho.org/'/> */}
      </div>
      <CommonFoot/>
      </Layout>
    </Spin>
    </>
  );
}
//height:document.getElementById('lyrics').offsetHeight + 50

