import React, { Suspense } from 'react'
import VerifyMfa from './_verifymfa'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <VerifyMfa />
    </Suspense>
  )
}

export default page