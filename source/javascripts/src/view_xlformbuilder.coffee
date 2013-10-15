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
  className: "detail-view"
  initialize: ({@rowView})->
    unless @model.key
      throw new XlformError "RowDetail does not have key"
    if (viewMixin = DetailViewMixins[@model.key])
      _.extend(@, viewMixin)

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
  events:
   "click .create-new-list": "createListForRow"
   "click .edit-list": "editListForRow"
  initialize: ()->
    @model.on "change", @render, @
    typeDetail = @model.get("type")
    typeDetail.on "change:value", _.bind(@render, @)
    typeDetail.on "change:listName", _.bind(@render, @)
  render: ->
    @$el.html """
      <a href="#" class="delete-row" data-row-cid="#{@model.cid}" title="drc#{@model.cid}" txitle="This will remove the question from the survey">&times;</a>
      <div class="post-row-buttons">-<button class="insert-row">+</button>-</div>
    """
    @$el.data("row-model-id", @model.cid)

    for [key, val] in @model.attributesArray()
      v = new XlfDetailView(model: val, rowView: @).renderInRowView(@)
    @
  editListForRow: (evt)->
    $et = $(evt.target)
    survey = @model._parent
    list = @model.getList()
    @_displayEditListView($et, survey, list)

  createListForRow: (evt)->
    $et = $(evt.target)
    survey = @model._parent
    list = new XLF.ChoiceList()
    @_displayEditListView($et, survey, list)

  _displayEditListView: ($et, survey, list)->
    lv = new XLF.EditListView(choiceList: list, survey: survey, rowView: @)
    # the .detail-view element has a left margin of 20px
    padding = 6
    parentElMarginLeft = 20
    clAnchor = $et.parent().find(".choice-list-anchor")
    parentWrap = clAnchor.parent()
    leftMargin = clAnchor.eq(0).position().left - (padding + parentElMarginLeft)
    $lvel = lv.render().$el.css "margin-left", leftMargin
    parentWrap.append $lvel

  newListView: (rv)->
    lv = new XLF.EditListView(choiceList: new XLF.ChoiceList(), survey: @model._parent, rowView: @)
    $lvel = lv.render().$el.css @$(".select-list").position()
    @$el.append $lvel

class @SurveyApp extends Backbone.View
  className: "formbuilder-wrap"
  events:
    "click .delete-row": "clickRemoveRow"
    "click .insert-row": "clickInsertRow"
    "click #add-question": "addNewRow"
    "click #publish-survey": "publishButtonClick"

  initialize: (options)->
    @survey = new XLF.Survey(options)

    @survey.rows.on "add", @reset, @
    @survey.rows.on "reset", @reset, @
    @survey.on "change", @reset, @

    @onPublish = options.publish || $.noop

  render: ()->
    @$el.html """
      <div class="stats">
        <h1 class="form_title"></h1>
        <h2 class="description"></h2>
        <div id="survey-stats"></div>
      </div>
      <div class="form-editor-wrap">
        <ul class="-form-editor">
          <li class="loading"><span>Loading...</span></li>
        </ul>
        <div class="trailing-buttons">
          <button id="add-question" class="attached"><span class="glyphicon-circle-plus"></span> Add question</button>
          <button id="publish-survey">Preview</button>
        </div>
      </div>
      <div class="stats row-details" id="additional-options">&nbsp;</div>
    """
    @formEditorEl = @$(".-form-editor")

    addOpts      = @$("#additional-options")

    # watch for changes on the title and description
    do =>
      setting = "form_title"
      elem = @$(".#{setting}")
      if (es = @survey.settings.get(setting))
        elem.html es 
      eip =
        default_text: "New survey"
        callback: (u, ent)=>
          @survey.settings.set setting, ent
          ent
      elem.editInPlace eip
    do =>
      setting = "description"
      elem = @$(".description")
      default_text = "[survey description]"
      if (es = @survey.settings.get(setting))
        elem.html es
      eip =
        save_if_nothing_changed: true
        default_text: default_text
        callback: (u, ent)=>
          if ent is ""
            default_text
          else
            @survey.settings.set setting, ent
            ent
      elem.editInPlace eip

    @survey.rows.trigger("reset")

    for detail in @survey.surveyDetails.models
      addOpts.append((new XlfSurveyDetailView(model: detail)).render().el)
    @
  reset: ->
    fe = @formEditorEl.empty()
    @survey.forEachRow (row)->
      fe.append(new XlfRowView(model: row).render().el)
  clickRemoveRow: (evt)->
    evt.preventDefault()
    if confirm("Are you sure you want to delete this question? This action cannot be undone.")
      rowId = $(evt.target).data("rowCid")
      matchingRow = @survey.rows.find (row)-> row.cid is rowId
      if matchingRow
        @survey.rows.remove matchingRow
      @survey.rows.trigger "reset"
  clickInsertRow: (evt)->
    cid = $(evt.target).parents("li").eq(0).data("row-model-id")
    newIndex = @survey.rows.indexOf(@survey.rows.get(cid)) + 1
    @addRowAtIndex({_parent: @survey}, newIndex)
  addNewRow: (evt)->
    @addRowAtIndex(_parent: @survey)
  addRowAtIndex: (opts={}, atIndex=false)->
    atIndex = @survey.rows.length  if atIndex is false
    @survey.rows.add(new XLF.Row(opts), at: atIndex)
    @survey.rows.trigger("reset")
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

class XLF.EditListView extends Backbone.View
  initialize: ({@survey, @rowView, @choiceList})->
    @collection = @choiceList.options
    if @collection.models.length is 0
      @collection.add placeholder: "Option 1"
      @collection.add placeholder: "Option 2"
    @collection.bind "change reset add remove", ()=> @render()

  className: "new-list-view"
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
      @$el.remove()
      if @rowView
        @rowView.model.get("type").set("list", @choiceList)
      @survey.trigger "change"
    else
      @$(".error").text("Error saving: ").show()
  closeList: ->
    @$el.remove()
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
  str.toLowerCase().replace(/\s/g, '_').replace(/\W/g, '')