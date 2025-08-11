import './App.css'
import {
  // HashRouter as Router,
  BrowserRouter as Router,
  Route,
  Routes,
  // Link,
  // useHistory
} from "react-router-dom";

import WordAllContext from './context/WordList'
import WordRoot from './pages/WordRoot'

import Words from './pages/Learning'
import VocabularyList from './pages/VocabularyList'

const router = [
  {
    title: 'Home',
    path: '/',
    exact: true,
    element: <VocabularyList />
  },
  {
    title: 'learning',
    path: '/learn',
    exact: true,
    element: <Words />
  },
   {
    title: 'root',
    path: '/root',
    exact: true,
    element: <WordRoot />
  }
]
// import YouTo from './YouTo';
function App() {
  // console.log(
  //   router.map(v => {
  //     const {child, ...other} = v
  //     return <Route key={other.title} {...other}/>
  //   })
  // )
  return (
    <div className="App">
      <WordAllContext>
        <Router>
          <Routes>
            {
              router.map(v => {
                const {child, ...other} = v
                return <Route key={other.title} {...other}/>
              })
            }
          </Routes>
        </Router>
      </WordAllContext>
      {/* <YougLish /> */}
      {/* <YouTo /> */}
      {/* <Words /> */}
      {/* <VocabularyList /> */}
    </div>
  );
}

export default App;
