import React, { Component } from 'react';
import './App.css';
import {Grid} from 'semantic-ui-react'
import ColorPanel from './components/ColorPanel/ColorPanel'
import SidePanel from './components/SidePanel/SidePanel'
import Messages from './components/Messages/Messages'
import MetaPanel from './components/MetaPanel/MetaPanel'
import {connect} from 'react-redux'



const App = ({curUser , curChannel, isPrivate, userPosts, primaryColor, secondaryColor}) =>{
  return(
    <Grid columns='equal' className='app' style={{background: secondaryColor}}>
      <ColorPanel key={curUser && curUser.name} curUser={curUser} />
      <SidePanel primaryColor={primaryColor} curUser={curUser} isPrivate={isPrivate} key={curUser && curUser.uid} />

      <Grid.Column style={{marginLeft: 320}}>
        <Messages isPrivate={isPrivate} key={curChannel && curChannel.id} curChannel={curChannel} curUser={curUser}/>
      </Grid.Column>
      
      <Grid.Column width={4}>
        <MetaPanel userPosts={userPosts} curChannel={curChannel}  isPrivate={isPrivate} key={curChannel && curChannel.name} />
      </Grid.Column>
  </Grid>
  )
}



const mapStateToProps = state =>{
  return{
    curUser: state.user.currentUser,
    curChannel: state.channel.currentChannel,
    isPrivate: state.channel.isPrivate,
    userPosts: state.channel.userPosts,
    primaryColor: state.colors.primaryColor,
    secondaryColor: state.colors.secondaryColor
  }
}


export default connect(mapStateToProps)(App);
