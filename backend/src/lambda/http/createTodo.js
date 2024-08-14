import {createTodo} from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('createToDo')

export async function handler(event) {
  const newTodo = JSON.parse(event.body)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  try {
    const newTodoData = await createTodo(event, newTodo);
    logger.info('Successfully created a new todo item.');
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ newTodoData })
    };
  } catch (error) {
    logger.error(`Error: ${error.message}`);  
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error })
    };
  }
}

