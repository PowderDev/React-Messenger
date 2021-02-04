import React from 'react';
import { Button, Icon, Input, Modal } from 'semantic-ui-react';
import mime from 'mime-types'

class FileModal extends React.Component{

    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png', 'image/jpg']
    }

    addFile = (e) =>{
        const file = e.target.files[0]
        if(file){
            this.setState({file })
        }
    }

    sendFile = (e) =>{
        const {file} = this.state
        const {uploadFile, closeModal} = this.props

        if (file !== null){
            if (this.isAuthorized(file.name)){
                const metadata = {contentType: mime.lookup(file.name)}
                uploadFile(file, metadata)
                closeModal()
            }
        }
    }

    isAuthorized = (filename) => this.state.authorized.includes(mime.lookup(filename))

    clearFile = () => this.setState({file: null})
    render(){
        const {modal, closeModal} = this.props

        return(
            <Modal basic open={modal} onClose={closeModal}>
                <Modal.Header>Select an image file</Modal.Header>
                <Modal.Content>
                    <Input onChange={this.addFile} fluid label='File types: png, jpg' type='file' name='file'/>
                </Modal.Content>
                <Modal.Actions>
                    <Button onClick={this.sendFile} color='green' inverted>
                        <Icon name='checkmark'/> Send
                    </Button>

                    <Button color='red' inverted onClick={closeModal}>
                        <Icon name='remove'/> Cancel
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default FileModal