import {
    TEXT_LOADING,
    TEXT_LOADED
  } from "../actions/types";
  
  const initialState = {
    text: "    ",
    isTextLoading: false,

  };
  
  export default function(state = initialState, action) {
    switch (action.type) {
      case TEXT_LOADING:
        return {
          ...state,
          isTextLoading: true
        };
      case TEXT_LOADED:
      console.log(action.payload)
        return {
          ...state,
          isTextLoading: false,
          text: action.payload
        };
      default:
        return state;
    }
  }
  