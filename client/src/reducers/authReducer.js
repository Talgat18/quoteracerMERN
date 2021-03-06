import {
  USER_LOADED,
  USER_LOADING,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT_SUCCESS,
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  ADD_SCORE
} from "../actions/types";

const initialState = {
  token: localStorage.getItem("token"),
  isAuthenticated: null,
  isLoading: false,
  user: {_id: null, score: 0},
  score: null
};

export default function(state = initialState, action) {
  switch (action.type) {
    case USER_LOADING:
      return {
        ...state,
        isLoading: true
      };
    case USER_LOADED:
      localStorage.setItem("score", action.payload.score);
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload,
        score: action.payload.score
      };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      console.log("registered", action.payload);
      localStorage.setItem("score", action.payload.score);
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem('_id',action.payload.user.id)
      return {
        ...state,
        ...action.payload,
        isAuthenticated: true,
        isLoading: false,
        score: action.payload.score
      };
    case AUTH_ERROR:
    case LOGIN_FAIL:
    case LOGOUT_SUCCESS:
    case REGISTER_FAIL:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    case ADD_SCORE:
      return {
        ...state,
        isAuthenticated: true,

      }
    default:
      return state;
  }
}
