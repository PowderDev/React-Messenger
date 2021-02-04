import * as actionType from '../actions/actionTypes'

const init ={
    primaryColor: '#4c3c4c',
    secondaryColor: '#eee'
}

export const colors_reducer = (state = init, action) =>{
    switch(action.type){
        case actionType.SET_COLORS:
            return {
                primaryColor: action.payload.primary,
                secondaryColor: action.payload.secondary
            }

        default:
            return state
    }
}