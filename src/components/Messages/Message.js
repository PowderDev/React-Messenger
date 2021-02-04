import React, {useRef, useState} from 'react';
import { Comment, Image , Icon} from 'semantic-ui-react';
import moment from 'moment'
import firebase from '../../firebase'


function isOwnMessage(message, user){
    return message.user.id === user.uid ? 'message__self' : '' 
}

const isImage = (message) => {
    return message.hasOwnProperty('image') && !message.hasOwnProperty('content')
}

const  timeFromNow = (timestamp) => moment(timestamp).fromNow()

const deleteMessage = ( userId, curChannel, message, isPrivate) =>{
    console.log(userId, curChannel, message, isPrivate);
    if(userId === message.user.id){
        firebase.database().ref(`${isPrivate ? 'privateMessages' : 'messages'}/${curChannel}/${message.id}`).remove(err => {
            console.log(err);
        })
    }
}



const Message = ({message, user, curChannel, isPrivate}) =>{

    const ic = useRef()
    const [display, setDisplay] = useState('none')
    

    const stylesIcon = {
    marginLeft: '15px',
    marginRight: '5px',
    display: display
}

    const showDelBtn = () => setDisplay('inline');
    const hideDelBtn = () => setDisplay('none');

    return (
        <Comment onMouseOver={showDelBtn} onMouseLeave={hideDelBtn}>
            <Comment.Avatar src={message.user.avatar}/>
            <Comment.Content className={isOwnMessage(message, user)}>
                <Comment.Author as='a'>{message.user.name}</Comment.Author>
                <Comment.Metadata>{timeFromNow(message.timestamp)}</Comment.Metadata>
                <Icon name='trash' size='small' ref={ic} onClick={() => deleteMessage( user.uid, curChannel.id, message, isPrivate)} style={stylesIcon}/>
                {isImage(message) ? <Image src={message.image} className='message__image' />  :
                    <Comment.Text>{message.content}</Comment.Text>
                }
            </Comment.Content>
        </Comment>
    )
}

export default Message