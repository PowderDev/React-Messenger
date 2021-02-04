import React from 'react';
import { Menu, Icon } from 'semantic-ui-react';
import firebase from '../../firebase'
import {setCurrentChannel, setPrivateChannel} from '../../redux/actions'
import {connect} from 'react-redux'

class DirectMessages extends React.Component{

    state = {
        users: [],
        activeDir: '',
        curUser: this.props.curUser,
        userRef: firebase.database().ref('users'),
        connectedRef: firebase.database().ref('.info/connected'),
        presenceRef: firebase.database().ref('presence')
    }

    componentDidMount(){
        if (this.state.curUser){
            this.addListeners(this.state.curUser.uid)
        }
    }

    componentWillUnmount(){
        this.removeListeners()
    }

    removeListeners = () =>{
        this.state.userRef.off()
        this.state.presenceRef.off()
        this.state.connectedRef.off()
    }
    
    addListeners = (curUser) =>{
        let loadedUsers = []
        this.state.userRef.on('child_added', snap =>{
            if (curUser !== snap.key){
                let user = snap.val()
                user['uid'] = snap.key
                user['status'] = 'offline'
                loadedUsers.push(user)
                this.setState({users: loadedUsers})
            }
        })

        this.state.connectedRef.on('value', snap =>{
            if (snap.val() === true){
                const ref = this.state.presenceRef.child(curUser)
                ref.set(true)
                ref.onDisconnect().remove(err =>{
                    if (err !== null){
                        console.log(err);
                    }
                })
            }
        })

        this.state.presenceRef.on('child_added', snap => {
            if (curUser !== snap.key){
                this.addStatusToUser(snap.key)
            }
        })

        this.state.presenceRef.on('child_removed', snap => {
            if (curUser !== snap.key){
                this.addStatusToUser(snap.key, false)
            }
        })
    }

    addStatusToUser = (userID, connected = true) =>{
        const updatedUsers = this.state.users.reduce((acc, user) =>{
            if (user.uid === userID){
                user['status'] = `${connected ? 'online' : 'offline'}`
            }
            return acc.concat(user)
        }, [])

        this.setState({users: updatedUsers})
    }

    getDirectId = (userId) =>{
        const curUser = this.state.curUser.uid
        return userId < curUser ? `${userId}/${curUser}` : `${curUser}/${userId}`
    }

    changeDirect = (user) =>{
        const DirectId = this.getDirectId(user.uid)
        const DirectData = {
            id: DirectId,
            name: user.name
        }
        this.props.setCurrentChannel(DirectData)
        this.props.setPrivateChannel(true)
        this.setActiveDirect(user.uid)
    }

    setActiveDirect = (id) => {
        this.setState({activeDir: id})
    }


    isUserOnline = (user) => user.status === 'online'

    render(){
        const {users, activeDir} = this.state


        return(
            <Menu.Menu className='menu'>
                <Menu.Item style={{fontSize: '1.15rem'}}>
                    <span>
                        <Icon name='mail' /> Direct Messages
                    </span>{' '}
                    ({ users.length })
                </Menu.Item>
                    {users.map(user =>(
                        <Menu.Item active={this.props.isPrivate && user.uid === activeDir} key={user.uid} onClick={() => this.changeDirect(user)} style={{opacity: 0.7, fontSize: 'italic'}}>
                            <Icon name='circle' color={this.isUserOnline(user) ? 'green' : 'red'}   />
                            @ {user.name}
                        </Menu.Item>
                    ))}
            </Menu.Menu>
        )
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(DirectMessages)