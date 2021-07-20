const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://medicline-35e34.firebaseio.com"
})

const buttonRefresh = document.querySelector('button#refresh')
const buttonRefreshIcon = buttonRefresh.querySelector('.mdi')
const usersList = document.querySelector('#usersList')
var currentUserUID

const dialogDeleteUser = document.querySelector("#dialogDeleteUser")
dialogDeleteUser.materialComponent.listen('MDCDialog:closed', event => {
    if (event.detail.action == "delete") {
        admin.auth().deleteUser(currentUserUID).then(() => {
            document.getElementById(currentUserUID).remove()
        }).catch((error) => {
            console.error("Error deleting user: ", error)
        })
    }
})

buttonRefresh.onclick = () => {
    buttonRefreshIcon.classList.remove('mdi-refresh')
    buttonRefreshIcon.classList.add('mdi-loading', 'mdi-spin')

    usersList.innerHTML = ''
    listUsers()
}

function listUsers() {
    admin.auth().listUsers().then(
        snapshot => {
            snapshot.users.forEach(
                user => {
                    buttonRefreshIcon.classList.add('mdi-refresh')
                    buttonRefreshIcon.classList.remove('mdi-loading', 'mdi-spin')

                    console.log(user.email + ' - ' + user.customClaims.admin)

                    if (user.uid != firebase.auth().currentUser.uid) {
                        let listItem = document.createElement('li')
                        listItem.classList.add('list-group-item', 'flex', 'align-items-center', 'justify-content-between', 'p-2')
                        listItem.id = user.uid
                        usersList.appendChild(listItem)

                        let infoSegment = document.createElement('div')
                        infoSegment.classList.add('flex', 'align-items-center')
                        listItem.appendChild(infoSegment)

                        let avatar = document.createElement('i')
                        avatar.classList.add('avatar', 'me-3', 'mdi', 'mdi-account-circle')
                        infoSegment.appendChild(avatar)

                        let bigtext = document.createElement('b')
                        infoSegment.appendChild(bigtext)

                        if (user.displayName) {
                            let smallText = document.createElement('small')
                            smallText.classList.add('text-muted')
                            infoSegment.appendChild(smallText)

                            bigtext.textContent = user.displayName
                            smallText.textContent = user.email.replace(emailSuffix, '')
                        }
                        else {
                            bigtext.textContent = user.email.replace(emailSuffix, '')
                        }

                        let buttonsSegment = document.createElement('div')
                        buttonsSegment.classList.add('flex', 'align-items-center')
                        listItem.appendChild(buttonsSegment)

                        let editButton = document.createElement('button')
                        editButton.classList.add('mdc-icon-button')
                        buttonsSegment.appendChild(editButton)

                        let editRipple = document.createElement('div')
                        editRipple.classList.add('mdc-icon-button__ripple')
                        editButton.appendChild(editRipple)

                        let editIcon = document.createElement('i')
                        editIcon.classList.add('mdi', 'mdi-pencil')
                        editButton.appendChild(editIcon)

                        let adminButton = document.createElement('button')
                        adminButton.classList.add('mdc-icon-button')
                        buttonsSegment.appendChild(adminButton)

                        let adminRipple = document.createElement('div')
                        adminRipple.classList.add('mdc-icon-button__ripple')
                        adminButton.appendChild(adminRipple)

                        let adminIcon = document.createElement('i')
                        adminIcon.classList.add('mdi')
                        if (user.customClaims.admin) {
                            adminButton.classList.add('mdc-button--outlined', 'mdc-button--green')
                            adminIcon.classList.add('mdi-shield-star')
                        }
                        else {
                            adminIcon.classList.add('mdi-shield-off-outline')
                        }
                        adminButton.onclick = () => {
                            adminButton.classList.remove('mdc-button--outlined', 'mdc-button--green')
                            adminIcon.classList.remove('mdi-shield-star', 'mdi-shield-off-outline', 'mdc-button--outlined', 'mdc-button--green')
                            adminIcon.classList.add('mdi-loading', 'mdi-spin')

                            admin.auth().getUser(user.uid).then(userSnapshot => {
                                admin.auth().setCustomUserClaims(userSnapshot.uid, { admin: !userSnapshot.customClaims.admin }).then(() => {
                                    adminIcon.classList.remove('mdi-loading', 'mdi-spin')
                                    if (userSnapshot.customClaims.admin) {
                                        adminIcon.classList.add('mdi-shield-off-outline')
                                    }
                                    else {
                                        adminButton.classList.add('mdc-button--outlined', 'mdc-button--green')
                                        adminIcon.classList.add('mdi-shield-star')
                                    }
                                }).catch((error) => {
                                    console.error("Error setting custom user claims: ", error)
                                })
                            }).catch((error) => {
                                console.error("Error getting user data: ", error)
                            })
                        }
                        adminButton.appendChild(adminIcon)

                        let deleteButton = document.createElement('button')
                        deleteButton.classList.add('mdc-icon-button', 'mdc-button--outlined', 'mdc-button--red')
                        buttonsSegment.appendChild(deleteButton)

                        deleteButton.onclick = () => {
                            currentUserUID = user.uid
                            dialogDeleteUser.materialComponent.open()
                        }

                        let deleteRipple = document.createElement('div')
                        deleteRipple.classList.add('mdc-icon-button__ripple')
                        deleteButton.appendChild(deleteRipple)

                        let deleteIcon = document.createElement('i')
                        deleteIcon.classList.add('mdi', 'mdi-trash-can')
                        deleteButton.appendChild(deleteIcon)

                        listItem.querySelectorAll('.mdc-icon-button').forEach(rippleElement => {
                            rippleElement.materialRipple = new MDCRipple(rippleElement)
                            rippleElement.materialRipple.unbounded = true
                        })
                    }
                }
            )

        }
    )
}

listUsers()

// admin.auth().getUser(firebase.auth().currentUser.uid).then(snapshot => console.log(snapshot.customClaims))