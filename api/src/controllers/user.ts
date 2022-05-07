import { Request, Response } from "express";

export function addJob(req: Request, res: Response) {

    console.log(req.query);
    console.log(req.body);

    return res.send(req.body)
};

// module.exports = {
//     addJob 
// }