import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import styles from '@/src/styles/Home.module.css'
import React, { useEffect, useState } from 'react'
import { Layout, Row, Col, Spin, Card, Button, Result } from 'antd';
import { isKanji, getKanjiInfo, KanjiList, flashCardDoc, FlashSets, CommonFoot } from '../../utils/methods'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getDocuQuery, getData } from '@/src/firebase/firestore/getData'

const { Header, Footer, Content } = Layout; 

export default function FlashCardSet() {
  const [kanji, setKanji] = useState([]);
  const [sloading, setsLoading] = useState(true);
  const router = useRouter()
  const {query: {set}} = router
  let list

  const getKanji = async(setName) => {
    setName?[list = await getDocuQuery('kanji', 'flashcardRef', '==', setName),setKanji(list), setsLoading(false)]:console.log('wait')
  }

  const Hmm = () => {
    setsLoading(true);
    setTimeout(() => {
      router.push('/results')
    }, 1000);
  }

  const Flashcards = () => {
    const [ncount, setncount] = useState(1);
    return (
      <>
      <div id='Cardset'>
      {kanji.map(element => (
        <div className={styles.Cardset} key={element.key}>
          <div className={styles.ccard} id='ccard' onClick={()=>{
            if(document.getElementById('cinner').style.transform == 'rotateY(180deg)'){
              document.getElementById('cinner').style.transform = 'rotateY(0deg)'
            } else {
              document.getElementById('cinner').style.transform = 'rotateY(180deg)'
            }
          }}>
            <div id='cinner' className={styles.cinner}>
              <div className={styles.cfront}>
                <Card>
                  <h2>{element.kanji}</h2>
                </Card>
              </div>
              <div className={styles.cback}>
                <Card>
                  <p>(1) {(element.meaning).join(', ')}</p>
                  <p>kun-yomi: {(element.kunyomi).join('、')}</p>
                  <p>On Yomi: {(element.onyomi).join('、')}</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      ))}</div>
      {ncount != 0?<>
        <Button id ='bttn1' onClick={()=>{
          let tst = document.getElementById('Cardset').firstChild
          document.getElementById('Cardset').removeChild(tst)
          setncount(document.getElementById('Cardset').childElementCount)
        }}><CheckOutlined/></Button>
        <Button onClick={()=>{
          let tst = document.getElementById('Cardset').firstChild
          document.getElementById('Cardset').append(tst)
        }}><CloseOutlined/></Button></>
        :Hmm()}
      </>
    )
  }

  useEffect(()=>{
    // setsLoading(true)
    getKanji(set)
  },[router])

  return (
    <>
      <Spin spinning={sloading}>
      <Head>
        <title>だんだん</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header className={styles.headerStyle} style={{backgroundColor:'white'}}>
        <Image alt='logo' width={120} height={50} src="/images/logo_red.png" />
      </Header>
      <div className={styles.bar}></div>
      <Content>
        <center>
          <Flashcards />
        </center>
      </Content>
      <div style={{height:'200px'}}></div>
      <CommonFoot/>
      </Spin>
    </>
  )
}