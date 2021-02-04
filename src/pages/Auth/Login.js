import React from 'react';
import { Grid, Form, Segment, Button, Header, Message, Icon, FormInput } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import firebase from '../../firebase'


export default class Login extends React.Component {

    state = {
        email: '',
        password: '',
        errors: [],
        loading: false,
    }

    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>)



    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    handlerSubmit = (e) => {
        e.preventDefault()

        if (this.isFormValid(this.state)) {
            this.setState({ errors: [], loading: true })
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then(signedUser => {
                    this.setState({ loading: false })
                })
                .catch(err => {
                    console.log(err);
                    this.setState({
                        errors: this.state.errors.concat('err'),
                        loading: false
                    })
                })
        }

    }

    handlerInputError = (errors, inputName) => {
        return errors.some(err => err.message.toLowerCase().includes(inputName)) ? 'error' : ''
    }

    isFormValid = ({ email, password }) => email && password



    render() {
        const { password, email, errors, loading } = this.state


        return (
            <Grid textAlign='center' verticalAlign='middle' className='app'>
                <Grid.Column style={{ maxWidth: 450 }}>
                    <Header as='h1' icon color='violet' textAlign='center'>
                        <Icon name='wheelchair' color='violet' />
                        Login for Invalid Chat
                    </Header>
                    <Form size='large' onSubmit={this.handlerSubmit}>
                        <Segment stacked>
                            <Form.Input className={this.handlerInputError(errors, 'email')} value={email} type='email' fluid name='email' icon='mail' iconPosition='left' placeholder='Email' onChange={this.handleChange} />
                            <Form.Input className={this.handlerInputError(errors, 'password')} value={password} type='password' fluid name='password' icon='lock' iconPosition='left' placeholder='Password' onChange={this.handleChange} />
                            <Button disabled={loading} className={loading ? 'loading' : ''} color='violet' fluid size='large'>Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account?  <Link to='/register'>Sing up</Link></Message>
                </Grid.Column>
            </Grid>
        )
    }
}