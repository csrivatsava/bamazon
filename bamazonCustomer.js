
var inquirer = require("inquirer");
var Table = require('cli-table');
  



var Customer = function (connection){
  var self = this;
  this.connection = connection,
  this.totalSales = 0,
  
  this.runSearch = function(main) {
    var main = main;  
    inquirer
      .prompt({
        name: "action",
        type: "rawlist",
        message: "Your Menu",
        choices: [
          "All Products",
          "Buy a Product",
          "Main Page"
        ]
      }) 
      .then(function(answer) {
        switch (answer.action) {
          case "All Products":
            self.allProducts(main);
            break;
          
          case "Buy a Product":
            self.buyProduct(main);
            break;

          case "Main Page":
            main.start(self.connection);
            return;
        }
      });
  },
   
  this.allProducts = function(main){
    var query = "SELECT item_id, product_name, department_name, price, stock_quantity FROM products";
        var table = new Table({
                head: ["Item Id ", "Product Name", "Department Name", "Price", "Stock Quantity"]
            });
        self.connection.query(query, function(err, res) {
          
          for (var i = 0; i < res.length; i++) {
    
            // table is an Array, so you can `push`, `unshift`, `splice` and friends 
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

  this.buyProduct = function(main){
    inquirer
      .prompt([
        {
          name: "item_id",
          type: "input",
          message: "Enter the Id of the product you want to Buy ",
        },
        {
          name: "quantity",
          type: "input",
          message: "Total Quantity "
        }
      ])
      .then(function(answer) {
        var quantity = 0;
        var total=0;
        self.connection.query("select stock_quantity, price, department_name, product_sales from products where item_id = ?", answer.item_id, function(err,res){
          quantity = parseInt(res[0].stock_quantity);
          if (quantity >= parseInt(answer.quantity)){
            quantity -= parseInt(answer.quantity);
            console.log( " Your purchase is successful \n");
            self.salesTotal = res[0].product_sales;
            self.salesTotal += res[0].price * answer.quantity;
 
            var query = "UPDATE products SET ? WHERE ?";

            self.connection.query(query, 
              [{
                stock_quantity: quantity,
                product_sales: self.salesTotal
              },
              {
                item_id: answer.item_id
              }],
              
              function(err, res) {
                  setTimeout(function () {
                    self.allProducts(main);   
                  }, 1000)

            }); 
          }else{
            console.log("Insufficient Quantity, Please choose the item you want to purchase");
            self.runSearch(main);

          }
          
          

      })
        
    });

  }

};
module.exports = Customer;
  // 