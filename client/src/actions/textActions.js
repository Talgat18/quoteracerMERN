import axios from "axios";
import { returnErrors } from "./errorActions";
import { TEXT_LOADING, TEXT_LOADED } from "./types";

export const loadText = () => dispatch => {
  dispatch({ type: TEXT_LOADING });

  axios
    .get("https://fish-text.ru/get?type=title&format=html")
    .then(res => dispatch({ type: TEXT_LOADED, payload: res.data }))
    .catch(err => {
      dispatch(returnErrors(err.response.data, err.response.status));
    });
};
