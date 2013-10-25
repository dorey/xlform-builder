###
This file provides the "SurveyApp" object which is an extension of
Backbone.View and builds the XL(S)Form Editor in the browser.
###

class XlformError extends Error
  constructor: (@message)->
    @name = "XlformError"

# $().editInPlace seems to depend on $.browser
$.browser || $.browser = {}

class XlfDetailView extends Backbone.View
  ###
  The XlfDetailView class is a base class for details
  of each row of the XLForm. When the view is initialized,
  a mixin from "DetailViewMixins" is applied.
  ###
  className: "dt-view"
  initialize: ({@rowView})->
    unless @model.key
      throw new XlformError "RowDetail does not have key"
    @extraClass = "xlf-dv-#{@model.key}"
    if (viewMixin = DetailViewMixins[@model.key])
      _.extend(@, viewMixin)
    @$el.addClass(@extraClass)

  render: ()->
    rendered = @html()
    unless rendered is @$el or rendered is @el
      @$el.html rendered
    @
  html: ()->
    """
    <code>#{@model.key}:</code>
    <code>#{@model.get("value")}</code>
    """
  insertInDOM: (rowView)->
    rowView.$el.append(@el)

  renderInRowView: (rowView)->
    @render()
    @afterRender && @afterRender()
    @insertInDOM(rowView)
    @

class XlfRowView extends Backbone.View
  tagName: "li"
  className: "page-header xlf-row-view"
  events:
   "click .create-new-list": "createListForRow"
   "click .edit-list": "editListForRow"
   "click": "select"
  initialize: ()->
    @model.on "change", @render, @
    typeDetail = @model.get("type")
    typeDetail.on "change:value", _.bind(@render, @)
    typeDetail.on "change:listName", _.bind(@render, @)
    @surveyView = @options.surveyView
    @$el.on "xlf-blur", =>
      @$el.removeClass("xlf-selected")
  select: ->
    unless @$el.hasClass("xlf-selected")
      $(".xlf-selected").trigger("xlf-blur")
      @$el.addClass("xlf-selected")
  render: ->
    @$el.html """
      <div class="row-fluid clearfix">
        <div class="col-xs-2 col-sm-1">
          <div style="width:40px;height:40px;background-color:#ddd"></div>
        </div>
        <div class="col-xs-9 col-sm-10 row-content"></div>
        <div class="col-xs-1 col-sm-1 row-r-buttons">
          <div class="post-row-buttons">-<button class="insert-row">+</button>-</div>
          <button type="button" class="close" aria-hidden="true">&times;</button>
        </div>
      </div>
    """
    @rowContent = @$(".row-content")

    for [key, val] in @model.attributesArray()
      new XlfDetailView(model: val, rowView: @).renderInRowView(@)

    @
  editListForRow: (evt)->
    @_ensureNoListViewsOpen()
    $et = $(evt.target)
    survey = @model._parent
    list = @model.getList()
    @_displayEditListView($et, survey, list)

  createListForRow: (evt)->
    @_ensureNoListViewsOpen()
    $et = $(evt.target)
    survey = @model._parent
    list = new XLF.ChoiceList()
    @_displayEditListView($et, survey, list)

  _ensureNoListViewsOpen: ->
    # this is a temporary solution which aims to prevent simultaneous list-view edit boxes
    throw new Error("ListView open")  if $(".edit-list-view").length > 0

  _displayEditListView: ($et, survey, list)->
    lv = new XLF.EditListView(choiceList: list, survey: survey, rowView: @)
    # the .detail-view element has a left margin of 20px
    padding = 6
    parentElMarginLeft = 20
    clAnchor = $et.parent().find(".choice-list-anchor")
    parentWrap = clAnchor.parent()
    leftMargin = clAnchor.eq(0).position().left - (padding + parentElMarginLeft)
    $lvel = lv.render().$el.css "margin-left", leftMargin
    parentWrap.append $lvel.hide()
    $lvel.slideDown 175

  newListView: (rv)->
    lv = new XLF.EditListView(choiceList: new XLF.ChoiceList(), survey: @model._parent, rowView: @)
    $lvel = lv.render().$el.css @$(".select-list").position()
    @$el.append $lvel

class @SurveyApp extends Backbone.View
  className: "formbuilder-wrap container"
  events:
    "click .delete-row": "clickRemoveRow"
    "click .insert-row": "clickInsertRow"
    "click #add-question": "addNewRow"
    "click #publish-survey": "publishButtonClick"

  initialize: (options)->
    if options.survey and (options.survey instanceof XLF.Survey)
      @survey = options.survey
    else
      @survey = new XLF.Survey(options)

    @rowViews = new Backbone.Model()
    description = @survey.settings.get("description") || ""
    [_displayTitle, _descrip...] = description.split("\\n")
    _displayTitle || (_displayTitle = @survey.settings.get("form_title"))
    _descrip || (_descrip = "")
    @survey.set("displayTitle", _displayTitle, silent: true)
    @survey.set("displayDescription", _descrip.join("\n"), silent: true)
    @survey.set("formName", @survey.settings.get("form_title"), silent: true)
    @survey.on "change:displayTitle", ()=>
      lines = [@survey.get("displayTitle"), @survey.get("displayDescription")]
      @survey.settings.set "description", lines.join("\n")

    # @survey.rows.on "add", @reset, @
    # @survey.rows.on "reset", @reset, @
    # @survey.on "change", @softReset, @

    @onPublish = options.publish || $.noop
    $(window).on "keydown", (evt)=>
      @onEscapeKeydown(evt)  if evt.keyCode is 27

  render: ()->

    @$el.html """
      <div class="page-header">
        <h1 class="title">
          <span class="display-title">
            #{@survey.get("displayTitle")}
          </span>
          <span class="hashtag">[<span class="form-name">#{@survey.settings.get("form_title")}</span>]</span>
        </h1>
        <p class="display-description">
          #{@survey.get("displayDescription")}
        </p>
      </div>
      <div class="form-editor-wrap">
        <ul class="-form-editor">
          <li class="editor-message empty">
            <strong>This survey is currently empty.</strong><br>
            You can add questions, notes, prompts, or other fields by clicking
            <span class="underline">+ Add question</span> below.
          </li>
        </ul>
        <div class="trailing-buttons">
          <button id="add-question" class="attached"><span class="glyphicon-circle-plus"></span> Add question</button>
          <button id="publish-survey">Preview</button>
        </div>
      </div>
      <div class="stats row-details" id="additional-options">&nbsp;</div>
    """
    @formEditorEl = @$(".-form-editor")


    # .form-name maps to settings.form_title
    @$(".form-name").editInPlace
      callback: (u, ent)=>
        val = if ent then XLF.sluggify(ent) else ""
        @survey.settings.set("form_title", val)
        if val then val else "..."

    # .display-title maps to first line of settings.description
    @$(".display-title").editInPlace
      callback: (u, ent)=>
        @survey.set("displayTitle", ent)
        if ent then ent else "..."

    #.display-description maps to remaining lines of settings.description
    @$(".display-description").editInPlace
      field_type: "textarea"
      textarea_cols: 50
      textarea_rows: 3
      callback: (u, ent)=>
        @survey.set("displayDescription", ent)
        if ent then ent.replace(/\n/g, "<br>") else "..."

    addOpts = @$("#additional-options")
    for detail in @survey.surveyDetails.models
      addOpts.append((new XlfSurveyDetailView(model: detail)).render().el)

    @softReset()
    @
  softReset: ->
    fe = @formEditorEl
    isEmpty = true
    @survey.forEachRow (row)=>
      isEmpty = false
      unless (xlfrv = @rowViews.get(row.cid))
        @rowViews.set(row.cid, new XlfRowView(model: row, surveyView: @))
        xlfrv = @rowViews.get(row.cid)

      $el = xlfrv.render().$el
      if $el.parents(@$el).length is 0
        @formEditorEl.append($el)
      # if row._slideDown
      #   row._slideDown = false
      #   fe.append($el.hide())
      #   $el.slideDown 175
      # else
      #   fe.append($el)
    unless isEmpty
      @formEditorEl.find(".empty").remove()

  reset: ->
    fe = @formEditorEl.empty()
    @survey.forEachRow (row)=>
      # row._slideDown is for add/remove animation
      $el = new XlfRowView(model: row, surveyView: @).render().$el
      if row._slideDown
        row._slideDown = false
        fe.append($el.hide())
        $el.slideDown 175
      else
        fe.append($el)
  clickRemoveRow: (evt)->
    evt.preventDefault()
    if confirm("Are you sure you want to delete this question? This action cannot be undone.")
      $et = $(evt.target)
      rowId = $et.data("rowCid")
      rowEl = $et.parents("li").eq(0)
      matchingRow = @survey.rows.find (row)-> row.cid is rowId
      if matchingRow
        @survey.rows.remove matchingRow
      # this slideUp is for add/remove row animation
      rowEl.slideUp 175, "swing", ()=>
        @survey.rows.trigger "reset"
  clickInsertRow: (evt)->
    cid = $(evt.target).parents("li").eq(0).data("row-model-id")
    newIndex = @survey.rows.indexOf(@survey.rows.get(cid)) + 1
    @addRowAtIndex({_parent: @survey}, newIndex)
  addNewRow: (evt)->
    @addRowAtIndex(_parent: @survey)
  addRowAtIndex: (opts={}, atIndex=false)->
    atIndex = @survey.rows.length  if atIndex is false
    # row._slideDown is for add/remove animation
    nRow = new XLF.Row(opts)
    nRow._slideDown = true
    @survey.rows.add(nRow, at: atIndex)
  onEscapeKeydown: -> #noop. to be overridden
  publishButtonClick: (evt)->
    @onPublish.call(@, arguments)

###
This is the view for the survey-wide details that appear at the bottom
of the survey. Examples: "imei", "start", "end"
###
class XlfSurveyDetailView extends Backbone.View
  className: "survey-detail row-detail"
  events:
    "change input": "changeChkValue"
  initialize: ({@model})->
  render: ()->
    @$el.append """
    <label title="#{@model.get("description") || ''}">
      <input type="checkbox">
      #{@model.get("label")}
    </label>
    """
    @chk = @$el.find("input")
    @chk.prop "checked", true  if @model.get "value"
    @changeChkValue()
    @
  changeChkValue: ()->
    if @chk.prop("checked")
      @$el.addClass("active")
      @model.set("value", true)
    else
      @$el.removeClass("active")
      @model.set("value", false)

###
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
###

class XLF.ManageListView extends Backbone.View
  initialize: ({@rowView})->
    @row = @rowView.model
    @survey = @row._parent
    ``
  className: "manage-list-view col-md-4"
  events:
    "click .expand-list": "expandList"
  expandList: (evt)->
    evt.preventDefault()
    row = @row
    summ = @$(".bc-wrap.summarized")
    dims = width: summ.find("select").width()
    exp = @$(".bc-wrap.expanded")

    list = row.getList()
    taVals = []
    for opt in list.options.models
      taVals.push opt.get("label")
    placeHolderText = """Enter 1 option per line"""
    # exp.html("""
    #   <div class="iwrap">
    #     <div class="cf">
    #       <h4 class="list-name">#{list.get("name")}</h4>
    #       <p class="buttons"><button class="cl-save">Save</button><button class="cl-cancel">Cancel</button></p>
    #     </div>
    #     <textarea style="height:#{19 * taVals.length}px" placeholder="#{placeHolderText}">#{taVals.join("\n")}</textarea>
    #   </div>
    #   """)
    # exp.find("h4").eq(0).css(dims)
    hideCl = ->
      exp.hide()
      summ.show()

    summH = summ.find(".selected-list-summary").height()
    exp.html summ.html()
    exp.find(".n-lists-available").html("""
      <button class="rename-list">rename list</button> <button class="cl-save">save</button> <button class="cl-cancel">cancel</button>
      """)
    saveButt = exp.find(".cl-save").bind "click", hideCl
    exp.find(".cl-cancel").bind "click", hideCl
    taLineH = 19
    ta = $("<textarea>").html(taVals.join("\n")).css("height", summH)
    summ2 = exp.find(".selected-list-summary")
    summ2.html(ta)
    resizeTa = (evt)->
      lineCt = ta.data("line-count")
      valLines = ta.val().split("\n").length
      if lineCt isnt valLines and valLines >= 2
        ta.css("height", valLines * taLineH)
        ta.data("line-count", valLines)

    @rowView.surveyView.onEscapeKeydown = (evt)=>
      hideCl()

    ta.on "keyup", resizeTa
    ta.on "blur", ->
      taVals = for line in ta.val().split("\n") when line.match(/\w+/)
        name: XLF.sluggify(line), label: line
      opts = new XLF.Options(taVals)
      saveButt.unbind("click")
      saveButt.bind "click", ->
        list.options = opts
        hideCl()
        row.trigger("change")
    h2 = taVals.length * taLineH
    ta.animate({height: h2}, 275)

  render: ->
    numChoices = @survey.choices.models.length
    list = @row.getList()
    listName = @row.get("type").get("listName")
    editMode = @rowView.$el.find(".edit-list-view").length isnt 0

    uid = _.uniqueId("list-select-")

    @$el.append """
      <div class="form-group">
        <label for="#{uid}">From list:</label>
        <select id="#{uid}" class="form-control"></select>
      </div>
    <!--
      <div class="row-fluid clearfix">
        <div class="col-sm-4 form-group">
          <div class="row-fluid">
            <label class="control-label col-sm-5" for="#{uid}">
              Select a list:
            </label>
            <div class="col-sm-7">
              <select class="form-control" id="#{uid}"></select>
            </div>
          </div>
        </div>
      </div>
      -->
    """
    select = @$el.find("select")

    # bc_wrap = $("<div>", class: "bc-wrap cf summarized").appendTo @$el
    # bc_wrap_hidden = $("<div>", class: "bc-wrap cf expanded").hide().appendTo @$el
    # a_selectBox = $("<div>", class: "select-list-box").appendTo bc_wrap

    # c_nListsAvailable = $("<div>", class: "n-lists-available").appendTo bc_wrap
    # b_selectedListSummary = $("<div>", class: "selected-list-summary").appendTo bc_wrap

    # c_nListsAvailable.text "#{numChoices} list#{if numChoices is 1 then '' else 's'} available "


    if list
      table = $ """
        <table class="table-hovered table-bordered" contenteditable="true">
          <tr>
            <th colspan="2">#{list.get("name")}</th>
          </tr>
        </table>
      """
      for opt, n in list.options.models
        tr = $("<tr>").appendTo(table)
        $("<td>").text(n+".").appendTo(tr)
        $("<td>").text(opt.get("name")).appendTo(tr)
      table.appendTo @$el
      opts = (opt.get("name")  for opt in list.options.models)
      optsStr = "#{opts.join(',')}"
      maxChars = 30
      if optsStr.length > maxChars
        optsStr = optsStr.slice(0,maxChars) + "..."
      # b_selectedListSummary.html "<a href='#' class='expand-list'>[ #{optsStr} ]</a>"
    else
      # b_selectedListSummary.html "<em>No list selected</em>"

    if numChoices is 0
      sel = $("<select>", {disabled: 'disabled'}).html($("<option>", text: "No lists available"))
      # a_selectBox.html sel
    else
      sel = $("<select>")
      unless list
        placeholder = $("<option>", value: "", selected: "selected").html("Select a list...")
        sel.append(placeholder)
        sel.addClass("placeholding")
        sel.focus (evt)-> sel.removeClass("placeholding")
        sel.change (evt)-> placeholder.remove()

      for choiceList in @survey.choices.models
        clName = choiceList.get("name")
        if list and clName is list.get("name")
          opt = $("<option>", value: clName, selected: "selected")
        else
          opt = $("<option>", value: clName)
        opt.html(clName).appendTo(sel)
      sel.change (evt)=>
        nextList = @survey.choices.get $(evt.target).val()
        @row.get("type").set("list", nextList)
      # a_selectBox.html sel
    # c_nListsAvailable.append """<button class='create-new-list2'>(+) Create new list</button>"""
    @

class XLF.EditListView extends Backbone.View
  initialize: ({@survey, @rowView, @choiceList})->
    @collection = @choiceList.options
    if @collection.models.length is 0
      @collection.add placeholder: "Option 1"
      @collection.add placeholder: "Option 2"
    @collection.bind "change reset add remove", ()=> @render()

  className: "edit-list-view"
  events:
    "click .list-ok": "saveList"
    "click .list-cancel": "closeList"
    "click .list-add-row": "addRow"
    "click .list-delete-row": "deleteRow"
  render: ->
    @$el.html """
      <p class="new-list-text">Name: <span class="name">#{@choiceList.get("name") || ""}</span></p>
      <div class="options"></div>
      <p><button class="list-add-row">[+] Add option</button></p>
      <p class="error" style="display:none"></p>
      <p><button class="list-ok">OK</button><button class="list-cancel">Cancel</button></p>
    """
    nameEl = @$(".name")
    nameEl.text(name)  if (name = @choiceList.get("name"))
    eipOpts =
      callback: (u, ent)=>
        cleanName = XLF.sluggify ent
        @choiceList.set("name", cleanName)
        cleanName
    nameEl.editInPlace(eipOpts)

    optionsEl = @$(".options")
    for c in @collection.models
      do (option=c)->
        inp = $("<input>", placeholder: option.get("placeholder"))
        if (label = option.get("label"))
          inp.val(label)
        inp.change (evt)->
          val = $(evt.target).val()
          cleanedVal = XLF.sluggify val
          option.set "label", val
          option.set "name", cleanedVal
          ``
        optionsEl.append $("<p>").html(inp)
    @
  saveList: ->
    if @choiceList.isValid()
      @survey.choices.add @choiceList
      if @rowView
        @rowView.model.get("type").set("list", @choiceList)
      @_remove =>
        @survey.trigger "change"
    else
      @$(".error").text("Error saving: ").show()
  closeList: ->
    @_remove()
  _remove: (cb)->
    @$el.slideUp 175, "swing", =>
      @$el.remove()
      cb()
  addRow: ->
    @collection.add placeholder: "New option"
  deleteRow: ->
    log "Not yet implemented"

###
Helper methods:
  sluggify
###
XLF.sluggify = (str)->
  # Convert text to a slug/xml friendly format.
  str.toLowerCase().replace(/\s/g, '_').replace(/\W/g, '').replace(/[_]+/g, "_")
