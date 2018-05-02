class Database {
  constructor(file = null) {
    if (file != null) {
      const filebuffer = fs.readFileSync(file)
      this.sql = new SQL.Database(filebuffer)
    } else {
      throw new Error('No file provided', 'Database.class.js',7)
    }
  }

  exec(sqlstr) {
    const aux = this.sql.exec(sqlstr)[0];
    if(aux === undefined) throw new Error("Empty response",'Database.class.js',15)
    const res = []
    for (var i = 0; i < aux.values.length; i++) {
      res[i] = {}
      for (var j = 0; j < aux.columns.length; j++) {
        res[i][aux.columns[j]] = aux.values[i][j]
      }
    }
    return res;
  }

  export(filepath) {
    const binArray = this.sql.export()
    fs.writeFile(filepath, binArray, (err) => {
      if (err) {
        throw err
      }
    });
  }

  print(res) {
    let str = "|\t"
    for (let i = 0; i < res[0].columns.length; i++) {
      str += res[0].columns[i].toUpperCase() + "\t|\t"
    }
    for (let i = 0; i < res[0].values.length; i++) {
      str = "|\t";
      for (let j = 0; j < res[0].columns.length; j++) {
        str += res[0].values[i][j]
        str += "\t|\t"
      }
    }
  }

  // @Change
  lookup(date, account, amount, state) {
    const lastlookup = this.exec('SELECT lastlookup FROM Accounts WHERE name="' + account + '"')[0].lastlookup
    if(moment(date, "YYYY-MM-DD").isBefore(moment(lastlookup,"YYYY-MM-DD"))){
      this.fullLookup(account);
    } else if (moment(date, "YYYY-MM-DD").isBefore(moment().format("YYYY-MM-DD"))){
      this.newlookup(lastlookup,account)
    } else {
      this.locallookup(account, amount, date, state)
    }
  }

  fullLookup(account) {
    // In Bank
    let sqlstmt = this.sql.prepare(
      "UPDATE Accounts SET inBank = Coalesce(Accounts.baseAmount+(SELECT SUM(amount) FROM OPERATION WHERE account_name =:name AND state='fa fa-check-circle' AND date<=:date),Accounts.baseAmount) WHERE name =:name2"
    );
    sqlstmt.run({
      ':name':account,
      ':date': moment().format('YYYY-MM-DD'),
      ':name2': account
    })
    sqlstmt.free(); sqlstmt = null;
    // Today
    sqlstmt = this.sql.prepare(
      "UPDATE Accounts SET today = Coalesce(Accounts.baseAmount+(SELECT SUM(amount) FROM OPERATION WHERE account_name =:name AND date<=:date),Accounts.baseAmount) WHERE name =:name2"
    );
    sqlstmt.run({
      ':name':account,
      ':date': moment().format('YYYY-MM-DD'),
      ':name2': account
    })
    sqlstmt.free(); sqlstmt = null;
    //Future
    sqlstmt = this.sql.prepare(
      "UPDATE Accounts SET future = Coalesce(Accounts.baseAmount +(SELECT SUM(amount) FROM OPERATION WHERE account_name =:name),Accounts.baseAmount) WHERE name =:name2"
    );
    sqlstmt.run({
      ':name':account,
      ':date': moment().format('YYYY-MM-DD'),
      ':name2': account
    })
    sqlstmt.free(); sqlstmt = null;
    try{
      this.exec('UPDATE Accounts SET lastlookup='+moment().format('YYYY-MM-DD')+' WHERE name="' + account + '"');
    } catch (e) {}
    this.buildChartData(account);
  }

  newlookup(lastlookup, account) {
    // In Bank
    let sqlstmt = this.sql.prepare(
      "UPDATE Accounts SET inBank = (Accounts.inBank+(SELECT SUM(amount) FROM OPERATION LEFT JOIN Accounts ON OPERATION.account_name=Accounts.name WHERE account_name =:name AND OPERATION.date<=:date AND OPERATION.date>Accounts.lastlookup AND state='fa fa-check-circle')) WHERE name =:name2"
    );
    sqlstmt.bind({
      ':name':account,
      ':date': moment().format('YYYY-MM-DD'),
      ':name2': account
    })
    sqlstmt.free(); sqlstmt = null;
    // Today
    sqlstmt = this.sql.prepare(
      "UPDATE Accounts SET today = (Accounts.today+(SELECT SUM(amount) FROM OPERATION WHERE account_name =:name AND date<=:date)) WHERE name =:name2"
    );
    sqlstmt.bind({
      ':name':account,
      ':date': moment().format('YYYY-MM-DD'),
      ':name2': account
    })
    sqlstmt.free(); sqlstmt = null;
    //Future
    sqlstmt = this.sql.prepare(
      "UPDATE Accounts SET future = (Accounts.future +(SELECT SUM(amount) FROM OPERATION WHERE account_name =:name)) WHERE name =:name2"
    );
    sqlstmt.bind({
      ':name':account,
      ':date': moment().format('YYYY-MM-DD'),
      ':name2': account
    })
    sqlstmt.free(); sqlstmt = null;
    try {
      this.exec('UPDATE Accounts SET lastlookup='+moment().format('YYYY-MM-DD')+' WHERE name="' + account + '"');
    } catch(e){}
  }

  locallookup(account, operation, dateBTF, stateBTF){
      if (stateBTF === "fa fa-check-circle" && !moment(dateBTF,'YYYY-MM-DD').isAfter(moment())) {
        this.sql.run("UPDATE Accounts SET future = (Accounts.future+" + operation + "), inBank = (Accounts.inBank+" + operation + "), today = (Accounts.today+" + operation + "), future = (Accounts.future+" + operation + ") WHERE name ='" + account + "'")
      } else if(moment(dateBTF,'YYYY-MM-DD').isAfter(moment())) {
        this.sql.run("UPDATE Accounts SET future = (Accounts.future+" + operation + ") WHERE name ='" + account + "'");
      } else {
        this.sql.run("UPDATE Accounts SET today = (Accounts.today+" + operation + "), future = (Accounts.future+" + operation + ") WHERE name ='" + account + "'")
      }
  }

  insertOperation(account, data, df) {
    if(account === null || account === undefined) throw new Error('No account provided','Database.class.js',52)
    const sqlstmt = this.sql.prepare("INSERT INTO OPERATION(date,state,beneficiary,category,label,amount,type,account_name) VALUES(:date,:state,:beneficiary,:category,:label,:amount,:type,:account_name)")
    sqlstmt.getAsObject({
      ':date': moment(data[0],df).format('YYYY-MM-DD'),
      ':state': data[1],
      ':beneficiary': data[2],
      ':category': data[3],
      ':label': data[4],
      ':amount': data[5],
      ':type': data[6],
      ':account_name': account
    });
    sqlstmt.free();
    this.locallookup(account,data[5], moment(data[0],df).format('YYYY-MM-DD'),data[1]);
    this.buildChartData(account);
  }

  insertRecurringOperation(account,data,df){
    //[amount,type,benef,cat,label,date,offset,timespan,time]
    if(account === null || account === undefined) throw new Error('No account provided','Database.class.js',52)
    const sqlstmt = this.sql.prepare("INSERT INTO Recurrings(amount,type,beneficiary,category,label,date,offset,timespan,times,account_name) VALUES(:amount,:type,:benef,:cat,:label,:date,:offset,:timespan,:time,:account_name)")
    sqlstmt.getAsObject({
      ':amount': data[0],
      ':type': data[1],
      ':benef': data[2],
      ':cat': data[3],
      ':label': data[4],
      ':date': moment(data[5],df).format('YYYY-MM-DD'),
      ':offset': data[6],
      ':timespan': data[7],
      ':time': data[8],
      ':account_name': account
    });
    sqlstmt.free();
  }

  editRecurringOperation(id,account,data,df){
    //[amount,type,benef,cat,label,date,offset,timespan,time]
    if(account === null || account === undefined) throw new Error('No account provided','Database.class.js',52)
    if(id === null || id === undefined) throw new Error('No id provided','Database.class.js',52)
    const sqlstmt = this.sql.prepare("UPDATE Recurrings SET amount=:amount,type=:type,beneficiary=:benef,category=:cat,label=:label,date=:date,offset=:offset,timespan=:timespan,times=:time,account_name=:account_name WHERE id="+id)
    sqlstmt.getAsObject({
      ':amount': data[0],
      ':type': data[1],
      ':benef': data[2],
      ':cat': data[3],
      ':label': data[4],
      ':date': moment(data[5],df).format('YYYY-MM-DD'),
      ':offset': data[6],
      ':timespan': data[7],
      ':time': data[8],
      ':account_name': account
    });
    sqlstmt.free();
  }

  editOperation(id, data, df){
    if(data[0] === null || data[0] === undefined) throw new Error('No account provided','Database.class.js',52)
    const sqlstmt = this.sql.prepare("UPDATE OPERATION SET date=:date,state=:state,beneficiary=:beneficiary,category=:category,label=:label,amount=:amount,type=:type,account_name=:account_name WHERE id="+id)
    sqlstmt.getAsObject({
      ':date': moment(data[1],df).format('YYYY-MM-DD'),
      ':state': data[2],
      ':beneficiary': data[3],
      ':category': data[4],
      ':label': data[5],
      ':amount': data[6],
      ':type': data[7],
      ':account_name': data[0]
    });
    sqlstmt.free();
    this.fullLookup(data[0]);
  }

  deleteOperation(id) {
    if( typeof id != "number") throw new Error('Invalid token')
    const account = this.exec('SELECT account_name from OPERATION where id='+id)[0].account_name
    this.sql.run('DELETE FROM OPERATION WHERE `id`='+id);
    this.fullLookup(account);
  }

  deleteRec(id){
    if( typeof id != "number") throw new Error('Invalid token')
    this.sql.run('DELETE FROM Recurrings WHERE `id`='+id);
  }

  launchPending(id){
    let resSQL = this.exec('SELECT * FROM Recurrings WHERE id='+id)[0]
    this.insertOperation(resSQL.account_name,[resSQL.date,"fa fa-circle-o",resSQL.beneficiary,resSQL.category,resSQL.label, resSQL.amount, resSQL.type],'YYYY-MM-DD')
    let newDate = moment(resSQL.date,'YYYY-MM-DD').add(resSQL.offset,resSQL.timespan).format('YYYY-MM-DD');
    resSQL.times = Number(resSQL.times)
    if (resSQL.times !== null) {
      if (resSQL.times === 1) {
        this.deleteRec(id);
      } else {
        const sqlstmt = this.sql.prepare("UPDATE Recurrings SET date=:date, times=:times WHERE id="+id)
        sqlstmt.getAsObject({
          ":date" : newDate,
          ":times": resSQL.times - 1
        });
        sqlstmt.free();
      }
    } else {
      const sqlstmt = this.sql.prepare("UPDATE Recurrings SET date=:date, WHERE id="+id)
      sqlstmt.getAsObject({
        ":date" : newDate
      });
      sqlstmt.free();
    }
  }
  updateTable(account,date,state,amount){
    const res = [];
    let sqlstr = "SELECT `id`,`state`,`date`,`type`,`beneficiary`,`category`,`label`,`amount` FROM OPERATION WHERE `account_name`=:account";
    if (state !== "*") {
      sqlstr += " AND `state`=:state";
    }
    if(amount === "plus"){
      sqlstr += " AND `amount`>=0";
    } else if(amount === "minus"){
      sqlstr += " AND `amount`<=0";
    }
    sqlstr += " AND `date`>=:date ORDER BY `date` DESC"
    const sqlstmt = this.sql.prepare(sqlstr);
    sqlstmt.bind({
      ':account': account,
      ':date': date,
      ':state': state,
      ':amount': amount
    })
    while(sqlstmt.step()){
      res.push(sqlstmt.get())
    }
    sqlstmt.free()
    return res;
  }

  addAccount(name, currency, baseAmount){
    const sqlstmt = this.sql.prepare("INSERT INTO Accounts VALUES (:name, :currency, :inBank, :today, :future,:amount,:date)")
    sqlstmt.getAsObject({
      ':name': name,
      ':currency': currency,
      ':inBank': baseAmount,
      ':today': baseAmount,
      ':future': baseAmount,
      ':amount': baseAmount,
      ':date': moment().format('YYYY-MM-DD')
    });
    sqlstmt.free();
  }

  deleteAccount(name) {
    this.sql.run('DELETE FROM `Accounts` WHERE name="' + name + '"')
    this.sql.run('DELETE FROM `OPERATION` WHERE account_name="' + name + '"')
    this.sql.run('DELETE FROM `Recurrings` WHERE account_name="' + name + '"')
    this.sql.run('DELETE FROM `Chronobase` WHERE account="' + name + '"')
  }


  buildChartData(account){
    this.sql.run('DELETE FROM `ChronoBase` WHERE account="' + account + '"');
    const operations = this.exec('SELECT date, amount FROM OPERATION WHERE account_name="' + account + '" ORDER BY date');
    const baseAmount = this.exec('SELECT baseAmount FROM Accounts WHERE name="' + account + '"')[0].baseAmount;
    let currentAmount = baseAmount;
    let sqlstmt = this.sql.prepare("INSERT INTO ChronoBase(date,amount,account) VALUES (:date,:amount,:account)")
    for (var i = 0; i < operations.length; i++) {
      currentAmount += operations[i].amount
      sqlstmt.run({
        ':date': operations[i].date,
        ':amount': currentAmount,
        ':account': account
      })
    }
    sqlstmt.free(); sqlstmt = null
  }
}
