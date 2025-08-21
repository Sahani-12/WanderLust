const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const expressError = require("./utils/expressError.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const { listingSchema } = require("./schema.js");

main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
  res.send("Hi i am root");
});

const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg=error.details.map((el)=> el.message).join(",");
    throw new expressError(400, errMsg);
  } else {
    next();
  }
};

// Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//new route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    console.log("Listing object:", listing);
    res.render("listings/show.ejs", { listing });
  })
);

//Create route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//edit route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);
//update route

app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    const { id } = req.params;

    const updatedListing = {
      ...req.body.listing,
      image: {
        url: req.body.listing.image?.url || "default-image-url",
        filename: "listingimage",
      },
    };

    await Listing.findByIdAndUpdate(id, updatedListing);
    res.redirect(`/listings/${id}`);
  })
);

//delete route

app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  })
);

// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title :"My new flower",
//         description:"this is rose",
//         price:1000,
//         location:"Calangute,Goa",
//         country:"India"
//     });
//     await sampleListing.save();
//     console.log("sample was saveed");
//     res.send("succesful testing");

// // });
// app.all("*", (req, res, next) => {
//   next(new expressError(404, "Page Not Found!"));
// });

// app.use((err, req, res, next) => {
//   let { statusCode = 500, message = "Something went wrong" } = err;
//   res.status(statusCode).render("error.ejs", { err });

// });
app.use((req, res) => {
  res.status(404).render("error.ejs", {
    err: {
      statusCode: 404,
      message: "Page Not Found!",
    },
  });
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error.ejs", { err });
});

app.listen("8080", () => {
  console.log("App is listening port 8080");
});
