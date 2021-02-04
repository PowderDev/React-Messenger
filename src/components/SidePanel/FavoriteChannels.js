import React, { Component } from 'react';
import {Menu, Icon} from 'semantic-ui-react'
import {connect} from 'react-redux'
import {setPrivateChannel, setCurrentChannel} from '../../redux/actions/index'
import firebase from '../../firebase'

class FavoriteChannels extends Component {

    state = {
        favoriteChannels: [],
        activeChannel: localStorage.getItem('numFavorite') || 0,
        curUser: this.props.curUser,
        usersRef: firebase.database().ref('users')
    }

    componentDidMount(){
        if(this.state.curUser){
            this.addListeners(this.state.curUser.uid)
        }
    }

    componentWillUnmount(){
        this.removeListeners()
    }

    removeListeners = () =>{
        this.state.usersRef.child(`${this.state.curUser.uid}/starred`).off()
    }

    addListeners =(userId) =>{
        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_added', snap =>{
                const starredChannel = {id: snap.key, ...snap.val()}
                this.setState({
                    favoriteChannels: [...this.state.favoriteChannels, starredChannel]
                })
            })

        this.state.usersRef
            .child(userId)
            .child('starred')
            .on('child_removed', snap =>{
                const channelToRemove = {id: snap.key, ...snap.val()}
                const filteredChannels = this.state.favoriteChannels.filter(channel => channel.id !== channelToRemove.id)
                this.setState({favoriteChannels: filteredChannels})
            })

    }

    displayChannels = favoriteChannels =>
        favoriteChannels.length > 0 &&
        favoriteChannels.map((channel, i) => (
        <Menu.Item
            key={channel.id}
            onClick={() => this.changeChannel(channel, i)}
            name={channel.name}
            style={{ opacity: 0.7 }}
            active={!this.props.isPrivate && i === this.state.activeChannel}
        >
            # {channel.name}
        </Menu.Item>
    ));

    changeChannel = (channel, i) => {
        this.setState({activeChannel: i, curChannel: channel.id});
        this.props.setCurrentChannel(channel);
        this.props.setPrivateChannel(false);
        localStorage.setItem('numFavorite', `${i}`)
  };

    render() {
        const { favoriteChannels } = this.state

        return (
            <Menu.Menu className="menu">
                <Menu.Item style={{fontSize: '1.15rem'}}>
                    <span>
                    <Icon name="star" /> Favorite
                    </span>{" "}
                    ({favoriteChannels.length}) 
                </Menu.Item>
                {this.displayChannels(favoriteChannels)}
            </Menu.Menu>
        );
    }
}

export default connect(null, {setCurrentChannel, setPrivateChannel})(FavoriteChannels);