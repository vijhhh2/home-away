'use client';

import { useState } from 'react';
import Title from '@/components/properties/Title';
import { Button } from '@/components/ui/button';

const Description = ({ description }: { description: string }) => {
    const [isFullDescription, setIsFullDescription] = useState(false);
    const words = description.split(' ');
    const isLongDescription = words.length > 100;

    const toggleFullDescription = () => {
        setIsFullDescription(!isFullDescription);
    }
    const displayedDescription = isLongDescription && !isFullDescription ? words.splice(0, 100).join(' ') + '...' : description;
    return (
        <article className='mt-4'>
            <Title text='Description' />
            <p className='text-muted-foreground font-light leading-loose'>{ displayedDescription }</p>
            { isLongDescription && <Button variant='link' className='pl-0' onClick={toggleFullDescription}>{ isFullDescription ? 'Show less' : 'Show more'}</Button> }
        </article>
    );
};

export default Description;