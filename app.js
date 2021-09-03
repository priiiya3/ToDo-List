//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// creating a new database
mongoose.connect("mongodb+srv://admin-priya:merapassword@cluster0.mfacc.mongodb.net/todolistDB", {useNewUrlParser: true});

//Creating a Schema in mongoose to store our data.
const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);     //Creating a model for our Schema.

const item1 = new Item({
  name: "Welcome to Your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];     // adding our items to an array.

const listSchema = {
  name: String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){     // we kept {} empty because we want to find everything.

    if (foundItems.length === 0){

      // inserting our data if the database is empty.
      Item.insertMany(defaultItems, function(err){
            if (err){
                console.log(err);
            }
            else{
              console.log("Successfully saved Default Items to your Database. :)");
            }
      });
      res.redirect("/");    // redirecting back into the root route. (ie, re running this block of code.)
    }else{
        res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/")
  }else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  
  
});


app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today"){
      Item.findByIdAndRemove(checkedItemId, function(err){
        if(!err){
          console.log("Successfully Deleted the checked item from the list !");
        }
        res.redirect("/");
      });
    }else{
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
        if (!err){
          res.redirect("/" + listName);
        }
      });

    }
    
});


//Dynamic Express Route
app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, foundList){
        if(!err){
          if (!foundList){
            // .. Create a new List
            const list = new List({
              name: customListName,
              items: defaultItems
            });
        
            list.save();
            res.redirect("/" + customListName);
            
          }else{
            //Show the List
            res.render("List", {listTitle: foundList.name, newListItems: foundList.items});
          }
        }
    });

    

});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function() {
  console.log("Server has started Successfully.");
});
