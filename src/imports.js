const jQuery = $ = require('jquery')

//#region Firebase

var firebaseConfig = {
    apiKey: "AIzaSyBEMpWUykF8sZB83zlpZZpq5u5QgTID0W8",
    authDomain: "medicline-35e34.firebaseapp.com",
    databaseURL: "https://medicline-35e34.firebaseio.com",
    projectId: "medicline-35e34",
    storageBucket: "medicline-35e34.appspot.com",
    messagingSenderId: "169065015752",
    appId: "1:169065015752:web:efda915944a808ea24f8fd",
    measurementId: "G-K1XPKRC2L6"
}
firebase.initializeApp(firebaseConfig)

//#endregion

//#region Editable Select

require('jquery-editable-select')
$.fn.editableSelect.Constructor.DEFAULTS.effects = 'slide'

let editableSelectList = document.querySelectorAll('.editable-select')
for (let key in editableSelectList) {
    if (editableSelectList.hasOwnProperty(key)) {
        let select = editableSelectList[key]
        $(select).editableSelect()
    }
}

//#endregion

//#region Translation

var currentLanguage = "en"
switch (navigator.language) {
    case "ru":
    case "tr":
        currentLanguage = navigator.language
        break
    default:
        break
}

var translateStrings = require("./langs/" + currentLanguage + ".json")

let textElements = document.querySelectorAll("[translate], [placeholder]")
textElements.forEach(textElement => {
    if (textElement.hasAttribute("placeholder")) {
        textElement.setAttribute("placeholder", translate(textElement.getAttribute("placeholder")))
    }
    else {
        textElement.innerText = translate(textElement.innerText)
    }
})

function translate(textToTranslate) {
    if (translateStrings.hasOwnProperty(textToTranslate)) {
        return translateStrings[textToTranslate]
    }
    else if (textToTranslate.includes("-")) {
        return translateStrings[textToTranslate.split("-")[1]] + " " + translateStrings[textToTranslate.split("-")[0]]
    }
    else if (!Number.isNaN(parseInt(textToTranslate.slice(-1)))) {
        return translateStrings[textToTranslate.slice(0, -1)] + " " + textToTranslate.slice(-1)
    }
}

//#endregion

//#region Material Elements

const { MDCTextField } = require('@material/textfield')
const { MDCRipple } = require('@material/ripple')
const { MDCMenu } = require('@material/menu')
const { MDCDialog } = require('@material/dialog')
const { MDCSnackbar } = require('@material/snackbar')

document.querySelectorAll('.mdc-text-field').forEach(inputElement => {
    inputElement.querySelector('input, textarea').materialComponent = new MDCTextField(inputElement)
})

document.querySelectorAll('.mdc-button, .mdc-ripple-surface, .mdc-icon-button, .mdc-fab, .mdc-list-item__ripple').forEach(rippleElement => {
    rippleElement.materialRipple = new MDCRipple(rippleElement)
    if (rippleElement.classList.contains("mdc-icon-button")) {
        rippleElement.materialRipple.unbounded = true
    }
})

document.querySelectorAll('.mdc-menu').forEach(menuElement => {
    menuElement.materialComponent = new MDCMenu(menuElement)
    menuElement.materialComponent.setFixedPosition(true)
})

document.querySelectorAll('.mdc-dialog').forEach(dialogElement => {
    dialogElement.materialComponent = new MDCDialog(dialogElement)
})

document.querySelectorAll('.mdc-snackbar').forEach(snackbarElement => {
    snackbarElement.materialComponent = new MDCSnackbar(snackbarElement)
    snackbarElement.materialComponent.timeoutMs = 4000
})

//#endregion

//#region Table Export

const { TableExport } = require('tableexport')

function buttonExportClick() {
    let table = TableExport(document.querySelectorAll('table'), {
        filename: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        exportButtons: false
    })
    let xlsxData = table.getExportData()['kases'].xlsx
    table.export2file(xlsxData.data, xlsxData.mimeType, xlsxData.filename, xlsxData.fileExtension, xlsxData.merges, xlsxData.RTL, xlsxData.sheetname)
}

//#endregion

//#region InputMask

require('inputmask')

document.querySelectorAll('input[mask]').forEach(input => {
    let options = {
        showMaskOnHover: false
    }
    switch (input.getAttribute("mask")) {
        case "time":
            options.alias = "datetime"
            options.inputFormat = "HH:MM"
            options.placeholder = "--:--"
            break;
        case "date":
            options.alias = "datetime"
            options.inputFormat = "dd.mm.yyyy"
            options.outputFormat = "yyyy-mm-dd"
            options.placeholder = "--.--.----"
            break;
        case "tel":
            options.alias = "[+]9999999999[99999]"
            options.placeholder = ""
            break;
    }
    input.mask = new Inputmask(options).mask(input)
})

//#endregion
