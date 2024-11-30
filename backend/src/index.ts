import express, { Application } from "express";
import cors from 'cors';

const app: Application = express();
app.use(cors());


app.get('/storage/:bucket/:id', async (req, res) => {
    const { bucket, id } = req.params;
    if ( !bucket || !id ) {
        res.sendStatus(404);
        return;
    }
    /*const dataStream = await storageClient.getObject(bucket, id);
    if ( !dataStream ) {
        res.sendStatus(404);
        return;
    }    
    dataStream.pipe(res);*/
});


const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 8585;

app
  .listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
  })
  .on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log("Error: address already in use");
    } else {
      console.log(err);
    }
  });