import {combineReducers} from 'redux'
import {user_reducer} from './reducers'
import {channel_reducer} from './reducers/channelReducer'
import {colors_reducer} from './reducers/colors'

const RootReducer = combineReducers({
    user: user_reducer,
    channel: channel_reducer,
    colors: colors_reducer
})

export default RootReducer