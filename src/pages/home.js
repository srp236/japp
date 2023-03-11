import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from '@/src/styles/Home.module.css'
import logo from '../../public/images/logo_red.png'
import logo2 from '../../public/images/logo.png'
import React, { useState } from 'react'
import { Layout, Row, Col, Spin, notification, Card } from 'antd';
import { getData } from '@/src/firebase/firestore/getData'
import { isKanji, getKanjiInfo, KanjiList, FlashSets } from '../utils/methods'

const { Header, Footer, Content } = Layout;

async function getSong(title, artist) {
  try {
    const request = await getData('lyrics', artist)
    const response = request.result.data()[title]
    return response;
  } catch (error) {
    console.log('artist not in database')
    return undefined
  }
}

async function getLyricRef(songName, artistName) {
  const data = {
    songName: songName,
    artistName: artistName,
  }
  const JSONdata = JSON.stringify(data)
    const endpoint = '/api/get_ref'
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSONdata,
    }
    
    const response = await fetch(endpoint, options)
    const result = await response.json()

    if(result.data != 1){
      console.log(result.data)
      return result.data
    } else {
      return 1
    }
}

export default function Home() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [kcard, setkcard] = useState(false);
  const router = useRouter()
  let list2 = []

  const openNotificationWithIcon = (type) => {
    api[type]({
      message: 'Error',
      description:
        'Song not avaialbe. Please try another request',
    });
  };

  const handleSubmit = async (event) => {
    setLoading(true)
    event.preventDefault()

    let x = document.forms["songForm"]["songName"].value;
    let y = document.forms["songForm"]["artistName"].value;
    if (x == "" || y == "") {
      alert("Please complete all fileds");
      setLoading(false)
      return false;
    } 
    const data = {
      songName: event.target.songName.value,
      artistName: event.target.artistName.value,
    }

    const temp = await getSong(data.songName, data.artistName)
    let temp2;

    if(temp !== undefined){
      router.push({pathname:`/songs/${data.songName}`, query: {title:data.songName, artist:data.artistName, fstat:0}})
    } else if ((temp2 = await getLyricRef(data.songName, data.artistName)) !== 1) {
      router.push({pathname:`/songs/${data.songName}`, query: {title:data.songName, artist:data.artistName, fstat:temp2}})
    } else {
      setLoading(false)
      openNotificationWithIcon('error')      
    }
  }

  const extractK = async (event) => {
    setLoading(true)
    event.preventDefault()

    let x = document.forms["extractForm"]["userText"].value;
    if (x == "") {
      alert("Please enter text to extract");
      setLoading(false)
      return false;
    } 

    const list = isKanji(event.target.userText.value)
    list2 = await getKanjiInfo(list)
    setkcard(list2)
    setLoading(false)
  }

  return <>
  {contextHolder}
    <Head>
      <title>だんだん</title>
      <meta name="description" content="Generated by create next app" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout>
      <Header className={styles.headerStyle} style={{backgroundColor:'white'}}>
        <Image alt='logo' height={50} src={logo} />
      </Header>
      <div className={styles.bar}></div>
      <Content>
        <Spin spinning={loading}>
          <Card className={styles.card}>
            <h1>Search a Song</h1>
            <form className={styles.songForm} name='songForm' onSubmit={handleSubmit}>
              <label>Song Name</label>
              <input type='text' id='songName' name='songName'/>
              <label>Artist Name</label>
              <input type='text' id='artistName' name='artistName'/>
              <button type='submit'>Submit</button>  
            </form>            
          </Card>
          <Card className={styles.card}>
            <h1>Kanji Extractor 3000</h1>
            <form className={styles.songForm} name='extractForm' onSubmit={extractK}>
              <label>Text</label>
              <input type='text' id='userText' name='userText'/>
              <button type='submit'>Submit</button>  
            </form>
            <div className={styles.repo}>
              {kcard?<KanjiList info={kcard}/>:<div></div>}
            </div>
          </Card>
          <Card className={styles.card}>
            <h1>FlashCard Sets</h1>
            <FlashSets/>
          </Card>
          {/* <div className={styles.space}></div> */}
        </Spin>
      </Content>
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
        <Image alt='' height={60} className={styles.footerImg} src={logo2}/>
      </Footer>
    </Layout>
  </>
}
