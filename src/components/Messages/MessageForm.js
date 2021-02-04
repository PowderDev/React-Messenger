import React from 'react';
import { Button, ButtonGroup, Input, Segment } from 'semantic-ui-react';
import firebase from '../../firebase'
import FileModal from './FileModal'
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'
import { Picker, emojiIndex } from 'emoji-mart'
import 'emoji-mart/css/emoji-mart.css'

class MessageForm extends React.Component{

    state = {
        message: '',
        loading: false,
        channel: this.props.curChannel,
        userName: this.props.curUser.displayName,
        userAvatarURL: this.props.curUser.photoURL,
        userUid: this.props.curUser.uid,
        errors: [],
        modal: false,
        uploadState: '',
        uploadTask: null,
        storageRef: firebase.storage().ref(),
        percentUploaded: 0,
        messagesRef: firebase.database().ref('messages'),
        typingRef: firebase.database().ref('typing'),
        emojiPicker: false
    }

    openModal = () => this.setState({modal: true})
    closeModal = () => this.setState({modal: false})

    handerChange = (e) =>{
        this.setState({message: e.target.value}, () => this.state.message === '' ? this.removeTyping() : null)
    }

    componentWillUnmount(){
        if (this.state.uploadTask !== null){
            this.state.uploadTask.cancel()
            this.setState({ uploadTask: null })
        }
    }



    sendMessage = () =>{
        const {message, channel, errors, messagesRef,typingRef, userUid, userName } = this.state

        if(message){
            this.setState({loading: true})
            this.props.getMessagesRef()
                .child(channel.id)
                .push()
                .then((snap)=>{
                    snap.set(this.createMessage(null, snap.key))
                })
                .then(() =>{
                    this.setState({loading: false, message: '', errors: []}, () =>{
                        this.removeTyping()
                    })
                })
                .catch(err => {
                    this.setState({loading: false, errors: errors.concat(err)})
                })
        }else{
            this.setState({errors: errors.concat(message: 'Add a message')})
        }

    }

    createMessage = (fileUrl = null , key) => {
        const {userName, userAvatarURL, userUid, channel, messagesRef} = this.state

        const message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: userUid,
                name: userName,
                avatar: userAvatarURL
            },
            id: key 
        }

        if (fileUrl !== null){
            message['image'] = fileUrl
        }else{
            message['content'] = this.state.message
        }

        return message
    }

    getPath = () => {
        if (this.props.isPrivate){
            return `chat/private/${this.state.channel.id}`
        }else{
            return `chat/public`
        }
    }

    uploadFile = (file, metadata) =>{
        const pathToUpload = this.state.channel.id
        const ref = this.props.getMessagesRef()
        const filePath = `${this.getPath()}/${uuidv4()}.jpg`

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },
            () =>{
                this.state.uploadTask.on('state_changed', snap =>{
                    const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                    this.setState({percentUploaded})
                },
                    err =>{
                        console.log(err);
                        this.setState({
                            error: this.state.errors.concat(err),
                            uploadState: 'error',
                            uploadTask: null
                        })},
                            () =>{
                                this.state.uploadTask.snapshot.ref.getDownloadURL().then(downloadURL =>{
                                    this.sendFileMessage(downloadURL, ref, pathToUpload)
                                })
                                .catch(err =>{
                                    console.log(err);
                                    this.setState({
                                        error: this.state.errors.concat(err),
                                        uploadState: 'error',
                                        uploadTask: null
                                    } 
                                )
                            }
                        )
                    }
                )
            }
        )
    }
 


    sendFileMessage = (fileUrl, ref, path) =>{
        ref.child(path)
            .push()
            .then((snap) =>{
                snap.set(this.createMessage(fileUrl, snap.key))
            })
            .then(() =>{
                this.setState({uploadState: 'done'})
            })
            .catch(err =>{
            console.log(err);
            this.setState({
                error: this.state.errors.concat(err),
            }) 
        })
}


    handleKeyDown = (e) =>{
        e.key === 'Enter' ? this.sendMessage() : null

        const { message, typingRef, channel, userUid, userName } = this.state

        if (message) {
            typingRef
                .child(channel.id)
                .child(userUid)
                .set(userName)
        } else {
            this.removeTyping()
        }

    }

    removeTyping = () =>{
        const {typingRef, channel, userUid} = this.state

        typingRef
        .child(channel.id)
        .child(userUid)
        .remove()
    }

    handlerTogglePicker = () => this.setState({ emojiPicker: !this.state.emojiPicker })

    handlerAddEmoji = (emoji) =>{
        const oldMessage = this.state.message
        const newMessage = this.colonToUnicode(`${oldMessage}${emoji.colons}`)
        this.setState({ message: newMessage })
    }

    colonToUnicode = (message) =>{
        return  message.replace(/:[A-Za-z0-9_+-]+:/g, x =>{
                x = x.replace(/:/g, '')

        let emoji = emojiIndex.emojis[x]
            if (typeof emoji !== 'undefined'){
                let unicode = emoji.native
                    if (typeof unicode !== 'undefined'){
                        return unicode
                    }
            }
            x = ':' + x + ':'
            return x
        })
    }

    



    render(){
        const {emojiPicker, errors, message, loading, modal, percentUploaded, uploadState} = this.state

        return(
            <Segment className='message__form'>
                {emojiPicker && (
                    <Picker set='apple' onSelect={this.handlerAddEmoji} className='emojipicker' title='Pick your emoji' emoji='point_up' />
                )}
                <Input onKeyPress={this.handleKeyDown} value={message} onChange={this.handerChange} className={errors.some(err => err.includes('message')) ? 'error' : ''}  name='message' style={{marginBottom: '.7em'}} label={ <Button icon={emojiPicker ? 'close' : 'add'} onClick={this.handlerTogglePicker} /> } labelPosition='left' placeholder='Write your message' fluid/>
                <ButtonGroup icon widths='2'>
                    <Button disabled={loading} onClick={this.sendMessage} color='orange' content='Send Message' labelPosition='left' icon='edit' />
                    <Button disabled={uploadState === 'uploading'} color='teal' onClick={this.openModal} content='Upload Media' labelPosition='right' icon='cloud upload'/>
                    <FileModal modal={modal} closeModal={this.closeModal} uploadFile={this.uploadFile} />
                </ButtonGroup>
                    <ProgressBar percentUploaded={percentUploaded} uploadState={uploadState}/>
            </Segment>
        )
    }
}


export default MessageForm