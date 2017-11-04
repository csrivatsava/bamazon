DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT AUTO_INCREMENT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price FLOAT(5) NULL,
  stock_quantity INT default 0,
  PRIMARY KEY (item_id)
);

CREATE TABLE departments (
  department_id INT NOT NULL,
  department_name VARCHAR(100) NULL,
  over_head_costs INT NULL,
  PRIMARY KEY (department_id)
);

SELECT * FROM products;
select * from departments;