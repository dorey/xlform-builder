(function() {
  var Csv, SheetedCsv, arrayToObject, arrayToObjects, asCsvCellValue, csv, parseSheetedCsv, removeTrailingNewlines, _isArray, _isString, _keys, _nativeIsArray, _nativeKeys,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  Csv = (function() {
    function Csv(param, opts) {
      var key, row, rows, val, _i, _len, _ref,
        _this = this;
      if (opts == null) {
        opts = {};
      }
      if (_isString(param)) {
        this.string = param;
        rows = csv.toArray(removeTrailingNewlines(param));
        this.rows = arrayToObjects(rows);
        this.columns = rows[0], this.rowArray = 2 <= rows.length ? __slice.call(rows, 1) : [];
      } else if (_isArray(param)) {
        this.rows = param;
        this.columns = (function() {
          var columns, key, row, _i, _len, _ref;
          columns = [];
          _ref = _this.rows;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            row = _ref[_i];
            for (key in row) {
              if (!__hasProp.call(row, key)) continue;
              if (__indexOf.call(columns, key) < 0) {
                columns.push(key);
              }
            }
          }
          return columns;
        })();
        this.buildRowArray();
        this.obj = param;
      } else if (param) {
        this.columns = _isArray(param.columns) ? param.columns : [];
        if (param.rowObjects) {
          if (this.columns.length === 0) {
            _ref = param.rowObjects;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              row = _ref[_i];
              for (key in row) {
                val = row[key];
                if (!(key in columns)) {
                  this.columns.push(key);
                }
              }
            }
          }
          this.rowArray = (function() {
            var c, _j, _len1, _ref1, _results;
            _ref1 = param.rowObjects;
            _results = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              row = _ref1[_j];
              _results.push((function() {
                var _k, _len2, _ref2, _results1;
                _ref2 = this.columns;
                _results1 = [];
                for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                  c = _ref2[_k];
                  _results1.push(row[c]);
                }
                return _results1;
              }).call(_this));
            }
            return _results;
          })();
        } else {
          this.rowArray = _isArray(param.rows) ? param.rows : [];
        }
        if (param.kind != null) {
          this.kind = param.kind;
        }
        this.rows = (function() {
          var cell, i, rowObj, _j, _k, _len1, _len2, _ref1, _results;
          _ref1 = _this.rowArray;
          _results = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            row = _ref1[_j];
            rowObj = {};
            for (i = _k = 0, _len2 = row.length; _k < _len2; i = ++_k) {
              cell = row[i];
              if (_this.columns[i] != null) {
                rowObj[_this.columns[i]] = cell;
              }
            }
            _results.push(rowObj);
          }
          return _results;
        })();
      } else {
        this.rows = [];
        this.columns = [];
        this.rowArray = [];
      }
    }

    Csv.prototype.buildRowArray = function() {
      var _this = this;
      return this.rowArray = (function() {
        var column, row, _i, _len, _ref, _results;
        _ref = _this.rows;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _results.push((function() {
            var _j, _len1, _ref1, _results1;
            _ref1 = this.columns;
            _results1 = [];
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              column = _ref1[_j];
              _results1.push(row[column] || "");
            }
            return _results1;
          }).call(_this));
        }
        return _results;
      })();
    };

    Csv.prototype.addRow = function(r) {
      var colsChanged, column, key, val;
      colsChanged = false;
      for (key in r) {
        if (!__hasProp.call(r, key)) continue;
        val = r[key];
        if (__indexOf.call(this.columns, key) < 0) {
          colsChanged = true;
          this.columns.push(key);
        }
      }
      this.rows.push(r);
      if (colsChanged) {
        this.buildRowArray();
      } else {
        this.rowArray.push((function() {
          var _i, _len, _ref, _results;
          _ref = this.columns;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            column = _ref[_i];
            _results.push(r[column]);
          }
          return _results;
        }).call(this));
      }
      return r;
    };

    Csv.prototype.toObjects = function(opts) {
      if (opts == null) {
        opts = {};
      }
      if (this.string) {
        return csv.toObjects(this.string, opts);
      } else if (this.rows) {
        return this.rows;
      }
    };

    Csv.prototype.toObject = function() {
      var out;
      out = {
        columns: this.columns,
        rows: this.rowArray
      };
      if (this.kind) {
        out.kind = this.kind;
      }
      return out;
    };

    Csv.prototype.toArrays = function() {
      var out, row, _i, _len, _ref;
      out = [this.columns];
      _ref = this.rowArray;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        row = _ref[_i];
        if (row.length > 0) {
          out.push(row);
        }
      }
      return out;
    };

    Csv.prototype.toString = function() {
      var cell, headRow, row;
      headRow = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.columns;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          cell = _ref[_i];
          _results.push(asCsvCellValue(cell));
        }
        return _results;
      }).call(this)).join(csv.settings.delimiter);
      return headRow + "\n" + ((function() {
        var _i, _len, _ref, _results;
        _ref = this.rowArray;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          row = _ref[_i];
          _results.push(((function() {
            var _j, _len1, _results1;
            _results1 = [];
            for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
              cell = row[_j];
              _results1.push(asCsvCellValue(cell));
            }
            return _results1;
          })()).join(csv.settings.delimiter));
        }
        return _results;
      }).call(this)).join("\n");
    };

    return Csv;

  })();

  csv = function(param, opts) {
    if (param instanceof Csv) {
      return param;
    } else {
      return new Csv(param, opts);
    }
  };

  asCsvCellValue = function(cell) {
    if (cell === void 0) {
      return "";
    } else if (RegExp("\\W|\\w|" + csv.settings.delimiter).test(cell)) {
      return JSON.stringify("" + cell);
    } else {
      return cell;
    }
  };

  csv.fromStringArray = function(outpArr, opts) {
    var cell, outArr, row;
    if (opts == null) {
      opts = {};
    }
    outArr = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = outpArr.length; _i < _len; _i++) {
        row = outpArr[_i];
        _results.push(((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (_j = 0, _len1 = row.length; _j < _len1; _j++) {
            cell = row[_j];
            _results1.push(asCsvCellValue(cell));
          }
          return _results1;
        })()).join(csv.settings.delimiter));
      }
      return _results;
    })();
    return outArr.join("\n");
  };

  csv.fromArray = function(arr, opts) {
    var col, headRow, key, outpArr, row, sort, _i, _len;
    if (opts == null) {
      opts = {};
    }
    sort = !!opts.sort;
    headRow = [];
    for (_i = 0, _len = arr.length; _i < _len; _i++) {
      row = arr[_i];
      for (key in row) {
        if (!__hasProp.call(row, key)) continue;
        if (-1 === headRow.indexOf(key)) {
          headRow.push(key);
        }
      }
    }
    if (sort) {
      headRow.sort();
    }
    outpArr = (function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = arr.length; _j < _len1; _j++) {
        row = arr[_j];
        _results.push((function() {
          var _k, _len2, _results1;
          _results1 = [];
          for (_k = 0, _len2 = headRow.length; _k < _len2; _k++) {
            col = headRow[_k];
            _results1.push(asCsvCellValue(row[col]));
          }
          return _results1;
        })());
      }
      return _results;
    })();
    outpArr.unshift((function() {
      var _j, _len1, _results;
      _results = [];
      for (_j = 0, _len1 = headRow.length; _j < _len1; _j++) {
        col = headRow[_j];
        _results.push(asCsvCellValue(col));
      }
      return _results;
    })());
    return csv.fromStringArray(outpArr, opts);
  };

  csv.toObjects = function(csvString) {
    return arrayToObjects(csv.toArray(removeTrailingNewlines(csvString)));
  };

  arrayToObjects = function(arr) {
    var headRow, i, key, obj, row, rows, _i, _j, _len, _len1, _results;
    headRow = arr[0], rows = 2 <= arr.length ? __slice.call(arr, 1) : [];
    _results = [];
    for (_i = 0, _len = rows.length; _i < _len; _i++) {
      row = rows[_i];
      if (!(!(row.length === 1 && row[0] === ""))) {
        continue;
      }
      obj = {};
      for (i = _j = 0, _len1 = headRow.length; _j < _len1; i = ++_j) {
        key = headRow[i];
        obj[key] = row[i];
      }
      _results.push(obj);
    }
    return _results;
  };

  csv.toObject = function(csvString, opts) {
    return arrayToObject(csv.toArray(removeTrailingNewlines(csvString)), opts);
  };

  arrayToObject = function(arr, opts) {
    var headRow, i, includeSortByKey, key, obj, out, row, rows, sbKeyVal, sortByKey, sortByKeyI, _i, _j, _len, _len1;
    if (opts == null) {
      opts = {};
    }
    headRow = arr[0], rows = 2 <= arr.length ? __slice.call(arr, 1) : [];
    sortByKey = opts.sortByKey;
    includeSortByKey = opts.includeSortByKey;
    if (!sortByKey) {
      sortByKey = headRow[0];
    }
    sortByKeyI = headRow.indexOf(sortByKey);
    out = {};
    for (_i = 0, _len = rows.length; _i < _len; _i++) {
      row = rows[_i];
      if (!(!(row.length === 1 && row[0] === ""))) {
        continue;
      }
      obj = {};
      sbKeyVal = row[sortByKeyI];
      for (i = _j = 0, _len1 = headRow.length; _j < _len1; i = ++_j) {
        key = headRow[i];
        if (i !== sortByKeyI) {
          obj[key] = row[i];
        }
      }
      if (includeSortByKey) {
        obj[sortByKey] = sbKeyVal;
      }
      out[sbKeyVal] = obj;
    }
    return out;
  };

  removeTrailingNewlines = function(str) {
    return str.replace(/(\n+)$/g, "");
  };

  csv.toArray = function(strData) {
    var arrMatches, objPattern, parsedMatch, row, rows, strDelimiter, strMatchedDelimiter, strMatchedValue;
    strDelimiter = csv.settings.delimiter;
    rows = [];
    row = [];
    objPattern = RegExp("(\\" + strDelimiter + "|\\r?\\n|\\r|^)(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^\"\\" + strDelimiter + "\\r\\n]*))", "gi");
    while (arrMatches = objPattern.exec(strData)) {
      strMatchedDelimiter = arrMatches[1];
      if (strMatchedDelimiter.length && (strMatchedDelimiter !== strDelimiter)) {
        rows.push(row);
        row = [];
      }
      if (arrMatches[2]) {
        strMatchedValue = arrMatches[2].replace(/""/g, "\"");
      } else {
        strMatchedValue = arrMatches[3];
      }
      if (csv.settings.parseFloat && !isNaN((parsedMatch = parseFloat(strMatchedValue)))) {
        strMatchedValue = parsedMatch;
      }
      row.push(strMatchedValue);
    }
    rows.push(row);
    return rows;
  };

  SheetedCsv = (function() {
    function SheetedCsv(param, opts) {
      var _this = this;
      this._sheetIds = [];
      this._sheets = {};
      if (_isString(param)) {
        parseSheetedCsv(param, function(osids, sheets) {
          var columns, id, rows, _i, _len, _ref, _results;
          _results = [];
          for (_i = 0, _len = osids.length; _i < _len; _i++) {
            id = osids[_i];
            _ref = sheets[id], columns = _ref[0], rows = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
            _results.push(_this.sheet(id, csv({
              columns: columns,
              rows: rows
            })));
          }
          return _results;
        });
      }
    }

    SheetedCsv.prototype.sheet = function(sheetId, contents) {
      if (contents == null) {
        contents = false;
      }
      if (contents) {
        if (__indexOf.call(this._sheetIds, sheetId) < 0) {
          this._sheetIds.push(sheetId);
        }
        return this._sheets[sheetId] = contents;
      } else {
        return this._sheets[sheetId];
      }
    };

    SheetedCsv.prototype.toString = function() {
      var cell, col, cols, delimiter, headRowStr, i, outp, row, rowA, sheet, sheetId, _i, _j, _k, _len, _len1, _ref, _ref1;
      outp = [];
      delimiter = csv.settings.delimiter;
      _ref = this._sheetIds;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        sheetId = _ref[_i];
        sheet = this._sheets[sheetId];
        cols = sheet.columns;
        rowA = sheet.rowArray;
        headRowStr = asCsvCellValue(sheetId);
        for (i = _j = 0, _ref1 = cols.length; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          headRowStr += delimiter;
        }
        outp.push(headRowStr);
        outp.push(delimiter + ((function() {
          var _k, _len1, _results;
          _results = [];
          for (_k = 0, _len1 = cols.length; _k < _len1; _k++) {
            col = cols[_k];
            _results.push(asCsvCellValue(col));
          }
          return _results;
        })()).join(delimiter));
        for (_k = 0, _len1 = rowA.length; _k < _len1; _k++) {
          row = rowA[_k];
          outp.push(delimiter + ((function() {
            var _l, _len2, _results;
            _results = [];
            for (_l = 0, _len2 = row.length; _l < _len2; _l++) {
              cell = row[_l];
              _results.push(asCsvCellValue(cell));
            }
            return _results;
          })()).join(delimiter));
        }
      }
      return outp.join("\n");
    };

    return SheetedCsv;

  })();

  csv.sheeted = function(param, opts) {
    if (param instanceof SheetedCsv) {
      return param;
    } else {
      return new SheetedCsv(param, opts);
    }
  };

  parseSheetedCsv = function(shcsv, cb) {
    var cell1, curSheet, lineHasContent, orderedSheetIds, remaining, sheets, _i, _len, _ref, _ref1;
    if (cb == null) {
      cb = false;
    }
    sheets = {};
    orderedSheetIds = [];
    _ref = csv.toArray(shcsv);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], cell1 = _ref1[0], remaining = 2 <= _ref1.length ? __slice.call(_ref1, 1) : [];
      if (cell1) {
        curSheet = cell1;
      }
      if (!curSheet) {
        throw new Error("Sheet id must be defined in the first column and cannot be falsey");
      }
      if (__indexOf.call(orderedSheetIds, curSheet) < 0) {
        orderedSheetIds.push(curSheet);
      }
      if (!sheets[curSheet]) {
        sheets[curSheet] = [];
      }
      lineHasContent = (function() {
        var item, _j, _len1;
        for (_j = 0, _len1 = remaining.length; _j < _len1; _j++) {
          item = remaining[_j];
          if (item) {
            return true;
          }
        }
      })();
      if (lineHasContent) {
        sheets[curSheet].push(remaining);
      }
    }
    if (!cb) {
      return [orderedSheetIds, sheets];
    }
    return cb.apply(this, [orderedSheetIds, sheets]);
  };

  csv.sheeted.toObjects = function(shCsv) {
    return parseSheetedCsv(shCsv, function(osids, sheets) {
      var output, sheet, _i, _len;
      output = {};
      for (_i = 0, _len = osids.length; _i < _len; _i++) {
        sheet = osids[_i];
        output[sheet] = arrayToObjects(sheets[sheet]);
      }
      return output;
    });
  };

  csv.sheeted.toArray = function(shCsv) {
    return parseSheetedCsv(shCsv, function(osids, sheets) {
      var sheet, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = osids.length; _i < _len; _i++) {
        sheet = osids[_i];
        _results.push({
          id: sheet,
          sheet: arrayToObjects(sheets[sheet])
        });
      }
      return _results;
    });
  };

  _isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  _nativeIsArray = Array.isArray;

  _isArray = _nativeIsArray || function(obj) {
    return !!(obj && obj.concat && obj.unshift && !obj.callee);
  };

  _nativeKeys = Object.keys;

  _keys = _nativeKeys || function(obj) {
    var key, val, _results;
    if (_isArray(obj)) {
      return new Array(obj.length);
    }
    _results = [];
    for (key in obj) {
      val = obj[key];
      _results.push(key);
    }
    return _results;
  };

  csv.settings = {
    delimiter: ",",
    parseFloat: true
  };

  this.csv = csv;

}).call(this);
