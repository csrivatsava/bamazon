var mysql = require("mysql");
var inquirer = require("inquirer");
var supervisor = require("./bamazonSupervisor.js");
var customer = require("./bamazonCustomer.js");
var manager = require("./bamazonManager.js");


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon"
});


var Main = function (connection){
  var main = this;
 
  this.start = function(connection){
     inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "Your Menu",
      choices: [
        "Customer",
        "Manager",
        "Supervisor",
        "Quit"
      ]
    }) 
    .then(function(answer) {
      switch (answer.action) {
        case "Customer":
          var cust = new customer(connection);
          console.log("All Products");
          cust.allProducts(main);
          break;

        case "Manager":
          var Manager = new manager(connection);
          console.log("All Products");
          Manager.allProducts(main);
          break;

        case "Supervisor":
          var Supervisor = new supervisor(connection);
          console.log("All Products");
          Supervisor.allProducts(main);
          break;

        case "Quit":
          console.log(" Closing the connection.")
          connection.end();
          return;
      }
    });
  }

}


connection.connect(function(err) {
  if (err) throw err;
    var main = new Main(connection)
    main.start(connection);  
  
});