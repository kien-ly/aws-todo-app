import { getTodos } from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('getToDo')

export async function handler(event) {
  // TODO: Get all TODO items for a current user
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  try {
    const items = await getTodos(event);
    logger.info('Successfully get ToDos');
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ items })
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
