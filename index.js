
const express = require('express')
const cors = require('cors')  
const app = express()
const port = 5000

app.use(cors())  
app.use(express.json())  


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://assignment-10-db:S7jMfv8CejDQaJfo@cluster0.5asayq5.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
    // Connect the client to the server	(optional starting in v4.7)
     await client.connect();

   const db = client.db('assign-10-db')
    const artworkCollection = db.collection('artwork')
    const favoritesCollection = db.collection('my-favorites')
   
   app.get('/artworks', async (req, res) => {
  try {
    const search = req.query.search || '';

    const query = {
      // status: 'public',
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { artistName: { $regex: search, $options: 'i' } }
      ]
    };

    const result = await artworkCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


    app.get('/artwork/:id', async(req, res) =>{
      const id = req.params.id
      console.log(id);

      const result = await artworkCollection.findOne({_id: new ObjectId(id)});

      res.send({
        success: true,
        result
      })
    })

     app.get("/artworks", async (req, res) => {
      const { artistName } = req.query;

      const result = await artworkCollection
        .find({ artistName: artistName })
        .toArray();

      res.send({ success: true, result });
    });


    app.post("/artwork", async (req, res) => {
      const formdata = req.body;

      try {
        // Insert into artwork collection
        const body = req.body;
        const result = await artworkCollection.insertOne(formdata);

       res.send({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.send({ success: false, message: error.message });
  }
     
    });


    app.get('/my-favorites', async(req, res)=>{
      const result = await favoritesCollection.find().toArray();
      res.send(result);
    });

   app.post("/my-favorites", async (req, res) => {
      const fav = req.body;

      // Prevent duplicate favorites
      const exists = await favoritesCollection.findOne({
        artworkId: fav.artworkId,
      });

      if (exists) {
        return res.send({
          success: false,
          message: "Already in favorites",
        });
      }

      const result = await favoritesCollection.insertOne(fav);
      res.send({ success: true, result });
    });

  app.get("/my-gallery", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.send([]);
    }

    const result = await artworkCollection.find({ email }).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
});

// Latest 6 data  here
app.get('/latest-artworks', async(req, res) =>{
  const result = await artworkCollection.find().sort({ _id: -1 }).limit(6).toArray();
 console.log(result);
  res.send(result);
});


app.patch("/artwork/:id", async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await artworkCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updatedData }
  );

  res.send({ success: true });
});



app.delete("/artwork/:id", async (req, res) => {
  const id = req.params.id;

  const result = await artworkCollection.deleteOne({
    _id: new ObjectId(id),
  });

  if (result.deletedCount === 1) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});



    app.patch('/artwork/like/:id', async(req, res) =>{
      const {id} = req.params;
      const result =  await artworkCollection.updateOne(
        {_id: new ObjectId(id)},
        {
          $inc: {like: 1}
        }
      )
      res.send({
        success: true,
        result
      })
    })

   // DELETE /my-favorites/:id
app.delete('/my-favorites/delete/:id', async (req, res) => {

  const { id } = req.params;
const query = {_id: new ObjectId(id)};
  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ success: false, message: 'Invalid ID' });
  }
console.log(query);
  try {
    const result = await favoritesCollection.deleteOne( query );
    console.log(result);
    if (result.deletedCount === 1) {
      res.send({ success: true });
    } else {
      res.send({ success: false, message: 'Item not found' });
    }
  } catch (err) {
    res.status(500).send({ success: false, error: err.message });
  }
});




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(" You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!How are you?')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
