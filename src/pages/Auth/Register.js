import React from 'react';
import {Grid, Form, Segment, Button, Header, Message, Icon, FormInput} from 'semantic-ui-react'
import {Link} from 'react-router-dom'
import firebase from '../../firebase'
import md5 from 'md5'


export default class Register extends React.Component{

    state = {
        username: '',
        email: '',
        password: '',
        passwordConformation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    }

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)

    isNameValid = ({username}) =>{
        if(username.length > 12){
            return false
        }else{
            return true
        }
    }

    isPasswordValid = ({passwordConformation, password}) =>{
        if(password.length < 6 || passwordConformation.length < 6){
            return false
        }else if (password !== passwordConformation){
            return false
        }else{
            return true
        }
    }

    isFromEmpty = ({email, password, username, passwordConformation}) =>{
        return !username.length || !password.length || !email.length || !passwordConformation.length
    }

    isFormValid = () =>{
        let errors = []
        let error;


        if (this.isFromEmpty(this.state)){
            error = {message: 'Fill in all fields'}
            this.setState({ errors: errors.concat(error)})
            return false
        }else if (!this.isPasswordValid(this.state)){
            error = {message: 'Password is invalid'}
            this.setState({ errors: errors.concat(error)})
            return false
        }else if (!this.isNameValid(this.state)){
            error = {message: 'Max username length is 12'}
            this.setState({ errors: errors.concat(error)})
            return false
        }else{
            return true
        }
    }

    handleChange = (e) =>{
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handlerSubmit = (e) =>{
        e.preventDefault()

        if(this.isFormValid()){
        this.setState({errors: [], loading: true})

        firebase
        .auth()
        .createUserWithEmailAndPassword(this.state.email, this.state.password)
        .then(createdUser =>{
            createdUser.user.updateProfile({
                displayName: this.state.username,
                photoURL: `http://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
            })

            .then(() =>{
                this.saveUser(createdUser).then(() =>{
                    this.setState({loading: false})
                })
            })
            .catch(err =>{
                console.log(err);
                this.setState({errors: this.state.errors.concat(err), loading: false})
            })
        })
        .catch(e =>{
            this.setState({loading: false, errors: this.state.errors.concat(e)})
        })

        }

    }

    handlerInputError = (errors, inputName) =>{
        return errors.some(err => err.message.toLowerCase().includes(inputName)) ? 'error' : ''
    }


    saveUser = (createdUser) =>{
        return this.state.usersRef.child(createdUser.user.uid).set({
            name: createdUser.user.displayName,
            avatar: createdUser.user.photoURL
        })
        
    }


    render(){
        const {username, password, email, passwordConformation, errors, loading} = this.state


        return(
            <Grid textAlign='center' verticalAlign='middle' className='app'>
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as='h1' icon color='orange' textAlign='center'>
                        <Icon  name='user circle' color='orange'/>
                        Register for Invalid Chat
                    </Header>
                    <Form size='large' onSubmit={this.handlerSubmit}>
                        <Segment stacked>
                            <Form.Input className={this.handlerInputError(errors, 'username')} value={username} type='text' fluid name='username' icon='user' iconPosition='left' placeholder='Username' onChange={this.handleChange}/>
                            <Form.Input className={this.handlerInputError(errors, 'email')} value={email} type='email' fluid name='email' icon='mail' iconPosition='left' placeholder='Email' onChange={this.handleChange}/>
                            <Form.Input className={this.handlerInputError(errors, 'password')} value={password} type='password' fluid name='password' icon='lock' iconPosition='left' placeholder='Password' onChange={this.handleChange}/>
                            <Form.Input className={this.handlerInputError(errors, 'password')} value={passwordConformation} type='password' fluid name='passwordConformation' icon='lock' iconPosition='left' placeholder='PasswordConformation' onChange={this.handleChange}/>

                            <Button disabled={loading} className={loading ? 'loading' : ''} color='orange' fluid size='large'>Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 &&(
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Already a user? <Link to='/login'>Sing in</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}