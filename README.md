<!-- @format -->

# Stock-Portfolio-App
Web-app that allows users to retrieve US equity prices and track portfolios of stocks by their cumulative values  

Deployed on Heroku: http://stocks-portfolio-app-7087.herokuapp.com/  

Portfolio Page: https://jcleow.github.io/portfolio/stockPortfolio.html

Video Demonstration of Features (click on picture):
[![Stocks Portfolio App](https://imgur.com/tRdstRz.png)](https://www.youtube.com/watch?v=RxihjXRp7cQ")

## Features ##
1. Users can search for the prices of US stocks of their choice by simply typing in their relevant tickers. E.g Apple Inc is AAPL.
2. Toggle through different time frames for stock prices, complete with key headline financial information.
3. Create and track equity portfolios by adding stocks and associated trades


## Technical Features ##
* Web-app that allows users to retrieve US equity prices and track portfolios of stocks by their cumulative values
* Implemented React Hooks to store and manipulate front-end components’ states dynamically
* Integrated React-vis for interactive charting of stock prices and portfolio values over multiple time horizons
* Perform ETL operations using IEX Cloud’s sandboxed financial data API to display pertinent financial data

## Technologies Used ##
Frontend: React, CSS  
Backend: PostgresQL, Sequelize  
External Library: React-vis(charting)
External API: IEX Cloud (Financial Data API)

Link to ERD:
https://drive.google.com/file/d/1XRCJGJvbEBLF2PZeekeI0a3UzYbpflLf/view?usp=sharing

# How to run locally on your machine:
1. Git Clone https://github.com/jcleow/Stock-Portfolio-App.git
2. Run 'nodemon index.mjs'
3. View on localhost:3004
