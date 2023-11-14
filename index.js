const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// Middleware
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// const uri = `mongodb+srv://:@cluster0.gsplul7.mongodb.net/?retryWrites=true&w=majority`;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vnpjijx.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("productDB");
    const productCollection = database.collection("products");
    const addedProduct = database.collection("purchased");

    // to load specific data based on brand
    app.get("/products/:brand", async (req, res) => {
      const brand = req.params.brand;
      //   console.log(brand);
      const query = { brand: brand };
      const result = await productCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/products/brand/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      //   console.log("this is result", result);
      res.send(result);
    });
    // to load added data
    app.get("/added", async (req, res) => {
      const cursor = addedProduct.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // to load all data
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // add product to database and server
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product);
      res.send(result);
    });
    // add product after add to cart
    app.post("/added", async (req, res) => {
      const product = req.body;
      const result = await addedProduct.insertOne(product);
      res.send(result);
    });
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const newProduct = req.body;
      const updateProduct = {
        $set: {
          name: newProduct.name,
          brand: newProduct.brand,
          type: newProduct.type,
          price: newProduct.price,
          photo: newProduct.photo,
          rating: newProduct.rating,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });
    // delete product after click delete
    app.delete("/added/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addedProduct.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running successfully !");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
