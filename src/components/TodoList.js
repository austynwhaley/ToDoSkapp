import React, { useEffect, useState } from 'react';
import TodoForm from './TodoForm';
import Todo from './Todo';
import Button from './SaveBtn/SaveBtn'
import Popup from "./Popup/index"

import { SkynetClient } from "skynet-js";
import { ContentRecordDAC } from '@skynetlabs/content-record-library';


const portal =
  window.location.hostname === 'localhost' ? 'https://siasky.net' : undefined;


const contentRecord = new ContentRecordDAC();
const client = new SkynetClient(portal);
const dataDomain = "app.hns/path/file.json";;



function TodoList() {
  const [todos, setTodos] = useState([]);
  const [popup, setPopup] = useState(false)
  const [mySky, setMySky] = useState();
  const [loggedIn, setLoggedIn] = useState(null);
  const [userID, setUserID] = useState();
  const [filePath, setFilePath] = useState();
  const [dataKey, setDataKey] = useState('');
  const [id,setId] = useState('')
  const [text,setText] = useState('')


   // When dataKey changes, update FilePath state.
   useEffect(() => {
    setFilePath(dataDomain + '/' + dataKey);
  }, [dataKey]);

   useEffect(() => {
    // initializes MySky and checks if user is logged in
      async function initMySky() {
        try {
          // needed for permissions write
          const mySky = await client.loadMySky(dataDomain);

          // load necessary DACs and permissions
          await mySky.loadDacs(contentRecord);

          // check if user is already logged in with permissions
          const loggedIn = await mySky.checkLogin();

          // set react state for login status 
          setMySky(mySky);
          setLoggedIn(loggedIn);
          setUserID(await mySky.userID());
          if (!loggedIn)
           {
            setPopup(true)
          }
        } catch (e) {
          console.error(e);
          setPopup(true)
        }
        
      }
    initMySky()
  }, []);
  


  const handleMySkyLogin = async () => {

    const status = await mySky.requestLoginAccess();

    setLoggedIn(status);

    if (status) {
      setUserID(await mySky.userID());
    }
  };

  const handleMySkyLogout = async () => {
    //logs user out
      await mySky.logout();

    setLoggedIn(false);
    setUserID('');
    console.log("Logged Out")
  };

  const handleSubmit = async (event) => {
    console.log('form submitted');
    await handleMySkyWrite(todos);
  };

  const handleMySkyWrite = async (obj) => {
    try {
      console.log('userID', userID);
      console.log('filePath', filePath);
      await mySky.setJSON("app.hns/path/file.json", obj).then(console.log(obj))
    } catch (error) {
      console.log(`error with setJSON: ${error.message}`);
    }
    
  };
  
  const loadData = async (event) => {
    event.preventDefault();

    // Use getJSON to load the user's information from SkyDB
    const { data } = await mySky.getJSON(filePath);
      if (data) {
        setId(data.id);
        setText(data.text);
        console.log('User data loaded from SkyDB!');
      } else {
        console.error('There was a problem with getJSON');
      }

  };

    
  const addTodo = todo => {
    if (!todo.text || /^\s*$/.test(todo.text)) {
      return;
    }

    const newTodos = [todo, ...todos];

    setTodos(newTodos);
    console.log(...todos);
  };

  const updateTodo = (todoId, newValue) => {
    if (!newValue.text || /^\s*$/.test(newValue.text)) {
      return;
    }

    setTodos(prev => prev.map(item => (item.id === todoId ? newValue : item)));
  };

  const removeTodo = id => {
    const removedArr = [...todos].filter(todo => todo.id !== id);

    setTodos(removedArr);
  };

  const completeTodo = id => {
    let updatedTodos = todos.map(todo => {
      if (todo.id === id) {
        todo.isComplete = !todo.isComplete;
      }
      return todo;
    });
    setTodos(updatedTodos);
  };

  const formProps = {
    mySky,
    handleMySkyLogin,
    handleSubmit,
    handleMySkyLogout,
    loadData,
    id,
    dataKey,
    text,
    loggedIn,
    dataDomain,
    userID,
    setLoggedIn,
    setDataKey,
  };

  return (
    <>
    <div>
    <Button name="Save" onClick={() => handleSubmit().then(console.log(todos))}></Button>
    <Button name="Logout" onClick={() => handleMySkyLogout()}></Button>
    </div>
    <h1>SkyList</h1>
    <p>Your personal decentralized ToDo list!</p>
    <TodoForm {...formProps} onSubmit={addTodo} />
      <Todo
        todos={todos}
        completeTodo={completeTodo}
        removeTodo={removeTodo}
        updateTodo={updateTodo}
      />

        <Popup trigger = {popup} setTrigger={setPopup}>
          <h2 className="randomName" style={{marginTop: "70px"}}>Login to Skynet!</h2>
          <button className="skyBtn" onClick={() =>  mySky.requestLoginAccess()}>Login</button>
        </Popup>   
    </>
    
  );
}

export default TodoList;