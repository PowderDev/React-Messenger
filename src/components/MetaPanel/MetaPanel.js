import React from 'react';
import { Accordion, Header, Segment, Icon, AccordionContent, Image, List, ListContent, ListHeader, ListDescription } from 'semantic-ui-react';

class MetaPanel extends React.Component{

    state = {
        activeIndex: 0,
        isPrivate: this.props.isPrivate,
        curChannel: this.props.curChannel,
    }

    setActiveIndex = (e, titleProps) =>{
        const {index} = titleProps
        const {activeIndex} = this.state
        const newIndex = activeIndex === index ? -1 : index 
        this.setState({activeIndex: newIndex})
    }

    displayTopPosters = (posts) =>
        Object.entries(posts)
            .sort((a, b) => b[1] - a[1])
            .map(([key, val], i) =>(
                <List.Item key={i} >
                    <Image avatar src={val.avatar}/>
                    <ListContent>
                        <ListHeader as='a'>{key}</ListHeader>
                        <ListDescription>{this.formatCount(val.count)}</ListDescription>
                    </ListContent>
                </List.Item>
            ))
            .slice(0, 5)
    
    
    formatCount = num => (num > 1 || num === 0) ? `${num} posts` : `${num} post`

    render(){
        const {activeIndex, isPrivate, curChannel} = this.state
        const {userPosts} = this.props

        if (isPrivate) return null


        return(
            <Segment loading={!curChannel} >
                <Header as='h3' attached='top'>
                    About # {curChannel && curChannel.name}
                </Header>
                <Accordion styled attached='true'>
                    <Accordion.Title active={activeIndex === 0} index={0} onClick={this.setActiveIndex} >
                            <Icon name='dropdown' />
                            <Icon name='info' />
                            Channel Details
                        </Accordion.Title>
                        <AccordionContent active={activeIndex === 0} >
                            <p className='pouring' >{curChannel && curChannel.details}</p>
                    </AccordionContent>


                    <Accordion.Title active={activeIndex === 1} index={1} onClick={this.setActiveIndex} >
                            <Icon name='dropdown' />
                            <Icon name='user circle' />
                            Top posters
                        </Accordion.Title>
                        <AccordionContent active={activeIndex === 1} >
                            <List>
                                {userPosts && this.displayTopPosters(userPosts)}
                            </List>
                    </AccordionContent>

                    <Accordion.Title active={activeIndex === 3} index={3} onClick={this.setActiveIndex} >
                            <Icon name='dropdown' />
                            <Icon name='pencil alternate' />
                            Created By
                        </Accordion.Title>
                        <AccordionContent active={activeIndex === 3} >
                            <Header>
                                <Image src={curChannel && curChannel.createdBy.avatar} avatar/>
                                {curChannel && curChannel.createdBy.name}
                            </Header>
                    </AccordionContent>
                </Accordion>
            </Segment>
        )
        


    }
}

export default MetaPanel