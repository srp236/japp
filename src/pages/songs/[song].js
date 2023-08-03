import { getNotes, getData, getDocuQuery } from '@/src/firebase/firestore/getData'
import { Layout, Spin, Card, Tag, Form, Input, Button } from 'antd';
import React, { useState, useEffect, use, useRef } from 'react'
import styles from '@/src/styles/Home.module.css'
import { useRouter } from "next/router"
import Image from 'next/image'
import Head from 'next/head';
import { KanjiList, CommonFoot, flashCardDoc } from '@/src/utils/methods';
import { useAuth } from '@/src/utils/AuthUserContext';
const { Header } = Layout;
import { PlusOutlined } from '@ant-design/icons';
import { updateDataIndex, addNote, updateDataField} from '@/src/firebase/firestore/addData';
import { delField } from '@/src/firebase/firestore/delField';

const { TextArea } = Input;
let hlp = {}, lyricH = '', selec = '', aR = '',tagList = []
export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const [txt, setTxt] = useState(undefined);
  const [inputValue, setInputValue] = useState('')
  const [clcked, setClcked] = useState(false);
  const [anntagss, setAnntagss] = useState({});
  const tagRef = useRef(null)
  
  const { authUser, loading } = useAuth();
  let name ='', uid =''
  let annotationTags = {}
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
      console.log('called each time?')
      let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
      const annotations = request.data()
      if(annotations){
        const annonKeys = Object.keys(annotations)
        const div = document.getElementById('lyrics').childNodes
        let nodeList = Array.from(div)
        
        annonKeys.forEach(element => {
          const range = document.createRange()
          if(range){
          range.setStart(nodeList[annotations[element].tst.start], annotations[element].tst.indexS)
          range.setEnd(nodeList[annotations[element].tst.end], annotations[element].tst.indexE)
            if(range.toString().length != 0){
              let a = document.createElement("a")
              let span = document.createElement("span")
              a.id = element
              a.onclick = function () {
                // console.log(annotationTags)
                document.getElementById('annon').style.visibility = "visible";
                document.getElementById('annon').style.top = `${window.scrollY + document.getElementById(this.id).getBoundingClientRect().top - 120}px`;
                // if(annotations[element].tags){
                //   annotations[element].tags.forEach(element2 => {
                //     lm.push(<Tag closable onClose={()=>{updateNoteArray(`users/${uid}/notes/`,`${title} by ${artist}`,`${element}`,'tags', element2,'')}}>{element2}</Tag>)
                //   });
                // }
                setTxt([element, annotations[element].note])
              }
              //outside of onclick for annotation
              let tp = []
              annotations[element].tags.forEach(element2 => {
                tp.push(element2)
              });
              anntagss[element] = tp
              // annotationTags[element] = tp
              console.log(annotationTags)
              range.surroundContents(span)
              range.surroundContents(a)
            }
          }
        })
      }
    } catch (error) {
      console.log('someting happen')
      router.reload()
    }
  }

  function getText() {
    // console.log(document.getElementById('lyrics').childNodes)
    if(window.getSelection().toString()=='\n' || window.getSelection().toString().length == 0){
      return
    }
    let selection = window.getSelection()
    let range = selection.getRangeAt(0)
    let lyrics = document.getElementById('lyrics').childNodes
    let nodeList = Array.from(lyrics)
    // console.log(nodeList)
    nodeList.indexOf(range.startContainer) == nodeList.indexOf(range.endContainer)?console.log('yup'):console.log('nay')
    //If hlp.indexs is not 0, then need to subtract one more from 
    hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer), 'end':nodeList.indexOf(range.endContainer)}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer)-4, 'end':nodeList.indexOf(range.endContainer)-4}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':range.startOffset==0?nodeList.indexOf(range.startContainer)-4:nodeList.indexOf(range.startContainer)-5, 'end':range.startOffset==0?nodeList.indexOf(range.endContainer)-4:nodeList.indexOf(range.endContainer)-5}
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer), 'end':nodeList.indexOf(range.endContainer),'txt':range.startContainer.textContent}
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
  
  const deleteAnnotation = async () => {
    document.getElementById('annon').style.visibility = "hidden"
    await delField(`users/${uid}/notes/`,`${title} by ${artist}`,txt[0])
    router.reload()
  }
  
  const handleAnn = async (values) => {
    try {
      setTxt([aR, values.note])
      let data= {[aR]:{'id':aR, 'note' :values.note, 'tags':tagList, 'tst':hlp}}
      await addNote("users",uid,"notes",`${title} by ${artist}`, data)
      document.getElementById('annon').style.visibility = "hidden"
      //////////////get existing values and do comparison//////////////////////////////////////////
      let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
      const annotations = request.data()
      const tempAnonList = [];
      if(annotations){
        for (var ann in annotations) {
         tempAnonList.push([ann, annotations[ann].tst.start])
        }
        tempAnonList.sort((a,b)=> a[1] - b[1])
        let indexOfAnn = tempAnonList.findIndex(element => element.toString() == [`${aR}`,hlp.start])
        let changeInterval = 2
        let mydata = {'tst':{'start': hlp.start-(indexOfAnn*changeInterval),'end':hlp.end-(indexOfAnn*changeInterval)}}
        await updateDataIndex(`users/${uid}/notes/`,`${title} by ${artist}`,aR, mydata)
      }
      console.log(txt)
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

  useEffect(()=>{
    if(clcked){
      tagRef.current?.focus()
    }
  },[clcked])
  

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
                  <Button type='text' style={{}} onClick={()=>{setTxt(undefined)}}>Edit</Button>
                  <Button type='text' style={{color:'red'}} onClick={()=>{deleteAnnotation()}}>Delete</Button>
                  <hr></hr>
                  <p style={{width:'90%', height:'100px'}}>{typeof(txt)=='string'?txt:txt[1]}</p>
                  <div>
                    {typeof(txt)=='string' || anntagss[txt[0]] == '' || anntagss[txt[0]] == undefined ?'':anntagss[txt[0]].map((tag)=>{
                      return (
                        <span key={tag}style={{display: 'inline-block'}}>
                          <Tag closable onClose={()=>{updateDataField(`users/${uid}/notes/`,`${title} by ${artist}`,txt[0],'tags',tag,'remove')}} >{tag}</Tag>
                        </span>
                      )
                    })}
                    {clcked?
                    <Input ref={tagRef} id='tagInput' type='text' size='small' style={{width:'78px'}} value={inputValue} onChange={(e)=>{setInputValue(e.target.value)}} 
                      onPressEnter={()=>{
                        if(inputValue.length > 0){
                          anntagss[txt[0]].push(inputValue)
                          console.log(anntagss[txt[0]])
                          updateDataField(`users/${uid}/notes/`,`${title} by ${artist}`,txt[0],'tags',inputValue,'add')
                          setInputValue('')
                          setClcked(false)
                        } else {
                          setClcked(false)
                        }
                      }}
                      onBlur={()=>{
                        if(inputValue.length > 0){
                          anntagss[txt[0]].push(inputValue)
                          console.log(anntagss[txt[0]])
                          setInputValue('')
                          setClcked(false)
                        } else {

                        }
                      }}
                    />:
                    <Tag id='annTag' onClick={()=>{setClcked(true)}} style={{borderStyle:'dashed'}}><PlusOutlined/> New Tag</Tag>}
                  </div>
                </Card>
                :<Card id='annon' className={styles.annon}>
                  <Form name='createAnn' onFinish={handleAnn}>
                    <p>Enter notes and save to create annotation</p>
                    <Form.Item id='note' name='note' rules={[{min:0, message:'please add note'}]}><TextArea autoSize={{minRows: 3}} style={{}}></TextArea></Form.Item>
                    <div style={{display:'flex', flexDirection:'row'}}>
                      <Form.Item><Button style={{margin:'0px 0px', marginRight:'20px', backgroundColor:'rgb(230,26,57)'}} type='primary' htmlType="submit">Save</Button></Form.Item>
                      <Form.Item><Button style={{margin:'0px 0px'}} type='text' onClick={cancelAnnotation}>Cancel</Button></Form.Item>
                    </div>
                  </Form>
                </Card>
                }
              </div>
            </div>
          </Card> 
          <Button id='tltp' onClick={createAnnotation} className={styles.tltp}>
            <p style={{padding:'0px 10px'}}>Create Annotation</p>
          </Button>
        </div>
      <CommonFoot/>
      </Layout>
    </Spin>
    </>
  );
}

