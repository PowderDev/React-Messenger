import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom'
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import 'semantic-ui-css/semantic.min.css'
import firebase from './firebase'
import {createStore} from 'redux'
import {Provider, connect} from 'react-redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import RootReducer from './redux/roorReducer'
import {setUser , singOutUser} from './redux/actions/index'
import Spinner from './components/Spinner'


const store = createStore(RootReducer, composeWithDevTools())



class Root extends React.Component{

    componentDidMount(){
        firebase.auth().onAuthStateChanged(user =>{
           if (user){
            this.props.setUser(user)
            this.props.history.push('/')
           } else{
               this.props.history.push('/login')
               this.props.singOutUser()
           }
        })
    }

    render(){
        return this.props.isLoading ? <Spinner /> :(
            <Switch>
                <Route path='/' exact component={App} />
                <Route path='/login' component={Login} />
                <Route path='/register' component={Register} />
            </Switch>
        )
    }
}

const mapStateToProps = (state) =>{
    return{
        isLoading: state.user.isLoading
    }
}


const RootApp = withRouter(connect(mapStateToProps, {singOutUser, setUser})(Root)) 


ReactDOM.render(
<Provider store={store}>
    <Router>
        <RootApp/>
    </Router>
</Provider>
, document.getElementById('root'));
registerServiceWorker();
