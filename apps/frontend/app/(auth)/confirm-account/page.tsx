import React, { Suspense } from 'react'
import ComfirmAccount from './_confirmaccount'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <ComfirmAccount />
    </Suspense>
  )
}

export default page