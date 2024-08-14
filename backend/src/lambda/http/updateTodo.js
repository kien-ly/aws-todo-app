import {updateTodo} from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('updateToDo')

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const updatedTodo = JSON.parse(event.body)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  try {
    await updateTodo(event, todoId, updatedTodo);
    logger.info(`Successfully updated the todo item: ${todoId}`);
    return {
      statusCode: 204,
      headers,
      body: undefined
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
