class Database {
  constructor(file = null) {
    this.request = [
      "SELECT * FROM Accounts"
    ]
    if (file != null) {
      console.log('Reading '+file);
      let filebuffer = fs.readFileSync(file);
      this.sql = new SQL.Database(filebuffer);
    } else {
      throw new Error('No file provided', 'Database.class.js',7)
    }
  }

  exec(sqlstr) {
    let aux = this.sql.exec(sqlstr)[0];
    if(aux === undefined) throw new Error("Empty response",'Database.class.js',15)
    let res = [];
    for (var i = 0; i < aux.values.length; i++) {
      res[i] = {}
      for (var j = 0; j < aux.columns.length; j++) {
        res[i][aux.columns[j]] = aux.values[i][j];
      }
    }
    return res;
  }

  export(filepath) {
    let binArray = this.sql.export()
    fs.writeFile(filepath, binArray, (err) => {
      if (err) {
        throw err;
      }
    });
  }

  print(res) {
    let str = "|\t"
    for (var i = 0; i < res[0].columns.length; i++) {
      str += res[0].columns[i].toUpperCase() + "\t|\t"
    }
    console.log(str);
    for (var i = 0; i < res[0].values.length; i++) {
      str = "|\t";
      for (var j = 0; j < res[0].columns.length; j++) {
        str += res[0].values[i][j]
        str += "\t|\t"
      }
      console.log(str);
    }
  }

  insertOperation(account, data, df) {
    console.log(new Date() + '--- Inserting New Operation');
    if(account === null || account === undefined) throw new Error('No account provided','Database.class.js',52)
    let sqlstmt = this.sql.prepare("INSERT INTO OPERATION(date,state,beneficiary,category,label,amount,type,account_name) VALUES(:date,:state,:beneficiary,:category,:label,:amount,:type,:account_name)")
    sqlstmt.getAsObject({
      ':date' : moment(data[0],df).format('YYYY-MM-DD'),
      ':state' : data[1],
      ':beneficiary' : data[2],
      ':category' : data[3],
      ':label' : data[4],
      ':amount' : data[5],
      ':type' : data[6],
      ':account_name' : account
    });
    sqlstmt.free();
  }

  editOperation(id, data, df){
    console.log(new Date() + '--- Updating Operation #'+id);
    if(data[0] === null || data[0] === undefined) throw new Error('No account provided','Database.class.js',52)
    let sqlstmt = this.sql.prepare("UPDATE OPERATION SET date=:date,state=:state,beneficiary=:beneficiary,category=:category,label=:label,amount=:amount,type=:type,account_name=:account_name WHERE id="+id)
    sqlstmt.getAsObject({
      ':date' : moment(data[1],df).format('YYYY-MM-DD'),
      ':state' : data[2],
      ':beneficiary' : data[3],
      ':category' : data[4],
      ':label' : data[5],
      ':amount' : data[6],
      ':type' : data[7],
      ':account_name' : data[0]
    });
    sqlstmt.free();
  }

  deleteOperation(id) {
    console.log(new Date() + '--- Deleting Operation');
    if( typeof id != "number") throw new Error('Invalid token')
    this.sql.run('DELETE FROM OPERATION WHERE `id`='+id);
  }

  updateTable(account,date,state,amount){
    let res = new Array()
    let sqlstr = "SELECT `id`,`state`,`date`,`type`,`beneficiary`,`category`,`label`,`amount` FROM OPERATION WHERE `account_name`=:account";
    if (state != "*") {
      sqlstr += " AND `state`=:state";
    }
    if(amount === "plus"){
      sqlstr += " AND `amount`>=0";
    } else if(amount === "minus"){
      sqlstr += " AND `amount`<=0";
    }
    sqlstr += " ORDER BY `date` DESC"
    let sqlstmt = this.sql.prepare(sqlstr);
    sqlstmt.bind({
      ':account' : account,
      ':date' : date,
      ':state' : state,
      ':amount' : amount
    })
    while(sqlstmt.step()){
      res.push(sqlstmt.get())
    }
    sqlstmt.free();
    return res;
  }

  addAccount(name, currency, baseAmount){
    let sqlstmt = this.sql.prepare("INSERT INTO Accounts VALUES (:name, :currency, :inBank, :today, :future,:amount,:date)");
    sqlstmt.getAsObject({
      ':name' :name,
      ':currency' : currency,
      ':inBank' : baseAmount,
      ':today' : baseAmount,
      ':future' : baseAmount,
      ':amount' : baseAmount,
      ':date' : moment().format('YYYY-MM-DD')
    });
    sqlstmt.free();
  }

  deleteAccount(name) {
    this.sql.run('DELETE FROM `Accounts` WHERE name="'+name+'"')
  }
}
