(function() {
  var CENSUS_SURVEY, LISTS, PIZZA_SURVEY;

  describe("xlform survey model (XLF.Survey)", function() {
    beforeEach(function() {
      return this.pizzaSurvey = XLF.createSurveyFromCsv(PIZZA_SURVEY);
    });
    it("creates xlform", function() {
      var xlf;
      xlf = new XLF.Survey({
        name: "Sample"
      });
      expect(xlf).toBeDefined();
      expect(xlf instanceof XLF.Survey).toBe(true);
      return expect(xlf.get("name")).toBe("Sample");
    });
    it("ensures every node has access to the parent survey", function() {
      return this.pizzaSurvey.getSurvey;
    });
    it("can import from csv_repr", function() {
      var firstRow;
      expect(this.pizzaSurvey.rows.length).toBe(1);
      firstRow = this.pizzaSurvey.rows.at(0);
      return expect(firstRow.getValue("name")).toEqual("likes_pizza");
    });
    describe("with simple survey", function() {
      beforeEach(function() {
        return this.firstRow = this.pizzaSurvey.rows.at(0);
      });
      describe("lists", function() {
        it("iterates over every row", function() {
          expect(this.pizzaSurvey.rows).toBeDefined();
          return expect(this.firstRow).toBeDefined();
        });
        it("can add a list as an object", function() {
          var x1, x2;
          expect(this.pizzaSurvey.choices.length).toBe(1);
          this.pizzaSurvey.choices.add(LISTS.gender);
          expect(this.pizzaSurvey.choices.length).toBe(2);
          x1 = this.pizzaSurvey.toCsvJson();
          this.pizzaSurvey.choices.add(LISTS.yes_no);
          expect(this.pizzaSurvey.choices.length).toBe(2);
          x2 = this.pizzaSurvey.toCsvJson();
          return expect(x1).toEqual(x2);
        });
        return it("can add row to a specific index", function() {
          var labels, rowc;
          expect(this.pizzaSurvey.addRowAtIndex).toBeDefined();
          rowc = this.pizzaSurvey.rows.length;
          expect(this.pizzaSurvey.rows.length).toBe(1);
          this.pizzaSurvey.addRowAtIndex({
            name: "lastrow",
            label: "last row",
            type: "text"
          }, rowc);
          expect(this.pizzaSurvey.rows.length).toBe(2);
          expect(this.pizzaSurvey.rows.last().get("label").get("value")).toBe("last row");
          this.pizzaSurvey.addRowAtIndex({
            name: "firstrow",
            label: "first row",
            type: "note"
          }, 0);
          expect(this.pizzaSurvey.rows.length).toBe(3);
          expect(this.pizzaSurvey.rows.first().get("label").get("value")).toBe("first row");
          this.pizzaSurvey.addRowAtIndex({
            name: "secondrow",
            label: "second row",
            type: "note"
          }, 1);
          expect(this.pizzaSurvey.rows.length).toBe(4);
          expect(this.pizzaSurvey.rows.at(1).get("label").get("value")).toBe("second row");
          labels = _.map(this.pizzaSurvey.rows.pluck("label"), function(i) {
            return i.get("value");
          });
          return expect(labels).toEqual(['first row', 'second row', 'Do you like pizza?', 'last row']);
        });
      });
      return it("row types changing is trackable", function() {
        var list, typeDetail;
        expect(this.firstRow.getValue("type")).toBe("select_one yes_no");
        typeDetail = this.firstRow.get("type");
        expect(typeDetail.get("typeId")).toBe("select_one");
        expect(typeDetail.get("list").get("name")).toBe("yes_no");
        list = this.firstRow.getList();
        expect(list).toBeDefined();
        return expect(list.get("name")).toBe("yes_no");
      });
    });
    describe("with custom surveys", function() {
      beforeEach(function() {
        var _this = this;
        this.createSurveyCsv = function(survey, choices) {
          var choiceSheet;
          if (survey == null) {
            survey = [];
          }
          if (choices == null) {
            choices = [];
          }
          choiceSheet = choices.length === 0 ? "" : "choices,,,\n,list name,name,label\n," + (choices.join("\n,"));
          return "survey,,,\n,type,name,label,hint\n," + (survey.join("\n,")) + "\n" + choiceSheet;
        };
        this.createSurvey = function(survey, choices) {
          if (survey == null) {
            survey = [];
          }
          if (choices == null) {
            choices = [];
          }
          return XLF.createSurveyFromCsv(_this.createSurveyCsv(survey, choices));
        };
        this.firstRow = function(s) {
          return s.rows.at(0);
        };
        this.compareCsvs = function(x1, x2) {
          var r, x1r, x2r, _i, _len, _ref;
          x1r = x1.split("\n");
          x2r = x2.split("\n");
          _ref = _.min(x1r.length, x2r.length);
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            r = _ref[_i];
            expect(x1r[r]).toBe(x2r[r]);
          }
          return expect(x1).toBe(x2);
        };
        return this.dumpAndLoad = function(scsv) {
          var s1, s2, x1, x2;
          s1 = XLF.createSurveyFromCsv(scsv);
          x1 = s1.toCSV();
          s2 = XLF.createSurveyFromCsv(x1);
          x2 = s2.toCSV();
          return _this.compareCsvs(x1, x2);
        };
      });
      it("breaks with an unk qtype", function() {
        var makeInvalidTypeSurvey,
          _this = this;
        makeInvalidTypeSurvey = function() {
          return _this.createSurvey(["telegram,a,a,a"]);
        };
        return expect(makeInvalidTypeSurvey).toThrow();
      });
      it("exports and imports without breaking", function() {
        var scsv;
        scsv = this.createSurveyCsv(["text,text,text,text"]);
        return this.dumpAndLoad(scsv);
      });
      return it("tries a few question types", function() {
        var r1type, row1, srv;
        srv = this.createSurvey(["text,text,text,text"]);
        row1 = srv.rows.at(0);
        r1type = row1.get("type");
        expect(r1type.get("rowType").name).toBe("text");
        srv = this.createSurvey(["\"select_multiple x\",a,a,a"], ["x,ax,ax", "x,bx,bx,", "y,ay,ay", "y,by,by"]);
        row1 = srv.rows.at(0);
        r1type = row1.get("type");
        expect(r1type.get("typeId")).toBe("select_multiple");
        expect(r1type.get("list").get("name")).toBe("x");
        expect(row1.getList().get("name")).toBe("x");
        r1type.set("value", "select_multiple y");
        expect(r1type.get("typeId")).toBe("select_multiple");
        expect(r1type.get("list").get("name")).toBe("y");
        expect(row1.toJSON().type).toBe("select_multiple y");
        expect(row1.getList().get("name")).toBe("y");
        row1.get("type").set("value", "text");
        expect(row1.get("type").get("value")).toBe("text");
        expect(row1.get("type").get("list").get("name")).toBeDefined();
        expect(row1.getList().get("name")).toBeDefined();
        expect(row1.toJSON().type).toBe("text");
        return ;
      });
    });
    describe("groups", function() {
      return it("can add a group", function() {
        var grp, second_group;
        this.pizzaSurvey.addRow({
          type: "text",
          name: "pizza",
          hint: "pizza",
          label: "pizza"
        });
        expect(this.pizzaSurvey.rows.last() instanceof XLF.Row).toBe(true);
        this.pizzaSurvey.addRow({
          type: "group",
          name: "group"
        });
        grp = this.pizzaSurvey.rows.last();
        grp.addRow({
          type: "text",
          name: "textquestioningroup",
          label: "Text question in group"
        });
        grp.addRow({
          type: "group",
          name: "groupingroup"
        });
        second_group = grp.rows.last();
        return second_group.addRow({
          type: "text",
          name: "secondgroupquestion",
          label: "Second group question"
        });
      });
    });
    describe("lists", function() {
      it("can change a list for a question", function() {
        var firstRow, list, ynm, _ref;
        this.pizzaSurvey.choices.add({
          name: "yes_no_maybe"
        });
        ynm = this.pizzaSurvey.choices.get("yes_no_maybe");
        expect(ynm).toBeDefined();
        firstRow = this.pizzaSurvey.rows.first();
        expect(firstRow.getList().get("name")).toBe("yes_no");
        expect(firstRow.getList().get("name")).toBe("yes_no");
        firstRow.setList(ynm);
        expect(firstRow.getList().get("name")).toBe("yes_no_maybe");
        firstRow.setList("yes_no");
        expect(firstRow.getList().get("name")).toBe("yes_no");
        expect(function() {
          return firstRow.setList("nonexistant_list");
        }).toThrow();
        list = firstRow.getList();
        list.set("name", "no_yes");
        expect(firstRow.getList()).toBeDefined();
        return expect((_ref = firstRow.getList()) != null ? _ref.get("name") : void 0).toBe("no_yes");
      });
      return it("can change options for a list", function() {
        var yn, ynm;
        yn = this.pizzaSurvey.choices.get("yes_no");
        expect(yn.options).toBeDefined();
        this.pizzaSurvey.choices.add({
          name: "yes_no_maybe"
        });
        ynm = this.pizzaSurvey.choices.get("yes_no_maybe");
        expect(ynm).toBeDefined();
        expect(ynm.options.length).toBe(0);
        ynm.options.add({
          name: "maybe",
          label: "Maybe"
        });
        ynm.options.add([
          {
            name: "yes",
            label: "Yes"
          }, {
            name: "no",
            label: "No"
          }
        ]);
        expect(ynm.options.length).toBe(3);
        ynm.options.add({
          name: "maybe",
          label: "Maybe2"
        });
        expect(ynm.options.length).toBe(3);
        return expect(ynm.options.first().get("label")).toBe("Maybe");
      });
    });
    return describe("census xlform", function() {
      beforeEach(function() {
        return this.census = XLF.createSurveyFromCsv(CENSUS_SURVEY);
      });
      return it("looks good", function() {
        return expect(this.census).toBeDefined();
      });
    });
  });

  /*
  Misc data. (basically fixtures for the tests above)
  */


  LISTS = {
    yes_no: {
      name: "yes_no",
      options: [
        {
          "list name": "yes_no",
          name: "yes",
          label: "Yes"
        }, {
          "list name": "yes_no",
          name: "no",
          label: "No"
        }
      ]
    },
    gender: {
      name: "gender",
      options: [
        {
          "list name": "gender",
          name: "f",
          label: "Female"
        }, {
          "list name": "gender",
          name: "m",
          label: "Male"
        }
      ]
    }
  };

  PIZZA_SURVEY = "survey,,,\n,type,name,label\n,select_one yes_no,likes_pizza,Do you like pizza?\nchoices,,,\n,list name,name,label\n,yes_no,yes,Yes\n,yes_no,no,No";

  CENSUS_SURVEY = "\"survey\",\"type\",\"name\",\"label\"\n,\"integer\",\"q1\",\"How many people were living or staying in this house, apartment, or mobile home on April 1, 2010?\"\n,\"select_one yes_no\",\"q2\",\"Were there any additional people staying here April 1, 2010 that you did not include in Question 1?\"\n,\"select_one ownership_type or_other\",\"q3\",\"Is this house, apartment, or mobile home: owned with mortgage, owned without mortgage, rented, occupied without rent?\"\n,\"text\",\"q4\",\"What is your telephone number?\"\n,\"text\",\"q5\",\"Please provide information for each person living here. Start with a person here who owns or rents this house, apartment, or mobile home. If the owner or renter lives somewhere else, start with any adult living here. This will be Person 1. What is Person 1's name?\"\n,\"select_one male_female\",\"q6\",\"What is Person 1's sex?\"\n,\"date\",\"q7\",\"What is Person 1's age and Date of Birth?\"\n,\"text\",\"q8\",\"Is Person 1 of Hispanic, Latino or Spanish origin?\"\n,\"text\",\"q9\",\"What is Person 1's race?\"\n,\"select_one yes_no\",\"q10\",\"Does Person 1 sometimes live or stay somewhere else?\"\n\"choices\",\"list name\",\"name\",\"label\"\n,\"yes_no\",\"yes\",\"Yes\"\n,\"yes_no\",\"no\",\"No\"\n,\"male_female\",\"male\",\"Male\"\n,\"male_female\",\"female\",\"Female\"\n,\"ownership_type\",\"owned_with_mortgage\",\"owned with mortgage\",\n,\"ownership_type\",\"owned_without_mortgage\",\"owned without mortgage\"\n,\"ownership_type\",\"rented\",\"rented\"\n,\"ownership_type\",\"occupied_without_rent\",\"occupied without rent\"\n\"settings\"\n,\"form_title\",\"form_id\"\n,\"Census Questions (2010)\",\"census2010\"";

  describe("testing the view", function() {
    return it("builds the view", function() {
      var $el, clickNewRow, div, lastRowEl, pizza;
      pizza = XLF.createSurveyFromCsv(PIZZA_SURVEY);
      this.xlv = new SurveyApp({
        survey: pizza
      });
      div = $("<div>").appendTo("body");
      $el = this.xlv.render().$el;
      $el.appendTo(div);
      expect(div.html()).not.toContain("empty");
      expect(div.find("li.xlf-row-view").length).toBe(1);
      lastRowEl = div.find("li.xlf-row-view").eq(0);
      clickNewRow = function() {
        return lastRowEl.find(".add-row-btn").click();
      };
      expect(clickNewRow).not.toThrow();
      expect(lastRowEl.find(".line").eq(-1).hasClass("expanded")).toBeTruthy();
      expect(pizza.rows.length).toBe(1);
      lastRowEl.find(".line.expanded").find(".menu-item-geopoint").trigger("click");
      expect(pizza.rows.length).toBe(2);
      expect(div.find(".xlf-row-view").length).toBe(2);
      return expect(div.find(".xlf-row-view").eq(-1).find(".xlf-dv-label").text()).toMatch("location");
    });
  });

}).call(this);
