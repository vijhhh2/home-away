'use client';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {Button} from '../ui/button';
import {LuShare2} from 'react-icons/lu';

import {
    TwitterShareButton,
    EmailShareButton,
    LinkedinShareButton,
    TwitterIcon,
    EmailIcon,
    LinkedinIcon,
} from 'react-share';

import React from 'react';

const ShareButton = ({
                         propertyId,
                         name,
                     }: {
    propertyId: string;
    name: string;
}) => {
    const url = process.env.NEXT_PUBLIC_WEBSITE_URL as string;
    const shareLink = `${url}/properties/${propertyId}`;
    return (
<Popover>
    <PopoverTrigger asChild>
        <Button variant='outline' size='icon' className='p-2'>
            <LuShare2 />
        </Button>
    </PopoverTrigger>
    <PopoverContent side='top' align="end" sideOffset={10} className='flex items-center justify-center w-full gap-x-2'>
        <TwitterShareButton url={shareLink} title={name}>
            <TwitterIcon size={32} round />
        </TwitterShareButton>
        <LinkedinShareButton url={shareLink} title={name}>
            <LinkedinIcon size={32} round />
        </LinkedinShareButton>
        <EmailShareButton url={shareLink} title={name}>
            <EmailIcon size={32} round />
        </EmailShareButton>
    </PopoverContent>
</Popover>
    );
};

export default ShareButton;