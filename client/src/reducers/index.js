import { combineReducers } from "redux";
import errorReducer from "./errorReducer";
import authReducer from "./authReducer";
import textReducer from "./textReducer";

export default combineReducers({
  error: errorReducer,
  auth: authReducer,
  text: textReducer
});
