import React from 'react';
import { CommentGroup, Segment , Comment} from 'semantic-ui-react';
import MessagesHeader from './MessagesHeader'
import MessageForm from './MessageForm'
import firebase from '../../firebase'
import Message from './Message'
import {setUserPosts} from '../../redux/actions'
import {connect} from 'react-redux'
import Typing from './Typing'
import Skeleton from './Skeleton'


class Messages extends React.Component{

    state = {
        messagesRef: firebase.database().ref('messages'),
        curChannel: this.props.curChannel,
        curUser: this.props.curUser,
        messages: [],
        messagesLoading: true,
        numUniqueUsers: '',
        searchTerm: '',
        searchLoading: false,
        searchResults: [],
        isPrivate: this.props.isPrivate,
        privateMessagesRef: firebase.database().ref('privateMessages'),
        isChannelStarred: false, 
        usersRef: firebase.database().ref('users'),
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected'),
        listeners: []
    }


    componentDidMount(){

        if(this.state.curChannel && this.state.curUser){
            this.addListenteners(this.state.curChannel.id)
            this.addUserStarsListener(this.state.curChannel.id, this.state.curUser.uid)
            this.removeListeners(this.state.listeners)
        }

    }


        componentDidUpdate() {
        this.scrollToBottom();
    }

       componentWillUnmount(){
        this.removeListeners(this.state.listeners)
        this.state.connectedRef.off()
    }

    removeListeners = (listeners) =>{
        listeners.forEach(listener =>{
            listener.ref.child(listener.id).off(listener.event)
        })
    }

    addListenteners = (channelId) =>{
        this.addMessageListener(channelId)
        this.addTypingListener(channelId)
        this.scrollToBottom();
        this.removeMessageListener(channelId)
    }

    addMessageListener = (channelId) =>{
        let loadedMessages = []
        const ref = this.getMessagesRef()

        ref.child(channelId).on('child_added', snap =>{
            loadedMessages.push(snap.val())
            this.setState({messages: loadedMessages, messagesLoading: false}, () => this.countUniqueUsers(loadedMessages))
            this.countUserPosts(loadedMessages)
        })
        this.addToListeners(channelId, ref, 'child_added')
        
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({behavior: 'smooth'});
    }



    addToListeners = (id, ref, e) =>{
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.e === e
        })

        if (index === -1) {
            const newListener = {id, ref, event: e}
            this.setState({ listener: this.state.listeners.concat(newListener) })
        }
    }

    addTypingListener = (channelId) =>{
        let typingUsers = []
        this.state.typingRef.child(channelId).on('child_added', snap =>{
            if (snap.key !== this.state.curUser.uid){
                typingUsers = typingUsers.concat({
                    id: snap.key,
                    name: snap.val()
                })
                this.setState({ typingUsers })
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_added')

        this.state.typingRef.child(channelId).on('child_removed', snap =>{
            const index = typingUsers.findIndex(user => user.id === snap.key)

            if (index !== -1) {
               typingUsers = typingUsers.filter( user => user.id !== snap.key )
                this.setState({ typingUsers })
            }
        })
        this.addToListeners(channelId, this.state.typingRef, 'child_removed')

        this.state.connectedRef.on('value', snap =>{
            if (snap.val()) {
                this.state.typingRef
                    .child(channelId)
                    .child(this.state.curUser.uid)
                    .onDisconnect()
                    .remove()
            }
        })
    }

    addUserStarsListener = (channelId, userId) =>{
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data =>{
                if (data.val() !== null){
                    const channelIds = Object.keys(data.val())
                    const prevStared = channelIds.includes(channelId)
                    this.setState({ isChannelStarred: prevStared})
                }
            })
    }

    countUniqueUsers = messages =>{
        const uniqueUsers = messages.reduce((acc, mes) => {
            if(!acc.includes(mes.user.name)){
                acc.push(mes.user.name)
            }
            return acc
        }, [])

        const numUniqueUsers = `${uniqueUsers.length === 0 ? 1 : uniqueUsers.length} user${!uniqueUsers.length === 1 ? 's' : ''}`
        this.setState({numUniqueUsers})
    }

    handleSearch = e =>{
        this.setState({
            searchTerm: e.target.value,
            searchLoading: true
        }, () => this.searchMessage())
    }

    searchMessage = () =>{
        const messages = [...this.state.messages]
        const regex = new RegExp(this.state.searchTerm, 'gi')
        const searchResults = messages.reduce((acc, mes) =>{
            if (mes.content && mes.content.match(regex) || mes.user.name.match(regex)){
                acc.push(mes)
            }
            return acc
        }, [])
        this.setState({ searchResults })
        setTimeout(() => this.setState({searchLoading: false}), 500 )
    }

    removeMessageListener = (channelId) =>{
        const ref = this.getMessagesRef()
        ref.child(channelId).on('child_removed', snap =>{
            this.addMessageListener(channelId)
        })
        this.addToListeners(channelId, ref, 'child_removed')
    }

    countUserPosts =(messages) =>{
        let userPosts = messages.reduce((acc, message) => {
            if(message.user.name in acc){
                acc[message.user.name].count += 1
            }else{
                acc[message.user.name] = {
                    avatar: message.user.avatar,
                    count: 1
                }
            }
            return acc
        }, {})
        this.props.setUserPosts(userPosts);
    } 

    displayMessages = (messages) =>(
        messages.length > 0 && messages.map(message =>(
            <Message isPrivate={this.state.isPrivate} key={message.timestamp} message={message} user={this.state.curUser} curChannel={this.state.curChannel}/>
        ))
    )

    displayChannelName = channel => {
        return channel ? `${this.state.isPrivate ? '@' : '#'}${channel.name}` : '' 
    }

    getMessagesRef = () =>{
        const {messagesRef, privateMessagesRef, isPrivate} = this.state
        return isPrivate ? privateMessagesRef : messagesRef
    }

    handleStar = () =>{
        this.setState(prev =>({
            isChannelStarred: !prev.isChannelStarred
        }),
            this.starChannel()
        )
    }

    starChannel = () =>{
        if (!this.state.isChannelStarred){

            this.state.usersRef
                .child(`${this.state.curUser.uid}/starred`)
                .update({
                    [this.state.curChannel.id]: {
                        name: this.state.curChannel.name,
                        details: this.state.curChannel.details,
                        createdBy: {
                            name: this.state.curChannel.createdBy.name,
                            avatar: this.state.curChannel.createdBy.avatar,
                        }
                    }
                })
        } else{
            this.state.usersRef
                .child(`${this.state.curUser.uid}/starred`)
                .child(this.state.curChannel.id)
                .remove(err =>{
                    if ( err !== null){
                        console.log(err);
                    }
                })
        }
    }

    displayTypingUsers = (users) => (
        users.length > 0 && users.map (user =>(
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.2em'}} key={user.id} >
                <span className='user__typing'>{user.name} is typing</span> <Typing />
            </div>
        ))
    )

    displayMessagesSkeleton = loading =>(
        loading && this.state.messages.length > 0 ? (
            <React.Fragment>
                {[...Array(10)].map((_, i) =>(
                    <Skeleton key={i} />
                ))}
            </React.Fragment>
        ) : null
    )

    render(){
        const {typingUsers, messagesLoading , isChannelStarred, isPrivate, messagesRef, curChannel, curUser, messages, numUniqueUsers, searchTerm, searchResults, searchLoading} = this.state

        return(
            <React.Fragment>

                <MessagesHeader isChannelStarred={isChannelStarred} handleStar={this.handleStar} isPrivate={isPrivate} searchLoading={searchLoading} handleSearch={this.handleSearch} numUniqueUsers={numUniqueUsers} channel={this.displayChannelName(curChannel)} />

                <Segment style={{paddingRight: '3px'}} style={{height: '72%'}} >
                    <Comment.Group className='messages'>
                        {this.displayMessagesSkeleton(messagesLoading)}
                        {searchTerm ? this.displayMessages(searchResults) 
                        : this.displayMessages(messages)}
                        {this.displayTypingUsers(typingUsers)}
                        <div ref={node => this.messagesEnd = node} ></div>
                    </Comment.Group>
                </Segment>

                <MessageForm getMessagesRef={this.getMessagesRef} isPrivate={isPrivate} messagesRef={messagesRef} curChannel={curChannel} curUser={curUser} />
            </React.Fragment>
        )
    }
}

export default connect(null, { setUserPosts })(Messages)