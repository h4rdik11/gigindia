import { useState, useEffect } from "react";
import "./App.css";
import Upvote from "./assets/upvote.gif";
import { debounce } from "throttle-debounce";

function App() {
  const [state, setState] = useState({
    page: 1,
    search: "",
  });
  const [contracts, setContracts] = useState([]);
  const [upvotes, setUpovtes] = useState(
    localStorage.getItem("upvotes")
      ? JSON.parse(localStorage.getItem("upvotes"))
      : {}
  );
  const callApi = (page = state.page, search = state.search) => {
    //hn.algolia.com/api/v1/
    fetch(
      `https://hn.algolia.com/api/v1/search_by_date?query=${search}&tags=story&page=${page}`
    )
      .then((response) => response.json())
      .then((response) => {
        setState({ page, search });
        const newContracts = response.hits;
        const upvoteObj = localStorage.getItem("upvotes")
          ? JSON.parse(localStorage.getItem("upvotes"))
          : {};
        response.hits.forEach(({ objectID, points }) => {
          upvoteObj[objectID] = {
            done: upvoteObj[objectID] ? upvoteObj[objectID].done : false,
            points: upvoteObj[objectID] ? upvoteObj[objectID].points : points,
            isHidden: upvoteObj[objectID] ? upvoteObj[objectID].isHidden : false,
          };
        });
        setUpovtes(upvoteObj);
        setContracts(newContracts);
      });
  };

  useEffect(() => {
    callApi();
  }, []);

  const gotourl = (url) => () => window.open(url, "_blank");

  useEffect(() => {
    localStorage.setItem("upvotes", JSON.stringify(upvotes));
  }, [upvotes]);

  const upVote = (id) => () => {
    if (!upvotes[id].done) {
      const newUpvotes = { ...upvotes };
      newUpvotes[id].points = newUpvotes[id].points + 1;
      newUpvotes[id].done = true;
      setUpovtes(newUpvotes);
    }
  };
  const { page, search } = state;
  const handleSearchChange = (e) => {
    callApi(1, e.target.value);
  };

  const localStorageContract = JSON.parse(localStorage.getItem("upvotes"));

  const handleHide = (index, objectID) => (e) => {
    const newContracts = [...contracts];
    const newLS = { ...localStorageContract };
    console.log(newLS);
    newLS[objectID].isHidden = true;
    localStorage.setItem("upvotes", JSON.stringify(newLS));
    newContracts.splice(index, 1);
    setContracts(newContracts);
  };

  return (
    <div className="main__wrap">
      <div className="header">
        <div className="nav">
          <img src="https://news.ycombinator.com/y18.gif" alt="logo" />
          <div className="nav-item-wrap">
            <span className="nav-brand">Hacker News</span>
            <div className="nav-items">
              <a href="/">news</a>|<a href="/">past</a>|<a href="/">comments</a>
              |<a href="/">ask</a>|<a href="/">show</a>|<a href="/">jobs</a>|
              <a href="/">submit</a>
            </div>
          </div>
        </div>
        <div className="login-link">login</div>
      </div>
      <div className="contracts__wrap">
        {contracts.map(
          (
            { title, author, created_at, num_comments, url, objectID },
            index
          ) => {
            if (
              localStorageContract[objectID] &&
              localStorageContract[objectID].isHidden
            )
              return null;
            else
              return (
                <div className="contract" key={`contract__${objectID}`}>
                  <span className="index">{index + 1 + (page - 1) * 20}.</span>
                  <img
                    className="upvote_img"
                    src={Upvote}
                    alt="upvote"
                    onClick={upVote(objectID)}
                  />
                  <div className="title_wrap">
                    <span className="title">
                      <span onClick={gotourl(url)} className="title-text">
                        {title}
                      </span>{" "}
                      <small onClick={gotourl(url)} className="url-link">
                        ({url})
                      </small>
                    </span>
                    <div className="demographics">
                      <span className="points">
                        {upvotes[objectID] && upvotes[objectID].points} points
                      </span>{" "}
                      by <span className="username">{author}</span>
                      <span className="time">2 hours ago</span> |{" "}
                      <span
                        className="hide"
                        onClick={handleHide(index, objectID)}
                      >
                        hide
                      </span>{" "}
                      |{" "}
                      <span className="comments">{num_comments} comments</span>
                    </div>
                  </div>
                </div>
              );
          }
        )}
      </div>
      <div className="more_block">
        <span
          className="more"
          onClick={() => {
            callApi(page + 1, search);
          }}
        >
          More
        </span>
      </div>
      <div className="footer_wrap">
        <div className="nav-items">
          <a href="https://news.ycombinator.com/newsguidelines.html">
            Guideline
          </a>
          |<a href="https://news.ycombinator.com/newsfaq.html">FAQ</a>|
          <a href="https://news.ycombinator.com/lists">Lists</a>|
          <a href="https://github.com/HackerNews/API">API</a>|
          <a href="https://news.ycombinator.com/security.html">Security</a>|
          <a href="http://www.ycombinator.com/legal/">Legal</a>|
          <a href="http://www.ycombinator.com/apply/">Apply to YC</a>|
          <a href="mailto:hn@ycombinator.com">Contact</a>
        </div>
        <div className="search_bar">
          <label>Search:</label>
          <input type="text" onChange={debounce(500, handleSearchChange)} />
        </div>
      </div>
    </div>
  );
}

export default App;
