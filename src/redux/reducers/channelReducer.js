import * as actionType from '../actions/actionTypes'

const init ={
    currentChannel: null,
    isPrivate: false,
    userPosts: null
}

export const channel_reducer = (state = init, action) =>{
    switch(action.type){
        case actionType.SET_CURRENT_CHANNEL:
            return{
                ...state,
                currentChannel: action.payload.currentChannel
            }

        case actionType.SET_PRIVATE_CHANNEL:
            return{
                ...state,
                isPrivate: action.payload.isPrivate
            }
            
        case actionType.SET_USER_POSTS:
            return {
                ...state,
                userPosts: action.payload.userPosts
            }    

        default:
            return state
    }
}