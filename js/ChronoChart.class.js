class ChronoChart {
  constructor(ctx, accounts) {
    this.belowZ = false;
    this.colors = [
      {backgroundColor: 'rgba(50, 115, 221,0.2)', borderColor: '#3273dc'},
      {backgroundColor: 'rgba(50, 221, 72, 0.2)', borderColor: '#32dd61'},
      {backgroundColor: 'rgba(125, 50, 221, 0.2)', borderColor: '#5e32dd'},
      {backgroundColor: 'rgba(221, 188, 50, 0.2)', borderColor: '#d9dd32'}
    ];
    this.config = {
      type: 'line',
      data: null,
      options: {
        legend: {
          display: false
        },
        fill: 'bottom',
        scales: {
					xAxes: [{
						type: "time",
						time: {
              parser: 'DD/MM/YYYY',
							tooltipFormat: 'DD/MM/YYYY'
						},
						scaleLabel: {
							display: true,
							labelString: i18njs('Date')
						}
					}],
					yAxes: [{
						scaleLabel: {
							display: true,
							labelString: i18njs('Value')
						}
					}],
        }
      }
    };
    this.ctx = ctx;
    this.config.data = { datasets: []};
    for (var i = 0; i < accounts.length; i++) {
      const colors = this.colorsPicker();
      let data;
      try {
        data = global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date>="${moment().subtract(1,'months').format('YYYY-MM-DD')}" AND date<="${moment()/*.add(10,'days')*/.format('YYYY-MM-DD')}" GROUP BY date`);
      } catch (e) {
        data = [];
        console.error(e);
      }
      const newDataset = {
        label: this.currencyConverter(accounts[i].currency),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        data: []
      }
      let lastDate;
      for (var j = 0; j < data.length; j++) {
        newDataset.data.push(
          {
            x: moment(data[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: data[j].amount.toFixed(2)
          })
          if(data[j].amount < 0) this.belowZ = true;
          lastDate = data[j].Date;
      }
      const newforeDataset = {
        label: this.currencyConverter(accounts[i].currency),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 1,
        data: [],
        fill: false,
      }
      let foredata
      try {
        foredata = global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date>="${lastDate}" GROUP BY date`);
      } catch (e) {
        console.error(e);
        foredata = [];
      }
      for (var j = 0; j < foredata.length; j++) {
        newforeDataset.data.push(
          {
            x: moment(foredata[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: foredata[j].amount.toFixed(2)
          })
          if(foredata[j].amount.toFixed(2) < 0) this.belowZ = true;
      }
      this.config.data.datasets.push(newDataset);
      this.config.data.datasets.push(newforeDataset);
    }
    if(this.belowZ) {
      this.addDangerZone();
    }
    this.chart = new Chart(ctx, this.config);
    this.chart.render();
  }

  colorsPicker(){
    const tmp = this.colors.shift();
    this.colors.push(tmp);
    return tmp;
  }

  currencyConverter(cur){
    switch (cur) {
      case 'eur':
        return '€';
        break;
      case 'usd':
        return '$';
        break;
      case 'gbp':
        return '£';
        break;
      case 'inr':
        return '₹';
        break;
      case 'try':
        return '₺';
        break;
      case 'cny':
        return '¥';
        break;
      case 'rub':
        return '₽';
        break;
      default:
        return cur;
    }
  }

  addDangerZone(){
    const lastDate = this.lastof(this.config.data.datasets);
    const firstDate = this.firstof(this.config.data.datasets);
    this.config.data.datasets.push({
      label: 'Warning zone',
      backgroundColor: 'rgba(221, 50, 50, 0.2)',
      borderColor: '#dd3232',
      borderWidth: 1,
      pointRadius: 0,
      fill: 'bottom',
      data: [
        {x:firstDate,y:0},
        {x:lastDate,y:0}
      ]
    })
  }

  lastof(datasets){
    let lastDate = "1901-01-01";
    for (var i = 0; i < datasets.length; i++) {
      lastDate = (moment(datasets[i].data[datasets[i].data.length-1].x,'YYYY-MM-DD').isAfter(moment(lastDate,'YYYY-MM-DD'))) ? datasets[i].data[datasets[i].data.length-1].x : lastDate;
    }
    return lastDate;
  }

  firstof(datasets){
    let firstDate = "01/01/2999";
    for (var i = 0; i < datasets.length; i++) {
      firstDate = (moment(datasets[i].data[0].x,'DD/MM/YYYY').isBefore(moment(firstDate,'DD/MM/YYYY'))) ? datasets[i].data[0].x : firstDate;
    }
    return firstDate;
  }

  refresh(accounts){
    for (var i = 0; i < accounts.length; i+=2) {
      const data= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date>="${moment().subtract(1,'months').format('YYYY-MM-DD')}" AND date<="${moment()/*.add(10,'days')*/.format('YYYY-MM-DD')}" GROUP BY date`)
      let lastDate;
      if (typeof this.config.data.datasets[i] === "undefined") throw new Error("No #"+i+" dataset found");
      for (var j = 0; j < data.length; j++) {
        this.config.data.datasets[i].data[j] ={
            x: moment(data[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: data[j].amount.toFixed(2)
          };
          lastDate = data[j].Date;
      }
      while (this.config.data.datasets[i].data.length !== data.length) {
        this.config.data.datasets[i].data.pop();
      }
      const foredata= global.db.exec(`SELECT date, amount FROM ChronoBase WHERE account="${accounts[i].name}" AND date>="${lastDate}" GROUP BY date`)
      for (var j = 0; j < foredata.length; j++) {
        this.config.data.datasets[i+1].data[j] = {
            x: moment(foredata[j].Date,'YYYY-MM-DD').format('DD/MM/YYYY'),
            y: foredata[j].amount.toFixed(2)
          };
      }
    }
    this.chart.update();
  }
}
