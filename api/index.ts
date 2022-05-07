
import express from 'express'
import { startup } from './src/startup/routes';
const app = express();

startup(app).then( () => {

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port ${port}`));
});

