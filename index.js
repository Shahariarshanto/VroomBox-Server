const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 9000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// Middleware
const corsConfig = {
  origin: '',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}
app.use(cors(corsConfig))
app.options("", cors(corsConfig))
// app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', 'https://vroombox-server.vercel.app/');
res.setHeader('Access-Control-Allow-Origin', '*');

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.SECRET_PASS}@cluster0.inncnjw.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    // MongoDb Database Collection
    const toyCollection = client.db('toybox').collection('Toys');

    // Read Operations Get All Toys
    app.get('/all-toys', async (req, res) => {
        const cursor = toyCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    //  Operations to Get Data by Email 
     app.get('/toys', async (req, res) => {
        const email = req.query.email;
        let query = {};
        if(req.query?.email){
            query = {sellerEmail: req.query.email}
        }
       
        const result = await toyCollection.find(query).toArray();
        res.send(result);
    }   );


    // Write Operations Add New Toy
    app.post('/add-toy', async (req, res) => {
        const toy = req.body;
        
        const result = await toyCollection.insertOne(toy);
        res.send(result);
    });

    // Delete Operations Delete Toy
    app.delete('/delete-toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      console.log(query);
      const result = await toyCollection.deleteOne(query);
      res.send(result);
  })



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello vroombox!')
}   
);

app.listen(port, () => {
    console.log(`vroombox app listening at http://localhost:${port}`)
}
);

