import React from 'react';
import {Button, Dropdown, Grid, GridColumn, GridRow, Header, HeaderContent, Icon, Image, Input, Modal} from 'semantic-ui-react'
import firebase from '../../firebase'
import {connect} from 'react-redux'
import AvatarEditor from 'react-avatar-editor'

class UserPanel extends React.Component{

    state = {
        user: this.props.curUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        userRef: firebase.auth().currentUser,
        metadata: {
            currentType: 'image/jpeg'
        },
        uploadAvatarImage: '',
        usersRef: firebase.database().ref('users'),
        messagesRef: firebase.database().ref('messages')
    }

    handlerSignOut = () =>{
        firebase
            .auth()
            .signOut()
    }

    openModal = () => this.setState({ modal: true })
    closeModal = () => this.setState({ modal: false })

    handlerChange = (e) =>{
        const file = e.target.files[0]
        const reader = new FileReader()

        if (file) {
            reader.readAsDataURL(file)
            reader.addEventListener('load', () =>{
                this.setState({ previewImage: reader.result })
            })
        }
    }

    handlerPreview = () =>{
        if (this.avatarEditor){
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob =>{
                let imageURL = URL.createObjectURL(blob)
                this.setState({
                    croppedImage: imageURL,
                    blob
                })
            })
        }
    }

    setUserAvatar = () =>{
        const { storageRef, userRef, blob, metadata, uploadAvatarImage } = this.state

        storageRef
            .child(`avatars/users/${userRef.uid}`)
            .put(blob, metadata)
            .then( snap =>{
                snap.ref.getDownloadURL().then(Url =>{
                    this.setState({ uploadAvatarImage: Url }, () => this.changeAvatar())
                })
            })
    }

    changeAvatar = () =>{
        this.state.userRef
            .updateProfile({
                photoURL: this.state.uploadAvatarImage
            })
            .catch(err =>{
                console.log(err);
            })

        this.state.usersRef
            .child(this.state.userRef.uid)
            .update({ avatar: this.state.uploadAvatarImage })
            .catch(err =>{
                console.log(err);
            })
            
        this.state.messagesRef
            .on('child_added', snap =>{
                Object.entries(snap.val()).map(([key, val]) =>{
                    if(val.user.name == this.state.userRef.displayName){
                        this.state.messagesRef
                            .child(snap.key)
                            .child(key)
                            .update({ user : {
                                avatar: this.state.uploadAvatarImage,
                                name: this.state.userRef.displayName
                            }})

                            .catch(err =>{
                                console.log(err);
                            })
                    }
                })
            })    
    }


    render(){
        const {user, modal, previewImage, croppedImage} = this.state
        const {primaryColor} = this.props


        return user && (
            <Grid style={{background: primaryColor }} >
                <Grid.Column>
                    <Grid.Row style={{padding: '1.2rem', marginBottom: '-10px'}}>
                        <Header inverted floated='left' as='h2'>
                            <Icon name='american sign language interpreting'/>
                            <HeaderContent style={{whiteSpace:'nowrap'}} >Invalid Chat</HeaderContent>
                        </Header>
                    </Grid.Row>

                    <Header style={{padding: '1em'}} as='h4' inverted>
                        <Dropdown trigger={
                            <span style={{fontSize: '1.2rem'}}>
                                <Image src={ user.photoURL} spaced='right' avatar/>
                                { user.displayName}
                            </span>
                        } >
                            <Dropdown.Menu>
                                <Dropdown.Item disabled={true}><span>Signed is as <strong>{ user && user.displayName}</strong></span></Dropdown.Item>
                                <Dropdown.Item onClick={this.openModal} ><span>Change Avatar</span></Dropdown.Item>
                                <Dropdown.Item onClick={this.handlerSignOut}><span>Sign out</span></Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>    
                    </Header>

                        <Modal shorthand open={modal} onClose={this.closeModal} >
                            <Modal.Header>Change Avatar</Modal.Header>
                            <Modal.Content>
                                <Input onChange={this.handlerChange} fluid type='file' label='New Avatar' name='avatarImage' />
                                <Grid centered stackable columns={2} >
                                    <GridRow centered >
                                        <Grid.Column className='ui center aligned grid' >
                                            {previewImage && (
                                                <AvatarEditor ref={ node => (this.avatarEditor = node) } image={previewImage} width={200} height={200} border={50} scale={1.2} />
                                            )}
                                        </Grid.Column>

                                        <GridColumn>
                                            {croppedImage && (
                                                <Image style={{margin: '3.5em auto'}} width={100} height={100} src={croppedImage} />
                                            )}
                                        </GridColumn>
                                    </GridRow>
                                </Grid>
                            </Modal.Content>

                            <Modal.Actions>

                                { croppedImage && ( 
                                <Button onClick={this.setUserAvatar} color='green' inverted >
                                    <Icon name='save' /> Change Avatar
                                </Button>
                                )
                            }

                                <Button color='yellow' inverted onClick={this.handlerPreview} >
                                    <Icon name='image' /> Preview
                                </Button>

                                <Button color='red' inverted onClick={this.closeModal} >
                                    <Icon name='remove' /> Cancel
                                </Button>

                            </Modal.Actions>

                        </Modal>

                </Grid.Column>            
            </Grid>
        )
    }
}

export default UserPanel