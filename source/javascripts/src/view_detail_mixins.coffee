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
      type: <span class="select-tp"><code>#{typeId}</code></span>
      """
      rtp = @model.get("rowType")
      if rtp.specifyChoice
        listName = @model.get("list")?.get("name")
        numChoices = @model.parentRow._parent.choices.models.length
        if listName and numChoices is 1
          # in this case, there is nothing to choose from, so no dropdown.
          htmlStr += """ from
              <code class="choice-list-anchor">#{listName}</code>
              <button class="edit-list" data-list-name="#{listName}">Edit</button>
              or
              <button class="create-new-list">create a list</button>
            """
        else if listName
          htmlStr += """ from
              <span class="select-list choice-list-anchor like-code">#{listName}</span>
              <button class="edit-list" data-list-name="#{listName}">Edit</button>
              or
              <button class="create-new-list">create a list</button>
            """
        else if numChoices is 0
          htmlStr += """ from
              <button class="create-new-list choice-list-anchor">create a list</button>
            """
        else
          htmlStr += """ from <span class="select-list choice-list-anchor missing">choose a list</span>"""
        @$el.html htmlStr
        @$el.append new XLF.ManageListView({rowView: @rowView}).render().$el
      else
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
      for c in survey.choices.models
        $lsel.append $("<option>", text: c.get("name"), value: c.get("name"))

      changeListCb = (un, ent)=>
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
