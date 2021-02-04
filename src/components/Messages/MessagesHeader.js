import React from 'react';
import { Header, Icon, Input, Segment } from 'semantic-ui-react';

class MessagesHeader extends React.Component{


    render(){
        const {channel, numUniqueUsers, isChannelStarred,  handleSearch, searchLoading, isPrivate, handleStar} = this.props

        return(
            <Segment clearing>
                <Header as='h2' floated='left' style={{marginBottom: 0}}>
                    <span>
                        {channel}
                        {!isPrivate && <Icon onClick={handleStar} name={isChannelStarred ? 'star' : 'star outline'} color={isChannelStarred ? 'yellow' : 'black'} />}
                    </span>
                    <Header.Subheader>{numUniqueUsers}</Header.Subheader>
                </Header>
                <Header floated='right'>
                    <Input loading={searchLoading} onChange={handleSearch} size='mini' icon='search' name='searchItem' placeholder='Search Messages'/>
                </Header>
            </Segment>
        )
    }
}


export default MessagesHeader