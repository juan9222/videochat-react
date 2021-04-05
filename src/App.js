import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from './pages/Login/Login.jsx'
import Videochat from './pages/Videochat/Videochat.jsx';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Switch>
            <Route path="/videochat/:id/:username">
              <Videochat />
            </Route>
            <Route path="/">
              <Login />
            </Route>
        </Switch>
      </Router>
    </div>
  );
}

export default App;
