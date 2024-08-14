import {deleteTodo} from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('deleteToDo')

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };
  
  try {
    await deleteTodo(event, todoId);
    logger.info(`Successfully deleted todo item: ${todoId}`);
    return {
      statusCode: 204,
      headers,
      body: undefined
    };
  } catch (error){
    logger.error(`Error: ${error.message}`);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error })
    };
  }
}