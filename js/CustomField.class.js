class CustomField {
  constructor(icon, id, opt = null, location = null, type = null) {
    this._icon = icon;
    this._location = location;
    this._opt = opt;
    this._id = id;
    switch (type) {
      case 'select':
        this._type = 'select';
        break;
      case 'number':
        this._type = 'number';
        break;
      default:
        this._type = 'text'
    }
  }

  get icon() {
    return this._icon
  }

  get location() {
    return this._location;
  }

  get id() {
    return this._id;
  }

  get opt() {
    return this._opt;
  }

  get type(){
    return this._type;
  }

  render(loc = null) {
    loc = (loc === null) ? this.location : loc;
    $(loc).append(
      this.generate()
    )
    return this;
  }

  generate() {
    if (this.type === 'select') {
        return this.generateSelect();
    } else {
      return this.generateInput();
    }
  }

  generateInput() {
    return $('<div>').addClass('field has-addons')
    .append(
      $('<div>').addClass('control')
      .append(
        $('<a>').addClass('button is-primary is-tag').attr('id', this.id + '-btn')
        .append(
          $('<span>').addClass('icon')
          .append(
            $('<i>').addClass('fa fa-' + this.icon)
          )
        )
      )
    )
    .append(
      $('<div>').addClass('control')
      .append(
        $('<input>')
        .addClass('input')
        .attr('type', this.type)
        .attr('id', this.id)
        .attr('name', this.id)
        .attr('placeholder', this.opt.placeholder)
      )
    );
  }

  generateSelect(){
    const select = $('<select>').attr('id', this.id).attr('name', this.id);

    for (var i = 0; i < this.opt.options.length; i++) {
      select.append(
        $('<option>').attr('value',this.opt.options[i][0]).text(this.opt.options[i][1])
      );
    }
    return $('<div>').addClass('control field has-addons')
    .append(
      $('<div>').addClass('control')
      .append(
        $('<a>').addClass('button is-primary is-tag').attr('id', this.id + '-btn')
        .append(
          $('<span>').addClass('icon')
          .append(
            $('<i>').addClass('fa fa-' + this.icon)
          )
        )
      )
    )
    .append(
      $('<div>').addClass('control select')
      .append(
        select
      )
    )
  }
}
