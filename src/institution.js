let currentQuery = db.collection('insurance')
const selectInstitutionType = document.getElementById('institutionType').materialComponent
selectInstitutionType.listen('MDCSelect:change', () => {
    currentQuery = db.collection(selectInstitutionType.value)
    if (!location.hash) {
        document.title = translate('NEW#' + selectInstitutionType.value.toUpperCase())
    }
})

const formInstitution = document.getElementById('institution')
const inputName = document.getElementById('name')

formInstitution.querySelectorAll('input, textarea').forEach(input => input.onchange = () => {
    input.value = input.value.trim()
    validateInput(input)
})

let selectedInstitution

let stopFilteredCasesQuery = () => { }

const dialogDeleteInstitution = document.getElementById("dialogDeleteInstitution")
const iconDialogDeleteInstitution = dialogDeleteInstitution.querySelector('.mdi')
const textDialogDeleteInstitution = dialogDeleteInstitution.querySelector('p')
const foundCasesLinks = dialogDeleteInstitution.querySelector('span')

dialogDeleteInstitution.materialComponent.listen('MDCDialog:closed', event => {
    if (event.detail.action == "delete") {
        selectedInstitution.delete().then(() => {
            ipcRenderer.send('window-action', 'exit')
        }).catch(error => {
            console.error("Error removing institution: ", error)
        })
    }
})

function deleteInstitution() {
    const filteredCases = allCases.where(selectInstitutionType.value, '==', db.doc(selectInstitutionType.value + '/' + selectedInstitution.id))

    stopFilteredCasesQuery()
    stopFilteredCasesQuery = filteredCases.onSnapshot(
        snapshot => {
            let prefix

            foundCasesLinks.innerHTML = ''

            if (snapshot.docs.length > 0) {
                iconDialogDeleteInstitution.classList.remove('mdi-help-circle-outline')
                iconDialogDeleteInstitution.classList.add('mdi-alert')

                prefix = 'CANT_DELETE#THIS_'
                textDialogDeleteInstitution.classList.remove('mb-0')
                textDialogDeleteInstitution.classList.add('mb-2')

                for (let i = 0; i < snapshot.docs.length; i++) {
                    const _case = snapshot.docs[i];

                    const link = document.createElement('a')
                    link.href = '#'
                    link.innerText = '#' + _case.id
                    link.id = _case.id
                    link.onclick = () => ipcRenderer.send('new-window', 'case', link.id)
                    foundCasesLinks.appendChild(link)

                    if (i < snapshot.docs.length - 1) {
                        const comma = document.createElement('b')
                        comma.innerText = ' , '
                        foundCasesLinks.appendChild(comma)
                    }
                }
                dialogDeleteInstitution.materialComponent.buttons[1].disabled = true
            }
            else {
                iconDialogDeleteInstitution.classList.add('mdi-help-circle-outline')
                iconDialogDeleteInstitution.classList.remove('mdi-alert')

                prefix = 'ASK_DELETE#THIS_'
                textDialogDeleteInstitution.classList.add('mb-0')
                textDialogDeleteInstitution.classList.remove('mb-2')

                dialogDeleteInstitution.materialComponent.buttons[1].disabled = false
            }
            textDialogDeleteInstitution.innerText = translate(prefix + selectInstitutionType.value.toUpperCase())

            dialogDeleteInstitution.materialComponent.open()
        },
        error => {
            console.error("Error getting filtered cases: " + error)
        }
    )
}

function saveInstitution() {
    let data = {}
    let valid = true

    formInstitution.querySelectorAll('input, textarea').forEach(input => {
        if (input != undefined) {
            input.oninput = validateInput

            if (!validateInput(input)) {
                valid = false
            }

            if (input.value != '' && !input.disabled && !input.readOnly) {
                if (input.mask != undefined) {
                    data[input.id] = input.mask.unmaskedvalue()
                }
                else {
                    data[input.id] = input.value
                }
            }
        }
    })

    console.log(data)
    console.log('isValid: ' + valid)

    if (valid) {
        if (selectedInstitution) {
            selectedInstitution.set(data).then(() => {
                ipcRenderer.send('window-action', 'exit')
            }).catch(error => {
                console.error("Error updating institution: ", error)
            })
        }
        else {
            currentQuery.add(data).then(() => {
                ipcRenderer.send('window-action', 'exit')
            }).catch(error => {
                console.error("Error creating institution: ", error)
            })
        }
    }
}

const actionButtonsPanel = document.getElementById('actionButtonsPanel')
const buttonDelete = actionButtonsPanel.querySelector("button#delete")
buttonDelete.onclick = deleteInstitution
const buttonSave = actionButtonsPanel.querySelector("button#save")
buttonSave.onclick = saveInstitution

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        loadPermissions()
    }
    else {
        stopPermissionsQuery()
        stopFilteredCasesQuery()
    }
})

let stopPermissionsQuery = () => { }

function toggleEditMode(editIsAllowed) {
    actionButtonsPanel.classList.toggle('hide', !editIsAllowed)
    if (editIsAllowed) {
        buttonDelete.onclick = deleteInstitution
        buttonDelete.tabIndex = 0
        buttonSave.onclick = saveInstitution
        buttonSave.tabIndex = 0
    }
    else {
        buttonDelete.onclick = () => { }
        buttonDelete.tabIndex = -1
        buttonSave.onclick = () => { }
        buttonSave.tabIndex = -1
    }
}

function loadPermissions() {
    toggleEditMode(false)

    stopPermissionsQuery()
    stopPermissionsQuery = allUsers.doc(firebase.auth().currentUser.uid).collection('permissions').doc('institutions').onSnapshot(
        snapshot => {
            toggleEditMode(snapshot.get('edit'))
        },
        error => {
            console.error('Error getting permissions: ' + error)
        }
    )
}

function validateInput(input) {
    if (input.target) {
        input = input.target
    }
    if (input.mask) {
        input.materialComponent.valid = input.mask.isValid()
        if (!input.required && input.mask.unmaskedvalue() == '') {
            input.materialComponent.valid = true
        }
    }
    else {
        input.value = String(input.value).trim()
        if (input.required) {
            input.materialComponent.valid = input.value != ''
        }
        input.materialComponent.valid = input.validity.valid
    }
    return input.materialComponent.valid
}

if (location.search != '') {
    selectInstitutionType.value = location.search.replace('?', '')

    if (location.hash) {
        document.title = location.hash
        const id = location.hash.replace('#', '')

        selectedInstitution = db.collection(selectInstitutionType.value).doc(id)
        selectInstitutionType.disabled = true

        console.time()

        const stopQuery = selectedInstitution.onSnapshot(snapshot => {
            stopQuery()
            console.timeLog()

            buttonDelete.disabled = !snapshot.exists
            buttonSave.disabled = false

            if (snapshot.exists) {
                formInstitution.querySelectorAll('input, textarea').forEach(input => {
                    let itemValue = snapshot.get(input.id)

                    if (itemValue != undefined) {
                        if (input.disabled) {
                            if (itemValue != '') {
                                input.parentElement.parentElement.hidden = false
                            }
                        }
                        else {
                            input.parentElement.parentElement.hidden = false
                        }

                        if (!input.parentElement.parentElement.hidden) {
                            if (input.getAttribute("mask") == "date") {
                                input.materialComponent.value = new Date(itemValue).toLocaleDateString('tr')
                            }
                            else {
                                input.materialComponent.value = itemValue
                            }
                        }
                    }
                })
            }
        })
    }
    else {
        buttonSave.disabled = false
    }
}
