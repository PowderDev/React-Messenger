import React from 'react';
import { Progress } from 'semantic-ui-react';

const ProgressBar = ({uploadState, percentUploaded}) =>(
    uploadState !== 'done' && uploadState && (
        <Progress className='progress__bar' percent={percentUploaded} indicating size='small' progress inverted/>
    ) 
)   

export default ProgressBar