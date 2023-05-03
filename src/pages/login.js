import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/router'
import styles from '@/src/styles/Home.module.css'
import logo from '../../public/images/logo_red.png'
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Layout, Row, Col, Spin, notification, Card, message, Form, Input, Button } from 'antd';
import React, { useEffect, useState } from 'react'
import app from '../firebase/config'

const { Header, Content } = Layout;

export default function Login() {
  const router = useRouter()
  const [loading, setsLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const handleLogin = (values) => {
    setsLoading(true)
    const auth = getAuth(app);
    const request = signInWithEmailAndPassword(auth, values.username, values.password)
    .then((userCredential) => {
      const user = userCredential.user;
      router.push('/home')
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      messageApi.open({content:errorCode, type:'error', duration:3});
      console.log(errorCode)
      setsLoading(false)
    });
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
        <div>
          <div></div>
          <div></div>
        </div>
      </Header>
      <div className={styles.bar}></div>
      <Content style={{backgroundColor:'white'}}>
        <Spin spinning={loading}>
          <Form className={styles.registerForm} name='loginForm' layout='vertical' onFinish={handleLogin} style={{minWidth:'250px', maxWidth:'1000px'}}>
            <Form.Item name='username' id='username' label='Email'><Input /></Form.Item>
            <Form.Item name='password' id='password' label='Password'><Input.Password /></Form.Item>
            <Form.Item><Button type='primary' htmlType="submit" style={{backgroundColor:'rgb(230,26,57)'}}>Submit</Button></Form.Item>
            <p>Don't have an account? <a href='../register'>Create one here!</a> </p>
          </Form>
        </Spin>
      </Content>
    </Layout>
  </>
}
