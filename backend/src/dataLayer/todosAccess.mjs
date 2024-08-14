import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'


class TodoAccess {
  constructor() {
    this.docClient = DynamoDBDocument.from(new DynamoDB());
    this.todosTable = process.env.TODOS_TABLE;
  }

  async getTodos(userId) {
    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
    return result.Items;
  }

  async createTodo(newTodo) {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: newTodo
      })
    return newTodo;
  }

  async updateTodo(userId, todoId, updateData) {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: {
          ':n': updateData.name,
          ':due': updateData.dueDate,
          ':dn': updateData.done
        }
      })
  }

  async deleteTodo(userId, todoId) {
    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: { userId, todoId }
      })
  }

  async saveImgUrl(userId, todoId, bucketName) {
    await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId, todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
  }
}

export default TodoAccess
