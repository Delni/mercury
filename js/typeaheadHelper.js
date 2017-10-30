const substringMatcher = function(strs) {
  return function(q, cb) {
    var matches, substrRegex;

    // an array that will be populated with substring matches
    matches = [];

    // regex used to determine if a string contains the substring `q`
    substrRegex = new RegExp(q, 'i');

    // iterate through the pool of strings and for any string that
    // contains the substring `q`, add it to the `matches` array
    $.each(strs, function(i, str) {
      if (substrRegex.test(str)) {
        matches.push(str);
      }
    });

    cb(matches);
  };
};

var beneficiaries = globSettings.beneficiaries;
var categories = globSettings.categories;
var labels = globSettings.labels;

$('#op-benef.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: 'beneficiaries',
  source: substringMatcher(beneficiaries)
});

$('#op-cat.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: 'categories',
  source: substringMatcher(categories)
});

$('#op-label.typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 1
}, {
  name: 'labels',
  source: substringMatcher(labels)
});
