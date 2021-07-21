import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';

const emptyTask = {
  id: null,
  title: '',
  completed: false,
}

function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function App(props) {
  const [todoList, setTodoList] = useState([]);
  const [activeItem, setActiveItem] = useState(emptyTask);
  const [editing, setEditing] = useState(false);
  let url = '';

  useEffect(() => {
    fetchTasks()
  }, []);

  const fetchTasks = () => {
    fetch('http://127.0.0.1:8000/api/task-list/')
      .then(response => response.json())
      .then(data =>
        setTodoList(data));
  }

  const updateTasks = (item = activeItem) => {

    url = editing ? `http://127.0.0.1:8000/api/task-update/${item.id}/` : `http://127.0.0.1:8000/api/task-create/`

    console.log(item, editing, url);


    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify(item)
    })
      .then(response => {
        fetchTasks()
        setActiveItem(emptyTask)
        setEditing(false)
      })
      .catch(error => { console.log(error); })
  }

  const handleChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setActiveItem({ ...activeItem, title: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    updateTasks()
  }

  const startEdit = (task) => {
    setActiveItem(task);
    setEditing(true);
    console.log(task);
  }

  const toggleState = (task) => {
    setEditing(true);
    task.completed = !(task.completed);
    console.log(task);

    // updateTasks(task);
    url = `http://127.0.0.1:8000/api/task-update/${task.id}/`

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify(task)
    })
      .then(response => {
        fetchTasks()
      })
      .catch(error => { console.log(error); })
  }

  const deleteItem = (task) => {
    let url = `http://127.0.0.1:8000/api/task-delete/${task.id}/`
    console.log(task, url);

    fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
    })
      .then(response => {
        fetchTasks()
      })
      .catch(error => { console.log(error); })
  }

  return (
    <div className="container">
      <div id="task-container">

        <div id="form-wrapper">
          <form id="form" onSubmit={handleSubmit}>

            <div className="flex-wrapper">
              <div style={{ flex: 6 }}>

                <input className="form-control" onChange={handleChange} value={activeItem.title} id="title" type="text" name="title" placeholder="Add task.." />

              </div>

              <div style={{ flex: 1 }}>

                <input id="submit" className="btn btn-warning" type="submit" name="Add" />

              </div>
            </div>
          </form>
        </div>

        <div id="list-wrapper">
          {
            todoList.map((task, index) => (
              <div key={index} className="task-wrapper flex-wrapper">

                <div style={{ flex: 7 }} onClick={() => toggleState(task)}>
                  {task.completed == true ? (
                    <strike>{task.title}</strike>
                  ) : (
                    <span>{task.title}</span>
                  )}

                </div>

                <div style={{ flex: 1 }}>
                  <button className="btn btn-sm btn-outline-info" onClick={() => startEdit(task)}>Edit</button>
                </div>

                <div style={{ flex: 1 }}>
                  <button className="btn btn-sm btn-outline-dark delete" onClick={() => deleteItem(task)}>-</button>
                </div>

              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
}

export default App;
