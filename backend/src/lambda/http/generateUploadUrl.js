import {generateUploadUrl} from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('generateUpdateUrl')

export async function handler(event) {
  const todoId = event.pathParameters.todoId
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true
  };

  
  try {
    const signedUrl = await generateUploadUrl(event, todoId);
    logger.info('Successfully created signed url.');
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ uploadUrl: signedUrl })
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

