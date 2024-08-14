import {getUserId} from "../lambda/utils.mjs"
import TodoAccess from "../dataLayer/todosAccess.mjs"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { v4 as uuidv4 } from 'uuid'

const todosAccess = new TodoAccess()
const s3Client = new S3Client()

// Action - Create TO DO
export async function createTodo(event, newTodoData) {
    const todoId = uuidv4();
    const userId = getUserId(event);
    const createdAt = new Date().toISOString();
    const done = false;
    const newTodo = { todoId, userId, createdAt, done, ...newTodoData };
    return todosAccess.createTodo(newTodo);
}

// Action - Delete TO DO
export async function deleteTodo(event, todoId) {
    const userId = getUserId(event);
    return todosAccess.deleteTodo(userId, todoId);
}


// Action - Get To Dos
export async function getTodos(event) {
    const userId = getUserId(event);
    return todosAccess.getTodos(userId);
}

// Action - Update
export async function updateTodo(event, todoId, updateData) {
    const userId = getUserId(event);
    return todosAccess.updateTodo(userId, todoId, updateData);
}


// Action - GenerateUploadUrl
export async function generateUploadUrl(event, todoId) {
    const userId = getUserId(event);
    const bucketName = process.env.IMAGES_S3_BUCKET;
    const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION, 10);
    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: todoId
    })
    const url = await getSignedUrl(s3Client, command, {
        expiresIn: urlExpiration
    })

    await todosAccess.saveImgUrl(userId, todoId, bucketName);
    return url
}
