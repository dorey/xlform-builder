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
