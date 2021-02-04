import React from 'react';
import {Menu} from 'semantic-ui-react'
import UserPanel from './UserPanel'
import Channels from './Channels'
import DirectMessages from './DirectMessages'
import FavoriteChannels from './FavoriteChannels'

class SidePanel extends React.Component{


    render(){
        const {primaryColor} = this.props
        return(
            <Menu size='large' inverted fixed='left' vertical style={{background: primaryColor , fontSize: '1.2rem'}}>
                <UserPanel primaryColor={primaryColor} curUser={this.props.curUser} />
                <FavoriteChannels curUser={this.props.curUser} />
                <Channels isPrivate={this.props.isPrivate} curUser={this.props.curUser} />
                <DirectMessages isPrivate={this.props.isPrivate} curUser={this.props.curUser} />
            </Menu>
        )
    }
}

export default SidePanel