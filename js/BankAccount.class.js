class BankAccount {
  constructor(name, currency, inB = 0, tod = 0, fut = 0) {
    this._name = name
    this._currency = currency
    this._amount = [
      {"amount": inB, "label" : "Bank"},
      {"amount": tod, "label" : "Today"},
      {"amount": fut, "label" : "Future"}
    ]
  }

  get name(){
    return this._name
  }

  get currency(){
    return this._currency
  }

  get inBank(){
    return this._amount[0].amount
  }

  get today(){
    return this._amount[1].amount
  }

  get future(){
    return this._amount[2].amount
  }

  get amount(){
    return this._amount
  }

  set name(value){
    this.name = value
  }

  set currency(value){
    this._currency = value
  }

  set inBank(value){
    this._amount[0].amount = value
  }
  set today(value){
    this._amount[1].amount = value
  }
  set future(value){
    this._amount[2].amount = value
  }

  render(where){
    console.log(this.name +" is being rendered in "+where)
    let list = $(where)
    list.append(
      $('<article>')
      .addClass("card notification is-dark is-paddingless")
      .attr('id',this.name)
      .append(
        $('<div>').addClass('card-header')
        .append(
          $('<div>').addClass('card-header-icon')
          .append(
            $('<span>').addClass("icon")
            .append(
              $('<i>').addClass('fa fa-bank')
            )
          )
        )
        .append(
          $('<div>').addClass('card-header-title')
          .text(this.name)
        )
        .append(
          $('<button></button>').addClass("delete")
          .attr({
            onclick: "deleteAccount(this)",
            data: this.name
          })
        )
      )
      .append(
        $('<div>').addClass("card-content")
        .append(
          $('<div>').addClass("content is-paddingless is-marginless")
          .append(
            $('<small>').append(
              $('<p>').text('Bank : ')
              .append(
                $('<span>').addClass("amount").attr('id','inBank')
                .text(this.inBank.toFixed(2)+" ")
                .append(
                  $('<span>').addClass("icon is-small")
                  .append(
                    $('<i>').addClass("fa fa-"+this.currency)
                  )              )
              )
            )
            .append(
              $('<p>').text('Today : ')
              .append(
                $('<span>').addClass("amount").attr('id','inToday')
                .text(this.today.toFixed(2)+" ")
                .append(
                  $('<span>').addClass("icon is-small")
                  .append(
                    $('<i>').addClass("fa fa-"+this.currency)
                  )              )
              )
            )
            .append(
              $('<p>').text('Future : ')
              .append(
                $('<span>').addClass("amount").attr('id','inFuture')
                .text(this.future.toFixed(2)+" ")
                .append(
                  $('<span>').addClass("icon is-small")
                  .append(
                    $('<i>').addClass("fa fa-"+this.currency)
                  )
                )
              )
            )
          )
        )
      )

    )
  }

  static clone(obj){
    return new BankAccount(obj.name, obj.currency, obj.inBank,obj.today,obj.future)
  }
}
