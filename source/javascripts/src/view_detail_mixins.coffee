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
      eipOpts =
        field_type: "select"
        select_options: type_select_options
        callback: typeSelectCb
      @$(".select-tp").editInPlace(eipOpts)
      survey = @model.parentRow._parent
      listIds = survey.choices.map (c)-> c.name
      changeListCb = (un, ent)=>
        @model.set("listName", ent)
        ent
      selectListOpts =
        field_type: "select"
        select_options: listIds
        callback: changeListCb

      @$(".select-list").editInPlace(selectListOpts)
      @$el

  VX
