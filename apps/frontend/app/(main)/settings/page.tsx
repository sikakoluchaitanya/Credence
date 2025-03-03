import React, { Suspense } from 'react'
import AccountSettings from './_settings'

function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <AccountSettings />
    </Suspense>
  )
}

export default page