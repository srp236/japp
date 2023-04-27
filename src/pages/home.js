import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from '@/src/styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import { Layout, Spin, notification, Card, Button, AutoComplete } from 'antd';
import { getData, getAllDocID, getDocuQuery, getAllDocs } from '@/src/firebase/firestore/getData'
import { isKanji, getKanjiInfo, KanjiList, flashCardDoc, FlashSets, CommonFoot } from '../utils/methods'
import { useAuth } from '../utils/AuthUserContext'
import {Potta_One} from 'next/font/google'
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import firebase_app from "../firebase/config"
import { getAuth } from 'firebase/auth'
import app from '../firebase/config'
import { updateMultiDocs, createMultiDocs } from '../firebase/firestore/addData'

const db = getFirestore(firebase_app)
const pottaone = Potta_One({
  subsets:['latin'],
  weight: ['400']
})

const { Header, Content } = Layout;

async function getSong(title, artist) {
  try {
    const request = await getData('lyrics', artist)
    const response = request.data()[title]
    return response;
  } catch (error) {
    console.log('artist or song not in database')
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

let options = []
async function getTags(uid) {
  let opt = []
  const request = await getData('users',uid)
  // if(request.length > 0){
  if(request){
    const userTags = request.result.data()['tags']
  userTags.map(tag=>{
    options.push({value: tag})
  })
  opt = [...new Set(options)]
  options = opt
  }
  
}

export default function Home() {
  const [api, contextHolder] = notification.useNotification();
  const [sloading, setsLoading] = useState(true);
  const [kcard, setkcard] = useState(false);
  const [tags, setTags] = useState(false);
  const [lt, setlt] = useState([]);
  const router = useRouter()
  const { authUser, loading } = useAuth();
  const auth = getAuth(app);
  let list2 = [], optt = [], name = '', uid =''
  authUser?[name=authUser.name, uid = authUser.uid]:null

  const openNotificationWithIcon = (type) => {
    api[type]({
      message: 'Error',
      description:
        'Song not avaialbe. Please try another request',
    });
  };

  const handleSubmit = async (event) => {
    setsLoading(true)
    event.preventDefault()

    let x = document.forms["songForm"]["songName"].value;
    let y = document.forms["songForm"]["artistName"].value;
    if (x == "" || y == "") {
      alert("Please complete all fileds");
      setsLoading(false)
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
      setsLoading(false)
      openNotificationWithIcon('error')      
    }
  }

  const extractK = async (event) => {
    setsLoading(true)
    let list1 = [], list2 = [], list3 = [], l2 = []
    event.preventDefault()

    let x = document.forms["extractForm"]["userText"].value;
    if (x == "") {
      alert("Please enter text to extract");
      setsLoading(false)
      return false;
    } 
    const list = isKanji(x)

    let test = await getAllDocID('kanji')
    list.forEach(element => {
      if(test.indexOf(element) > -1){
        list1.push(element)
      } else {
        list2.push(element)
      }
    });

    //for already existing kanji
    list1.forEach(async element => {
      let knj = await getData('kanji', element)
      list3.push(knj.data())
    });

    //for new kanji
    l2 = await getKanjiInfo(list2)
    l2.forEach(element => {
      list3.push(element)
    });

    setkcard(list3)
    setsLoading(false)
    
    createMultiDocs(l2,null,null,'')
    ///chnage logic herere plzzzzllzlzlzzl for card info
  }
  useEffect(()=>{
    if(!loading && !authUser){
      router.push('/')
    } 
    if(authUser){
      name = authUser.name
      uid = authUser.uid
      flashCardDoc(authUser.uid).then(e=>{
        getTags(uid)
        setsLoading(false)
      })
    }
  },[authUser,loading])

  return (
  <>
    {contextHolder}
    <Head>
    <title>だんだん</title>
    <meta name="description" content="Generated by create next app" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.ico" />
    </Head>
    <Layout>
      <Header className={styles.headerStyle} style={{backgroundColor:'white'}}>
        <Image alt='logo' height={50} width={120} src='/images/logo_red.png' />
        <Button onClick={()=>{auth.signOut();router.push('/')}} >Log Out</Button>
      </Header>
      <div className={styles.bar}></div>
      <Content>
        <Spin spinning={sloading}>
          <h1>ようこそ {name}!</h1>
          <Button onClick={async ()=>{
            let l = await getAllDocID('kanji')
            console.log(l.length)
          }}>len</Button>
          <div>
            <Card>
              <AutoComplete
              style={{ width: 200 }}
                options={options}
                placeholder='Search by tags'
                filterOption={(inputValue, option)=>
                option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onSelect={ async (value)=>{
                  let temp_list = []
                  const q = query(collection(db,"kanji"), where("tags", "array-contains", value))
                  const querySnapshot = await getDocs(q)
                  console.log(value)
                  setTags(querySnapshot.docs)
                  console.log(tags)
                  querySnapshot.forEach((doc) => {
                    temp_list.push({[doc.id]:doc.data()})
                    console.log(doc.id, "=>", doc.data())
                  });
                  setTags(temp_list)
                }}
              />
              <div id='tag_results'>
                {tags?<KanjiList info={tags}/>:<div></div>}
              </div>
            </Card>
          </div>
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
            <form className={styles.songForm} name='extractForm' onSubmit={extractK} >
              <textarea rows='5' style={{width:'500px', height:'100px', textAlign:'start', resize:'none', }} type='text' id='userText' name='userText' placeholder='Enter text to have the kanji extracted...'/>
              <button type='submit'>Submit</button>  
            </form>
            <div className={styles.homeCard}>
              {kcard?<KanjiList info={kcard} uid={uid}/>:<div></div>}
            </div>
          </Card>
          <Card className={styles.card}>
            <h1>Flashcard Study Sets</h1>
            <div className={styles.homeCard}>
              <FlashSets user={uid} />
            </div>
          </Card>
        </Spin>
      </Content>
      <CommonFoot/>
    </Layout>
    </>
  )
}
