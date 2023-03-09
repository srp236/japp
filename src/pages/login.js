import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link';
import { useRouter } from 'next/router'
import styles from '@/src/styles/Home.module.css'
import logo from '../../public/images/logo_red.png'
import { Layout } from 'antd';

const { Header, Content } = Layout;

export default function Login() {
  const router = useRouter()

  return <>
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
      <Content>
        <Link href={'/home'} >Login</Link>
      </Content>

    </Layout>
  </>
}
