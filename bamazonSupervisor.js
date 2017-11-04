var inquirer = require("inquirer");
var Table = require('cli-table');
  

var Supervisor = function (connection){
  var self = this;
  this.connection = connection,
  this.runSearch = function(main) {
    var main = main;  
    inquirer
      .prompt({
        name: "action",
        type: "rawlist",
        message: "Your Menu",
        choices: [
          "All Products",
          "All Departments",
          "Add New Department",
          "View Product sales by department",
          "Main Page"
        ]
      }) 
      .then(function(answer) {
        switch (answer.action) {
          case "All Products":
            self.allProducts(main);
            break;
          
          case "All Departments":
            self.allDepartments(main);
            break;
          
          case "Add New Department":
            self.newDepartment(main);
            break;
          
          case "View Product sales by department":
            self.productsForSalebyDept(main);
            break;
          
          case "Main Page":
            main.start(self.connection);
            return;
        }
      });
  },
  // function to display all the departments available.
  this.allDepartments = function(main) {
    var query = "SELECT department_id, department_name, over_head_costs FROM departments";
        var table = new Table({
                head: ["Department ID ", "Department Name", "Over Head Costs"]
            });
        self.connection.query(query, function(err, res) {
          
          for (var i = 0; i < res.length; i++) {
            // Pushing the query results into the table.
            table.push(
                [ res[i].department_id, res[i].department_name , res[i].over_head_costs]
            );
          }
          console.log(table.toString());
        })
        setTimeout(function () {
          self.runSearch(main);  
        }, 1000)
  } 
  // function to display all available products.
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
  // function to display product sales based on department.
  this.productsForSalebyDept = function(main) {
    var department = [];
    var query = "SELECT department_name from departments";
    //pushing the department names into an Array.
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
          choices: department,
          message: "WHICH department you need to check?"
        })
        .then(function(answer) {
          var query = "select departments.department_id, departments.department_name, departments.over_head_costs, sum(products.product_sales) as 'ProductSales', (over_head_costs - sum(products.product_sales)) as 'TotalProfit' from departments RIGHT JOIN products on departments.department_name = products.department_name group by department_id;"; 
          var table = new Table({
                  head: ["Department Id ", "Department Name", "Over head Costs", "Product Sales", "Total Profit"]
              });
   
          connection.query(query, { department_name: answer.deptName }, function(err, res) {
            for (var i = 0; i < res.length; i++) {
              // Pushing the query results into the table.
              if (res[i].department_name === answer.deptName){
                if (res[i].ProductSales===0){
                  res[i].TotalProfit = 0;
                }
                table.push(
                    [ res[i].department_id, res[i].department_name , res[i].over_head_costs, res[i].ProductSales, res[i].TotalProfit]
                );
                }
              
            }
            console.log(table.toString());
            setTimeout(function(){
              self.runSearch(main);
            });
          });
        });
      }, 1000)
  },
  // Creating a new Department 
  this.newDepartment = function(main){
    inquirer
      .prompt([
        {
          name: "department_name",
          type: "input",
          message: "Enter the Department Name ",
        },
        {
          name: "over_head_costs",
          type: "input",
          message: "Enter the over head costs "
        }
      ])
      .then(function(answer) {

        self.connection.query("INSERT INTO departments SET ?", 
          { 
            department_name : answer.department_name,
            over_head_costs : answer.over_head_costs 
          }, 
          function(err, res) {
            console.log( "The new product is added successfully \n");
            setTimeout(function () {
              self.allDepartments(main);  
            }, 1000)

          });
      });
  }

};
module.exports = Supervisor;
  // 