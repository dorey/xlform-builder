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
    insertInDOM: (rowView)->
      rowView.$el.find(".row-content").eq(0).prepend(@$el)

    afterRender: ->
      @$el.find("blockquote").eq(0).editInPlace
        save_if_nothing_changed: true
        field_type: "textarea"
        textarea_cols: 50
        textarea_rows: 3
        callback: (uu, ent)=>
          @model.set("value", ent) that is bothering me
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
      @$el.addClass("cf")

      rtp = @model.get("rowType")
      unless @model.has("rtListChecked")
        @model.set("rtListChecked", !!rtp.specifyChoice, silent: true)

      uid = _.uniqueId("select-#{@model.cid}-")
      @$el.html """
      <div class="row-fluid">
        <form role="form">
          <div class="col-md-3">
              <fieldset>
                <div class="form-group">
                  <label for="#{uid}" class="response-type-label">Response type:</label>
                  <label class="pull-right"><input type="checkbox" class="from-list-cb"> <span class="from-list-label text-muted">from list</span></label>
                  <select id="#{uid}" class="form-control select-type"></select>
                  <select id="#{uid}-list" class="form-control select-type-list"></select>
                </div>
              </fieldset>
          </div>
        </form>
      </div>
      """

      fieldset = @$("fieldset").eq(0)
      rtypelabel = @$(".response-type-label")
      fromListCb = @$(".from-list-cb")
      aa_select = fieldset.find("select##{uid}")
      aa_select_list = fieldset.find("select##{uid}-list")

      for tp in XLF.lookupRowType.typeSelectList()
        $("<option>", text: "#{tp.label}", value: tp.name).appendTo if tp.specifyChoice then aa_select_list else aa_select


      @$(".select-type, .select-type-list").change (evt)=>
        importantListCls = if fromListCb.prop("checked") then "select-type-list" else "select-type"
        importantList = $(".#{importantListCls}")
        if importantList.get(0) is evt.target
          tp = XLF.lookupRowType(evt.target.value)
          @model.set("value", evt.target.value, silent: true)
          @model.set("rowType", tp)
          ``

      env =
        sl: @$(".select-type-list")
        s: @$(".select-type")
        cb: fromListCb
        fll: @$(".from-list-label")

      setCheckState = (onOrOff, set=true)=>
        forAct = forDeact = false
        _sL = env.sl
        _s = env.s
        if onOrOff
          [forAct, forDeact] = [_sL, _s]
          env.fll.removeClass("text-muted")
        else
          [forAct, forDeact] = [_s, _sL]
          env.fll.addClass("text-muted")
        @model.set("value", forAct.val())  if set
        forAct.show()
        forDeact.hide()
        @model.set("rtListChecked", onOrOff, silent: true)


      if @model.get("rtListChecked")
        setCheckState(true, false)
        fromListCb.prop("checked", "true")
      else
        setCheckState(false)

      fromListCb.change ->
        if fromListCb.prop("checked")
          setCheckState(true, false)
        else
          setCheckState(false, false)

      # htmlStr = """
      # type: <span class="select-tp"><code>#{typeId}</code></span>
      # """
      if rtp.specifyChoice
        @mlv = new XLF.ManageListView({rowView: @rowView})
        @$el.find("form").eq(0).append @mlv.render().$el

      @$el

  VX
