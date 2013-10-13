@DetailViewMixins = do ->
  VX = {}

  VX.label = VX.hint =
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
      typeId = @model.get("typeId")
      htmlStr = """
      <span class="select-tp">type: <code>#{typeId}</code></span>
      """
      rtp = @model.get("rowType")
      if rtp.specifyChoice
        listName = @model.get("list")?.get("name")
        if listName
          htmlStr += """ from <span class="select-list"><code>#{listName}</code></span> <button class="edit-list" data-list-name="#{listName}">Edit</button>"""
        else if @model.parentRow._parent.choices.models.length is 0
          htmlStr += """ from <button class="create-new-list">create a list</button>"""
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
        $og.append $("<option>", text: c.get("name"), value: c.get("name"))
        c.get("name")
      $lsel.append $og
      $og = $("<optgroup>", label: " -OR- ")
      xlfCreateListSignal = "xlf:createList"
      $og.append $("<option>", text: "Create a new list", value: xlfCreateListSignal)
      $lsel.append $og

      changeListCb = (un, ent)=>
        if ent is xlfCreateListSignal
          @rowView.newListView(@)
          ""
        else
          list = @model.parentRow._parent.choices.get(ent)
          @model.set("list", list)
          "<code>#{ent}</code>"
      selectListOpts =
        field_type: "select"
        select_elem: $lsel
        callback: changeListCb

      @$(".select-list").editInPlace(selectListOpts)
      @$el

  VX
