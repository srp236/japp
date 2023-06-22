import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Spin, Button, Result } from 'antd';

export default function Results () {
  const [sloading, setsLoading] = useState(true);

  const router = useRouter()
  useEffect(()=>{
    setTimeout(() => {
      setsLoading(false)
    }, 1000);
  },[])

  return (<>
  <Spin spinning={sloading}>
    <center >
      <Result
        status="success"
        title="Good Job!"
        subTitle="You have completed this study set. Go to the dashboard to see your progress."
        extra={[
          <Button type="primary" onClick={()=>{router.push('/home')}}>Go Home</Button>,
          <Button onClick={()=>{router.back()}}>Study Again</Button>,
        ]}
      />
    </center>
    </Spin>
  </>)
}