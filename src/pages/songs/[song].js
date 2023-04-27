import { getNotes, getData, getDocuQuery } from '@/src/firebase/firestore/getData'
import { Layout, Spin, Card, Drawer, Tag } from 'antd';
import React, { useState, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';
import { KanjiList, CommonFoot, flashCardDoc } from '@/src/utils/methods';
import { useAuth } from '@/src/utils/AuthUserContext';
const { Header } = Layout;
import { MenuOutlined, DeleteOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import { updateDataArray, updateNoteArray, addNote } from '@/src/firebase/firestore/addData';

let hlp = {}, lyricH = '', selec = '', aR = '',tagList = [],annotationTags = []
export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const [txt, setTxt] = useState(undefined);
  // const [annotationTags, setannotationTags] = useState(undefined);
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
      console.log(request)
      const response = request.data()[title]
      document.getElementById('lyrics').innerText = response.lyrics
      lyricH = document.getElementById('lyrics').offsetHeight + 200
      const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
      setInfo(request2)
      setsLoading(false)
      getAnnotations()
    } else {
      const res = await scrapeData(fstat, title, artist)
      console.log(res)
      if(res == 0){
        const request = await getData('lyrics', artist)
        console.log(request)
        console.log(request.data())
        const response = request.data()[title]
        console.log(response)
        document.getElementById('lyrics').innerText = response.lyrics
        const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
        setInfo(request2)
        setsLoading(false)
      }
    }
  }

  async function getAnnotations() {
    let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
    const annotations = request.data()
    if(annotations){
      const annonKeys = Object.keys(annotations)
      const div = document.getElementById('lyrics').childNodes
      annonKeys.forEach(element => {
        console.log(div)
        const range = document.createRange()
        if(range){
          range.setStart(div.item(annotations[element].pos.start), annotations[element].pos.indexS)
          range.setEnd(div.item(annotations[element].pos.end), annotations[element].pos.indexE)
          if(range.toString().length != 0){
            let a = document.createElement("a")
            let span = document.createElement("span")
            a.id = element
            a.onclick = function () {
              document.getElementById('annon').style.visibility = "visible";
              document.getElementById('annon').style.top = `${window.scrollY + document.getElementById(this.id).getBoundingClientRect().top - 120}px`;
              let lm = []
              if(annotations[element].tags){
                annotations[element].tags.forEach(element2 => {
                  lm.push(<Tag closable onClose={()=>{updateNoteArray(`users/${uid}/notes/`,`${title} by ${artist}`,`${element}`,'tags', element2,'')}}>{element2}</Tag>)
                });
              }
              setTxt([annotations[element].note, lm])
            }
            document.getElementById('lyrics').replaceWith()
            range.surroundContents(span)
            range.surroundContents(a)
          }
        }
      })
    }
  }

  function getText() {
    if(window.getSelection().toString()=='\n' || window.getSelection().toString().length == 0){
      return
    }
    let selection = window.getSelection()
    let range = selection.getRangeAt(0)
    let lyrics = document.getElementById('lyrics').childNodes
    let nodeList = Array.from(lyrics)
    hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer), 'end':nodeList.indexOf(range.endContainer)}
    selec=selection
    let rect = selection.getRangeAt(0).getBoundingClientRect()
    document.getElementById('tltp').style.visibility = "visible";
    document.getElementById('tltp').style.top = `${window.scrollY + rect.bottom + 10}px`;
    document.getElementById('annon').style.top = `${window.scrollY + rect.top - 120}px`;
    document.getElementById('tltp').style.left = `${rect.x}px`;  
  } 

  const createAnnotation = () => {
    setTxt(undefined)
    let r = (Math.random() + 1).toString(36).substring(5)
    let selection = selec.getRangeAt(0)
    let a = document.createElement("a")
    a.id = r
    a.onclick = function () {
      document.getElementById('annon').style.visibility = "visible";
    }
    selection.surroundContents(document.createElement("span"))
    selection.surroundContents(a)
    document.getElementById('annon').style.visibility = "visible"
    document.getElementById('tltp').style.visibility = "hidden"
    aR=r
  }

  const cancelAnnotation = (event) => {
    event.preventDefault()
    setsLoading(true)
    document.getElementById('annon').style.visibility = "hidden"
    getLyricsKanji().then(e=>{
      setsLoading(false)
    })
  }

  const deleteAnnotation = (event) => {
    event.preventDefault()
    setsLoading(true)
    //make db call to dele te from notes
    document.getElementById('annon').style.visibility = "hidden"
    getLyricsKanji().then(e=>{
      setsLoading(false)
    })
  }
 
  const handleAnn = async (event) => {
    event.preventDefault()
    // setsLoading(true)
    try {
      let x = document.forms["createAnn"]["note"].value;
      if (x == "") {
        alert("Enter a note before saving. . .");
        return false;
      }
      setTxt(x)
      let data= {[aR]:{'id':aR, 'note' :x, 'pos':hlp, 'tags':tagList}}
      await addNote("users",uid,"notes",`${title} by ${artist}`, data)
      document.getElementById('annon').style.visibility = "hidden"
      // setsLoading(false)
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
        // setsLoading(false)
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
              onPointerDown={()=>{document.getElementById('annon').style.visibility = "hidden";
              document.getElementById('tltp').style.visibility = "hidden"}} 
              onMouseUp={()=>{getText()}}></div>
              <div style={{width:'50%'}}>
                {txt?
                <Card id='annon' className={styles.annon}>
                  <button onClick={()=>{setTxt(undefined)}}>edit</button>
                  <button onClick={()=>{}}>delete</button>
                  <p>{txt[0]}</p>
                  <div>{txt[1]} <Tag onClick={()=>{}} style={{borderStyle:'dashed'}}><PlusOutlined/> New Tag</Tag></div>
                </Card>:<Card id='annon' className={styles.annon}>
                  <form name='createAnn' onSubmit={handleAnn}>
                    <textarea id='note' name='note' style={{width:"100%", resize:"vertical"}} ></textarea>
                    <button type='submit'>Save</button>
                    <button onClick={cancelAnnotation}>Cancel</button>
                  </form>
                  <Tag onClick={()=>{}} style={{borderStyle:'dashed'}}><PlusOutlined/> New Tag</Tag>
                </Card>
                }
              </div>
            </div>
          </Card> 
          <Card id='may' style={{width:'40%',overflowX:'hidden', overflowY:"scroll" ,height:lyricH}}>
            <KanjiList info={info} uid={uid}/>
          </Card>
          <button id='tltp' onClick={createAnnotation} className={styles.tltp}>
            Create Annotation
          </button>
        </div>
      <CommonFoot/>
      </Layout>
    </Spin>
    </>
  );
}
