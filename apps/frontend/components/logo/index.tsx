import Link from 'next/link';
import React from 'react'

const Logo = (props: { url?: string; size?: string; fontSize?: string }) => {
    const {url = '/', size = '50px', fontSize= '24px'} = props;
    return (
        <div className='flex items-center justify-center sm:justify-start'>
            <Link href={url} className='rounded-lg flex items-center border-2 dark:border-grey-200 justify-center bg-gradient-to-br from-primary to-secondary p-2'
                style={{width: size, height: size}}
            >
                <span className='font-bold text-grey-50' style={{fontSize: fontSize}}>
                    Credence
                </span>
            </Link>
        </div>
    )
}   

export default Logo