const { MongoClient, ObjectId } = require("mongodb");
// establish a connection with mongodb
const uri =
"mongodb+srv://darius:darius@cluster0.hlvaagz.mongodb.net/?retryWrites=true&w=majority"; //uri for mongodb
var client = new MongoClient(uri);

async function connect() {
  // try to establish a connection with the mongodb
  try {
    await client.connect().then(() => console.log("connected to mongodb"));
  } catch (e) {
    console.log("error while connecting to mongodb", e);
  }
}

connect();

// defining all the functions responsible for contacting mongodb and doing database transactions
async function createOrder(order) {
	return await client.db("project").collection("orders").insertOne(order);
}

async function getLessons() {
	return client
    .db("project")
    .collection("lessons")
    .find().toArray();
}

async function updateLesson(id, space) {
	return await client
    .db("project")
    .collection("lessons")
    .updateOne({ _id: ObjectId(id) }, { $inc: { "space": -space } });
}

async function searchLesson(searchTerm) {
return client
  .db("project")
  .collection("lessons")
  .find({
    topic: { $regex: searchTerm, $options: "is" },
  })
  .toArray();
}

// setting up express server
const express = require("express");
var cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());  // enabling CORS to avoid CORS error between frontend and backend

// defining middlewares
const logger = function (req, res, next) {
  console.log(`Request for ${req.originalUrl}`);
  next();
};

// registering middlewares
app.use(logger);
app.use("/public", express.static(__dirname + "/public"));  // inbuild "static" middleware to serve course images

// Defining api routes
app.get("/api/lesson", async (req, res) => {
  const result = await getLessons();
  res.send(result);
});

app.post("/api/order", async (req, res) => {
	const result = await createOrder(req.body);
  res.send({
		msg: `Reservation with id [${result.insertedId}] has been created successfully!`,
	});
});

app.put("/api/lesson/:id", async(req, res) => {
	const result = await updateLesson(req.params.id, req.body.space);
	res.send({
    msg: `Spaces in the lesson [id: ${req.params.id}] updated after successful order`,
  });
});

app.get("/api/search/:searchTerm", async (req, res) => {
  const result = await searchLesson(req.params.searchTerm);
  res.send(result);
});

app.get("/", async (req, res) => {
  res.sendFile(__dirname +"/index.html");
});

// PORT
const PORT = process.env.PORT || 3000;

// Starting the server
app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
