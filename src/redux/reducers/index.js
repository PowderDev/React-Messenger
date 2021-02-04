import * as actionTypes from '../actions/actionTypes'

const initialUserState = {
    currentUser: null,
    isLoading: true,

}

export const user_reducer = (state = initialUserState, action) =>{
    switch(action.type){
        case actionTypes.SET_USER: 
        return {
            ...state,
            currentUser: action.payload.currentUser,
            isLoading: false
        }

        case actionTypes.SIGN_OUT_USER :
        return {
            ...state,
            isLoading: false
        }


        default: return state
    }
}

