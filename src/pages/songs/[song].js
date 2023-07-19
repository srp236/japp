import { getNotes, getData, getDocuQuery } from '@/src/firebase/firestore/getData'
import { Layout, Spin, Card, Drawer, Tag, Form, Input, Button } from 'antd';
import React, { useState, useEffect } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';
import { KanjiList, CommonFoot, flashCardDoc } from '@/src/utils/methods';
import { useAuth } from '@/src/utils/AuthUserContext';
const { Header } = Layout;
import { MenuOutlined, DeleteOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import { updateDataArray, updateNoteArray, addNote, updateMultiNotes} from '@/src/firebase/firestore/addData';

const { TextArea } = Input;
let hlp = {}, lyricH = '', selec = '', aR = '',tagList = [],annotationTags = []
export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const [txt, setTxt] = useState(undefined);
  const [nodel, setNodel] = useState();
  // const [annotationTags, setannotationTags] = useState(undefined) ;
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
      // console.log('fire call lyrics: ', request)
      const response = request.data()[title]
      document.getElementById('lyrics').innerText = response.lyrics
      lyricH = document.getElementById('lyrics').offsetHeight + 200
      const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
      // console.log('fire call kanji: ', request2)
      setInfo(request2)
      setsLoading(false)
      // if(document){
      //   setNodel(document.getElementById('lyrics').childNodes)
      //   console.log(nodel)
      // }
      getAnnotations()
    } else {
      const res = await scrapeData(fstat, title, artist)
      console.log(res)
      if(res == 0){
        const request = await getData('lyrics', artist)
        const response = request.data()[title]
        document.getElementById('lyrics').innerText = response.lyrics
        // const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
        // setInfo(request2)
        setsLoading(false)
      }
    }
  }

  async function getAnnotations() {
    try {
      let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
      const annotations = request.data()
      if(annotations){
        // console.log(annotations)
        const annonKeys = Object.keys(annotations)
        const div = document.getElementById('lyrics').childNodes
        let nodeList = Array.from(div)
        
        annonKeys.forEach(element => {
          // console.log("starting node: ", div[annotations[element].tst.start].textContent)
          const range = document.createRange()
          // console.log(nodeList[annotations[element].tst.start])
          //   let sindex, eindex
          if(range){
          range.setStart(nodeList[annotations[element].tst.start], annotations[element].tst.indexS)
          range.setEnd(nodeList[annotations[element].tst.end], annotations[element].tst.indexE)
          // range.setStart(div.item(annotations[element].tst.start), annotations[element].tst.indexS)
          // range.setEnd(div.item(annotations[element].tst.end), annotations[element].tst.indexE)
          // console.log(range)
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
              range.surroundContents(span)
              range.surroundContents(a)
            }
          }
          // console.log(nodeList)
        })
      }
    } catch (error) {
      console.log('someting happen')
      router.reload()
    }
  }

  function getText() {
    console.log(document.getElementById('lyrics').childNodes)
    if(window.getSelection().toString()=='\n' || window.getSelection().toString().length == 0){
      return
    }
    let selection = window.getSelection()
    let range = selection.getRangeAt(0)
    let lyrics = document.getElementById('lyrics').childNodes
    let nodeList = Array.from(lyrics)
    console.log(nodeList)
    nodeList.indexOf(range.startContainer) == nodeList.indexOf(range.endContainer)?console.log('yup'):console.log('nay')
    //If hlp.indexs is not 0, then need to subtract one more from 
    hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer), 'end':nodeList.indexOf(range.endContainer)}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer)-4, 'end':nodeList.indexOf(range.endContainer)-4}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':range.startOffset==0?nodeList.indexOf(range.startContainer)-4:nodeList.indexOf(range.startContainer)-5, 'end':range.startOffset==0?nodeList.indexOf(range.endContainer)-4:nodeList.indexOf(range.endContainer)-5}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer), 'end':nodeList.indexOf(range.endContainer),'txt':range.startContainer.textContent}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':range.startContainer.textContent, 'end':range.endContainer.textContent}
    // console.log(range)
    console.log(hlp)
    // console.log(lyrics)
    // hlp = {'snodee':range.startContainer.textContent}
    // hlp = {'snode':range.startContainer, 'eNode':range.endContainer}
    // console.log(typeof(range.endContainer))
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
    console.log(document.getElementById('lyrics').childNodes)
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
  
  const handleAnn = async (values) => {
    try {
      setTxt(values.note)
      let data= {[aR]:{'id':aR, 'note' :values.note, 'tags':tagList, 'tst':hlp}}
      // let data= {[aR]:{'id':aR, 'note' :values.note, 'pos':hlp, 'tags':tagList, 'tst':hlp}}
      await addNote("users",uid,"notes",`${title} by ${artist}`, data)
      document.getElementById('annon').style.visibility = "hidden"
      // setsLoading(false)
      //////////////get existing values and do comparison//////////////////////////////////////////
      // console.log(document.getElementById('lyrics').childNodes)
      // let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
      // console.log('request: ', request)
      // const annotations = request.data()
      // if(annotations){
      //   console.log("annotations" ,annotations)
      //   const annonKeys = Object.keys(annotations)
      //   console.log("annotationskeys: ", annonKeys)
      //   // let startList = Array.from(annonKeys, element=>annotations[element].tst.start)
      //   let startList = Array.from(annonKeys, element=>hlp.start<annotations[element].tst.start?annotations[element].tst.start:null).filter(val => val != null)
      //   let tmpList = []
      //   const updateArr = []
      //   // let minAnnon, minEnd, diff, currentDiff
      //   console.log("starlist", startList)
      //   if(startList.length != 0 || startList != undefined){
      //     for (let index = 0; index < startList.length; index++) {
      //       const element = startList[index];
      //       console.log("element", element)
      //       for (let index2 = 0; index < annonKeys.length; index2++) {
      //         const element2 = annonKeys[index2];
      //         console.log(annotations[element2]['tst']) 
      //     //     if(element != null){
      //           if(annotations[element2]['tst'].start == element){
      //             tmpList.push({'id':element2, 'start':annotations[element2].tst.start, 'end':annotations[element2].tst.end})
      //             break
      //           }
      //     //     }
      //       }
      //     }
      //     console.log('tmplist', tmpList)
      //     tmpList.forEach(element => {
      //       console.log(hlp)
      //         // let tmp = {'id':element, 'strt':'start','end':'end','strtVal':element.start, 'endVal':element.end}
      //         // updateArr.push(tmp)
      //       if(hlp.start == hlp.end){
      //         console.log('is sanammama')
      //         // let tdiff = element.end - element.start
      //         let tmp = {'id':element, 'strt':'start','end':'end','strtVal':element.start, 'endVal':element.end}
      //         updateArr.push(tmp)
      //       } else if(hlp.start != hlp.end){
      //         console.log('not same')
      //         let tdiff = hlp.end - hlp.start
      //         let tmp = {'id':element, 'strt':'start','end':'end','strtVal':(element.start-tdiff), 'endVal':(element.end-tdiff)}
      //         console.log(tmp)
      //         updateArr.push(tmp)
      //       }
      //     });
      //     console.log('iparr', updateArr)
      //     await updateMultiNotes(`users/${uid}/notes/`,`${title} by ${artist}`,'tst',updateArr)
      //   }
      // }
    } catch (error) {
      console.log(error)
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
        // setNodel(document.getElementById('lyrics').childNodes)
      })
    }
  },[router.query, authUser,loading])
  // useEffect(()=>{
  //   setsLoading(true)
    
  //   if(authUser){
  //     name = authUser.name  
  //     uid = authUser.uid
  //     flashCardDoc(uid).then(e=>{
  //       getLyricsKanji()
  //     })
  //   }
  // },[])

  // useEffect(()=>{
  //   if(authUser){
  //     name = authUser.name  
  //     uid = authUser.uid
  //     flashCardDoc(uid).then(e=>{
  //       getLyricsKanji()
  //     })
  //   }
  // },[])

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
          <Card id='may' style={{width:'600px',overflowX:'hidden', overflowY:"scroll" ,height:lyricH}} suppressHydrationWarning>
            <KanjiList info={info} uid={uid} pageType=''/>
          </Card>
          <Card style={{width:'60%'}}>
          {/* <Card> */}
            <h1 id='til'>{title}</h1> 
            <h4>{artist}</h4>
            <div style={{display:"flex", flexDirection:"row"}}>
              <div className={styles.ty} id='lyrics' style={{width:'50%',fontSize:'20px', marginTop:'20px'}} 
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
                  <Form name='createAnn' onFinish={handleAnn}>
                    <Form.Item id='note' name='note' rules={[{min:0, message:'please add note'}]}><TextArea autoSize={{minRows: 3}} style={{}}></TextArea></Form.Item>
                    <div styles={{display:'flex', flexDirection:'row'}}>
                      <Form.Item><Button style={{margin:'0px 0px'}} type='primary' htmlType="submit">Save</Button></Form.Item>
                      <Form.Item><Button style={{margin:'0px 0px'}} type='primary' onClick={cancelAnnotation}>Cancel</Button></Form.Item>
                    </div>
                  </Form>
                  {/* <form name='createAnn' onSubmit={handleAnn}>
                    <textarea id='note' name='note' style={{width:"100%", resize:"vertical"}} ></textarea>
                    <button type='submit'>Save</button>
                    <button onClick={cancelAnnotation}>Cancel</button>
                  </form> */}
                  {/* <Tag onClick={()=>{}} style={{borderStyle:'dashed'}}><PlusOutlined/> New Tag</Tag> */}
                </Card>
                }
              </div>
            </div>
          </Card> 
          <Button id='tltp' onClick={createAnnotation} className={styles.tltp}>
            Create Annotation
          </Button>
        </div>
      <CommonFoot/>
      </Layout>
    </Spin>
    </>
  );
}

 // for (let index = 0; index < annonKeys.length; index++) {
    //   const element = annonKeys[index];
    //   startList.push(annotations[element].tst.start)
    //   // console.log(annotations[element].tst.start)
    //   // let str = annotations[element].tst.start
    //   // let en = annotations[element].tst.end
    //   // if(str < annotations[annonKeys[index+1]].tst.start){
    //   //   console.log('yes')
    //   //   console.log(annotations[element].tst.start)
    //   //   break
    //   // }
    // }
    // console.log(startList)
    // console.log(Math.min.apply(Math,startList))

    // for (let index = 0; index < nodeList.length; index++) {
      //   const element2 = nodeList[index];
          // if(element2.textContent == annotations[element].pos.txt)
          // {
          //   console.log('fonudit')
          //   if (index >= annotations[element].pos.start){
          //     sindex = index
          //     break
          //   }
          // }
          // if(element2.textContent == annotations[element].tst.txt)
          // {
            // console.log('fonudit')
            // if (index >= annotations[element].pos.start){
            //   eindex = index
            //   break
            // }
        //   }
        // }
                
        // hlp.start == hlp.end?currentDiff = hlp.start: currentDiff = hlp.end - hlp.start
        // let minStart = Math.min.apply(Math, startList)
        // for (let index = 0; index < annonKeys.length; index++) {
        //   const element = annonKeys[index];
        //   if(annotations[element].tst.start == minStart){
        //     minAnnon = element
        //     minEnd = annotations[element].tst.end
        //     break
        //   } 
        // }

        // if(hlp.start < minstart){
        //   currentDiff = hlp.end - hlp.start

        //   for (let index = 0; index < annonKeys.length; index++) {
        //     const element = annonKeys[index];
        //     const vari = annotations[element].tst
        //     let tmp = {'id':element, 'strt':'start','end':'end','strtVal':vari.start-currentDiff, 'endVal':vari.end-currentDiff}
        //     updateArr.push(tmp)
        //   }

          //updateNoteArray(`users/${uid}/notes/`,`${title} by ${artist}`,`${element}`,'tags', element2,'')

        // }

        // if(minStart == minEnd){
        // } else {
        //   diff = minEnd-minStart
        // }
        // console.log(diff)


              // let startList = Array.from(annonKeys, element=>hl<annotations[element].tst.start?annotations[element].tst.start:null)
      // let startList = Array.from(annonKeys, element=> {if(hl<annotations[element].tst.start){return annotations[element].tst.start}})
      // let startList = Array.from(annonKeys, element=>{if(hl<annotations[element].tst.start){annotations[element].tst.start}})
      // console.log(startList)
      // let minStart = Math.min.apply(Math, startList)
      // let minAnnon, minEnd, diff

      // for (let index = 0; index < annonKeys.length; index++) {
      //   const element = annonKeys[index];
      //   annotations[element].tst.start
      //   if(annotations[element].tst.start == minStart){
      //     minAnnon = element
      //     minEnd = annotations[element].tst.end
      //     break
      //   } 
      // }

      // if(minStart == minEnd){
      // } else {
      //   diff = minEnd-minStart
      // }
      // console.log(diff)
