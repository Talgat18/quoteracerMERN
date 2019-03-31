import React, { Component } from "react";
import heart from "../img/like.png";
import pause from "../img/pause.png";
import play from "../img/play-button.png";
import axios from "axios";
import { connect } from "react-redux";
import { addScore } from "../actions/authActions";
import { loadText } from "../actions/textActions";
import { Button, Modal, ModalHeader, ModalFooter } from "reactstrap";
import { TimelineMax, TweenMax } from "gsap";
let tl = new TimelineMax();

export class Typeracer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      livesTimer: 0,
      shakingTimer: 0,
      WPM_TIMER: 0,
      modal: false,
      score: 0,
      input: "",
      text: "",
      typeWithin: 0,
      timeLeft: 0,
      live: 3,
      isPlaying: true,
      paused: false,
      secondsCounter: 0,
      typedEntries: 0,
      record: 0,
      WPM: 0
    };
    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState(prevState => ({
      modal: !prevState.modal
    }));
  }
  // Чтобы получить новый рекорд с сервера, надо обновить страницу

  componentDidMount =  () => {
    this.animations(); // Тригер анимаций
    this.getText();
    if (this.props.isTextLoading === false) {
      this.startIntervals(); // Тригер интервалов
      let shakingTimer = setInterval(this.handlingShaking.bind(this), 1000);
      this.setState({
        shakingTimer: shakingTimer
      });
    }

    document.getElementById("h-img0").style.display = "none";
  };

  //--------------INTERVALS-----------------//

  startIntervals = () => {
    let time = setInterval(this.timer.bind(this), 1000);
    this.setState({
      time: time
    });
    let livesTimer = setInterval(this.livesHandling.bind(this), 2000);
    this.setState({
      livesTimer: livesTimer
    });
    let WPM_TIMER = setInterval(this.countWPM.bind(this), 2000);
    this.setState({
      WPM_TIMER: WPM_TIMER
    });
  };

  //---------------TEXT-----------------//

  getText() {
    // прямо тут
    axios
      .get("https://fish-text.ru/get?type=title&format=html")
      .then(response => {
        let text = response.data.replace("<h1>", "").replace("</h1>", "");
        let typeWithin = Math.floor(
          response.data.replace("<h1>", "").replace("</h1>", "").length / 3
        );
        this.setState({
          text: text,
          typeWithin: typeWithin,
          timeLeft: typeWithin
        });
      })
      .catch(function(error) {
        // handle error
        console.log(error);
      });
  }

  gettingText = () => {
    // в редаксе
    this.props.loadText();
    if (this.props.isTextLoading === false) {
      console.log("This is prop text", this.props.text);
      let loadedText = this.props.text;
      let text = loadedText.replace("<h1>", "").replace("</h1>", "");
      let typeWithin = Math.floor(
        loadedText.replace("<h1>", "").replace("</h1>", "").length / 3
      );
      this.setState({
        text: text,
        typeWithin: typeWithin,
        timeLeft: typeWithin
      });
    }
  };

  someShit = () => {
    console.log("This is prop text", this.props.text);
  };

  //---------------WPM-----------------//

  countWPM = () => {
    const WPM = Math.round(
      this.state.typedEntries / 5 / (this.state.secondsCounter / 10 / 60) / 10
    );
    this.setState({ WPM: WPM });
  };

  //---------------LIVES HANDLE-----------------//

  livesHandling = () => {
    const quoteInput = document.querySelector("#quote-input");
    const currentQuote = document.querySelector("#current-quote");
    if (currentQuote.innerHTML.includes(quoteInput.value)) {
    } else {
      this.state.live--;
      document.getElementById(`h-img${this.state.live}`).style.display = "none";
    }
    if (this.state.live === 0) {
      this.setState({ isPlaying: false });
      this.checkGameStatus();
      clearInterval(this.state.livesTimer);
    }
  };

  timer = () => {
    if (this.state.timeLeft > 0) {
      // Если время еще есть
      this.setState({ timeLeft: this.state.timeLeft - 1 });
      this.setState({ secondsCounter: this.state.secondsCounter + 1 });
      if (this.props.auth.user) {
        // Если юзер зареган
        if (this.props.auth.user.score < this.state.score) {
          this.setState({ record: this.state.score });
        } else {
          this.setState({ record: this.props.auth.user.score });
        }
      }
    } else if (this.state.timeLeft === 0) {
      this.setState({ isPlaying: false });
      this.checkGameStatus();
    }
  };

  //---------------MATCHING SCORE AND RECORD-----------------//

  matchingScoreAndRec = () => {
    // Put on Server and check if user===true
    if (
      localStorage.getItem("score") < localStorage.getItem("scorez") &&
      this.props.auth.user != null
    ) {
      this.onAddScoreClick(localStorage.getItem("_id"), this.state.score);
    }
  };

  checkGameStatus = () => {
    if (this.state.isPlaying === false) {
      // Clearing stuff
      this.setState({ timeLeft: -1 });
      this.setState({ score: 0 });
      localStorage.setItem("scorez", 0);
      clearInterval(this.state.time);
      document.getElementById("timer").style.color = "#fff";

      this.toggle();
    }
  };

  //---------------UPDATE AFTER MODAL CLICK-----------------//

  updateGame = () => {
    this.getText();
    this.toggle();
    clearInterval(this.state.time);
    this.startIntervals();
    this.setState({
      live: 3
    });
    document.getElementById("h-img1").style.display = "inline";
    document.getElementById("h-img2").style.display = "inline";
    document.getElementById("h-img3").style.display = "inline";
    document.getElementById("quote-input").value = "";
    document.getElementById("quote-input").style.background = "";
  };

  //---------------ONCHANGE-----------------//

  onChange = e => {
    this.setState({ typedEntries: e.target.value.length });
    this.setState({ [e.target.name]: e.target.value });
    if (this.state.text.startsWith(e.target.value)) {
      document.getElementById("quote-input").style.background = "";
    } else {
      document.getElementById("quote-input").style.background = "red";
    }
    if (e.target.value === this.state.text) {
      this.addingScore();
      this.getText();
      e.target.value = "";
      e.target.style.background = "";
      document.getElementById("timer").style.color = "#fff";
    }
  };

  //---------------RECORD-----------------//

  addingScore = () => {
    this.setState({ smth: this.state.score++ });
    localStorage.setItem("scorez", this.state.score);
    this.matchingScoreAndRec(); // updating record on server
  };

  onAddScoreClick = (id, score) => {
    this.props.addScore(id, score);
  };

  //---------------PAUSE-----------------//

  handlePause = () => {
    // Change icon
    this.setState(prevState => ({
      paused: !prevState.paused
    }));
    // Handle intervals
    if (!this.state.paused) {
      clearInterval(this.state.time);
      clearInterval(this.state.livesTimer);
      clearInterval(this.state.WPM_TIMER);
      document.getElementById("quote-input").disabled = true;
    } else {
      let livesTimer = setInterval(this.livesHandling.bind(this), 2000);
      this.setState({
        livesTimer: livesTimer
      });
      let time = setInterval(this.timer.bind(this), 1000);
      this.setState({
        time: time
      });
      let WPM_TIMER = setInterval(this.handlingShaking.bind(this), 2000);
      this.setState({
        WPM_TIMER: WPM_TIMER
      });
      document.getElementById("quote-input").disabled = false;
    }
  };

  //---------------ANIMATIONS-----------------//

  animations = () => {
    tl.fromTo(
      ".lives",
      1,
      {
        x: -50,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1
      }
    );
    tl.fromTo(
      "#btn-pause",
      1,
      {
        y: -50,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1
      }
    );
    tl.fromTo(
      "#records-f",
      1,
      {
        x: 50,
        opacity: 0
      },
      {
        x: 0,
        opacity: 1
      }
    );
  };

  handlingShaking = () => {
    let timeLeft = this.state.timeLeft;

    if (timeLeft < 11 && timeLeft !== -1 && this.state.paused === false) {
      TweenMax.to(".timer", 0.1, { x: "+=40", yoyo: true, repeat: 5 }); // shaking animation
      TweenMax.to(".timer", 0.1, { x: "-=20", yoyo: true, repeat: 5 }); // shaking animation
      document.getElementById("timer").style.color = "#D75A4A";
    }
  };

  render() {
    const { user } = this.props.auth;
    if (user) {
      localStorage.setItem("score", user.score);
    }

    return (
      <div className="container text-center">
        <div className="row mt-5">
          <div className="col-md-4">
            <h3 className="lives">
              Live <img src={heart} id="h-img0" alt="" />
              <img src={heart} id="h-img1" alt="" />
              <img src={heart} id="h-img2" alt="" />
              <img src={heart} id="h-img3" alt="" />
            </h3>
          </div>
          <div className="col-md-4">
            <h3>
              <img
                src={this.state.paused ? play : pause}
                id="btn-pause"
                alt=""
                onClick={this.handlePause}
              />
            </h3>
          </div>
          <div className="col-md-4">
            <h3 id="records-f">
              <strong>
                {this.state.record !== 0
                  ? `Your record = ${this.state.record}`
                  : `Login and Get one point at least`}
              </strong>
            </h3>
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mx-auto">
            <p className="lead">
              Type Within {}
              <span className="text" id="seconds">
                {this.state.typeWithin}
              </span>{" "}
              Seconds:
            </p>
            <h2 className="mt-3" id="current-quote">
              {this.state.text}
            </h2>
            <input
              type="text"
              name="input"
              className="form-control form-control-lg"
              placeholder="Start typing..."
              id="quote-input"
              onChange={this.onChange}
            />

            <div className="row mt-5 bottom-marks">
              <div className="col-md-4">
                <div className="timer" id="timer">
                  <h3>
                    Time Left: <span id="time">{this.state.timeLeft}</span>
                  </h3>
                </div>
              </div>
              <div className="col-md-4">
                <h3>
                  WPM: <span id="wpm">{this.state.WPM}</span>
                </h3>
              </div>
              <div className="col-md-4">
                <h3>
                  Score: <span id="score">{this.state.score}</span>
                </h3>
              </div>
            </div>
          </div>
        </div>
        <span className="note" id="note">
          Перезагрузите страницу для обновления рекорда.
        </span>{" "}
        <button className="alert-danger" onClick={this.gettingText}>
          {" "}
          123
        </button>
        <button className="alert-danger" onClick={this.someShit}>
          {" "}
          124
        </button>
        <Modal
          isOpen={this.state.modal}
          toggle={this.toggle}
          className={this.props.className}
        >
          <ModalHeader toggle={this.toggle}>
            {this.state.live === 0
              ? "You died. Trey again?"
              : "Time is over. Try again?"}
          </ModalHeader>

          <ModalFooter>
            <Button color="primary" onClick={this.updateGame}>
              Yes
            </Button>{" "}
            <Button color="secondary" onClick={this.toggle}>
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated,
  record: state.auth.score,
  auth: state.auth,
  text: state.text.text,
  isTextLoading: state.text.isTextLoading
});

export default connect(
  mapStateToProps,
  { addScore, loadText }
)(Typeracer);
