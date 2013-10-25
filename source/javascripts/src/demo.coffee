###
This file provides a way to let people see what happens
when you create a new "SurveyApp".
###

trimString = (str) -> String(str).replace /^\s+|\s+$/g, ''
trimMultilineString = (str)->
  (trimString(s) for s in str.split("\n") when s.match(/\w/)).join("\n")

sampleForms = {}

@convertToDemoForm = ()->
  $s = $(@)
  csvTxt = trimMultilineString $s.html()
  cobj = csv.sheeted(csvTxt)
  settingsSheet = cobj.sheet "settings"
  uniqueId = $s.attr("id") || _.uniqueId("sampleform")
  try
    _settings = settingsSheet.toObjects()[0]
    formName = _settings.form_title || _settings.form_id
    identifier = _settings.form_id || uniqueId
  catch e
    formName = "untitled form"
    identifier = uniqueId

  button = $ """
  <button data-clicks="launch-builder" type="button" class="btn btn-sm btn-default">
    #{formName}
  </button>
  """
  sampleForms[identifier] = button
  button.click (evt)->
    evt.preventDefault()
    $et = $(evt.target)
    $et.siblings(".btn-primary").removeClass("btn-primary")
    $et.addClass("btn-primary")
    window.location.hash = identifier
    sheetToObjects = (sheetName)->
      if (sht = cobj.sheet sheetName) then sht.toObjects() else []
    $survey = if (sht = cobj.sheet "survey") then sht.toObjects() else []
    $choices = if (sht = cobj.sheet "choices") then sht.toObjects() else []
    if settingsSheet
      $settings = settingsSheet.toObjects()[0]
    else
      $settings = {}

    $("#preview").empty()
    publishCb = ()->
      # called by surveyapp
      window.surveyCsv = @survey.toCSV()
      log "Storing survey csv in 'window.surveyCsv'."
      csv2dom window.surveyCsv, "#preview"

    app = new SurveyApp
      choices: $choices
      survey: $survey
      settings: $settings
      publish: publishCb

    $("#builder").html app.render().$el
    ``
  $s.replaceWith(button)

@loadSampleFormFromHashIfPresent = ->
  if hsh = window.location.hash
    frmUid = hsh.replace(/^\#/, '')
    sampleForms[frmUid].click()

csv2dom = (txt, _elem)->
  elem = if _elem then $(_elem).empty() else $("<div>")

  switchToRawView = $("<button>", class: "floating-right", text: "Raw CSV")
  tableView = $("<div>", class: "csv-table").append switchToRawView
  hr = ()-> $("<hr>").appendTo(tableView)

  sheetedCsv = csv.sheeted(txt)
  survey = sheetedCsv.sheet("survey")
  choices = sheetedCsv.sheet("choices")
  settings = sheetedCsv.sheet("settings")
  sheetToTable = (survey)->
    table = $("<table>")
    headRow = $("<tr>")
    for column in survey.columns
      $("<th>", text: column).appendTo(headRow)
    $("<thead>", html: headRow).appendTo table
    tbody = $("<tbody>").appendTo table
    for row in survey.rowArray
      tr = $("<tr>").appendTo(tbody)
      $("<td>", text: cell).appendTo(tr)  for cell in row
    table

  $("<h2>", html: "<code>survey</code> sheet:").appendTo(tableView)
  hr()
  sheetToTable(survey).appendTo(tableView)

  if choices and choices.rows.length > 0
    $("<h2>", html: "<code>choices</code> sheet:").appendTo(tableView)
    hr()
    sheetToTable(choices).appendTo(tableView)
  if settings and settings.rows.length > 0
    $("<h2>", html: "<code>settings</code> sheet:").appendTo(tableView)
    hr()
    sheetToTable(settings).appendTo(tableView)
  csvTextAreaWrap = $ """
    <div style="display:none" class="csv-textarea">
      CSV Representation: <button class="floating-right">View as table</button>
      <hr>
      <textarea></textarea>
    </div>
    """
  rowCount = txt.split("\n").length
  csvTextAreaWrap.find("textarea").val(txt).css(height: 19*rowCount, width: 796)

  switchToRawView.click ()->
    csvTextAreaWrap.show()
    tableView.hide()
  csvTextAreaWrap.find("button").click ()->
    csvTextAreaWrap.hide()
    tableView.show()

  elem.append(tableView)
  elem.append(csvTextAreaWrap)
  elem
