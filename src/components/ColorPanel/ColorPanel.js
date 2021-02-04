import React from 'react';
import { Button, Divider, Icon, Input, Label, Menu, Modal, Segment, Sidebar } from 'semantic-ui-react';
import { CirclePicker  } from 'react-color'
import firebase from '../../firebase'
import { setColors } from '../../redux/actions'
import { connect } from 'react-redux'


class ColorPanel extends React.Component{

    state ={
        modal: false,
        primary: '',
        secondary: '',
        usersRef: firebase.database().ref('users'),
        curUser: this.props.curUser,
        userColors: []
    }

    componentDidMount(){
        if (this.state.curUser){
            this.addListeners(this.state.curUser.uid)
        }
    }

    componentWillUnmount() {
        this.removeListener()
    }

    removeListener = () => {
        this.state.usersRef.child(`${this.state.curUser.uid}/colors`).off()
    }

    addListeners = (userId) => {
        let userColors = []
        this.state.usersRef.child(`${userId}/colors`)
        .on('child_added', snap =>{
            userColors.unshift(snap.val())
            this.setState({ userColors })
        })
    }

    opanModal = () => this.setState({ modal: true })
    closeModal = () => this.setState({ modal: false })

    handleChangePrimary = ( color ) => this.setState({ primary: color.hex })

    handleChangeSecondary = ( color ) => this.setState({ secondary: color.hex })

    handlerSaveColors = () =>{
        const { primary, secondary } = this.state

        if (primary && secondary){
            this.saveColors( primary, secondary )
        }
    }

    saveColors = ( primary, secondary ) =>{
        this.state.usersRef
            .child(`${this.state.curUser.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .then(() =>{
                this.closeModal()
            })
            .catch(err =>{
               console.log(err); 
            })
            
    }

    displayUserColors = (colors) =>(
        colors.length > 0 && colors.map((color, i) =>(
            <React.Fragment key={i}>
                <Divider />
                <div className='color__container' onClick={() => this.props.setColors(color.primary, color.secondary)} >
                    <div className="color__square" style={{background: color.primary}} >
                        <div className="color__overlay" style={{background: color.secondary, }} >
                        </div>
                    </div>
                </div>
            </React.Fragment>
        ))
    )

    


    render(){
        const { modal, primary, secondary, userColors } = this.state

        return(
            <Sidebar as={Menu} icon='labeled' vertical visible inverted width='very thin'>
                <Divider />
                <Button icon='add' size='small' color='blue' onClick={this.opanModal}/>
                {this.displayUserColors(userColors)}
                
                <Modal basic open={modal} onClose={this.closeModal}>
                    <Modal.Header>Choose app colors</Modal.Header>
                    <Modal.Content>
                        <Segment inverted   style={{display: 'flex', alignItems:'center', flexDirection: 'column', paddingTop: '0', justifyContent: 'space-between'}} >
                            <Label content='Primary Color' style={{marginBottom: '10px', backgroundColor: 'inherit', color: 'white', fontSize: '20px'}} />
                            <CirclePicker color={primary} onChange={this.handleChangePrimary} />
                        </Segment>

                        <Segment inverted  style={{display: 'flex', alignItems:'center', flexDirection: 'column', paddingTop: '0', justifyContent: 'space-between'}} >
                            <Label content='Secondary Color' style={{marginBottom: '10px', backgroundColor: 'inherit', color: 'white', fontSize: '20px'}} />
                            <CirclePicker color={secondary} onChange={this.handleChangeSecondary} />
                        </Segment>
                    </Modal.Content>

                    <Modal.Actions>
                        <Button color='green' inverted onClick={this.handlerSaveColors} > <Icon name='checkmark'/> Save Colors </Button>
                        <Button color='red' inverted onClick={this.closeModal} > <Icon name='remove'/> Cancel </Button>
                    </Modal.Actions>
                </Modal>
            </Sidebar>
        )    
    }
}

export default connect(null, { setColors })(ColorPanel)