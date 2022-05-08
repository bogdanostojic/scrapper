import { Request, Response } from 'express';

export function errorHandler(error: Error, req: Request, res: Response, next: Function ) {
    if(!error) return;
    const { message } = error;
    console.error('Error stack trace:', error)
    return res.send({error: message}).json();
  }
  