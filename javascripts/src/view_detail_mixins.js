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
