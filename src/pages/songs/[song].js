import { getNotes, getData, getDocuQuery } from '@/src/firebase/firestore/getData'
import { Layout, Spin, Card, Drawer, Modal, Popover, Tooltip, Tag } from 'antd';
import React, { useState, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';
import { KanjiList, CommonFoot, flashCardDoc } from '@/src/utils/methods';
import { useAuth } from '@/src/utils/AuthUserContext';
const { Header } = Layout;
import { MenuOutlined, DeleteOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import { addData, addNote } from '@/src/firebase/firestore/addData';

export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [selec, setSelec] = useState();
  const [lyricH, setLyricH] = useState();
  const [info, setInfo] = useState([]);
  const [aR, setAR] = useState();
  const { authUser, loading } = useAuth();
  let name ='', uid ='', hi = undefined, tpo
  authUser?[name=authUser.name, uid = authUser.uid]:null

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
      document.getElementById('lyrics').innerText = response.lyrics
      setLyricH(document.getElementById('lyrics').offsetHeight + 200)
      const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
      setInfo(request2)
      setsLoading(false)
    } else {
      const res = await scrapeData(fstat, title, artist)
      if(res == 0){
        const request = await getData('lyrics', artist)
        const response = request.result.data()[title]
        document.getElementById('lyrics').innerText = response.lyrics
        const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
        setInfo(request2)
        setsLoading(false)
      }
    }
  }

  async function getSnotes() {
    let bh = await getNotes("users", uid, "notes",`${title} by ${artist}`)
    tpo = bh.data()
    console.log(tpo)
    // let ruh = bh.data()
    // ruh.forEach(element => {
    //   console.log(element)
    // });
    // console.log(bh.data())
    // let rh = bh.data()
    // rh.map(element => {
    //   console.log(element)
    // });
    // const div = document.querySelector('pre')
    // div.innerHTML = div.innerHTML.replaceAll(,()=>{
    //   return `<span style="background-color: ${color}">${item.kanji}</span>`
    // })

  }

  // getSnotes( )
  
  function getText() {
    if(window.getSelection().toString()=='\n' || window.getSelection().toString().length == 0){
      return
    }
    let selection = window.getSelection()
    setSelec(selection)
    let rect = selection.getRangeAt(0).getBoundingClientRect()
    document.getElementById('tltp').style.visibility = "visible";
    document.getElementById('tltp').style.top = `${window.scrollY + rect.bottom + 10}px`;
    document.getElementById('annon').style.top = `${window.scrollY + rect.top - 120}px`;
    document.getElementById('tltp').style.left = `${rect.x}px`;  
  }

  const createAnnotation = () => {
    let r = (Math.random() + 1).toString(36).substring(5)
    let selection = selec.getRangeAt(0)
    let a = document.createElement("a")
    a.href = r
    a.id = r
    selection.surroundContents(document.createElement("span"))
    selection.surroundContents(a)
    document.getElementById('annon').style.visibility = "visible"
    document.getElementById('tltp').style.visibility = "hidden"
    setAR(r)
  }

  const cancelAnnotation = (event) => {
    event.preventDefault()
    document.getElementById('annon').style.visibility = "hidden"
    document.getElementById(aR).replaceWith(...document.getElementById(aR).querySelector("span").childNodes)
  }

  const handleAnn = async (event) => {
    event.preventDefault()
    setsLoading(true)
    try {
      let x = document.forms["createAnn"]["note"].value;
      if (x == "") {
        alert("Enter a note before saving.. .");
        return false;
      }
      let data= {[aR]:{'id':aR, 'note' :x, 'text':document.getElementById(aR).querySelector("span").innerText}}
      await addNote("users",uid,"notes",`${title} by ${artist}`,data)
      document.getElementById('annon').style.visibility = "hidden"
      setsLoading(false)
    } catch (error) {
      alert("error occured, please try again")
    }
  }

  useEffect(()=>{
    setsLoading(true)
    if(!loading && !authUser){
      router.push('/')
    }
    if(authUser){
      name = authUser.name
      uid = authUser.uid
      flashCardDoc(uid).then(e=>{
        getLyricsKanji()
      })
    }
  },[router.query, authUser,loading])

  return (
    <>
    <Spin size='large' spinning={sloading}>
      <Head>
      <title>歌詞</title>
      </Head>
      <Layout>
      <Header className={styles.headerStyle} style={{backgroundColor:'white'}}>
        <div onClick={()=>{router.push('/home')}}>
          <Image alt='logo' height={50} width={120} src='/images/logo_red.png' />
        </div>
      </Header>
      <div className={styles.bar}></div>
      <div className={styles.lbody}>
        <Card style={{width:'60%'}}>
          <h1 id='til'>{title}</h1> 
          <h4>{artist}</h4>
          <div style={{display:"flex", flexDirection:"row"}}>
            <div className={styles.ty} id='lyrics' style={{width:'50%',fontSize:'15px', marginTop:'20px'}} 
            onPointerDown={()=>{document.getElementById('tltp').style.visibility = "hidden";}} 
            onMouseUp={()=>{getText()}}></div>
            <div style={{width:'50%'}}>
              <Card id='annon' className={styles.annon}>
                <div>
                  <button style={{backgroundColor:'pink'}} className={styles.highlightOptions}></button>
                  <button style={{backgroundColor:'grey'}} className={styles.highlightOptions}></button>
                  <button style={{backgroundColor:'blue'}} className={styles.highlightOptions}></button>
                </div>
                <hr/>
                <form name='createAnn' onSubmit={handleAnn}>
                  <textarea id='note' name='note' style={{width:"100%", resize:"vertical"}} ></textarea>
                  <button type='submit'>Save</button>
                  <button onClick={cancelAnnotation}>Cancel</button>
                </form>
              </Card>
            </div>
          </div>
        </Card> 
        <Card id='may' style={{width:'40%',overflowX:'hidden', overflowY:"scroll" ,height:lyricH}}>
          <KanjiList info={info} uid={uid}/>
        </Card>
        <button id='tltp' className={styles.tltp}>
          Create Annotation
          <button style={{backgroundColor:'pink'}} className={styles.highlightOptions} onClick={createAnnotation}></button>
        </button>
      </div>
      <CommonFoot/>
      </Layout>
    </Spin>
    </>
  );
}
//height:document.getElementById('lyrics').offsetHeight + 50

