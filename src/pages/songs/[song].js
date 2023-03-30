import { getData, getDocuQuery } from '@/src/firebase/firestore/getData'
import { Layout, Spin, Card, Drawer, Modal, Popover } from 'antd';
import React, { useState, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';
import { KanjiList, CommonFoot, flashCardDoc } from '@/src/utils/methods';
import { useAuth } from '@/src/utils/AuthUserContext';
const { Header } = Layout;
import { MenuOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons';

export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [selec, setSelec] = useState();
  const [info, setInfo] = useState([]);
  const [open, setOpen] = useState(false);
  const { authUser, loading } = useAuth();
  let name ='', uid ='', hi = undefined
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
  
  function getText() {
    setSelec(window.getSelection())
    let sel = window.getSelection()
    // let num = Math.floor(Math.random()*100)
    // let spn = document.createElement("a")
    // spn.setAttribute("href",`${num}/${title}/${sel}`)
    // let ob = document.createElement("span")
    // ob.appendChild(document.createTextNode(sel))
    // spn.append(ob)
    // let range = sel.getRangeAt(0)
    // range.deleteContents()
    // range.insertNode(spn)
    // let qw = sel.deleteFromDocument()
    // console.log(qw)

    // if(!sel.toString().trim().length){
    //   return
    // }
    // let tool = document.getElementById('tltp')
    let rect = sel.getRangeAt(0).getBoundingClientRect()
    document.getElementById('tltp').style.visibility = "visible";
    document.getElementById('tltp').style.top = `${rect.bottom + 10}px`;
    document.getElementById('tltp').style.left = `${rect.x}px`;
    // const div = document.querySelector('pre')
    // div.classList.toggle("tlt p")
    // div.innerHTML = div.innerHTML.replace(sel,()=>{
    //   return `<a style={{display:'inline'}} >${sel}</a>`
    // });    
    // yu.insertAdjacentHTML("afterend","<div style={{backgroundColor:'red'}}>hiya</div>");
    // let rect = sel.getRangeAt(0).getBoundingClientRect()
    // document.getElementById('tltp').style.visibility = "visible";
    // document.getElementById('tltp').style.right = `${rect.y}px`;
    // document.getElementById('tltp').style.bottom = `${rect.top}px`;
    // const tooltip = document.getElementById('tltp')
    // tooltip.style.display = "block"
    // <Tooltip title='thththth'style={{position:'absolute', top:rect.bottom, left:rect.y}} ></Tooltip>
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
          <MenuOutlined onClick={()=>{setOpen(true)}} />
      </Header>
      <div className={styles.bar}></div>
      <div className={styles.lbody}>
        <Card style={{width:'40%'}}>
          <h1 id='til'>{title}</h1>
          <h4>{artist}</h4>
          <div className={styles.ty} id='lyrics' style={{fontSize:'15px', marginTop:'20px'}} 
          onPointerDown={()=>{document.getElementById('tltp').style.visibility = "hidden";}} 
          onPointerUp={()=>{getText();}}></div>
        </Card> 
        <Card id='may' style={{width:'80%',overflow:'scroll'}}>
          <KanjiList info={info} uid={uid}/>
        </Card>
        <button id='tltp' className={styles.tltp}>
          <DeleteOutlined onClick={()=>{}}/>
          <FileAddOutlined onClick={()=>{}}/>
          <button style={{backgroundColor:'pink'}} className={styles.highlightOptions} onClick={()=>{
            let num = Math.floor(Math.random()*100)
            let spn = document.createElement("a")
            spn.setAttribute("href",`#${num}`)
            // spn.setAttribute("href",`${title}/${num}`)
            let ob = document.createElement("span")
            ob.classList.add(`${styles.gotta}`)
            ob.appendChild(document.createTextNode(selec))
            spn.append(ob)
            let range = selec.getRangeAt(0)
            range.deleteContents()
            range.insertNode(spn)
            
            let note = document.getElementById("notes")
            let puh = document.createElement("div")
            puh.setAttribute("id", `${num}`)
            puh.append(selec)
            note.insertAdjacentElement("beforeend", puh)
            document.getElementById('tltp').style.visibility = "hidden";
            //somewhere here i need to add to db under some notes section for the song specific to the user
          }}></button>
          <button style={{backgroundColor:'grey'}} className={styles.highlightOptions} onClick={()=>{
            const div = document.querySelector('pre')
            div.innerHTML = div.innerHTML.replace(selec,()=>{
              return `<span style="background-color: grey">${selec}</span>`
            }); 
          }}></button>
        </button>
      </div>
      <Drawer title="jisho_drawer" placement='right'>
        <iframe title='dictionary' style={{width:'35%'}} src='https://jisho.org/'></iframe>
      </Drawer>
      <Card id='notes'></Card>
      <CommonFoot/>
      </Layout>
    </Spin>
    </>
  );
}
//height:document.getElementById('lyrics').offsetHeight + 50

