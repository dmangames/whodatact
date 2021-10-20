import check from './check.svg';
import remove from './remove.svg';
import './App.css';
import React, {useState, useEffect} from 'react';
import './styles/css/game.css';
import data from './data'

const currentList = ["","","","","","","","","",""];
const movies = ["Greyhound", "Toy Story 4", "The Da Vinci Code", "The Terminal", "The Green Mile", "Cast Away", "Forrest Gump", "Sleepless in Seattle", "Apollo 13", "Punchline"];
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
// const people = [];
var creditsT = [];
var creditToChange = 0;
var personNum = 0;
var level = 0;
var correctLevel = 0;
var isCorrectGuess = false;
var isIncorrectGuess = false;
var isGuessingOver = false;
var timeouts = [];
var pages = [];
var isFirstLoad = true;
var actorAnswer = "";

var gameMsg = "WHO DAT ACT?";

function App() {
  const [selectDiff, setSelectDiff] = useState("none");
  const [showGame, setShowGame] = useState(false);
  const [error, setError] = useState(null);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isPeopleLoaded, setIsPeopleLoaded] = useState(false);
  const [isCreditLoaded, setIsCreditLoaded] = useState(false);
  const [isCastLoaded, setIsCastLoaded] = useState(false);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [page, setPage] = useState(data);
  const [people, setPeople] = useState([]);
  // const [level, setLevel] = useState(0);
  // const [correctLevel, setCorrectLevel] = useState(0);
  const [credits, setCredits] = useState([]);
  const [castCredits, setCastCredits] = useState([]);
  const [creditsShown, setCreditsShown] = useState(["","","","","","","","","",""]);

//ALL USE EFFECTS

  useEffect(() => {
    for(let i = 1; i <= 20; i++){
      pages.push(i);
    }
    shuffleArray(pages);
  },[]);

  useEffect(() => {
    if(showGame){
      onNext();
    }
  }, [showGame])

  //load page, when game start
  useEffect(() => {
    getPage();
  }, []);

  //load people, after page
  useEffect(() => {
    if(!isPageLoaded)
      return;
    console.log("Loading People!!!!!!!!")
    actorAnswer = "WHO DAT ACT?"
    people.length = 0;
    for(let i = 0; i < page.results.length; i++){
      people.push({
        id: page.results[i].id,
        name: page.results[i].name
      });
    }
    setPeople(people);
    setIsPeopleLoaded(true);
  }, [isPageLoaded])

  //load movie credits, after people
  useEffect(() => {
    if(isPeopleLoaded){

      for (var i=0; i<timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
      isCorrectGuess = false;
      isIncorrectGuess = false;
      for(let i = 0; i < currentList.length; i++){
        creditsShown[i] = "";
      }
      creditToChange = 0;
      personNum = 0;
      console.log("personNum: " + personNum);
      console.log("people length: " + people.length);
      if(personNum >= people.length){
        personNum = 0;

        isFirstLoad = true;
        setIsAllLoaded(false);
        getPage();

      }else{
        getMovieCredits(people[personNum].id);
        console.log(people[personNum].name);
        isGuessingOver = false;
      }

    }

  }, [isPeopleLoaded])

  //load cast credits, after movie_credits
  useEffect(() => {
    if(isCreditLoaded)
      getCastCredits();
  }, [isCreditLoaded])

  useEffect(() => {
    if(isCastLoaded){
      setIsAllLoaded(true);
      console.log("All is loaded");
    }
  }, [isCastLoaded])

  const onClickStart = () => {

    console.log({page});

    setShowGame(true);

    // setTimeout(() => {
    //   onNext();
    // }, 1000);
    // setTimeout(() => {
    //   onNextClue();
    // }, 2000);
  }


  const onNext = () => {
    console.log("ON NEXT");
    if(isFirstLoad){
      isFirstLoad = false;
      displayNextClue();
      return;
    }
    for (var i=0; i<timeouts.length; i++) {
      clearTimeout(timeouts[i]);
    }
    isCorrectGuess = false;
    isIncorrectGuess = false;
    for(let i = 0; i < currentList.length; i++){
      creditsShown[i] = "";
    }
    creditToChange = 0;

    personNum+=1;

    console.log("personNum: " + personNum);
    console.log("people length: " + people.length);
    if(personNum >= people.length){
      console.log("GET A NEW PAGE~");
      personNum = -1;
      getPage();
      return;
    }
    level+=1;
    getMovieCredits(people[personNum].id);
    console.log(people[personNum].name);
    isGuessingOver = false;
    onNextClue();
  }

  const onNextClue = () => {
    console.log("getting next clue");
    displayNextClue();

  }

  function getPage(){
    console.log("GET PAGE CALLED");
    setIsPeopleLoaded(false);
    setIsPageLoaded(false);
    var p = pages.pop();
    console.log("Page: " + p);
    fetch(`https://api.themoviedb.org/3/person/popular?api_key=fb48b37664ce32cd71f7541935052f0f&language=en-US&page=${p}`)
      .then(res => res.json())
      .then(
        (result) => {
          setPage(result);
          console.log("Loaded page");
          setIsPageLoaded(true);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          setIsPageLoaded(true);
          setError(error);
          console.log({error});
        }
      )
  }

  function getMovieCredits(personID){
    console.log("GET MOVIE CREDITS CALLED");
    setIsCreditLoaded(false);
    console.log({page});
    console.log(personID);
    console.log(people[personNum].name);
    fetch(`https://api.themoviedb.org/3/person/${personID}/movie_credits?api_key=fb48b37664ce32cd71f7541935052f0f&language=en-US`)
      .then(res => res.json())
      .then(
        (result) => {

          setCredits(result);
          creditsT = result;
          // console.log({isLoaded},{credits});
          // console.log({isLoaded},creditsT);
          setIsCreditLoaded(true);
          console.log("Loaded Credits");
          console.log(creditsT);
        },
        (error) => {
          setIsCreditLoaded(true);
          setError(error);
          console.log("Error: {error}");
        }
      )
  }

  function getCastCredits(){
    console.log("GET CAST CREDITS CALLED");
    setIsCastLoaded(false);
    if(creditsT.cast == null){
      console.log("No cast credits");
      return;
    }
    var cast = creditsT.cast;
    shuffleArray(cast);
    var cNum = 0;
    for(let i = 0; i < cast.length; i++){
      if(cast[i].vote_count < 1000 || cast[i].release_date === "" || cast[i].release_date === null || cast[i].character === "" || cast[i].character === null || cast[i].title === "" || cast[i].title === null){
         // console.log("REJECTED");
         // console.log(cast[i].title, cast[i].vote_count);
      }
      else{
        // console.log("ACCEPTED");
        // console.log(cast[i].title, cast[i].vote_count);
        // currentList[cNum] = cast[i].title;
        currentList[cNum] = {"title": cast[i].title, "character": cast[i].character};
        cNum++;
      }
      if(cNum == 10)
        break;
    }
    console.log({currentList});
    if(cNum < 10){
      if(isFirstLoad){
        personNum++;
        getMovieCredits(people[personNum].id);
        return;
      }
      level-=1;
      onNext();
      return;
    }
    setIsCastLoaded(true);
    console.log("Cast is loaded");
  }

  function displayNextClue(){
    if(!showGame){
      console.log("Game not playing yet");
      return;
    }
    if(creditToChange >= 10){
      console.log("Can't show more than 10 clues");
    }
    timeouts.push(
      setTimeout(() => {
      if(creditToChange < currentList.length){
        creditsShown[creditToChange] = currentList[creditToChange];
        // console.log("Load next credit");
        // console.log(creditsShown[creditToChange]);
        // console.log(creditToChange);
        // setCreditsShown(currentList);
        // console.log({currentList})
        // for(let i = 0; i < credits.cast.length; i++){
        //
        // }
        // setCreditsShown()
        creditToChange+=1;
      }else{
        console.log("Reached end of cast credits for: " + people[personNum].name);
      }
    }, 500)
  );
  }


  useEffect(() => {
    const listener = event => {
      if (event.code === "Enter" || event.code === "NumpadEnter") {
        console.log("Enter key was pressed. Run your function.");
        event.preventDefault();
        // callMyFunction();
        checkAnswer();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, []);

    /* Randomize array in-place using Durstenfeld shuffle algorithm */
  function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
          var j = Math.floor(Math.random() * (i + 1));
          var temp = array[i];
          array[i] = array[j];
          array[j] = temp;
      }
  }

  function checkAnswer(){
    var e = document.getElementById("guess");
    if(e){
      console.log("Checking answer");
      var g = e.value;
      console.log(g);
      if(g.toUpperCase() === people[personNum].name.toUpperCase()){
        correctLevel+=1;
        console.log(correctLevel);
        console.log("Correct");
        isCorrectGuess = true;
        isIncorrectGuess = false;
        gameMsg = "CORRECT!";
        setTimeout(() =>{
          gameMsg = "WHO DAT ACT?";
          showAnswer();
        },1000);
      }else{
        isIncorrectGuess = true;
        isCorrectGuess = false;
        gameMsg = "WRONG!";
        setTimeout(() => {
          gameMsg = "WHO DAT ACT?";
          isIncorrectGuess = false;
        },1000);
      }

      e.value = "";
    }else{
      console.log("Can't find guess");
    }

  }

  function showAnswer(){
    isGuessingOver = true;
    actorAnswer = people[personNum].name;
  }

  function giveUp(){
    isIncorrectGuess = true;
    isGuessingOver = true;
    if(people.length === 0){
      actorAnswer = "Loading";
    }else{
      actorAnswer = people[personNum].name;
    }
  }

  const startButton =(
    <div className="container">
      <button className="skewBtn lorange" onClick={onClickStart}>Start</button>
    </div>
  );

  const nextButton =(
    <div className="answerBox">
      <input id="guess" className="wda-input" type="text" placeholder="Type actor/actress full name. Then press enter or guess."/>

      <button className="skewBtn purple" onClick={onNextClue}>Clue</button>
      {isGuessingOver ?
        <button className="skewBtn blue" onClick={onNext}>Next</button>
        :
        <button className="skewBtn blue" onClick={giveUp}>Give Up</button>
      }
      <button className="skewBtn brick" onClick={checkAnswer}>Guess</button>
    </div>
  );

  const header = (
    <div>
    <header className="App-header">
      <div>
      <h1>WHO DAT ACT?</h1>
      <p>
        Guess the actor/actress based on 10 movies they were in.
        Unlimited guesses.
      </p>
      </div>
      {isAllLoaded ? startButton : null}
    </header>
    <footer className="App-footer">
    <div>Icons made by <a href="https://www.flaticon.com/authors/pixel-perfect" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    </footer>
    </div>
  );

  const game = (
    <div className="game">
      <div className="row1">

      {isGuessingOver ? <h2>{actorAnswer}</h2> : <h2>{gameMsg}</h2>}
      {isCorrectGuess ? <img className="checkmark" src={check}/> : null}
      {isIncorrectGuess ? <img className="checkmark" src={remove}/> : null}
      <h2>{correctLevel} out of {level}</h2>
      </div>
      <div className="row15">
      <h2>I was in...</h2>
      </div>
      <div className="row2">
        <div id="col1" className="column">
          <h2 class="tooltip">{creditsShown[0].title}
            <span class="tooltiptext">{creditsShown[0].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[1].title}
            <span class="tooltiptext">{creditsShown[1].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[2].title}
            <span class="tooltiptext">{creditsShown[2].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[3].title}
            <span class="tooltiptext">{creditsShown[3].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[4].title}
            <span class="tooltiptext">{creditsShown[4].character}</span>
          </h2>
        </div>
        <div id="col2" className="column">
          <h2 class="tooltip">{creditsShown[5].title}
            <span class="tooltiptext">{creditsShown[5].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[6].title}
            <span class="tooltiptext">{creditsShown[6].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[7].title}
            <span class="tooltiptext">{creditsShown[7].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[8].title}
            <span class="tooltiptext">{creditsShown[8].character}</span>
          </h2>
          <h2 class="tooltip">{creditsShown[9].title}
            <span class="tooltiptext">{creditsShown[9].character}</span>
          </h2>
        </div>
      </div>
      <div className="row3">
        {nextButton}
      </div>
    </div>
  )
  const movie = (
    <h1>{}</h1>
  )
  return (
    <div className="App">

      {!showGame ? header : null}

      {showGame ? game : null}
    </div>
  );
}

export default App;
