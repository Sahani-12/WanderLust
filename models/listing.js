const { required } = require("joi");
const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const listingSchema=new Schema({
    title :{
        type:String,
        required:true,
    },
    description:{
      type :String,
      // required:true,
    },
    image: {
  filename: String,
  url: {
    type: String,
    default: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60"
  }
},

    price:Number,
    location:String,
    country:String,
});

const Listing=mongoose.model("Listing",listingSchema);
module.exports=Listing;