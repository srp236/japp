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
import Link from 'next/link';

const { TextArea } = Input;
let hlp = {}, lyricH = '', selec = '', aR = '',tagList = []
export default function Song() {
  const router = useRouter()
  const {query: { title, artist, fstat }} = router 
  const [sloading, setsLoading] = useState(true);
  const [info, setInfo] = useState([]);
  const [txt, setTxt] = useState(undefined);
  const [inputValue, setInputValue] = useState('')
  const [editTxt, seteditTxt] = useState('no')
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
      const response = request.data()[title]
      document.getElementById('lyrics').innerText = response.lyrics
      ////////////// add span to each text node//////////////
      document.getElementById('lyrics').childNodes.forEach((nde, id) => {
        if (nde.nodeType == Node.TEXT_NODE){
          const range = document.createRange()
          let span = document.createElement("span")
          span.id = id
          range.selectNode(nde)
          range.surroundContents(span)         
        }
      })
      console.log('after',document.getElementById('lyrics'))
      //////////////////////////////////////////////////////
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
        const response = request.data()[title]
        document.getElementById('lyrics').innerText = response.lyrics
        lyricH = document.getElementById('lyrics').offsetHeight + 200
        const request2 = await getDocuQuery('kanji', 'songRef', 'array-contains', `${title} by ${artist}`)
        setInfo(request2)
        setsLoading(false)
        // look into storing lyrics in cache or something o we don't need to make a new reuqst everytime th epage loads
      }
    }
  }

  async function getAnnotations() {
    try {
      let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
      const annotations = request.data()
      if(annotations){
        const annonKeys = Object.keys(annotations)
        annonKeys.forEach(element => {
          const range = document.createRange()
          if(range){
          let startNode = document.getElementById(annotations[element].tst.startId).firstChild;
          let endNode = document.getElementById(annotations[element].tst.endId).firstChild;
          range.setStart(startNode, annotations[element].tst.startOffset)
          range.setEnd(endNode, annotations[element].tst.endOffset)
            if(range.toString().length != 0){
              let a = document.createElement("a")
              let span = document.createElement("span")
              a.id = element
              a.onclick = function () {
                openSavedAnnotation(element, annotations[element].note, this.id)
              }
              anntagss[element] = annotations[element].tags
              range.surroundContents(span)
              range.surroundContents(a)
              ///// remove tags locally as well not just in db
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
    if(window.getSelection().toString()=='\n' || window.getSelection().toString().length == 0){
      return
    }
    let selection = window.getSelection()
    let range = selection.getRangeAt(0)
    // console.log(selection, range)
    // console.log('papa', selection.focusNode.parentNode.id)
    // console.log('mama', range.startContainer.parentNode.id)
    // console.log('papa', range.endContainer.parentNode.id)
    let startNodeId = range.startContainer.parentNode.id
    let endNodeId = range.endContainer.parentNode.id
    hlp = {'startOffset':range.startOffset,'endOffset':range.endOffset, 'startId':startNodeId, 'endId':endNodeId}
    selec=selection
    // console.log('yl', lyrics)
    // console.log('yl', lyrics.item(3))
    // console.log('yl',document.getElementById('lyrics').innerText.indexOf(selection.toString()))
    // let nodeList = Array.from(lyrics)
    // nodeList.indexOf(range.startContainer) == nodeList.indexOf(range.endContainer)?console.log('yup'):console.log('nay')
    // hlp = {'indexS':range.startOffset,'indexE':range.endOffset, 'start':nodeList.indexOf(range.startContainer), 'end':nodeList.indexOf(range.endContainer)}
    // selec=selection
    let rect = selection.getRangeAt(0).getBoundingClientRect()
    document.getElementById('tltp').style.visibility = "visible";
    document.getElementById('tltp').style.top = `${window.scrollY + rect.bottom + 10}px`;
    document.getElementById('annon').style.top = `${window.scrollY + rect.top - 120}px`;
    document.getElementById('tltp').style.left = `${rect.x}px`;  
  } 

  function openSavedAnnotation(elm, txt, id) {
    document.getElementById('annon').style.visibility = "visible";
    document.getElementById('annon').style.top = `${window.scrollY + document.getElementById(id).getBoundingClientRect().top - 120}px`;
    setTxt([elm, txt])
  }

  // const openSavedAnnotation = (elm, txt, id) =>{
  //   document.getElementById('annon').style.visibility = "visible";
  //   document.getElementById('annon').style.top = `${window.scrollY + document.getElementById(id).getBoundingClientRect().top - 120}px`;
  // }

  //need local dictionary of note/annotaiotns to refernce before saved to db

  const createAnnotation = () => {
    setTxt(undefined)
    let r = (Math.random() + 1).toString(36).substring(5)
    let selection = selec.getRangeAt(0)
    // console.log(hlp)
    let a = document.createElement("a")
    a.id = r
    a.onclick = function () {
      document.getElementById('annon').style.visibility = "visible";
    }
    if(hlp.startId != hlp.endId)
    {
      let firstNode = document.getElementById(hlp.startId)
      let lastNode = document.getElementById(hlp.endId)
      let currNode = firstNode.nextSibling;
      while(currNode != lastNode && currNode != null)
      {
        if(currNode.nodeName == 'SPAN') {
          console.log('cnode',currNode.firstChild)
        //   // if(currNode.hasChildNodes() && currNode.textContent.length > 0) {
            const range = document.createRange()
            let b = document.createElement("a")
            b.id = r
            range.selectNode(currNode.firstChild)
            range.surroundContents(document.createElement("span"))
            range.surroundContents(b)
            console.log(currNode)
          }
        currNode = currNode.nextSibling
      }      
    }

    //need ofset of first and last already have 
    // selection.surroundContents(document.createElement("span"))
    // selection.surroundContents(a)
    document.getElementById('annon').style.visibility = "visible"
    document.getElementById('tltp').style.visibility = "hidden"
    aR=r
  }
  
  const cancelAnnotation = (event) => {
    event.preventDefault()
    seteditTxt('no')
    console.log('edittct: ', editTxt)
    setsLoading(true)
    document.getElementById('annon').style.visibility = "hidden"
    router.reload()
    // getLyricsKanji().then(e=>{
    //   setsLoading(false)
    // })
    seteditTxt('no')
  }
  
  const deleteAnnotation = async () => {
    document.getElementById('annon').style.visibility = "hidden"
    await delField(`users/${uid}/notes/`,`${title} by ${artist}`,txt[0])
    router.reload()
  }
  
  const handleAnn = async (values) => {
    try {
      seteditTxt('no')
      setTxt([aR, values.note])
      let data= {[aR]:{'id':aR, 'note' :values.note, 'tags':tagList, 'tst':hlp}}
      await addNote("users",uid,"notes",`${title} by ${artist}`, data)
      document.getElementById('annon').style.visibility = "hidden"
      /////////////////////get existing values and do comparison/////////////////////////////
      // let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
      // const annotations = request.data()
      // const tempAnonList = [];
      // if(annotations){
      //   for (var ann in annotations) {
      //    tempAnonList.push([ann, annotations[ann].tst.start])
      //   }
      //   tempAnonList.sort((a,b)=> a[1] - b[1])
      //   console.log(tempAnonList)

      //   let indexOfAnn = tempAnonList.findIndex(element => element.toString() == [`${aR}`,hlp.start])
      //   let changeInterval = 2
      //   let mydata = {'tst':{'start': hlp.start-(indexOfAnn*changeInterval),'end':hlp.end-(indexOfAnn*changeInterval)}}
      //   await updateDataIndex(`users/${uid}/notes/`,`${title} by ${artist}`,aR, mydata)
      // }
    } catch (error) {
      console.log(error)
      alert("error occured, please try again")
    }
  }

  const saveAnnTags = async (ivalue) => {
    if(ivalue.length > 0){
      if(anntagss[txt[0]] == undefined){
        anntagss[txt[0]] = [ivalue]
      } else {
        anntagss[txt[0]].push(ivalue)
      }
      updateDataField(`users/${uid}/notes/`,`${title} by ${artist}`,txt[0],'tags', ivalue,'add')
      setInputValue('')
      setClcked(false)
    } else {
      setClcked(false)
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
      if(!document.getElementById('lyrics').innerText)
      {flashCardDoc(uid).then(e=>{
        getLyricsKanji()
        // setNodel(document.getElementById('lyrics').childNodes)
      })} else {
        setsLoading(false)
      }
    }
  },[router.query, authUser,loading])

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
                  <Button type='text' style={{}} onClick={()=>{setTxt(undefined);seteditTxt(txt[1])}}>Edit</Button>
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
                      onPressEnter={()=>{saveAnnTags(inputValue)}}
                      onBlur={()=>{saveAnnTags(inputValue)}}
                    />:
                    <Tag id='annTag' onClick={()=>{setClcked(true)}} style={{borderStyle:'dashed'}}><PlusOutlined/> New Tag</Tag>}
                  </div>
                </Card>
                :editTxt =='no'?
                <Card id='annon' className={styles.annon}>
                  <Form name='createAnn' onFinish={handleAnn}>
                    <p>Enter notes and save to create annotation</p>
                    <Form.Item id='note' name='note' rules={[{min:0, message:'please add note'}]}><TextArea autoSize={{minRows: 3}} style={{}}></TextArea></Form.Item>
                    <div style={{display:'flex', flexDirection:'row'}}>
                      <Form.Item><Button style={{margin:'0px 0px', marginRight:'20px', backgroundColor:'rgb(230,26,57)'}} type='primary' htmlType="submit">Save</Button></Form.Item>
                      <Form.Item><Button style={{margin:'0px 0px'}} type='text' onClick={cancelAnnotation}>Cancel</Button></Form.Item>
                    </div>
                  </Form>
                </Card>
                :<Card id='annon' className={styles.annon}>
                <Form name='createAnn' onFinish={handleAnn}>
                  <p>Edit Notes</p>
                  <Form.Item id='note' name='note' rules={[{min:0, message:'please add note'}]}><TextArea defaultValue={editTxt} autoSize={{minRows: 3}} style={{}}></TextArea></Form.Item>
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
          {/* <Button id='tltp' onClick={()=>{document.getElementById('元').getElementsByClassName('元')[0].scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })}} className={styles.tltp}> */}
          {/* <Button id='tltp' onClick={()=>{
            
          }} className={styles.tltp}> */}
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

   {/* <Button onClick={()=>{
              document.getElementById('元').scrollIntoView(true)
            }}>Test</Button> */}

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
  // const handleAnn = async (values) => {
  //   try {
  //     seteditTxt('no')
  //     setTxt([aR, values.note])
  //     let data= {[aR]:{'id':aR, 'note' :values.note, 'tags':tagList, 'tst':hlp}}
  //     await addNote("users",uid,"notes",`${title} by ${artist}`, data)
  //     document.getElementById('annon').style.visibility = "hidden"
  //     /////////////////////get existing values and do comparison/////////////////////////////
  //     let request = await getNotes("users", uid, "notes",`${title} by ${artist}`)
  //     const annotations = request.data()
  //     const tempAnonList = [];
  //     if(annotations){
  //       for (var ann in annotations) {
  //        tempAnonList.push([ann, annotations[ann].tst.start, annotations[ann].tst.originl])
  //       }
  //       // puts annotations in order
  //       tempAnonList.sort((a,b)=> a[1] - b[1])
  //       let tempVar
  //       tempAnonList.forEach(element => {
  //         if(element[2]==hlp.originl && element[0] != aR){
  //           console.log('found')
  //           console.log(tempAnonList.indexOf(element))
  //         }
  //       });
  //       console.log(tempAnonList)
  //       let indexOfAnn = tempAnonList.findIndex(element => element.toString() == [`${aR}`,hlp.start, hlp.originl])
  //       let changeInterval = 2
  //       let mydata = {'tst':{'start': hlp.start-(indexOfAnn*changeInterval),'end':hlp.end-(indexOfAnn*changeInterval)}}
  //       await updateDataIndex(`users/${uid}/notes/`,`${title} by ${artist}`,aR, mydata)
  //     }
  //   } catch (error) {
  //     console.log(error)
  //     alert("error occured, please try again")
  //   }
  // }