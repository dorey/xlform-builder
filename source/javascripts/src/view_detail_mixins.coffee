@DetailViewMixins = do ->
  VX = {}
  VX.name = VX.label = VX.hint =
    html: ->
      """
      #{@model.key}: <code>#{@model.get("value")}</code>
      """
    afterRender: ->
      @$el.find("code").editInPlace
        callback: (uu, ent)=>
          @model.set("value", ent)
          ent

  VX.required =
    html: ->
      """<label><input type="checkbox"> Required?</label>"""
    afterRender: ->
      @$el.find("input").prop("checked", @model.get("value"))

  type_select_options = XLF.lookupRowType.typeSelectList()
  VX.type =
    html: ->
      typeId = @model.get("typeId")
      htmlStr = """
      <span class="select-tp">type: <code>#{typeId}</code></span>
      """
      rtp = @model.get("rowType")
      if rtp.specifyChoice
        listName = @model.get("listName")
        if listName
          htmlStr += """ from <span class="select-list"><code>#{listName}</code></span>"""
        else
          htmlStr += """ from <span class="select-list missing">choose a list</span>"""

      @$el.html htmlStr

      typeSelectCb = (unused, entered)=>
        @model.set("value", entered)
      $sel = $("<select>", class: "inplace_field")
      $og = $("<optgroup>", label: "Field types")
      for [label, name] in type_select_options
        $og.append $("<option>", value: name, text: label)
      $sel.append $og

      eipOpts =
        field_type: "select"
        select_elem: $sel
        callback: typeSelectCb

      @$(".select-tp").editInPlace(eipOpts)

      survey = @model.parentRow._parent
      $lsel = $("<select>", class: "inplace_field")
      $og = $("<optgroup>", label: "Select a list")
      listIds = survey.choices.map (c)->
        $og.append $("<option>", text: c.name, value: c.name)
        c.name
      $lsel.append $og
      $og = $("<optgroup>", label: " -OR- ")
      xlfCreateListSignal = "xlf:createList"
      $og.append $("<option>", text: "Create a new list", value: xlfCreateListSignal)
      $lsel.append $og

      changeListCb = (un, ent)=>
        if ent is xlfCreateListSignal
          log """
            new XlfCreateListView(survey: @survey, row: @model.parentRow)
            """
          "&mdash;"
        else
          @model.set("listName", ent)
          ent
      selectListOpts =
        field_type: "select"
        select_elem: $lsel
        callback: changeListCb

      @$(".select-list").editInPlace(selectListOpts)
      @$el

  VX
