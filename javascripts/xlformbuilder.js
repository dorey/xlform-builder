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
(function() {
  this.DetailViewMixins = (function() {
    var VX;
    VX = {};
    VX.type = {
      html: function() {
        var tps;
        this.$el.css({
          width: 40,
          height: 40
        });
        tps = this.model.get('typeId');
        this.$el.attr("title", "Row Type: " + tps);
        this.$el.addClass("rt-" + tps);
        return this.$el.addClass("type-icon");
      },
      insertInDOM: function(rowView) {
        return rowView.$(".row-type").append(this.$el);
      }
    };
    VX.label = VX.hint = {
      html: function() {
        return "<div class=\"col-md-12\">\n  <blockquote>\n    " + (this.model.get("value")) + "\n  </blockquote>\n</div>";
      },
      insertInDOM: function(rowView) {
        return rowView.rowContent.prepend(this.$el);
      },
      afterRender: function() {
        var _this = this;
        return this.$el.find("blockquote").eq(0).editInPlace({
          save_if_nothing_changed: true,
          field_type: "textarea",
          textarea_cols: 50,
          textarea_rows: 3,
          callback: function(uu, ent) {
            _this.model.set("value", ent);
            if (ent === "") {
              return "...";
            } else {
              return ent;
            }
          }
        });
      }
    };
    VX.hint = {
      html: function() {
        return "" + this.model.key + ": <code>" + (this.model.get("value")) + "</code>";
      },
      afterRender: function() {
        var _this = this;
        return this.$el.find("code").editInPlace({
          save_if_nothing_changed: true,
          callback: function(uu, ent) {
            _this.model.set("value", ent);
            if (ent === "") {
              return "...";
            } else {
              return ent;
            }
          }
        });
      }
    };
    VX.name = {
      html: function() {
        return "" + this.model.key + ": <code>" + (this.model.get("value")) + "</code>";
      },
      afterRender: function() {
        var _this = this;
        return this.$el.find("code").editInPlace({
          save_if_nothing_changed: true,
          callback: function(uu, ent) {
            var cleanName;
            cleanName = XLF.sluggify(ent);
            _this.model.set("value", cleanName);
            if (ent === "") {
              return "...";
            } else {
              return cleanName;
            }
          }
        });
      }
    };
    VX.required = {
      html: function() {
        return "<label><input type=\"checkbox\"> Required?</label>";
      },
      afterRender: function() {
        var inp,
          _this = this;
        inp = this.$el.find("input");
        inp.prop("checked", this.model.get("value"));
        return inp.change(function() {
          return _this.model.set("value", inp.prop("checked"));
        });
      }
    };
    return VX;
  })();

}).call(this);
/*
This file provides the "SurveyApp" object which is an extension of
Backbone.View and builds the XL(S)Form Editor in the browser.
*/


(function() {
  var XlfDetailView, XlfListView, XlfOptionView, XlfRowSelector, XlfRowView, XlfSurveyDetailView, XlformError, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  XlformError = (function(_super) {
    __extends(XlformError, _super);

    function XlformError(message) {
      this.message = message;
      this.name = "XlformError";
    }

    return XlformError;

  })(Error);

  $.browser || ($.browser = {});

  XlfDetailView = (function(_super) {
    __extends(XlfDetailView, _super);

    function XlfDetailView() {
      _ref = XlfDetailView.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    /*
    The XlfDetailView class is a base class for details
    of each row of the XLForm. When the view is initialized,
    a mixin from "DetailViewMixins" is applied.
    */


    XlfDetailView.prototype.className = "dt-view";

    XlfDetailView.prototype.initialize = function(_arg) {
      var viewMixin;
      this.rowView = _arg.rowView;
      if (!this.model.key) {
        throw new XlformError("RowDetail does not have key");
      }
      this.extraClass = "xlf-dv-" + this.model.key;
      if ((viewMixin = DetailViewMixins[this.model.key])) {
        _.extend(this, viewMixin);
      }
      return this.$el.addClass(this.extraClass);
    };

    XlfDetailView.prototype.render = function() {
      var rendered;
      rendered = this.html();
      if (!(rendered === this.$el || rendered === this.el)) {
        this.$el.html(rendered);
      }
      return this;
    };

    XlfDetailView.prototype.html = function() {
      return "<code>" + this.model.key + ":</code>\n<code>" + (this.model.get("value")) + "</code>";
    };

    XlfDetailView.prototype.insertInDOM = function(rowView) {
      return rowView.rowExtras.append(this.el);
    };

    XlfDetailView.prototype.renderInRowView = function(rowView) {
      this.render();
      this.afterRender && this.afterRender();
      this.insertInDOM(rowView);
      return this;
    };

    return XlfDetailView;

  })(Backbone.View);

  XlfRowSelector = (function(_super) {
    __extends(XlfRowSelector, _super);

    function XlfRowSelector() {
      _ref1 = XlfRowSelector.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    XlfRowSelector.prototype.events = {
      "click .shrink": "shrink",
      "click .menu-item": "selectMenuItem"
    };

    XlfRowSelector.prototype.initialize = function(opts) {
      this.button = this.$el.find(".btn");
      this.line = this.$el.find(".line");
      if (opts.action === "click-add-row") {
        return this.expand();
      }
    };

    XlfRowSelector.prototype.expand = function() {
      var $menu, i, mItems, mcell, menurow, mrow, _i, _len, _results;
      this.button.fadeOut(150);
      this.line.addClass("expanded");
      this.line.css("height", "inherit");
      this.line.html("<div class=\"iwrap\">\n  <div class=\"well row-fluid clearfix\">\n    <button type=\"button\" class=\"shrink pull-right close\" aria-hidden=\"true\">&times;</button>\n    <h4>Please select a type for the new question</h4>\n  </div>\n</div>");
      $menu = this.line.find(".well");
      mItems = [["geopoint"], ["image", "audio", "video", "barcode"], ["date", "datetime"], ["text", "integer", "decimal", "note"], ["select_one", "select_multiple"]];
      _results = [];
      for (_i = 0, _len = mItems.length; _i < _len; _i++) {
        mrow = mItems[_i];
        menurow = $("<div>", {
          "class": "menu-row"
        }).appendTo($menu);
        _results.push((function() {
          var _j, _len1, _results1;
          _results1 = [];
          for (i = _j = 0, _len1 = mrow.length; _j < _len1; i = ++_j) {
            mcell = mrow[i];
            _results1.push(menurow.append("<div class=\"menu-item menu-item-" + mcell + "\" data-menu-item=\"" + mcell + "\">" + mcell + "</div>"));
          }
          return _results1;
        })());
      }
      return _results;
    };

    XlfRowSelector.prototype.shrink = function() {
      var _this = this;
      this.line.find("div").eq(0).fadeOut(250, function() {
        return _this.line.empty();
      });
      this.button.fadeIn(200);
      this.line.removeClass("expanded");
      return this.line.animate({
        height: "0"
      });
    };

    XlfRowSelector.prototype.hide = function() {
      this.button.show();
      return this.line.empty().removeClass("expanded").css({
        "height": 0
      });
    };

    XlfRowSelector.prototype.selectMenuItem = function(evt) {
      var mi, rowBefore, rowBeforeIndex, survey, _ref2;
      mi = $(evt.target).data("menuItem");
      rowBefore = (_ref2 = this.options.spawnedFromView) != null ? _ref2.model : void 0;
      survey = this.options.survey || rowBefore._parent;
      rowBeforeIndex = survey.rows.indexOf(rowBefore);
      survey.addRowAtIndex({
        type: mi
      }, rowBeforeIndex + 1);
      return this.hide();
    };

    return XlfRowSelector;

  })(Backbone.View);

  XlfOptionView = (function(_super) {
    __extends(XlfOptionView, _super);

    function XlfOptionView() {
      _ref2 = XlfOptionView.__super__.constructor.apply(this, arguments);
      return _ref2;
    }

    XlfOptionView.prototype.tagName = "li";

    XlfOptionView.prototype.className = "xlf-option-view";

    XlfOptionView.prototype.events = {
      "keyup input": "keyupinput"
    };

    XlfOptionView.prototype.render = function() {
      this.p = $("<p>");
      if (this.model) {
        this.p.html(this.model.get("label"));
        this.$el.attr("data-option-id", this.model.cid);
      } else {
        this.model = new XLF.Option();
        this.options.cl.options.add(this.model);
        this.p.html("Option " + (1 + this.options.i)).addClass("preliminary");
      }
      this.p.editInPlace({
        callback: _.bind(this.saveValue, this)
      });
      this.$el.html(this.p);
      return this;
    };

    XlfOptionView.prototype.keyupinput = function(evt) {
      var ifield;
      ifield = this.$("input.inplace_field");
      if (evt.keyCode === 8 && ifield.hasClass("empty")) {
        ifield.blur();
      }
      if (ifield.val() === "") {
        return ifield.addClass("empty");
      } else {
        return ifield.removeClass("empty");
      }
    };

    XlfOptionView.prototype.saveValue = function(ick, nval, oval, ctxt) {
      if (nval === "") {
        this.$el.remove();
        this.model.destroy();
      } else {
        this.model.set("label", nval, {
          silent: true
        });
        this.model.set("name", XLF.sluggify(nval), {
          silent: true
        });
      }
      return nval;
    };

    return XlfOptionView;

  })(Backbone.View);

  XlfListView = (function(_super) {
    __extends(XlfListView, _super);

    function XlfListView() {
      _ref3 = XlfListView.__super__.constructor.apply(this, arguments);
      return _ref3;
    }

    XlfListView.prototype.initialize = function(_arg) {
      this.rowView = _arg.rowView, this.model = _arg.model;
      this.list = this.model;
      this.row = this.rowView.model;
      return this.ulClasses = this.$("ul").prop("className");
    };

    XlfListView.prototype.render = function() {
      var btn, i, option, _i, _len, _ref4,
        _this = this;
      this.$el.html((this.ul = $("<ul>", {
        "class": this.ulClasses
      })));
      if (this.row.get("type").get("rowType").specifyChoice) {
        _ref4 = this.model.options.models;
        for (i = _i = 0, _len = _ref4.length; _i < _len; i = ++_i) {
          option = _ref4[i];
          new XlfOptionView({
            model: option,
            cl: this.model
          }).render().$el.appendTo(this.ul);
        }
        while (i < 2) {
          new XlfOptionView({
            empty: true,
            cl: this.model,
            i: i
          }).render().$el.appendTo(this.ul);
          i++;
        }
        this.$el.removeClass("hidden");
      } else {
        this.$el.addClass("hidden");
      }
      this.ul.sortable({
        axis: "y",
        cursor: "move",
        distance: 5,
        items: "> li",
        placeholder: "option-placeholder",
        opacity: 0.9,
        scroll: false,
        deactivate: function() {
          if (_this.hasReordered) {
            _this.reordered();
          }
          return true;
        },
        change: function() {
          return _this.hasReordered = true;
        }
      });
      btn = $("<button class=\"btn btn-xs btn-default col-md-3 col-md-offset-1\">Add option</button>");
      btn.click(function() {
        i = _this.ul.find("li").length;
        return new XlfOptionView({
          empty: true,
          cl: _this.model,
          i: i
        }).render().$el.appendTo(_this.ul);
      });
      this.$el.append(btn);
      return this;
    };

    XlfListView.prototype.reordered = function(evt, ui) {
      var id, ids, n, _i, _len,
        _this = this;
      ids = [];
      this.ul.find("> li").each(function(i, li) {
        var lid;
        lid = $(li).data("optionId");
        if (lid) {
          return ids.push(lid);
        }
      });
      for (n = _i = 0, _len = ids.length; _i < _len; n = ++_i) {
        id = ids[n];
        this.model.options.get(id).set("order", n, {
          silent: true
        });
      }
      this.model.options.comparator = "order";
      this.model.options.sort();
      return this.hasReordered = false;
    };

    return XlfListView;

  })(Backbone.View);

  XlfRowView = (function(_super) {
    __extends(XlfRowView, _super);

    function XlfRowView() {
      _ref4 = XlfRowView.__super__.constructor.apply(this, arguments);
      return _ref4;
    }

    XlfRowView.prototype.tagName = "li";

    XlfRowView.prototype.className = "xlf-row-view";

    XlfRowView.prototype.events = {
      "click .create-new-list": "createListForRow",
      "click .edit-list": "editListForRow",
      "click": "select",
      "click .add-row-btn": "expandRowSelector",
      "click .row-extras-summary": "expandCog",
      "click .glyphicon-cog": "expandCog"
    };

    XlfRowView.prototype.initialize = function() {
      var typeDetail,
        _this = this;
      typeDetail = this.model.get("type");
      this.$el.attr("data-row-id", this.model.cid);
      this.surveyView = this.options.surveyView;
      return this.$el.on("xlf-blur", function() {
        return _this.$el.removeClass("xlf-selected");
      });
    };

    XlfRowView.prototype.select = function() {
      if (!this.$el.hasClass("xlf-selected")) {
        $(".xlf-selected").trigger("xlf-blur");
        return this.$el.addClass("xlf-selected");
      }
    };

    XlfRowView.prototype.expandRowSelector = function() {
      return new XlfRowSelector({
        el: this.$el.find(".expanding-spacer-between-rows").get(0),
        action: "click-add-row",
        spawnedFromView: this
      });
    };

    XlfRowView.prototype.render = function() {
      var cl, key, val, _i, _len, _ref5, _ref6;
      this.$el.html("<div class=\"row clearfix\">\n  <div class=\"row-type-col row-type\">\n  </div>\n  <div class=\"col-xs-9 col-sm-10 row-content\"></div>\n  <div class=\"col-xs-1 col-sm-1 row-r-buttons\">\n    <button type=\"button\" class=\"close delete-row\" aria-hidden=\"true\">&times;</button>\n  </div>\n</div>\n<div class=\"row list-view hidden\">\n  <ul class=\"col-md-offset-1 col-md-8\"></ul>\n</div>\n<div class=\"row-fluid clearfix\">\n  <div class=\"row-type-col\">&nbsp;</div>\n  <p class=\"col-xs-11 row-extras-summary\">\n    <span class=\"glyphicon glyphicon-cog\"></span> &nbsp;\n    <span class=\"summary-details\"></span>\n  </p>\n  <div class=\"col-xs-11 row-extras hidden row-fluid\">\n    <p class=\"pull-left\">\n      <span class=\"glyphicon glyphicon-cog\"></span>\n    </p>\n  </div>\n</div>\n<div class=\"row clearfix expanding-spacer-between-rows\">\n  <div class=\"add-row-btn btn btn-xs btn-default\">+</div>\n  <div class=\"line\">&nbsp;</div>\n</div>");
      if (!(cl = this.model.getList())) {
        cl = new XLF.ChoiceList();
        this.model.setList(cl);
      }
      this.listView = new XlfListView({
        el: this.$(".list-view"),
        model: cl,
        rowView: this
      }).render();
      this.rowContent = this.$(".row-content");
      this.rowExtras = this.$(".row-extras");
      this.rowExtrasSummary = this.$(".row-extras-summary");
      _ref5 = this.model.attributesArray();
      for (_i = 0, _len = _ref5.length; _i < _len; _i++) {
        _ref6 = _ref5[_i], key = _ref6[0], val = _ref6[1];
        new XlfDetailView({
          model: val,
          rowView: this
        }).renderInRowView(this);
      }
      return this;
    };

    XlfRowView.prototype.editListForRow = function(evt) {
      var $et, list, survey;
      this._ensureNoListViewsOpen();
      $et = $(evt.target);
      survey = this.model._parent;
      list = this.model.getList();
      return this._displayEditListView($et, survey, list);
    };

    XlfRowView.prototype.createListForRow = function(evt) {
      var $et, list, survey;
      this._ensureNoListViewsOpen();
      $et = $(evt.target);
      survey = this.model._parent;
      list = new XLF.ChoiceList();
      return this._displayEditListView($et, survey, list);
    };

    XlfRowView.prototype._ensureNoListViewsOpen = function() {
      if ($(".edit-list-view").length > 0) {
        throw new Error("ListView open");
      }
    };

    XlfRowView.prototype._displayEditListView = function($et, survey, list) {
      var $lvel, clAnchor, leftMargin, lv, padding, parentElMarginLeft, parentWrap;
      lv = new XLF.EditListView({
        choiceList: list,
        survey: survey,
        rowView: this
      });
      padding = 6;
      parentElMarginLeft = 20;
      clAnchor = $et.parent().find(".choice-list-anchor");
      parentWrap = clAnchor.parent();
      leftMargin = clAnchor.eq(0).position().left - (padding + parentElMarginLeft);
      $lvel = lv.render().$el.css("margin-left", leftMargin);
      parentWrap.append($lvel.hide());
      return $lvel.slideDown(175);
    };

    XlfRowView.prototype.newListView = function(rv) {
      var $lvel, lv;
      lv = new XLF.EditListView({
        choiceList: new XLF.ChoiceList(),
        survey: this.model._parent,
        rowView: this
      });
      $lvel = lv.render().$el.css(this.$(".select-list").position());
      return this.$el.append($lvel);
    };

    XlfRowView.prototype.expandCog = function(evt) {
      evt.stopPropagation();
      this.rowExtras.parent().toggleClass("activated");
      this.rowExtrasSummary.toggleClass("hidden");
      return this.rowExtras.toggleClass("hidden");
    };

    return XlfRowView;

  })(Backbone.View);

  this.SurveyApp = (function(_super) {
    __extends(SurveyApp, _super);

    function SurveyApp() {
      _ref5 = SurveyApp.__super__.constructor.apply(this, arguments);
      return _ref5;
    }

    SurveyApp.prototype.className = "formbuilder-wrap container";

    SurveyApp.prototype.events = {
      "click .delete-row": "clickRemoveRow",
      "click #preview": "previewButtonClick",
      "click #download": "downloadButtonClick",
      "click #save": "saveButtonClick",
      "click #publish": "publishButtonClick"
    };

    SurveyApp.prototype.initialize = function(options) {
      var description, _descrip, _displayTitle, _ref6,
        _this = this;
      if (options.survey && (options.survey instanceof XLF.Survey)) {
        this.survey = options.survey;
      } else {
        this.survey = new XLF.Survey(options);
      }
      this.rowViews = new Backbone.Model();
      description = this.survey.settings.get("description") || "";
      _ref6 = description.split("\\n"), _displayTitle = _ref6[0], _descrip = 2 <= _ref6.length ? __slice.call(_ref6, 1) : [];
      _displayTitle || (_displayTitle = this.survey.settings.get("form_title"));
      _descrip || (_descrip = "");
      this.survey.set("displayTitle", _displayTitle, {
        silent: true
      });
      this.survey.set("displayDescription", _descrip.join("\n"), {
        silent: true
      });
      this.survey.set("formName", this.survey.settings.get("form_title"), {
        silent: true
      });
      this.survey.on("change:displayTitle", function() {
        var lines;
        lines = [_this.survey.get("displayTitle"), _this.survey.get("displayDescription")];
        return _this.survey.settings.set("description", lines.join("\n"));
      });
      this.survey.rows.on("add", this.softReset, this);
      this.onPublish = options.publish || $.noop;
      this.onSave = options.save || $.noop;
      this.onPreview = options.preview || $.noop;
      return $(window).on("keydown", function(evt) {
        if (evt.keyCode === 27) {
          return _this.onEscapeKeydown(evt);
        }
      });
    };

    SurveyApp.prototype.render = function() {
      var addOpts, detail, _i, _len, _ref6,
        _this = this;
      this.$el.html("<div class=\"row clearfix\">\n  <div class=\"col-md-8\">\n    <h1 class=\"title\">\n      <span class=\"display-title\">\n        " + (this.survey.get("displayTitle")) + "\n      </span>\n      <span class=\"hashtag\">[<span class=\"form-name\">" + (this.survey.settings.get("form_title")) + "</span>]</span>\n    </h1>\n    <p class=\"display-description\">\n      " + (this.survey.get("displayDescription")) + "\n    </p>\n  </div>\n  <div class=\"col-md-4\">\n    <a class=\"btn btn-default\" href=\"#\" id=\"download\">Download</a>\n    <button class=\"btn btn-default disabled\" id=\"preview\">Preview</button>\n    <button class=\"btn btn-default disabled\" id=\"publish\">Publish</button>\n    <!-- <button class=\"btn btn-primary\" id=\"save\">Save</button> -->\n  </div>\n  <div class=\"stats row-details clearfix col-md-11\" id=\"additional-options\"></div>\n</div>\n<div class=\"form-editor-wrap\">\n  <ul class=\"-form-editor\">\n    <li class=\"editor-message empty\">\n      <p class=\"empty-survey-text\">\n        <strong>This survey is currently empty.</strong><br>\n        You can add questions, notes, prompts, or other fields by clicking on the \"+\" sign below.\n      </p>\n      <div class=\"row clearfix expanding-spacer-between-rows\">\n        <div class=\"add-row-btn btn btn-xs btn-default\">+</div>\n        <div class=\"line\">&nbsp;</div>\n      </div>\n    </li>\n  </ul>\n  <!-- <div class=\"trailing-buttons row-fluid\">\n    <div class=\"row-type-col\">&nbsp;</div>\n  </div> -->\n</div>");
      this.formEditorEl = this.$(".-form-editor");
      this.$(".editor-message .expanding-spacer-between-rows .add-row-btn").click(function(evt) {
        _this.$(".empty-survey-text").slideUp();
        return new XlfRowSelector({
          el: _this.$el.find(".expanding-spacer-between-rows").get(0),
          action: "click-add-row",
          survey: _this.survey
        });
      });
      this.$(".form-name").editInPlace({
        callback: function(u, ent) {
          var val;
          val = ent ? XLF.sluggify(ent) : "";
          _this.survey.settings.set("form_title", val);
          if (val) {
            return val;
          } else {
            return "...";
          }
        }
      });
      this.$(".display-title").editInPlace({
        callback: function(u, ent) {
          _this.survey.set("displayTitle", ent);
          if (ent) {
            return ent;
          } else {
            return "...";
          }
        }
      });
      this.$(".display-description").editInPlace({
        field_type: "textarea",
        textarea_cols: 50,
        textarea_rows: 3,
        callback: function(u, ent) {
          _this.survey.set("displayDescription", ent);
          if (ent) {
            return ent.replace(/\n/g, "<br>");
          } else {
            return "...";
          }
        }
      });
      addOpts = this.$("#additional-options");
      _ref6 = this.survey.surveyDetails.models;
      for (_i = 0, _len = _ref6.length; _i < _len; _i++) {
        detail = _ref6[_i];
        addOpts.append((new XlfSurveyDetailView({
          model: detail
        })).render().el);
      }
      this.softReset();
      this.formEditorEl.sortable({
        axis: "y",
        cancel: "button,div.add-row-btn,.well,ul.list-view,li.editor-message",
        cursor: "move",
        distance: 5,
        items: "> li",
        placeholder: "placeholder",
        opacity: 0.9,
        scroll: false,
        activate: function(evt, ui) {
          return ui.item.addClass("sortable-active");
        },
        deactivate: function(evt, ui) {
          return ui.item.removeClass("sortable-active");
        }
      });
      return this;
    };

    SurveyApp.prototype.softReset = function() {
      var fe, isEmpty,
        _this = this;
      fe = this.formEditorEl;
      isEmpty = true;
      this.survey.forEachRow(function(row) {
        var $el, xlfrv;
        isEmpty = false;
        if (!(xlfrv = _this.rowViews.get(row.cid))) {
          _this.rowViews.set(row.cid, new XlfRowView({
            model: row,
            surveyView: _this
          }));
          xlfrv = _this.rowViews.get(row.cid);
        }
        $el = xlfrv.render().$el;
        if ($el.parents(_this.$el).length === 0) {
          return _this.formEditorEl.append($el);
        }
      });
      if (!isEmpty) {
        return this.formEditorEl.find(".empty").remove();
      }
    };

    SurveyApp.prototype.reset = function() {
      var fe,
        _this = this;
      fe = this.formEditorEl.empty();
      return this.survey.forEachRow(function(row) {
        var $el;
        $el = new XlfRowView({
          model: row,
          surveyView: _this
        }).render().$el;
        if (row._slideDown) {
          row._slideDown = false;
          fe.append($el.hide());
          return $el.slideDown(175);
        } else {
          return fe.append($el);
        }
      });
    };

    SurveyApp.prototype.clickRemoveRow = function(evt) {
      var $et, matchingRow, rowEl, rowId,
        _this = this;
      evt.preventDefault();
      if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
        $et = $(evt.target);
        rowId = $et.data("rowCid");
        rowEl = $et.parents("li").eq(0);
        matchingRow = this.survey.rows.find(function(row) {
          return row.cid === rowId;
        });
        if (matchingRow) {
          this.survey.rows.remove(matchingRow);
        }
        return rowEl.slideUp(175, "swing", function() {
          return _this.survey.rows.trigger("reset");
        });
      }
    };

    SurveyApp.prototype.ensureAllRowsDrawn = function() {
      var prev,
        _this = this;
      prev = false;
      return this.survey.forEachRow(function(row) {
        var $el, prevMatch;
        prevMatch = _this.formEditorEl.find(".xlf-row-view[data-row-id='" + row.cid + "']").eq(0);
        if (prevMatch.length !== 0) {
          return prev = prevMatch;
        } else {
          $el = new XlfRowView({
            model: row,
            surveyView: _this
          }).render().$el;
          if (prev) {
            return prev.after($el);
          } else {
            return _this.formEditorEl.prepend($el);
          }
        }
      });
    };

    SurveyApp.prototype.onEscapeKeydown = function() {};

    SurveyApp.prototype.previewButtonClick = function(evt) {
      return this.onPreview.call(this, arguments);
    };

    SurveyApp.prototype.downloadButtonClick = function(evt) {
      var surveyCsv;
      surveyCsv = this.survey.toCSV();
      if (surveyCsv) {
        return evt.target.href = "data:text/csv;charset=utf-8," + (encodeURIComponent(this.survey.toCSV()));
      }
    };

    SurveyApp.prototype.saveButtonClick = function(evt) {
      return this.onSave.call(this, arguments);
    };

    SurveyApp.prototype.publishButtonClick = function(evt) {
      return this.onPublish.call(this, arguments);
    };

    return SurveyApp;

  })(Backbone.View);

  /*
  This is the view for the survey-wide details that appear at the bottom
  of the survey. Examples: "imei", "start", "end"
  */


  XlfSurveyDetailView = (function(_super) {
    __extends(XlfSurveyDetailView, _super);

    function XlfSurveyDetailView() {
      _ref6 = XlfSurveyDetailView.__super__.constructor.apply(this, arguments);
      return _ref6;
    }

    XlfSurveyDetailView.prototype.className = "survey-detail";

    XlfSurveyDetailView.prototype.events = {
      "change input": "changeChkValue"
    };

    XlfSurveyDetailView.prototype.initialize = function(_arg) {
      this.model = _arg.model;
    };

    XlfSurveyDetailView.prototype.render = function() {
      this.$el.append("<label title=\"" + (this.model.get("description") || '') + "\">\n  <input type=\"checkbox\">\n  " + (this.model.get("label")) + "\n</label>");
      this.chk = this.$el.find("input");
      if (this.model.get("value")) {
        this.chk.prop("checked", true);
      }
      this.changeChkValue();
      return this;
    };

    XlfSurveyDetailView.prototype.changeChkValue = function() {
      if (this.chk.prop("checked")) {
        this.$el.addClass("active");
        return this.model.set("value", true);
      } else {
        this.$el.removeClass("active");
        return this.model.set("value", false);
      }
    };

    return XlfSurveyDetailView;

  })(Backbone.View);

  /*
    # Details that need to be presented for each row:
    # 1. type
    #   - if (select_one|select_multiple) then list 
    # 2. name
    # 3. hint?
    # 4. required?
  
    # For future development:
    # -----------------------
    # * Make group?
    # * Constraint?
    # * Calculation
    # * Media?
  */


  XLF.ManageListView = (function(_super) {
    __extends(ManageListView, _super);

    function ManageListView() {
      _ref7 = ManageListView.__super__.constructor.apply(this, arguments);
      return _ref7;
    }

    ManageListView.prototype.initialize = function(_arg) {
      this.rowView = _arg.rowView;
      this.row = this.rowView.model;
      this.survey = this.row._parent;
      return ;
    };

    ManageListView.prototype.className = "manage-list-view col-md-4";

    ManageListView.prototype.events = {
      "click .expand-list": "expandList"
    };

    ManageListView.prototype.expandList = function(evt) {
      var dims, exp, h2, hideCl, list, opt, placeHolderText, resizeTa, row, saveButt, summ, summ2, summH, ta, taLineH, taVals, _i, _len, _ref8,
        _this = this;
      evt.preventDefault();
      row = this.row;
      summ = this.$(".bc-wrap.summarized");
      dims = {
        width: summ.find("select").width()
      };
      exp = this.$(".bc-wrap.expanded");
      list = row.getList();
      taVals = [];
      _ref8 = list.options.models;
      for (_i = 0, _len = _ref8.length; _i < _len; _i++) {
        opt = _ref8[_i];
        taVals.push(opt.get("label"));
      }
      placeHolderText = "Enter 1 option per line";
      hideCl = function() {
        exp.hide();
        return summ.show();
      };
      summH = summ.find(".selected-list-summary").height();
      exp.html(summ.html());
      exp.find(".n-lists-available").html("<button class=\"rename-list\">rename list</button> <button class=\"cl-save\">save</button> <button class=\"cl-cancel\">cancel</button>");
      saveButt = exp.find(".cl-save").bind("click", hideCl);
      exp.find(".cl-cancel").bind("click", hideCl);
      taLineH = 19;
      ta = $("<textarea>").html(taVals.join("\n")).css("height", summH);
      summ2 = exp.find(".selected-list-summary");
      summ2.html(ta);
      resizeTa = function(evt) {
        var lineCt, valLines;
        lineCt = ta.data("line-count");
        valLines = ta.val().split("\n").length;
        if (lineCt !== valLines && valLines >= 2) {
          ta.css("height", valLines * taLineH);
          return ta.data("line-count", valLines);
        }
      };
      this.rowView.surveyView.onEscapeKeydown = function(evt) {
        return hideCl();
      };
      ta.on("keyup", resizeTa);
      ta.on("blur", function() {
        var line, opts;
        taVals = (function() {
          var _j, _len1, _ref9, _results;
          _ref9 = ta.val().split("\n");
          _results = [];
          for (_j = 0, _len1 = _ref9.length; _j < _len1; _j++) {
            line = _ref9[_j];
            if (line.match(/\w+/)) {
              _results.push({
                name: XLF.sluggify(line),
                label: line
              });
            }
          }
          return _results;
        })();
        opts = new XLF.Options(taVals);
        saveButt.unbind("click");
        return saveButt.bind("click", function() {
          list.options = opts;
          hideCl();
          return row.trigger("change");
        });
      });
      h2 = taVals.length * taLineH;
      return ta.animate({
        height: h2
      }, 275);
    };

    ManageListView.prototype.render = function() {
      var choiceList, clName, editMode, list, listName, maxChars, n, numChoices, opt, opts, optsStr, placeholder, sel, select, table, tr, uid, _i, _j, _len, _len1, _ref8, _ref9,
        _this = this;
      numChoices = this.survey.choices.models.length;
      list = this.row.getList();
      listName = this.row.get("type").get("listName");
      editMode = this.rowView.$el.find(".edit-list-view").length !== 0;
      uid = _.uniqueId("list-select-");
      this.$el.append("  <div class=\"form-group\">\n    <label for=\"" + uid + "\">From list:</label>\n    <select id=\"" + uid + "\" class=\"form-control\"></select>\n  </div>\n<!--\n  <div class=\"row-fluid clearfix\">\n    <div class=\"col-sm-4 form-group\">\n      <div class=\"row-fluid\">\n        <label class=\"control-label col-sm-5\" for=\"" + uid + "\">\n          Select a list:\n        </label>\n        <div class=\"col-sm-7\">\n          <select class=\"form-control\" id=\"" + uid + "\"></select>\n        </div>\n      </div>\n    </div>\n  </div>\n  -->");
      select = this.$el.find("select");
      if (list) {
        table = $("<table class=\"table-hovered table-bordered\" contenteditable=\"true\">\n  <tr>\n    <th colspan=\"2\">" + (list.get("name")) + "</th>\n  </tr>\n</table>");
        _ref8 = list.options.models;
        for (n = _i = 0, _len = _ref8.length; _i < _len; n = ++_i) {
          opt = _ref8[n];
          tr = $("<tr>").appendTo(table);
          $("<td>").text(n + ".").appendTo(tr);
          $("<td>").text(opt.get("name")).appendTo(tr);
        }
        table.appendTo(this.$el);
        opts = (function() {
          var _j, _len1, _ref9, _results;
          _ref9 = list.options.models;
          _results = [];
          for (_j = 0, _len1 = _ref9.length; _j < _len1; _j++) {
            opt = _ref9[_j];
            _results.push(opt.get("name"));
          }
          return _results;
        })();
        optsStr = "" + (opts.join(','));
        maxChars = 30;
        if (optsStr.length > maxChars) {
          optsStr = optsStr.slice(0, maxChars) + "...";
        }
      } else {

      }
      if (numChoices === 0) {
        sel = $("<select>", {
          disabled: 'disabled'
        }).html($("<option>", {
          text: "No lists available"
        }));
      } else {
        sel = $("<select>");
        if (!list) {
          placeholder = $("<option>", {
            value: "",
            selected: "selected"
          }).html("Select a list...");
          sel.append(placeholder);
          sel.addClass("placeholding");
          sel.focus(function(evt) {
            return sel.removeClass("placeholding");
          });
          sel.change(function(evt) {
            return placeholder.remove();
          });
        }
        _ref9 = this.survey.choices.models;
        for (_j = 0, _len1 = _ref9.length; _j < _len1; _j++) {
          choiceList = _ref9[_j];
          clName = choiceList.get("name");
          if (list && clName === list.get("name")) {
            opt = $("<option>", {
              value: clName,
              selected: "selected"
            });
          } else {
            opt = $("<option>", {
              value: clName
            });
          }
          opt.html(clName).appendTo(sel);
        }
        sel.change(function(evt) {
          var nextList;
          nextList = _this.survey.choices.get($(evt.target).val());
          return _this.row.get("type").set("list", nextList);
        });
      }
      return this;
    };

    return ManageListView;

  })(Backbone.View);

  XLF.EditListView = (function(_super) {
    __extends(EditListView, _super);

    function EditListView() {
      _ref8 = EditListView.__super__.constructor.apply(this, arguments);
      return _ref8;
    }

    EditListView.prototype.initialize = function(_arg) {
      var _this = this;
      this.survey = _arg.survey, this.rowView = _arg.rowView, this.choiceList = _arg.choiceList;
      this.collection = this.choiceList.options;
      if (this.collection.models.length === 0) {
        this.collection.add({
          placeholder: "Option 1"
        });
        this.collection.add({
          placeholder: "Option 2"
        });
      }
      return this.collection.bind("change reset add remove", function() {
        return _this.render();
      });
    };

    EditListView.prototype.className = "edit-list-view";

    EditListView.prototype.events = {
      "click .list-ok": "saveList",
      "click .list-cancel": "closeList",
      "click .list-add-row": "addRow",
      "click .list-delete-row": "deleteRow"
    };

    EditListView.prototype.render = function() {
      var c, eipOpts, name, nameEl, optionsEl, _fn, _i, _len, _ref9,
        _this = this;
      this.$el.html("<p class=\"new-list-text\">Name: <span class=\"name\">" + (this.choiceList.get("name") || "") + "</span></p>\n<div class=\"options\"></div>\n<p><button class=\"list-add-row\">[+] Add option</button></p>\n<p class=\"error\" style=\"display:none\"></p>\n<p><button class=\"list-ok\">OK</button><button class=\"list-cancel\">Cancel</button></p>");
      nameEl = this.$(".name");
      if ((name = this.choiceList.get("name"))) {
        nameEl.text(name);
      }
      eipOpts = {
        callback: function(u, ent) {
          var cleanName;
          cleanName = XLF.sluggify(ent);
          _this.choiceList.set("name", cleanName);
          return cleanName;
        }
      };
      nameEl.editInPlace(eipOpts);
      optionsEl = this.$(".options");
      _ref9 = this.collection.models;
      _fn = function(option) {
        var inp, label;
        inp = $("<input>", {
          placeholder: option.get("placeholder")
        });
        if ((label = option.get("label"))) {
          inp.val(label);
        }
        inp.change(function(evt) {
          var cleanedVal, val;
          val = $(evt.target).val();
          cleanedVal = XLF.sluggify(val);
          option.set("label", val);
          option.set("name", cleanedVal);
          return ;
        });
        return optionsEl.append($("<p>").html(inp));
      };
      for (_i = 0, _len = _ref9.length; _i < _len; _i++) {
        c = _ref9[_i];
        _fn(c);
      }
      return this;
    };

    EditListView.prototype.saveList = function() {
      var _this = this;
      if (this.choiceList.isValid()) {
        this.survey.choices.add(this.choiceList);
        if (this.rowView) {
          this.rowView.model.get("type").set("list", this.choiceList);
        }
        return this._remove(function() {
          return _this.survey.trigger("change");
        });
      } else {
        return this.$(".error").text("Error saving: ").show();
      }
    };

    EditListView.prototype.closeList = function() {
      return this._remove();
    };

    EditListView.prototype._remove = function(cb) {
      var _this = this;
      return this.$el.slideUp(175, "swing", function() {
        _this.$el.remove();
        return cb();
      });
    };

    EditListView.prototype.addRow = function() {
      return this.collection.add({
        placeholder: "New option"
      });
    };

    EditListView.prototype.deleteRow = function() {
      return log("Not yet implemented");
    };

    return EditListView;

  })(Backbone.View);

  /*
  Helper methods:
    sluggify
  */


  XLF.sluggify = function(str) {
    return str.toLowerCase().replace(/\s/g, '_').replace(/\W/g, '').replace(/[_]+/g, "_");
  };

}).call(this);



