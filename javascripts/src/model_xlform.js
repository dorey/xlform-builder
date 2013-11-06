/*
Needs id -> name
* ChoiceList
*/


/*
@XLF holds much of the models/collections of the XL(s)Form survey
representation in the browser.
*/


(function() {
  var BaseModel, SurveyFragment, txtid, _ref, _ref1, _ref10, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  this.XLF = {};

  /*
  @log function for debugging
  */


  this.log = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return typeof console !== "undefined" && console !== null ? (_ref = console.log) != null ? _ref.apply(console, args) : void 0 : void 0;
  };

  /*
  XLF.Survey and associated Backbone Model
  and Collection definitions
  */


  BaseModel = (function(_super) {
    __extends(BaseModel, _super);

    function BaseModel(arg) {
      if ("object" === typeof arg && "_parent" in arg) {
        this._parent = arg._parent;
        delete arg._parent;
      }
      BaseModel.__super__.constructor.call(this, arg);
    }

    return BaseModel;

  })(Backbone.Model);

  SurveyFragment = (function(_super) {
    __extends(SurveyFragment, _super);

    function SurveyFragment() {
      _ref = SurveyFragment.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    SurveyFragment.prototype.forEachRow = function(cb, ctx) {
      if (ctx == null) {
        ctx = {};
      }
      return this.rows.each(function(r, index, list) {
        var context;
        if (r instanceof XLF.SurveyDetail) {
          return ;
        } else if (r instanceof XLF.Group) {
          context = {};
          cb(r.groupStart());
          r.forEachRow(cb, context);
          cb(r.groupEnd());
          return ;
        } else {
          return cb(r);
        }
      });
    };

    SurveyFragment.prototype.addRow = function(r) {
      r._parent = this;
      return this.rows.add(r);
    };

    SurveyFragment.prototype.addRowAtIndex = function(r, index) {
      r._parent = this;
      return this.rows.add(r, {
        at: index
      });
    };

    return SurveyFragment;

  })(BaseModel);

  /*
  XLF...
    "Survey",
  */


  XLF.Survey = (function(_super) {
    __extends(Survey, _super);

    function Survey() {
      _ref1 = Survey.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    Survey.prototype.initialize = function(options) {
      var passedChoices, r, sname, surveyRows;
      if (options == null) {
        options = {};
      }
      this.rows = new XLF.Rows();
      this.settings = new XLF.Settings(options.settings);
      if ((sname = this.settings.get("name"))) {
        this.set("name", sname);
      }
      this.newRowDetails = options.newRowDetails || XLF.newRowDetails;
      this.defaultsForType = options.defaultsForType || XLF.defaultsForType;
      this.surveyDetails = new XLF.SurveyDetails(_.values(XLF.defaultSurveyDetails));
      passedChoices = options.choices || [];
      this.choices = (function() {
        var choiceNames, choiceRow, choices, cn, lName, tmp, _i, _j, _len, _len1;
        choices = new XLF.ChoiceLists();
        tmp = {};
        choiceNames = [];
        for (_i = 0, _len = passedChoices.length; _i < _len; _i++) {
          choiceRow = passedChoices[_i];
          lName = choiceRow["list name"];
          if (!tmp[lName]) {
            tmp[lName] = [];
            choiceNames.push(lName);
          }
          tmp[lName].push(choiceRow);
        }
        for (_j = 0, _len1 = choiceNames.length; _j < _len1; _j++) {
          cn = choiceNames[_j];
          choices.add({
            name: cn,
            options: tmp[cn]
          });
        }
        return choices;
      })();
      if (options.survey) {
        surveyRows = (function() {
          var _i, _len, _ref2, _results;
          _ref2 = options.survey;
          _results = [];
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            r = _ref2[_i];
            r._parent = this;
            _results.push(r);
          }
          return _results;
        }).call(this);
        return this.rows.add(surveyRows, {
          collection: this.rows,
          silent: true
        });
      }
    };

    Survey.prototype.toCsvJson = function() {
      var choicesCsvJson, surveyCsvJson,
        _this = this;
      surveyCsvJson = (function() {
        var addRowToORows, oCols, oRows, sd, _i, _len, _ref2;
        oCols = ["name", "type", "label"];
        oRows = [];
        addRowToORows = function(r) {
          var colJson, key, val;
          colJson = r.toJSON();
          for (key in colJson) {
            if (!__hasProp.call(colJson, key)) continue;
            val = colJson[key];
            if (__indexOf.call(oCols, key) < 0) {
              oCols.push(key);
            }
          }
          return oRows.push(colJson);
        };
        _this.forEachRow(addRowToORows);
        _ref2 = _this.surveyDetails.models;
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          sd = _ref2[_i];
          if (sd.get("value")) {
            addRowToORows(sd);
          }
        }
        return {
          columns: oCols,
          rowObjects: oRows
        };
      })();
      choicesCsvJson = (function() {
        var choiceList, clName, cols, lists, option, rows, _i, _j, _len, _len1, _ref2;
        lists = [];
        _this.forEachRow(function(r) {
          var list;
          if ((list = r.getList())) {
            return lists.push(list);
          }
        });
        rows = [];
        cols = ["list name", "name", "label"];
        for (_i = 0, _len = lists.length; _i < _len; _i++) {
          choiceList = lists[_i];
          if (!choiceList.get("name")) {
            choiceList.set("name", txtid(), {
              silent: true
            });
          }
          clName = choiceList.get("name");
          _ref2 = choiceList.options.models;
          for (_j = 0, _len1 = _ref2.length; _j < _len1; _j++) {
            option = _ref2[_j];
            rows.push(_.extend({}, option.toJSON(), {
              "list name": choiceList.get("name")
            }));
          }
        }
        return {
          columns: cols,
          rowObjects: rows
        };
      })();
      return {
        survey: surveyCsvJson,
        choices: choicesCsvJson,
        settings: this.settings.toCsvJson()
      };
    };

    Survey.prototype.toCSV = function() {
      var content, sheeted, shtName, _ref2;
      sheeted = csv.sheeted();
      _ref2 = this.toCsvJson();
      for (shtName in _ref2) {
        content = _ref2[shtName];
        sheeted.sheet(shtName, csv(content));
      }
      return sheeted.toString();
    };

    return Survey;

  })(SurveyFragment);

  /*
  XLF...
    "lookupRowType",
    "columnOrder",
    "Group",
    "Row",
    "Rows",
  */


  XLF.lookupRowType = (function() {
    var Type, arr, exp, typeLabels, types;
    typeLabels = [
      [
        "note", "Note", {
          preventRequired: true
        }
      ], ["text", "Text"], ["integer", "Integer"], ["decimal", "Decimal"], ["geopoint", "Geopoint (GPS)"], [
        "image", "Image", {
          isMedia: true
        }
      ], ["barcode", "Barcode"], ["date", "Date"], ["datetime", "Date and Time"], [
        "audio", "Audio", {
          isMedia: true
        }
      ], [
        "video", "Video", {
          isMedia: true
        }
      ], [
        "select_one", "Select", {
          orOtherOption: true,
          specifyChoice: true
        }
      ], [
        "select_multiple", "Multiple choice", {
          orOtherOption: true,
          specifyChoice: true
        }
      ]
    ];
    Type = (function() {
      function Type(_arg) {
        var opts;
        this.name = _arg[0], this.label = _arg[1], opts = _arg[2];
        if (!opts) {
          opts = {};
        }
        _.extend(this, opts);
      }

      return Type;

    })();
    types = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = typeLabels.length; _i < _len; _i++) {
        arr = typeLabels[_i];
        _results.push(new Type(arr));
      }
      return _results;
    })();
    exp = function(typeId) {
      var output, tp, _i, _len;
      for (_i = 0, _len = types.length; _i < _len; _i++) {
        tp = types[_i];
        if (tp.name === typeId) {
          output = tp;
        }
      }
      return output;
    };
    exp.typeSelectList = (function() {
      return function() {
        return types;
      };
    })();
    return exp;
  })();

  XLF.columnOrder = (function() {
    var warn, warned;
    warned = [];
    warn = function(key) {
      if (__indexOf.call(warned, key) < 0) {
        warend.push(key);
        return typeof console !== "undefined" && console !== null ? console.error("Order not set for key: " + key) : void 0;
      }
    };
    return function(key) {
      var ki;
      ki = XLF.columns.indexOf(key);
      if (ki === -1) {
        warn(key);
      }
      if (ki === -1) {
        return 100;
      } else {
        return ki;
      }
    };
  })();

  XLF.Group = (function(_super) {
    __extends(Group, _super);

    function Group() {
      _ref2 = Group.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    Group.prototype.initialize = function() {
      this.set("type", "begin group");
      return this.rows = new XLF.Rows();
    };

    Group.prototype.groupStart = function() {
      var _this = this;
      return {
        toJSON: function() {
          return _this.attributes;
        },
        inGroupStart: true
      };
    };

    Group.prototype.groupEnd = function() {
      return {
        toJSON: function() {
          return {
            type: "end group"
          };
        }
      };
    };

    return Group;

  })(SurveyFragment);

  XLF.Row = (function(_super) {
    __extends(Row, _super);

    function Row() {
      _ref3 = Row.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    Row.prototype.initialize = function() {
      /*
      The best way to understand the @details collection is
      that it is a list of cells of the XLSForm spreadsheet.
      The column name is the "key" and the value is the "value".
      We opted for a collection (rather than just saving in the attributes of
      this model) because of the various state-related attributes
      that need to be saved for each cell and allowing room to grow.
      
      E.g.: {"key": "type", "value": "select_one from colors"}
            needs to keep track of how the value was built
      */

      var curTypeDefaults, defaults, defaultsForType, defaultsUnlessDefined, key, newVals, processType, tpVal, typeDetail, vals, vk, vv,
        _this = this;
      if (this._parent) {
        defaultsUnlessDefined = this._parent.newRowDetails || XLF.newRowDetails;
        defaultsForType = this._parent.defaultsForType || XLF.defaultsForType;
      } else {
        if (typeof console !== "undefined" && console !== null) {
          console.error("Row not linked to parent survey.");
        }
        defaultsUnlessDefined = XLF.newRowDetails;
        defaultsForType = XLF.defaultsForType;
      }
      if (this.attributes.type && this.attributes.type in defaultsForType) {
        curTypeDefaults = defaultsForType[this.attributes.type];
      } else {
        curTypeDefaults = {};
      }
      defaults = _.extend({}, defaultsUnlessDefined, curTypeDefaults);
      for (key in defaults) {
        vals = defaults[key];
        if (!(key in this.attributes)) {
          newVals = {};
          for (vk in vals) {
            vv = vals[vk];
            newVals[vk] = "function" === typeof vv ? vv() : vv;
          }
          this.set(key, newVals);
        }
      }
      this.isValid();
      typeDetail = this.get("type");
      tpVal = typeDetail.get("value");
      processType = function(rd, newType, ctxt) {
        var matchedList, p2, p3, rtp, tpid, _ref4;
        _ref4 = newType.split(" "), tpid = _ref4[0], p2 = _ref4[1], p3 = _ref4[2];
        typeDetail.set("typeId", tpid, {
          silent: true
        });
        if (p2) {
          typeDetail.set("listName", p2, {
            silent: true
          });
          matchedList = _this._parent.choices.get(p2);
          if (matchedList) {
            typeDetail.set("list", matchedList);
          }
        }
        if (p3 === "or_other") {
          typeDetail.set("orOther", p3, {
            silent: true
          });
        }
        if ((rtp = XLF.lookupRowType(tpid))) {
          return typeDetail.set("rowType", rtp, {
            silent: true
          });
        } else {
          throw new Error("Type not found: " + tpid);
        }
      };
      processType(typeDetail, tpVal, {});
      typeDetail.on("change:value", processType);
      typeDetail.on("change:listName", function(rd, listName, ctx) {
        var rtp, typeStr;
        rtp = typeDetail.get("rowType");
        typeStr = "" + (typeDetail.get("typeId"));
        if (rtp.specifyChoice && listName) {
          typeStr += " " + listName;
        }
        if (rtp.orOtherOption && typeDetail.get("orOther")) {
          typeStr += " or_other";
        }
        return typeDetail.set({
          value: typeStr
        }, {
          silent: true
        });
      });
      return typeDetail.on("change:list", function(rd, cl, ctx) {
        var clname;
        if (typeDetail.get("rowType").specifyChoice) {
          clname = cl.get("name");
          if (!clname) {
            clname = txtid();
            cl.set("name", clname, {
              silent: true
            });
          }
          return this.set("value", "" + (this.get('typeId')) + " " + clname);
        }
      });
    };

    Row.prototype.getValue = function(what) {
      return this.get(what).get("value");
    };

    Row.prototype.getList = function() {
      var _ref4;
      return (_ref4 = this.get("type")) != null ? _ref4.get("list") : void 0;
    };

    Row.prototype.setList = function(list) {
      var listToSet;
      listToSet = this._parent.choices.get(list);
      if (!listToSet) {
        this._parent.choices.add(list);
        listToSet = this._parent.choices.get(list);
      }
      if (!listToSet) {
        throw new Error("List not found: " + list);
      }
      return this.get("type").set("list", listToSet);
    };

    Row.prototype.validate = function() {
      var key, val, _ref4;
      _ref4 = this.attributes;
      for (key in _ref4) {
        val = _ref4[key];
        if (!(val instanceof XLF.RowDetail)) {
          this.set(key, new XLF.RowDetail(key, val, this), {
            silent: true
          });
        }
      }
      return ;
    };

    Row.prototype.attributesArray = function() {
      var arr, k, v;
      arr = (function() {
        var _ref4, _results;
        _ref4 = this.attributes;
        _results = [];
        for (k in _ref4) {
          v = _ref4[k];
          _results.push([k, v]);
        }
        return _results;
      }).call(this);
      arr.sort(function(a, b) {
        if (a[1]._order < b[1]._order) {
          return -1;
        } else {
          return 1;
        }
      });
      return arr;
    };

    Row.prototype.toJSON = function() {
      var key, outObj, val, _i, _len, _ref4, _ref5;
      outObj = {};
      _ref4 = this.attributesArray();
      for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
        _ref5 = _ref4[_i], key = _ref5[0], val = _ref5[1];
        if (!val.hidden) {
          outObj[key] = this.getValue(key);
        }
      }
      return outObj;
    };

    return Row;

  })(BaseModel);

  XLF.Rows = (function(_super) {
    __extends(Rows, _super);

    function Rows() {
      _ref4 = Rows.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    Rows.prototype.model = function(obj, ctxt) {
      var type;
      type = obj != null ? obj.type : void 0;
      if (type === "start" || type === "end") {
        return new XLF.SurveyDetail(obj);
      } else if (type === "group") {
        return new XLF.Group(obj);
      } else {
        return new XLF.Row(obj);
      }
    };

    return Rows;

  })(Backbone.Collection);

  XLF.RowDetail = (function(_super) {
    __extends(RowDetail, _super);

    RowDetail.prototype.idAttribute = "name";

    function RowDetail(key, valOrObj, parentRow) {
      var vals2set;
      this.key = key;
      if (valOrObj == null) {
        valOrObj = {};
      }
      this.parentRow = parentRow;
      RowDetail.__super__.constructor.call(this);
      vals2set = {};
      if (_.isString(valOrObj)) {
        vals2set.value = valOrObj;
      } else if ("value" in valOrObj) {
        _.extend(vals2set, valOrObj);
      } else {
        vals2set.value = valOrObj;
      }
      this.set(vals2set);
      this._order = XLF.columnOrder(this.key);
    }

    RowDetail.prototype.initialize = function() {
      var _this = this;
      if (this.get("_hideUnlessChanged")) {
        this.hidden = true;
        this._oValue = this.get("value");
        this.on("change", function() {
          return this.hidden = this.get("value") === this._oValue;
        });
      }
      this.on("change:value", function(rd, val, ctxt) {
        return _this.parentRow.trigger("change", _this.key, val, ctxt);
      });
      if (this.key === "type") {
        return this.on("change:list", function(rd, val, ctxt) {
          return _this.parentRow.trigger("change", _this.key, val, ctxt);
        });
      }
    };

    return RowDetail;

  })(BaseModel);

  /*
  XLF...
    "Option",
    "Options",
  
    "ChoiceList",
    "ChoiceLists",
  */


  XLF.Option = (function(_super) {
    __extends(Option, _super);

    function Option() {
      _ref5 = Option.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    Option.prototype.idAttribute = "name";

    Option.prototype.initialize = function() {
      return this.unset("list name");
    };

    Option.prototype.destroy = function() {
      return log("destroy me", this);
    };

    Option.prototype.list = function() {
      return this.collection;
    };

    return Option;

  })(BaseModel);

  XLF.Options = (function(_super) {
    __extends(Options, _super);

    function Options() {
      _ref6 = Options.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    Options.prototype.model = XLF.Option;

    return Options;

  })(Backbone.Collection);

  XLF.ChoiceList = (function(_super) {
    __extends(ChoiceList, _super);

    ChoiceList.prototype.idAttribute = "name";

    function ChoiceList(opts, context) {
      var options;
      if (opts == null) {
        opts = {};
      }
      options = opts.options || [];
      ChoiceList.__super__.constructor.call(this, {
        name: opts.name
      }, context);
      this.options = new XLF.Options(options || []);
      this.options.parentList = this;
    }

    ChoiceList.prototype.summaryObj = function() {
      var _this = this;
      return {
        name: this.get("name"),
        options: (function() {
          var opt, _i, _len, _ref7, _results;
          _ref7 = _this.options.models;
          _results = [];
          for (_i = 0, _len = _ref7.length; _i < _len; _i++) {
            opt = _ref7[_i];
            _results.push(opt.attributes);
          }
          return _results;
        })()
      };
    };

    return ChoiceList;

  })(BaseModel);

  XLF.ChoiceLists = (function(_super) {
    __extends(ChoiceLists, _super);

    function ChoiceLists() {
      _ref7 = ChoiceLists.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    ChoiceLists.prototype.model = XLF.ChoiceList;

    ChoiceLists.prototype.summaryObj = function() {
      var model, out, _i, _len, _ref8;
      out = {};
      _ref8 = this.models;
      for (_i = 0, _len = _ref8.length; _i < _len; _i++) {
        model = _ref8[_i];
        out[model.get("name")] = model.summaryObj();
      }
      return out;
    };

    return ChoiceLists;

  })(Backbone.Collection);

  /*
  XLF...
    "createSurveyFromCsv"
  */


  XLF.createSurveyFromCsv = function(csv_repr) {
    var $choices, $elemWrap, $publishCb, $settings, $survey, cobj, importedStgns, opts, settingsSheet, sht;
    opts = {};
    $settings = opts.settings || {};
    $elemWrap = $(opts.elemWrap || '#main');
    $publishCb = opts.publish || function() {};
    if (csv_repr) {
      if (opts.survey || opts.choices) {
        throw new XlformError("[csv_repr] will cause other options to be ignored: [survey, choices]");
      }
      cobj = csv.sheeted(csv_repr);
      $survey = (sht = cobj.sheet("survey")) ? sht.toObjects() : [];
      $choices = (sht = cobj.sheet("choices")) ? sht.toObjects() : [];
      if ((settingsSheet = cobj.sheet("settings"))) {
        importedStgns = settingsSheet.toObjects()[0];
      }
    } else {
      $survey = opts.survey || [];
      $choices = opts.choices || [];
    }
    return new XLF.Survey({
      survey: $survey,
      choices: $choices,
      settings: $settings
    });
  };

  /*
  XLF...
    "SurveyDetail",
    "SurveyDetails"
    "Settings",
  */


  XLF.SurveyDetail = (function(_super) {
    __extends(SurveyDetail, _super);

    function SurveyDetail() {
      _ref8 = SurveyDetail.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    SurveyDetail.prototype.idAttribute = "name";

    SurveyDetail.prototype.initialize = function() {
      var jsonVal;
      this.set("value", !!this.get("default"));
      this.unset("default");
      if (jsonVal = this.get("asJson")) {
        return this.toJSON = function() {
          return jsonVal;
        };
      }
    };

    return SurveyDetail;

  })(BaseModel);

  XLF.SurveyDetails = (function(_super) {
    __extends(SurveyDetails, _super);

    function SurveyDetails() {
      _ref9 = SurveyDetails.__super__.constructor.apply(this, arguments);
      return _ref9;
    }

    SurveyDetails.prototype.model = XLF.SurveyDetail;

    return SurveyDetails;

  })(Backbone.Collection);

  XLF.Settings = (function(_super) {
    __extends(Settings, _super);

    function Settings() {
      _ref10 = Settings.__super__.constructor.apply(this, arguments);
      return _ref10;
    }

    Settings.prototype.defaults = {
      form_title: "New survey"
    };

    Settings.prototype.toCsvJson = function() {
      var columns, rowObjects;
      columns = _.keys(this.attributes);
      rowObjects = [this.toJSON()];
      return {
        columns: columns,
        rowObjects: rowObjects
      };
    };

    return Settings;

  })(BaseModel);

  /*
  misc helper methods
  */


  txtid = function() {
    var o;
    o = 'AAnCAnn'.replace(/[AaCn]/g, function(c) {
      var newI, r, randChar;
      randChar = function() {
        var charI;
        charI = Math.floor(Math.random() * 52);
        charI += (charI <= 25 ? 65 : 71);
        return String.fromCharCode(charI);
      };
      r = Math.random();
      if (c === 'a') {
        return randChar();
      } else if (c === 'A') {
        return String.fromCharCode(65 + (r * 26 | 0));
      } else if (c === 'C') {
        newI = Math.floor(r * 62);
        if (newI > 52) {
          return newI - 52;
        } else {
          return randChar();
        }
      } else if (c === 'n') {
        return Math.floor(r * 10);
      }
    });
    return o.toLowerCase();
  };

  /*
  defaultSurveyDetails
  --------------------
  These values will be populated in the form builder and the user
  will have the option to turn them on or off.
  
  When exported, if the checkbox was selected, the "asJson" value
  gets passed to the CSV builder and appended to the end of the
  survey.
  
  Details pulled from ODK documents / google docs. Notably this one:
    https://docs.google.com/spreadsheet/ccc?key=0AgpC5gsTSm_4dDRVOEprRkVuSFZUWTlvclJ6UFRvdFE#gid=0
  */


  XLF.defaultSurveyDetails = {
    start_time: {
      name: "start",
      label: "Start time",
      description: "Records when the survey was begun",
      "default": true,
      asJson: {
        type: "start",
        name: "start"
      }
    },
    end_time: {
      name: "end",
      label: "End time",
      description: "Records when the survey was marked as completed",
      "default": true,
      asJson: {
        type: "end",
        name: "end"
      }
    },
    today: {
      name: "today",
      label: "Today",
      description: "Includes todays date",
      "default": false,
      asJson: {
        type: "today",
        name: "today"
      }
    },
    imei: {
      name: "imei",
      label: "Device ID number",
      description: "Records the internal device ID number (works on Android phones)",
      "default": false,
      asJson: {
        type: "imei",
        name: "imei"
      }
    },
    phoneNumber: {
      name: "phonenumber",
      label: "Phone number",
      description: "Records the device's phone number, when available",
      "default": false,
      asJson: {
        type: "phonenumber",
        name: "phonenumber"
      }
    }
  };

  /*
  XLF.columns is used to determine the order that the elements
  are added into the page and the final CSV.
  */


  XLF.columns = ["type", "name", "label", "hint", "required"];

  /*
  XLF.newRowDetails are the default values that are assigned to a new
  row when it is created.
  */


  XLF.newRowDetails = {
    name: {
      value: txtid,
      randomId: true
    },
    label: {
      value: "new question"
    },
    type: {
      value: "text"
    },
    hint: {
      value: "",
      _hideUnlessChanged: true
    },
    required: {
      value: false,
      _hideUnlessChanged: true
    }
  };

  XLF.defaultsForType = {
    geopoint: {
      label: {
        value: "Record your current location"
      }
    },
    image: {
      label: {
        value: "Point and shoot! Use the camera to take a photo"
      }
    },
    video: {
      label: {
        value: "Use the camera to record a video"
      }
    },
    audio: {
      label: {
        value: "Use the camera's microphone to record a sound"
      }
    },
    note: {
      label: {
        value: "This note can be read out loud"
      }
    },
    integer: {
      label: {
        value: "Enter a number"
      }
    },
    barcode: {
      hint: {
        value: "Use the camera to scan a barcode"
      }
    },
    decimal: {
      label: {
        value: "Enter a number"
      }
    },
    date: {
      label: {
        value: "Enter a date"
      }
    },
    datetime: {
      label: {
        value: "Enter a date and time"
      }
    }
  };

}).call(this);
