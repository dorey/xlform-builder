@DetailViewMixins = do ->
  VX = {}

  VX.label = VX.hint =
    html: ->
      """
      <div class="col-md-11">
        <blockquote>
          #{@model.get("value")}
        </blockquote>
      </div>
      """
    insertInDOM: (rowView$el)->
      rowView$el.find(".row-content").eq(0).prepend(@$el)

    afterRender: ->
      @$el.find("blockquote").eq(0).editInPlace
        save_if_nothing_changed: true
        field_type: "textarea"
        textarea_cols: 50
        textarea_rows: 3
        callback: (uu, ent)=>
          @model.set("value", ent)
          if ent is "" then "..." else ent

  VX.hint =
    html: ->
      """
      #{@model.key}: <code>#{@model.get("value")}</code>
      """
    afterRender: ->
      @$el.find("code").editInPlace
        save_if_nothing_changed: true
        callback: (uu, ent)=>
          @model.set("value", ent)
          if ent is "" then "..." else ent



  VX.name =
    html: ->
      """
      #{@model.key}: <code>#{@model.get("value")}</code>
      """
    afterRender: ->
      @$el.find("code").editInPlace
        save_if_nothing_changed: true
        callback: (uu, ent)=>
          cleanName = XLF.sluggify ent
          @model.set("value", cleanName)
          if ent is "" then "..." else cleanName

  VX.required =
    html: ->
      """<label><input type="checkbox"> Required?</label>"""
    afterRender: ->
      inp = @$el.find("input")
      inp.prop("checked", @model.get("value"))
      inp.change ()=> @model.set("value", inp.prop("checked"))

  type_select_options = XLF.lookupRowType.typeSelectList()
  VX.type =
    html: ->
      # typeId = @model.get("typeId")
      @$el.addClass("cf")
      htmlStr = ""

      rtp = @model.get("rowType")

      aa_selectTypeBox = $("<div>", class: "select-type-box cl-span-2 cf").appendTo @$el
      aa_select = $("<select>")
      aa_selectTypeBox.html aa_select
      for [tlabel, tname] in XLF.lookupRowType.typeSelectList()
        $("<option>", text: "#{tlabel}", value: tname).appendTo aa_select
      aa_select.val(rtp.name)
      aa_select.change => @model.set "value", aa_select.val()

      # htmlStr = """
      # type: <span class="select-tp"><code>#{typeId}</code></span>
      # """
      if rtp.specifyChoice
        @mlv = new XLF.ManageListView({rowView: @rowView})
        @$el.find("form").eq(0).append @mlv.render().$el

      @$el

  VX
