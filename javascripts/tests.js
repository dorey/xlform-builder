(function() {
  var log, player,
    __slice = [].slice;

  log = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return typeof console !== "undefined" && console !== null ? (_ref = console.log) != null ? _ref.apply(console, args) : void 0 : void 0;
  };

  this.audibles = (function() {
    var common, prefix, tink, womp;
    prefix = "data:audio/ogg;base64,T2dnUwACAAAAAAAAAAD";
    common = "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UUkoppZTSQQilhFJKKaWUUkoJHYRSSimllFJKCZ2DUEoppZRSSikllBBKKaWUUkoppYQOQimllFJKKaWUUkoopZRSSimllFJK6aSUUkoppZRSSimllFJKKaWUUkoppZRSSimllFJKKaWUUkoppZRSSimllFBCKaWUUkoppZRSSimhlFJKKaWUUkoppZRSSikFACBGOAAgLhhBJxlVFmGjCRcegEJDVgEAGwAAgDEIKaWUYowxxhhjzDHHmDECAEAPHAAAAow05tZTMEUkzzS0VGLHFThkoIWGrAQAyAAAGAYhdFBykgxSjDmovUIGKeakJU0hgxSDVDymEEIMSvAYQwgpZsVzjjGEmBUPSgiZYhZs8T23VFrRwRija+1FAAAAggAAASEBAAYICmYAgMEBwsiBQEcAgUMbAGAgQmYCg0JocJAJAA8QEVIBQGKConShC0KIIF0EWTxw4cSNJ244oUMbCAAAAAAACAB8AAAkFEBENDNzFRYXGBkaGxwdHh8gISIjAgAAAAAABAAfAAAJCRARzcxchcUFRobGBkeHxwdIiMhIAAAggAAAAAAACCAAAQEBAAAAAIAAAAAAAQFPZ2dTAA";
    tink = "VZbQvAAAAANhwgekBHgF2b3JiaXMAAAAAAiJWAAAAAAAAwFcBAAAAAACpAU9nZ1MAAAAAAAAAAAAA1WW0LwEAAACPJjfTDi3 TeAQAAAAAAANVltC8CAAAAV7e0QgOdO2gcsa9NV5U6Yl+brirlDNSBFMos1AXpFRWUQgoJEIJiDk43B0+nt4PVxdXdHU+7FJAViA4hhoBjKJIWKuc8OeXTXCbNhgxZZ0IaQxKnmTFrJtNOMh2HYRyHYRwzdMzE1ISUjLLOhGyaSfLZ3JG7K63UcXNz8/bbaYqDxmmlldb+tD/tjw+mcvVylQql7kpnu6f98cGMGToaTDvJdBwGHKl/+/U7Hkfq3379jgcQJFBFAAC8AAAAGIAgmYNgLCyQhqhmeuZRntwYYzIBAil02PBOcYo3jQIAHACaR/n+K8np9j/PNuVRvv9Kcrr9z7NNQMYTmggAMBER8N7DC2Y4OFSvQ8bJOFQa42Q6GWUcRhmHMXpUqvp4Yvc9Uw8ABkAxyebymTSTJlEFwIHAwQEEdgFsHjx2MRv2dg8CYnbtvb2XAQ==".split(" ");
    womp = "LELsvAAAAAE0kADMBHgF2b3JiaXMAAAAAAiJWAAAAAAAAwFcBAAAAAACpAU9nZ1MAAAAAAAAAAAAAyxC7LwEAAAA7jj5DDi3 QrDgAAAAAAAMsQuy8CAAAABTEnxQprXH9kmJWZjY2bRJ/upKJPd1K6FABRoSjSAJBlWdliAJDE4BxkwDYhCIUAEiYEiRCMs2lBkYLEaRqVZDIpALj/O0uXSmSYDCnGvACScJbHAoCO0+koQ1RirT5yr0CZXIKNbcfIMBmSyWQwjkUmk4lxdlqtDAFsqZacoC3VkhN0VagkihMBolBJobhiCTIJxQSArFhGoQAAURBFZYKjIQLEGBwtCSDEKAAAUFQ0AoVSEe8TLWF3mwMM0bevs9wdxJG9O6SYti55aV9K6fIhOKLPCGQn4LQlZSfgtCU1XQfKQsVCGUBkmR0JEFkhJBBszByPJCQEESsaBkDEQcKEIDtaQQoAoGBiDJoUAMC5e1UqocM4HXUcSQxj2sxCxJhUco6oaTNmQDp2UkkNkwwR0Q6dNpPGNMY01cwGNWAYJmKsSYxDK5VIh5lxbIEaOtQwZBJsqU4a/Vuqk0b/H1GaJQBEVlqhQnEGZIZMB6BUiTIAIIpimFPEMNRATAWwS2AMKERCjAIAFLEcFACAAoezufcdiPFC+hRFpXU6IOlBcXaw1yvJy3VqiHSammQUMazd2EW1MMoUOqtC1/it9JW3vdp+M6tC1/it9JW3vdp+k5WVLcoAIUK1sBMAICImiYiIYoyRGIPlaBQhiIWR0NGQMEEOlXPRNFcQC52LwSJ1LpMWkoSYKgAAVnA2LUCpc0cNAIBtoAwCDU9Q2De67qdzgzhyocWVGwL86Xreiv75rt8letO8qJv51DJC/ad3qz05Jl1O+zu9PzDmDBtucgd+q2KnI7C4PO3fPOiHvvWtip2OwOLytH/zoB/61lnFlRQFQESmBEBEykiSJAohhCgAZEURCl0MRUOmaBoBOul0mIwdMhoAgBWcTRAFTAMAQFaZbLZIhigsAQMMwvCWw7ArZO51MblBEoLgYGhhnTmHfYQSOn9mEAghkJRIQB9zMyNNO5lcDBK9z72iBnCk495M88cLAJ6bUsejOky33/D0617bkptSx6M6TLff8PTrXtvSRwxEmQQQpASAIJJEpJKIMDEWjUdtEQEwTKfToQCIOi3mYHYYp0M7YQAAspQXhJBOAgBAyKogX1CESFYYEAFw15Q1ZMascStPGkWE+UfcO70/mZeS/lYnZ3C8GSZZVHlJHCdOHafYLcJIHdfq85Jez+p1huLq3Lk1/h9/AD6q0sf9kZmf8r+7cHvbGlXp4/7IzE/53124vW31V+ZClBYBBFUEQBCTREREhIxiEcJYxABWi2mxKwCidiTjAkLihBAIAIAhJoXIKsqRAAAoF4shUySaEAjgyqlIdC4EZTeTIo9RrBWTonIvdK41NCKEGc4IihimJ8ZG6yN0287scFdXbSVGqJx2MPZzAT6bIpdHReJ4LMHr/D+zKXJ5VCSOxxK8zv+ziQiJsmIlACIVNAYiYkREkogw0QgSogkGsIQDALJFSt5Zo4xyJACocZgOSSfDKgDOkIshzQobB1AGByahWAZBcoKxYvZclz3JQMuSXO53J2wq3wr/Mv/339F9xj44jaHL/GGE3lA0ThkjFp3K2Tfugp8uOp4Zgqv7IqE3/zDNb20lZYbg6r5I6M0/TPNbW0lt+wGCwwglIiIiwpSgSOioCaIK4rF4EPKZGJNsQbHFFCYG62R2ZjqMwzgUQNNhOjONZm9AOoyT2ZnpZKRpAGDXjEBzoGfCRJndey/2ZtcD3svsvXfvBexemF2x4UwvzN57u+ceHhf3mLr3nine7M3UvRe4N3v3TPEe9t692AUA".split(" ");
    return {
      tink: "" + prefix + tink[0] + common + tink[1],
      womp: "" + prefix + womp[0] + common + womp[1],
      purr: "data:audio/ogg;base64,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"
    };
  })();

  player = false;

  this.getPlayer = function() {
    if (!player) {
      player = document.createElement("audio");
      player.id = "audibles-player";
      document.body.appendChild(player);
    }
    return player;
  };

  this.playSound = function(which) {
    var p, sound;
    sound = audibles[which];
    p = getPlayer();
    if (sound) {
      p.src = sound;
      return p.play();
    } else {
      return log("sound not found");
    }
  };

  this.purr = function() {
    return playSound("purr");
  };

  this.showFavicon = function(status) {
    var iconUrl;
    if (status == null) {
      status = "success";
    }
    iconUrl = "/jasmine-1.3.1/icons/jasmine" + (status === "fail" ? "-broke" : "") + ".png";
    $("head").find("link[type='image/x-icon']").remove();
    return $("<link>", {
      type: "image/x-icon",
      rel: "shortcut icon",
      href: iconUrl
    }).appendTo('head').get(0);
  };

}).call(this);
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
