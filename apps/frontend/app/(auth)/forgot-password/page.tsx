import React, { Suspense} from 'react';
import ForgotPassword from './_forgotpassword';

const Page = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ForgotPassword />
        </Suspense>
    );
}

export default Page;