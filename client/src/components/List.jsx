import React from 'react'
import Task from './Task.jsx'

import {
  Grid,
  Card,
  Menu,
  Segment,
  Header
} from 'semantic-ui-react'

export class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentListName: this.props.listname,
      newListName: '',
      text: '',
      isEditing: false,
      tasks: []
    }

    this.onTaskInputChange = this.onTaskInputChange.bind(this)
    this.addTask = this.addTask.bind(this)

    this.isEditingListName = this.isEditingListName.bind(this)
    this.onListNameInputChange = this.onListNameInputChange.bind(this)
    this.updateListName = this.updateListName.bind(this)
    this.deleteList = this.deleteList.bind(this)
    this.findIndexOfTask = this.findIndexOfTask.bind(this)
    this.moveTaskVertical = this.moveTaskVertical.bind(this)


    var socket = this.props.socket

    // --------- TASKS FETCHED ---------
    let tasksFetched = `tasks-fetched-listID-${this.props.list_id}`
    socket.on(tasksFetched, (tasks) => {
      this.setState({
        tasks: tasks
      })
    })

    socket.on(`update-list-name-${this.props.list_id}`, (res) => {
      this.setState({
        currentListName: res.listname
      })
    })
  }

  componentWillMount() {
    this.props.socket.emit('fetch-tasks', {
      list_id: this.props.list_id
    })
  }

// ---------- ADD TASK ----------
  onTaskInputChange(e) {
    this.setState({
      text: e.target.value
    })
  }

  addTask() {
    this.props.socket.emit('add-task', {
      list_id: this.props.list_id,
      text: this.state.text
    })
    this.setState({
      text: ''
    })
  }

// ----------- EDIT/DELETE LIST -----------
  isEditingListName() {
    this.setState({
      isEditing: !this.state.isEditing
    })
  }

  onListNameInputChange(e) {
    this.setState({
      newListName: e.target.value
    })
  }

  updateListName() {
    this.props.socket.emit('update-list-name', {
      list_id: this.props.list_id,
      listname: this.state.newListName
    })
    this.setState({
      newListName: '',
      isEditing: false
    })
  }

  deleteList() {
    this.props.socket.emit('delete-list', {
      list_id: this.props.list_id
    })
  }

  // ----------MOVING TASK ----------
  findIndexOfTask(task_id) {
    var indexOfSource = undefined;
    this.state.tasks.map((task, index) => {
      if (task.id === task_id) {
        indexOfSource = index;
      }
    })
    return indexOfSource
  }

  moveTaskVertical(direction, task_id) {
    var indexOfSource = this.findIndexOfTask(task_id);
    var data = {
      array: [ this.state.tasks[indexOfSource] ]
    }
    if (direction === 'up') {
      data.array.push(this.state.tasks[indexOfSource - 1])
    } else if (direction === 'down') {
      data.array.push(this.state.tasks[indexOfSource + 1])
    }
    this.props.socket.emit('task-order-update-vertical', data);
  }

  render() {
    var leftArrow = '\u25C0'
    var rightArrow = '\u25B6'
    console.log('TASKSSSS', this.state.tasks)
    return (
      <div>
        <Card>

          {/* ----- LIST NAME ----- */}
          <Card.Content className='list-header'>
          <Card.Header>
            <Header as='h2' color='teal' onClick={ this.isEditingListName }>
              { this.state.currentListName }
            </Header>
            { this.state.isEditing &&
              <Segment>
              <input type='text' value={ this.state.newListName } onChange={ this.onListNameInputChange }/>
              <button onClick={ this.updateListName }>SAVE</button>
              <button onClick={ this.deleteList }>DELETE</button>
              <button onClick={ this.props.moveList.bind(null, 'left', this.props.list_id) }>{leftArrow}</button>
              <button onClick={ this.props.moveList.bind(null, 'right', this.props.list_id) }>{rightArrow}</button>
              </Segment>
            }
          </Card.Header>
          </Card.Content>

          {/* ----- TASKS ----- */}
          <Card.Content>
          { this.state.tasks.map(task =>
            <Segment key={ task.id }>
            <Task
              text={ task.text }
              task_id={ task.id }
              list_id={ task.list_id }
              socket={ this.props.socket }
              moveTaskVertical={ this.moveTaskVertical }

              // assigned={ task.assigned }
            />
            </Segment>
          )}
          </Card.Content>

          {/* ----- ADD TASK ----- */}
          <Card.Content>
          <input onChange={ this.onTaskInputChange } value={ this.state.text } />
          <button onClick={ this.addTask }>ADD TASK</button>
          </Card.Content>

        </Card>
      </div>
    )
  }
}

export default List
