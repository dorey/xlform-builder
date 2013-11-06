/*
This file provides a way to let people see what happens
when you create a new "SurveyApp".
*/


(function() {
  var csv2dom, trimMultilineString, trimString;

  trimString = function(str) {
    return String(str).replace(/^\s+|\s+$/g, '');
  };

  trimMultilineString = function(str) {
    var s;
    return ((function() {
      var _i, _len, _ref, _results;
      _ref = str.split("\n");
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        s = _ref[_i];
        if (s.match(/\w/)) {
          _results.push(trimString(s));
        }
      }
      return _results;
    })()).join("\n");
  };

  $(function() {
    return $("#new-survey").click(function(evt) {
      evt.preventDefault();
      $(evt.target).addClass("disabled");
      return new SurveyApp({}).render().$el.appendTo("#builder");
    });
  });

  csv2dom = function(txt, _elem) {
    var choices, csvTextAreaWrap, elem, hr, rowCount, settings, sheetToTable, sheetedCsv, survey, switchToRawView, tableView;
    elem = _elem ? $(_elem).empty() : $("<div>");
    switchToRawView = $("<button>", {
      "class": "floating-right",
      text: "Raw CSV"
    });
    tableView = $("<div>", {
      "class": "csv-table"
    }).append(switchToRawView);
    hr = function() {
      return $("<hr>").appendTo(tableView);
    };
    sheetedCsv = csv.sheeted(txt);
    survey = sheetedCsv.sheet("survey");
    choices = sheetedCsv.sheet("choices");
    settings = sheetedCsv.sheet("settings");
    sheetToTable = function(survey) {
      var cell, column, headRow, row, table, tbody, tr, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      table = $("<table>");
      headRow = $("<tr>");
      _ref = survey.columns;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        column = _ref[_i];
        $("<th>", {
          text: column
        }).appendTo(headRow);
      }
      $("<thead>", {
        html: headRow
      }).appendTo(table);
      tbody = $("<tbody>").appendTo(table);
      _ref1 = survey.rowArray;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        row = _ref1[_j];
        tr = $("<tr>").appendTo(tbody);
        for (_k = 0, _len2 = row.length; _k < _len2; _k++) {
          cell = row[_k];
          $("<td>", {
            text: cell
          }).appendTo(tr);
        }
      }
      return table;
    };
    $("<h2>", {
      html: "<code>survey</code> sheet:"
    }).appendTo(tableView);
    hr();
    sheetToTable(survey).appendTo(tableView);
    if (choices && choices.rows.length > 0) {
      $("<h2>", {
        html: "<code>choices</code> sheet:"
      }).appendTo(tableView);
      hr();
      sheetToTable(choices).appendTo(tableView);
    }
    if (settings && settings.rows.length > 0) {
      $("<h2>", {
        html: "<code>settings</code> sheet:"
      }).appendTo(tableView);
      hr();
      sheetToTable(settings).appendTo(tableView);
    }
    csvTextAreaWrap = $("<div style=\"display:none\" class=\"csv-textarea\">\n  CSV Representation: <button class=\"floating-right\">View as table</button>\n  <hr>\n  <textarea></textarea>\n</div>");
    rowCount = txt.split("\n").length;
    csvTextAreaWrap.find("textarea").val(txt).css({
      height: 19 * rowCount,
      width: 796
    });
    switchToRawView.click(function() {
      csvTextAreaWrap.show();
      return tableView.hide();
    });
    csvTextAreaWrap.find("button").click(function() {
      csvTextAreaWrap.hide();
      return tableView.show();
    });
    elem.append(tableView);
    elem.append(csvTextAreaWrap);
    return elem;
  };

}).call(this);
