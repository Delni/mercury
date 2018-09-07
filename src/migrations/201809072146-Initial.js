export default {
  name: '201809072146-Initial',
  up: `
    create table Accounts
    (
      name TEXT not null
        primary key,
      currency TEXT,
      inBank REAL,
      today REAL,
      future REAL,
      baseAmount REAL,
      lastlookup date
    );
          
    create table ChronoBase
    (
      id INTEGER
      primary key
       autoincrement,
      Date date,
      amount real,
      account TEXT
        constraint fk_account_chart
          references Accounts
            on delete cascade
    );
    
    create table OPERATION
    (
      id INTEGER
        primary key
         autoincrement,
      date date,
      state varchar,
      beneficiary varchar,
      category varchar,
      label varchar,
      amount real,
      type varchar,
      account_name TEXT not null
        constraint FK_Account
          references Accounts
            on delete cascade
    );
    
    create table Recurrings
    (
      id INTEGER
        primary key
         autoincrement,
      amount REAL not null,
      type VARCHAR,
      beneficiary VARCHAR,
      category VARCHAR,
      label VARCHAR,
      date DATE,
      offset INTEGER,
      timespan VARCHAR,
      times VARCHAR,
      account_name VARCHAR not null
    );
  `,
  down: `
    drop table Accounts;
    drop table ChronoBase;
    drop table OPERATION;
    drop table Recurrings;    
  `
}
