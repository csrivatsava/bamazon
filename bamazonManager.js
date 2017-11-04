var inquirer = require("inquirer");
var Table = require('cli-table');


var Manager = function (connection){
  var self = this;
  this.connection = connection,
  // function to ask user on what task you want to do.
  this.runSearch = function (main) {
    var main = main;
      inquirer
        .prompt({
          name: "action",
          type: "rawlist",
          message: "Your Menu",
          choices: [
            "View Products for Sale",
            "View Low Inventory",
            "Add to inventory",
            "Add new Product",
            "Main Page"
          ]
        }) 
        .then(function(answer) {
          switch (answer.action) {
            case "View Products for Sale":
              self.productsForSale(main);
              break;

            case "View Low Inventory":
              self.checkLowInventory(main);
              break;

            case "Add to inventory":
              self.addToInventory(main);
              break;

            case "Add new Product":
              self.addNewProduct(main);
              break;

            case "Main Page":
              main.start(self.connection);
              return;
          }
        });
  },

  // function to display all the products available. 
  this.allProducts = function(main){
    var query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products";
        var table = new Table({
                head: ["Item Id ", "Product Name", "Department Name", "Price", "Stock Quantity"]
            });
        self.connection.query(query, function(err, res) {
          
          for (var i = 0; i < res.length; i++) {
            // Pushing the query results into the table.
            table.push(
                [ res[i].item_id, res[i].product_name, res[i].department_name , res[i].price, res[i].stock_quantity]
            );
          }
          console.log(table.toString());
        })
        setTimeout(function () {
          self.runSearch(main);  
        }, 1000)

  },
  // functions to check the products based on selected department.
  this.productsForSale = function(main) {
    
    var query = "SELECT department_name FROM departments";
    var department = [];
    // getting the department names to use for choices in the inquirer function.
    self.connection.query(query, function(err, res) {        
      for (var i = 0; i < res.length; i++) {
        department.push(res[i].department_name)
      }
    });

    setTimeout(function () {
      inquirer
        .prompt({
          name: "deptName",
          type: "rawlist",
          message: "WHICH department you need to check?",
          choices: department
        })
        .then(function(answer) {
          var query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products WHERE ?";
          var table = new Table({
                  head: ["Item Id ", "Product Name", "Department Name", "Price", "Stock Quantity"]
              });
          self.connection.query(query, { department_name: answer.deptName }, function(err, res) {
            for (var i = 0; i < res.length; i++) {
              // Pushing the query results into the table.
              table.push(
                  [ res[i].item_id, res[i].product_name, res[i].department_name , res[i].price, res[i].stock_quantity]
              );
            }
            console.log(table.toString());
            setTimeout(function () {
              self.runSearch(main);  
             }, 1000)
          });
        });
    }, 1000)
  },

  this.checkLowInventory = function(main) {
    // console.log("connection in low inventory function" + connection)
    var query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products where stock_quantity < 5 ";
    var table = new Table({
                head: ["Item Id ", "Product Name", "Department Name", "Price", "Stock Quantity"]
            });
    self.connection.query(query, function(err, res) {
      for (var i = 0; i < res.length; i++) {
            // Pushing the query results into the table.
            table.push(
                [ res[i].item_id, res[i].product_name, res[i].department_name , res[i].price, res[i].stock_quantity]
            );
      }
      console.log(table.toString());
      setTimeout(function () {
          self.runSearch(main);  
        }, 1000)
    });
  },
  // add stock quantity for the products.
  this.addToInventory = function(main) {
    inquirer
      .prompt([
        {
          name: "item_id",
          type: "input",
          message: "Which item quantity you want to update ?",
        },
        {
          name: "stock_quantity",
          type: "input",
          message: "Total Quantity ",
          
        }
      ])
      .then(function(answer) {
        var quantity = 0;
        self.connection.query("select stock_quantity from products where item_id = ?", answer.item_id, function(err,res){
          quantity = parseInt(res[0].stock_quantity);
          quantity += parseInt(answer.stock_quantity);
          var query = "UPDATE products SET ? WHERE ?";
          self.connection.query(query, 
            [{
              stock_quantity: quantity
            },
            {
              item_id: answer.item_id
            }],
            function(err, res) {
              console.log( "The new product is added successfully \n");
                setTimeout(function () {
                  self.allProducts(main);  
                }, 1000)

          });

        })
        
      });
  },
  // To add a new product to the products database.
  this.addNewProduct = function(main) {
    var query = "SELECT department_name FROM departments";
    var department = [];
    // getting the department names to use for choices in the inquirer function.
    self.connection.query(query, function(err, res) {        
      for (var i = 0; i < res.length; i++) {
        department.push(res[i].department_name)
      }
    });
    setTimeout(function () {
      inquirer
        .prompt([
        {
          name: "product_name",
          type: "input",
          message: "What is the product Name?"
        },
        {
          name: "department_name",
          type: "rawlist",
          choices: department,
          message: "What is the department name?"
        },
        {
          name: "price",
          type: "input",
          message: "What is the price?"
        },
        {
          name: "stock_quantity",
          type: "input",
          message: "What is the total Quantity?"
        }
        ])
        .then(function(answer) {

          self.connection.query("INSERT INTO products SET ?", 
            { product_name: answer.product_name,
              department_name : answer.department_name,
              price : answer.price,
              stock_quantity : answer.stock_quantity 
            }, 
            function(err, res) {
              console.log( "The new product is added successfully \n");
              setTimeout(function () {
                self.allProducts(main);  
              }, 1000);

            });
        });
      }, 1000);
  }


}; // constructor end.
module.exports = Manager; 